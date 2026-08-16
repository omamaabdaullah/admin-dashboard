// src/utils/axiosInstance.js
import axios from 'axios';
import { stopTokenRefresh } from './tokenRefresher';

const axiosInstance = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  headers: { Accept: 'application/json' },
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