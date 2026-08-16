// src/views/Notifications/Notifications.jsx
import { useState } from 'react';
import { Bell, Trash2, Download, Loader2, ChevronRight, ChevronLeft } from 'lucide-react';
import './Notifications.css';

/* ─── بيانات ثابتة مؤقتة (تُستبدل بـ API لاحقاً) ─── */
const MOCK_NOTIFICATIONS = [
  { id: 1,  title: 'وصفتك تمت الموافقة عليها',            recipients: 'مستخدم محدد',      recipientType: 'specific', date: '2024/01/15', status: 'sent' },
  { id: 2,  title: 'تحدي الطهي الأسبوعي',                 recipients: 'جميع المستخدمين',  recipientType: 'users',    date: '2024/01/14', status: 'sent' },
  { id: 3,  title: 'وصفتك رُفضت',                          recipients: 'مستخدم محدد',      recipientType: 'specific', date: '2024/01/13', status: 'sent' },
  { id: 4,  title: 'تحديث سياسة المنصة',                  recipients: 'الكل',             recipientType: 'all',      date: '2024/01/12', status: 'sending' },
  { id: 5,  title: 'تذكير: وصفات قيد المراجعة',           recipients: 'الموظفون',         recipientType: 'employees',date: '2024/01/11', status: 'sent' },
  { id: 6,  title: 'ميزة جديدة: وضع الطبخ الذكي',         recipients: 'جميع المستخدمين',  recipientType: 'users',    date: '2024/01/10', status: 'sent' },
  { id: 7,  title: 'تنبيه: نشاط مشبوه على حساب',          recipients: 'مستخدم محدد',      recipientType: 'specific', date: '2024/01/09', status: 'sent' },
  { id: 8,  title: 'تحديث التطبيق — إصدار 2.1',           recipients: 'الكل',             recipientType: 'all',      date: '2024/01/08', status: 'sent' },
  { id: 9,  title: 'تذكير: إكمال الملف الشخصي',           recipients: 'جميع المستخدمين',  recipientType: 'users',    date: '2024/01/07', status: 'sent' },
  { id: 10, title: 'تقرير الأداء الأسبوعي',               recipients: 'الموظفون',         recipientType: 'employees',date: '2024/01/06', status: 'sent' },
];

const PAGE_SIZE = 5;

const RECIPIENT_OPTIONS = [
  { key: 'users',    label: 'كل المستخدمين' },
  { key: 'specific', label: 'مستخدم محدد'  },
];

const RECIPIENT_COLORS = {
  all:       { bg: '#FFE9E6', color: '#9E2016' },
  users:     { bg: '#FFE9E6', color: '#9E2016' },
  employees: { bg: '#FFE9E6', color: '#9E2016' },
  specific:  { bg: '#FFE9E6', color: '#9E2016' },
};

const STATUS_CONFIG = {
  sent:    { label: 'تم الإرسال',    bg: '#F0FDF4', color: '#16A34A' },
  sending: { label: 'جاري الإرسال', bg: '#FEF5ED', color: '#E67E22' },
  failed:  { label: 'فشل الإرسال',  bg: '#FFF0EE', color: '#C0392B' },
};

/* ─── مكوّن الإشعار في الجدول ─── */
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
            : <Trash2 size={16} />
          }
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

/* ─── الصفحة الرئيسية ─── */
const Notifications = () => {
  /* ── حالة الفورم ── */
  const [recipientType, setRecipientType] = useState('users');
  const [notifTitle,    setNotifTitle]    = useState('');
  const [notifBody,     setNotifBody]     = useState('');
  const [sendLoading,   setSendLoading]   = useState(false);
  const [sendSuccess,   setSendSuccess]   = useState(false);
  const [sendError,     setSendError]     = useState('');

  /* ── حالة الجدول ── */
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [currentPage,   setCurrentPage]   = useState(1);
  const [deleteLoading, setDeleteLoading] = useState(null);



  /* ── pagination ── */
  const totalPages  = Math.ceil(notifications.length / PAGE_SIZE);
  const paginated   = notifications.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  /* ── إرسال ── */
  const handleSend = async () => {
    if (!notifTitle.trim() || !notifBody.trim()) {
      setSendError('يرجى تعبئة العنوان ونص الرسالة');
      return;
    }
    setSendLoading(true);
    setSendError('');
    try {
      // TODO: await sendNotification({ recipientType, title: notifTitle, body: notifBody });
      await new Promise(r => setTimeout(r, 900)); // محاكاة
      const newNotif = {
        id:            Date.now(),
        title:         notifTitle,
        recipients:    RECIPIENT_OPTIONS.find(o => o.key === recipientType)?.label ?? 'الكل',
        recipientType,
        date:          new Date().toISOString().slice(0, 10).replace(/-/g, '/'),
        status:        'sent',
      };
      setNotifications(prev => [newNotif, ...prev]);
      setNotifTitle('');
      setNotifBody('');
      setRecipientType('users');
      setSendSuccess(true);
      setTimeout(() => setSendSuccess(false), 2500);
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
      // TODO: await deleteNotification(id);
      await new Promise(r => setTimeout(r, 500));
      setNotifications(prev => prev.filter(n => n.id !== id));
      if (paginated.length === 1 && currentPage > 1) setCurrentPage(p => p - 1);
    } finally {
      setDeleteLoading(null);
    }
  };

  /* ── تحميل السجل ── */
  const handleDownload = () => {
    const rows  = ['العنوان,المستلمون,التاريخ,الحالة'];
    notifications.forEach(n => {
      const st = STATUS_CONFIG[n.status]?.label ?? n.status;
      rows.push(`"${n.title}","${n.recipients}","${n.date}","${st}"`);
    });
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'notifications.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

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
                {RECIPIENT_OPTIONS.map(opt => (
                  <button
                    key={opt.key}
                    type="button"
                    className={`notif-recip-btn${recipientType === opt.key ? ' notif-recip-btn--active' : ''}`}
                    onClick={() => setRecipientType(opt.key)}
                  >
                    <span className={`notif-recip-radio${recipientType === opt.key ? ' notif-recip-radio--active' : ''}`} />
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* العنوان */}
            <div className="notif-field">
              <label className="notif-label">عنوان الإشعار</label>
              <input
                className="notif-input"
                type="text"
                placeholder="أدخل عنواناً جذاباً..."
                value={notifTitle}
                onChange={e => { setNotifTitle(e.target.value); setSendError(''); }}
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
                onChange={e => { setNotifBody(e.target.value); setSendError(''); }}
              />
            </div>

            {/* خطأ */}
            {sendError && <p className="notif-send-error">{sendError}</p>}

            {/* زر الإرسال */}
            <button
              className={`notif-send-btn${sendSuccess ? ' notif-send-btn--success' : ''}`}
              onClick={handleSend}
              disabled={sendLoading}
            >
              {sendLoading
                ? <Loader2 size={18} className="notif-spin" />
                : <Bell size={18} />
              }
              {sendLoading ? 'جاري الإرسال...' : sendSuccess ? '✓ تم الإرسال بنجاح' : 'إرسال الإشعار'}
            </button>

          </div>
        </div>

        {/* ── القسم الأيسر: السجل ── */}
        <div className="notif-log-card">

          {/* رأس السجل */}
          <div className="notif-log-header">
            <button className="notif-download-btn" onClick={handleDownload}>
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
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="notif-empty">
                      <Bell size={32} />
                      <span>لا توجد إشعارات مُرسلة بعد</span>
                    </td>
                  </tr>
                ) : paginated.map(notif => (
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

          {/* Pagination */}
          <div className="notif-pagination">
            <div className="notif-page-btns">
              <button
                className="notif-page-btn"
                onClick={() => setCurrentPage(p => p - 1)}
                disabled={currentPage === 1}
              >
                <ChevronRight size={14} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  className={`notif-page-btn${currentPage === p ? ' notif-page-btn--active' : ''}`}
                  onClick={() => setCurrentPage(p)}
                >
                  {p}
                </button>
              ))}
              <button
                className="notif-page-btn"
                onClick={() => setCurrentPage(p => p + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronLeft size={14} />
              </button>
            </div>
            <span className="notif-page-info">
              عرض {Math.min(paginated.length, PAGE_SIZE)} من أصل {notifications.length} إشعار
            </span>
          </div>

        </div>
      </div>

    

    </div>
  );
};

export default Notifications;