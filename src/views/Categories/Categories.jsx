// src/views/Categories/Categories.jsx
import { useRef, useState } from 'react';
import {
  Plus, Pencil, Trash2, X,
  Loader2, RefreshCw, CheckCircle, AlertCircle,
} from 'lucide-react';
import { useCategories } from '../../controllers/useCategories';
import './Categories.css';

/* ══════════════════════════════════════════════════════
   مودال مشترك (اسم + صورة)
══════════════════════════════════════════════════════ */
const ItemModal = ({ title, item, onClose, onSave, saveLoading, saveError, setSaveError }) => {
  const [name,      setName]      = useState(item?.name  || '');
  const [imageFile, setImageFile] = useState(null);
  const [preview,   setPreview]   = useState(item?.image || null);
  const fileRef = useRef();

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  return (
    <div
      className="cat-overlay"
      onClick={e => e.target === e.currentTarget && !saveLoading && onClose()}
    >
      <div className="cat-modal">
        <div className="cat-modal-header">
          <button className="cat-modal-close" onClick={onClose} disabled={saveLoading}>
            <X size={18} />
          </button>
          <h2 className="cat-modal-title">{title}</h2>
        </div>

        <div className="cat-field">
          <label className="cat-field-label">الاسم</label>
          <input
            className="cat-field-input"
            placeholder="أدخل الاسم..."
            value={name}
            onChange={e => setName(e.target.value)}
            disabled={saveLoading}
          />
        </div>

        <div className="cat-field">
          <label className="cat-field-label">الصورة (اختياري)</label>
          <div className="cat-image-upload" onClick={() => !saveLoading && fileRef.current.click()}>
            {preview
              ? <img src={preview} alt="preview" className="cat-image-preview" />
              : <span className="cat-image-placeholder">انقر لاختيار صورة</span>
            }
          </div>
          <input ref={fileRef} type="file" accept="image/*"
            style={{ display: 'none' }} onChange={handleImage} />
        </div>

        {saveError && <p className="cat-modal-error">{saveError}</p>}

        <div className="cat-modal-actions">
          <button className="cat-btn-cancel" onClick={onClose} disabled={saveLoading}>إلغاء</button>
          <button
            className="cat-btn-save"
            onClick={() => { setSaveError(''); onSave({ name: name.trim(), image: imageFile }); }}
            disabled={saveLoading || !name.trim()}
          >
            {saveLoading ? <><Loader2 size={14} className="cat-spin" /> جاري الحفظ...</> : 'حفظ'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════
   مودال تأكيد الحذف
══════════════════════════════════════════════════════ */
const ConfirmModal = ({ message, onConfirm, onCancel, loading, errorMsg, onClearError }) => (
  <div className="cat-overlay" onClick={() => !loading && onCancel()}>
    <div className="cat-modal cat-modal--sm" onClick={e => e.stopPropagation()}>
      <h3 className="cat-modal-title">{errorMsg ? 'تعذّر الحذف' : 'تأكيد الحذف'}</h3>

      {errorMsg ? (
        <div className="cat-delete-error">
          <AlertCircle size={18} className="cat-delete-error__icon" />
          <div className="cat-delete-error__body">
            {errorMsg.split('\n').map((line, i) => <p key={i}>{line}</p>)}
          </div>
        </div>
      ) : (
        <p className="cat-confirm-text">{message}</p>
      )}

      <div className="cat-modal-actions">
        <button className="cat-btn-cancel"
          onClick={() => { onClearError(); onCancel(); }} disabled={loading}>
          {errorMsg ? 'إغلاق' : 'إلغاء'}
        </button>
        {!errorMsg && (
          <button className="cat-btn-delete" onClick={onConfirm} disabled={loading}>
            {loading ? <><Loader2 size={14} className="cat-spin" /> جاري الحذف...</> : 'حذف'}
          </button>
        )}
      </div>
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════
   الصفحة الرئيسية
══════════════════════════════════════════════════════ */
const Categories = () => {
  const {
    cuisines, selected, selectedId, selectedCats,
    loading, error,
    catsLoading, catsError,
    cuisineModal, cSaveLoading, cSaveError,
    cConfirmDel,  cDelLoading,  cDelError,
    subModal,     sSaveLoading, sSaveError,
    sConfirmDel,  sDelLoading,  sDelError,
    toast,
    setSelectedId,
    setCuisineModal, setCSaveError,
    setCConfirmDel,  setCDelError,
    setSubModal,     setSSaveError,
    setSConfirmDel,  setSDELError,
    handleSaveCuisine,  handleDeleteCuisine,
    handleSaveCategory, handleDeleteCategory,
    loadCuisines,
  } = useCategories();

  /* ── شاشة التحميل الرئيسية ── */
  if (loading) return (
    <div className="cat-page cat-page--center">
      <Loader2 size={36} className="cat-spin" style={{ color: 'var(--primary-dark)' }} />
      <p style={{ marginTop: 12, color: 'var(--text-muted)' }}>جاري تحميل المطابخ...</p>
    </div>
  );

  /* ── شاشة الخطأ الرئيسية ── */
  if (error) return (
    <div className="cat-page cat-page--center">
      <AlertCircle size={40} style={{ color: '#BA1A1A', marginBottom: 12 }} />
      <p style={{ color: '#BA1A1A', marginBottom: 16 }}>{error}</p>
      <button className="cat-btn-save" onClick={loadCuisines}>
        <RefreshCw size={14} style={{ marginLeft: 6 }} /> إعادة المحاولة
      </button>
    </div>
  );

  return (
    <div className="cat-page">

      {/* Toast */}
      {toast && (
        <div className={`cat-toast cat-toast--${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* ══════════════ اللوحة اليسرى — المطابخ ══════════════ */}
      <aside className="cat-left-panel">
        <div className="cat-left-header">
          <span className="cat-count-badge">{cuisines.length} أنواع</span>
          <h2 className="cat-left-title">أنواع المطابخ</h2>
        </div>

        <div className="cat-cuisine-list">
          {cuisines.map(c => (
            <div
              key={c.id}
              className={`cat-cuisine-item${c.id === selectedId ? ' active' : ''}`}
              onClick={() => setSelectedId(c.id)}
            >
              <div className="cat-cuisine-actions">
                <button className="cat-icon-btn cat-icon-btn--delete" title="حذف"
                  onClick={e => { e.stopPropagation(); setCDelError(''); setCConfirmDel(c.id); }}>
                  <Trash2 size={12} />
                </button>
                <button className="cat-icon-btn cat-icon-btn--edit" title="تعديل"
                  onClick={e => { e.stopPropagation(); setCuisineModal(c); setCSaveError(''); }}>
                  <Pencil size={12} />
                </button>
              </div>

              <div className="cat-cuisine-info">
                <div className="cat-cuisine-text">
                  <span className="cat-cuisine-name">{c.name}</span>
                  {/* categories_count حقيقي من الـ API */}
                  <span className="cat-cuisine-sub">{c.categories_count ?? 0} تصنيفات</span>
                </div>
                {c.image
                  ? <img src={c.image} alt={c.name} className="cat-cuisine-thumb" />
                  : <span className="cat-cuisine-emoji">🍽️</span>
                }
              </div>
            </div>
          ))}
        </div>

        <button className="cat-add-cuisine-btn"
          onClick={() => { setCuisineModal('add'); setCSaveError(''); }}>
          <Plus size={14} /> إضافة نوع مطبخ جديد
        </button>
      </aside>

      {/* ══════════════ اللوحة اليمنى — التصنيفات ══════════════ */}
      <main className="cat-right-panel">
        {!selected ? (
          <div className="cat-empty-state">
            <span className="cat-empty-icon">🍽️</span>
            <p>اختر نوع مطبخ لعرض تصنيفاته</p>
          </div>
        ) : (
          <>
            <div className="cat-right-header">
              <button className="cat-add-sub-btn"
                onClick={() => { setSubModal('add'); setSSaveError(''); }}>
                <Plus size={16} /> إضافة تصنيف
              </button>
              <div className="cat-right-title-group">
                <h1 className="cat-right-title">{selected.name}</h1>
                <p className="cat-right-subtitle">إدارة التصنيفات التابعة لـ {selected.name}</p>
              </div>
            </div>

            {/* ── حالات عرض التصنيفات ── */}
            {catsLoading ? (
              <div className="cat-empty-state">
                <Loader2 size={28} className="cat-spin" style={{ color: 'var(--primary-dark)' }} />
                <p style={{ marginTop: 10, color: 'var(--text-muted)' }}>جاري تحميل التصنيفات...</p>
              </div>
            ) : catsError ? (
              <div className="cat-empty-state">
                <AlertCircle size={28} style={{ color: '#BA1A1A' }} />
                <p style={{ color: '#BA1A1A', marginTop: 8 }}>{catsError}</p>
              </div>
            ) : !selectedCats || selectedCats.length === 0 ? (
              <div className="cat-empty-state">
                <span className="cat-empty-icon">📂</span>
                <p>لا توجد تصنيفات بعد، أضف تصنيفاً جديداً</p>
              </div>
            ) : (
              <div className="cat-sub-grid">
                {selectedCats.map(cat => (
                  <div key={cat.id} className="cat-sub-card">
                    {cat.image && (
                      <div className="cat-sub-img-wrap">
                        <img src={cat.image} alt={cat.name} className="cat-sub-img" />
                      </div>
                    )}

                    <div className="cat-sub-card-top">
                      {/* recipes_count حقيقي من الـ API ✅ */}
                      <span className="cat-sub-count">{cat.recipes_count ?? 0} وصفة</span>
                      {!cat.image && <div className="cat-sub-emoji-box">🍽️</div>}
                    </div>

                    <h3 className="cat-sub-name">{cat.name}</h3>

                    <div className="cat-sub-footer">
                      <div className="cat-sub-actions">
                        <button className="cat-sub-btn cat-sub-btn--delete" title="حذف"
                          onClick={() => {
                            setSDELError('');
                            setSConfirmDel({ catId: cat.id, cuisineId: selected.id });
                          }}>
                          <Trash2 size={14} />
                        </button>
                        <button className="cat-sub-btn cat-sub-btn--edit" title="تعديل"
                          onClick={() => { setSubModal(cat); setSSaveError(''); }}>
                          <Pencil size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* تأكيد حذف مطبخ */}
      {cConfirmDel && (
        <ConfirmModal
          message="هل أنت متأكد من حذف هذا المطبخ؟"
          onConfirm={() => handleDeleteCuisine(cConfirmDel)}
          onCancel={() => { setCConfirmDel(null); setCDelError(''); }}
          loading={cDelLoading}
          errorMsg={cDelError}
          onClearError={() => setCDelError('')}
        />
      )}

      {/* تأكيد حذف تصنيف */}
      {sConfirmDel && (
        <ConfirmModal
          message="هل أنت متأكد من حذف هذا التصنيف؟"
          onConfirm={() => handleDeleteCategory(sConfirmDel)}
          onCancel={() => { setSConfirmDel(null); setSDELError(''); }}
          loading={sDelLoading}
          errorMsg={sDelError}
          onClearError={() => setSDELError('')}
        />
      )}

      {/* مودال المطبخ */}
      {cuisineModal && (
        <ItemModal
          title={cuisineModal === 'add' ? 'إضافة نوع مطبخ جديد' : 'تعديل نوع المطبخ'}
          item={cuisineModal === 'add' ? null : cuisineModal}
          onClose={() => !cSaveLoading && setCuisineModal(null)}
          onSave={handleSaveCuisine}
          saveLoading={cSaveLoading}
          saveError={cSaveError}
          setSaveError={setCSaveError}
        />
      )}

      {/* مودال التصنيف */}
      {subModal && (
        <ItemModal
          title={subModal === 'add' ? 'إضافة تصنيف جديد' : 'تعديل التصنيف'}
          item={subModal === 'add' ? null : subModal}
          onClose={() => !sSaveLoading && setSubModal(null)}
          onSave={handleSaveCategory}
          saveLoading={sSaveLoading}
          saveError={sSaveError}
          setSaveError={setSSaveError}
        />
      )}

    </div>
  );
};

export default Categories;