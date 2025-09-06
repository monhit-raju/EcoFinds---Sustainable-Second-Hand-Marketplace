import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { setToken } from '../api'

export default function Header() {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const isLoggedIn = !!token

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    navigate('/login')
  }

  return (
    <header className="bg-gradient-to-r from-green-600 to-blue-600 shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <span className="text-green-600 font-bold text-xl">E</span>
            </div>
            <span className="text-white font-bold text-2xl">EcoFinds</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-white hover:text-green-200 transition-colors duration-200 font-medium">
              Home
            </Link>
            {isLoggedIn && (
              <>
                <Link to="/cart" className="text-white hover:text-green-200 transition-colors duration-200 font-medium">
                  🛒 Cart
                </Link>
                <Link to="/add" className="bg-white text-green-600 px-4 py-2 rounded-full hover:bg-green-50 transition-colors duration-200 font-medium shadow-md">
                  + Add Product
                </Link>
              </>
            )}
            {isLoggedIn ? (
              <>
                <Link to="/profile" className="text-white hover:text-green-200 transition-colors duration-200 font-medium">
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-white hover:text-green-200 transition-colors duration-200 font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/signup" className="text-white hover:text-green-200 transition-colors duration-200 font-medium">
                  Sign Up
                </Link>
                <Link to="/login" className="text-white hover:text-green-200 transition-colors duration-200 font-medium">
                  Login
                </Link>
              </>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="text-white hover:text-green-200">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
