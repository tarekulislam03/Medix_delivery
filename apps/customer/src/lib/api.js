import axios from 'axios';

// Using relative '/api' allows both:
// 1. Vite dev server (port 5173) to proxy /api -> backend 5000 automatically
// 2. Nginx (port 80) to reverse proxy /api -> backend 5000 automatically
// Works on both localhost and any mobile device on local Wi-Fi without CORS issues!
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export default api;
