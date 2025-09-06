const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

require('dotenv').config();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

const app = express();
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'], // Add your frontend URLs
  credentials: true
}));
app.use(bodyParser.json());

// serve uploaded images
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
app.use('/uploads', express.static(uploadsDir));

const upload = multer({ dest: uploadsDir });

// helper
function generateToken(user) {
  return jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
}

async function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'No token' });
  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.userId;
    next();
  } catch (e) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Signup
app.post('/api/auth/signup', async (req, res) => {
  const { email, password, username } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return res.status(400).json({ error: 'Email already used' });
  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { email, password: hash, username } });
  const ok = await bcrypt.compare(password, user.password);
  const token = generateToken(user);
  res.json({ user: { id: user.id, email: user.email, username: user.username }, token });
});

// Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(400).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(400).json({ error: 'Invalid credentials' });
  const token = generateToken(user);
  res.json({ user: { id: user.id, email: user.email, username: user.username }, token });
});

// Get current user
app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, email: true, username: true }
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Upload image
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' });
  const url = `/uploads/${req.file.filename}`;
  res.json({ url });
});

// Create Product
app.post('/api/products', authMiddleware, async (req, res) => {
  const { title, description, category, price, image_url } = req.body;
  if (!title || !price) return res.status(400).json({ error: 'Title and price required' });
  
  try {
    const product = await prisma.product.create({
      data: {
        ownerId: req.userId, // Fixed: use req.userId instead of req.user.id
        title,
        description,
        category,
        price: parseFloat(price),
        image_url
      }
    });
    res.json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// List products (search + category)
app.get('/api/products', async (req, res) => {
  const { q, category } = req.query;
  const where = {};
  
  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
      { category: { contains: q, mode: 'insensitive' } }
    ];
  }
  
  if (category) {
    where.category = { equals: category, mode: 'insensitive' };
  }
  
  try {
    const products = await prisma.product.findMany({ 
      where, 
      orderBy: { createdAt: 'desc' } 
    });
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Product detail
app.get('/api/products/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return res.status(404).json({ error: 'Not found' });
  res.json(product);
});

// My listings
app.get('/api/my/products', authMiddleware, async (req, res) => {
  const products = await prisma.product.findMany({ where: { ownerId: req.userId }, orderBy: { id: 'desc' } });
  res.json(products);
});

// Update product
app.put('/api/products/:id', authMiddleware, async (req, res) => {
  const id = parseInt(req.params.id);
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product || product.ownerId !== req.userId) return res.status(403).json({ error: 'Forbidden' });
  const { title, description, category, price, image_url } = req.body;
  const updated = await prisma.product.update({ where: { id }, data: { title, description, category, price: Number(price || product.price), image_url } });
  res.json(updated);
});

// Delete product
app.delete('/api/products/:id', authMiddleware, async (req, res) => {
  const id = parseInt(req.params.id);
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product || product.ownerId !== req.userId) return res.status(403).json({ error: 'Forbidden' });
  await prisma.product.delete({ where: { id } });
  res.json({ success: true });
});

// Cart endpoints (minimal)
app.get('/api/cart', authMiddleware, async (req, res) => {
  const items = await prisma.cartItem.findMany({ where: { userId: req.userId }, include: { product: true } });
  res.json(items);
});

app.post('/api/cart', authMiddleware, async (req, res) => {
  const { productId, quantity } = req.body;
  const item = await prisma.cartItem.create({ data: { userId: req.userId, productId: productId, quantity: Number(quantity || 1) } });
  res.json(item);
});

app.delete('/api/cart/:id', authMiddleware, async (req, res) => {
  const id = parseInt(req.params.id);
  await prisma.cartItem.delete({ where: { id } });
  res.json({ success: true });
});

// Orders (enhanced with payment details)
app.post('/api/orders', authMiddleware, async (req, res) => {
  const { paymentMethod, paymentDetails, total } = req.body;
  
  try {
    const cartItems = await prisma.cartItem.findMany({ 
      where: { userId: req.userId }, 
      include: { product: true } 
    });
    
    if (cartItems.length === 0) return res.status(400).json({ error: 'Cart empty' });
    
    const calculatedTotal = cartItems.reduce((s, it) => s + it.product.price * it.quantity, 0);
    const tax = calculatedTotal * 0.18;
    const finalTotal = calculatedTotal + tax;
    
    const order = await prisma.order.create({ 
      data: { 
        userId: req.userId, 
        total: finalTotal,
        paymentMethod: paymentMethod || 'cod',
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'completed',
        deliveryAddress: paymentDetails?.address || '',
        city: paymentDetails?.city || '',
        pincode: paymentDetails?.pincode || '',
        items: { 
          create: cartItems.map(it => ({ 
            productId: it.productId, 
            price: it.product.price, 
            quantity: it.quantity 
          })) 
        } 
      },
      include: { items: true }
    });
    
    // Clear cart after successful order
    await prisma.cartItem.deleteMany({ where: { userId: req.userId } });
    
    res.json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Get user orders
app.get('/api/orders', authMiddleware, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({ 
      where: { userId: req.userId }, 
      include: { 
        items: { 
          include: { product: true } 
        } 
      }, 
      orderBy: { id: 'desc' } 
    });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

app.get('/', (req, res) => {
  res.json({ 
    message: 'EcoFinds API Server', 
    endpoints: [
      'GET /api/products',
      'POST /api/auth/signup', 
      'POST /api/auth/login',
      'POST /api/products',
      'GET /api/cart',
      'POST /api/orders'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
