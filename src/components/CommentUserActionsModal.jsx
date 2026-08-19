// src/components/CommentUserActionsModal.jsx
import { Ban, CheckCircle, Loader2, Trash2, X } from 'lucide-react';
import BanUserModal from './BanUserModal';
import './CommentUserActionsModal.css';

export const CommentAuthorButton = ({ user, onClick, prefix = 'pd' }) => {
  if (!user?.id) {
    return (
      <div className={`${prefix}-comment-user`}>
        <div className={`${prefix}-comment-avatar`}>
          <span>؟</span>
        </div>
        <div>
          <p className={`${prefix}-comment-name`}>—</p>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      className={`${prefix}-comment-user ${prefix}-comment-user--link`}
      onClick={() => onClick(user)}
      title="إدارة المستخدم"
    >
      <div className={`${prefix}-comment-avatar`}>
        {user.avatar
          ? <img src={user.avatar} alt={user.name} className={`${prefix}-comment-avatar-img`} />
          : <span>{user.name?.charAt(0)?.toUpperCase() ?? '؟'}</span>
        }
      </div>
      <div>
        <p className={`${prefix}-comment-name`}>{user.name ?? '—'}</p>
      </div>
    </button>
  );
};

const CommentUserActionsModal = ({
  user,
  isAdmin,
  confirmDeleteUser,
  setConfirmDeleteUser,
  showBanModal,
  setShowBanModal,
  actionLoading,
  actionError,
  actionSuccess,
  onClose,
  onBan,
  onUnban,
  onDelete,
}) => {
  if (!user) return null;

  const busy = actionLoading !== null;

  return (
    <>
      <div className="cua-overlay" onClick={(e) => e.target === e.currentTarget && !busy && onClose()}>
        <div className="cua-modal">
          <div className="cua-header">
            <div>
              <h3 className="cua-title">إدارة المستخدم</h3>
              <p className="cua-subtitle">#{user.id} — {user.name}</p>
            </div>
            <button type="button" className="cua-close" onClick={onClose} disabled={busy}>
              <X size={18} />
            </button>
          </div>

          <div className="cua-user-preview">
            <div className="cua-avatar">
              {user.avatar
                ? <img src={user.avatar} alt={user.name} className="cua-avatar-img" />
                : <span>{user.name?.charAt(0)?.toUpperCase() ?? '؟'}</span>
              }
            </div>
            <div>
              <p className="cua-user-name">{user.name}</p>
              <p className="cua-user-hint">إجراءات مباشرة على هذا الحساب</p>
            </div>
          </div>

          {actionError && <div className="cua-alert cua-alert--error">{actionError}</div>}
          {actionSuccess && <div className="cua-alert cua-alert--success">{actionSuccess}</div>}

          {!confirmDeleteUser ? (
            <div className="cua-actions">
              <button
                type="button"
                className="cua-btn cua-btn--ban"
                onClick={() => setShowBanModal(true)}
                disabled={busy}
              >
                <Ban size={15} />
                حظر المستخدم
              </button>
              <button type="button" className="cua-btn cua-btn--unban" onClick={onUnban} disabled={busy}>
                {actionLoading === 'unban'
                  ? <Loader2 size={15} className="cua-spin" />
                  : <CheckCircle size={15} />}
                رفع الحظر
              </button>
              {isAdmin && (
                <button
                  type="button"
                  className="cua-btn cua-btn--delete"
                  onClick={() => setConfirmDeleteUser(true)}
                  disabled={busy}
                >
                  <Trash2 size={15} />
                  حذف المستخدم
                </button>
              )}
              <button type="button" className="cua-btn cua-btn--cancel" onClick={onClose} disabled={busy}>
                إلغاء
              </button>
            </div>
          ) : (
            <div className="cua-confirm">
              <p className="cua-confirm-text">
                هل أنت متأكد من حذف المستخدم <strong>{user.name}</strong> نهائياً؟
                لا يمكن التراجع عن هذا الإجراء.
              </p>
              <div className="cua-confirm-actions">
                <button
                  type="button"
                  className="cua-btn cua-btn--cancel"
                  onClick={() => setConfirmDeleteUser(false)}
                  disabled={busy}
                >
                  إلغاء
                </button>
                <button type="button" className="cua-btn cua-btn--delete" onClick={onDelete} disabled={busy}>
                  {actionLoading === 'delete'
                    ? <Loader2 size={15} className="cua-spin" />
                    : 'حذف نهائياً'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showBanModal && (
        <BanUserModal
          user={user}
          onConfirm={onBan}
          onClose={() => setShowBanModal(false)}
          loading={actionLoading === 'ban'}
        />
      )}
    </>
  );
};

export default CommentUserActionsModal;