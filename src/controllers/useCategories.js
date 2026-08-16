// src/controllers/useCategories.js
import { useState, useEffect, useCallback } from 'react';
import {
  fetchCuisines,
  createCuisine,
  updateCuisine,
  deleteCuisine,
  fetchCategoriesByCuisine,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../models/categoriesModel';

/* ── ترجمة رسائل الـ backend ── */
const BACKEND_ERRORS = {
  'Cannot delete this category because it has recipes linked to it.':
    'لا يمكن حذف هذا التصنيف لأنه مرتبط بوصفات.\nيجب حذف الوصفات المرتبطة به أولاً من صفحة الوصفات.',
  'Cannot delete this cuisine because it has categories linked to it.':
    'لا يمكن حذف هذا المطبخ لأنه يحتوي على تصنيفات.\nاحذف جميع التصنيفات التابعة له أولاً.',
  'Cannot delete this cuisine because it has recipes linked to it.':
    'لا يمكن حذف هذا المطبخ لأنه مرتبط بوصفات.',
};
const translateError = (msg) =>
  BACKEND_ERRORS[msg] ?? msg ?? 'حدث خطأ غير متوقع، حاول مجدداً.';

export const useCategories = () => {

  /* ── Cuisines ── */
  const [cuisines,      setCuisines]      = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState('');
  const [fetchTick,     setFetchTick]     = useState(0);

  /* ── المطبخ المختار ── */
  const [selectedId,    setSelectedId]    = useState(null);

  /* ── تصنيفات المطبخ المختار ── */
  const [categories,    setCategories]    = useState([]);  // { [cuisineId]: [...] }
  const [catsLoading,   setCatsLoading]   = useState(false);
  const [catsError,     setCatsError]     = useState('');

  /* ── Cuisine modal ── */
  const [cuisineModal,  setCuisineModal]  = useState(null);
  const [cSaveLoading,  setCSaveLoading]  = useState(false);
  const [cSaveError,    setCSaveError]    = useState('');
  const [cConfirmDel,   setCConfirmDel]   = useState(null);
  const [cDelLoading,   setCDelLoading]   = useState(false);
  const [cDelError,     setCDelError]     = useState('');

  /* ── Sub-category modal ── */
  const [subModal,      setSubModal]      = useState(null);
  const [sSaveLoading,  setSSaveLoading]  = useState(false);
  const [sSaveError,    setSSaveError]    = useState('');
  const [sConfirmDel,   setSConfirmDel]   = useState(null);
  const [sDelLoading,   setSDELLoading]   = useState(false);
  const [sDelError,     setSDELError]     = useState('');

  /* ── Toast ── */
  const [toast, setToast] = useState(null);
  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  /* ══════════════════════════════════════════════
     جلب المطابخ (بدون تصنيفات — فقط categories_count)
  ══════════════════════════════════════════════ */
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await fetchCuisines();
        if (cancelled) return;
        setCuisines(data);
        // نختار أول مطبخ تلقائياً
        setSelectedId(prev => prev ?? data[0]?.id ?? null);
      } catch {
        if (cancelled) return;
        setError('فشل تحميل المطابخ، تحقق من الاتصال');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [fetchTick]); 
  

  const loadCuisines = useCallback(() => setFetchTick(t => t + 1), []);

  /* ══════════════════════════════════════════════
     جلب تصنيفات المطبخ المختار عند تغيير selectedId
  ══════════════════════════════════════════════ */
  useEffect(() => {
    if (!selectedId) return;
    let cancelled = false;

    const load = async () => {
      setCatsLoading(true);
      setCatsError('');
      try {
        const data = await fetchCategoriesByCuisine(selectedId);
        if (cancelled) return;
        setCategories(prev => ({ ...prev, [selectedId]: data }));
      } catch {
        if (cancelled) return;
        setCatsError('فشل تحميل التصنيفات');
      } finally {
        if (!cancelled) setCatsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [selectedId]);

  /* ══════════════════════════════════════════════
     CUISINE: حفظ
  ══════════════════════════════════════════════ */
  const handleSaveCuisine = useCallback(async ({ name, image }) => {
    setCSaveLoading(true);
    setCSaveError('');
    try {
      if (cuisineModal === 'add') {
        const created = await createCuisine(name, image);
        setCuisines(prev => [...prev, { ...created, categories_count: 0 }]);
        setSelectedId(created.id);
        setCategories(prev => ({ ...prev, [created.id]: [] }));
        showToast('تم إضافة المطبخ بنجاح');
      } else {
        const updated = await updateCuisine(cuisineModal.id, name, image);
        setCuisines(prev =>
          prev.map(c => c.id === cuisineModal.id ? { ...c, ...updated } : c)
        );
        showToast('تم تعديل المطبخ بنجاح');
      }
      setCuisineModal(null);
    } catch (err) {
      setCSaveError(translateError(err.response?.data?.message));
    } finally {
      setCSaveLoading(false);
    }
  }, [cuisineModal, showToast]);

  /* ══════════════════════════════════════════════
     CUISINE: حذف
  ══════════════════════════════════════════════ */
  const handleDeleteCuisine = useCallback(async (id) => {
    setCDelLoading(true);
    setCDelError('');
    try {
      await deleteCuisine(id);
      setCuisines(prev => {
        const remaining = prev.filter(c => c.id !== id);
        setSelectedId(cur => cur === id ? (remaining[0]?.id ?? null) : cur);
        return remaining;
      });
      setCategories(prev => { const n = { ...prev }; delete n[id]; return n; });
      setCConfirmDel(null);
      showToast('تم حذف المطبخ بنجاح');
    } catch (err) {
      setCDelError(translateError(err.response?.data?.message));
    } finally {
      setCDelLoading(false);
    }
  }, [showToast]);

  /* ══════════════════════════════════════════════
     SUB-CATEGORY: حفظ
  ══════════════════════════════════════════════ */
  const handleSaveCategory = useCallback(async ({ name, image }) => {
    setSSaveLoading(true);
    setSSaveError('');
    try {
      if (subModal === 'add') {
        const created = await createCategory(selectedId, name, image);
        // أضف للـ cache + حدّث categories_count في المطبخ
        setCategories(prev => ({
          ...prev,
          [selectedId]: [...(prev[selectedId] ?? []), created],
        }));
        setCuisines(prev => prev.map(c =>
          c.id === selectedId
            ? { ...c, categories_count: (c.categories_count ?? 0) + 1 }
            : c
        ));
        showToast('تم إضافة التصنيف بنجاح');
      } else {
        const updated = await updateCategory(subModal.id, name, image);
        setCategories(prev => ({
          ...prev,
          [selectedId]: (prev[selectedId] ?? []).map(s =>
            s.id === subModal.id ? { ...s, ...updated } : s
          ),
        }));
        showToast('تم تعديل التصنيف بنجاح');
      }
      setSubModal(null);
    } catch (err) {
      setSSaveError(translateError(err.response?.data?.message));
    } finally {
      setSSaveLoading(false);
    }
  }, [subModal, selectedId, showToast]);

  /* ══════════════════════════════════════════════
     SUB-CATEGORY: حذف
  ══════════════════════════════════════════════ */
  const handleDeleteCategory = useCallback(async ({ catId, cuisineId }) => {
    setSDELLoading(true);
    setSDELError('');
    try {
      await deleteCategory(catId);
      setCategories(prev => ({
        ...prev,
        [cuisineId]: (prev[cuisineId] ?? []).filter(s => s.id !== catId),
      }));
      setCuisines(prev => prev.map(c =>
        c.id === cuisineId
          ? { ...c, categories_count: Math.max(0, (c.categories_count ?? 1) - 1) }
          : c
      ));
      setSConfirmDel(null);
      showToast('تم حذف التصنيف بنجاح');
    } catch (err) {
      setSDELError(translateError(err.response?.data?.message));
    } finally {
      setSDELLoading(false);
    }
  }, [showToast]);

  /* ── تصنيفات المطبخ المختار حالياً ── */
  const selected     = cuisines.find(c => c.id === selectedId) ?? null;
  const selectedCats = categories[selectedId] ?? null; // null = لم تُجلب بعد

  return {
    /* data */
    cuisines, selected, selectedId, selectedCats,
    loading, error,
    catsLoading, catsError,
    /* cuisine modal */
    cuisineModal, cSaveLoading, cSaveError,
    cConfirmDel,  cDelLoading,  cDelError,
    /* sub modal */
    subModal,    sSaveLoading, sSaveError,
    sConfirmDel, sDelLoading,  sDelError,
    /* toast */
    toast,
    /* setters */
    setSelectedId,
    setCuisineModal, setCSaveError,
    setCConfirmDel,  setCDelError,
    setSubModal,     setSSaveError,
    setSConfirmDel,  setSDELError,
    /* actions */
    handleSaveCuisine,  handleDeleteCuisine,
    handleSaveCategory, handleDeleteCategory,
    loadCuisines,
  };
};