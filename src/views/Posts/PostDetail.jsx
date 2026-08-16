// src/views/Posts/PostDetail.jsx
import { useLocation, useParams } from 'react-router-dom';
import {
  CheckCircle, XCircle, Trash2, ChevronRight,
  Clock, Users, ChefHat, Heart, MessageCircle,
  Star, ImageOff, X, Send, Loader2, AlertCircle,
} from 'lucide-react';
import { useState } from 'react';
import { usePostDetail,  REJECT_REASONS } from '../../controllers/usePostDetail';
import './PostDetail.css';

const RejectModal = ({ post, onConfirm, onClose, loading }) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [customMessage,  setCustomMessage]  = useState('');

  const finalMessage = selectedReason === 'سبب آخر'
    ? customMessage.trim()
    : selectedReason + (customMessage.trim() ? `\n${customMessage.trim()}` : '');

  const canSubmit = selectedReason !== '' &&
    (selectedReason !== 'سبب آخر' || customMessage.trim() !== '');

  return (
    <div className="pd-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="pd-reject-modal">
        <div className="pd-reject-header">
          <div>
            <h3 className="pd-reject-title">رفض المنشور</h3>
            <p className="pd-reject-subtitle">
              سيتم إشعار <strong>{post.user?.name}</strong> بسبب الرفض
            </p>
          </div>
          <button className="pd-reject-close" onClick={onClose} disabled={loading}>
            <X size={18} />
          </button>
        </div>

        <div className="pd-reject-post-info">
          <div className="pd-reject-post-icon"><ChefHat size={18} /></div>
          <div>
            <p className="pd-reject-post-name">{post.title}</p>
            <p className="pd-reject-post-meta">{post.category?.name ?? '—'}</p>
          </div>
        </div>

        <div className="pd-reject-section">
          <label className="pd-reject-label">سبب الرفض</label>
          <div className="pd-reject-reasons">
            {REJECT_REASONS.map(r => (
              <button
                key={r}
                className={`pd-reason-btn${selectedReason === r ? ' pd-reason-btn--active' : ''}`}
                onClick={() => setSelectedReason(r)}
                disabled={loading}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="pd-reject-section">
          <label className="pd-reject-label">
            {selectedReason === 'سبب آخر' ? 'رسالتك للمستخدم *' : 'تفاصيل إضافية (اختياري)'}
          </label>
          <textarea
            className="pd-reject-textarea"
            placeholder="اكتب ملاحظة توضيحية..."
            value={customMessage}
            onChange={e => setCustomMessage(e.target.value)}
            rows={3}
            disabled={loading}
          />
        </div>

        {finalMessage && (
          <div className="pd-reject-preview">
            <p className="pd-reject-preview-label">الرسالة التي ستُرسل:</p>
            <p className="pd-reject-preview-text">{finalMessage}</p>
          </div>
        )}

        <div className="pd-reject-actions">
          <button className="pd-reject-cancel" onClick={onClose} disabled={loading}>إلغاء</button>
          <button
            className="pd-reject-confirm"
            onClick={() => canSubmit && onConfirm(finalMessage)}
            disabled={!canSubmit || loading}
          >
            {loading ? <Loader2 size={15} className="pd-spin" /> : <Send size={15} />}
            رفض وإرسال الرسالة
          </button>
        </div>
      </div>
    </div>
  );
};

const PostDetail = () => {
  const { id }   = useParams();
  const location = useLocation();

  const {
    post, pageLoading, pageError,
    actionLoading, actionError, setActionError,
    showReject, setShowReject,
    showDelete, setShowDelete,
    activeMedia, setActiveMedia,
    comments, commentsTotal, commentsLoad,
    deletingCmt,
    handleApprove, handleReject, handleDelete, handleDeleteComment,
    formatDate, statusCfg, navigate,
  } = usePostDetail(id, location.state?.post ?? null);

  if (pageLoading) return (
    <div className="pd-page pd-page--center">
      <Loader2 size={36} className="pd-spin" />
      <span>جاري تحميل المنشور...</span>
    </div>
  );

  if (pageError) return (
    <div className="pd-page pd-page--center">
      <p className="pd-page-error">{pageError}</p>
      <button className="pd-back-btn" onClick={() => navigate('/posts')}>العودة للمنشورات</button>
    </div>
  );

  if (!post) return null;

  const isPublished = post.status === 'approved';

  return (
    <div className="pd-page">

      <div className="pd-action-bar">
        <div className="pd-title-group">
          <div className="pd-title-row">
            <span className="pd-status-badge" style={{ background: statusCfg.bg, color: statusCfg.color }}>
              <span className="pd-status-dot" style={{ background: statusCfg.dot }} />
              {statusCfg.label}
            </span>
            <h1 className="pd-title">{post.title}</h1>
          </div>
          <div className="pd-breadcrumb">
            <span className="pd-bc-link" onClick={() => navigate('/posts')}>منشورات المستخدمين</span>
            <ChevronRight size={12} className="pd-bc-sep" />
            <span className="pd-bc-current">تفاصيل المنشور</span>
          </div>
        </div>

        <div className="pd-action-btns">
          <button
            className="pd-btn pd-btn--approve"
            onClick={handleApprove}
            disabled={isPublished || actionLoading !== null}
          >
            {actionLoading === 'approve'
              ? <Loader2 size={15} className="pd-spin" /> : <CheckCircle size={15} />}
            نشر المنشور
          </button>
          <button
            className="pd-btn pd-btn--reject"
            onClick={() => setShowReject(true)}
            disabled={isPublished || actionLoading !== null}
          >
            <XCircle size={15} /> رفض
          </button>
          <button
            className="pd-btn pd-btn--delete"
            onClick={() => setShowDelete(true)}
            disabled={actionLoading !== null}
          >
            <Trash2 size={15} /> حذف
          </button>
        </div>
      </div>

      {actionError && (
        <div className="pd-action-error">
          {actionError}
          <button onClick={() => setActionError('')}><X size={14} /></button>
        </div>
      )}

      <div className="pd-body">
        <div className="pd-left-col">
          <div className="pd-card pd-media-card">
            {post.media?.length > 0 ? (
              <>
                <div className="pd-media-main">
                  {post.media[activeMedia].type === 'video' ? (
                    <video
                      key={post.media[activeMedia].url}
                      src={post.media[activeMedia].url}
                      className="pd-media-video"
                      controls playsInline
                    />
                  ) : (
                    <img
                      src={post.media[activeMedia].url}
                      alt={`${post.title} — ${activeMedia + 1}`}
                      className="pd-image"
                    />
                  )}
                  <div className="pd-image-gradient" />
                  <div className="pd-image-overlay">
                    <h2 className="pd-overlay-title">{post.title}</h2>
                    <p className="pd-overlay-meta"><ChefHat size={14} /> {post.user?.name ?? '—'}</p>
                  </div>
                  <span className="pd-media-type-badge">
                    {post.media[activeMedia].type === 'video' ? '🎬 فيديو' : '🖼 صورة'}
                  </span>
                </div>

                {post.media.length > 1 && (
                  <div className="pd-media-thumbs">
                    {post.media
                      .slice()
                      .sort((a, b) => a.order - b.order)
                      .map((item, i) => (
                        <button
                          key={item.id ?? i}
                          className={`pd-thumb-btn${activeMedia === i ? ' pd-thumb-btn--active' : ''}`}
                          onClick={() => setActiveMedia(i)}
                        >
                          {item.type === 'video' ? (
                            <div className="pd-thumb-video">
                              <span className="pd-thumb-play">▶</span>
                            </div>
                          ) : (
                            <img src={item.url} alt={`thumb-${i}`} className="pd-thumb-img" />
                          )}
                        </button>
                      ))}
                  </div>
                )}
              </>
            ) : (
              <div className="pd-image-placeholder">
                <ImageOff size={56} strokeWidth={1.2} />
                <span>لا توجد وسائط</span>
              </div>
            )}
          </div>

          <div className="pd-card">
            <div className="pd-section-title">المعلومات الأساسية<span className="pd-title-bar" /></div>
            <div className="pd-info-grid">
              <div className="pd-info-cell">
                <div className="pd-info-icon"><Clock size={16} /></div>
                <span className="pd-info-label">مدة التحضير</span>
                <span className="pd-info-value">{post.duration_minutes ? `${post.duration_minutes} دقيقة` : '—'}</span>
              </div>
              <div className="pd-info-cell">
                <div className="pd-info-icon"><Users size={16} /></div>
                <span className="pd-info-label">عدد الأشخاص</span>
                <span className="pd-info-value">{post.servings ?? 'غير محدد'}</span>
              </div>
              <div className="pd-info-cell">
                <div className="pd-info-icon"><ChefHat size={16} /></div>
                <span className="pd-info-label">التصنيف</span>
                <span className="pd-info-value">{post.category?.name ?? '—'}</span>
              </div>
              <div className="pd-info-cell">
                <div className="pd-info-icon"><Star size={16} /></div>
                <span className="pd-info-label">التقييم</span>
                <span className="pd-info-value">{post.avg_rating ? `${post.avg_rating} / 5` : '—'}</span>
              </div>
            </div>
            {post.description && <p className="pd-description">{post.description}</p>}
          </div>

          {post.ingredients?.length > 0 && (
            <div className="pd-card">
              <div className="pd-card-header">
                <span className="pd-count-badge">{post.ingredients.length} مكونات</span>
                <div className="pd-section-title pd-section-title--inline">المكونات</div>
              </div>
              <div className="pd-ingredients">
                {post.ingredients.map((ing, i) => (
                  <div key={i} className={`pd-ingredient-row${i % 2 === 1 ? ' pd-ingredient-row--alt' : ''}`}>
                    <span className="pd-ing-qty">{ing.quantity ?? '—'}</span>
                    <div className="pd-ing-sep" />
                    <div className="pd-ing-dot" />
                    <span className="pd-ing-name">{ing.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {post.steps?.length > 0 && (
            <div className="pd-card">
              <div className="pd-card-header">
                <span className="pd-count-badge">{post.steps.length} خطوات</span>
                <div className="pd-section-title pd-section-title--inline">خطوات التحضير</div>
              </div>
              <div className="pd-steps">
                {[...post.steps].sort((a, b) => a.order - b.order).map((step, i) => (
                  <div key={i} className="pd-step-row">
                    <div className="pd-step-num-col">
                      <div className="pd-step-num">{step.order}</div>
                      {i < post.steps.length - 1 && <div className="pd-step-line" />}
                    </div>
                    <div className="pd-step-card">
                      <p className="pd-step-text">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {post.rejection_reason && (
            <div className="pd-card pd-rejection-card">
              <div className="pd-section-title pd-section-title--inline pd-section-title--red">سبب الرفض</div>
              <p className="pd-rejection-text">{post.rejection_reason}</p>
            </div>
          )}
        </div>

        <div className="pd-right-col">
          <div className="pd-card pd-user-card">
            <div className="pd-user-avatar">
              {post.user?.avatar
                ? <img src={post.user.avatar} alt={post.user.name} className="pd-user-avatar-img" />
                : <span className="pd-user-initial">{post.user?.name?.charAt(0)?.toUpperCase() ?? '؟'}</span>
              }
            </div>
            <h3 className="pd-user-name">{post.user?.name ?? '—'}</h3>
            <p className="pd-user-label">منشور المستخدم</p>
            <div className="pd-user-stats">
              <div className="pd-user-stat">
                <span className="pd-user-stat-val">{post.likes_count ?? 0}</span>
                <span className="pd-user-stat-label">إعجاب</span>
              </div>
              <div className="pd-user-stat-divider" />
              <div className="pd-user-stat">
                <span className="pd-user-stat-val">{post.comments_count ?? 0}</span>
                <span className="pd-user-stat-label">تعليق</span>
              </div>
            </div>
          </div>

          <div className="pd-card">
            <div className="pd-section-title pd-section-title--inline">معلومات النشر</div>
            <div className="pd-info-rows">
              <div className="pd-info-row">
                <span className="pd-info-row-label">التصنيف</span>
                <span className="pd-tag">{post.category?.name ?? '—'}</span>
              </div>
              <div className="pd-info-row">
                <span className="pd-info-row-label">تاريخ الإنشاء</span>
                <span className="pd-info-row-val">{formatDate(post.created_at)}</span>
              </div>
              <div className="pd-info-row">
                <span className="pd-info-row-label">الحالة</span>
                <span className="pd-status-inline" style={{ color: statusCfg.color }}>{statusCfg.label}</span>
              </div>
            </div>
          </div>

          <div className="pd-card">
            <div className="pd-section-title pd-section-title--inline">إحصائيات التفاعل</div>
            <div className="pd-stats-list">
              <div className="pd-stat-row">
                <span className="pd-stat-val">{post.likes_count ?? 0}</span>
                <div className="pd-stat-label-group">
                  <span className="pd-stat-label">الإعجابات</span>
                  <Heart size={17} className="pd-stat-icon pd-stat-icon--heart" />
                </div>
              </div>
              <div className="pd-stat-row">
                <span className="pd-stat-val">{commentsTotal}</span>
                <div className="pd-stat-label-group">
                  <span className="pd-stat-label">التعليقات</span>
                  <MessageCircle size={17} className="pd-stat-icon pd-stat-icon--comment" />
                </div>
              </div>
              <div className="pd-stat-row">
                <span className="pd-stat-val">{post.avg_rating ? `${post.avg_rating} / 5` : '—'}</span>
                <div className="pd-stat-label-group">
                  <span className="pd-stat-label">متوسط التقييم</span>
                  <Star size={17} className="pd-stat-icon pd-stat-icon--star" />
                </div>
              </div>
            </div>
          </div>

          <div className="pd-card">
            <div className="pd-section-title pd-section-title--inline">
              التعليقات
              {commentsTotal > 0 && <span className="pd-comments-count">{commentsTotal}</span>}
            </div>

            {commentsLoad ? (
              <div className="pd-comments-loading">
                <Loader2 size={18} className="pd-spin" /><span>جاري التحميل...</span>
              </div>
            ) : comments.length === 0 ? (
              <div className="pd-comments-empty">
                <AlertCircle size={16} /><span>لا توجد تعليقات</span>
              </div>
            ) : (
              <div className="pd-comments-list">
                {comments.map(comment => (
                  <div key={comment.id} className="pd-comment">
                    <div className="pd-comment-header">
                      <div className="pd-comment-user">
                        <div className="pd-comment-avatar">
                          {comment.user?.avatar
                            ? <img src={comment.user.avatar} alt={comment.user.name} className="pd-comment-avatar-img" />
                            : <span>{comment.user?.name?.charAt(0)?.toUpperCase() ?? '؟'}</span>
                          }
                        </div>
                        <div>
                          <p className="pd-comment-name">{comment.user?.name ?? '—'}</p>
                          <p className="pd-comment-time">{comment.created_at}</p>
                        </div>
                      </div>
                      <button
                        className="pd-comment-delete"
                        title="حذف التعليق"
                        onClick={() => handleDeleteComment(comment.id)}
                        disabled={deletingCmt === comment.id}
                      >
                        {deletingCmt === comment.id
                          ? <Loader2 size={13} className="pd-spin" /> : <Trash2 size={13} />}
                      </button>
                    </div>
                    <p className="pd-comment-body">{comment.body}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showReject && (
        <RejectModal
          post={post}
          onConfirm={handleReject}
          onClose={() => setShowReject(false)}
          loading={actionLoading === 'reject'}
        />
      )}

      {showDelete && (
        <div className="pd-overlay" onClick={e => e.target === e.currentTarget && setShowDelete(false)}>
          <div className="pd-confirm">
            <h3 className="pd-confirm-title">تأكيد الحذف</h3>
            <p className="pd-confirm-text">
              هل أنت متأكد من حذف منشور "<strong>{post.title}</strong>" نهائياً؟
              لا يمكن التراجع عن هذا الإجراء.
            </p>
            <div className="pd-confirm-actions">
              <button className="pd-confirm-btn pd-confirm-btn--cancel"
                onClick={() => setShowDelete(false)}
                disabled={actionLoading !== null}>إلغاء</button>
              <button className="pd-confirm-btn pd-confirm-btn--delete"
                onClick={handleDelete}
                disabled={actionLoading !== null}>
                {actionLoading === 'delete'
                  ? <Loader2 size={14} className="pd-spin" /> : 'حذف نهائياً'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PostDetail;