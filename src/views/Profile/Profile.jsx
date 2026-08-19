// src/views/Profile/Profile.jsx
import { useState, useEffect, useRef } from 'react';
import { Camera, Trash2, Save, Loader2, Eye, EyeOff, Lock, X } from 'lucide-react';
import { useAuth } from '../../controllers/useAuth';
import './Profile.css';

const PasswordField = ({ label, value, onChange, disabled }) => {
  const [visible, setVisible] = useState(false);
  return (
    <div className="profile-field">
      <label className="profile-label">{label}</label>
      <div className="profile-password-wrap">
        <input
          className="profile-input profile-input--password"
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          autoComplete="new-password"
        />
        <button
          type="button"
          className="profile-password-toggle"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
};

const Profile = () => {
  const { handleShowProfile, handleUpdateProfile, handleChangePassword, loading } = useAuth();

  const [name,   setName]   = useState('');
  const [bio,    setBio]    = useState('');
  const [email,  setEmail]  = useState('');
  const [avatar, setAvatar] = useState(null);
  const [role,   setRole]   = useState('');
  const [status, setStatus] = useState('');
  const [newAvatarFile,    setNewAvatarFile]    = useState(null);
  const [newAvatarPreview, setNewAvatarPreview] = useState(null);
  const [removeAvatar,     setRemoveAvatar]     = useState(false);
  const [savedProfile,     setSavedProfile]     = useState(false);
  const [profileError,     setProfileError]     = useState('');
  const fileInputRef = useRef(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await handleShowProfile();
        setName(data.name   || '');
        setBio(data.bio     || '');
        setEmail(data.email || '');
        setAvatar(data.avatar || null);
        setRole(data.role || localStorage.getItem('role') || '');
        setStatus(data.status?.label || 'نشط');
        setRemoveAvatar(false);
      } catch {
        const cached = JSON.parse(localStorage.getItem('user') || '{}');
        setName(cached.name   || '');
        setBio(cached.bio     || '');
        setEmail(cached.email || '');
        setAvatar(cached.avatar || null);
        setRole(cached.role   || '');
        setStatus('نشط');
      }
    };
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setNewAvatarFile(file);
    setNewAvatarPreview(URL.createObjectURL(file));
    setRemoveAvatar(false);
  };

  const handleDeleteAvatar = () => {
    setNewAvatarFile(null);
    setNewAvatarPreview(null);
    setAvatar(null);
    setRemoveAvatar(true);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSaveProfile = async () => {
    setProfileError('');
    try {
      const fields = { name, bio };
      if (newAvatarFile) {
        fields.avatar = newAvatarFile;
      } else if (removeAvatar) {
        fields.remove_avatar = 1;
      }
      const updated = await handleUpdateProfile(fields);
      if (updated?.avatar !== undefined) setAvatar(updated.avatar || null);
      setNewAvatarFile(null);
      setNewAvatarPreview(null);
      setRemoveAvatar(false);
      setSavedProfile(true);
      setTimeout(() => setSavedProfile(false), 2500);
    } catch (err) {
      setProfileError(err.message);
    }
  };

  const closePasswordModal = () => {
    if (passwordLoading) return;
    setShowPasswordModal(false);
    setPasswordError('');
    setPasswordSuccess(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleSavePassword = async () => {
    setPasswordError('');
    setPasswordSuccess(false);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('يرجى تعبئة جميع الحقول');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('كلمة المرور الجديدة يجب ألا تقل عن 8 أحرف');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('كلمتا المرور غير متطابقتين');
      return;
    }
    if (newPassword === currentPassword) {
      setPasswordError('كلمة المرور الجديدة يجب أن تختلف عن الحالية');
      return;
    }

    setPasswordLoading(true);
    try {
      await handleChangePassword(currentPassword, newPassword, confirmPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordSuccess(true);
      setTimeout(() => {
        setPasswordSuccess(false);
        setShowPasswordModal(false);
      }, 1200);
    } catch (err) {
      setPasswordError(err.message);
    } finally {
      setPasswordLoading(false);
    }
  };

  const displayAvatar = newAvatarPreview || avatar;
  const initials      = name?.charAt(0)?.toUpperCase() || 'أ';
  const displayRole   = role === 'employee' ? 'موظف' : 'مدير النظام';

  return (
    <div className="profile-page">
      <div className="profile-grid">

        <div className="profile-card info-card">

          <div className="profile-header-row">
            <div className="profile-identity">
              <div className="profile-avatar-wrap">
                <div className="profile-avatar">
                  {displayAvatar
                    ? <img src={displayAvatar} alt="avatar" className="profile-avatar-img" />
                    : initials
                  }
                </div>
                {displayAvatar && (
                  <button
                    type="button"
                    className="profile-avatar-delete"
                    title="حذف الصورة"
                    onClick={handleDeleteAvatar}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              <div className="profile-name-group">
                <div className="profile-name-row">
                  <span className="profile-display-name">{name || '...'}</span>
                  <span className="profile-role-badge">{displayRole}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="profile-btn-primary change-photo-btn"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera size={15} />
              تغيير الصورة
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleAvatarChange}
            />
          </div>

          <div className="profile-fields">
            <div className="profile-field">
              <label className="profile-label">الاسم الكامل</label>
              <input
                className="profile-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="profile-field profile-field--disabled">
              <label className="profile-label">البريد الإلكتروني</label>
              <input
                className="profile-input profile-input--disabled"
                type="email"
                value={email}
                readOnly
              />
              <span className="profile-hint">
                لا يمكن تغيير البريد الإلكتروني
              </span>
            </div>

            <div className="profile-field">
              <label className="profile-label">نبذة شخصية</label>
              <textarea
                className="profile-textarea"
                placeholder="اكتب نبذة مختصرة عنك..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>
          </div>

          {profileError && <p className="profile-error">{profileError}</p>}

          <div className="profile-save-row">
            <div className="account-status">
              <span className="stats-status-label">حالة الحساب:</span>
              <span className="stats-status-badge">{status || 'نشط'}</span>
            </div>
            <div className="profile-save-actions">
              <button
                type="button"
                className="profile-btn-secondary"
                onClick={() => setShowPasswordModal(true)}
              >
                <Lock size={15} />
                تغيير كلمة المرور
              </button>
              <button
                type="button"
                className="profile-btn-primary"
                onClick={handleSaveProfile}
                disabled={loading}
              >
                {loading ? <Loader2 size={16} className="spin" /> : <Save size={15} />}
                {savedProfile ? '✓ تم الحفظ' : 'حفظ التغييرات'}
              </button>
            </div>
          </div>

        </div>
      </div>

      {showPasswordModal && (
        <div
          className="profile-overlay"
          onClick={(e) => e.target === e.currentTarget && closePasswordModal()}
        >
          <div className="profile-password-modal">
            <div className="profile-password-modal-header">
              <button
                type="button"
                className="profile-password-modal-close"
                onClick={closePasswordModal}
                disabled={passwordLoading}
              >
                <X size={18} />
              </button>
              <h2 className="profile-password-modal-title">تغيير كلمة المرور</h2>
            </div>
            <p className="profile-card-sub">أدخل كلمة المرور الحالية ثم اختر كلمة مرور جديدة.</p>

            <div className="profile-fields">
              <PasswordField
                label="كلمة المرور الحالية"
                value={currentPassword}
                onChange={setCurrentPassword}
                disabled={passwordLoading}
              />
              <PasswordField
                label="كلمة المرور الجديدة"
                value={newPassword}
                onChange={setNewPassword}
                disabled={passwordLoading}
              />
              <PasswordField
                label="تأكيد كلمة المرور الجديدة"
                value={confirmPassword}
                onChange={setConfirmPassword}
                disabled={passwordLoading}
              />
            </div>

            {passwordError && <p className="profile-error">{passwordError}</p>}
            {passwordSuccess && <p className="profile-success">تم تغيير كلمة المرور بنجاح</p>}

            <div className="profile-password-modal-actions">
              <button
                type="button"
                className="profile-btn-secondary"
                onClick={closePasswordModal}
                disabled={passwordLoading}
              >
                إلغاء
              </button>
              <button
                type="button"
                className="profile-btn-primary"
                onClick={handleSavePassword}
                disabled={passwordLoading}
              >
                {passwordLoading
                  ? <><Loader2 size={16} className="spin" /> جاري التحديث...</>
                  : 'تحديث كلمة المرور'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
