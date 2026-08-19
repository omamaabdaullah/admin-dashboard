


// src/controllers/useAuth.js
import { useState, useCallback } from 'react';
import {
  loginAdmin,
  logoutAdmin,
  registerEmployee,
  showProfile,
  updateProfile,
  changePassword,
} from '../models/authModel';
import { startTokenRefresh, stopTokenRefresh } from '../utils/tokenRefresher';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  // Login
  const handleLogin = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await loginAdmin(email, password);
      if (data.role !== 'admin' && data.role !== 'employee') {
        throw new Error('هذا الحساب غير مصرح له بدخول لوحة التحكم');
      }
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user',  JSON.stringify(data.user));
      localStorage.setItem('role',  data.role ?? 'employee');
      startTokenRefresh();
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout — يبلغ الـ API أولاً ثم يمسح محلياً
  const handleLogout = async () => {
    try {
      await logoutAdmin();
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      stopTokenRefresh();
      window.location.href = '/login';
    }
  };

  // Register Employee
  const handleRegisterEmployee = async (name, email, password, passwordConfirmation) => {
    setLoading(true);
    setError(null);
    try {
      const data = await registerEmployee(name, email, password, passwordConfirmation);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Show Profile
  const handleShowProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await showProfile();
      localStorage.setItem('user', JSON.stringify(data));
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update Profile
  const handleUpdateProfile = async (fields) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      Object.entries(fields).forEach(([key, value]) => {
        if (value !== undefined && value !== null) formData.append(key, value);
      });
      const data = await updateProfile(formData);
      localStorage.setItem('user', JSON.stringify(data));
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (currentPassword, newPassword, confirmation) => {
    setError(null);
    try {
      return await changePassword(currentPassword, newPassword, confirmation);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    loading,
    error,
    handleLogin,
    handleLogout,
    handleRegisterEmployee,
    handleShowProfile,
    handleUpdateProfile,
    handleChangePassword,
  };
};