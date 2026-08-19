

// src/utils/tokenRefresher.js
// نستخدم axios العادي هنا لتجنب circular import مع axiosInstance
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;
const REFRESH_INTERVAL = 5 * 60 * 1000;

let refreshTimer = null;

const refreshToken = async () => {
  const token = localStorage.getItem('token');

  if (!token) {
    stopTokenRefresh();
    return;
  }

  try {
  const response = await axios.post(
  `${API_URL}/auth/refresh`,
  {},
  {
    headers: {
      Authorization: `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true',
    },
  }
);

    const newToken = response.data.data.access_token;
    localStorage.setItem('token', newToken);
    console.log('✅ Token refreshed successfully');
  } catch (error) {
    console.error('❌ Token refresh failed:', error);

    if (error.response?.status === 401) {
      stopTokenRefresh();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  }
};

export const startTokenRefresh = () => {
  stopTokenRefresh();
  refreshTimer = setInterval(refreshToken, REFRESH_INTERVAL);
  console.log('🔄 Token auto-refresh started (every 55 minutes)');
};

export const stopTokenRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
    console.log('🛑 Token auto-refresh stopped');
  }
};