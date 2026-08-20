// src/views/AuditLog/AuditLog.jsx
import {
  Search, ChevronLeft, ChevronRight,
  BarChart2, Calendar, X, ShieldX, Loader2,
} from 'lucide-react';
import { useAuditLog } from '../../controllers/useAuditLog';
import './AuditLog.css';

const fmt = (n) => Number(n ?? 0).toLocaleString('en-US');

const AuditRowCard = ({ row }) => (
  <div className="audit-card">
    <div className="audit-card-top">
      <div className="audit-type-cell">
        <span className={`audit-type-dot ${row.dotClass}`} />
        <span className={`audit-type-label ${row.labelClass}`}>{row.typeLabel}</span>
      </div>
    </div>
    <p className="audit-card-details">{row.details}</p>
    <div className="audit-card-admin">
      <div className="audit-avatar">
        {row.avatar
          ? <img src={row.avatar} alt="" className="audit-avatar-img" />
          : row.initials}
      </div>
      <span className="audit-admin-name">{row.admin}</span>
    </div>
    <span className="audit-card-date">{row.date}</span>
  </div>
);

const AuditLog = () => {
  const {
    rows, stats, actionTypes, admins, meta,
    loading, error,
    search, setSearch,
    action, setAction,
    userId, setUserId,
    dateFrom, setDateFrom,
    dateTo, setDateTo,
    page, setPage, goTo,
    handleReset,
  } = useAuditLog();

  const lastPage = meta.lastPage || 1;

  const renderPageBtns = () => {
    const btns = [];
    if (lastPage <= 5) {
      for (let i = 1; i <= lastPage; i++) btns.push(i);
    } else {
      btns.push(1);
      if (page > 3) btns.push('...');
      for (let i = Math.max(2, page - 1); i <= Math.min(lastPage - 1, page + 1); i++) btns.push(i);
      if (page < lastPage - 2) btns.push('...');
      btns.push(lastPage);
    }
    return btns;
  };

  return (
    <div className="audit-log">

      <div className="audit-log-header">
        <div className="audit-log-title-group">
          <h1 className="audit-log-title">سجل التدقيق</h1>
        </div>
      </div>

      <div className="audit-stats-row">
        <div className="audit-stat-card">
          <div className="audit-stat-info">
            <span className="audit-stat-label">إجمالي العمليات</span>
            <span className="audit-stat-value">{fmt(stats.total)}</span>
          </div>
          <div className="audit-stat-icon">
            <BarChart2 size={24} />
          </div>
        </div>
        <div className="audit-stat-card">
          <div className="audit-stat-info">
            <span className="audit-stat-label">عمليات اليوم</span>
            <span className="audit-stat-value">{fmt(stats.today)}</span>
          </div>
          <div className="audit-stat-icon">
            <Calendar size={24} />
          </div>
        </div>
        <div className="audit-stat-card">
          <div className="audit-stat-info">
            <span className="audit-stat-label">عمليات الحذف</span>
            <span className="audit-stat-value audit-stat-value--red">{fmt(stats.deletes)}</span>
          </div>
          <div className="audit-stat-icon audit-stat-icon--red">
            <X size={24} />
          </div>
        </div>
      </div>

      <div className="audit-filters-card">
        <div className="audit-filters-row">

          <button type="button" className="audit-reset-btn" onClick={handleReset}>
            إعادة تعيين
          </button>

         <div className="audit-filter-group">
  <span className="audit-filter-label">الفترة الزمنية</span>
  <div className="audit-date-range">
    <input
      className="audit-date-input"
      type="date"
      value={dateFrom}
      onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
    />
    <span className="audit-date-sep">إلى</span>
    <input
      className="audit-date-input"
      type="date"
      value={dateTo}
      onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
    />
  </div>
</div>

          <div className="audit-filter-group">
            <span className="audit-filter-label">المشرف</span>
            <select
              className="audit-select"
              value={userId}
              onChange={(e) => { setUserId(e.target.value); setPage(1); }}
            >
              <option value="">الكل</option>
              {admins.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>

          <div className="audit-filter-group">
            <span className="audit-filter-label">نوع العملية</span>
            <select
              className="audit-select"
              value={action}
              onChange={(e) => { setAction(e.target.value); setPage(1); }}
            >
              <option value="">الكل</option>
              {actionTypes.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
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
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
              <Search size={18} color="#59413D" />
            </div>
          </div>

        </div>
      </div>

      {error && <div className="audit-error">{error}</div>}

      <div className="audit-table-card">
        <div className="audit-table-desktop">
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
            {loading ? (
              <tr>
                <td colSpan={4} style={{ padding: 0, border: 'none' }}>
                  <div className="audit-empty">
                    <Loader2 size={28} className="audit-spin" />
                    <p className="audit-empty-title">جاري التحميل...</p>
                  </div>
                </td>
              </tr>
            ) : rows.length === 0 ? (
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
              rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <div className="audit-type-cell">
                      <span className={`audit-type-dot ${row.dotClass}`} />
                      <span className={`audit-type-label ${row.labelClass}`}>{row.typeLabel}</span>
                    </div>
                  </td>
                  <td>
                    <div className="audit-details-cell">{row.details}</div>
                  </td>
                  <td>
                    <div className="audit-admin-cell">
                      <div className="audit-avatar">
                        {row.avatar
                          ? <img src={row.avatar} alt="" className="audit-avatar-img" />
                          : row.initials}
                      </div>
                      <span className="audit-admin-name">{row.admin}</span>
                    </div>
                  </td>
                  <td>
                    <div className="audit-date-cell">{row.date}</div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>

        <div className="audit-cards-mobile">
          {loading ? (
            <div className="audit-empty">
              <Loader2 size={28} className="audit-spin" />
              <p className="audit-empty-title">جاري التحميل...</p>
            </div>
          ) : rows.length === 0 ? (
            <div className="audit-empty">
              <ShieldX size={48} className="audit-empty-icon" />
              <p className="audit-empty-title">لا توجد عمليات مطابقة</p>
              <p className="audit-empty-sub">جرّب تغيير معايير البحث أو الفلاتر</p>
            </div>
          ) : (
            rows.map((row) => <AuditRowCard key={row.id} row={row} />)
          )}
        </div>

        {!loading && meta.total > 0 && (
          <div className="audit-pagination">
            <div className="audit-pagination-btns">
              <button
                type="button"
                className="pg-btn"
                onClick={() => goTo(page + 1)}
                disabled={page === lastPage}
              >
                <ChevronRight size={14} />
              </button>
              {renderPageBtns().map((n, i) =>
                n === '...'
                  ? <span key={`dots-${i}`} className="pg-btn dots">...</span>
                  : (
                    <button
                      key={n}
                      type="button"
                      className={`pg-btn${page === n ? ' active' : ''}`}
                      onClick={() => goTo(n)}
                    >
                      {n}
                    </button>
                  )
              )}
              <button
                type="button"
                className="pg-btn"
                onClick={() => goTo(page - 1)}
                disabled={page === 1}
              >
                <ChevronLeft size={14} />
              </button>
            </div>
            <span className="audit-pagination-info">
              عرض {rows.length} من أصل {fmt(meta.total)} عملية
            </span>
          </div>
        )}
      </div>

    </div>
  );
};

export default AuditLog;