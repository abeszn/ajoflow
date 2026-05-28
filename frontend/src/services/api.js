import axios from 'axios';
import { supabase } from '../lib/supabase';

// Dev: Vite proxy forwards /api → localhost:5000
// Prod (Vercel): set VITE_API_URL=https://your-app.up.railway.app/api
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

// Attach the current Supabase access_token to every request
API.interceptors.request.use(async (req) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    req.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return req;
});

// Auto-redirect to /login on 401
API.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      await supabase.auth.signOut();
      window.location.replace('/login');
    }
    return Promise.reject(err);
  }
);

export default API;
