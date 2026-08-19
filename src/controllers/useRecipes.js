// src/controllers/useRecipes.js
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  fetchAllRecipes,
  searchRecipes,
  deleteRecipe,
} from '../models/recipesModel';
import { fetchAllRecipeCategories } from '../models/categoriesModel';

export const STATUS_LABELS = {
  published: { label: 'منشورة',       color: 'green'  },
  pending:   { label: 'قيد المراجعة', color: 'orange' },
  rejected:  { label: 'مرفوضة',       color: 'red'    },
  hidden:    { label: 'مخفية',        color: 'gray'   },
  draft:     { label: 'مسودة',        color: 'gray'   },
};

export const DIFFICULTY_OPTIONS = [
  { value: '',       label: 'الكل' },
  { value: 'easy',   label: 'سهل' },
  { value: 'medium', label: 'متوسط' },
  { value: 'hard',   label: 'صعب' },
];

export const PREP_TIME_OPTIONS = [
  { value: '',    label: 'الكل' },
  { value: '15',  label: 'حتى 15 دقيقة' },
  { value: '30',  label: 'حتى 30 دقيقة' },
  { value: '45',  label: 'حتى 45 دقيقة' },
  { value: '60',  label: 'حتى 60 دقيقة' },
  { value: '90',  label: 'حتى 90 دقيقة' },
];

export const useRecipes = ({
  initialSearch = '',
  initialDifficulty = '',
  initialCategory = '',
  initialPrepTime = '',
  initialPage = 1,
} = {}) => {
  const [recipes,       setRecipes]       = useState([]);
  const [meta,          setMeta]          = useState(null);
  const [categories,    setCategories]    = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState('');
  const [search,        setSearch]        = useState(initialSearch);
  const [difficulty,    setDifficulty]    = useState(initialDifficulty);
  const [category,      setCategory]      = useState(initialCategory);
  const [prepTime,      setPrepTime]      = useState(initialPrepTime);
  const [page,          setPage]          = useState(initialPage);
  const [actionLoading, setActionLoading] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const searchRef     = useRef(initialSearch);
  const difficultyRef = useRef(initialDifficulty);
  const categoryRef   = useRef(initialCategory);
  const prepTimeRef   = useRef(initialPrepTime);
  const fetchingRef   = useRef(false);
  const firstLoadRef  = useRef(true);

  useEffect(() => { searchRef.current = search; }, [search]);
  useEffect(() => { difficultyRef.current = difficulty; }, [difficulty]);
  useEffect(() => { categoryRef.current = category; }, [category]);
  useEffect(() => { prepTimeRef.current = prepTime; }, [prepTime]);

  useEffect(() => {
    let cancelled = false;
    fetchAllRecipeCategories()
      .then((data) => {
        if (!cancelled) setCategories(data);
      })
      .catch(() => {
        if (!cancelled) setCategories([]);
      })
      .finally(() => {
        if (!cancelled) setCategoriesLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const loadRecipes = useCallback(async (pageNum = 1) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    setLoading(true);
    setError('');

    const term = searchRef.current.trim();
    const diff = difficultyRef.current;
    const cat  = categoryRef.current;
    const prep = prepTimeRef.current;

    try {
      const result = term
        ? await searchRecipes(term, { page: pageNum })
        : await fetchAllRecipes({
            page: pageNum,
            difficulty: diff,
            category: cat,
            prepTime: prep,
          });

      setRecipes(result.data);
      setMeta(result.meta);
      setPage(result.meta?.current_page ?? pageNum);
    } catch {
      setError('فشل تحميل الوصفات، تحقق من الاتصال بالخادم');
      setRecipes([]);
      setMeta(null);
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (firstLoadRef.current) {
      firstLoadRef.current = false;
      fetchingRef.current = false;
      const t = setTimeout(() => loadRecipes(initialPage), 0);
      return () => clearTimeout(t);
    }

    fetchingRef.current = false;
    const delay = search.trim() ? 400 : 0;
    const t = setTimeout(() => loadRecipes(1), delay);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, difficulty, category, prepTime, loadRecipes]);

  const handlePageChange = useCallback((nextPage) => {
    if (nextPage < 1 || (meta && nextPage > meta.last_page)) return;
    fetchingRef.current = false;
    loadRecipes(nextPage);
  }, [loadRecipes, meta]);

  const handleRetry = useCallback(() => {
    fetchingRef.current = false;
    loadRecipes(page || 1);
  }, [loadRecipes, page]);

  const handleDelete = useCallback(async (id) => {
    setActionLoading(`delete_${id}`);
    setError('');
    try {
      await deleteRecipe(id);
      setConfirmDelete(null);
      const remaining = recipes.filter((r) => r.id !== id);
      if (remaining.length === 0 && page > 1) {
        fetchingRef.current = false;
        await loadRecipes(page - 1);
      } else {
        fetchingRef.current = false;
        await loadRecipes(page);
      }
    } catch {
      setError('فشل حذف الوصفة');
    } finally {
      setActionLoading(null);
    }
  }, [loadRecipes, page, recipes]);

  const total = meta?.total ?? recipes.length;

  const getCategoryLabel = useCallback((value) => {
    if (!value) return 'الكل';
    const item = categories.find((c) => String(c.id) === String(value));
    if (!item) return 'الكل';
    const cuisineName = item.cuisine?.name;
    return cuisineName ? `${cuisineName} · ${item.name}` : item.name;
  }, [categories]);

  return {
    recipes,
    meta,
    total,
    categories,
    categoriesLoading,
    loading,
    error,
    search,
    difficulty,
    category,
    prepTime,
    page,
    actionLoading,
    confirmDelete,
    setSearch,
    setDifficulty,
    setCategory,
    setPrepTime,
    setConfirmDelete,
    getCategoryLabel,
    handlePageChange,
    handleRetry,
    handleDelete,
  };
};