// src/views/Posts/Posts.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Eye, CheckCircle, XCircle, Trash2,
  ChefHat, X, Send, Loader2,
} from 'lucide-react';
import { usePosts, TABS, STATUS_LABELS, REJECT_REASONS } from '../../controllers/usePosts';
import './Posts.css';

const ActionBtn = ({ icon: Icon, color, title, onClick, disabled }) => (
  <button
    className={`post-action-btn post-action-btn--${color}`}
    title={title}
    onClick={onClick}
    disabled={disabled}
  >
    <Icon size={14} />
  </button>
);

const RejectModal = ({ post, onConfirm, onClose, loading }) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [customMessage,  setCustomMessage]  = useState('');

  const finalMessage = selectedReason === 'سبب آخر'
    ? customMessage.trim()
    : selectedReason + (customMessage.trim() ? `\n${customMessage.trim()}` : '');

  const canSubmit = selectedReason !== '' &&
    (selectedReason !== 'سبب آخر' || customMessage.trim() !== '');

  return (
    <div className="confirm-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="reject-modal">
        <div className="reject-modal-header">
          <div className="reject-modal-title-group">
            <h3 className="reject-modal-title">رفض المنشور</h3>
            <p className="reject-modal-subtitle">
              سيتم إشعار <strong>{post.user?.name}</strong> بسبب الرفض
            </p>
          </div>
          <button className="reject-modal-close" onClick={onClose} disabled={loading}>
            <X size={18} />
          </button>
        </div>

        <div className="reject-recipe-info">
          <div className="reject-recipe-thumb"><ChefHat size={18} /></div>
          <div>
            <p className="reject-recipe-name">{post.title}</p>
            <p className="reject-recipe-meta">{post.category?.name ?? '—'}</p>
          </div>
        </div>

        <div className="reject-section">
          <label className="reject-section-label">سبب الرفض</label>
          <div className="reject-reasons">
            {REJECT_REASONS.map(reason => (
              <button
                key={reason}
                className={`reject-reason-btn${selectedReason === reason ? ' reject-reason-btn--active' : ''}`}
                onClick={() => setSelectedReason(reason)}
                disabled={loading}
              >
                {reason}
              </button>
            ))}
          </div>
        </div>

        <div className="reject-section">
          <label className="reject-section-label">
            {selectedReason === 'سبب آخر' ? 'رسالتك للمستخدم *' : 'تفاصيل إضافية (اختياري)'}
          </label>
          <textarea
            className="reject-textarea"
            placeholder="اكتب ملاحظة توضيحية للمستخدم..."
            value={customMessage}
            onChange={e => setCustomMessage(e.target.value)}
            rows={3}
            disabled={loading}
          />
        </div>

        {finalMessage && (
          <div className="reject-preview">
            <p className="reject-preview-label">الرسالة التي ستُرسل:</p>
            <p className="reject-preview-text">{finalMessage}</p>
          </div>
        )}

        <div className="reject-modal-actions">
          <button className="reject-cancel-btn" onClick={onClose} disabled={loading}>إلغاء</button>
          <button
            className="reject-confirm-btn"
            onClick={() => canSubmit && onConfirm(post.id, finalMessage)}
            disabled={!canSubmit || loading}
          >
            {loading ? <Loader2 size={15} className="posts-spin" /> : <Send size={15} />}
            رفض وإرسال الرسالة
          </button>
        </div>
      </div>
    </div>
  );
};

const PostCard = ({ post, actionLoading, onApprove, onReject, onDelete, onView, formatDate }) => {
  const statusInfo = STATUS_LABELS[post.status] ?? { label: post.status, color: 'gray' };
  const isWorking  = actionLoading !== null;
  const isPublished = post.status === 'approved';

  return (
    <div className="post-card">
      <div className="post-card-top">
        <div className="post-info">
          <div className="post-thumb">
            {post.media?.[0]?.url
              ? <img src={post.media[0].url} alt={post.title} className="post-thumb-img" />
              : <ChefHat size={16} />
            }
          </div>
          <div className="post-text">
            <span className="post-name">{post.title}</span>
            <span className="post-author">بواسطة: {post.user?.name ?? '—'}</span>
          </div>
        </div>
        <span className={`post-status post-status--${statusInfo.color}`}>
          <span className="post-status-dot" />
          {statusInfo.label}
        </span>
      </div>

      <div className="post-card-meta">
        <span className="post-cat-badge">{post.category?.name ?? '—'}</span>
        <span className="post-date">{formatDate(post.created_at)}</span>
      </div>

      <div className="post-card-actions">
        <ActionBtn icon={Eye}         color="gray"  title="عرض" onClick={() => onView(post)} disabled={false} />
        <ActionBtn icon={CheckCircle} color="green" title="نشر" onClick={() => onApprove(post.id)} disabled={isPublished || isWorking} />
        <ActionBtn icon={XCircle}     color="dark"  title="رفض" onClick={() => onReject(post)} disabled={isPublished || isWorking} />
        <ActionBtn icon={Trash2}      color="red"   title="حذف" onClick={() => onDelete(post.id)} disabled={isWorking} />
      </div>
    </div>
  );
};

const Posts = () => {
  const navigate = useNavigate();

  const {
    posts, hasMore, loading, loadingMore, error,
    search, activeTab, actionLoading,
    rejectTarget, confirmDelete,
    setSearch, setRejectTarget, setConfirmDelete,
    handleTabChange, handleRetry,
    handleApprove, handleRejectConfirm, handleDelete,
    sentinelRef, scrollRootRef,
    formatDate,
  } = usePosts();

  return (
    <div className="posts-page" ref={scrollRootRef}>

      <div className="posts-header">
        <h1 className="posts-title">منشورات المستخدمين</h1>
        <div className="posts-search-wrapper">
          <Search size={16} className="posts-search-icon" />
          <input
            className="posts-search"
            type="text"
            placeholder="ابحث عن منشور أو مستخدم..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="posts-tabs">
        {TABS.map(tab => (
          <button
            key={tab.key}
            className={`posts-tab${activeTab === tab.key ? ' posts-tab--active' : ''}`}
            onClick={() => handleTabChange(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="posts-error">
          {error}
          <button className="posts-error-retry" onClick={handleRetry}>إعادة المحاولة</button>
        </div>
      )}

      <div className="posts-table-card">
        <table className="posts-table">
          <thead>
            <tr>
              <th className="pcol-post">المنشور</th>
              <th className="pcol-category">التصنيف</th>
              <th className="pcol-date">تاريخ النشر</th>
              <th className="pcol-status">الحالة</th>
              <th className="pcol-details">التفاصيل</th>
              <th className="pcol-actions">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="posts-loading-cell">
                  <Loader2 size={22} className="posts-spin" /> جاري التحميل...
                </td>
              </tr>
            ) : posts.length === 0 ? (
              <tr>
                <td colSpan={6} className="posts-empty">لا توجد منشورات مطابقة</td>
              </tr>
            ) : posts.map(post => {
              const statusInfo  = STATUS_LABELS[post.status] ?? { label: post.status, color: 'gray' };
              const isWorking   = actionLoading !== null;
              const isPublished = post.status === 'approved';

              return (
                <tr key={post.id} className="posts-row">
                  <td className="pcol-post">
                    <div className="post-info">
                      <div className="post-thumb">
                        {post.media?.[0]?.url
                          ? <img src={post.media[0].url} alt={post.title} className="post-thumb-img" />
                          : <ChefHat size={18} />
                        }
                      </div>
                      <div className="post-text">
                        <span className="post-name">{post.title}</span>
                        <span className="post-author">بواسطة: {post.user?.name ?? '—'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="pcol-category">
                    <span className="post-cat-badge">{post.category?.name ?? '—'}</span>
                  </td>
                  <td className="pcol-date">
                    <span className="post-date">{formatDate(post.created_at)}</span>
                  </td>
                  <td className="pcol-status">
                    <span className={`post-status post-status--${statusInfo.color}`}>
                      <span className="post-status-dot" />
                      {statusInfo.label}
                    </span>
                  </td>
                  <td className="pcol-details">
                    <div className="post-details-cell">
                      <ActionBtn
                        icon={Eye}
                        color="gray"
                        title="عرض التفاصيل"
                        onClick={() => navigate(`/posts/${post.id}`, { state: { post } })}
                        disabled={false}
                      />
                    </div>
                  </td>
                  <td className="pcol-actions">
                    <div className="post-actions">
                      <ActionBtn
                        icon={Trash2}
                        color="red"
                        title="حذف"
                        onClick={() => setConfirmDelete(post.id)}
                        disabled={isWorking}
                      />
                      <ActionBtn
                        icon={XCircle}
                        color="dark"
                        title="رفض وإرسال رسالة"
                        onClick={() => setRejectTarget(post)}
                        disabled={isPublished || isWorking}
                      />
                      <ActionBtn
                        icon={CheckCircle}
                        color="green"
                        title="نشر"
                        onClick={() => handleApprove(post.id)}
                        disabled={isPublished || isWorking}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {!loading && !hasMore && posts.length > 0 && (
          <div className="posts-end">تم عرض جميع المنشورات ({posts.length})</div>
        )}
      </div>

      <div className="posts-cards">
        {loading ? (
          <div className="posts-loading-cards">
            <Loader2 size={22} className="posts-spin" /> جاري التحميل...
          </div>
        ) : posts.length === 0 ? (
          <div className="posts-empty-cards">لا توجد منشورات مطابقة</div>
        ) : posts.map(post => (
          <PostCard
            key={post.id}
            post={post}
            actionLoading={actionLoading}
            onApprove={handleApprove}
            onReject={setRejectTarget}
            onDelete={setConfirmDelete}
            onView={p => navigate(`/posts/${p.id}`, { state: { post: p } })}
            formatDate={formatDate}
          />
        ))}

        {!loading && !hasMore && posts.length > 0 && (
          <div className="posts-end">تم عرض جميع المنشورات ({posts.length})</div>
        )}
      </div>

      <div ref={sentinelRef} className="posts-sentinel" aria-hidden="true">
        {loadingMore && (
          <div className="posts-sentinel-loading">
            <Loader2 size={20} className="posts-spin" />
            <span>جاري تحميل المزيد...</span>
          </div>
        )}
      </div>

      {rejectTarget && (
        <RejectModal
          post={rejectTarget}
          onConfirm={handleRejectConfirm}
          onClose={() => setRejectTarget(null)}
          loading={actionLoading?.startsWith('reject')}
        />
      )}

      {confirmDelete && (
        <div className="confirm-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="confirm-dialog" onClick={e => e.stopPropagation()}>
            <h3 className="confirm-title">تأكيد الحذف</h3>
            <p className="confirm-text">
              هل أنت متأكد من حذف هذا المنشور نهائياً؟ لا يمكن التراجع عن هذا الإجراء.
            </p>
            <div className="confirm-actions">
              <button className="confirm-btn confirm-btn--cancel"
                onClick={() => setConfirmDelete(null)}
                disabled={actionLoading !== null}>إلغاء</button>
              <button className="confirm-btn confirm-btn--delete"
                onClick={() => handleDelete(confirmDelete)}
                disabled={actionLoading !== null}>
                {actionLoading === `delete_${confirmDelete}`
                  ? <Loader2 size={14} className="posts-spin" /> : 'حذف'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Posts;