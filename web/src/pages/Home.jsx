import React, { useEffect, useState } from 'react'
import { api } from '../api'
import ProductCard from '../components/ProductCard'

export default function Home(){
  const [products, setProducts] = useState([]);
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/products', { params: { q, category } });
      setProducts(res.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }

  // Auto-search when query or category changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchProducts();
    }, 300); // Debounce search by 300ms

    return () => clearTimeout(timeoutId);
  }, [q, category]);

  // Initial load
  useEffect(() => { 
    fetchProducts(); 
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Discover Eco-Friendly Products</h1>
        <p className="text-gray-600 text-lg">Find sustainable alternatives for your everyday needs</p>
      </div>

      {/* Search Form */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Search for eco-friendly products..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-200"
            />
          </div>
          <div className="md:w-48">
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-200"
            >
              <option value="">All Categories</option>
              <option value="Electronics">Electronics</option>
              <option value="Clothing">Clothing</option>
              <option value="Home">Home</option>
              <option value="Books">Books</option>
              <option value="Sports">Sports</option>
            </select>
          </div>
          <button
            onClick={fetchProducts}
            disabled={loading}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-green-400 transition-colors duration-200 font-medium shadow-md hover:shadow-lg"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <p className="mt-2 text-gray-600">Loading products...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(p => <ProductCard key={p.id} p={p} />)}
        </div>
      )}

      {products.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🌱</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No products found</h3>
          <p className="text-gray-500">
            {q || category ? 
              `No products match "${q}" ${category ? `in ${category}` : ''}` : 
              'Try adjusting your search criteria or add some eco-friendly products!'
            }
          </p>
        </div>
      )}
    </div>
  )
}
