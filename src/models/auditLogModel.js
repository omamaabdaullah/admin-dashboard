// src/models/auditLogModel.js
import axiosInstance from '../utils/axiosInstance';

const COLOR_CLASS = {
  red:    { dot: 'dot-delete',  label: 'label-delete'  },
  orange: { dot: 'dot-ban',     label: 'label-ban'     },
  green:  { dot: 'dot-create',  label: 'label-create'  },
  blue:   { dot: 'dot-update',  label: 'label-update'  },
};

const getInitials = (name) =>
  name?.split(' ').map((n) => n[0]).join('').slice(0, 2) || '—';

const normalizeLog = (row) => {
  const color = row.action?.color || 'blue';
  const cls = COLOR_CLASS[color] || COLOR_CLASS.blue;
  const user = row.user ?? {};

  return {
    id: row.id,
    typeLabel: row.action?.label || row.action?.value || '—',
    details: row.description || '—',
    admin: user.name || 'النظام',
    avatar: user.avatar || null,
    initials: getInitials(user.name || 'النظام'),
    date: row.created_at || '—',
    dotClass: cls.dot,
    labelClass: cls.label,
  };
};

export const fetchAuditLogs = async ({
  page = 1,
  perPage = 10,
  search = '',
  action = '',
  userId = '',
  dateFrom = '',
  dateTo = '',
} = {}) => {
  const params = new URLSearchParams();
  params.append('page', page);
  params.append('per_page', perPage);
  if (search)   params.append('search', search);
  if (action)   params.append('action', action);
  if (userId)   params.append('user_id', userId);
  if (dateFrom) params.append('date_from', dateFrom);
  if (dateTo)   params.append('date_to', dateTo);

  const res = await axiosInstance.get(`/admin/audit-logs?${params.toString()}`);
  const raw = res.data.data;
  const rows = Array.isArray(raw) ? raw : (raw?.data ?? []);
  const meta = res.data.meta ?? {};

  return {
    data: rows.map(normalizeLog),
    stats: meta.stats ?? { total: 0, today: 0, deletes: 0 },
    actionTypes: meta.action_types ?? [],
    meta: {
      currentPage: meta.current_page ?? page,
      lastPage:    meta.last_page ?? 1,
      perPage:     meta.per_page ?? perPage,
      total:       meta.total ?? 0,
    },
  };
};

export const exportAuditLogs = async ({
  search = '',
  action = '',
  userId = '',
  dateFrom = '',
  dateTo = '',
} = {}) => {
  const perPage = 100;
  let page = 1;
  let lastPage = 1;
  const allRows = [];

  do {
    const result = await fetchAuditLogs({
      page,
      perPage,
      search,
      action,
      userId,
      dateFrom,
      dateTo,
    });

    allRows.push(...result.data);
    lastPage = result.meta.lastPage ?? 1;
    page += 1;
  } while (page <= lastPage);

  return allRows;
};