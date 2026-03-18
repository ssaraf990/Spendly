import axios from 'axios';

const API = axios.create({
  baseURL: 'https://spendly-beyg.onrender.com/api'
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getAIAdvice = () => API.post('/ai/advice');