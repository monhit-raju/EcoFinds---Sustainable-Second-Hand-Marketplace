import axios from 'axios';
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';
const api = axios.create({ baseURL: API_BASE });

const setToken = (token) => {
  if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  else delete api.defaults.headers.common['Authorization'];
}

export { api, setToken };