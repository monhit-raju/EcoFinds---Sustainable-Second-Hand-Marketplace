import React, { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Header from './components/Header'
import { setToken } from './api'

export default function App() {
  useEffect(() => {
    // Initialize token from localStorage on app load
    const token = localStorage.getItem('token')
    if (token) {
      setToken(token)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}