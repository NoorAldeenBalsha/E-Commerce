import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Eye, EyeOff, KeyRound, ArrowLeft } from 'lucide-react';
import API from '../services/api';
import { useToast } from './ToastProvider.jsx';
import '../css/ResetPassword.css';

export const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    email: location?.state?.email || '',
    code: '',
    newPassword: ''
  });

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      showToast('كلمتا المرور غير متطابقتين!', 'important', 4500);
      return;
    }

    if (formData.newPassword.length < 6) {
      showToast('يجب أن تكون كلمة المرور 6 خانات على الأقل.', 'important', 4500);
      return;
    }

    setLoading(true);

    try {
      await API.post('/user/reset-password', {
        email: formData.email,
        resetCode: formData.code,
        newPassword: formData.newPassword,
      });

      showToast('تم تغيير كلمة المرور بنجاح! جاري تحويلك لتسجيل الدخول...', 'routine', 3000);

      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'فشل إعادة تعيين كلمة المرور. تأكد من صحة كود التحقق والبيانات المدخلة.';

      showToast(Array.isArray(msg) ? msg[0] : msg, 'important', 5500);
    } finally {
      setLoading(false);
    }
  };

  return ( <div className="auth-wrapper"> {/* الخطوط الهندسية العريضة في الخلفية */} <div className="bg-decorations"> <div className="stripe stripe-1" /> <div className="stripe stripe-2" /> <div className="stripe stripe-3" /> </div>
  <div className="auth-container">
    {/* الجانب الأيسر: هوية المتجر */}
    <div className="left-content">
      <div className="store-brand">
        <div className="brand-icon-box">
          <ShoppingBag size={24} className="brand-icon" />
        </div>
        <span className="brand-name">Hola Market</span>
      </div>

      <div className="headline-area">
        <h1 className="welcome-heading">Set New Password</h1>
        <div className="accent-line" />
      </div>

      <p className="welcome-text">
        Enter the verification code sent to your email along with your new password to restore full access to your account.
      </p>

      <Link to="/login" className="btn-back-link">
        <ArrowLeft size={18} />
        <span>Back to Sign In</span>
      </Link>
    </div>

    {/* الجانب الأيمن: كرت تغيير كلمة السر */}
    <div className="form-card reset-card">
      <div className="card-header">
        <div className="key-icon-bubble">
          <KeyRound size={26} />
        </div>
        <h2 className="form-title">Reset Password</h2>
        <p className="form-subtitle">Fill in the details below to update your password</p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        {/* خانة الإيميل */}
        <div className="input-group">
          <label className="input-label" htmlFor="email">Email Address</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="user@example.com"
            className="input-control"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        {/* خانة كود التحقق */}<div className="input-group">
          <label className="input-label" htmlFor="code">Verification Code</label>
          <input
            id="code"
            name="code"
            type="text"
            required
            placeholder="Enter 6-digit code"
            className="input-control code-input"
            value={formData.code}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        {/* خانة كلمة السر الجديدة */}
        <div className="input-group">
          <label className="input-label" htmlFor="newPassword">New Password</label>
          <div className="input-field-wrapper">
            <input
              id="newPassword"
              name="newPassword"
              type={showNewPassword ? 'text' : 'password'}
              required
              placeholder="••••••••••••"
              className="input-control"
              value={formData.newPassword}
              onChange={handleChange}
              disabled={loading}
            />
            <button
              type="button"
              aria-label="Toggle password"
              className="password-toggle"
              onClick={() => setShowNewPassword((prev) => !prev)}
            >
              {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* خانة تأكيد كلمة السر */}
        <div className="input-group">
          <label className="input-label" htmlFor="confirmPassword">Confirm New Password</label>
          <div className="input-field-wrapper">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              required
              placeholder="••••••••••••"
              className="input-control"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={loading}
            />
            <button
              type="button"
              aria-label="Toggle confirm password"
              className="password-toggle"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? 'Updating Password...' : 'Reset Password'}
        </button>
      </form>

      <div className="toggle-auth">
        Never mind?
        <Link to="/login" className="toggle-link">
          Sign In
        </Link>
      </div>
    </div>
  </div>
</div>
); };
export default ResetPasswordPage;