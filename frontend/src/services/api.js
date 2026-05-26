import axios from 'axios';

// In dev the Vite proxy forwards /api → localhost:5000, so the relative path works.
// In production on Vercel, set VITE_API_URL=https://your-app.up.railway.app/api
const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
});

// Attach token to every request
API.interceptors.request.use((req) => {
    const token = localStorage.getItem('token');
    if (token) req.headers.Authorization = `Bearer ${token}`;
    return req;
});

// Auto-logout on 401 (expired / invalid token)
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
