// src/views/Analytics/Analytics.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, UtensilsCrossed, Image, Heart,
  ArrowUpRight, ArrowDownRight,
  ChefHat,
} from 'lucide-react';
import { useAnalytics } from '../../controllers/useAnalytics';
import { PERIOD_OPTIONS } from '../../models/analyticsModel';
import './Analytics.css';

const KPI_ICONS = [Users, UtensilsCrossed, Image, Heart];

const buildSvgPath = (data, W, H, padX = 10, padY = 16) => {
  if (!data.length) data = [0];
  const maxVal = Math.max(...data, 1);
  const usableW = W - padX * 2;
  const usableH = H - padY * 2;
  const pts = data.map((d, i) => [
    padX + (i / Math.max(data.length - 1, 1)) * usableW,
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

const buildDonutPaths = (segments, cx, cy, r, thickness) => {
  let cumulative = 0;
  return segments.map((seg) => {
    const pct = Math.max(seg.pct, 0.001);
    const startAngle = (cumulative / 100) * 2 * Math.PI - Math.PI / 2;
    cumulative += seg.pct;
    const endAngle = (cumulative / 100) * 2 * Math.PI - Math.PI / 2;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const largeArc = pct > 50 ? 1 : 0;
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
  if (i === 0) return 'top-recipe-rank--1';
  if (i === 1) return 'top-recipe-rank--2';
  if (i === 2) return 'top-recipe-rank--3';
  return 'top-recipe-rank--default';
};

const Analytics = () => {
  const navigate = useNavigate();
  const [activePeriod, setActivePeriod] = useState('أسبوعي');
  const { data, loading, error, reload } = useAnalytics(activePeriod);

  if (loading) {
    return (
      <div className="analytics">
        <p>جاري التحميل...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="analytics">
        <p>{error || 'لا توجد بيانات'}</p>
        <button type="button" onClick={reload}>إعادة المحاولة</button>
      </div>
    );
  }

  const SVG_W = 500;
  const SVG_H = 220;
  const usersChart = buildSvgPath(data.users.length ? data.users : [0], SVG_W, SVG_H);
  const postsChart = buildSvgPath(data.posts.length ? data.posts : [0], SVG_W, SVG_H);

  const DONUT_CX = 80;
  const DONUT_CY = 80;
  const DONUT_R = 70;
  const DONUT_T = 22;
  const donutPaths = buildDonutPaths(
    data.donut.length ? data.donut : [{ label: '—', pct: 100, color: '#E5E7EB' }],
    DONUT_CX,
    DONUT_CY,
    DONUT_R,
    DONUT_T,
  );

  const liked = data.mostLikedRecipes ?? [];

  return (
    <div className="analytics">

      <div className="analytics-header">
        <div className="filter-pills">
          {PERIOD_OPTIONS.map((p) => (
            <button
              key={p}
              type="button"
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

      <div className="kpi-cards">
        {data.kpi.map(({ label, value, change }, idx) => {
          const Icon = KPI_ICONS[idx];
          return (
            <div key={label} className="kpi-card">
              <div className="kpi-card-top">
                {change != null && (
                  <span className={`kpi-change kpi-change--${change >= 0 ? 'up' : 'down'}`}>
                    {change >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                    {Math.abs(change)}%
                  </span>
                )}
                <div className="kpi-icon"><Icon size={22} /></div>
              </div>
              <div className="kpi-value">{value}</div>
              <div className="kpi-label">{label}</div>
            </div>
          );
        })}
      </div>

      <div className="charts-row">

        <div className="widget-card">
          <div className="widget-header">
            <div className="line-chart-legend">
              <div className="legend-item">
                <span className="legend-dashed" />
                المنشورات
              </div>
              <div className="legend-item">
                <span className="legend-dot" style={{ background: '#7C0202' }} />
                المستخدمون
              </div>
            </div>
            <h2 className="widget-title">نمو المستخدمين والمنشورات</h2>
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
                  <stop offset="0%" stopColor="#9E2016" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#9E2016" stopOpacity="0" />
                </linearGradient>
              </defs>

              {[0.25, 0.5, 0.75].map((f) => (
                <line
                  key={f}
                  x1={0}
                  y1={SVG_H * f}
                  x2={SVG_W}
                  y2={SVG_H * f}
                  stroke="#E1BFB9"
                  strokeWidth="0.5"
                  strokeOpacity="0.5"
                />
              ))}

              <path d={usersChart.area} fill="url(#usersGrad)" />
              <path d={usersChart.line} fill="none" stroke="#9E2016" strokeWidth="2.5" strokeLinecap="round" />
              {usersChart.pts.map(([x, y], i) => (
                <g key={i}>
                  <circle cx={x} cy={y} r={5} fill="#9E2016" />
                  <circle cx={x} cy={y} r={8} fill="#9E2016" fillOpacity="0.12" />
                </g>
              ))}

              <path
                d={postsChart.line}
                fill="none"
                stroke="#2563EB"
                strokeWidth="2"
                strokeDasharray="6 4"
                strokeLinecap="round"
              />
              {postsChart.pts.map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r={4} fill="#2563EB" />
              ))}
            </svg>

            <div className="chart-month-labels">
              {data.labels.map((m, i) => <span key={`${m}-${i}`}>{m}</span>)}
            </div>
          </div>
        </div>

        <div className="widget-card">
          <div className="widget-header">
            <div />
            <h2 className="widget-title">توزيع الوصفات حسب المطبخ</h2>
          </div>
          <div className="donut-container">
            <div className="donut-svg-wrap">
              <svg viewBox="0 0 160 160" width="160" height="160">
                {donutPaths.map((seg, i) => (
                  <path key={i} d={seg.d} fill={seg.color} stroke="#fff" strokeWidth="2" />
                ))}
              </svg>
              <div className="donut-center-label">
                <span className="donut-center-value">
                  {Number(data.totalRecipes).toLocaleString('en-US')}
                </span>
                <span className="donut-center-sub">إجمالي الوصفات</span>
              </div>
            </div>
            <div className="donut-legend">
              {data.donut.map((seg, i) => (
                <div key={`${seg.label}-${i}`} className="donut-legend-item">
                  <span className="donut-dot" style={{ background: seg.color }} />
                  {seg.label} ({seg.pct}%)
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="widgets-row">

        <div className="widget-card">
          <div className="widget-header">
            <span className="pending-badge">{data.pending.posts} منشور</span>
            <h2 className="widget-title">بانتظار المراجعة</h2>
          </div>
          <div className="pending-split">
            <div className="pending-mini">
              <div className="pending-mini-label">منشورات</div>
              <div className="pending-mini-val">{data.pending.posts}</div>
            </div>
            <div className="pending-mini">
              <div className="pending-mini-label">صور</div>
              <div className="pending-mini-val">{data.pending.photos}</div>
            </div>
          </div>
          {data.pending.latest ? (
            <div className="pending-item">
              <div className="pending-info">
                <div className="pending-name">{data.pending.latest.name}</div>
                <div className="pending-time">
                  {data.pending.latest.chef
                    ? `${data.pending.latest.chef} · بانتظار المراجعة`
                    : 'بانتظار المراجعة'}
                </div>
              </div>
              <div className="pending-thumb">
                {data.pending.latest.cover ? (
                  <img src={data.pending.latest.cover} alt="" />
                ) : (
                  <ChefHat size={18} />
                )}
              </div>
            </div>
          ) : (
            <div className="pending-item">
              <div className="pending-info">
                <div className="pending-name">لا توجد منشورات معلّقة</div>
              </div>
            </div>
          )}
          <button
            type="button"
            className="pending-review-btn"
            onClick={() => navigate('/posts')}
          >
            مراجعة الكل
          </button>
        </div>

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
                  {(bars.length ? bars : [0]).map((h, i) => (
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

        {/* نفس تصميم الداشبورد */}
        <div className="widget-card">
          <div className="widget-header">
          
            <div className="widget-title analytics-liked-title">
              <div className="widget-title-icon" style={{ background: '#FEF3C7', color: '#B45309' }}>
                <Heart size={16} />
              </div>
              الأكثر تفاعلاً
            </div>
          </div>

          {liked.length === 0 ? (
            <p className="analytics-empty">لا توجد وصفات بإعجابات بعد</p>
          ) : (
            liked.map((r, i) => (
              <div key={r.id} className="top-recipe-item">
                <div className={`top-recipe-rank ${getRankClass(i)}`}>{i + 1}</div>
                <div className="top-recipe-info">
                  <div className="top-recipe-name">{r.name}</div>
                  <div className="top-recipe-author">{r.author}</div>
                </div>
                <div className="top-recipe-views">
                  <Heart size={14} />
                  {Number(r.likes).toLocaleString('en-US')}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};

export default Analytics;