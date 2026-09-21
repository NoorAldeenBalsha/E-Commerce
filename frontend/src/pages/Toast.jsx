import React, { useEffect, useState } from 'react';
import { X, AlertTriangle, CheckCircle } from 'lucide-react';
import '../css/Toast.css';

const Toast = ({ id, message, type = 'routine', duration = 4000, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);

  // إغلاق تلقائي بعد انتهاء المدة
  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      if (onClose) {
        onClose(id);
      }
    }, 300);
  };

  // اختيار الأيقونة بناءً على النوع
  const Icon = type === 'important' ? AlertTriangle : CheckCircle;

  return (
    <div className={`toast-card type-${type} ${isExiting ? 'exiting' : ''}`}>
      <div className="toast-icon">
        <Icon size={type === 'important' ? 24 : 20} />
      </div>
      <div className="toast-content">
        <p className="toast-message">{message}</p>
      </div>
      <button className="toast-close-btn" onClick={handleClose}>
        <X size={18} />
      </button>
    </div>
  );
};

export default Toast;