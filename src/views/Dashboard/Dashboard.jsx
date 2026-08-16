
// src/views/Dashboard/Dashboard.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, UtensilsCrossed, Clock, Star, Tag,
  TrendingUp,  Heart, MessageCircle,
  ArrowUpRight, ArrowDownRight, ChefHat,
} from 'lucide-react';
import './Dashboard.css';

// ─── ألوان أشرطة التصنيفات ───
const BAR_COLORS = ['#C0392B', '#E67E22', '#2980B9', '#27AE60', '#8E44AD', '#F39C12', '#1ABC9C', '#D35400'];

// ─── بيانات ثابتة ───
const STATS = {
  totalUsers: 1284,
  newUsersToday: 12,
  totalRecipes: 3541,
  pendingRecipes: 47,
  averageRating: 4.7,
};

const RECENT_RECIPES = [
  { id: 1, name: 'سلطة اليونانية بالكريمة',  category: 'سلطات',  time: 'منذ 10 د' },
  { id: 2, name: 'بيتزا المارغريتا الأصلية', category: 'معجنات', time: 'منذ 45 د' },
  { id: 3, name: 'دونات الفانيليا والورد',   category: 'حلويات', time: 'منذ 2 س'  },
  { id: 4, name: 'حمص باللحمة واللوز',       category: 'مقبلات', time: 'منذ 4 س'  },
  { id: 5, name: 'فتوش لبناني',              category: 'سلطات',  time: 'منذ 5 س'  },
];

const TOP_RECIPES = [
  { id: 1, name: 'كنافة نابلسية بالجبن',  author: 'شيف أحمد',  likes: 4230 },
  { id: 2, name: 'شاورما دجاج منزلية',   author: 'شيف سارة',  likes: 3891 },
  { id: 3, name: 'فتة حمص بالسمن',       author: 'شيف ريما',  likes: 2456 },
  { id: 4, name: 'كبسة لحم سعودية',      author: 'شيف خالد',  likes: 2103 },
  { id: 5, name: 'بقلاوة بالفستق',       author: 'شيف نور',   likes: 1847 },
];

const CATEGORIES = [
  { name: 'حلويات',       count: 890, percentage: 35 },
  { name: 'أطباق رئيسية', count: 640, percentage: 25 },
  { name: 'مقبلات',       count: 510, percentage: 20 },
  { name: 'سلطات',        count: 380, percentage: 15 },
  { name: 'مشروبات',      count: 130, percentage: 5  },
];

const ENGAGEMENT = {
  likes:    { total: 12340, change: 18  },
  comments: { total: 4892,  change: -5  },
  ratings:  { total: 8205,  change: 12  },
};

const ACTIVITY = [
  { day: 'السبت',    value: 150 },
  { day: 'الأحد',    value: 100 },
  { day: 'الاثنين',  value: 160 },
  { day: 'الثلاثاء', value: 100 },
  { day: 'الأربعاء', value: 80  },
  { day: 'الخميس',   value: 50  },
  { day: 'الجمعة',   value: 20  },
];



// ─── مساعدات ───
const fmt = (n) => n.toLocaleString('en-US');

const getRankClass = (i) => {
  if (i === 0) return 'top-recipe-rank--1';
  if (i === 1) return 'top-recipe-rank--2';
  if (i === 2) return 'top-recipe-rank--3';
  return 'top-recipe-rank--default';
};



// ─── بناء الرسم البياني ───
const buildChart = (data) => {
  const maxVal  = Math.max(...data.map(d => d.value), 1);
  const W = 534, H = 200, px = 10, py = 20;
  const uW = W - px * 2, uH = H - py * 2;

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
 
  const [topPeriod, setTopPeriod] = useState('weekly');

  const chart = buildChart(ACTIVITY);

  const statCards = [
    {
      label: 'إجمالي المستخدمين',
      value: fmt(STATS.totalUsers),
      badge: { text: `+${STATS.newUsersToday} هذا الأسبوع`, color: 'green' },
      Icon: Users,
      onClick: () => navigate('/users'),
    },
    {
      label: 'إجمالي الوصفات',
      value: fmt(STATS.totalRecipes),
      badge: null,
      Icon: UtensilsCrossed,
      onClick: () => navigate('/recipes'),
    },
    {
      label: 'وصفات قيد المراجعة',
      value: fmt(STATS.pendingRecipes),
      badge: { text: 'قيد الانتظار', color: 'orange' },
      Icon: Clock,
      onClick: () => navigate('/recipes'),
    },
    {
      label: 'متوسط التقييم',
      value: STATS.averageRating.toFixed(1),
      badge: null,
      Icon: Star,
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
            {RECENT_RECIPES.map((r) => (
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
            <span className="widget-period">الأسبوع الحالي ▾</span>
          </div>
          <div className="chart-container">
            <svg viewBox={`0 0 ${chart.W} ${chart.H}`} className="chart-svg" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#C0392B" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#C0392B" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={chart.area} fill="url(#chartGrad)" />
              <path d={chart.line} fill="none" stroke="#C0392B" strokeWidth="2.5" strokeLinecap="round" />
              {chart.pts.map(([x, y], i) => (
                <g key={i}>
                  <circle cx={x} cy={y} r="4" fill="#C0392B" />
                  <circle cx={x} cy={y} r="7" fill="#C0392B" fillOpacity="0.15" />
                </g>
              ))}
            </svg>
            <div className="chart-labels">
              {ACTIVITY.map(d => <span key={d.day}>{d.day}</span>)}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ أكثر مشاهدة + التصنيفات + التفاعل ═══ */}
      <div className="dashboard-row dashboard-row--3cols">

        {/* أكثر مشاهدة */}
        <div className="widget-card">
          <div className="widget-header">
            <div className="widget-title">
              <div className="widget-title-icon" style={{ background: '#FEF3C7', color: '#B45309' }}>
              <Heart size={16} />
              </div>
              الأكثر تفاعلاً
            </div>
            <button
              className="widget-period"
              onClick={() => setTopPeriod(p => p === 'weekly' ? 'monthly' : 'weekly')}
            >
              {topPeriod === 'weekly' ? 'أسبوعي ▾' : 'شهري ▾'}
            </button>
          </div>
          {TOP_RECIPES.map((r, i) => (
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

        {/* توزيع التصنيفات */}
        <div className="widget-card">
          <div className="widget-header">
            <div className="widget-title">
              <div className="widget-title-icon" style={{ background: '#F3E8FF', color: '#7C3AED' }}>
                <Tag size={16} />
              </div>
              توزيع التصنيفات
            </div>
            <button className="widget-view-all" onClick={() => navigate('/categories')}>التصنيفات</button>
          </div>
          <div className="category-bars">
            {CATEGORIES.map((cat, i) => (
              <div key={cat.name} className="category-bar-item">
                <div className="category-bar-header">
                  <span className="category-bar-label">{cat.name}</span>
                  <span className="category-bar-value">{fmt(cat.count)} ({cat.percentage}%)</span>
                </div>
                <div className="category-bar-track">
                  <div
                    className="category-bar-fill"
                    style={{ width: `${cat.percentage}%`, background: BAR_COLORS[i % BAR_COLORS.length] }}
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
              { key: 'likes',    label: 'إعجاب', Icon: Heart,          color: '#C0392B', bg: '#FFF0EE' },
              { key: 'comments', label: 'تعليق', Icon: MessageCircle,  color: '#2563EB', bg: '#EFF6FF' },
              { key: 'ratings',  label: 'تقييم', Icon: Star,           color: '#B45309', bg: '#FEF3C7' },
            ].map(({ key, label, Icon, color, bg }) => {
              const data   = ENGAGEMENT[key];
              const isUp   = data.change >= 0;
              return (
                <div key={key} className="engagement-item">
                  <div className="engagement-icon" style={{ background: bg, color }}>
                    <Icon size={20} />
                  </div>
                  <div className="engagement-info">
                    <div className="engagement-value">{fmt(data.total)}</div>
                    <div className="engagement-label">{label}</div>
                  </div>
                  <span className={`engagement-change engagement-change--${isUp ? 'up' : 'down'}`}>
                    {isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {Math.abs(data.change)}%
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