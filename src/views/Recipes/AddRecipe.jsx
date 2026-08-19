// src/views/Recipes/AddRecipe.jsx
import { useRef, useState } from 'react';
import {
  Upload, Plus, Trash2, GripVertical,
  Clock, ChefHat, X, Check,
  Loader2, ChevronRight, AlertCircle,
} from 'lucide-react';
import { useAddRecipe, DIFFICULTY_OPTIONS } from '../../controllers/useAddRecipe';
import VideoThumb from '../../components/VideoThumb';
import './AddRecipe.css';

/* ── مكون رقم الخطوة ── */
const StepNumber = ({ n }) => <div className="ar-step-number">{n}</div>;

const QuickAddModal = ({
  kind,
  cuisineName,
  saving,
  error,
  setError,
  onClose,
  onSave,
}) => {
  const [itemName, setItemName] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const imageRef = useRef();
  const isCuisine = kind === 'cuisine';

  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  return (
    <div
      className="ar-overlay"
      onClick={(e) => e.target === e.currentTarget && !saving && onClose()}
    >
      <div className="ar-quick-modal">
        <div className="ar-quick-modal-header">
          <button type="button" className="ar-quick-modal-close" onClick={onClose} disabled={saving}>
            <X size={18} />
          </button>
          <h2 className="ar-quick-modal-title">
            {isCuisine ? 'إضافة مطبخ جديد' : 'إضافة تصنيف جديد'}
          </h2>
        </div>

        {!isCuisine && cuisineName && (
          <p className="ar-quick-modal-hint">
            سيُضاف التصنيف داخل مطبخ <strong>{cuisineName}</strong>
          </p>
        )}

        <div className="ar-field">
          <label className="ar-label">الاسم</label>
          <input
            className="ar-input"
            placeholder={isCuisine ? 'مثال: المطبخ الشامي' : 'مثال: مشاوي'}
            value={itemName}
            onChange={(e) => { setItemName(e.target.value); setError(''); }}
            disabled={saving}
            autoFocus
          />
        </div>

        <div className="ar-field">
          <label className="ar-label">الصورة <span className="ar-optional">(اختياري)</span></label>
          <button
            type="button"
            className="ar-quick-image"
            onClick={() => !saving && imageRef.current?.click()}
          >
            {preview
              ? <img src={preview} alt="" className="ar-quick-image-preview" />
              : <span>انقر لاختيار صورة</span>
            }
          </button>
          <input
            ref={imageRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleImage}
          />
        </div>

        {error && <p className="ar-quick-modal-error">{error}</p>}

        <div className="ar-quick-modal-actions">
          <button type="button" className="ar-btn-draft" onClick={onClose} disabled={saving}>
            إلغاء
          </button>
          <button
            type="button"
            className="ar-btn-save"
            onClick={() => onSave({ name: itemName, image: imageFile })}
            disabled={saving || !itemName.trim()}
          >
            {saving ? <><Loader2 size={14} className="ar-spin" /> جاري الحفظ...</> : 'حفظ'}
          </button>
        </div>
      </div>
    </div>
  );
};

const AddRecipe = () => {
  const fileRef = useRef();

  const {
    /* حقول النموذج */
    name,        setName,
    desc,        setDesc,
    prepTime,    setPrepTime,
    cookTime,    setCookTime,
    difficulty,  setDifficulty,
    servings,    setServings,

    /* المطابخ والتصنيفات */
    cuisines,
    categories,
    selectedCuisine,  setSelectedCuisine,
    selectedCategory, setSelectedCategory,
    cuisinesLoading,
    catsLoading,
    quickAdd,
    quickAddSaving,
    quickAddError,
    setQuickAddError,
    openQuickAdd,
    closeQuickAdd,
    handleQuickAddSave,

    /* الوسائط */
    mediaPreviews,
    addMediaFiles,
    removeMedia,

    /* المقادير */
    ingredients,
    addIngredient,
    updateIngredient,
    removeIngredient,

    /* الخطوات */
    steps,
    addStep,
    updateStep,
    removeStep,

    /* القيم الغذائية */
    calories, setCalories,
    protein,  setProtein,
    carbs,    setCarbs,
    fat,      setFat,

    /* الإرسال والأخطاء */
    saving,
    errors,
    apiError,
    setApiError,
    clearErr,
    handleSubmit,
    handleCancel,
  } = useAddRecipe();

  /* ═══════════════════════════════════ RENDER ═══════════════════════════════════ */
  return (
    <div className="ar-page">

      {/* ── شريط العنوان ── */}
      <div className="ar-topbar">
        <div className="ar-breadcrumb">
          <span className="ar-back-btn" onClick={handleCancel}>الوصفات</span>
          <ChevronRight size={12} className="ar-breadcrumb-sep" />
          <span className="ar-breadcrumb-current">إضافة وصفة جديدة</span>
        </div>
        <div className="ar-page-title">إضافة وصفة جديدة</div>
      </div>

      {/* ── خطأ API ── */}
      {apiError && (
        <div className="ar-api-error">
          <AlertCircle size={16} />
          <span>{apiError}</span>
          <button className="ar-api-error-close" onClick={() => setApiError('')}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* ── الجسم ── */}
      <div className="ar-body">

        {/* ══════════ العمود الأيسر ══════════ */}
        <div className="ar-left-col">

          {/* بطاقة 1: المعلومات الأساسية */}
          <div className="ar-card">
            <div className="ar-card-title-row">
              <div className="ar-card-title">المعلومات الأساسية</div>
              <div className="ar-card-title-bar" />
            </div>

            <div className="ar-field">
              <label className="ar-label">
                اسم الوصفة <span className="ar-required">*</span>
              </label>
              <input
                className={`ar-input${errors.name ? ' ar-input--error' : ''}`}
                placeholder="مثال: كبسة لحم فاخرة"
                value={name}
                onChange={(e) => { setName(e.target.value); clearErr('name'); }}
              />
              {errors.name && <span className="ar-field-error">{errors.name}</span>}
            </div>

            <div className="ar-field">
              <label className="ar-label">وصف الوصفة</label>
              <textarea
                className="ar-input ar-textarea"
                placeholder="اكتب نبذة قصيرة عن الوصفة..."
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                rows={3}
              />
            </div>

            <div className="ar-row-2">
              <div className="ar-field">
                <label className="ar-label">
                  وقت التحضير (دقيقة) <span className="ar-required">*</span>
                </label>
                <div className="ar-input-icon-wrap">
                  <Clock size={17} className="ar-input-icon" />
                  <input
                    className={`ar-input ar-input--icon${errors.prepTime ? ' ar-input--error' : ''}`}
                    type="number" min="1"
                    placeholder="15"
                    value={prepTime}
                    onChange={(e) => { setPrepTime(e.target.value); clearErr('prepTime'); }}
                  />
                </div>
                {errors.prepTime && <span className="ar-field-error">{errors.prepTime}</span>}
              </div>
              <div className="ar-field">
                <label className="ar-label">وقت الطهي (دقيقة)</label>
                <div className="ar-input-icon-wrap">
                  <ChefHat size={17} className="ar-input-icon" />
                  <input
                    className="ar-input ar-input--icon"
                    type="number" min="1"
                    placeholder="45"
                    value={cookTime}
                    onChange={(e) => setCookTime(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="ar-row-2">
              <div className="ar-field">
                <label className="ar-label">درجة الصعوبة</label>
                <select
                  className="ar-input ar-select"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                >
                  {DIFFICULTY_OPTIONS.map((d) => (
                    <option key={d.value} value={d.label}>{d.label}</option>
                  ))}
                </select>
              </div>
              <div className="ar-field">
                <label className="ar-label">عدد الأشخاص</label>
                <div className="ar-stepper">
                  <button
                    type="button"
                    className="ar-stepper-btn"
                    onClick={() => setServings((s) => Math.max(1, s - 1))}
                  >−</button>
                  <input
                    className="ar-input ar-stepper-input"
                    type="number" min="1"
                    value={servings}
                    onChange={(e) => setServings(Math.max(1, Number(e.target.value)))}
                  />
                  <button
                    type="button"
                    className="ar-stepper-btn"
                    onClick={() => setServings((s) => s + 1)}
                  >+</button>
                </div>
              </div>
            </div>
          </div>

          {/* بطاقة 2: التصنيف والمطبخ */}
          <div className="ar-card">
            <div className="ar-card-title-divider">
              التصنيف والمطبخ <span className="ar-required">*</span>
            </div>

            {cuisinesLoading ? (
              <div className="ar-loading-row">
                <Loader2 size={16} className="ar-spin" />
                <span>جاري تحميل المطابخ...</span>
              </div>
            ) : (
              <div className="ar-row-2">
                <div className="ar-field">
                  <label className="ar-label">نوع المطبخ</label>
                  <div className="ar-select-with-add">
                    <select
                      className="ar-input ar-select"
                      value={selectedCuisine?.id ?? ''}
                      onChange={(e) => {
                        const c = cuisines.find((c) => String(c.id) === e.target.value);
                        setSelectedCuisine(c ?? null);
                        clearErr('category');
                      }}
                    >
                      {cuisines.length === 0 && <option value="">لا توجد مطابخ</option>}
                      {cuisines.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="ar-add-inline-btn"
                      title="إضافة مطبخ جديد"
                      onClick={() => openQuickAdd('cuisine')}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                <div className="ar-field">
                  <label className="ar-label">التصنيف الفرعي</label>
                  {catsLoading ? (
                    <div className="ar-input ar-cats-loading">
                      <Loader2 size={14} className="ar-spin" />
                      <span>تحميل...</span>
                    </div>
                  ) : (
                    <div className="ar-select-with-add">
                      <select
                        className={`ar-input ar-select${errors.category ? ' ar-input--error' : ''}`}
                        value={selectedCategory?.id ?? ''}
                        onChange={(e) => {
                          const c = categories.find((c) => String(c.id) === e.target.value);
                          setSelectedCategory(c ?? null);
                          clearErr('category');
                        }}
                        disabled={!selectedCuisine || categories.length === 0}
                      >
                        {categories.length === 0
                          ? <option value="">لا توجد تصنيفات</option>
                          : categories.map((c) => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))
                        }
                      </select>
                      <button
                        type="button"
                        className="ar-add-inline-btn"
                        title={selectedCuisine ? `إضافة تصنيف داخل ${selectedCuisine.name}` : 'اختر مطبخاً أولاً'}
                        disabled={!selectedCuisine}
                        onClick={() => selectedCuisine && openQuickAdd('category')}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  )}
                  {errors.category && <span className="ar-field-error">{errors.category}</span>}
                </div>
              </div>
            )}
          </div>

          {/* بطاقة 3: المقادير */}
          <div className="ar-card">
            <div className="ar-card-title-badge-row">
              <div className="ar-count-badge">
                {ingredients.filter((i) => i.text.trim()).length} مكونات
              </div>
              <div className="ar-card-title">
                المقادير <span className="ar-required">*</span>
              </div>
            </div>

            {errors.ingredients && (
              <div className="ar-inline-error">
                <AlertCircle size={13} />
                {errors.ingredients}
              </div>
            )}

            <div className="ar-ingredients-list">
              {ingredients.map((ing, idx) => (
                <div key={ing.id} className="ar-ingredient-row">
                  <span className="ar-ing-num">{idx + 1}</span>
                  <input
                    className="ar-input ar-ing-text"
                    placeholder={`المكون ${idx + 1}، مثال: كوبان دقيق`}
                    value={ing.text}
                    onChange={(e) => {
                      updateIngredient(ing.id, e.target.value);
                      if (errors.ingredients) clearErr('ingredients');
                    }}
                  />
                  <button
                    type="button"
                    className="ar-remove-btn"
                    onClick={() => removeIngredient(ing.id)}
                    title="حذف"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            <button type="button" className="ar-dashed-btn" onClick={addIngredient}>
              <Plus size={14} />
              إضافة مكون
            </button>
          </div>

          {/* بطاقة 4: خطوات التحضير */}
          <div className="ar-card">
            <div className="ar-card-title-badge-row">
              <div className="ar-count-badge">
                {steps.filter((s) => s.text.trim()).length} خطوات
              </div>
              <div className="ar-card-title">
                خطوات التحضير <span className="ar-required">*</span>
              </div>
            </div>

            {errors.steps && (
              <div className="ar-inline-error">
                <AlertCircle size={13} />
                {errors.steps}
              </div>
            )}

            <div className="ar-steps-list">
              {steps.map((step, idx) => (
                <div key={step.id} className="ar-step-row">
                  <div className="ar-step-number-col">
                    <StepNumber n={idx + 1} />
                    {idx < steps.length - 1 && <div className="ar-step-connector" />}
                  </div>
                  <div className="ar-step-content">
                    <div className="ar-step-header">
                      <button
                        type="button"
                        className="ar-remove-btn"
                        onClick={() => removeStep(step.id)}
                        title="حذف"
                      >
                        <Trash2 size={14} />
                      </button>
                      <GripVertical size={14} className="ar-drag-handle" />
                    </div>
                    <textarea
                      className="ar-input ar-step-textarea"
                      placeholder={`الخطوة ${idx + 1}...`}
                      value={step.text}
                      onChange={(e) => {
                        updateStep(step.id, e.target.value);
                        if (errors.steps) clearErr('steps');
                      }}
                      rows={2}
                    />
                  </div>
                </div>
              ))}
            </div>

            <button type="button" className="ar-dashed-btn" onClick={addStep}>
              <Plus size={16} />
              إضافة خطوة
            </button>
          </div>

        </div>

        {/* ══════════ العمود الأيمن ══════════ */}
        <div className="ar-right-col">

          {/* بانيل 1: الوسائط */}
          <div className="ar-card ar-card--panel">
            <div className="ar-panel-title">صور ووسائط الوصفة</div>

            <div
              className="ar-upload-area"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files?.length) addMediaFiles(e.dataTransfer.files);
              }}
              onClick={() => fileRef.current?.click()}
            >
              <div className="ar-upload-placeholder">
                <div className="ar-upload-icon-circle">
                  <Upload size={22} color="#C0392B" />
                </div>
                <p className="ar-upload-text">
                  اسحب ملفات هنا أو
                  <span className="ar-upload-link">اختر من جهازك</span>
                </p>
                <p className="ar-upload-hint">صور وفيديو، حتى 5MB لكل ملف</p>
              </div>
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/*,video/*"
              multiple
              style={{ display: 'none' }}
              onChange={(e) => {
                if (e.target.files?.length) addMediaFiles(e.target.files);
                e.target.value = '';
              }}
            />

            {mediaPreviews.length > 0 && (
              <div className="ar-media-grid">
                {mediaPreviews.map((m, i) => (
                  <div key={`${m.url}-${i}`} className="ar-media-thumb">
                    {m.type === 'video'
                      ? <VideoThumb src={m.url} poster={m.poster} playSize={28} />
                      : <img src={m.url} alt="" className="ar-media-thumb-img" />
                    }
                    <button
                      type="button"
                      className="ar-media-thumb-remove"
                      onClick={(e) => { e.stopPropagation(); removeMedia(i); }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="ar-media-add-more"
                  onClick={() => fileRef.current?.click()}
                  title="إضافة المزيد"
                >
                  <Plus size={20} />
                </button>
              </div>
            )}
          </div>

          {/* بانيل 2: المعلومات الغذائية */}
          <div className="ar-card ar-card--panel">
            <div className="ar-panel-title">
              المعلومات الغذائية
              <span className="ar-optional">(اختياري)</span>
            </div>
            <div className="ar-nutrition-grid">
              {[
                { label: 'سعرات حرارية',    val: calories, set: setCalories },
                { label: 'بروتين (جم)',      val: protein,  set: setProtein  },
                { label: 'كربوهيدرات (جم)', val: carbs,    set: setCarbs    },
                { label: 'دهون (جم)',        val: fat,      set: setFat      },
              ].map(({ label, val, set }) => (
                <div key={label} className="ar-nutrition-field">
                  <label className="ar-nutrition-label">{label}</label>
                  <input
                    className="ar-input ar-nutrition-input"
                    type="number" min="0"
                    placeholder="0"
                    value={val}
                    onChange={(e) => set(e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* أزرار الحفظ والإلغاء */}
          <button
            type="button"
            className="ar-btn-save"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving
              ? <><Loader2 size={18} className="ar-spin" /> جاري الحفظ...</>
              : <><Check size={18} /> حفظ الوصفة</>
            }
          </button>

          <button
            type="button"
            className="ar-btn-draft"
            onClick={handleCancel}
            disabled={saving}
          >
            إلغاء
          </button>

        </div>
      </div>

      {quickAdd && (
        <QuickAddModal
          kind={quickAdd}
          cuisineName={selectedCuisine?.name}
          saving={quickAddSaving}
          error={quickAddError}
          setError={setQuickAddError}
          onClose={closeQuickAdd}
          onSave={handleQuickAddSave}
        />
      )}
    </div>
  );
};

export default AddRecipe;