// src/models/categoriesModel.js
import axiosInstance from '../utils/axiosInstance';

/* ══════════════════════════════════════════════════════
   CUISINES
══════════════════════════════════════════════════════ */

// GET /cuisines → { id, name, image, categories_count }
export const fetchCuisines = async () => {
  const res  = await axiosInstance.get('/cuisines');
  return res.data?.data ?? [];
};

// POST /cuisines
export const createCuisine = async (name, image = null) => {
  const form = new FormData();
  form.append('name', name);
  if (image) form.append('image', image);
  const res = await axiosInstance.post('/cuisines', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data?.data ?? res.data;
};

// POST /cuisines/{id}
export const updateCuisine = async (id, name, image = null) => {
  const form = new FormData();
  form.append('name', name);
  if (image) form.append('image', image);
  const res = await axiosInstance.post(`/cuisines/${id}`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data?.data ?? res.data;
};

// DELETE /cuisines/{id}
export const deleteCuisine = async (id) => {
  await axiosInstance.delete(`/cuisines/${id}`);
};

/* ══════════════════════════════════════════════════════
   RECIPE CATEGORIES
══════════════════════════════════════════════════════ */

// GET /recipe-categories
// → [{ id, name, image, cuisine:{id,name}, recipes_count, created_at }]
export const fetchAllRecipeCategories = async () => {
  const res = await axiosInstance.get('/recipe-categories');
  return res.data?.data ?? [];
};

// GET /recipe-categories/cuisine/{cuisine_id}
// → [{ id, name, image, cuisine:[], recipes_count, created_at }]
export const fetchCategoriesByCuisine = async (cuisineId) => {
  const res = await axiosInstance.get(`/recipe-categories/cuisine/${cuisineId}`);
  return res.data?.data ?? [];
};

// POST /recipe-categories/cuisine/{cuisine_id}
export const createCategory = async (cuisineId, name, image = null) => {
  const form = new FormData();
  form.append('name', name);
  if (image) form.append('image', image);
  const res = await axiosInstance.post(
    `/recipe-categories/cuisine/${cuisineId}`,
    form,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return res.data?.data ?? res.data;
};

// POST /recipe-categories/{category_id}
export const updateCategory = async (categoryId, name, image = null) => {
  const form = new FormData();
  form.append('name', name);
  if (image) form.append('image', image);
  const res = await axiosInstance.post(
    `/recipe-categories/${categoryId}`,
    form,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return res.data?.data ?? res.data;
};

// DELETE /recipe-categories/{id}
export const deleteCategory = async (id) => {
  await axiosInstance.delete(`/recipe-categories/${id}`);
};