// src/controllers/useUsers.js
import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchClients, banUser, unbanUser, deleteUser } from '../models/usersModel';

const PER_PAGE = 10;

export const useUsers = () => {
  const [users,         setUsers]         = useState([]);
  const [total,         setTotal]         = useState(null);
  const [hasMore,       setHasMore]       = useState(false);
  const [loading,       setLoading]       = useState(true);
  const [loadingMore,   setLoadingMore]   = useState(false);
  const [error,         setError]         = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [search,        setSearch]        = useState('');
  const [filterStatus,  setFilterStatus]  = useState('all');

  const searchRef      = useRef('');
  const filterRef      = useRef('all');
  const currentPageRef = useRef(0);
  const lastPageRef    = useRef(1);
  const fetchingRef    = useRef(false);
  const sentinelRef    = useRef(null);
  const scrollRootRef  = useRef(null); // الـ div الذي يحتوي الـ scroll

  useEffect(() => { searchRef.current = search; },       [search]);
  useEffect(() => { filterRef.current = filterStatus; }, [filterStatus]);

  /* ── جلب صفحة ── */
  const fetchPage = useCallback((page, reset) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    if (reset) {
      setLoading(true);
      setUsers([]);
      setHasMore(false);
    } else {
      setLoadingMore(true);
    }
    setError('');

    fetchClients({
      page,
      perPage: PER_PAGE,
      search:  searchRef.current,
      status:  filterRef.current,
    })
      .then(res => {
        const data    = res.data               ?? [];
        const curPage = res.meta?.current_page ?? page;
        const last    = res.meta?.last_page    ?? 1;

        currentPageRef.current = curPage;
        lastPageRef.current    = last;

        setUsers(prev => reset ? data : [...prev, ...data]);
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

  /* ── إعادة التحميل عند تغيير البحث أو الفلتر ── */
  useEffect(() => {
    currentPageRef.current = 0;
    lastPageRef.current    = 1;
    fetchingRef.current    = false;
    const t = setTimeout(() => fetchPage(1, true), 300);
    return () => clearTimeout(t);
  }, [search, filterStatus, fetchPage]);

  /* ── IntersectionObserver ── */
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    // نستخدم scrollRootRef كـ root إذا كان موجوداً
    // هذا يحل مشكلة overflow-y: auto على الـ container
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
      {
        root,
        threshold:   0,
        rootMargin: '200px', // يبدأ التحميل قبل 200px من نهاية الصفحة
      }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [fetchPage]);

  /* ── حظر ── */
  const handleBan = useCallback(async (id) => {
    setActionLoading(`${id}_ban`);
    setError('');
    try {
      const updated = await banUser(id);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, status: updated.status } : u));
    } catch {
      setError('فشل حظر المستخدم');
    } finally {
      setActionLoading(null);
    }
  }, []);

  /* ── رفع الحظر ── */
  const handleUnban = useCallback(async (id) => {
    setActionLoading(`${id}_unban`);
    setError('');
    try {
      const updated = await unbanUser(id);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, status: updated.status } : u));
    } catch {
      setError('فشل رفع الحظر');
    } finally {
      setActionLoading(null);
    }
  }, []);

  /* ── حذف ── */
  const handleDelete = useCallback(async (id) => {
    setActionLoading(`${id}_delete`);
    setError('');
    try {
      await deleteUser(id);
      setUsers(prev => prev.filter(u => u.id !== id));
      setTotal(prev => prev !== null ? prev - 1 : null);
      setConfirmDelete(null);
    } catch {
      setError('فشل حذف المستخدم');
    } finally {
      setActionLoading(null);
    }
  }, []);

  const getInitials = useCallback((name) =>
    name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?'
  , []);

  const formatDate = useCallback((dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('ar-EG', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  }, []);

  return {
    users, total, hasMore, loading, loadingMore,
    error, confirmDelete, actionLoading,
    search, filterStatus,
    setSearch, setFilterStatus,
    handleBan, handleUnban, handleDelete,
    setConfirmDelete,
    sentinelRef,
    scrollRootRef,
    getInitials, formatDate,
  };
};