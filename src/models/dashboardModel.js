// src/models/dashboardModel.js
import axiosInstance from '../utils/axiosInstance';
import { DAY_AR, WEEK_ORDER_EN } from '../utils/weekDays';

export const fetchDashboard = async () => {
  const res = await axiosInstance.get('/admin/dashboard');
  const raw = res.data.data ?? {};
  const totalUsers = Number(raw.stats?.total_users ?? 0);

  const counts = {};
  (raw.user_activity ?? []).forEach((d) => {
    counts[d.date] = d.count ?? 0;
  });

  const activity = WEEK_ORDER_EN.map((key) => ({
    day: DAY_AR[key],
    value: counts[key] ?? 0,
  }));

  const newUsersThisWeek = Math.min(
    totalUsers,
    activity.reduce((sum, d) => sum + d.value, 0)
  );

  const engagement = raw.engagement_rate ?? {};
  const mapEngagement = (key) => ({
    total: engagement[key]?.count ?? 0,
    change: engagement[key]?.change_percent ?? 0,
  });

  return {
    stats: {
      totalUsers,
      newUsersThisWeek,
      totalRecipes: raw.stats?.total_recipes ?? 0,
      pendingPosts: raw.stats?.pending_posts ?? 0,
    },
    latestRecipes: (raw.latest_recipes ?? []).map((r) => ({
      id: r.id,
      name: r.name,
      category: r.category || '—',
      time: r.created_at || '',
    })),
    activity,
    // الأكثر تفاعلاً — وصفات حسب الإعجابات
    mostLikedRecipes: (raw.most_liked_recipes ?? []).map((r) => ({
      id: r.id,
      name: r.name,
      author: r.chef || '—',
      likes: r.likes_count ?? 0,
    })),
    // توزيع المطابخ (ليس التصنيفات)
    cuisines: (raw.cuisine_distribution ?? []).map((c) => ({
      id: c.id,
      name: c.name,
      count: c.count ?? 0,
      percentage: c.percentage ?? 0,
    })),
    engagement: {
      likes: mapEngagement('likes'),
      comments: mapEngagement('comments'),
    },
  };
};