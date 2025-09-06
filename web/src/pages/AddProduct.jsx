import React from 'react'
import AddProductForm from '../components/AddProductForm'
import { useNavigate } from 'react-router-dom'

export default function AddProduct(){
  const nav = useNavigate();
  
  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Add New Product</h2>
        <p className="text-gray-600">Share your eco-friendly products with the community</p>
      </div>
      <AddProductForm onAdded={() => nav('/')} />
    </div>
  )
}
