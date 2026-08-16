// src/controllers/usePosts.js
import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchPosts, approvePost, rejectPost, deletePost } from '../models/postsModel';

const PER_PAGE = 10;

export const STATUS_LABELS = {
  approved: { label: 'منشورة',       color: 'green'  },
  pending:  { label: 'قيد المراجعة', color: 'orange' },
  rejected: { label: 'مرفوضة',       color: 'red'    },
};

export const TABS = [
  { key: 'all',      label: 'جميع المنشورات' },
  { key: 'pending',  label: 'قيد المراجعة'   },
  { key: 'approved', label: 'منشورة'          },
  { key: 'rejected', label: 'مرفوضة'          },
];

export const REJECT_REASONS = [
  'الصور غير واضحة أو ذات جودة منخفضة',
  'المكونات أو الخطوات غير مكتملة',
  'المحتوى لا يتعلق بالطبخ',
  'محتوى مكرر موجود مسبقاً',
  'المحتوى مخالف لسياسة المنصة',
  'سبب آخر',
];

export const usePosts = () => {
  const [posts,         setPosts]         = useState([]);
  const [hasMore,       setHasMore]       = useState(false);
  const [loading,       setLoading]       = useState(true);
  const [loadingMore,   setLoadingMore]   = useState(false);
  const [error,         setError]         = useState('');
  const [search,        setSearch]        = useState('');
  const [activeTab,     setActiveTab]     = useState('all');
  const [actionLoading, setActionLoading] = useState(null);
  const [rejectTarget,  setRejectTarget]  = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const searchRef      = useRef('');
  const tabRef         = useRef('all');
  const currentPageRef = useRef(0);
  const lastPageRef    = useRef(1);
  const fetchingRef    = useRef(false);
  const sentinelRef    = useRef(null);
  const scrollRootRef  = useRef(null);

  useEffect(() => { searchRef.current = search; },    [search]);
  useEffect(() => { tabRef.current    = activeTab; }, [activeTab]);

  /* ── جلب صفحة ── */
  const fetchPage = useCallback((page, reset) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    if (reset) {
      setLoading(true);
      setPosts([]);
      setHasMore(false);
    } else {
      setLoadingMore(true);
    }
    setError('');

    fetchPosts({
      page,
      perPage: PER_PAGE,
      search:  searchRef.current,
      status:  tabRef.current,
    })
      .then(({ data, meta }) => {
        const curPage = meta?.current_page ?? page;
        const last    = meta?.last_page    ?? 1;

        currentPageRef.current = curPage;
        lastPageRef.current    = last;

        setPosts(prev => reset ? data : [...prev, ...data]);
        setHasMore(curPage < last);
      })
      .catch(() => setError('فشل تحميل البيانات، تحقق من الاتصال بالخادم'))
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

  /* ── إعادة تحميل عند تغيير البحث ── */
  useEffect(() => {
    currentPageRef.current = 0;
    lastPageRef.current    = 1;
    fetchingRef.current    = false;
    const t = setTimeout(() => fetchPage(1, true), 400);
    return () => clearTimeout(t);
  }, [search, fetchPage]);

  /* ── تغيير التاب ── */
  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
    tabRef.current         = tab;
    currentPageRef.current = 0;
    lastPageRef.current    = 1;
    fetchingRef.current    = false;
    setTimeout(() => fetchPage(1, true), 0);
  }, [fetchPage]);

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

  /* ── إعادة المحاولة ── */
  const handleRetry = useCallback(() => {
    currentPageRef.current = 0;
    lastPageRef.current    = 1;
    fetchingRef.current    = false;
    fetchPage(1, true);
  }, [fetchPage]);

  /* ── قبول ── */
  const handleApprove = useCallback(async (id) => {
    setActionLoading(`approve_${id}`);
    setError('');
    try {
      const updated = await approvePost(id);
      setPosts(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p));
    } catch {
      setError('فشل نشر المنشور');
    } finally {
      setActionLoading(null);
    }
  }, []);

  /* ── رفض ── */
  const handleRejectConfirm = useCallback(async (id, reason) => {
    setActionLoading(`reject_${id}`);
    setError('');
    try {
      const updated = await rejectPost(id, reason);
      setPosts(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p));
      setRejectTarget(null);
    } catch {
      setError('فشل رفض المنشور');
    } finally {
      setActionLoading(null);
    }
  }, []);

  /* ── حذف ── */
  const handleDelete = useCallback(async (id) => {
    setActionLoading(`delete_${id}`);
    setError('');
    try {
      await deletePost(id);
      setPosts(prev => prev.filter(p => p.id !== id));
      setConfirmDelete(null);
    } catch {
      setError('فشل حذف المنشور');
    } finally {
      setActionLoading(null);
    }
  }, []);

  /* ── مساعدات ── */
  const formatDate = useCallback((str) => {
    if (!str) return '—';
    return new Date(str).toLocaleDateString('ar-EG', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  }, []);

  return {
    posts, hasMore, loading, loadingMore, error,
    search, activeTab, actionLoading,
    rejectTarget, confirmDelete,
    setSearch, setRejectTarget, setConfirmDelete,
    handleTabChange, handleRetry,
    handleApprove, handleRejectConfirm, handleDelete,
    sentinelRef, scrollRootRef,
    formatDate,
  };
};