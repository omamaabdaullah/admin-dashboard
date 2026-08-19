// src/controllers/useDashboard.js
import { useState, useEffect, useCallback } from 'react';
import { fetchDashboard } from '../models/dashboardModel';

export const useDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    setError('');

    return fetchDashboard()
      .then(setData)
      .catch((err) => {
        setError(err.message || 'فشل تحميل لوحة التحكم');
        setData(null);
      })
      .finally(() => setLoading(false));
  }, []);

  /* نستخدم setTimeout لكي لا يكون setState مباشرة في body الـ effect */
  useEffect(() => {
    let cancelled = false;

    const timer = setTimeout(() => {
      setLoading(true);
      setError('');

      fetchDashboard()
        .then((result) => {
          if (!cancelled) setData(result);
        })
        .catch((err) => {
          if (!cancelled) {
            setError(err.message || 'فشل تحميل لوحة التحكم');
            setData(null);
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 0);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  return { data, loading, error, reload: load };
};