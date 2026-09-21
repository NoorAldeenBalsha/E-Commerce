import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ShoppingBag, ShieldCheck, Truck, Sparkles, CheckCircle2 } from 'lucide-react';
import API from '../services/api';
import '../css/Register.css'; // تأكد أن الاسم يطابق ملف الـ CSS لديك
import { useToast } from './ToastProvider.jsx';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. التحقق من تطابق كلمتي المرور (إشعار تحذيري في المنتصف)
    if (formData.password !== formData.confirmPassword) {
      showToast('كلمات المرور غير متطابقة!', 'important', 4500);
      return;
    }

    // 2. التحقق من الموافقة على الشروط
    if (!formData.agreeTerms) {
      showToast('يرجى الموافقة على الشروط والأحكام للمتابعة.', 'important', 4500);
      return;
    }

    setLoading(true);

    try {
      // إرسال البيانات للباك إند
      await API.post('/user/auth/register', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
      });

      // إشعار نجاح روتيني يظهر من أعلى الشاشة
      showToast(`أهلاً بك يا ${formData.firstName} ${formData.lastName}! تم إنشاء حسابك بنجاح.`, 'routine', 3500);

      // الانتقال لصفحة تسجيل الدخول
      setTimeout(() => {
        navigate('/login');
      }, 1200);

    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'تعذر إنشاء الحساب. قد يكون البريد الإلكتروني مسجلاً مسبقاً.';
      
      // إشعار خطأ مهم في المنتصف
      showToast(Array.isArray(msg) ? msg[0] : msg, 'important', 6000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-wrapper">
      {/* الخطوط الهندسية المائلة في الخلفية */}
      <div className="bg-decorations">
        <div className="stripe stripe-1" />
        <div className="stripe stripe-2" />
        <div className="stripe stripe-3" />
      </div>

      <div className="register-container">
        {/* الجانب الأيسر: ميزات المتجر للمشتركين */}
        <div className="left-content">
          <div className="store-brand">
            <div className="brand-icon-box">
              <ShoppingBag size={24} className="brand-icon" />
            </div>
            <span className="brand-name">Hola Market</span>
          </div>

          <div className="headline-area">
            <h1 className="join-heading">Start Shopping Today!</h1>
            <div className="accent-line" />
          </div>

          <p className="join-text">
            Create an account to unlock tailored recommendations, track your deliveries in real-time, and get exclusive discounts on your purchases.
          </p>

          <div className="membership-perks">
            <div className="perk-item">
              <CheckCircle2 size={20} className="perk-icon" />
              <span>Instant 20% Welcome Voucher</span>
            </div>
            <div className="perk-item">
              <Truck size={20} className="perk-icon" />
              <span>Priority Express Shipping</span>
            </div>
            <div className="perk-item">
              <ShieldCheck size={20} className="perk-icon" />
              <span>Buyer Protection & Easy Returns</span>
            </div>
            <div className="perk-item">
              <Sparkles size={20} className="perk-icon" />
              <span>Early Access to Flash Sales</span>
            </div>
          </div>
        </div>

        {/* الجانب الأيمن: كرت التسجيل */}
        <div className="register-card">
          <div className="card-header">
            <h2 className="form-title">Create Account</h2>
            <p className="form-subtitle">Fill in your information to join Hola Market</p>
          </div>

          <form className="register-form" onSubmit={handleSubmit}>
            <div className="input-row">
              <div className="input-group">
                <label className="input-label" htmlFor="firstName">First Name</label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  placeholder="Noor Aldeen"
                  className="input-control"
                  value={formData.firstName}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              <div className="input-group">
                <label className="input-label" htmlFor="lastName">Last Name</label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  placeholder="Balsha"
                  className="input-control"
                  value={formData.lastName}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="input-row">
              <div className="input-group">
                <label className="input-label" htmlFor="email">Email</label>
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

              <div className="input-group">
                <label className="input-label" htmlFor="phoneNumber">Phone Number</label>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  required
                  placeholder="+963 9xx xxx xxx"
                  className="input-control"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="input-row">
              <div className="input-group">
                <label className="input-label" htmlFor="password">Password</label>
                <div className="input-field-wrapper">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    className="input-control"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="input-group">
                <label className="input-label" htmlFor="confirmPassword">Confirm Password</label>
                <div className="input-field-wrapper">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    className="input-control"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="terms-checkbox">
              <input
                id="agreeTerms"
                name="agreeTerms"
                type="checkbox"
                checked={formData.agreeTerms}
                onChange={handleChange}
                disabled={loading}
              />
              <label htmlFor="agreeTerms">
                I agree to the <a href="#terms">Terms of Service</a> & <a href="#privacy">Privacy Policy</a>
              </label>
            </div>

            <button type="submit" className="btn-register-submit" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="divider">
            <span>Or register with</span>
          </div>

          <div className="social-buttons">
            <button type="button" className="social-btn" title="Facebook">
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95C18.05 21.45 22 17.19 22 12z"/>
              </svg>
            </button>
            <button type="button" className="social-btn" title="Instagram">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </button>
            <button type="button" className="social-btn" title="X">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </button>
          </div>

          <div className="toggle-auth">
            Already have an account?
            <Link to="/login" className="toggle-link">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;