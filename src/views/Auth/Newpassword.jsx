// src/views/Auth/NewPassword.jsx
import { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { resetPassword } from '../../models/authModel';
import './NewPassword.css';

const NewPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const code = location.state?.code;

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // إذا دخل المستخدم هذه الصفحة مباشرة بدون المرور بالخطوتين السابقتين
  // فلا يوجد بريد إلكتروني أو رمز معروف، نُرجعه للخطوة الأولى
  useEffect(() => {
    if (!email || !code) {
      navigate('/forgot-password');
    }
  }, [email, code, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('كلمتا المرور غير متطابقتين');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email, code, password, confirmPassword);
      navigate('/login');
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="newpass-page">
      <div className="newpass-content">

        {/* الشعار والاسم */}
        <div className="newpass-brand">
          <img
            src="https://placehold.co/64x64/C0392B/FFF?text=S"
            alt="SAVORAI Logo"
            className="newpass-logo"
          />
          <span className="newpass-brand-name">) SAVORAI (</span>
        </div>

        {/* البطاقة الرئيسية */}
        <div className="newpass-card">
          <h1 className="newpass-title">كلمة مرور جديدة</h1>

          {error && (
            <div style={{ color: 'red', width: '100%', textAlign: 'center', fontSize: '14px' }}>
              {error}
            </div>
          )}

          <form className="newpass-form" onSubmit={handleSubmit}>

            {/* كلمة المرور الجديدة */}
            <div className="newpass-input-group">
              <label className="newpass-input-label">كلمة المرور الجديدة</label>
              <div className="newpass-input-wrapper">
                <Lock className="newpass-lock-icon" size={16} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="newpass-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  className="newpass-eye-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="إظهار كلمة المرور"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* تأكيد كلمة المرور */}
            <div className="newpass-input-group">
              <label className="newpass-input-label">تأكيد كلمة المرور</label>
              <div className="newpass-input-wrapper">
                <Lock className="newpass-lock-icon" size={16} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="newpass-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  className="newpass-eye-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label="إظهار تأكيد كلمة المرور"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* زر الحفظ */}
            <button type="submit" className="newpass-submit-btn" disabled={loading}>
              {loading ? 'جاري الحفظ...' : 'حفظ'}
            </button>
          </form>
        </div>

        {/* التذييل */}
        <div className="newpass-footer">
          ) SAVORAI ( 2024 ©وصفات. جميع الحقوق محفوظة
        </div>
      </div>
    </div>
  );
};

export default NewPassword;