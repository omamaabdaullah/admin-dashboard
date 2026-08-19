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

export const usePosts = ({
  initialSearch = '',
  initialTab = 'all',
} = {}) => {
  const [posts,         setPosts]         = useState([]);
  const [meta,          setMeta]          = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState('');
  const [search,        setSearch]        = useState(initialSearch);
  const [activeTab,     setActiveTab]     = useState(initialTab);
  const [page,          setPage]          = useState(1);
  const [actionLoading, setActionLoading] = useState(null);
  const [rejectTarget,  setRejectTarget]  = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const searchRef    = useRef(initialSearch);
  const tabRef       = useRef(initialTab);
  const fetchingRef  = useRef(false);
  const firstLoadRef = useRef(true);

  useEffect(() => { searchRef.current = search; },    [search]);
  useEffect(() => { tabRef.current    = activeTab; }, [activeTab]);

  const loadPosts = useCallback(async (pageNum = 1) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    setLoading(true);
    setError('');
    try {
      const { data, meta: m } = await fetchPosts({
        page:    pageNum,
        perPage: PER_PAGE,
        search:  searchRef.current,
        status:  tabRef.current,
      });
      setPosts(data);
      setMeta(m ?? null);
      setPage(m?.current_page ?? pageNum);
    } catch {
      setError('فشل تحميل البيانات، تحقق من الاتصال بالخادم');
      setPosts([]);
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
      const t = setTimeout(() => loadPosts(1), 0);
      return () => clearTimeout(t);
    }
    fetchingRef.current = false;
    const delay = search.trim() ? 400 : 0;
    const t = setTimeout(() => loadPosts(1), delay);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, loadPosts]);

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
    tabRef.current = tab;
    fetchingRef.current = false;
    setTimeout(() => loadPosts(1), 0);
  }, [loadPosts]);

  const handlePageChange = useCallback((nextPage) => {
    const last = meta?.last_page ?? 1;
    if (nextPage < 1 || nextPage > last) return;
    fetchingRef.current = false;
    loadPosts(nextPage);
  }, [loadPosts, meta]);

  const handleRetry = useCallback(() => {
    fetchingRef.current = false;
    loadPosts(page || 1);
  }, [loadPosts, page]);

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

  const handleDelete = useCallback(async (id) => {
    setActionLoading(`delete_${id}`);
    setError('');
    try {
      await deletePost(id);
      const remaining = posts.filter(p => p.id !== id);
      setConfirmDelete(null);
      if (remaining.length === 0 && page > 1) {
        fetchingRef.current = false;
        await loadPosts(page - 1);
      } else {
        fetchingRef.current = false;
        await loadPosts(page);
      }
    } catch {
      setError('فشل حذف المنشور');
    } finally {
      setActionLoading(null);
    }
  }, [loadPosts, page, posts]);

  const formatDate = useCallback((str) => {
    if (!str) return '—';
    return new Date(str).toLocaleDateString('ar-EG', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  }, []);

  return {
    posts, meta, loading, error,
    search, activeTab, page, actionLoading,
    rejectTarget, confirmDelete,
    setSearch, setRejectTarget, setConfirmDelete,
    handleTabChange, handlePageChange, handleRetry,
    handleApprove, handleRejectConfirm, handleDelete,
    formatDate,
  };
};
