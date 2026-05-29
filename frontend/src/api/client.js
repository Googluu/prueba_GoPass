import axios from 'axios';
import { supabase } from '../lib/supabase';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Inject Supabase session token on every request
client.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

client.interceptors.response.use(
  (res) => res.data,
  (err) => Promise.reject(err.response?.data ?? err)
);

export default client;
