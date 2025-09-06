import React, { useState } from 'react'
import { api, setToken } from '../api'
import { useNavigate } from 'react-router-dom'

export default function Signup(){
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const nav = useNavigate();

  const submit = async () => {
    try {
      const res = await api.post('/auth/signup', { email, password, username });
      setToken(res.data.token);
      localStorage.setItem('eco_user', JSON.stringify(res.data.user));
      localStorage.setItem('eco_token', res.data.token);
      nav('/');
    } catch (e) {
      alert('Signup failed: ' + (e.response?.data?.error || e.message));
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl">Sign Up</h2>
      <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="w-full p-2 border rounded my-2" />
      <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="Username" className="w-full p-2 border rounded my-2" />
      <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" className="w-full p-2 border rounded my-2" />
      <button onClick={submit} className="w-full p-2 bg-green-600 text-white rounded">Sign Up</button>
      <p className="text-center mt-4">
        Already have an account? <a href="/login" className="text-blue-600">Login</a>
      </p>
    </div>
  )
}
