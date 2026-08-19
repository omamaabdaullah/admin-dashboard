// src/views/Users/Users.jsx
import { Search, Trash2, Ban, CheckCircle, Loader2, Users as UsersIcon, ChevronRight, ChevronLeft } from 'lucide-react';
import { useUsers } from '../../controllers/useUsers';
import BanUserModal from '../../components/BanUserModal';
import './Users.css';

const UserRow = ({ user, actionLoading, onBan, onUnban, onDelete, getInitials, formatDate }) => {
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
          <button className="action-btn action-btn--delete" title="حذف المستخدم"
            onClick={() => onDelete(user.id)} disabled={isWorking}>
            {actionLoading === `${user.id}_delete`
              ? <Loader2 size={14} className="spin" /> : <Trash2 size={14} />}
          </button>
          <button className="action-btn action-btn--block" title="حظر"
            onClick={() => onBan(user)} disabled={isBanned || isWorking}>
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

const UserCard = ({ user, actionLoading, onBan, onUnban, onDelete, getInitials, formatDate }) => {
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
          <button className="action-btn action-btn--delete" title="حذف"
            onClick={() => onDelete(user.id)} disabled={isWorking}>
            {actionLoading === `${user.id}_delete`
              ? <Loader2 size={14} className="spin" /> : <Trash2 size={14} />}
          </button>
          <button className="action-btn action-btn--block" title="حظر"
            onClick={() => onBan(user)} disabled={isBanned || isWorking}>
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

const Users = () => {
  const {
    users, meta, total, loading,
    error, confirmDelete, confirmBan, actionLoading,
    search, filterStatus, page,
    setSearch, setFilterStatus,
    handleBan, handleUnban, handleDelete,
    setConfirmDelete, setConfirmBan,
    handlePageChange,
    getInitials, formatDate,
  } = useUsers();

  const lastPage = meta?.last_page ?? 1;

  return (
    <div className="users-page">

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

      {error && <div className="users-error">{error}</div>}

      {/* Desktop table */}
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
              <UserRow key={user.id} user={user}
                actionLoading={actionLoading}
                onBan={setConfirmBan} onUnban={handleUnban}
                onDelete={setConfirmDelete}
                getInitials={getInitials} formatDate={formatDate} />
            ))}
          </tbody>
        </table>

        {!loading && users.length > 0 && lastPage > 1 && (
          <div className="users-pagination">
            <button
              className="users-page-btn"
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
            >
              <ChevronRight size={16} />
              <span className="users-page-btn-text">السابق</span>
            </button>
            <span className="users-page-info">
              صفحة {page} من {lastPage}
            </span>
            <button
              className="users-page-btn"
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= lastPage}
            >
              <span className="users-page-btn-text">التالي</span>
              <ChevronLeft size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Mobile cards */}
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
          <UserCard key={user.id} user={user}
            actionLoading={actionLoading}
            onBan={setConfirmBan} onUnban={handleUnban}
            onDelete={setConfirmDelete}
            getInitials={getInitials} formatDate={formatDate} />
        ))}

        {!loading && users.length > 0 && lastPage > 1 && (
          <div className="users-pagination">
            <button
              className="users-page-btn"
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
            >
              <ChevronRight size={16} />
              <span className="users-page-btn-text">السابق</span>
            </button>
            <span className="users-page-info">
              صفحة {page} من {lastPage}
            </span>
            <button
              className="users-page-btn"
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= lastPage}
            >
              <span className="users-page-btn-text">التالي</span>
              <ChevronLeft size={16} />
            </button>
          </div>
        )}
      </div>

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

      {confirmBan && (
        <BanUserModal
          user={confirmBan}
          onConfirm={handleBan}
          onClose={() => setConfirmBan(null)}
          loading={actionLoading === `${confirmBan.id}_ban`}
        />
      )}

    </div>
  );
};

export default Users;
