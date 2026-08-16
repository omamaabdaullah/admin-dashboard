// src/views/Users/Users.jsx
import { Search, Trash2, Ban, CheckCircle, Loader2, Users as UsersIcon } from 'lucide-react';
import { useUsers } from '../../controllers/useUsers';
import './Users.css';

/* ══════════════════════════════════════════
   صف الجدول
══════════════════════════════════════════ */
const UserRow = ({ user, role, actionLoading, onBan, onUnban, onDelete, getInitials, formatDate }) => {
  const isBanned  = user.status?.value === 'banned';
  const isWorking = actionLoading !== null;

  return (
    <tr className="users-row">
      <td className="col-name">
        <div className="user-info">
          <div className="user-avatar">
            {user.avatar
              ? <img src={user.avatar} alt={user.name} className="user-avatar-img" />
              : getInitials(user.name)}
          </div>
          <span className="user-name">{user.name}</span>
        </div>
      </td>
      <td className="col-email">
        <span className="user-email">{user.email}</span>
      </td>
      <td className="col-date">
        <span className="user-date">{formatDate(user.created_at)}</span>
      </td>
      <td className="col-status">
        <span className={`status-badge status-badge--${user.status?.value || 'active'}`}>
          {user.status?.label || 'نشط'}
        </span>
      </td>
      <td className="col-actions">
        <div className="action-btns">
          {role === 'admin' && (
            <button className="action-btn action-btn--delete" title="حذف المستخدم"
              onClick={() => onDelete(user.id)} disabled={isWorking}>
              {actionLoading === `${user.id}_delete`
                ? <Loader2 size={14} className="spin" /> : <Trash2 size={14} />}
            </button>
          )}
          <button className="action-btn action-btn--block" title="حظر"
            onClick={() => onBan(user.id)} disabled={isBanned || isWorking}>
            {actionLoading === `${user.id}_ban`
              ? <Loader2 size={14} className="spin" /> : <Ban size={14} />}
          </button>
          <button className="action-btn action-btn--activate" title="رفع الحظر"
            onClick={() => onUnban(user.id)} disabled={!isBanned || isWorking}>
            {actionLoading === `${user.id}_unban`
              ? <Loader2 size={14} className="spin" /> : <CheckCircle size={14} />}
          </button>
        </div>
      </td>
    </tr>
  );
};

/* ══════════════════════════════════════════
   بطاقة الموبايل
══════════════════════════════════════════ */
const UserCard = ({ user, role, actionLoading, onBan, onUnban, onDelete, getInitials, formatDate }) => {
  const isBanned  = user.status?.value === 'banned';
  const isWorking = actionLoading !== null;

  return (
    <div className="user-card">
      <div className="user-card-top">
        <div className="user-info">
          <div className="user-avatar">
            {user.avatar
              ? <img src={user.avatar} alt={user.name} className="user-avatar-img" />
              : getInitials(user.name)}
          </div>
          <div className="user-card-info">
            <span className="user-name">{user.name}</span>
            <span className="user-email">{user.email}</span>
          </div>
        </div>
        <span className={`status-badge status-badge--${user.status?.value || 'active'}`}>
          {user.status?.label || 'نشط'}
        </span>
      </div>
      <div className="user-card-bottom">
        <span className="user-date">{formatDate(user.created_at)}</span>
        <div className="action-btns">
          {role === 'admin' && (
            <button className="action-btn action-btn--delete" title="حذف"
              onClick={() => onDelete(user.id)} disabled={isWorking}>
              {actionLoading === `${user.id}_delete`
                ? <Loader2 size={14} className="spin" /> : <Trash2 size={14} />}
            </button>
          )}
          <button className="action-btn action-btn--block" title="حظر"
            onClick={() => onBan(user.id)} disabled={isBanned || isWorking}>
            {actionLoading === `${user.id}_ban`
              ? <Loader2 size={14} className="spin" /> : <Ban size={14} />}
          </button>
          <button className="action-btn action-btn--activate" title="رفع الحظر"
            onClick={() => onUnban(user.id)} disabled={!isBanned || isWorking}>
            {actionLoading === `${user.id}_unban`
              ? <Loader2 size={14} className="spin" /> : <CheckCircle size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════
   الصفحة الرئيسية
══════════════════════════════════════════ */
const Users = () => {
  const role = localStorage.getItem('role');

  const {
    users, total, hasMore, loading, loadingMore,
    error, confirmDelete, actionLoading,
    search, filterStatus, setSearch, setFilterStatus,
    handleBan, handleUnban, handleDelete, setConfirmDelete,
    sentinelRef, scrollRootRef, getInitials, formatDate,
  } = useUsers();

  return (
    <div className="users-page" ref={scrollRootRef}>

      {/* ── Header ── */}
      <div className="users-header">
        <div className="users-title-group">
          <h1 className="users-title">إدارة المستخدمين</h1>
          {total !== null && <span className="users-count">{total} مستخدم</span>}
        </div>
        <div className="users-controls">
          <select className="users-filter" value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}>
            <option value="all">الحالة: الكل</option>
            <option value="active">نشط</option>
            <option value="banned">محظور</option>
          </select>
          <div className="users-search-wrapper">
            <Search size={16} className="users-search-icon" />
            <input className="users-search" type="text"
              placeholder="ابحث عن مستخدم..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
      </div>

      {/* ── خطأ ── */}
      {error && <div className="users-error">{error}</div>}

      {/* ══ جدول Desktop ══ */}
      <div className="users-table-card">
        <table className="users-table">
          <thead>
            <tr>
              <th className="col-name">الاسم</th>
              <th className="col-email">البريد الإلكتروني</th>
              <th className="col-date">تاريخ الانضمام</th>
              <th className="col-status">الحالة</th>
              <th className="col-actions">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="users-loading">
                <Loader2 size={22} className="spin" /> جاري التحميل...
              </td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={5} className="users-empty">
                <UsersIcon size={32} className="users-empty-icon" />
                <span>لا يوجد مستخدمون مطابقون</span>
              </td></tr>
            ) : users.map(user => (
              <UserRow key={user.id} user={user} role={role}
                actionLoading={actionLoading}
                onBan={handleBan} onUnban={handleUnban}
                onDelete={setConfirmDelete}
                getInitials={getInitials} formatDate={formatDate} />
            ))}
          </tbody>
        </table>

        {!loading && !hasMore && users.length > 0 && (
          <div className="users-end">
            تم عرض جميع المستخدمين ({total ?? users.length})
          </div>
        )}
      </div>

      {/* ══ بطاقات Mobile ══ */}
      <div className="users-cards">
        {loading ? (
          <div className="users-loading-cards">
            <Loader2 size={22} className="spin" /> جاري التحميل...
          </div>
        ) : users.length === 0 ? (
          <div className="users-empty--cards">
            <UsersIcon size={32} className="users-empty-icon" />
            <span>لا يوجد مستخدمون مطابقون</span>
          </div>
        ) : users.map(user => (
          <UserCard key={user.id} user={user} role={role}
            actionLoading={actionLoading}
            onBan={handleBan} onUnban={handleUnban}
            onDelete={setConfirmDelete}
            getInitials={getInitials} formatDate={formatDate} />
        ))}

        {!loading && !hasMore && users.length > 0 && (
          <div className="users-end">
            تم عرض جميع المستخدمين ({total ?? users.length})
          </div>
        )}
      </div>

      {/*
        ══ Sentinel ══
        دائماً موجود في DOM — لا يُخفى أبداً
        الـ observer يراه دائماً ويقرر هو إذا يحمّل أم لا
        يظهر مرئياً فقط عند loadingMore
      */}
      <div ref={sentinelRef} className="users-sentinel" aria-hidden="true">
        {loadingMore && (
          <><Loader2 size={18} className="spin" /><span>جاري تحميل المزيد...</span></>
        )}
      </div>

      {/* ══ نافذة تأكيد الحذف ══ */}
      {confirmDelete && (
        <div className="confirm-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="confirm-dialog" onClick={e => e.stopPropagation()}>
            <h3 className="confirm-title">تأكيد الحذف</h3>
            <p className="confirm-text">
              هل أنت متأكد من حذف هذا المستخدم؟ هذا الإجراء لا يمكن التراجع عنه.
            </p>
            <div className="confirm-actions">
              <button className="confirm-btn confirm-btn--cancel"
                onClick={() => setConfirmDelete(null)}>إلغاء</button>
              <button className="confirm-btn confirm-btn--delete"
                onClick={() => handleDelete(confirmDelete)}
                disabled={actionLoading !== null}>
                {actionLoading ? <Loader2 size={14} className="spin" /> : 'حذف'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Users;