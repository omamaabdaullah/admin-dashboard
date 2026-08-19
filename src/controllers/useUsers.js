// src/controllers/useUsers.js
import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchClients, banUser, unbanUser, deleteUser } from '../models/usersModel';

const PER_PAGE = 10;

export const useUsers = () => {
  const [users,         setUsers]         = useState([]);
  const [meta,          setMeta]          = useState(null);
  const [total,         setTotal]         = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmBan,    setConfirmBan]    = useState(null);
  const [search,        setSearch]        = useState('');
  const [filterStatus,  setFilterStatus]  = useState('all');
  const [page,          setPage]          = useState(1);

  const searchRef    = useRef('');
  const filterRef    = useRef('all');
  const fetchingRef  = useRef(false);
  const firstLoadRef = useRef(true);

  useEffect(() => { searchRef.current = search; },       [search]);
  useEffect(() => { filterRef.current = filterStatus; }, [filterStatus]);

  const loadUsers = useCallback(async (pageNum = 1) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    setLoading(true);
    setError('');
    try {
      const res = await fetchClients({
        page:    pageNum,
        perPage: PER_PAGE,
        search:  searchRef.current,
        status:  filterRef.current,
      });
      setUsers(res.data ?? []);
      setMeta(res.meta ?? null);
      setTotal(res.meta?.total ?? null);
      setPage(res.meta?.current_page ?? pageNum);
    } catch {
      setError('فشل تحميل البيانات، تحقق من الاتصال');
      setUsers([]);
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
      const t = setTimeout(() => loadUsers(1), 0);
      return () => clearTimeout(t);
    }
    fetchingRef.current = false;
    const delay = search.trim() ? 400 : 0;
    const t = setTimeout(() => loadUsers(1), delay);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, filterStatus, loadUsers]);

  const handlePageChange = useCallback((nextPage) => {
    const last = meta?.last_page ?? 1;
    if (nextPage < 1 || nextPage > last) return;
    fetchingRef.current = false;
    loadUsers(nextPage);
  }, [loadUsers, meta]);

  const handleBan = useCallback(async () => {
    if (!confirmBan?.id) return;
    const id = confirmBan.id;
    setActionLoading(`${id}_ban`);
    setError('');
    try {
      const updated = await banUser(id);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, status: updated.status } : u));
      setConfirmBan(null);
    } catch {
      setError('فشل حظر المستخدم');
    } finally {
      setActionLoading(null);
    }
  }, [confirmBan]);

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

  const handleDelete = useCallback(async (id) => {
    setActionLoading(`${id}_delete`);
    setError('');
    try {
      await deleteUser(id);
      const remaining = users.filter(u => u.id !== id);
      setConfirmDelete(null);
      if (remaining.length === 0 && page > 1) {
        fetchingRef.current = false;
        await loadUsers(page - 1);
      } else {
        fetchingRef.current = false;
        await loadUsers(page);
      }
    } catch {
      setError('فشل حذف المستخدم');
    } finally {
      setActionLoading(null);
    }
  }, [loadUsers, page, users]);

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
    users, meta, total, loading,
    error, confirmDelete, confirmBan, actionLoading,
    search, filterStatus, page,
    setSearch, setFilterStatus,
    handleBan, handleUnban, handleDelete,
    setConfirmDelete, setConfirmBan,
    handlePageChange,
    getInitials, formatDate,
  };
};
