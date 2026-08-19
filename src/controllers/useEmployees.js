// src/controllers/useEmployees.js
import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchEmployees, createEmployee, deleteEmployee } from '../models/employeesModel';

const PER_PAGE = 10;

export const useEmployees = () => {
  const [employees,     setEmployees]     = useState([]);
  const [total,         setTotal]         = useState(null);
  const [hasMore,       setHasMore]       = useState(false);
  const [loading,       setLoading]       = useState(true);
  const [loadingMore,   setLoadingMore]   = useState(false);
  const [error,         setError]         = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [addLoading,    setAddLoading]    = useState(false);
  const [addError,      setAddError]      = useState('');
  const [search,        setSearch]        = useState('');
  const [showAdd,       setShowAdd]       = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const searchRef      = useRef('');
  const currentPageRef = useRef(0);
  const lastPageRef    = useRef(1);
  const fetchingRef    = useRef(false);
  const sentinelRef    = useRef(null);
  const scrollRootRef  = useRef(null);

  useEffect(() => { searchRef.current = search; }, [search]);

  /* ── جلب صفحة ── */
  const fetchPage = useCallback((page, reset) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    if (reset) {
      setLoading(true);
      setEmployees([]);
      setHasMore(false);
    } else {
      setLoadingMore(true);
    }
    setError('');

    fetchEmployees({ page, perPage: PER_PAGE, search: searchRef.current })
      .then(res => {
        const data    = res.data               ?? [];
        const curPage = res.meta?.current_page ?? page;
        const last    = res.meta?.last_page    ?? 1;

        currentPageRef.current = curPage;
        lastPageRef.current    = last;

        setEmployees(prev => reset ? data : [...prev, ...data]);
        setTotal(res.meta?.total ?? null);
        setHasMore(curPage < last);
      })
      .catch(() => setError('فشل تحميل البيانات، تحقق من الاتصال'))
      .finally(() => {
        setLoading(false);
        setLoadingMore(false);
        fetchingRef.current = false;
      });
  }, []);

  /* ── تحميل أول مرة ── */
  useEffect(() => {
    currentPageRef.current = 0;
    lastPageRef.current    = 1;
    const t = setTimeout(() => fetchPage(1, true), 0);
    return () => clearTimeout(t);
  }, [fetchPage]);

  /* ── إعادة التحميل عند تغيير البحث ── */
  useEffect(() => {
    currentPageRef.current = 0;
    lastPageRef.current    = 1;
    fetchingRef.current    = false;
    const t = setTimeout(() => fetchPage(1, true), 300);
    return () => clearTimeout(t);
  }, [search, fetchPage]);

  /* ── IntersectionObserver ── */
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const root = scrollRootRef.current ?? null;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (
          entry.isIntersecting &&
          !fetchingRef.current &&
          currentPageRef.current > 0 &&
          currentPageRef.current < lastPageRef.current
        ) {
          fetchPage(currentPageRef.current + 1, false);
        }
      },
      { root, threshold: 0, rootMargin: '200px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [fetchPage]);

  /* ── إضافة موظف ── */
  const handleAdd = useCallback(async ({ name, email, password, confirm }) => {
    setAddError('');
    if (password !== confirm) {
      setAddError('كلمتا المرور غير متطابقتين');
      return false;
    }
    if (password.length < 8) {
      setAddError('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
      return false;
    }
    setAddLoading(true);
    try {
      const newEmp = await createEmployee(name, email, password, confirm);
      setEmployees(prev => [newEmp, ...prev]);
      setTotal(prev => prev !== null ? prev + 1 : 1);
      setShowAdd(false);
      return true;
    } catch (err) {
      setAddError(err.response?.data?.message || 'فشل إنشاء الحساب، تحقق من البيانات');
      return false;
    } finally {
      setAddLoading(false);
    }
  }, []);

  /* ── حذف موظف ── */
  const handleDelete = useCallback(async (id) => {
    setDeleteLoading(true);
    setError('');
    try {
      await deleteEmployee(id);
      setEmployees(prev => prev.filter(e => e.id !== id));
      setTotal(prev => prev !== null ? prev - 1 : null);
      setConfirmDelete(null);
    } catch {
      setError('فشل حذف الموظف');
    } finally {
      setDeleteLoading(false);
    }
  }, []);

  /* ── مساعدات العرض ── */
  const getInitials = useCallback((name) =>
    name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '؟'
  , []);

  const formatDate = useCallback((dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('ar-EG', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  }, []);

  return {
    /* state */
    employees, total, hasMore, loading, loadingMore,
    error, deleteLoading, addLoading, addError,
    search, showAdd, confirmDelete,
    /* setters */
    setSearch, setShowAdd, setConfirmDelete, setAddError,
    /* actions */
    handleAdd, handleDelete,
    /* refs */
    sentinelRef, scrollRootRef,
    /* helpers */
    getInitials, formatDate,
  };
};