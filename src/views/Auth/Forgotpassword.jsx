// src/views/Auth/ForgotPassword.jsx
import { useState } from 'react';
import { Mail, ArrowLeft } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { forgotPassword } from '../../models/authModel';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await forgotPassword(email);
      navigate('/verify-otp', { state: { email } });
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
};

  return (
    <div className="forgot-page">
      <div className="bg-blur-top"></div>
      <div className="bg-blur-bottom"></div>

      <div className="forgot-main">
        <div className="forgot-container">
          <div className="forgot-card">

          

            {/* العنوان والوصف */}
            <div className="forgot-title-section">
              <h1 className="forgot-title">استعادة كلمة المرور</h1>
              <p className="forgot-subtitle">أدخل بريدك الإلكتروني لاستلام رمز التحقق</p>
            </div>

            {error && (
              <div style={{ color: 'red', marginBottom: '16px', textAlign: 'center', fontSize: '14px' }}>
                {error}
              </div>
            )}

            {/* النموذج */}
            <form className="forgot-form" onSubmit={handleSubmit}>

              {/* البريد الإلكتروني */}
              <div className="forgot-input-group">
                <label className="forgot-input-label">البريد الإلكتروني</label>
                <div className="forgot-input-wrapper">
                  <input
                    type="email"
                    className="forgot-input"
                    placeholder="example@savorai.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <Mail className="forgot-input-icon" size={20} />
                </div>
              </div>

              {/* زر الإرسال */}
              <button type="submit" className="forgot-submit-btn" disabled={loading}>
                {loading ? 'جاري الإرسال...' : 'إرسال رمز التحقق'}
              </button>
            </form>

            {/* العودة لتسجيل الدخول */}
           <Link to="/login" className="forgot-back-link">
            <ArrowLeft size={16} />
          العودة لتسجيل الدخول
           </Link>

          </div>

          {/* تلميح مساعدة */}
          <p className="forgot-hint">
            إذا لم يصلك الرمز خلال دقائق، يرجى التحقق من ملف البريد العشوائي (Spam).
          </p>
        </div>
      </div>

    
     
    </div>
  );
};

export default ForgotPassword;