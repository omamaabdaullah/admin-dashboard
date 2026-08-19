// src/utils/axiosInstance.js
import axios from 'axios';
import { stopTokenRefresh } from './tokenRefresher';


axios.defaults.headers.common['ngrok-skip-browser-warning'] = 'true';


const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
 headers: {
  Accept: 'application/json',
  'ngrok-skip-browser-warning': 'true',
},
});

// قبل كل طلب — أضف الـ token تلقائياً
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// بعد كل رد — إذا رجع 401 اطرد المستخدم فوراً
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      stopTokenRefresh();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;