// src/models/authModel.js
import axios from 'axios';
import axiosInstance from '../utils/axiosInstance';

const API_URL = import.meta.env.VITE_API_URL;

// Login
export const loginAdmin = async (email, password) => {
  try {
    const response = await axios.post(
      `${API_URL}/auth/login`,
      { email, password },
      { headers: { 'ngrok-skip-browser-warning': 'true' } }
    );

    const payload = response.data?.data;
    // يدعم الشكل العادي والشكل المغلّف مرتين
    const data = payload?.access_token ? payload : payload?.data;

    if (!data?.access_token) {
      throw new Error(
        response.data?.message || 'فشل تسجيل الدخول، تحقق من البريد وكلمة المرور'
      );
    }

    return data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      'فشل تسجيل الدخول، تحقق من البريد وكلمة المرور';
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

// Forgot Password
export const forgotPassword = async (email) => {
  try {
    const response = await axios.post(
      `${API_URL}/auth/forgot-password`,
      { email },
      { headers: { 'ngrok-skip-browser-warning': 'true' } }
    );
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'حدث خطأ، تحقق من البريد الإلكتروني';
    throw new Error(message, { cause: error });
  }
};

// Reset Password
export const resetPassword = async (email, code, password, passwordConfirmation) => {
  try {
    const response = await axios.post(
      `${API_URL}/auth/reset-password`,
      { email, code, password, password_confirmation: passwordConfirmation },
      { headers: { 'ngrok-skip-browser-warning': 'true' } }
    );
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message || 'فشل تعيين كلمة المرور، تحقق من الرمز المدخل';
    throw new Error(message, { cause: error });
  }
};

const CHANGE_PASSWORD_ERRORS = {
  'The current password is incorrect.': 'كلمة المرور الحالية غير صحيحة',
  'The new password must be different from the current password.':
    'كلمة المرور الجديدة يجب أن تختلف عن الحالية',
};

export const changePassword = async (currentPassword, newPassword, confirmation) => {
  try {
    const response = await axiosInstance.post('/auth/change-password', {
      password: currentPassword,
      newPassword,
      newPassword_confirmation: confirmation,
    });
    return response.data;
  } catch (error) {
    const data = error.response?.data ?? {};
    const fieldErr =
      data.errors?.newPassword?.[0] ||
      data.errors?.password?.[0] ||
      data.errors?.newPassword_confirmation?.[0];

    if (CHANGE_PASSWORD_ERRORS[data.message]) {
      throw new Error(CHANGE_PASSWORD_ERRORS[data.message], { cause: error });
    }
    if (fieldErr && /confirm/i.test(fieldErr)) {
      throw new Error('كلمتا المرور غير متطابقتين', { cause: error });
    }
    if (fieldErr && /min/i.test(fieldErr)) {
      throw new Error('كلمة المرور الجديدة يجب ألا تقل عن 8 أحرف', { cause: error });
    }
    throw new Error(
      fieldErr || data.message || 'فشل تغيير كلمة المرور',
      { cause: error }
    );
  }
};
