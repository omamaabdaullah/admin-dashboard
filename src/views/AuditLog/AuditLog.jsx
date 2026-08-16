// src/views/AuditLog/AuditLog.jsx
import { useState, useMemo } from 'react';
import {
 Search, ChevronLeft, ChevronRight,
  BarChart2, Calendar, X, ShieldX,
} from 'lucide-react';
import './AuditLog.css';

// ─── بيانات ثابتة (تُستبدل بـ API لاحقاً) ───

const AUDIT_ROWS = [
  { id: 1,  type: 'create',  typeLabel: 'إضافة وصفة',    details: 'تمت إضافة وصفة "بخاري دجاج" بنجاح',                        admin: 'أحمد العمري',  initials: 'أح', date: '2023/10/24 - 14:20' },
  { id: 2,  type: 'update',  typeLabel: 'تحديث مستخدم',  details: 'تغيير صلاحيات المستخدم (سارة خالد) إلى مشرف',              admin: 'النظام',        initials: 'S',  date: '2023/10/24 - 12:45' },
  { id: 3,  type: 'delete',  typeLabel: 'حذف منشور',     details: 'حذف تعليق مخالف للسياسات في قسم الحلويات',                  admin: 'فاطمة محمد',   initials: 'فم', date: '2023/10/24 - 11:10' },
  { id: 4,  type: 'update',  typeLabel: 'تعديل تصنيف',   details: 'تغيير صورة قسم "الأطباق الإيطالية"',                        admin: 'أحمد العمري',  initials: 'أح', date: '2023/10/24 - 09:30' },
  { id: 5,  type: 'ban',     typeLabel: 'حظر مستخدم',    details: 'حظر مستخدم مخالف "user_492"',                               admin: 'فاطمة محمد',   initials: 'فم', date: '2023/10/23 - 18:55' },
  { id: 6,  type: 'publish', typeLabel: 'نشر وصفة',      details: 'نشر وصفة "كنافة نابلسية بالجبن" بعد المراجعة',              admin: 'أحمد العمري',  initials: 'أح', date: '2023/10/23 - 16:20' },
  { id: 7,  type: 'reject',  typeLabel: 'رفض وصفة',      details: 'رفض وصفة "سلطة غريبة" بسبب محتوى غير مناسب',               admin: 'فاطمة محمد',   initials: 'فم', date: '2023/10/23 - 14:05' },
  { id: 8,  type: 'create',  typeLabel: 'إضافة وصفة',    details: 'إضافة مشرف جديد "محمد سامي" إلى النظام',                   admin: 'النظام',        initials: 'S',  date: '2023/10/23 - 11:30' },
  { id: 9,  type: 'delete',  typeLabel: 'حذف منشور',     details: 'حذف صورة مخالفة من منشور مجتمع رقم #4821',                  admin: 'أحمد العمري',  initials: 'أح', date: '2023/10/22 - 17:40' },
  { id: 10, type: 'update',  typeLabel: 'تحديث مستخدم',  details: 'إلغاء حظر المستخدم "sara_k" بعد مراجعة الشكوى',            admin: 'فاطمة محمد',   initials: 'فم', date: '2023/10/22 - 15:10' },
];

const TYPE_OPTIONS = ['الكل', 'إضافة', 'حذف', 'تعديل', 'نشر', 'رفض', 'حظر'];
const ADMIN_OPTIONS = ['الكل', 'أحمد العمري', 'فاطمة محمد', 'النظام'];
const PER_PAGE = 8;

const TYPE_MAP = {
  create:  { label: 'إضافة وصفة',   dotClass: 'dot-create',  labelClass: 'label-create'  },
  update:  { label: 'تحديث مستخدم', dotClass: 'dot-update',  labelClass: 'label-update'  },
  delete:  { label: 'حذف منشور',    dotClass: 'dot-delete',  labelClass: 'label-delete'  },
  ban:     { label: 'حظر مستخدم',   dotClass: 'dot-ban',     labelClass: 'label-ban'     },
  publish: { label: 'نشر وصفة',     dotClass: 'dot-publish', labelClass: 'label-publish' },
  reject:  { label: 'رفض وصفة',     dotClass: 'dot-reject',  labelClass: 'label-reject'  },
};

// ═══════════════════════════════════════════════════
const AuditLog = () => {
  const [search,      setSearch]      = useState('');
  const [typeFilter,  setTypeFilter]  = useState('الكل');
  const [adminFilter, setAdminFilter] = useState('الكل');
  const [dateFrom,    setDateFrom]    = useState('');
  const [dateTo,      setDateTo]      = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const handleReset = () => {
    setSearch('');
    setTypeFilter('الكل');
    setAdminFilter('الكل');
    setDateFrom('');
    setDateTo('');
    setCurrentPage(1);
  };

  const filtered = useMemo(() => {
    return AUDIT_ROWS.filter(row => {
      const matchSearch = !search ||
        row.details.includes(search) ||
        row.admin.includes(search) ||
        row.typeLabel.includes(search);
      const matchType  = typeFilter  === 'الكل' || row.typeLabel.includes(typeFilter);
      const matchAdmin = adminFilter === 'الكل' || row.admin === adminFilter;
      return matchSearch && matchType && matchAdmin;
    });
  }, [search, typeFilter, adminFilter]);

  const totalPages   = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage     = Math.min(currentPage, totalPages);
  const paginated    = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);
  const deleteCount  = AUDIT_ROWS.filter(r => r.type === 'delete' || r.type === 'reject').length;

  const goTo = (n) => setCurrentPage(Math.max(1, Math.min(totalPages, n)));

  const renderPageBtns = () => {
    const btns = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) btns.push(i);
    } else {
      btns.push(1);
      if (safePage > 3) btns.push('...');
      for (let i = Math.max(2, safePage - 1); i <= Math.min(totalPages - 1, safePage + 1); i++) btns.push(i);
      if (safePage < totalPages - 2) btns.push('...');
      btns.push(totalPages);
    }
    return btns;
  };

  return (
    <div className="audit-log">

      {/* ═══ Header ═══ */}
      <div className="audit-log-header">
        
        <div className="audit-log-title-group">
          <h1 className="audit-log-title">سجل التدقيق</h1>
       
        </div>
      </div>

      {/* ═══ Stats Row ═══ */}
      <div className="audit-stats-row">
        <div className="audit-stat-card">
          <div className="audit-stat-info">
            <span className="audit-stat-label">إجمالي العمليات</span>
            <span className="audit-stat-value">1,284</span>
          </div>
          <div className="audit-stat-icon">
            <BarChart2 size={24} />
          </div>
        </div>
        <div className="audit-stat-card">
          <div className="audit-stat-info">
            <span className="audit-stat-label">عمليات اليوم</span>
            <span className="audit-stat-value">23</span>
          </div>
          <div className="audit-stat-icon">
            <Calendar size={24} />
          </div>
        </div>
        <div className="audit-stat-card">
          <div className="audit-stat-info">
            <span className="audit-stat-label">عمليات الحذف</span>
            <span className="audit-stat-value audit-stat-value--red">{deleteCount}</span>
          </div>
          <div className="audit-stat-icon audit-stat-icon--red">
            <X size={24} />
          </div>
        </div>
      </div>

      {/* ═══ Filters ═══ */}
      <div className="audit-filters-card">
        <div className="audit-filters-row">

          <button className="audit-reset-btn" onClick={handleReset}>
            إعادة تعيين
          </button>

          <div className="audit-filter-group">
            <span className="audit-filter-label">الفترة الزمنية</span>
            <div className="audit-date-range">
              <input
                className="audit-date-input"
                type="date"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
              />
              <span className="audit-date-sep">إلى</span>
              <input
                className="audit-date-input"
                type="date"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
              />
            </div>
          </div>

          <div className="audit-filter-group">
            <span className="audit-filter-label">المشرف</span>
            <select
              className="audit-select"
              value={adminFilter}
              onChange={e => { setAdminFilter(e.target.value); setCurrentPage(1); }}
            >
              {ADMIN_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>

          <div className="audit-filter-group">
            <span className="audit-filter-label">نوع العملية</span>
            <select
              className="audit-select"
              value={typeFilter}
              onChange={e => { setTypeFilter(e.target.value); setCurrentPage(1); }}
            >
              {TYPE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>

          <div className="audit-filter-group audit-filter-group--search">
            <span className="audit-filter-label">بحث نصي</span>
            <div className="audit-search-wrap">
              <input
                className="audit-search-input"
                type="text"
                placeholder="ابحث بالمشرف أو التفاصيل..."
                value={search}
                onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
              />
              <Search size={18} color="#59413D" />
            </div>
          </div>

        </div>
      </div>

      {/* ═══ Table ═══ */}
      <div className="audit-table-card">
        <table className="audit-table">
          <thead>
            <tr>
              <th style={{ width: '15%' }}>النوع</th>
              <th style={{ width: '40%' }}>التفاصيل</th>
              <th style={{ width: '18%' }}>المشرف</th>
              <th style={{ width: '17%' }}>التاريخ والوقت</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: 0, border: 'none' }}>
                  <div className="audit-empty">
                    <ShieldX size={48} className="audit-empty-icon" />
                    <p className="audit-empty-title">لا توجد عمليات مطابقة</p>
                    <p className="audit-empty-sub">جرّب تغيير معايير البحث أو الفلاتر</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginated.map(row => {
                const meta = TYPE_MAP[row.type] || { label: row.typeLabel, dotClass: 'dot-update', labelClass: 'label-update' };
                return (
                  <tr key={row.id}>
                    <td>
                      <div className="audit-type-cell">
                        <span className={`audit-type-dot ${meta.dotClass}`} />
                        <span className={`audit-type-label ${meta.labelClass}`}>{row.typeLabel}</span>
                      </div>
                    </td>
                    <td>
                      <div className="audit-details-cell">{row.details}</div>
                    </td>
                    <td>
                      <div className="audit-admin-cell">
  <div className="audit-avatar">{row.initials}</div>
  <span className="audit-admin-name">{row.admin}</span>
</div>
                    </td>
                    <td>
                      <div className="audit-date-cell">{row.date}</div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* ═══ Pagination ═══ */}
        {filtered.length > 0 && (
          <div className="audit-pagination">
            <div className="audit-pagination-btns">
              <button className="pg-btn" onClick={() => goTo(safePage + 1)} disabled={safePage === totalPages}>
                <ChevronRight size={14} />
              </button>
              {renderPageBtns().map((n, i) =>
                n === '...'
                  ? <span key={`dots-${i}`} className="pg-btn dots">...</span>
                  : <button
                      key={n}
                      className={`pg-btn${safePage === n ? ' active' : ''}`}
                      onClick={() => goTo(n)}
                    >{n}</button>
              )}
              <button className="pg-btn" onClick={() => goTo(safePage - 1)} disabled={safePage === 1}>
                <ChevronLeft size={14} />
              </button>
            </div>
            <span className="audit-pagination-info">
              عرض {Math.min(paginated.length, PER_PAGE)} من أصل {filtered.length} عملية
            </span>
          </div>
        )}
      </div>

    </div>
  );
};

export default AuditLog;