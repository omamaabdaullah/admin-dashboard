
// src/routes/ProtectedRoute.jsx
import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { startTokenRefresh, stopTokenRefresh } from '../utils/tokenRefresher';
import axiosInstance from '../utils/axiosInstance';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const token = localStorage.getItem('token');
  const role  = localStorage.getItem('role');
  const [status, setStatus] = useState(token ? 'checking' : 'invalid');

  useEffect(() => {
    if (!token) return;

    axiosInstance.get('/auth/profile/show')
      .then(() => {
        startTokenRefresh();
        setStatus('valid');
      })
      .catch(() => {
        stopTokenRefresh();
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('role');
        setStatus('invalid');
      });

  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (status === 'checking') return null;
  if (status === 'invalid')  return <Navigate to="/login" replace />;

  // تحقق من الـ role إذا كان مطلوباً
  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;