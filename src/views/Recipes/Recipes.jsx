// src/views/Recipes/Recipes.jsx
import { useNavigate } from 'react-router-dom';
import {
  Search, Eye, Trash2, Plus, ChefHat,
  Filter, Loader2, ChevronRight, ChevronLeft,
  Heart,
} from 'lucide-react';
import {
  useRecipes,
  DIFFICULTY_OPTIONS,
} from '../../controllers/useRecipes';
import './Recipes.css';

const ActionBtn = ({ icon: Icon, color, title, onClick, disabled }) => (
  <button
    className={`recipe-action-btn recipe-action-btn--${color}`}
    title={title}
    onClick={onClick}
    disabled={disabled}
  >
    <Icon size={14} />
  </button>
);

const RecipeThumb = ({ recipe }) => (
  <div className="recipe-thumb">
    {recipe.image
      ? <img src={recipe.image} alt={recipe.name} className="recipe-thumb-img" />
      : recipe.videoThumb
        ? (
          <video
            src={recipe.videoThumb}
            className="recipe-thumb-img"
            preload="metadata"
            muted
            playsInline
          />
        )
        : <ChefHat size={18} />
    }
  </div>
);

const Recipes = () => {
  const navigate = useNavigate();

  const {
    recipes,
    meta,
    total,
    loading,
    error,
    search,
    difficulty,
    page,
    actionLoading,
    confirmDelete,
    setSearch,
    setDifficulty,
    setConfirmDelete,
    handlePageChange,
    handleRetry,
    handleDelete,
  } = useRecipes();

  const isWorking = actionLoading !== null;
  const lastPage = meta?.last_page ?? 1;

  return (
    <div className="recipes-page">

      <div className="recipes-header">
        <h1 className="recipes-title">إدارة الوصفات</h1>
        <div className="recipes-header-actions">
          <div className="recipes-search-wrapper">
            <Search size={16} className="recipes-search-icon" />
            <input
              className="recipes-search"
              type="text"
              placeholder="ابحث عن وصفة..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="recipes-add-btn" onClick={() => navigate('/recipes/add')}>
            <Plus size={16} />
            <span className="recipes-add-btn-text">إضافة وصفة جديدة</span>
          </button>
        </div>
      </div>

      <div className="recipes-controls">
        <div className="recipes-filter-group">
          <div className="recipes-filter-select">
            <Filter size={15} />
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              disabled={!!search.trim()}
            >
              {DIFFICULTY_OPTIONS.map((d) => (
                <option key={d.value || 'all'} value={d.value}>{d.label}</option>
              ))}
            </select>
            <span className="recipes-filter-label">
              الصعوبة: {DIFFICULTY_OPTIONS.find((d) => d.value === difficulty)?.label || 'الكل'}
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="recipes-error">
          <span>{error}</span>
          <button type="button" className="recipes-error-retry" onClick={handleRetry}>
            إعادة المحاولة
          </button>
        </div>
      )}

      <div className="recipes-table-card">
        <div className="recipes-table-wrap">
          <table className="recipes-table">
            <thead>
              <tr>
                <th className="col-recipe">الوصفة</th>
                <th className="col-kitchen">المطبخ</th>
                <th className="col-category">التصنيف</th>
                <th className="col-likes">الإعجابات</th>
                <th className="col-date">تاريخ الإضافة</th>
                <th className="col-details">التفاصيل</th>
                <th className="col-actions">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="recipes-loading-cell">
                    <Loader2 size={22} className="recipes-spin" />
                    جاري تحميل الوصفات...
                  </td>
                </tr>
              ) : recipes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="recipes-empty">لا توجد وصفات مطابقة</td>
                </tr>
              ) : (
                recipes.map((recipe) => (
                  <tr key={recipe.id} className="recipes-row">
                    <td className="col-recipe">
                      <div className="recipe-info">
                        <RecipeThumb recipe={recipe} />
                        <div className="recipe-text">
                          <span className="recipe-name">{recipe.name}</span>
                          <span className="recipe-author">بواسطة: {recipe.author}</span>
                        </div>
                      </div>
                    </td>

                    <td className="col-kitchen">
                      <span className="recipe-kitchen-badge">{recipe.kitchen}</span>
                    </td>

                    <td className="col-category">
                      <span className="recipe-cat-badge">{recipe.categoryName}</span>
                    </td>

                    <td className="col-likes">
                      <div className="recipe-stat-cell">
                        <Heart size={13} className="recipe-stat-icon recipe-stat-icon--red" />
                        <span className="recipe-stat-value">{recipe.likes_count ?? 0}</span>
                      </div>
                    </td>

                    <td className="col-date">
                      <span className="recipe-date">{recipe.addedDate}</span>
                    </td>

                    <td className="col-details">
                      <div className="recipe-details-cell">
                        <ActionBtn
                          icon={Eye}
                          color="gray"
                          title="عرض التفاصيل"
                          onClick={() => navigate('/recipes/detail', { state: { recipe } })}
                        />
                      </div>
                    </td>

                    <td className="col-actions">
                      <div className="recipe-actions">
                        <ActionBtn
                          icon={Trash2}
                          color="red"
                          title="حذف"
                          onClick={() => setConfirmDelete(recipe.id)}
                          disabled={isWorking}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && recipes.length > 0 && (
          <div className="recipes-mobile-list">
            {recipes.map((recipe) => (
              <div key={recipe.id} className="recipe-mobile-card">
                <div className="recipe-mobile-top">
                  <div className="recipe-mobile-actions">
                    <ActionBtn
                      icon={Eye}
                      color="gray"
                      title="عرض التفاصيل"
                      onClick={() => navigate('/recipes/detail', { state: { recipe } })}
                    />
                    <ActionBtn
                      icon={Trash2}
                      color="red"
                      title="حذف"
                      onClick={() => setConfirmDelete(recipe.id)}
                      disabled={isWorking}
                    />
                  </div>
                  <div className="recipe-mobile-info">
                    <RecipeThumb recipe={recipe} />
                    <div className="recipe-text">
                      <span className="recipe-name">{recipe.name}</span>
                      <span className="recipe-author">بواسطة: {recipe.author}</span>
                    </div>
                  </div>
                </div>
                <div className="recipe-mobile-meta">
                  <span className="recipe-kitchen-badge">{recipe.kitchen}</span>
                  <span className="recipe-cat-badge">{recipe.categoryName}</span>
                </div>
                <div className="recipe-mobile-stats">
                  <div className="recipe-mobile-stat">
                    <Heart size={12} className="recipe-stat-icon--red" />
                    <span className="recipe-stat-value">{recipe.likes_count ?? 0}</span>
                    <span className="recipe-mobile-stat-label">إعجاب</span>
                  </div>
                  <span className="recipe-date">{recipe.addedDate}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {loading && (
          <div className="recipes-mobile-list">
            <div className="recipes-loading-cell">
              <Loader2 size={22} className="recipes-spin" />
              جاري تحميل الوصفات...
            </div>
          </div>
        )}

        {!loading && lastPage > 1 && (
          <div className="recipes-pagination">
            <button
              type="button"
              className="recipes-page-btn"
              disabled={page <= 1 || isWorking}
              onClick={() => handlePageChange(page - 1)}
            >
              <ChevronRight size={16} />
              <span className="recipes-page-btn-text">السابق</span>
            </button>
            <span className="recipes-page-info">
              صفحة {page} من {lastPage} — الإجمالي {total}
            </span>
            <button
              type="button"
              className="recipes-page-btn"
              disabled={page >= lastPage || isWorking}
              onClick={() => handlePageChange(page + 1)}
            >
              <span className="recipes-page-btn-text">التالي</span>
              <ChevronLeft size={16} />
            </button>
          </div>
        )}
      </div>

      {confirmDelete && (
        <div className="confirm-overlay">
          <div className="confirm-dialog">
            <h3 className="confirm-title">تأكيد الحذف</h3>
            <p className="confirm-text">
              هل أنت متأكد من حذف هذه الوصفة نهائياً؟ لا يمكن التراجع عن هذا الإجراء.
            </p>
            <div className="confirm-actions">
              <button
                className="confirm-btn confirm-btn--cancel"
                onClick={() => setConfirmDelete(null)}
                disabled={actionLoading === `delete_${confirmDelete}`}
              >
                إلغاء
              </button>
              <button
                className="confirm-btn confirm-btn--delete"
                onClick={() => handleDelete(confirmDelete)}
                disabled={actionLoading === `delete_${confirmDelete}`}
              >
                {actionLoading === `delete_${confirmDelete}`
                  ? <Loader2 size={16} className="recipes-spin" />
                  : 'حذف'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Recipes;