import axios from 'axios';

// Dev: Vite proxy forwards /api → localhost:5000
// Prod (Vercel): set VITE_API_URL=https://your-app.up.railway.app/api
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

// Attach JWT token to every request
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

// Auto-redirect to /login on 401
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('ajo_user');
      localStorage.removeItem('token');
      window.location.replace('/login');
    }
    return Promise.reject(err);
  }
);

export default API;
