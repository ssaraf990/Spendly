import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8000/api'
});

// This runs before every request — attaches token if it exists
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getExpenses = () => API.get('/expenses');
export const addExpense = (data) => API.post('/expenses', data);
export const deleteExpense = (id) => API.delete(`/expenses/${id}`);
export const getAnalytics = () => API.get('/expenses/analytics');
export const updateExpense = (id, data) => API.put(`/expenses/${id}`, data);