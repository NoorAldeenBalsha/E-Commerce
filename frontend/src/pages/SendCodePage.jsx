import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, Mail } from 'lucide-react';
import API from '../services/api.js';
import { useToast } from './ToastProvider.jsx';
import '../css/SendCode.css';

export const SendCodePage = () => { const navigate = useNavigate(); const { showToast } = useToast();
const [email, setEmail] = useState(''); const [loading, setLoading] = useState(false);
const handleSubmit = async (e) => { e.preventDefault();
if (!email.trim()) {
  showToast('يرجى إدخال البريد الإلكتروني أولاً!', 'important', 4000);
  return;
}

setLoading(true);

try {
  // إرسال طلب إرسال رمز التحقق إلى الباك إند
  await API.post('/user/send-code', {
    email: email.trim(),
  });

  // إشعار نجاح روتيني لطيف من الأعلى
  showToast('تم إرسال كود التحقق إلى بريدك الإلكتروني بنجاح!', 'routine', 3500);

  // التوجيه لصفحة إدخال الكود وتمرير الإيميل مع الـ state
  setTimeout(() => {
    navigate('/reset-password', { state: { email: email.trim() } });
  }, 1200);

} catch (err) {
  const msg =
    err.response?.data?.message ||
    'فشل إرسال الكود. يرجى التأكد من كتابة البريد الإلكتروني المسجل.';

  // إشعار خطأ مهم في المنتصف
  showToast(Array.isArray(msg) ? msg[0] : msg, 'important', 5000);
} finally {
  setLoading(false);
}
};
return ( <div className="auth-wrapper"> {/* خلفية بتأثيرات هندسية متناسقة مع هوية Hola Market */} <div className="bg-decorations"> <div className="stripe stripe-1" /> <div className="stripe stripe-2" /> <div className="stripe stripe-3" /> </div>
  <div className="auth-container">
    {/* الجانب الأيسر: هوية المتجر ورسالة الشرح */}
    <div className="left-content">
      <div className="store-brand">
        <div className="brand-icon-box">
          <ShoppingBag size={24} className="brand-icon" />
        </div>
        <span className="brand-name">Hola Market</span>
      </div>

      <div className="headline-area">
        <h1 className="welcome-heading">Account Recovery</h1>
        <div className="accent-line" />
      </div>

      <p className="welcome-text">
        Enter your registered email address and we will send you a 6-digit verification code to securely restore access to your account.
      </p>

      <Link to="/login" className="btn-back-link">
        <ArrowLeft size={18} />
        <span>Back to Sign In</span>
      </Link>
    </div>

    {/* الجانب الأيمن: كرت إرسال الكود فقط */}
    <div className="form-card">
      <div className="card-header">
        <div className="mail-icon-bubble">
          <Mail size={28} />
        </div>
        <h2 className="form-title">Send Code</h2>
        <p className="form-subtitle">
          Enter your email to receive your verification code
        </p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="input-group">
          <label className="input-label" htmlFor="email">
            Email Address
          </label>
          <div className="input-field-wrapper">
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="user@example.com"
              className="input-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? 'Sending Code...' : 'Send Code'}
        </button>
      </form>

      <div className="toggle-auth">
        Already remember your credentials?
        <Link to="/login" className="toggle-link">
          Sign In
        </Link>
      </div>
    </div>
  </div>
</div>
); };
export default SendCodePage;