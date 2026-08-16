// src/controllers/useRecipes.js
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  fetchAllRecipes,
  searchRecipes,
  deleteRecipe,
} from '../models/recipesModel';

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

export const useRecipes = () => {
  const [recipes,       setRecipes]       = useState([]);
  const [meta,          setMeta]          = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState('');
  const [search,        setSearch]        = useState('');
  const [difficulty,    setDifficulty]    = useState('');
  const [page,          setPage]          = useState(1);
  const [actionLoading, setActionLoading] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const searchRef     = useRef('');
  const difficultyRef = useRef('');
  const fetchingRef   = useRef(false);

  useEffect(() => { searchRef.current = search; }, [search]);
  useEffect(() => { difficultyRef.current = difficulty; }, [difficulty]);

  const loadRecipes = useCallback(async (pageNum = 1) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    setLoading(true);
    setError('');

    const term = searchRef.current.trim();
    const diff = difficultyRef.current;

    try {
      const result = term
        ? await searchRecipes(term, { page: pageNum })
        : await fetchAllRecipes({
            page: pageNum,
            difficulty: diff,
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
    fetchingRef.current = false;
    const delay = search.trim() ? 400 : 0;
    const t = setTimeout(() => loadRecipes(1), delay);
    return () => clearTimeout(t);
  }, [search, difficulty, loadRecipes]);

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

  return {
    recipes,
    meta,
    total,
    loading,
    error,
    search,
    difficulty,
    page,
    actionLoading,
    confirmDelete,
    setSearch,
    setDifficulty,
    setConfirmDelete,
    handlePageChange,
    handleRetry,
    handleDelete,
  };
};