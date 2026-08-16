// src/controllers/useAddRecipe.js
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRecipe } from '../models/recipesModel';
import { fetchCuisines, fetchCategoriesByCuisine } from '../models/categoriesModel';

/* ── ثوابت مشتركة (تُصدَّر للـ View) ── */
export const DIFFICULTY_OPTIONS = [
  { value: 'easy',   label: 'سهل'   },
  { value: 'medium', label: 'متوسط' },
  { value: 'hard',   label: 'صعب'   },
];

const DIFFICULTY_MAP = { سهل: 'easy', متوسط: 'medium', صعب: 'hard' };

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
  const addMediaFiles = useCallback((files) => {
    const arr = Array.from(files);
    setMediaFiles((prev) => [...prev, ...arr]);
    arr.forEach((file) => {
      const url = URL.createObjectURL(file);
      setMediaPreviews((prev) => [
        ...prev,
        { url, type: file.type.startsWith('video') ? 'video' : 'image' },
      ]);
    });
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