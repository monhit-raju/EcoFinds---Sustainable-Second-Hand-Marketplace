import React, { useState } from 'react'
import { api, setToken } from '../api'

export default function AddProductForm({ onAdded }){
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const uploadImage = async () => {
    if (!file) return null;
    const fd = new FormData();
    fd.append('image', file);
    const res = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    return res.data.url;
  }

  const submit = async () => {
    const token = localStorage.getItem('token'); // Changed from 'eco_token'
    if (!token) {
      alert('Please login to add products');
      return;
    }
    
    if (!title || !price) {
      alert('Please fill in title and price');
      return;
    }

    setIsSubmitting(true);
    try {
      setToken(token); // Set token in API headers
      const image_url = await uploadImage();
      await api.post('/products', { title, price, category, description, image_url });
      
      // Success popup
      alert('🎉 Product added successfully!');
      
      // Clear form
      setTitle('');
      setPrice('');
      setCategory('');
      setDescription('');
      setFile(null);
      
      onAdded && onAdded();
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Failed to add product: ' + (error.response?.data?.error || error.message));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <div className="space-y-4">
        <input 
          value={title} 
          onChange={e=>setTitle(e.target.value)} 
          placeholder="Product Title" 
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none" 
        />
        <input 
          value={price} 
          onChange={e=>setPrice(e.target.value)} 
          placeholder="Price (₹)" 
          type="number"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none" 
        />
        <select 
          value={category} 
          onChange={e=>setCategory(e.target.value)} 
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
        >
          <option value="">Select Category</option>
          <option value="Electronics">Electronics</option>
          <option value="Clothing">Clothing</option>
          <option value="Home">Home</option>
          <option value="Books">Books</option>
          <option value="Sports">Sports</option>
        </select>
        <textarea 
          value={description} 
          onChange={e=>setDescription(e.target.value)} 
          placeholder="Product Description" 
          rows="3"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none" 
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
          <input 
            type="file" 
            onChange={e=>setFile(e.target.files[0])} 
            accept="image/*"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none" 
          />
        </div>
        <button 
          onClick={submit} 
          disabled={isSubmitting || !title || !price}
          className="w-full p-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-semibold hover:from-green-700 hover:to-green-800 focus:ring-4 focus:ring-green-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Adding Product...
            </div>
          ) : (
            'Add Product'
          )}
        </button>
      </div>
    </div>
  )
}
