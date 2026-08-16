// src/views/Employees/Employees.jsx
import { useState } from 'react';
import {
  Search, Trash2, Eye, Plus,
  ShieldCheck, Loader2, X, Lock, Mail, User,
} from 'lucide-react';
import { useEmployees } from '../../controllers/useEmployees';
import './Employees.css';

/* ══════════════════════════════════════════
   بطاقة الموظف
══════════════════════════════════════════ */
const EmployeeCard = ({ employee, onView, onDelete, getInitials, getRoleLabel }) => (
  <div className="emp-card">
    <div className="emp-card-header">
      <div className="emp-card-identity">
        <div className="emp-card-info">
          <span className="emp-card-name">{employee.name}</span>
          <span className="emp-role-badge">{getRoleLabel(employee.role)}</span>
        </div>
        <div className="emp-avatar">{getInitials(employee.name)}</div>
      </div>
    </div>

    <div className="emp-card-details">
      <div className="emp-detail-row">
        <span className="emp-detail-label">{employee.email}</span>
      </div>
     
    </div>

    <div className="emp-card-footer">
      <button className="emp-btn emp-btn--view" onClick={() => onView(employee)}>
        <Eye size={16} /> عرض
      </button>
      <button className="emp-btn emp-btn--delete" onClick={() => onDelete(employee.id)}>
        <Trash2 size={14} /> حذف
      </button>
    </div>
  </div>
);

/* ══════════════════════════════════════════
   مودال إضافة موظف
══════════════════════════════════════════ */
const AddEmployeeModal = ({ onClose, onAdd, loading, error, onClearError }) => {
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onAdd({ name, email, password, confirm });
  };

  return (
    <div className="emp-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="emp-modal">
        <div className="emp-modal-header">
          <button className="emp-modal-close" onClick={onClose}><X size={18} /></button>
          <h2 className="emp-modal-title">إضافة موظف جديد</h2>
        </div>

        {error && (
          <div className="emp-modal-error" onClick={onClearError}>{error}</div>
        )}

        <form className="emp-modal-form" onSubmit={handleSubmit}>
          <div className="emp-field">
            <label className="emp-field-label">الاسم الكامل</label>
            <div className="emp-field-wrapper">
              <input className="emp-field-input" type="text" placeholder="محمد أحمد"
                value={name} onChange={e => setName(e.target.value)} required />
              <User size={16} className="emp-field-icon" />
            </div>
          </div>

          <div className="emp-field">
            <label className="emp-field-label">البريد الإلكتروني</label>
            <div className="emp-field-wrapper">
              <input className="emp-field-input" type="email" placeholder="employee@savorai.com"
                value={email} onChange={e => setEmail(e.target.value)} required />
              <Mail size={16} className="emp-field-icon" />
            </div>
          </div>

          <div className="emp-field">
            <label className="emp-field-label">كلمة المرور</label>
            <div className="emp-field-wrapper">
              <input className="emp-field-input" type="password" placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)} required minLength={8} />
              <Lock size={16} className="emp-field-icon" />
            </div>
          </div>

          <div className="emp-field">
            <label className="emp-field-label">تأكيد كلمة المرور</label>
            <div className="emp-field-wrapper">
              <input className="emp-field-input" type="password" placeholder="••••••••"
                value={confirm} onChange={e => setConfirm(e.target.value)} required minLength={8} />
              <Lock size={16} className="emp-field-icon" />
            </div>
          </div>

          <div className="emp-modal-actions">
            <button type="button" className="emp-modal-btn emp-modal-btn--cancel"
              onClick={onClose} disabled={loading}>إلغاء</button>
            <button type="submit" className="emp-modal-btn emp-modal-btn--submit" disabled={loading}>
              {loading ? <Loader2 size={16} className="spin" /> : <Plus size={16} />}
              {loading ? 'جاري الإنشاء...' : 'إضافة موظف'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════
   مودال تفاصيل الموظف
══════════════════════════════════════════ */
const ViewEmployeeModal = ({ employee, onClose, getInitials, getRoleLabel,  formatDate }) => (
  <div className="emp-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
    <div className="emp-modal emp-modal--view">
      <div className="emp-modal-header">
        <button className="emp-modal-close" onClick={onClose}><X size={18} /></button>
        <h2 className="emp-modal-title">تفاصيل الموظف</h2>
      </div>

      <div className="emp-view-body">
        <div className="emp-view-avatar">{getInitials(employee.name)}</div>
        <div className="emp-view-name">{employee.name}</div>
        <span className="emp-role-badge emp-role-badge--lg">{getRoleLabel(employee.role)}</span>

        <div className="emp-view-rows">
          <div className="emp-view-row">
            <span className="emp-view-val">{employee.email}</span>
            <span className="emp-view-key">البريد الإلكتروني</span>
          </div>
          <div className="emp-view-row">
            <span className="emp-view-val">{formatDate(employee.created_at)}</span>
            <span className="emp-view-key">تاريخ الانضمام</span>
          </div>
         
        </div>
      </div>

      <div className="emp-modal-actions">
        <button className="emp-modal-btn emp-modal-btn--cancel" onClick={onClose}>إغلاق</button>
      </div>
    </div>
  </div>
);

/* ══════════════════════════════════════════
   مودال تأكيد الحذف
══════════════════════════════════════════ */
const ConfirmDeleteModal = ({ onClose, onConfirm, loading }) => (
  <div className="emp-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
    <div className="emp-modal emp-modal--confirm">
      <h3 className="emp-modal-title">تأكيد الحذف</h3>
      <p className="emp-confirm-text">
        هل أنت متأكد من حذف هذا الموظف؟ سيتم إلغاء جميع صلاحياته وهذا الإجراء لا يمكن التراجع عنه.
      </p>
      <div className="emp-modal-actions">
        <button className="emp-modal-btn emp-modal-btn--cancel"
          onClick={onClose} disabled={loading}>إلغاء</button>
        <button className="emp-modal-btn emp-modal-btn--delete"
          onClick={onConfirm} disabled={loading}>
          {loading ? <Loader2 size={14} className="spin" /> : <Trash2 size={14} />}
          حذف
        </button>
      </div>
    </div>
  </div>
);

/* ══════════════════════════════════════════
   الصفحة الرئيسية — View نظيف 100%
══════════════════════════════════════════ */
const Employees = () => {
  const {
    employees, total, hasMore, loading, loadingMore,
    error, deleteLoading, addLoading, addError,
    search, showAdd, viewEmployee, confirmDelete,
    setSearch, setShowAdd, setViewEmployee, setConfirmDelete, setAddError,
    handleAdd, handleDelete,
    sentinelRef, scrollRootRef,
    getInitials, formatDate, getRoleLabel, getPermissions,
  } = useEmployees();

  return (
    <div className="emp-page" ref={scrollRootRef}>

      {/* ── Header ── */}
      <div className="emp-header">
        <div className="emp-header-title-group">
          <h1 className="emp-title">إدارة الموظفين</h1>
    
        </div>
        <button className="emp-add-btn" onClick={() => setShowAdd(true)}>
          <Plus size={16} /> إضافة موظف 
        </button>
      </div>

      {/* ── شريط البحث ── */}
      <div className="emp-search-bar">
        <div className="emp-search-wrapper">
          <input className="emp-search" type="text"
            placeholder="البحث عن موظف بالاسم أو البريد..."
            value={search} onChange={e => setSearch(e.target.value)} />
          <Search size={18} className="emp-search-icon" />
        </div>
        {total !== null && <span className="emp-total-badge">{total} موظف</span>}
      </div>

      {/* ── خطأ ── */}
      {error && <div className="emp-error">{error}</div>}

      {/* ── المحتوى ── */}
      {loading ? (
        <div className="emp-loading">
          <Loader2 size={28} className="spin" />
          <span>جاري التحميل...</span>
        </div>
      ) : employees.length === 0 ? (
        <div className="emp-empty">
          <ShieldCheck size={40} />
          <span>لا يوجد موظفون مطابقون</span>
        </div>
      ) : (
        <div className="emp-grid">
          {employees.map(emp => (
            <EmployeeCard
              key={emp.id}
              employee={emp}
              onView={setViewEmployee}
              onDelete={setConfirmDelete}
              getInitials={getInitials}
              getRoleLabel={getRoleLabel}
            
            />
          ))}
        </div>
      )}

      {/* ── نهاية القائمة ── */}
      {!loading && !hasMore && employees.length > 0 && (
        <div className="emp-end">تم عرض جميع الموظفين ({total ?? employees.length})</div>
      )}

      {/* ── Sentinel دائم في DOM ── */}
      <div ref={sentinelRef} className="emp-sentinel" aria-hidden="true">
        {loadingMore && (
          <><Loader2 size={18} className="spin" /><span>جاري تحميل المزيد...</span></>
        )}
      </div>

      {/* ── المودالات ── */}
      {showAdd && (
        <AddEmployeeModal
          onClose={() => { setShowAdd(false); setAddError(''); }}
          onAdd={handleAdd}
          loading={addLoading}
          error={addError}
          onClearError={() => setAddError('')}
        />
      )}

      {viewEmployee && (
        <ViewEmployeeModal
          employee={viewEmployee}
          onClose={() => setViewEmployee(null)}
          getInitials={getInitials}
          getRoleLabel={getRoleLabel}
          getPermissions={getPermissions}
          formatDate={formatDate}
        />
      )}

      {confirmDelete && (
        <ConfirmDeleteModal
          onClose={() => setConfirmDelete(null)}
          onConfirm={() => handleDelete(confirmDelete)}
          loading={deleteLoading}
        />
      )}

    </div>
  );
};

export default Employees;