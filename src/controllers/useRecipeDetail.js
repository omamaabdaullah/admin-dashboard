// src/controllers/useRecipeDetail.js
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchRecipe, fetchRecipeComments, deleteRecipe } from '../models/recipesModel';
import { deleteComment } from '../models/postsModel';

export const useRecipeDetail = (recipeId) => {
  const navigate = useNavigate();

  const [recipe, setRecipe] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [comments, setComments] = useState([]);
  const [commentsTotal, setCommentsTotal] = useState(0);
  const [commentsLoad, setCommentsLoad] = useState(true);
  const [deletingCmt, setDeletingCmt] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!recipeId) return;

    let cancelled = false;
    const timer = setTimeout(() => {
      setPageLoading(true);
      setPageError('');

      fetchRecipe(recipeId)
        .then((data) => {
          if (!cancelled) {
            setRecipe(data);
            setPageLoading(false);
          }
        })
        .catch(() => {
          if (!cancelled) {
            setPageError('فشل تحميل تفاصيل الوصفة');
            setPageLoading(false);
          }
        });
    }, 0);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [recipeId]);
useEffect(() => {
  if (!recipeId) return;

  let cancelled = false;

  const timer = setTimeout(() => {
    setCommentsLoad(true);

    fetchRecipeComments(recipeId)
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
  }, 0);

  return () => {
    cancelled = true;
    clearTimeout(timer);
  };
}, [recipeId]);

  const handleDelete = useCallback(async () => {
    setDeleting(true);
    setError('');
    try {
      await deleteRecipe(recipeId);
      navigate('/recipes');
    } catch {
      setError('فشل حذف الوصفة');
      setDeleting(false);
    }
  }, [recipeId, navigate]);

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

  return {
    recipe,
    pageLoading,
    pageError,
    comments,
    commentsTotal,
    commentsLoad,
    deletingCmt,
    confirmDelete,
    setConfirmDelete,
    deleting,
    error,
    handleDelete,
    handleDeleteComment,
    removeCommentsByUserId,
  };
};