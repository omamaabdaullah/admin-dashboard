// src/controllers/useCommentUserActions.js
import { useState, useCallback } from 'react';
import { banUser, unbanUser, deleteUser } from '../models/usersModel';

export const useCommentUserActions = (onUserDeleted) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [confirmDeleteUser, setConfirmDeleteUser] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const isAdmin = ['admin', 'employee'].includes(localStorage.getItem('role'));

  const openUserActions = useCallback((user) => {
    if (!user?.id) return;
    setSelectedUser(user);
    setConfirmDeleteUser(false);
    setShowBanModal(false);
    setActionError('');
    setActionSuccess('');
  }, []);

  const closeUserActions = useCallback(() => {
    setSelectedUser(null);
    setConfirmDeleteUser(false);
    setShowBanModal(false);
    setActionError('');
    setActionSuccess('');
    setActionLoading(null);
  }, []);

  const handleBanUser = useCallback(async () => {
    if (!selectedUser?.id) return;
    setActionLoading('ban');
    setActionError('');
    setActionSuccess('');
    try {
      await banUser(selectedUser.id);
      setActionSuccess('تم حظر المستخدم بنجاح');
      setShowBanModal(false);
    } catch (err) {
      setActionError(err.message || 'فشل حظر المستخدم');
    } finally {
      setActionLoading(null);
    }
  }, [selectedUser]);

  const handleUnbanUser = useCallback(async () => {
    if (!selectedUser?.id) return;
    setActionLoading('unban');
    setActionError('');
    setActionSuccess('');
    try {
      await unbanUser(selectedUser.id);
      setActionSuccess('تم رفع الحظر بنجاح');
    } catch (err) {
      setActionError(err.message || 'فشل رفع الحظر');
    } finally {
      setActionLoading(null);
    }
  }, [selectedUser]);

  const handleDeleteUser = useCallback(async () => {
    if (!selectedUser?.id) return;
    setActionLoading('delete');
    setActionError('');
    setActionSuccess('');
    try {
      await deleteUser(selectedUser.id);
      onUserDeleted?.(selectedUser.id);
      closeUserActions();
    } catch (err) {
      setActionError(err.message || 'فشل حذف المستخدم');
      setConfirmDeleteUser(false);
    } finally {
      setActionLoading(null);
    }
  }, [selectedUser, onUserDeleted, closeUserActions]);

  return {
    selectedUser,
    confirmDeleteUser,
    setConfirmDeleteUser,
    showBanModal,
    setShowBanModal,
    actionLoading,
    actionError,
    actionSuccess,
    isAdmin,
    openUserActions,
    closeUserActions,
    handleBanUser,
    handleUnbanUser,
    handleDeleteUser,
  };
}; 