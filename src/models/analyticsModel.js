// src/models/analyticsModel.js
import axiosInstance from '../utils/axiosInstance';
import { orderWeekSatToFri } from '../utils/weekDays';

export const PERIOD_MAP = {
  يومي: 'daily',
  أسبوعي: 'weekly',
  شهري: 'monthly',
  سنوي: 'yearly',
};

export const PERIOD_OPTIONS = ['يومي', 'أسبوعي', 'شهري', 'سنوي'];

const DONUT_COLORS = [
  '#C0392B', '#EA580C', '#F59E0B', '#16A34A', '#2563EB',
  '#7C3AED', '#8E44AD', '#1ABC9C', '#D35400',
];

const fmt = (n) => Number(n ?? 0).toLocaleString('en-US');

const normalizeBars = (values) => {
  const max = Math.max(...values, 1);
  return values.map((v) => v / max);
};

const aggregateDailyToSixHours = (growth) => {
  const slots = [
    { label: '0', users: 0, posts: 0 },
    { label: '6', users: 0, posts: 0 },
    { label: '12', users: 0, posts: 0 },
    { label: '18', users: 0, posts: 0 },
    { label: '24', users: 0, posts: 0 },
  ];

  growth.forEach((g, i) => {
    let hour = i;
    const match = String(g.label ?? '').match(/(\d{1,2})/);
    if (match) hour = Number(match[1]);

    let slot = 4;
    if (hour < 6) slot = 0;
    else if (hour < 12) slot = 1;
    else if (hour < 18) slot = 2;
    else if (hour < 24) slot = 3;

    slots[slot].users += g.users ?? 0;
    slots[slot].posts += g.posts ?? 0;
  });

  return slots;
};

const aggregateMonthlyToWeeks = (growth) => {
  const weeks = [
    { label: 'الأسبوع 1', users: 0, posts: 0 },
    { label: 'الأسبوع 2', users: 0, posts: 0 },
    { label: 'الأسبوع 3', users: 0, posts: 0 },
    { label: 'الأسبوع 4', users: 0, posts: 0 },
  ];

  growth.forEach((g, i) => {
    const weekIndex = Math.min(Math.floor(i / 7), 3);
    weeks[weekIndex].users += g.users ?? 0;
    weeks[weekIndex].posts += g.posts ?? 0;
  });

  return weeks;
};

const buildGrowthSeries = (periodLabel, growth) => {
  if (periodLabel === 'يومي') {
    const slots = aggregateDailyToSixHours(growth);
    return {
      labels: slots.map((s) => s.label),
      users: slots.map((s) => s.users),
      posts: slots.map((s) => s.posts),
    };
  }

  if (periodLabel === 'شهري') {
    const weeks = aggregateMonthlyToWeeks(growth);
    return {
      labels: weeks.map((w) => w.label),
      users: weeks.map((w) => w.users),
      posts: weeks.map((w) => w.posts),
    };
  }

  if (periodLabel === 'أسبوعي') {
    const ordered = orderWeekSatToFri(growth, (g) => g.label);
    return {
      labels: ordered.map((g) => g.label),
      users: ordered.map((g) => g.users ?? 0),
      posts: ordered.map((g) => g.posts ?? 0),
    };
  }

  return {
    labels: growth.map((g) => g.label),
    users: growth.map((g) => g.users ?? 0),
    posts: growth.map((g) => g.posts ?? 0),
  };
};

export const fetchAnalytics = async (periodLabel = 'أسبوعي') => {
  const period = PERIOD_MAP[periodLabel] || 'weekly';
  const res = await axiosInstance.get('/admin/analytics', { params: { period } });
  const raw = res.data.data ?? {};

  const summary = raw.summary ?? {};
  const growth = raw.growth_chart ?? [];
  const cuisines = raw.cuisine_distribution ?? [];
  const trend = raw.engagement_detail ?? [];
  const rate = raw.engagement_rate ?? {};
  const pending = raw.pending_review ?? {};

  const series = buildGrowthSeries(periodLabel, growth);

  return {
    kpi: [
      {
        label: 'إجمالي المستخدمين',
        value: fmt(summary.total_users?.count),
        change: summary.total_users?.growth ?? 0,
      },
      {
        label: 'إجمالي الوصفات',
        value: fmt(summary.total_recipes?.count),
        change: summary.total_recipes?.growth ?? 0,
      },
      {
        label: 'منشورات المجتمع',
        value: fmt(summary.total_posts?.count),
        change: summary.total_posts?.growth ?? 0,
      },
      {
        label: 'إجمالي التفاعلات',
        value: fmt(summary.total_engagement?.count),
        change: null,
      },
    ],
    labels: series.labels,
    users: series.users,
    posts: series.posts,
    totalRecipes: summary.total_recipes?.count ?? 0,
    donut: cuisines.map((c, i) => ({
      label: c.name,
      pct: Number(c.percentage ?? 0),
      color: DONUT_COLORS[i % DONUT_COLORS.length],
    })),
    mostLikedRecipes: (raw.most_liked_recipes ?? []).map((r) => ({
      id: r.id,
      name: r.name,
      author: r.chef || '—',
      likes: r.likes_count ?? 0,
    })),
    engagement: [
      {
        label: 'الإعجابات',
        value: fmt(rate.likes?.count),
        color: '#9E2016',
        bars: normalizeBars(trend.map((t) => t.likes ?? 0)),
      },
      {
        label: 'التعليقات',
        value: fmt(rate.comments?.count),
        color: '#3B82F6',
        bars: normalizeBars(trend.map((t) => t.comments ?? 0)),
      },
    ],
    pending: {
      posts: pending.posts ?? 0,
      photos: pending.images ?? 0,
      latest: pending.latest_pending
        ? {
            id: pending.latest_pending.id,
            name: pending.latest_pending.title || '—',
            chef: pending.latest_pending.chef || '',
            cover: pending.latest_pending.cover || null,
          }
        : null,
    },
  };
};