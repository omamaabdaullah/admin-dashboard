// src/views/Profile/Profile.jsx
import { useState, useEffect, useRef } from 'react';
import { Camera, Trash2, Save, Loader2 } from 'lucide-react';
import { useAuth } from '../../controllers/useAuth';
import './Profile.css';

const Profile = () => {
  const { handleShowProfile, handleUpdateProfile, loading } = useAuth();

  const [name,   setName]   = useState('');
  const [bio,    setBio]    = useState('');
  const [email,  setEmail]  = useState('');
  const [avatar, setAvatar] = useState(null);
  const [role,   setRole]   = useState('');
  const [status, setStatus] = useState('');
  const [postsCount, setPostsCount] = useState(0);
  const [newAvatarFile,    setNewAvatarFile]    = useState(null);
  const [newAvatarPreview, setNewAvatarPreview] = useState(null);
  const [removeAvatar,     setRemoveAvatar]     = useState(false);
  const [savedProfile,     setSavedProfile]     = useState(false);
  const [profileError,     setProfileError]     = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await handleShowProfile();
        setName(data.name   || '');
        setBio(data.bio     || '');
        setEmail(data.email || '');
        setAvatar(data.avatar || null);
        setRole(data.role   || '');
        setStatus(data.status?.label || 'نشط');
        setPostsCount(data.posts_count || 0);
        setRemoveAvatar(false);
      } catch {
        const cached = JSON.parse(localStorage.getItem('user') || '{}');
        setName(cached.name   || '');
        setBio(cached.bio     || '');
        setEmail(cached.email || '');
        setAvatar(cached.avatar || null);
        setRole(cached.role   || '');
        setStatus('نشط');
        setPostsCount(0);
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
        // أكّدي اسم الحقل مع فريق Laravel إن لزم
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
                <span className="profile-posts-count">{postsCount} وصفة منشورة</span>
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
                لا يمكن تغيير البريد الإلكتروني الخاص بمدير النظام
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
  );
};

export default Profile;