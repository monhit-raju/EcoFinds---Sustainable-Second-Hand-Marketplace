import React, { useEffect, useState } from 'react'
import { api, setToken } from '../api'
import { useNavigate } from 'react-router-dom'

export default function Profile() {
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    
    if (!token) {
      navigate('/login')
      return
    }
    
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error('Error parsing stored user:', error)
        navigate('/login')
      }
    } else {
      // Fallback to API call
      const fetchUser = async () => {
        try {
          setToken(token)
          const res = await api.get('/auth/me')
          setUser(res.data)
        } catch (error) {
          console.error('Failed to fetch user:', error)
          navigate('/login')
        }
      }
      fetchUser()
    }
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null) // Clear api token
    navigate('/login')
  }

  if (!user) return <div>Loading profile...</div>

  return (
    <div className="max-w-4xl mx-auto p-4 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Username:</strong> {user.username || 'N/A'}</p>
      <button
        onClick={handleLogout}
        className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
      >
        Logout
      </button>
    </div>
  )
}
