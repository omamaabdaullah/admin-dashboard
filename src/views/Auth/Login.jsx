// src/views/Auth/Login.jsx
import { useState } from 'react';
import { Mail, Lock, Check, Shield, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../controllers/useAuth';
import LoginImg from '../../assets/photo.jpg';
import { Link , useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { handleLogin, loading, error } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await handleLogin(email, password);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    }
  };

  // استيراد الصور (ضع صورك في مجلد src/assets)
  // import largeLogo from '../../assets/logo-large.png';
  // import tabletImage from '../../assets/tablet-screen.png';

  return (
    <div className="login-wrapper">
      
      {/* القسم الأيمن: العلامة التجارية والصور */}
      <div className="brand-section">
        <div className="bg-shape-1"></div>
        <div className="bg-shape-2"></div>

        <div className="brand-content">
     

          {/* العناوين */}
          <h1 className="brand-title">ابدأ رحلتك في عالم الطهي</h1>
          <p className="brand-desc">
     اكتشف أشهى الوصفات، أضف لمستك الخاصة، وانضم لمجتمع الطهاة المحترفين  .
          </p>

          {/* صورة اللوحي */}
          <div className="tablet-mockup">
            <div className="tablet-screen">
              <img 
                src={LoginImg} // استبدل بـ tabletImage
                alt="Tablet View" 
                className="tablet-image" 
              />
            </div>
            
            {/* الشارة العائمة */}
            <div className="floating-badge">
              <div className="badge-icon">
                <Check size={20} />
              </div>
              <div className="badge-text">
                <span className="badge-label">مستخدم مسجل</span>
                <span className="badge-value">+1,284</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* القسم الأيسر: نموذج تسجيل الدخول */}
      <div className="form-section">
        <div className="form-container">
          
         

          {error && <div style={{color: 'red', marginBottom: '20px', textAlign: 'center'}}>{error}</div>}

          <form className="login-form" onSubmit={handleSubmit}>
            
            {/* ترويسة النموذج */}
            <div className="form-title-section">
              <h1>تسجيل الدخول</h1>
             
            </div>

            {/* البريد الإلكتروني */}
            <div className="input-group">
              <label className="input-label">البريد الإلكتروني</label>
              <div className="input-wrapper">
                <Mail className="input-icon" size={20} />
                <input
                  type="email"
                  className="custom-input"
                  placeholder="example@savorai.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* كلمة المرور */}
            <div className="input-group">
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <label className="input-label">كلمة المرور</label>
                <div className="forgot-pass">
                   <Link to="/forgot-password">نسيت كلمة المرور؟</Link>
                </div>
              </div>
              <div className="input-wrapper">
                <Lock className="input-icon" size={20} />
                <input
                  type="password"
                  className="custom-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            

            {/* زر الدخول */}
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'جاري الدخول...' : (
                <>
                  تسجيل الدخول
                  <ArrowLeft size={16} />
                </>
              )}
            </button>
          </form>

          {/* التذييل */}
          <div className="form-footer">
            <Shield size={14} />
            <span>اتصالك آمن ومشفر بنسبة 100%</span>
          </div>

        </div>
      </div>

    </div>
  );
};

export default Login;