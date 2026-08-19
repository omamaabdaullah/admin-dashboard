// src/controllers/usePostDetail.js
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  fetchPost, approvePost, rejectPost,
  deletePost, fetchComments, deleteComment,
} from '../models/postsModel';

export const STATUS_CONFIG = {
  approved: { label: 'منشورة',       bg: '#F0FDF4', color: '#16A34A', dot: '#16A34A' },
  pending:  { label: 'قيد المراجعة', bg: '#FEF5ED', color: '#E67E22', dot: '#E67E22' },
  rejected: { label: 'مرفوضة',       bg: '#FEF2F2', color: '#BA1A1A', dot: '#BA1A1A' },
};

export const REJECT_REASONS = [
  'الصور غير واضحة أو ذات جودة منخفضة',
  'المكونات أو الخطوات غير مكتملة',
  'المحتوى لا يتعلق بالطبخ',
  'محتوى مكرر موجود مسبقاً',
  'المحتوى مخالف لسياسة المنصة',
  'سبب آخر',
];

export const usePostDetail = (id, initialPost = null) => {
  const navigate = useNavigate();

  const [post,          setPost]          = useState(initialPost);
  const [pageLoading,   setPageLoading]   = useState(true);
  const [pageError,     setPageError]     = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [actionError,   setActionError]   = useState('');
  const [showReject,    setShowReject]    = useState(false);
  const [showDelete,    setShowDelete]    = useState(false);
  const [activeMedia,   setActiveMedia]   = useState(0);
  const [comments,      setComments]      = useState([]);
  const [commentsTotal, setCommentsTotal] = useState(0);
  const [commentsLoad,  setCommentsLoad]  = useState(true);
  const [deletingCmt,   setDeletingCmt]   = useState(null);

  const postIdRef = useRef(id);
  useEffect(() => { postIdRef.current = id; }, [id]);

  useEffect(() => {
    let cancelled = false;

    const timer = setTimeout(() => {
      setPageLoading(true);
      setPageError('');

      fetchPost(id)
        .then((data) => {
          if (!cancelled) {
            setPost(data);
            setPageLoading(false);
          }
        })
        .catch(() => {
          if (!cancelled) {
            setPageError('فشل تحميل تفاصيل المنشور');
            setPageLoading(false);
          }
        });
    }, 0);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [id]);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    fetchComments(id)
      .then(({ data, total }) => {
        if (!cancelled) {
          setComments(data);
          setCommentsTotal(total);
          setCommentsLoad(false);
        }
      })
      .catch(() => {
        if (!cancelled) setCommentsLoad(false);
      });

    return () => { cancelled = true; };
  }, [id]);

  const handleApprove = useCallback(async () => {
    setActionLoading('approve');
    setActionError('');
    try {
      const updated = await approvePost(postIdRef.current);
      setPost((prev) => ({ ...prev, ...updated }));
    } catch {
      setActionError('فشل نشر المنشور، حاول مجدداً');
    } finally {
      setActionLoading(null);
    }
  }, []);

  const handleReject = useCallback(async (reason) => {
    setActionLoading('reject');
    setActionError('');
    try {
      const updated = await rejectPost(postIdRef.current, reason);
      setPost((prev) => ({ ...prev, ...updated }));
      setShowReject(false);
    } catch {
      setActionError('فشل رفض المنشور، حاول مجدداً');
    } finally {
      setActionLoading(null);
    }
  }, []);

  const handleDelete = useCallback(async () => {
    setActionLoading('delete');
    setActionError('');
    try {
      await deletePost(postIdRef.current);
      navigate('/posts');
    } catch {
      setActionError('فشل حذف المنشور، حاول مجدداً');
      setActionLoading(null);
      setShowDelete(false);
    }
  }, [navigate]);

  const handleDeleteComment = useCallback(async (commentId) => {
    setDeletingCmt(commentId);
    try {
      await deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      setCommentsTotal((prev) => Math.max(0, prev - 1));
    } catch {
      // تجاهل
    } finally {
      setDeletingCmt(null);
    }
  }, []);

  const removeCommentsByUserId = useCallback((userId) => {
    setComments((prev) => {
      const removed = prev.filter((c) => c.user?.id === userId).length;
      setCommentsTotal((t) => Math.max(0, t - removed));
      return prev.filter((c) => c.user?.id !== userId);
    });
  }, []);

  const formatDate = useCallback((str) => {
    if (!str) return '—';
    return new Date(str).toLocaleDateString('ar-EG', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  }, []);

  const statusCfg = STATUS_CONFIG[post?.status] ?? STATUS_CONFIG.pending;

  return {
    post, pageLoading, pageError,
    actionLoading, actionError, setActionError,
    showReject, setShowReject,
    showDelete, setShowDelete,
    activeMedia, setActiveMedia,
    comments, commentsTotal, commentsLoad,
    deletingCmt,
    handleApprove, handleReject, handleDelete, handleDeleteComment,
    removeCommentsByUserId,
    formatDate, statusCfg,
    navigate,
  };
};