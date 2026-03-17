import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8000/api'
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getBudgets = () => API.get('/budgets');
export const setBudget = (data) => API.post('/budgets', data);
export const deleteBudget = (id) => API.delete(`/budgets/${id}`);