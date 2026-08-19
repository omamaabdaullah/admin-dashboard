// src/components/BanUserModal.jsx
import { Ban, Loader2, X } from 'lucide-react';
import './BanUserModal.css';

const BanUserModal = ({ user, onConfirm, onClose, loading }) => {
  if (!user) return null;

  return (
    <div className="ban-overlay" onClick={(e) => e.target === e.currentTarget && !loading && onClose()}>
      <div className="ban-modal">
        <div className="ban-header">
          <div>
            <h3 className="ban-title">حظر المستخدم</h3>
            <p className="ban-subtitle">سيتم حظر <strong>{user.name}</strong> فوراً</p>
          </div>
          <button type="button" className="ban-close" onClick={onClose} disabled={loading}>
            <X size={18} />
          </button>
        </div>

        <div className="ban-user-info">
          <div className="ban-user-icon"><Ban size={18} /></div>
          <div>
            <p className="ban-user-name">{user.name}</p>
            <p className="ban-user-meta">{user.email || `#${user.id}`}</p>
          </div>
        </div>

        <p className="ban-confirm-text">
          هل أنت متأكد من حظر هذا المستخدم؟ يمكنك رفع الحظر لاحقاً.
        </p>

        <div className="ban-actions">
          <button type="button" className="ban-cancel" onClick={onClose} disabled={loading}>
            إلغاء
          </button>
          <button
            type="button"
            className="ban-confirm"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? <Loader2 size={15} className="ban-spin" /> : <Ban size={15} />}
            تأكيد الحظر
          </button>
        </div>
      </div>
    </div>
  );
};

export default BanUserModal;
