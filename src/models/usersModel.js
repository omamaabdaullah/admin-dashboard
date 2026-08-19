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

const CLIENT_PAGE_SIZE = 100;
const CLIENT_MAX_PAGES = 50;

const isWithinDays = (createdAt, days) => {
  if (!createdAt) return false;
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return false;
  return date.getTime() >= Date.now() - days * 24 * 60 * 60 * 1000;
};

export const fetchAllClients = async ({ status = 'active' } = {}) => {
  const users = [];
  let page = 1;
  let lastPage = 1;

  do {
    const result = await fetchClients({ page, perPage: CLIENT_PAGE_SIZE, status });
    users.push(...(result.data ?? []));
    lastPage = result.meta?.last_page ?? page;
    page += 1;
  } while (page <= lastPage && page <= CLIENT_MAX_PAGES);

  return users;
};

export const fetchClientGroup = async (groupKey, allActiveClients) => {
  const users = allActiveClients ?? await fetchAllClients({ status: 'active' });
  if (groupKey === 'active') return users;
  if (groupKey === 'new7')  return users.filter((user) => isWithinDays(user.created_at, 7));
  if (groupKey === 'new30') return users.filter((user) => isWithinDays(user.created_at, 30));
  return [];
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
  await axiosInstance.delete(`/users/users/${id}`);
};