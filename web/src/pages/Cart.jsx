import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, setToken } from '../api'

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCart = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setToken(token);
      const res = await api.get('/cart');
      setCartItems(res.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  }

  const removeFromCart = async (itemId) => {
    try {
      await api.delete(`/cart/${itemId}`);
      setCartItems(cartItems.filter(item => item.id !== itemId));
      alert('Item removed from cart');
    } catch (error) {
      console.error('Error removing item:', error);
      alert('Failed to remove item');
    }
  }

  const total = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  useEffect(() => {
    fetchCart();
  }, []);

  if (loading) return <div className="text-center py-8">Loading cart...</div>;

  if (!localStorage.getItem('token')) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Please Login</h2>
        <p className="text-gray-600">You need to login to view your cart</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Shopping Cart</h1>
      
      {cartItems.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl text-gray-600 mb-4">Your cart is empty</h2>
          <p className="text-gray-500">Add some eco-friendly products to get started!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {cartItems.map(item => (
            <div key={item.id} className="bg-white p-4 rounded-lg shadow-md flex items-center gap-4">
              <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                {item.product.image_url ? (
                  <img 
                    src={`http://localhost:4000${item.product.image_url}`} 
                    alt={item.product.title}
                    className="max-w-full max-h-full object-cover rounded"
                  />
                ) : (
                  <span className="text-gray-400 text-xs">No Image</span>
                )}
              </div>
              
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{item.product.title}</h3>
                <p className="text-gray-600">{item.product.category}</p>
                <p className="text-green-600 font-bold">₹ {item.product.price}</p>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-600">Quantity</p>
                <p className="font-semibold">{item.quantity}</p>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-600">Total</p>
                <p className="font-bold text-lg">₹ {item.product.price * item.quantity}</p>
              </div>
              
              <button
                onClick={() => removeFromCart(item.id)}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                Remove
              </button>
            </div>
          ))}
          
          <div className="bg-green-50 p-6 rounded-lg">
            <div className="flex justify-between items-center text-xl font-bold">
              <span>Total: ₹ {total.toFixed(2)}</span>
              <button 
                onClick={() => navigate('/payment')}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
