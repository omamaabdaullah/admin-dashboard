// src/views/Recipes/RecipeDetail.jsx
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Trash2, Eye, Heart, MessageCircle, Clock, Users, ChefHat,
  BarChart2, Calendar, ChevronRight, ChevronLeft, Loader2, PlayCircle,
} from 'lucide-react';
import { deleteRecipe } from '../../models/recipesModel';
import './RecipeDetail.css';



const formatDateAr = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('ar-EG', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
};

const mediaType = (m) => (typeof m.type === 'object' ? m.type?.value : m.type);

const mapRecipe = (raw) => {
  if (!raw) return null;

  const ingredients = Array.isArray(raw.ingredients)
    ? raw.ingredients.map((ing) =>
        typeof ing === 'string'
          ? { name: ing, qty: '', unit: '' }
          : ing
      )
    : [];

  const steps = Array.isArray(raw.steps)
    ? raw.steps.map((step, i) => {
        if (typeof step === 'string') {
          const cleaned = step.replace(/^\d+[-.)]\s*/, '').trim();
          return { title: `الخطوة ${i + 1}`, text: cleaned || step };
        }
        return step;
      })
    : [];

  const media = Array.isArray(raw.media)
    ? [...raw.media].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    : [];

  return {
    id: raw.id,
    name: raw.name ?? '—',
    description: raw.description ?? '',
    status: raw.status ?? 'published',
    kitchen: raw.kitchen ?? raw.category?.cuisine?.name ?? '—',
    category: raw.categoryName ?? raw.category?.name ?? '—',
    date: raw.addedDate ?? formatDateAr(raw.created_at),
    prepTime: raw.prep_time != null ? `${raw.prep_time} دقيقة` : '—',
    cookTime: raw.cook_time != null ? `${raw.cook_time} دقيقة` : '—',
    servings: raw.servings != null ? `${raw.servings} أشخاص` : '—',
    difficulty: raw.difficultyLabel
      ?? (typeof raw.difficulty === 'object' ? raw.difficulty?.label : raw.difficulty)
      ?? '—',
    media,
    chef: {
      name: raw.author ? `الشيف ${raw.author}` : (raw.user?.name ? `الشيف ${raw.user.name}` : '—'),
      verified: false,
      avatar: null,
      recipes: '—',
      rating: '—',
    },
    ingredients,
    steps,
    nutrition: {
      calories: raw.nutrition?.calories,
      protein:  raw.nutrition?.protein,
      carbs:    raw.nutrition?.carbs,
      fat:      raw.nutrition?.fat,
    },
    stats: {
      views: '—',
      likes: raw.likes_count ?? 0,
      comments: raw.comments_count ?? 0,
      rating: '—',
    },
  };
};

const RecipeDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const recipe = mapRecipe(location.state?.recipe);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [activeMedia, setActiveMedia] = useState(0);

  if (!recipe) {
    return (
      <div className="rd-page">
        <div className="rd-empty">
          <p>لم يتم العثور على بيانات الوصفة.</p>
          <button type="button" className="rd-btn rd-btn--approve" onClick={() => navigate('/recipes')}>
            العودة للوصفات
          </button>
        </div>
      </div>
    );
  }

  const currentMedia = recipe.media[activeMedia] ?? null;
  const hasMultipleMedia = recipe.media.length > 1;

  const goToMedia = (index) => {
    if (index < 0 || index >= recipe.media.length) return;
    setActiveMedia(index);
  };

  const handleDelete = async () => {
    setDeleting(true);
    setError('');
    try {
      await deleteRecipe(recipe.id);
      navigate('/recipes');
    } catch {
      setError('فشل حذف الوصفة');
      setDeleting(false);
    }
  };

  return (
    <div className="rd-page">

      <div className="rd-action-bar">
<div className="rd-title-group">
  <div className="rd-title-row">
    <h1 className="rd-recipe-name">{recipe.name}</h1>
  </div>
          <div className="rd-breadcrumb">
            <span className="rd-bc-link" onClick={() => navigate('/recipes')}>الوصفات</span>
            <ChevronRight size={12} className="rd-bc-sep" />
            <span className="rd-bc-current">تفاصيل الوصفة</span>
          </div>
        </div>

        <div className="rd-action-btns">
          <button
            className="rd-btn rd-btn--delete"
            onClick={() => setConfirmDelete(true)}
            disabled={deleting}
          >
            <Trash2 size={16} />
            حذف
          </button>
        </div>
      </div>

      {error && <div className="rd-error">{error}</div>}

      <div className="rd-body">
        <div className="rd-left-col">

          <div className="rd-card rd-media-card">
            <div className="rd-image-wrap">
              {currentMedia ? (
                mediaType(currentMedia) === 'video' ? (
                  <video
                    key={currentMedia.id ?? currentMedia.url}
                    src={currentMedia.url}
                    className="rd-image"
                    controls
                  />
                ) : (
                  <img
                    key={currentMedia.id ?? currentMedia.url}
                    src={currentMedia.url}
                    alt={recipe.name}
                    className="rd-image"
                  />
                )
              ) : (
                <div className="rd-image-placeholder">🍽️</div>
              )}

              <div className="rd-image-gradient" />
              <div className="rd-image-overlay">
                <h2 className="rd-overlay-name">{recipe.name}</h2>
                <div className="rd-overlay-meta">
                  <div className="rd-overlay-date">
                    <Calendar size={16} />
                    <span>أضيفت في: {recipe.date}</span>
                  </div>
                </div>
              </div>

              {hasMultipleMedia && (
                <>
                  <button
                    type="button"
                    className="rd-media-nav rd-media-nav--prev"
                    onClick={() => goToMedia(activeMedia - 1)}
                    disabled={activeMedia === 0}
                  >
                    <ChevronRight size={18} />
                  </button>
                  <button
                    type="button"
                    className="rd-media-nav rd-media-nav--next"
                    onClick={() => goToMedia(activeMedia + 1)}
                    disabled={activeMedia === recipe.media.length - 1}
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <span className="rd-media-counter">
                    {activeMedia + 1} / {recipe.media.length}
                  </span>
                </>
              )}
            </div>

            {hasMultipleMedia && (
              <div className="rd-media-thumbs">
                {recipe.media.map((m, i) => (
                  <button
                    type="button"
                    key={m.id ?? i}
                    className={`rd-media-thumb${i === activeMedia ? ' rd-media-thumb--active' : ''}`}
                    onClick={() => goToMedia(i)}
                  >
                    {mediaType(m) === 'video' ? (
                      <>
                        <video src={m.url} className="rd-media-thumb-img" muted />
                        <span className="rd-media-thumb-play">
                          <PlayCircle size={18} />
                        </span>
                      </>
                    ) : (
                      <img src={m.url} alt="" className="rd-media-thumb-img" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="rd-card">
            <div className="rd-section-title">
              المعلومات الأساسية
              <span className="rd-title-bar" />
            </div>
            <div className="rd-info-grid">
              {[
                { icon: <Clock size={16} />,     label: 'وقت التحضير', value: recipe.prepTime },
                { icon: <Users size={16} />,     label: 'عدد الأشخاص', value: recipe.servings },
                { icon: <ChefHat size={16} />,   label: 'وقت الطهي',   value: recipe.cookTime },
                { icon: <BarChart2 size={16} />, label: 'مستوى الصعوبة', value: recipe.difficulty },
              ].map((item, i) => (
                <div key={i} className="rd-info-cell">
                  <div className="rd-info-icon">{item.icon}</div>
                  <span className="rd-info-label">{item.label}</span>
                  <span className="rd-info-value">{item.value}</span>
                </div>
              ))}
            </div>
            <p className="rd-description">{recipe.description}</p>
          </div>

          <div className="rd-card">
            <div className="rd-card-header">
              <span className="rd-count-badge">{recipe.ingredients.length} مكونات</span>
              <div className="rd-section-title rd-section-title--inline">المقادير</div>
            </div>
            <div className="rd-ingredients">
              {recipe.ingredients.map((ing, i) => (
                <div key={i} className={`rd-ingredient-row${i % 2 === 1 ? ' rd-ingredient-row--alt' : ''}`}>
                  {(ing.qty || ing.unit) && (
                    <span className="rd-ing-qty">{ing.qty} {ing.unit}</span>
                  )}
                  <div className="rd-ing-sep" />
                  <div className="rd-ing-dot" />
                  <span className="rd-ing-name">{ing.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rd-card">
            <div className="rd-card-header">
              <span className="rd-count-badge">{recipe.steps.length} خطوات</span>
              <div className="rd-section-title rd-section-title--inline">خطوات التحضير</div>
            </div>
            <div className="rd-steps">
              {recipe.steps.map((step, i) => (
                <div key={i} className="rd-step-row">
                  <div className="rd-step-number-col">
                    <div className="rd-step-num">{i + 1}</div>
                    {i < recipe.steps.length - 1 && <div className="rd-step-line" />}
                  </div>
                  <div className="rd-step-card">
                    <h3 className="rd-step-title">{step.title}</h3>
                    <p className="rd-step-text">{step.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        <div className="rd-right-col">

          <div className="rd-card rd-chef-card">
            <div className="rd-chef-avatar-wrap">
              <div className="rd-chef-avatar-placeholder">👨‍🍳</div>
            </div>
            <h3 className="rd-chef-name">{recipe.chef.name}</h3>
          </div>

          <div className="rd-card">
            <div className="rd-section-title rd-section-title--inline">التصنيف</div>
            <div className="rd-tags-row">
              <span className="rd-tag rd-tag--kitchen">🍽️ {recipe.kitchen}</span>
              <span className="rd-tag rd-tag--cat">{recipe.category}</span>
            </div>
          </div>

          <div className="rd-card">
            <div className="rd-section-title rd-section-title--inline">
              المعلومات الغذائية
              <span className="rd-optional">(للحصة)</span>
            </div>
            <div className="rd-nutrition-grid">
              {[
                { val: recipe.nutrition.protein,  unit: 'g',    label: 'بروتين',       border: '#DCFCE7', color: '#16A34A', bg: 'rgba(240,253,244,0.3)' },
                { val: recipe.nutrition.calories, unit: 'سعرة', label: 'سعرة حرارية',  border: '#FEE2E2', color: '#DC2626', bg: 'rgba(254,242,242,0.3)' },
                { val: recipe.nutrition.fat,      unit: 'g',    label: 'دهون',         border: '#DBEAFE', color: '#2563EB', bg: 'rgba(239,246,255,0.3)' },
                { val: recipe.nutrition.carbs,    unit: 'g',    label: 'كربوهيدرات',   border: '#FFEDD5', color: '#EA580C', bg: 'rgba(255,247,237,0.3)' },
              ].map((n, i) => (
                <div key={i} className="rd-nut-circle"
                  style={{ borderColor: n.border, background: n.bg }}>
                  <span className="rd-nut-val" style={{ color: n.color }}>
                    {n.val == null ? '—' : `${n.val}${n.unit}`}
                  </span>
                  <span className="rd-nut-label">{n.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rd-card">
            <div className="rd-section-title rd-section-title--inline">إحصائيات التفاعل</div>
            <div className="rd-stats-list">
              {[
                { icon: <Eye size={18} />, label: 'المشاهدات', val: recipe.stats.views },
                { icon: <Heart size={18} />, label: 'الإعجابات', val: recipe.stats.likes },
                { icon: <MessageCircle size={18} />, label: 'التعليقات', val: recipe.stats.comments },
              ].map((s, i) => (
                <div key={i} className="rd-stat-row">
                  <span className="rd-stat-val">{s.val}</span>
                  <div className="rd-stat-label-group">
                    <span className="rd-stat-label">{s.label}</span>
                    <span className="rd-stat-icon">{s.icon}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {confirmDelete && (
        <div className="confirm-overlay">
          <div className="confirm-dialog">
            <h3 className="confirm-title">تأكيد الحذف</h3>
            <p className="confirm-text">هل أنت متأكد من حذف هذه الوصفة نهائياً؟</p>
            <div className="confirm-actions">
              <button
                className="confirm-btn confirm-btn--cancel"
                onClick={() => setConfirmDelete(false)}
                disabled={deleting}
              >
                إلغاء
              </button>
              <button
                className="confirm-btn confirm-btn--delete"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? <Loader2 size={16} className="rd-spin" /> : 'حذف'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeDetail;