import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ShoppingBag, ShieldCheck, Truck, Sparkles } from 'lucide-react';
import API from '../services/api';
import '../css/Login.css';
import { useToast } from './ToastProvider.jsx';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
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
    setLoading(true);

    try {
      // إرسال طلب تسجيل الدخول إلى مسار الباك إند
      const response = await API.post('/user/auth/login', {
        email: formData.email,
        password: formData.password,
      });

      // استخراج وحفظ التوكن في التخزين المحلي
      const token = response.data?.access_token || response.data?.token;
      if (token) {
        localStorage.setItem('token', token);
      }

      // إشعار نجاح روتيني يظهر أعلى الشاشة
      showToast('مرحباً بك مجدداً! جاري توجيهك للمتجر...', 'routine', 2500);

      setTimeout(() => {
        navigate('/');
      }, 1000);

    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'فشل تسجيل الدخول. يرجى التأكد من صحة البريد الإلكتروني وكلمة المرور.';

      // إشعار خطأ مهم يظهر في المنتصف
      showToast(Array.isArray(msg) ? msg[0] : msg, 'important', 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      {/* الخطوط الهندسية العريضة في الخلفية */}
      <div className="bg-decorations">
        <div className="stripe stripe-1" />
        <div className="stripe stripe-2" />
        <div className="stripe stripe-3" />
      </div>

      <div className="auth-container">
        {/* الجانب الأيسر: هوية المتجر الإلكتروني */}
        <div className="left-content">
          <div className="store-brand">
            <div className="brand-icon-box">
              <ShoppingBag size={24} className="brand-icon" />
            </div>
            <span className="brand-name">Hola Market</span>
          </div>

          <div className="headline-area">
            <h1 className="welcome-heading">Welcome!</h1>
            <div className="accent-line" />
          </div>

          <p className="welcome-text">
            Your destination for premium electronics, fashion, and daily essentials. Sign in to access member exclusive discounts, track shipments, and experience 1-click checkout.
          </p>

          {/* ميزات المتجر (Trust Badges) */}
          <div className="store-perks">
            <div className="perk-item">
              <Truck size={18} />
              <span>Free Express Delivery</span>
            </div>
            <div className="perk-item">
              <ShieldCheck size={18} />
              <span>100% Secure Checkout</span>
            </div>
            <div className="perk-item">
              <Sparkles size={18} />
              <span>Exclusive Member Deals</span>
            </div>
          </div>

          <button type="button" className="btn-explore" onClick={() => navigate('/')}>
            Explore Catalog
          </button>
        </div>

        {/* الجانب الأيمن: كرت الدخول */}
        <div className="form-card">
          <div className="card-header">
            <h2 className="form-title">Sign In</h2>
            <p className="form-subtitle">
              Enter your credentials to continue shopping
            </p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label" htmlFor="email">
                Email
              </label>
              <div className="input-field-wrapper">
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
            </div>

            <div className="input-group">
              <div className="label-row">
                <label className="input-label" htmlFor="password">
                  Password
                </label>
                <a href="#forgot" className="forgot-pass" onClick={(e) => e.preventDefault()}>
                  Forgot?
                </a>
              </div>
              <div className="input-field-wrapper">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  className="input-control"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                />
                <button
                  type="button"
                  aria-label="Toggle password"
                  className="password-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Signing In...' : 'Submit'}
            </button>
          </form>

          <div className="divider">
            <span>Or continue with</span>
          </div>

          <div className="social-buttons">
            <button type="button" className="social-btn" title="Sign in with Facebook">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95C18.05 21.45 22 17.19 22 12z"/>
              </svg>
            </button>
            <button type="button" className="social-btn" title="Sign in with Instagram">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </button>
            <button type="button" className="social-btn" title="Sign in with X">
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </button>
          </div>

          <div className="toggle-auth">
            Don't have an account?
            <Link to="/register" className="toggle-link">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;