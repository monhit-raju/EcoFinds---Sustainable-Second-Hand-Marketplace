import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api, setToken } from '../api'

export default function Product(){
  const { id } = useParams();
  const [p, setP] = useState(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  
  useEffect(()=>{ 
    api.get(`/products/${id}`).then(r=>setP(r.data)); 
  }, [id]);

  const addToCart = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to add items to cart');
      return;
    }

    setIsAddingToCart(true);
    try {
      setToken(token);
      await api.post('/cart', { 
        productId: parseInt(id), 
        quantity: 1 
      });
      alert('✅ Added to cart successfully!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add to cart: ' + (error.response?.data?.error || error.message));
    } finally {
      setIsAddingToCart(false);
    }
  }

  if(!p) return <div className="text-center py-8">Loading...</div>
  
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="h-80 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
        {p.image_url ? (
          <img 
            src={`http://localhost:4000${p.image_url}`} 
            alt={p.title} 
            className="max-h-72 max-w-full object-cover"
          />
        ) : (
          <div className="text-gray-400 text-lg">No Image Available</div>
        )}
      </div>
      
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{p.title}</h1>
        <div className="text-2xl font-bold text-green-600 mb-4">₹ {p.price}</div>
        
        {p.category && (
          <div className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
            {p.category}
          </div>
        )}
        
        {p.description && (
          <p className="text-gray-600 mb-6 leading-relaxed">{p.description}</p>
        )}
        
        <button 
          onClick={addToCart}
          disabled={isAddingToCart}
          className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 focus:ring-4 focus:ring-green-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAddingToCart ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Adding to Cart...
            </div>
          ) : (
            '🛒 Add to Cart'
          )}
        </button>
      </div>
    </div>
  )
}
