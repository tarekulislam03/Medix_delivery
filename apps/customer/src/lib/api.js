import axios from 'axios';

// Using relative '/api' allows both:
// 1. Vite dev server (port 5173) to proxy /api -> backend 5000 automatically
// 2. Nginx (port 80) to reverse proxy /api -> backend 5000 automatically
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Interceptor to attach JWT token for Customer, Pharmacy, or Rider if available
api.interceptors.request.use(
  (config) => {
    const customerToken = localStorage.getItem('medix_customer_token');
    const pharmaToken = localStorage.getItem('medix_pharmacy_token');
    const riderToken = localStorage.getItem('medix_rider_token');
    const token = customerToken || pharmaToken || riderToken;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
