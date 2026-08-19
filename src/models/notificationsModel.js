// src/models/notificationsModel.js
import axiosInstance from '../utils/axiosInstance';

const RECIPIENT_LABEL = {
  all:      'جميع المستخدمين',
  specific: 'مستخدم محدد',
};

export const fetchSentNotifications = async ({ page = 1 } = {}) => {
  const res     = await axiosInstance.get('/admin/notifications/sent-log', { params: { page } });
  const payload = res.data;

  return {
    data: (payload.data ?? []).map((n) => ({
      id:            n.id,
      title:         n.title,
      recipients:    n.recipient_label || RECIPIENT_LABEL[n.recipient_type] || '—',
      recipientType: n.recipient_type,
      date:          n.created_at || '—',
      status:        n.status || 'sent',
    })),
    meta: payload.meta ?? null,
  };
};

export const sendNotification = async ({
  recipientType,
  userIds = [],
  title,
  message,
}) => {
  const body = {
    recipient_type: recipientType,
    title,
    message,
  };

  if (recipientType === 'specific') {
    body.user_ids = userIds;
  }

  const res = await axiosInstance.post('/admin/notifications', body);
  return res.data;
};

export const deleteSentNotification = async (id) => {
  await axiosInstance.delete(`/admin/notifications/sent-log/${id}`);
};
