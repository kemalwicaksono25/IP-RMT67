import axios from 'axios';
import { getTokenFromStorage } from '../utils/authHelper';
import { store } from '../store';

const api = axios.create({
  baseURL: 'https://planner.kemalwicaksono.com',
});

// Helper untuk mendapatkan token dari Redux state atau localStorage
const getToken = () => {
  try {
    // Coba ambil dari Redux state terlebih dahulu
    const state = store.getState();
    if (state?.auth?.token && typeof state.auth.token === 'string' && state.auth.token.trim() !== '') {
      return state.auth.token.trim();
    }
    
    // Fallback ke localStorage
    return getTokenFromStorage();
  } catch (error) {
    // Jika error, coba dari localStorage
    return getTokenFromStorage();
  }
};

// Request interceptor untuk menambahkan token
api.interceptors.request.use(
  (config) => {
    // Jangan tambahkan token untuk endpoint auth (login/register)
    const isAuthEndpoint = config.url?.includes('/auth/login') || 
                          config.url?.includes('/auth/register');
    
    if (isAuthEndpoint) {
      return config;
    }

    // Gunakan helper function untuk mendapatkan token
    const token = getToken();
    
    if (token && typeof token === 'string' && token.trim() !== '') {
      // Pastikan header Authorization belum ada atau overwrite dengan token terbaru
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token.trim()}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor untuk menangani error
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Jangan redirect jika request ke endpoint auth (login/register)
      // karena 401 di endpoint tersebut adalah error yang valid
      const isAuthEndpoint = error.config?.url?.includes('/auth/login') || 
                            error.config?.url?.includes('/auth/register');
      
      if (!isAuthEndpoint) {
        // Unauthorized - hapus auth dan redirect ke login
        localStorage.removeItem('persist:auth-storage');
        localStorage.removeItem('auth-storage'); // Bersihkan storage lama jika ada
        // Hanya redirect jika tidak sedang di halaman login
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    // Network errors are handled by error handler
    return Promise.reject(error);
  }
);

export default api;

