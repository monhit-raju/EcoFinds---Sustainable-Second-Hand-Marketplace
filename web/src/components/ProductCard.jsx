import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { api, setToken } from '../api'

export default function ProductCard({ p }) {
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const addToCart = async (e) => {
    e.preventDefault(); // Prevent navigation when clicking add to cart
    
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to add items to cart');
      return;
    }

    setIsAddingToCart(true);
    try {
      setToken(token);
      await api.post('/cart', { 
        productId: p.id, 
        quantity: 1 
      });
      alert('✅ Added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add to cart');
    } finally {
      setIsAddingToCart(false);
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden group">
      <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative overflow-hidden">
        {p.image_url ? (
          <img
            src={`http://localhost:4000${p.image_url}`}
            alt={p.title}
            className="max-h-44 max-w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="text-gray-400 text-sm">No Image</div>
        )}
        <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
          Eco
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-800 mb-1 line-clamp-2">{p.title}</h3>
        <div className="text-sm text-green-600 font-medium mb-2">{p.category}</div>
        <div className="text-xl font-bold text-gray-900 mb-3">₹ {p.price}</div>
        
        <div className="flex gap-2">
          <Link
            to={`/product/${p.id}`}
            className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm font-medium text-center"
          >
            View Details
          </Link>
          <button
            onClick={addToCart}
            disabled={isAddingToCart}
            className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm font-medium disabled:opacity-50"
          >
            {isAddingToCart ? '...' : '🛒 Add'}
          </button>
        </div>
      </div>
    </div>
  )
}
