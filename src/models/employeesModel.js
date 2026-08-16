// src/models/employeesModel.js
import axiosInstance from '../utils/axiosInstance';

export const fetchEmployees = async ({ page = 1, perPage = 10, search = '' } = {}) => {
  const params = new URLSearchParams();
  params.append('role',     'employee');
  params.append('page',     page);
  params.append('per_page', perPage);
  if (search) params.append('search', search);

  const res     = await axiosInstance.get(`/users?${params.toString()}`);
  const payload = res.data;
  return {
    data: payload.data ?? [],
    meta: payload.meta ?? null,
  };
};

export const createEmployee = async (name, email, password, passwordConfirmation) => {
  const res = await axiosInstance.post(
    '/admin/register-employee',
    { name, email, password, password_confirmation: passwordConfirmation }
  );
  return res.data.data;
};

export const deleteEmployee = async (id) => {
  await axiosInstance.delete(`/users/${id}`);
};