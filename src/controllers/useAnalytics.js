// src/controllers/useAnalytics.js
import { useState, useEffect, useCallback } from 'react';
import { fetchAnalytics } from '../models/analyticsModel';

export const useAnalytics = (periodLabel) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    return fetchAnalytics(periodLabel)
      .then(setData)
      .catch((err) => {
        setError(err.message || 'فشل تحميل الإحصائيات');
        setData(null);
      })
      .finally(() => setLoading(false));
  }, [periodLabel]);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      setLoading(true);
      setError('');
      fetchAnalytics(periodLabel)
        .then((result) => {
          if (!cancelled) setData(result);
        })
        .catch((err) => {
          if (!cancelled) {
            setError(err.message || 'فشل تحميل الإحصائيات');
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
  }, [periodLabel]);

  return { data, loading, error, reload: load };
};