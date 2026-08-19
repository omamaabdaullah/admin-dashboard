// src/views/Dashboard/Dashboard.jsx
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '../../controllers/useDashboard';
import {
  Users, UtensilsCrossed, Clock, Tag,
  TrendingUp, Heart, MessageCircle,
  ArrowUpRight, ArrowDownRight, ChefHat,
} from 'lucide-react';
import './Dashboard.css';

// ─── ألوان أشرطة المطابخ ───
const BAR_COLORS = ['#C0392B', '#E67E22', '#2980B9', '#27AE60', '#8E44AD', '#F39C12', '#1ABC9C', '#D35400'];

// ─── مساعدات ───
const fmt = (n) => Number(n ?? 0).toLocaleString('en-US');

const getRankClass = (i) => {
  if (i === 0) return 'top-recipe-rank--1';
  if (i === 1) return 'top-recipe-rank--2';
  if (i === 2) return 'top-recipe-rank--3';
  return 'top-recipe-rank--default';
};

// ─── بناء الرسم البياني ───
const buildChart = (data) => {
  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const W = 500;
  const H = 180;
  const px = 10;
  const py = 14;
  const uW = W - px * 2;
  const uH = H - py * 2;

  const pts = data.map((d, i) => {
    const x = px + (i / Math.max(data.length - 1, 1)) * uW;
    const y = py + uH - (d.value / maxVal) * uH;
    return [x, y];
  });

  let line = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [px0, py0] = pts[i - 1];
    const [cx, cy] = pts[i];
    line += ` C${px0 + (cx - px0) * 0.4},${py0} ${px0 + (cx - px0) * 0.6},${cy} ${cx},${cy}`;
  }
  const area = `${line} L${pts[pts.length - 1][0]},${H} L${pts[0][0]},${H} Z`;

  return { W, H, pts, line, area };
};

// ═══════════════════════════════════════════════════
const Dashboard = () => {
  const navigate = useNavigate();
  const { data, loading, error, reload } = useDashboard();

  if (loading) {
    return (
      <div className="dashboard">
        <p>جاري التحميل...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="dashboard">
        <p>{error || 'لا توجد بيانات'}</p>
        <button type="button" onClick={reload}>إعادة المحاولة</button>
      </div>
    );
  }

  const { stats, latestRecipes, activity, cuisines, mostLikedRecipes, engagement } = data;
  const chart = buildChart(activity.length ? activity : [{ day: '—', value: 0 }]);

  const statCards = [
    {
      label: 'إجمالي المستخدمين',
      value: fmt(stats.totalUsers),
      badge: { text: `+${stats.newUsersThisWeek} هذا الأسبوع`, color: 'green' },
      Icon: Users,
      onClick: () => navigate('/users'),
    },
    {
      label: 'إجمالي الوصفات',
      value: fmt(stats.totalRecipes),
      badge: null,
      Icon: UtensilsCrossed,
      onClick: () => navigate('/recipes'),
    },
    {
      label: 'منشورات قيد المراجعة',
      value: fmt(stats.pendingPosts),
      badge: { text: 'قيد الانتظار', color: 'orange' },
      Icon: Clock,
      onClick: () => navigate('/posts'),
    },
  ];

  return (
    <div className="dashboard">

      {/* ═══ بطاقات الإحصائيات ═══ */}
      <div className="stat-cards">
        {statCards.map(({ label, value, badge, Icon, onClick }) => (
          <div
            key={label}
            className={`stat-card${onClick ? ' stat-card--clickable' : ''}`}
            onClick={onClick}
          >
            <div className="stat-card-top">
              {badge && (
                <span className={`stat-badge stat-badge--${badge.color}`}>{badge.text}</span>
              )}
              <div className="stat-card-icon"><Icon size={20} /></div>
            </div>
            <div className="stat-card-value">{value}</div>
            <div className="stat-card-label">{label}</div>
          </div>
        ))}
      </div>

      {/* ═══ آخر الوصفات + نشاط المستخدمين ═══ */}
      <div className="dashboard-row dashboard-row--2cols">

        <div className="widget-card">
          <div className="widget-header">
            <div className="widget-title">
              <div className="widget-title-icon" style={{ background: '#FFF0EE', color: '#C0392B' }}>
                <ChefHat size={16} />
              </div>
              آخر الوصفات المضافة
            </div>
            <button className="widget-view-all" onClick={() => navigate('/recipes')}>عرض الكل</button>
          </div>
          <div className="recipe-list">
            {latestRecipes.map((r) => (
              <div key={r.id} className="recipe-item">
                <div className="recipe-avatar"><UtensilsCrossed size={18} /></div>
                <div className="recipe-info">
                  <span className="recipe-name">{r.name}</span>
                  <span className="recipe-category">{r.category}</span>
                </div>
                <span className="recipe-time">{r.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="widget-card">
          <div className="widget-header">
            <div className="widget-title">
              <div className="widget-title-icon" style={{ background: '#EFF6FF', color: '#2563EB' }}>
                <TrendingUp size={16} />
              </div>
              نشاط المستخدمين — آخر 7 أيام
            </div>
            <span className="widget-period">الأسبوع الحالي</span>
          </div>
          <div className="dashboard-chart">
            <svg
              viewBox={`0 0 ${chart.W} ${chart.H}`}
              className="dashboard-chart-svg"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#9E2016" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#9E2016" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[0.25, 0.5, 0.75].map((f) => (
                <line
                  key={f}
                  x1={0}
                  y1={chart.H * f}
                  x2={chart.W}
                  y2={chart.H * f}
                  stroke="#E1BFB9"
                  strokeWidth="0.5"
                  strokeOpacity="0.5"
                />
              ))}
              <path d={chart.area} fill="url(#chartGrad)" />
              <path d={chart.line} fill="none" stroke="#9E2016" strokeWidth="2.5" strokeLinecap="round" />
              {chart.pts.map(([x, y], i) => (
                <g key={i}>
                  <circle cx={x} cy={y} r="5" fill="#9E2016" />
                  <circle cx={x} cy={y} r="8" fill="#9E2016" fillOpacity="0.12" />
                </g>
              ))}
            </svg>
            <div className="dashboard-chart-labels">
              {activity.map((d) => <span key={d.day}>{d.day}</span>)}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ الأكثر تفاعلاً + المطابخ + التفاعل ═══ */}
      <div className="dashboard-row dashboard-row--3cols">

        {/* الأكثر تفاعلاً */}
        <div className="widget-card">
          <div className="widget-header">
            <div className="widget-title">
              <div className="widget-title-icon" style={{ background: '#FEF3C7', color: '#B45309' }}>
                <Heart size={16} />
              </div>
              الأكثر تفاعلاً
            </div>
          </div>
          {mostLikedRecipes.map((r, i) => (
            <div key={r.id} className="top-recipe-item">
              <div className={`top-recipe-rank ${getRankClass(i)}`}>{i + 1}</div>
              <div className="top-recipe-info">
                <div className="top-recipe-name">{r.name}</div>
                <div className="top-recipe-author">{r.author}</div>
              </div>
              <div className="top-recipe-views">
                <Heart size={14} />
                {fmt(r.likes)}
              </div>
            </div>
          ))}
        </div>

        {/* توزيع المطابخ */}
        <div className="widget-card">
          <div className="widget-header">
            <div className="widget-title">
              <div className="widget-title-icon" style={{ background: '#F3E8FF', color: '#7C3AED' }}>
                <Tag size={16} />
              </div>
              توزيع المطابخ
            </div>
            <button className="widget-view-all" onClick={() => navigate('/categories')}>المطابخ</button>
          </div>
          <div className="category-bars">
            {cuisines.map((cat, i) => (
              <div key={cat.id ?? `${cat.name}-${i}`} className="category-bar-item">
                <div className="category-bar-header">
                  <span className="category-bar-label">{cat.name}</span>
                  <span className="category-bar-value">{fmt(cat.count)} ({cat.percentage}%)</span>
                </div>
                <div className="category-bar-track">
                  <div
                    className="category-bar-fill"
                    style={{
                      width: `${cat.percentage}%`,
                      background: BAR_COLORS[i % BAR_COLORS.length],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* معدل التفاعل */}
        <div className="widget-card">
          <div className="widget-header">
            <div className="widget-title">
              <div className="widget-title-icon" style={{ background: '#F0FDF4', color: '#16A34A' }}>
                <Heart size={16} />
              </div>
              معدل التفاعل
            </div>
          </div>
          <div className="engagement-cards">
            {[
              { key: 'likes', label: 'إعجاب', Icon: Heart, color: '#C0392B', bg: '#FFF0EE' },
              { key: 'comments', label: 'تعليق', Icon: MessageCircle, color: '#2563EB', bg: '#EFF6FF' },
            ].map(({ key, label, Icon, color, bg }) => {
              const item = engagement[key];
              const isUp = item.change >= 0;
              return (
                <div key={key} className="engagement-item">
                  <div className="engagement-icon" style={{ background: bg, color }}>
                    <Icon size={20} />
                  </div>
                  <div className="engagement-info">
                    <div className="engagement-value">{fmt(item.total)}</div>
                    <div className="engagement-label">{label}</div>
                  </div>
                  <span className={`engagement-change engagement-change--${isUp ? 'up' : 'down'}`}>
                    {isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {Math.abs(item.change)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;