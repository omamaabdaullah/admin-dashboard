// src/views/Analytics/Analytics.jsx
import { useState } from 'react';
import {
  Users, UtensilsCrossed, Image, Heart,
  ArrowUpRight, ArrowDownRight,
  Star, Eye, ChefHat,
} from 'lucide-react';
import './Analytics.css';

// ─── بيانات ثابتة (تُستبدل بـ API لاحقاً) ───

const KPI_ICONS = [Users, UtensilsCrossed, Image, Heart];

const PERIOD_DATA = {
  يومي: {
    kpi: [
      { label: 'إجمالي المستخدمين',  value: '128',    change: 2  },
      { label: 'إجمالي الوصفات',     value: '14',     change: 5  },
      { label: 'منشورات المجتمع',    value: '37',     change: -1 },
      { label: 'إجمالي التفاعلات',   value: '1,240',  change: 3  },
    ],
    labels: ['12ص', '3ص', '6ص', '9ص', '12م', '3م', '6م', '9م'],
    users:   [20,  8,  5, 30, 60, 90, 75, 40],
    recipes: [2,   1,  0,  3,  5,  8,  6,  4],
    donut: [
      { label: 'حلويات',        pct: 30, color: '#C0392B' },
      { label: 'أطباق رئيسية', pct: 28, color: '#EA580C' },
      { label: 'مقبلات',        pct: 18, color: '#F59E0B' },
      { label: 'صحي',           pct: 12, color: '#16A34A' },
      { label: 'شرقي',          pct:  8, color: '#2563EB' },
      { label: 'غربي',          pct:  4, color: '#7C3AED' },
    ],
    engagement: [
      { label: 'الإعجابات', value: '620',  color: '#9E2016', bars: [0.5, 0.8, 0.6, 1, 0.7, 0.4] },
      { label: 'التعليقات', value: '184',  color: '#3B82F6', bars: [0.3, 0.6, 0.4, 0.9, 0.5, 0.2] },
    ],
    topRecipes: [
      { id: 1, name: 'كيكة الشوكولاتة الذاتية', views: '320', rating: 4.9 },
      { id: 2, name: 'شاورما دجاج منزلية',       views: '210', rating: 4.7 },
      { id: 3, name: 'سلطة سيزر كلاسيك',         views: '180', rating: 4.6 },
    ],
    pending: { posts: 8, photos: 3, recipes: 5 },
  },
  أسبوعي: {
    kpi: [
      { label: 'إجمالي المستخدمين',  value: '842',    change: 6  },
      { label: 'إجمالي الوصفات',     value: '73',     change: 9  },
      { label: 'منشورات المجتمع',    value: '215',    change: 4  },
      { label: 'إجمالي التفاعلات',   value: '9,180',  change: -3 },
    ],
    labels: ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'],
    users:   [95, 120, 140, 110, 160, 130, 87],
    recipes: [8,   12,  10,   9,  14,  11,  9],
    donut: [
      { label: 'حلويات',        pct: 32, color: '#C0392B' },
      { label: 'أطباق رئيسية', pct: 26, color: '#EA580C' },
      { label: 'مقبلات',        pct: 16, color: '#F59E0B' },
      { label: 'صحي',           pct: 12, color: '#16A34A' },
      { label: 'شرقي',          pct:  9, color: '#2563EB' },
      { label: 'غربي',          pct:  5, color: '#7C3AED' },
    ],
    engagement: [
      { label: 'الإعجابات', value: '4.8K', color: '#9E2016', bars: [0.7, 0.5, 0.9, 0.6, 1, 0.8] },
      { label: 'التعليقات', value: '1.2K', color: '#3B82F6', bars: [0.4, 0.7, 0.5, 0.3, 0.8, 0.6] },
    ],
    topRecipes: [
      { id: 1, name: 'منسف أردني بالجميد',         views: '2.1K', rating: 4.8 },
      { id: 2, name: 'الكبسة السعودية التقليدية',   views: '1.8K', rating: 4.9 },
      { id: 3, name: 'كنافة نابلسية بالجبن',        views: '1.5K', rating: 4.7 },
    ],
    pending: { posts: 23, photos: 9, recipes: 14 },
  },
  شهري: {
    kpi: [
      { label: 'إجمالي المستخدمين',  value: '3,420',  change: 11 },
      { label: 'إجمالي الوصفات',     value: '298',    change: 8  },
      { label: 'منشورات المجتمع',    value: '940',    change: 6  },
      { label: 'إجمالي التفاعلات',   value: '38,600', change: -1 },
    ],
    labels: ['الأسبوع 1', 'الأسبوع 2', 'الأسبوع 3', 'الأسبوع 4'],
    users:   [780, 920, 850, 1100],
    recipes: [62,  78,  70,   88],
    donut: [
      { label: 'حلويات',        pct: 33, color: '#C0392B' },
      { label: 'أطباق رئيسية', pct: 27, color: '#EA580C' },
      { label: 'مقبلات',        pct: 16, color: '#F59E0B' },
      { label: 'صحي',           pct: 11, color: '#16A34A' },
      { label: 'شرقي',          pct:  9, color: '#2563EB' },
      { label: 'غربي',          pct:  4, color: '#7C3AED' },
    ],
    engagement: [
      { label: 'الإعجابات', value: '19.4K', color: '#9E2016', bars: [0.6, 0.9, 0.7, 1] },
      { label: 'التعليقات', value: '5.1K',  color: '#3B82F6', bars: [0.4, 0.7, 0.5, 0.8] },
    ],
    topRecipes: [
      { id: 1, name: 'حلويات أم علي بالقشطة',       views: '6.2K', rating: 4.7 },
      { id: 2, name: 'الكبسة السعودية التقليدية',   views: '5.9K', rating: 4.9 },
      { id: 3, name: 'شاورما دجاج منزلية',           views: '4.8K', rating: 4.8 },
    ],
    pending: { posts: 38, photos: 12, recipes: 26 },
  },
  سنوي: {
    kpi: [
      { label: 'إجمالي المستخدمين',  value: '12,540', change: 8  },
      { label: 'إجمالي الوصفات',     value: '3,284',  change: 12 },
      { label: 'منشورات المجتمع',    value: '5,920',  change: 3  },
      { label: 'إجمالي التفاعلات',   value: '89,320', change: -2 },
    ],
    labels: ['يناير', 'مارس', 'مايو', 'يوليو', 'سبتمبر', 'نوفمبر'],
    users:   [1200, 2100, 2800, 5200, 7200, 12500],
    recipes: [400,  700,  1100, 1700, 2400,  3284],
    donut: [
      { label: 'حلويات',        pct: 35, color: '#C0392B' },
      { label: 'أطباق رئيسية', pct: 25, color: '#EA580C' },
      { label: 'مقبلات',        pct: 15, color: '#F59E0B' },
      { label: 'صحي',           pct: 10, color: '#16A34A' },
      { label: 'شرقي',          pct: 10, color: '#2563EB' },
      { label: 'غربي',          pct:  5, color: '#7C3AED' },
    ],
    engagement: [
      { label: 'الإعجابات', value: '45.2K', color: '#9E2016', bars: [0.9, 0.7, 1, 0.8, 0.6, 0.4] },
      { label: 'التعليقات', value: '12.8K', color: '#3B82F6', bars: [0.8, 0.6, 0.3, 0.4, 0.2, 0.5] },
    ],
    topRecipes: [
      { id: 1, name: 'الكبسة السعودية التقليدية', views: '12.5K', rating: 4.9 },
      { id: 2, name: 'منسف أردني بالجميد',         views: '9.2K',  rating: 4.8 },
      { id: 3, name: 'حلويات أم علي بالقشطة',       views: '8.8K',  rating: 4.7 },
    ],
    pending: { posts: 47, photos: 15, recipes: 32 },
  },
};

const PERIOD_OPTIONS = ['يومي', 'أسبوعي', 'شهري', 'سنوي'];

// ─── بناء مسار SVG للخط ───
const buildSvgPath = (data, W, H, padX = 10, padY = 16) => {
  const maxVal = Math.max(...data, 1);
  const usableW = W - padX * 2;
  const usableH = H - padY * 2;
  const pts = data.map((d, i) => [
    padX + (i / (data.length - 1)) * usableW,
    padY + usableH - (d / maxVal) * usableH,
  ]);
  let line = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    line += ` C${x0 + (x1 - x0) * 0.4},${y0} ${x0 + (x1 - x0) * 0.6},${y1} ${x1},${y1}`;
  }
  const area = `${line} L${pts[pts.length - 1][0]},${H} L${pts[0][0]},${H} Z`;
  return { line, area, pts };
};

// ─── بناء مسارات Donut ───
const buildDonutPaths = (segments, cx, cy, r, thickness) => {
  let cumulative = 0;
  return segments.map(seg => {
    const startAngle = (cumulative / 100) * 2 * Math.PI - Math.PI / 2;
    cumulative += seg.pct;
    const endAngle = (cumulative / 100) * 2 * Math.PI - Math.PI / 2;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const largeArc = seg.pct > 50 ? 1 : 0;
    const innerR = r - thickness;
    const ix1 = cx + innerR * Math.cos(endAngle);
    const iy1 = cy + innerR * Math.sin(endAngle);
    const ix2 = cx + innerR * Math.cos(startAngle);
    const iy2 = cy + innerR * Math.sin(startAngle);
    return {
      ...seg,
      d: `M${x1},${y1} A${r},${r} 0 ${largeArc},1 ${x2},${y2} L${ix1},${iy1} A${innerR},${innerR} 0 ${largeArc},0 ${ix2},${iy2} Z`,
    };
  });
};

const getRankClass = (i) => {
  if (i === 0) return 'top-rank--1';
  if (i === 1) return 'top-rank--2';
  if (i === 2) return 'top-rank--3';
  return 'top-rank--def';
};

// ═══════════════════════════════════════════════════
const Analytics = () => {
  const [activePeriod, setActivePeriod] = useState('سنوي');

  const data = PERIOD_DATA[activePeriod];

  const SVG_W = 500;
  const SVG_H = 220;
  const usersChart   = buildSvgPath(data.users,   SVG_W, SVG_H);
  const recipesChart = buildSvgPath(data.recipes, SVG_W, SVG_H);

  const DONUT_CX = 80;
  const DONUT_CY = 80;
  const DONUT_R  = 70;
  const DONUT_T  = 22;
  const donutPaths = buildDonutPaths(data.donut, DONUT_CX, DONUT_CY, DONUT_R, DONUT_T);

  return (
    <div className="analytics">

      {/* ═══ Header ═══ */}
      <div className="analytics-header">
        <div className="filter-pills">
          {PERIOD_OPTIONS.map(p => (
            <button
              key={p}
              className={`filter-pill${activePeriod === p ? ' active' : ''}`}
              onClick={() => setActivePeriod(p)}
            >
              {p}
            </button>
          ))}
        </div>
        <div className="analytics-title-group">
          <h1 className="analytics-title">الإحصائيات والتقارير</h1>
          <p className="analytics-subtitle">نظرة عميقة على أداء المنصة وتفاعلات المجتمع</p>
        </div>
      </div>

      {/* ═══ KPI Cards ═══ */}
      <div className="kpi-cards">
        {data.kpi.map(({ label, value, change }, idx) => {
          const Icon = KPI_ICONS[idx];
          return (
            <div key={label} className="kpi-card">
              <div className="kpi-card-top">
                <span className={`kpi-change kpi-change--${change >= 0 ? 'up' : 'down'}`}>
                  {change >= 0
                    ? <ArrowUpRight size={13} />
                    : <ArrowDownRight size={13} />}
                  {Math.abs(change)}%
                </span>
                <div className="kpi-icon"><Icon size={22} /></div>
              </div>
              <div className="kpi-value">{value}</div>
              <div className="kpi-label">{label}</div>
            </div>
          );
        })}
      </div>

      {/* ═══ Charts Row ═══ */}
      <div className="charts-row">

        {/* Line Chart */}
        <div className="widget-card">
          <div className="widget-header">
            <div className="line-chart-legend">
              <div className="legend-item">
                <span className="legend-dashed" />
                الوصفات
              </div>
              <div className="legend-item">
                <span className="legend-dot" style={{ background: '#7C0202' }} />
                المستخدمون
              </div>
            </div>
            <h2 className="widget-title">نمو المستخدمين والوصفات</h2>
          </div>
          <div className="line-chart-container">
            <svg
              viewBox={`0 0 ${SVG_W} ${SVG_H}`}
              className="chart-svg"
              style={{ height: 220 }}
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="usersGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#9E2016" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#9E2016" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Grid lines */}
              {[0.25, 0.5, 0.75].map(f => (
                <line
                  key={f}
                  x1={0} y1={SVG_H * f}
                  x2={SVG_W} y2={SVG_H * f}
                  stroke="#E1BFB9" strokeWidth="0.5" strokeOpacity="0.5"
                />
              ))}

              {/* Users area + line */}
              <path d={usersChart.area} fill="url(#usersGrad)" />
              <path d={usersChart.line} fill="none" stroke="#9E2016" strokeWidth="2.5" strokeLinecap="round" />
              {usersChart.pts.map(([x, y], i) => (
                <g key={i}>
                  <circle cx={x} cy={y} r={5}  fill="#9E2016" />
                  <circle cx={x} cy={y} r={8}  fill="#9E2016" fillOpacity="0.12" />
                </g>
              ))}

              {/* Recipes dashed line */}
              <path
                d={recipesChart.line}
                fill="none"
                stroke="#2563EB"
                strokeWidth="2"
                strokeDasharray="6 4"
                strokeLinecap="round"
              />
              {recipesChart.pts.map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r={4} fill="#2563EB" />
              ))}
            </svg>

            <div className="chart-month-labels">
              {data.labels.map(m => <span key={m}>{m}</span>)}
            </div>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="widget-card">
          <div className="widget-header">
            <div />
            <h2 className="widget-title">توزيع الوصفات حسب التصنيف</h2>
          </div>
          <div className="donut-container">
            <div className="donut-svg-wrap">
              <svg viewBox="0 0 160 160" width="160" height="160">
                {donutPaths.map((seg, i) => (
                  <path key={i} d={seg.d} fill={seg.color} stroke="#fff" strokeWidth="2" />
                ))}
              </svg>
              <div className="donut-center-label">
                <span className="donut-center-value">3,284</span>
                <span className="donut-center-sub">إجمالي الوصفات</span>
              </div>
            </div>
            <div className="donut-legend">
              {data.donut.map(seg => (
                <div key={seg.label} className="donut-legend-item">
                  <span className="donut-dot" style={{ background: seg.color }} />
                  {seg.label} ({seg.pct}%)
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Widgets Row ═══ */}
      <div className="widgets-row">

        {/* Pending Review */}
        <div className="widget-card">
          <div className="widget-header">
            <span className="pending-badge">{data.pending.posts} منشور</span>
            <h2 className="widget-title">بانتظار المراجعة</h2>
          </div>
          <div className="pending-split">
            <div className="pending-mini">
              <div className="pending-mini-label">صور</div>
              <div className="pending-mini-val">{data.pending.photos}</div>
            </div>
            <div className="pending-mini">
              <div className="pending-mini-label">وصفات</div>
              <div className="pending-mini-val">{data.pending.recipes}</div>
            </div>
          </div>
          <div className="pending-item">
            <div className="pending-info">
              <div className="pending-name">{data.topRecipes[0].name}</div>
              <div className="pending-time">بانتظار المراجعة</div>
            </div>
            <div className="pending-thumb">
              <ChefHat size={18} />
            </div>
          </div>
          <button className="pending-review-btn">مراجعة الكل</button>
        </div>

        {/* Engagement */}
        <div className="widget-card">
          <div className="widget-header">
            <div />
            <h2 className="widget-title">معدل التفاعل التفصيلي</h2>
          </div>
          <div className="engagement-list">
            {data.engagement.map(({ label, value, color, bars }) => (
              <div key={label} className="engagement-row">
                <div className="engagement-meta">
                  <span className="engagement-value">{value}</span>
                  <span className="engagement-label">{label}</span>
                </div>
                <div className="sparkbar">
                  {bars.map((h, i) => (
                    <div
                      key={i}
                      className="sparkbar-bar"
                      style={{
                        height: `${h * 30}px`,
                        background: color,
                        opacity: 0.4 + h * 0.6,
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Recipes */}
        <div className="widget-card">
          <div className="widget-header">
            <div />
            <h2 className="widget-title">أكثر الوصفات مشاهدة</h2>
          </div>
          <div className="top-list">
            {data.topRecipes.map((r, i) => (
              <div key={r.id} className="top-item">
                <div className="top-info">
                  <div className="top-name">{r.name}</div>
                  <div className="top-meta">
                    <Star size={10} className="top-rating" fill="#FB923C" color="#FB923C" />
                    <span className="top-rating">{r.rating}</span>
                    <span>·</span>
                    <Eye size={10} />
                    <span>{r.views} مشاهدة</span>
                  </div>
                </div>
                <div className={`top-rank ${getRankClass(i)}`}>{i + 1}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};

export default Analytics;