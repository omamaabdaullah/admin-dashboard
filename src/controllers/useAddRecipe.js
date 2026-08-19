// src/controllers/useAddRecipe.js
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRecipe } from '../models/recipesModel';
import {
  fetchCuisines,
  fetchCategoriesByCuisine,
  createCuisine,
  createCategory,
} from '../models/categoriesModel';
import { captureVideoFrame } from '../utils/videoThumbnail';

/* ── ثوابت مشتركة (تُصدَّر للـ View) ── */
export const DIFFICULTY_OPTIONS = [
  { value: 'easy',   label: 'سهل'   },
  { value: 'medium', label: 'متوسط' },
  { value: 'hard',   label: 'صعب'   },
];

const DIFFICULTY_MAP = { سهل: 'easy', متوسط: 'medium', صعب: 'hard' };

const quickAddErrorMessage = (err) => {
  const data = err?.response?.data ?? {};
  const nameErr = data.errors?.name?.[0];
  if (nameErr && /taken|unique/i.test(nameErr)) return 'هذا الاسم موجود مسبقاً';
  if (nameErr) return nameErr;
  if (typeof data.message === 'string' && /taken|unique/i.test(data.message)) {
    return 'هذا الاسم موجود مسبقاً';
  }
  return data.message || 'تعذّر الحفظ، حاول مرة أخرى';
};

/* ════════════════════════════════════════
   useAddRecipe  — كل الـ state والـ logic
════════════════════════════════════════ */
export const useAddRecipe = () => {
  const navigate = useNavigate();

  /* ── الحقول الأساسية ── */
  const [name,       setName]       = useState('');
  const [desc,       setDesc]       = useState('');
  const [prepTime,   setPrepTime]   = useState('');
  const [cookTime,   setCookTime]   = useState('');
  const [difficulty, setDifficulty] = useState('متوسط');
  const [servings,   setServings]   = useState(4);

  /* ── المطابخ والتصنيفات ── */
  const [cuisines,         setCuisines]         = useState([]);
  const [categories,       setCategories]       = useState([]);
  const [selectedCuisine,  setSelectedCuisine]  = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [cuisinesLoading,  setCuisinesLoading]  = useState(true);
  const [catsLoading,      setCatsLoading]      = useState(false);
  const [quickAdd,         setQuickAdd]         = useState(null);
  const [quickAddSaving,   setQuickAddSaving]   = useState(false);
  const [quickAddError,    setQuickAddError]    = useState('');

  /* ── الوسائط ── */
  const [mediaFiles,    setMediaFiles]    = useState([]);
  const [mediaPreviews, setMediaPreviews] = useState([]);

  /* ── المقادير ── */
  const [ingredients, setIngredients] = useState([
    { id: 1, text: '' },
    { id: 2, text: '' },
    { id: 3, text: '' },
  ]);

  /* ── الخطوات ── */
  const [steps, setSteps] = useState([
    { id: 1, text: '' },
    { id: 2, text: '' },
    { id: 3, text: '' },
  ]);

  /* ── القيم الغذائية ── */
  const [calories, setCalories] = useState('');
  const [protein,  setProtein]  = useState('');
  const [carbs,    setCarbs]    = useState('');
  const [fat,      setFat]      = useState('');

  /* ── حالة الإرسال ── */
  const [saving,   setSaving]   = useState(false);
  const [errors,   setErrors]   = useState({});
  const [apiError, setApiError] = useState('');

  /* ══ جلب المطابخ عند التحميل ══ */
  useEffect(() => {
    fetchCuisines()
      .then((data) => {
        setCuisines(data);
        if (data.length > 0) setSelectedCuisine(data[0]);
      })
      .catch(() => {})
      .finally(() => setCuisinesLoading(false));
  }, []);

  /* ══ جلب التصنيفات عند تغيّر المطبخ ══ */
  useEffect(() => {
    const loadCategories = async () => {
      if (!selectedCuisine?.id) {
        setCategories([]);
        setSelectedCategory(null);
        return;
      }
      setCatsLoading(true);
      setSelectedCategory(null);
      try {
        const data = await fetchCategoriesByCuisine(selectedCuisine.id);
        setCategories(data);
        if (data.length > 0) setSelectedCategory(data[0]);
      } catch {
        setCategories([]);
      } finally {
        setCatsLoading(false);
      }
    };
    loadCategories();
  }, [selectedCuisine]);

  /* ══ دوال الوسائط ══ */
  const addMediaFiles = useCallback(async (files) => {
    const arr = Array.from(files);
    if (!arr.length) return;

    setMediaFiles((prev) => [...prev, ...arr]);

    const items = await Promise.all(arr.map(async (file) => {
      const url = URL.createObjectURL(file);
      const isVideo = file.type.startsWith('video');
      const poster = isVideo ? await captureVideoFrame(url) : null;
      return { url, type: isVideo ? 'video' : 'image', poster };
    }));

    setMediaPreviews((prev) => [...prev, ...items]);
  }, []);

  const removeMedia = useCallback((idx) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== idx));
    setMediaPreviews((prev) => {
      URL.revokeObjectURL(prev[idx]?.url);
      return prev.filter((_, i) => i !== idx);
    });
  }, []);

  /* ══ دوال المقادير ══ */
  const addIngredient = useCallback(() =>
    setIngredients((p) => [...p, { id: Date.now(), text: '' }]), []);

  const updateIngredient = useCallback((id, val) =>
    setIngredients((p) => p.map((i) => (i.id === id ? { ...i, text: val } : i))), []);

  const removeIngredient = useCallback((id) =>
    setIngredients((p) => p.filter((i) => i.id !== id)), []);

  /* ══ دوال الخطوات ══ */
  const addStep = useCallback(() =>
    setSteps((p) => [...p, { id: Date.now(), text: '' }]), []);

  const updateStep = useCallback((id, val) =>
    setSteps((p) => p.map((s) => (s.id === id ? { ...s, text: val } : s))), []);

  const removeStep = useCallback((id) =>
    setSteps((p) => p.filter((s) => s.id !== id)), []);

  /* ══ مسح خطأ حقل بعينه ══ */
  const clearErr = useCallback((field) =>
    setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; }), []);

  const openQuickAdd = useCallback((kind) => {
    setQuickAddError('');
    setQuickAdd(kind);
  }, []);

  const closeQuickAdd = useCallback(() => {
    if (quickAddSaving) return;
    setQuickAdd(null);
    setQuickAddError('');
  }, [quickAddSaving]);

  const handleQuickAddSave = useCallback(async ({ name, image }) => {
    const trimmed = name?.trim();
    if (!trimmed) {
      setQuickAddError('الاسم مطلوب');
      return;
    }

    setQuickAddSaving(true);
    setQuickAddError('');
    try {
      if (quickAdd === 'cuisine') {
        const created = await createCuisine(trimmed, image);
        setCuisines((prev) => [...prev, created]);
        setSelectedCuisine(created);
      } else if (!selectedCuisine?.id) {
        setQuickAddError('اختر مطبخاً أولاً لإضافة تصنيف بداخله');
        return;
      } else {
        const created = await createCategory(selectedCuisine.id, trimmed, image);
        setCategories((prev) => [...prev, created]);
        setSelectedCategory(created);
      }
      clearErr('category');
      setQuickAdd(null);
    } catch (err) {
      setQuickAddError(quickAddErrorMessage(err));
    } finally {
      setQuickAddSaving(false);
    }
  }, [quickAdd, selectedCuisine, clearErr]);

  /* ══ التحقق من الحقول ══ */
  const validate = useCallback(() => {
    const e = {};
    if (!name.trim())                       e.name        = 'اسم الوصفة مطلوب';
    if (!selectedCategory?.id)              e.category    = 'يجب اختيار تصنيف';
    if (!prepTime || Number(prepTime) < 1)  e.prepTime    = 'وقت التحضير مطلوب';
    if (!ingredients.some((i) => i.text.trim()))
                                            e.ingredients = 'أضف مكوناً واحداً على الأقل';
    if (!steps.some((s) => s.text.trim()))  e.steps       = 'أضف خطوة واحدة على الأقل';
    return e;
  }, [name, selectedCategory, prepTime, ingredients, steps]);

  /* ══ الإرسال ══ */
  const handleSubmit = useCallback(async () => {
    setApiError('');
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setSaving(true);
    try {
      const payload = {
        category_id: selectedCategory.id,
        name:        name.trim(),
        description: desc.trim() || undefined,
        prep_time:   prepTime,
        cook_time:   cookTime   || undefined,
        servings:    servings   || undefined,
        difficulty:  DIFFICULTY_MAP[difficulty] ?? 'medium',
        ingredients: ingredients.filter((i) => i.text.trim()).map((i) => i.text.trim()),
        steps:       steps.filter((s) => s.text.trim()).map((s) => s.text.trim()),
        nutrition: {
          calories: calories !== '' ? calories : undefined,
          protein:  protein  !== '' ? protein  : undefined,
          carbs:    carbs    !== '' ? carbs    : undefined,
          fat:      fat      !== '' ? fat      : undefined,
        },
        mediaFiles,
      };
      console.log('[AddRecipe] nutrition payload:', payload.nutrition);
      await createRecipe(payload);
      navigate('/recipes');
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error   ||
        'حدث خطأ أثناء حفظ الوصفة';
      setApiError(msg);
    } finally {
      setSaving(false);
    }
  }, [
    validate, selectedCategory, name, desc, prepTime, cookTime,
    servings, difficulty, ingredients, steps, calories, protein,
    carbs, fat, mediaFiles, navigate,
  ]);

  const handleCancel = useCallback(() => navigate('/recipes'), [navigate]);

  /* ══ القيم المُعادة للـ View ══ */
  return {
    /* حقول النموذج */
    name,        setName,
    desc,        setDesc,
    prepTime,    setPrepTime,
    cookTime,    setCookTime,
    difficulty,  setDifficulty,
    servings,    setServings,

    /* المطابخ والتصنيفات */
    cuisines,
    categories,
    selectedCuisine,  setSelectedCuisine,
    selectedCategory, setSelectedCategory,
    cuisinesLoading,
    catsLoading,
    quickAdd,
    quickAddSaving,
    quickAddError,
    setQuickAddError,
    openQuickAdd,
    closeQuickAdd,
    handleQuickAddSave,

    /* الوسائط */
    mediaFiles,
    mediaPreviews,
    addMediaFiles,
    removeMedia,

    /* المقادير */
    ingredients,
    addIngredient,
    updateIngredient,
    removeIngredient,

    /* الخطوات */
    steps,
    addStep,
    updateStep,
    removeStep,

    /* القيم الغذائية */
    calories, setCalories,
    protein,  setProtein,
    carbs,    setCarbs,
    fat,      setFat,

    /* الإرسال والأخطاء */
    saving,
    errors,
    apiError,
    setApiError,
    clearErr,
    handleSubmit,
    handleCancel,
  };
};