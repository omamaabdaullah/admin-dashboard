// src/models/postsModel.js
import axiosInstance from '../utils/axiosInstance';

// status يرجع دائماً { value, label } — نستخرج الـ value بأمان
const statusValue = (s) => (typeof s === 'object' && s !== null ? s.value : s);

// نُطبّق التحويل على كل post قبل تسليمه للـ view
const normalizePost = (post) => ({
  ...post,
  status: statusValue(post.status),
});

// ── Get All Posts (admin/employee) ─────────────────────────────────────────
export const fetchPosts = async ({
  page = 1, perPage = 10, search = '', status = 'all', categoryId = '',
} = {}) => {
  const params = new URLSearchParams();
  params.append('page',     page);
  params.append('per_page', perPage);
  if (search)             params.append('search',      search);
  if (status !== 'all')   params.append('status',      status);
  if (categoryId)         params.append('category_id', categoryId);

  const res     = await axiosInstance.get(`/posts?${params.toString()}`);
  const payload = res.data;
  return {
    data: (payload.data ?? []).map(normalizePost),
    meta: payload.meta ?? null,
  };
};

// ── Get One Post ───────────────────────────────────────────────────────────
export const fetchPost = async (id) => {
  const res = await axiosInstance.get(`/posts/${id}`);
  return normalizePost(res.data.data ?? res.data);
};

// ── Approve Post ───────────────────────────────────────────────────────────
export const approvePost = async (id) => {
  const res = await axiosInstance.patch(`/posts/${id}/approve`);
  return normalizePost(res.data.data ?? res.data);
};

// ── Reject Post ────────────────────────────────────────────────────────────
export const rejectPost = async (id, rejectionReason) => {
  const res = await axiosInstance.patch(`/posts/${id}/reject`, {
    rejection_reason: rejectionReason,
  });
  return normalizePost(res.data.data ?? res.data);
};

// ── Delete Post ────────────────────────────────────────────────────────────
export const deletePost = async (id) => {
  await axiosInstance.delete(`/posts/${id}`);
};

// ── Get Comments ───────────────────────────────────────────────────────────
export const fetchComments = async (postId, { page = 1, perPage = 10 } = {}) => {
  const params = new URLSearchParams();
  params.append('page',     page);
  params.append('per_page', perPage);

  const res     = await axiosInstance.get(`/posts/${postId}/comments?${params.toString()}`);
  const payload = res.data;
  return {
    data:  payload.data  ?? [],
    total: payload.meta?.total ?? 0,
    meta:  payload.meta  ?? null,
  };
};

// ── Delete Comment ──────────────────────────────────────────────────────────
export const deleteComment = async (commentId) => {
  await axiosInstance.delete(`/comments/${commentId}`);
};