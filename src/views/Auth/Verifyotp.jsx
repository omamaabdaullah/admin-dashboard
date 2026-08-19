// src/views/Auth/VerifyOtp.jsx
import { useState, useRef, useEffect } from 'react';
import { Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { forgotPassword, resetPassword } from '../../models/authModel';
import './VerifyOtp.css';

const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

const VerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(RESEND_SECONDS);
  const inputsRef = useRef([]);

  useEffect(() => {
    if (!email) navigate('/forgot-password');
  }, [email, navigate]);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const timer = setInterval(() => setResendTimer((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [resendTimer]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    const newOtp = Array(OTP_LENGTH).fill('');
    pasted.split('').forEach((char, i) => { newOtp[i] = char; });
    setOtp(newOtp);
    inputsRef.current[Math.min(pasted.length, OTP_LENGTH) - 1]?.focus();
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setLoading(true);
    setError('');
    try {
      await forgotPassword(email);
      setResendTimer(RESEND_SECONDS);
      setOtp(Array(OTP_LENGTH).fill(''));
      inputsRef.current[0]?.focus();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const code = otp.join('');

    if (code.length !== OTP_LENGTH) {
      setError('يرجى إدخال الرمز كاملاً (6 أرقام)');
      return;
    }
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="otp-page">
      <div className="otp-card" style={{ maxWidth: 440 }}>

        <div className="otp-logo-section">
          <img
            src="https://placehold.co/64x64/C0392B/FFF?text=S"
            alt="SAVORAI Logo"
            className="otp-logo"
          />
        </div>

        <div className="otp-title-section">
          <h1 className="otp-title">إعادة تعيين كلمة المرور</h1>
          <p className="otp-subtitle">أدخل رمز التحقق ثم كلمة المرور الجديدة</p>
          {error && (
            <p style={{ color: 'red', fontSize: 14, marginTop: 4 }}>{error}</p>
          )}
        </div>

        <form className="otp-actions" onSubmit={handleSubmit}>

          {/* رمز التحقق — من اليسار لليمين */}
          <div className="otp-inputs-wrapper">
            <label className="newpass-input-label" style={{ display: 'block', marginBottom: 8, textAlign: 'right' }}>
              رمز التحقق
            </label>
            <div className="otp-inputs otp-inputs--ltr" onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputsRef.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  className="otp-input"
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                />
              ))}
            </div>
          </div>

          <button
            type="button"
            className="otp-resend-btn"
            onClick={handleResend}
            disabled={resendTimer > 0 || loading}
          >
            {resendTimer > 0 ? `إعادة الإرسال (${resendTimer}ث)` : 'إعادة الإرسال'}
          </button>

          {/* كلمة المرور الجديدة */}
          <div className="newpass-input-group" style={{ width: '100%' }}>
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
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="newpass-input-group" style={{ width: '100%' }}>
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
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button type="submit" className="otp-verify-btn" disabled={loading}>
            {loading ? 'جاري الحفظ...' : 'حفظ'}
          </button>
        </form>

        <Link to="/login" className="otp-back-link">
          <ArrowLeft size={14} />
          العودة لتسجيل الدخول
        </Link>
      </div>
    </div>
  );
};

export default VerifyOtp;