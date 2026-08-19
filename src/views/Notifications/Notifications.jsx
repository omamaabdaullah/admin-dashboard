// src/views/Notifications/Notifications.jsx
import { useState, useEffect, useCallback } from 'react';
import { Bell, Trash2, Download, Loader2, ChevronRight, ChevronLeft, Search, X } from 'lucide-react';
import {
  fetchSentNotifications,
  sendNotification,
  deleteSentNotification,
} from '../../models/notificationsModel';
import { fetchClients, fetchAllClients, fetchClientGroup } from '../../models/usersModel';
import './Notifications.css';

const RECIPIENT_OPTIONS = [
  { key: 'all',      label: 'كل المستخدمين' },
  { key: 'specific', label: 'مستخدم محدد'   },
];

const USER_GROUPS = [
  { key: 'active', label: 'كل العملاء النشطين' },
  { key: 'new7',   label: 'جدد آخر 7 أيام' },
  { key: 'new30',  label: 'جدد آخر 30 يومًا' },
];

const RECIPIENT_COLORS = {
  all:      { bg: '#FFE9E6', color: '#9E2016' },
  specific: { bg: '#FFE9E6', color: '#9E2016' },
};

const STATUS_CONFIG = {
  sent:    { label: 'تم الإرسال',   bg: '#F0FDF4', color: '#16A34A' },
  sending: { label: 'جاري الإرسال', bg: '#FEF5ED', color: '#E67E22' },
  failed:  { label: 'فشل الإرسال', bg: '#FFF0EE', color: '#C0392B' },
};

/* ─── صف الإشعار ─── */
const NotifRow = ({ notif, onDelete, deleteLoading }) => {
  const status = STATUS_CONFIG[notif.status] ?? STATUS_CONFIG.sent;
  const recip  = RECIPIENT_COLORS[notif.recipientType] ?? RECIPIENT_COLORS.all;

  return (
    <tr className="notif-row">
      <td className="ncol-actions">
        <button
          className="notif-delete-btn"
          onClick={() => onDelete(notif.id)}
          disabled={deleteLoading === notif.id}
          title="حذف الإشعار"
        >
          {deleteLoading === notif.id
            ? <Loader2 size={16} className="notif-spin" />
            : <Trash2 size={16} />}
        </button>
      </td>
      <td className="ncol-status">
        <span className="notif-status-pill" style={{ background: status.bg, color: status.color }}>
          {status.label}
        </span>
      </td>
      <td className="ncol-date">
        <span className="notif-date">{notif.date}</span>
      </td>
      <td className="ncol-recipients">
        <span className="notif-recip-pill" style={{ background: recip.bg, color: recip.color }}>
          {notif.recipients}
        </span>
      </td>
      <td className="ncol-title">
        <span className="notif-title-text">{notif.title}</span>
      </td>
    </tr>
  );
};

/* ─── بطاقة الإشعار (موبايل) ─── */
const NotifCard = ({ notif, onDelete, deleteLoading }) => {
  const status = STATUS_CONFIG[notif.status] ?? STATUS_CONFIG.sent;
  const recip  = RECIPIENT_COLORS[notif.recipientType] ?? RECIPIENT_COLORS.all;

  return (
    <div className="notif-card">
      <div className="notif-card-top">
        <span className="notif-title-text">{notif.title}</span>
        <button
          className="notif-delete-btn"
          onClick={() => onDelete(notif.id)}
          disabled={deleteLoading === notif.id}
          title="حذف الإشعار"
        >
          {deleteLoading === notif.id
            ? <Loader2 size={16} className="notif-spin" />
            : <Trash2 size={16} />}
        </button>
      </div>
      <div className="notif-card-meta">
        <span className="notif-recip-pill" style={{ background: recip.bg, color: recip.color }}>
          {notif.recipients}
        </span>
        <span className="notif-status-pill" style={{ background: status.bg, color: status.color }}>
          {status.label}
        </span>
      </div>
      <span className="notif-date">{notif.date}</span>
    </div>
  );
};

/* ─── الصفحة الرئيسية ─── */
const Notifications = () => {
  /* ── فورم الإرسال ── */
  const [recipientType, setRecipientType] = useState('all');
  const [notifTitle,    setNotifTitle]    = useState('');
  const [notifBody,     setNotifBody]     = useState('');
  const [usersSearch,   setUsersSearch]   = useState('');
  const [userOptions,   setUserOptions]   = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [appliedGroup,  setAppliedGroup]  = useState(null);
  const [groupUsers,    setGroupUsers]    = useState([]);
  const [excludedIds,   setExcludedIds]   = useState([]);
  const [groupLoading,  setGroupLoading]  = useState(false);
  const [allActiveCache, setAllActiveCache] = useState(null);
  const [usersLoading,  setUsersLoading]  = useState(false);
  const [sendLoading,   setSendLoading]   = useState(false);
  const [sendSuccess,   setSendSuccess]   = useState(false);
  const [sendError,     setSendError]     = useState('');

  /* ── السجل ── */
  const [notifications, setNotifications] = useState([]);
  const [pageMeta,      setPageMeta]      = useState(null);
  const [currentPage,   setCurrentPage]   = useState(1);
  const [listLoading,   setListLoading]   = useState(true);
  const [listError,     setListError]     = useState('');
  const [deleteLoading, setDeleteLoading] = useState(null);

  /* ── تحميل السجل ── */
  const loadLog = useCallback(async (page = 1) => {
    setListLoading(true);
    setListError('');
    try {
      const result = await fetchSentNotifications({ page });
      setNotifications(result.data);
      setPageMeta(result.meta);
      setCurrentPage(result.meta?.current_page ?? page);
    } catch {
      setListError('فشل تحميل سجل الإشعارات');
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => { loadLog(1); }, [loadLog]);

  useEffect(() => {
    if (recipientType !== 'specific') return undefined;

    let cancelled = false;
    setUsersLoading(true);

    const timer = setTimeout(async () => {
      try {
        const result = await fetchClients({
          page: 1,
          perPage: 30,
          search: usersSearch.trim(),
          status: 'active',
        });
        if (!cancelled) {
          setUserOptions(result.data ?? []);
        }
      } catch {
        if (!cancelled) {
          setUserOptions([]);
        }
      } finally {
        if (!cancelled) {
          setUsersLoading(false);
        }
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [recipientType, usersSearch]);

  const groupUserIds = groupUsers.map((user) => user.id);
  const extraUsers = selectedUsers.filter((user) => !groupUserIds.includes(user.id));
  const effectiveUsers = [
    ...groupUsers.filter((user) => !excludedIds.includes(user.id)),
    ...extraUsers,
  ];

  const isUserSelected = useCallback((userId) => {
    const inGroup = groupUserIds.includes(userId) && !excludedIds.includes(userId);
    const inManual = selectedUsers.some((user) => user.id === userId);
    return inGroup || inManual;
  }, [groupUserIds, excludedIds, selectedUsers]);

  const resetSpecificSelection = useCallback(() => {
    setUsersSearch('');
    setSelectedUsers([]);
    setUserOptions([]);
    setAppliedGroup(null);
    setGroupUsers([]);
    setExcludedIds([]);
  }, []);

  const toggleUserSelection = useCallback((user) => {
    if (groupUsers.some((g) => g.id === user.id)) {
      setExcludedIds((prev) => (
        prev.includes(user.id)
          ? prev.filter((id) => id !== user.id)
          : [...prev, user.id]
      ));
    } else {
      setSelectedUsers((prev) => {
        const exists = prev.some((u) => u.id === user.id);
        if (exists) return prev.filter((u) => u.id !== user.id);
        return [...prev, user];
      });
    }
    setSendError('');
  }, [groupUsers]);

  const removeSelectedUser = useCallback((userId) => {
    setSelectedUsers((prev) => prev.filter((u) => u.id !== userId));
  }, []);

  const clearAppliedGroup = useCallback(() => {
    setAppliedGroup(null);
    setGroupUsers([]);
    setExcludedIds([]);
  }, []);

  const applyGroup = useCallback(async (groupKey) => {
    if (appliedGroup === groupKey) {
      clearAppliedGroup();
      return;
    }

    setGroupLoading(true);
    setSendError('');
    try {
      const cached = allActiveCache ?? await fetchAllClients({ status: 'active' });
      if (!allActiveCache) setAllActiveCache(cached);
      const users = await fetchClientGroup(groupKey, cached);
      setAppliedGroup(groupKey);
      setGroupUsers(users);
      setExcludedIds([]);
      if (users.length === 0) {
        setAppliedGroup(null);
        setGroupUsers([]);
        setSendError('لا يوجد مستخدمون في هذه الفئة حالياً');
      }
    } catch {
      setSendError('فشل تحميل مستخدمي الفئة، يرجى المحاولة مرة أخرى');
    } finally {
      setGroupLoading(false);
    }
  }, [appliedGroup, allActiveCache, clearAppliedGroup]);

  /* ── إرسال ── */
  const handleSend = async () => {
    if (!notifTitle.trim() || !notifBody.trim()) {
      setSendError('يرجى تعبئة العنوان ونص الرسالة');
      return;
    }
    if (recipientType === 'specific' && effectiveUsers.length === 0) {
      setSendError('يرجى اختيار فئة أو مستخدم واحد على الأقل');
      return;
    }
    setSendLoading(true);
    setSendError('');
    try {
      await sendNotification({
        recipientType,
        userIds: effectiveUsers.map((u) => u.id),
        title:   notifTitle,
        message: notifBody,
      });
      setNotifTitle('');
      setNotifBody('');
      setRecipientType('all');
      resetSpecificSelection();
      setSendSuccess(true);
      setTimeout(() => setSendSuccess(false), 2500);
      await loadLog(1);
    } catch {
      setSendError('فشل الإرسال، يرجى المحاولة مرة أخرى');
    } finally {
      setSendLoading(false);
    }
  };

  /* ── حذف ── */
  const handleDelete = async (id) => {
    setDeleteLoading(id);
    try {
      await deleteSentNotification(id);
      const newPage = notifications.length === 1 && currentPage > 1
        ? currentPage - 1
        : currentPage;
      await loadLog(newPage);
    } catch {
      // تجاهل — السجل يُعاد تحميله عند النجاح فقط
    } finally {
      setDeleteLoading(null);
    }
  };

  /* ── تحميل CSV ── */
  const handleDownload = () => {
    if (notifications.length === 0) return;
    const rows = ['العنوان,المستلمون,التاريخ,الحالة'];
    notifications.forEach((n) => {
      const st = STATUS_CONFIG[n.status]?.label ?? n.status;
      rows.push(`"${n.title}","${n.recipients}","${n.date}","${st}"`);
    });
    const csvContent = `\uFEFF${rows.join('\n')}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'notifications.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalPages = pageMeta?.last_page ?? 1;

  return (
    <div className="notif-page">

      {/* ═══ العنوان ═══ */}
      <div className="notif-page-header">
        <h1 className="notif-page-title">إدارة الإشعارات</h1>
      </div>

      {/* ═══ القسمان الرئيسيان ═══ */}
      <div className="notif-bento">

        {/* ── القسم الأيمن: إرسال إشعار ── */}
        <div className="notif-send-card">
          <div className="notif-card-title-row">
            <Bell size={16} className="notif-card-title-icon" />
            <h2 className="notif-card-title">إرسال إشعار جديد</h2>
          </div>

          <div className="notif-form">

            {/* المستلمون */}
            <div className="notif-field">
              <label className="notif-label">المستلمون</label>
              <div className="notif-recipients-grid">
                {RECIPIENT_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    className={`notif-recip-btn${recipientType === opt.key ? ' notif-recip-btn--active' : ''}`}
                    onClick={() => {
                      setRecipientType(opt.key);
                      if (opt.key !== 'specific') resetSpecificSelection();
                    }}
                    disabled={sendLoading}
                  >
                    <span className={`notif-recip-radio${recipientType === opt.key ? ' notif-recip-radio--active' : ''}`} />
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* اختيار مستخدمين محددين */}
            {recipientType === 'specific' && (
              <div className="notif-specific-box">
                <div className="notif-field">
                  <label className="notif-label">فئات جاهزة</label>
                  <div className="notif-groups">
                    {USER_GROUPS.map((group) => (
                      <button
                        key={group.key}
                        type="button"
                        className={`notif-group-btn${appliedGroup === group.key ? ' notif-group-btn--active' : ''}`}
                        onClick={() => applyGroup(group.key)}
                        disabled={sendLoading || groupLoading}
                      >
                        {group.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="notif-field">
                  <label className="notif-label">أو اختر أفراداً</label>
                  <div className="notif-user-search-wrap">
                    <Search size={16} className="notif-user-search-icon" />
                    <input
                      className="notif-input notif-input--with-icon"
                      type="text"
                      placeholder="ابحث بالاسم أو البريد الإلكتروني..."
                      value={usersSearch}
                      onChange={(e) => setUsersSearch(e.target.value)}
                      disabled={sendLoading || groupLoading}
                    />
                  </div>
                </div>

                {(appliedGroup || extraUsers.length > 0) && (
                  <div className="notif-selected-users">
                    {appliedGroup && (
                      <button
                        type="button"
                        className="notif-selected-chip notif-selected-chip--group"
                        onClick={clearAppliedGroup}
                        disabled={sendLoading || groupLoading}
                        title="إزالة الفئة"
                      >
                        <X size={12} />
                        <span>
                          {USER_GROUPS.find((g) => g.key === appliedGroup)?.label}
                          {' · '}
                          {groupUsers.length - excludedIds.length}
                          {excludedIds.length > 0 ? ` من ${groupUsers.length}` : ''}
                        </span>
                      </button>
                    )}
                    {extraUsers.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        className="notif-selected-chip"
                        onClick={() => removeSelectedUser(user.id)}
                        disabled={sendLoading}
                        title="إزالة المستخدم"
                      >
                        <X size={12} />
                        <span>{user.name}</span>
                      </button>
                    ))}
                  </div>
                )}

                {groupLoading ? (
                  <div className="notif-users-empty notif-users-empty--box">
                    <Loader2 size={18} className="notif-spin" />
                    <span>جاري تحميل الفئة...</span>
                  </div>
                ) : null}

                {effectiveUsers.length > 0 && (
                  <p className="notif-selected-count">
                    سيتم الإرسال إلى {effectiveUsers.length} مستخدم
                  </p>
                )}

                <div className="notif-users-list">
                  {usersLoading ? (
                    <div className="notif-users-empty">
                      <Loader2 size={18} className="notif-spin" />
                      <span>جاري تحميل المستخدمين...</span>
                    </div>
                  ) : userOptions.length === 0 ? (
                    <div className="notif-users-empty">
                      <span>لا يوجد مستخدمون مطابقون</span>
                    </div>
                  ) : userOptions.map((user) => {
                    const isSelected = isUserSelected(user.id);
                    return (
                      <button
                        key={user.id}
                        type="button"
                        className={`notif-user-option${isSelected ? ' notif-user-option--selected' : ''}`}
                        onClick={() => toggleUserSelection(user)}
                        disabled={sendLoading || groupLoading}
                      >
                        <div className="notif-user-option-main">
                          <span className="notif-user-option-name">{user.name}</span>
                          <span className="notif-user-option-email">{user.email}</span>
                        </div>
                        <span className={`notif-user-option-check${isSelected ? ' notif-user-option-check--selected' : ''}`} />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* العنوان */}
            <div className="notif-field">
              <label className="notif-label">عنوان الإشعار</label>
              <input
                className="notif-input"
                type="text"
                placeholder="أدخل عنواناً جذاباً..."
                value={notifTitle}
                onChange={(e) => { setNotifTitle(e.target.value); setSendError(''); }}
                disabled={sendLoading}
              />
            </div>

            {/* نص الرسالة */}
            <div className="notif-field">
              <label className="notif-label">نص الرسالة</label>
              <textarea
                className="notif-textarea"
                placeholder="اكتب تفاصيل الإشعار هنا..."
                rows={5}
                value={notifBody}
                onChange={(e) => { setNotifBody(e.target.value); setSendError(''); }}
                disabled={sendLoading}
              />
            </div>

            {/* خطأ */}
            {sendError && <p className="notif-send-error">{sendError}</p>}

            {/* زر الإرسال */}
            <button
              className={`notif-send-btn${sendSuccess ? ' notif-send-btn--success' : ''}`}
              onClick={handleSend}
              disabled={sendLoading || groupLoading}
            >
              {sendLoading
                ? <Loader2 size={18} className="notif-spin" />
                : <Bell size={18} />}
              {sendLoading ? 'جاري الإرسال...' : sendSuccess ? '✓ تم الإرسال بنجاح' : 'إرسال الإشعار'}
            </button>

          </div>
        </div>

        {/* ── القسم الأيسر: السجل ── */}
        <div className="notif-log-card">

          {/* رأس السجل */}
          <div className="notif-log-header">
            <button
              className="notif-download-btn"
              onClick={handleDownload}
              disabled={notifications.length === 0}
            >
              <Download size={12} />
              تحميل السجل
            </button>
            <div className="notif-log-title-row">
              <Bell size={18} className="notif-card-title-icon" />
              <h2 className="notif-log-title">سجل الإشعارات المُرسلة</h2>
            </div>
          </div>

          {/* الجدول */}
          <div className="notif-table-wrapper">
            <table className="notif-table">
              <thead>
                <tr className="notif-thead-row">
                  <th className="ncol-actions">الإجراءات</th>
                  <th className="ncol-status">الحالة</th>
                  <th className="ncol-date">التاريخ</th>
                  <th className="ncol-recipients">المستلمون</th>
                  <th className="ncol-title">العنوان</th>
                </tr>
              </thead>
              <tbody>
                {listLoading ? (
                  <tr>
                    <td colSpan={5} className="notif-empty">
                      <Loader2 size={24} className="notif-spin" />
                      <span>جاري التحميل...</span>
                    </td>
                  </tr>
                ) : listError ? (
                  <tr>
                    <td colSpan={5} className="notif-empty">
                      <span style={{ color: '#C0392B' }}>{listError}</span>
                    </td>
                  </tr>
                ) : notifications.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="notif-empty">
                      <Bell size={32} />
                      <span>لا توجد إشعارات مُرسلة بعد</span>
                    </td>
                  </tr>
                ) : notifications.map((notif) => (
                  <NotifRow
                    key={notif.id}
                    notif={notif}
                    onDelete={handleDelete}
                    deleteLoading={deleteLoading}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <div className="notif-cards-mobile">
            {listLoading ? (
              <div className="notif-empty">
                <Loader2 size={24} className="notif-spin" />
                <span>جاري التحميل...</span>
              </div>
            ) : listError ? (
              <div className="notif-empty">
                <span style={{ color: '#C0392B' }}>{listError}</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="notif-empty">
                <Bell size={32} />
                <span>لا توجد إشعارات مُرسلة بعد</span>
              </div>
            ) : (
              notifications.map((notif) => (
                <NotifCard
                  key={notif.id}
                  notif={notif}
                  onDelete={handleDelete}
                  deleteLoading={deleteLoading}
                />
              ))
            )}
          </div>

          {/* Pagination */}
          {!listLoading && totalPages > 1 && (
            <div className="notif-pagination">
              <div className="notif-page-btns">
                <button
                  className="notif-page-btn"
                  onClick={() => loadLog(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronRight size={14} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    className={`notif-page-btn${currentPage === p ? ' notif-page-btn--active' : ''}`}
                    onClick={() => loadLog(p)}
                  >
                    {p}
                  </button>
                ))}
                <button
                  className="notif-page-btn"
                  onClick={() => loadLog(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronLeft size={14} />
                </button>
              </div>
              <span className="notif-page-info">
                {pageMeta?.total ?? notifications.length} إشعار
              </span>
            </div>
          )}

        </div>
      </div>

    </div>
  );
};

export default Notifications;
