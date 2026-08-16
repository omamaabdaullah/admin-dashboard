
// src/models/authModel.js
import axios from 'axios';
import axiosInstance from '../utils/axiosInstance';

const API_URL = 'http://127.0.0.1:8000/api';

// Login — يستخدم axios العادي لأنه لا يوجد token بعد
export const loginAdmin = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, { email, password });
    return response.data.data;
  } catch (error) {
    const message = error.response?.data?.message || 'فشل تسجيل الدخول، تحقق من البريد وكلمة المرور';
    throw new Error(message, { cause: error });
  }
};

// Logout
export const logoutAdmin = async () => {
  try {
    await axiosInstance.post('/auth/logout');
  } catch (error) {
    console.error('Logout Error:', error);
  }
};

// Register Employee
export const registerEmployee = async (name, email, password, passwordConfirmation) => {
  try {
    const response = await axiosInstance.post(
      '/admin/register-employee',
      { name, email, password, password_confirmation: passwordConfirmation }
    );
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'فشل إنشاء حساب الموظف';
    throw new Error(message, { cause: error });
  }
};

// Show Profile
export const showProfile = async () => {
  try {
    const response = await axiosInstance.get('/auth/profile/show');
    return response.data.data;
  } catch (error) {
    const message = error.response?.data?.message || 'فشل تحميل بيانات الملف الشخصي';
    throw new Error(message, { cause: error });
  }
};

// Update Profile
export const updateProfile = async (formData) => {
  try {
    const response = await axiosInstance.post(
      '/auth/profile/update',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data.data;
  } catch (error) {
    const message = error.response?.data?.message || 'فشل تحديث الملف الشخصي';
    throw new Error(message, { cause: error });
  }
};

// Forgot Password — يستخدم axios العادي لأنه لا يوجد token
export const forgotPassword = async (email) => {
  try {
    const response = await axios.post(`${API_URL}/auth/forgot-password`, { email });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'حدث خطأ، تحقق من البريد الإلكتروني';
    throw new Error(message, { cause: error });
  }
};

// Reset Password — يستخدم axios العادي لأنه لا يوجد token
export const resetPassword = async (email, code, password, passwordConfirmation) => {
  try {
    const response = await axios.post(`${API_URL}/auth/reset-password`, {
      email, code, password, password_confirmation: passwordConfirmation,
    });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'فشل تعيين كلمة المرور، تحقق من الرمز المدخل';
    throw new Error(message, { cause: error });
  }
};