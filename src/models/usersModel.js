// src/models/usersModel.js
import axiosInstance from '../utils/axiosInstance';

export const fetchClients = async ({ page = 1, perPage = 10, search = '', status = 'all' } = {}) => {
  const params = new URLSearchParams();
  params.append('role',     'client');
  params.append('page',     page);
  params.append('per_page', perPage);
  if (search)           params.append('search', search);
  if (status !== 'all') params.append('status', status);

  const res     = await axiosInstance.get(`/users?${params.toString()}`);
  const payload = res.data;
  return {
    data: payload.data ?? [],
    meta: payload.meta ?? null,
  };
};

export const banUser = async (id) => {
  const res = await axiosInstance.patch(`/users/ban/${id}`);
  return res.data.data;
};

export const unbanUser = async (id) => {
  const res = await axiosInstance.patch(`/users/unban/${id}`);
  return res.data.data;
};

export const deleteUser = async (id) => {
  await axiosInstance.delete(`/users/${id}`);
};