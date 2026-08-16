// src/models/recipesModel.js
import axiosInstance from '../utils/axiosInstance';

const enumValue = (v) => (typeof v === 'object' && v !== null ? v.value : v);
const enumLabel = (v) => (typeof v === 'object' && v !== null ? v.label : v);

const firstImageUrl = (media = []) => {
  const images = media
    .filter((m) => enumValue(m.type) === 'image')
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  // إذا ما في صور نرجع null — لا نستخدم الفيديو كـ thumbnail
  return images[0]?.url ?? null;
};

const firstIsVideo = (media = []) => {
  if (!media.length) return false;
  return enumValue(media[0]?.type) === 'video';
};

const formatDateAr = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const normalizeRecipe = (recipe) => {
  const status = enumValue(recipe.status) || 'published';
  const difficultyValue = enumValue(recipe.difficulty);
  const difficultyLabel = enumLabel(recipe.difficulty) || '—';
  const kitchen = recipe.category?.cuisine?.name ?? '—';
  const categoryName = recipe.category?.name ?? '—';
  const author = recipe.user?.name ?? '—';
  const image      = firstImageUrl(recipe.media);
  const isVideo    = firstIsVideo(recipe.media);
  const videoThumb = isVideo ? (recipe.media[0]?.url ?? null) : null;

  return {
    ...recipe,
    status,
    statusLabel: enumLabel(recipe.status) || status,
    difficulty: difficultyValue,
    difficultyLabel,
    kitchen,
    categoryName,
    categoryId: recipe.category?.id ?? null,
    author,
    image,
    isVideo,
    videoThumb,
    addedDate: formatDateAr(recipe.created_at),
    ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
    steps: Array.isArray(recipe.steps) ? recipe.steps : [],
    media: Array.isArray(recipe.media) ? recipe.media : [],
    nutrition: (() => {
      const n = recipe.nutrition ?? {};
      const parse = (v) => {
        if (v === null || v === undefined || v === '' || v === 'null') return null;
        const num = Number(v);
        return Number.isFinite(num) ? num : null;
      };
      return {
        calories: parse(n.calories),
        protein:  parse(n.protein),
        carbs:    parse(n.carbs),
        fat:      parse(n.fat),
      };
    })(),
  };
};

export const fetchAllRecipes = async ({
  page = 1,
  search = '',
  category = '',
  difficulty = '',
  prepTime = '',
} = {}) => {
  const params = new URLSearchParams();
  params.append('page', page);
  if (search) params.append('search', search);
  if (category) params.append('category', category);
  if (difficulty) params.append('difficulty', difficulty);
  if (prepTime) params.append('prep_time', prepTime);

  const res = await axiosInstance.get(`/recipes/manage/all?${params.toString()}`);
  const payload = res.data;
  return {
    data: (payload.data ?? []).map(normalizeRecipe),
    meta: payload.meta ?? null,
  };
};

export const searchRecipes = async (term, { page = 1 } = {}) => {
  const encoded = encodeURIComponent(term.trim());
  const params = new URLSearchParams();
  params.append('page', page);

  const res = await axiosInstance.get(
    `/recipes/search/${encoded}?${params.toString()}`
  );
  const payload = res.data;
  return {
    data: (payload.data ?? []).map(normalizeRecipe),
    meta: payload.meta ?? null,
  };
};

export const deleteRecipe = async (id) => {
  const res = await axiosInstance.delete(`/recipes/${id}`);
  return res.data;
};

/**
 * POST /recipes  (multipart/form-data)
 *
 * @param {object} data
 * @param {string}   data.category_id
 * @param {string}   data.name
 * @param {string}   data.description
 * @param {string[]} data.ingredients   - plain strings e.g. ["دقيق", "ملح"]
 * @param {string[]} data.steps         - plain strings
 * @param {string}   data.prep_time
 * @param {string}   data.cook_time
 * @param {string}   data.servings
 * @param {string}   data.difficulty    - 'easy' | 'medium' | 'hard'
 * @param {object}   data.nutrition     - { calories, protein, carbs, fat }
 * @param {File[]}   data.mediaFiles    - File objects for media[]
 */
export const createRecipe = async (data) => {
  const form = new FormData();

  form.append('category_id', data.category_id);
  form.append('name', data.name);
  if (data.description) form.append('description', data.description);
  if (data.prep_time)   form.append('prep_time',   data.prep_time);
  if (data.cook_time)   form.append('cook_time',   data.cook_time);
  if (data.servings)    form.append('servings',    data.servings);
  if (data.difficulty)  form.append('difficulty',  data.difficulty);

  // nutrition — الـ backend يقبل الحقول مباشرة (بدون nutrition[key])
  const n = data.nutrition ?? {};
  if (n.calories != null && n.calories !== '') form.append('calories', n.calories);
  if (n.protein  != null && n.protein  !== '') form.append('protein',  n.protein);
  if (n.carbs    != null && n.carbs    !== '') form.append('carbs',    n.carbs);
  if (n.fat      != null && n.fat      !== '') form.append('fat',      n.fat);

  // ingredients[] — array of strings
  (data.ingredients ?? []).forEach((ing) => {
    form.append('ingredients[]', ing);
  });

  // steps[] — array of strings
  (data.steps ?? []).forEach((step) => {
    form.append('steps[]', step);
  });

  // media[] — array of File objects
  (data.mediaFiles ?? []).forEach((file) => {
    form.append('media[]', file);
  });

  const res = await axiosInstance.post('/recipes', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};