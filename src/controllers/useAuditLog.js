// src/controllers/useAuditLog.js
import { useState, useEffect, useCallback } from 'react';
import { fetchAuditLogs } from '../models/auditLogModel';
import { fetchEmployees } from '../models/employeesModel';

const PER_PAGE = 10;

export const useAuditLog = () => {
  const [rows, setRows] = useState([]);
  const [stats, setStats] = useState({ total: 0, today: 0, deletes: 0 });
  const [actionTypes, setActionTypes] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [meta, setMeta] = useState({ currentPage: 1, lastPage: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [action, setAction] = useState('');
  const [userId, setUserId] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      fetchEmployees({ page: 1, perPage: 100 })
        .then((res) => {
          if (cancelled) return;
          const current = JSON.parse(localStorage.getItem('user') || 'null');
          const list = res.data ?? [];
          if (current?.id && !list.some((u) => u.id === current.id)) {
            list.unshift(current);
          }
          setAdmins(list);
        })
        .catch(() => {});
    }, 0);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      setLoading(true);
      setError('');
      fetchAuditLogs({
        page,
        perPage: PER_PAGE,
        search,
        action,
        userId,
        dateFrom,
        dateTo,
      })
        .then((res) => {
          if (cancelled) return;
          setRows(res.data);
          setStats(res.stats);
          setActionTypes(res.actionTypes);
          setMeta(res.meta);
        })
        .catch((err) => {
          if (cancelled) return;
          setError(err.response?.data?.message || 'فشل تحميل سجل العمليات');
          setRows([]);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, search ? 300 : 0);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [page, search, action, userId, dateFrom, dateTo]);

  const handleReset = useCallback(() => {
    setSearch('');
    setAction('');
    setUserId('');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  }, []);

  const goTo = useCallback((n) => {
    setPage((prev) => {
      const last = meta.lastPage || 1;
      return Math.max(1, Math.min(last, n));
    });
  }, [meta.lastPage]);

  return {
    rows, stats, actionTypes, admins, meta,
    loading, error,
    search, setSearch,
    action, setAction,
    userId, setUserId,
    dateFrom, setDateFrom,
    dateTo, setDateTo,
    page, setPage, goTo,
    handleReset,
  };
};