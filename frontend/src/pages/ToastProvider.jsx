import React, { createContext, useContext, useState } from 'react';
import Toast from './Toast';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'routine', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const routineToasts = toasts.filter((t) => t.type === 'routine');
  const importantToasts = toasts.filter((t) => t.type === 'important');

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {routineToasts.length > 0 && (
        <div className="toast-container top-right">
          {routineToasts.map((toast) => (
            <Toast
              key={toast.id}
              id={toast.id}
              message={toast.message}
              type={toast.type}
              duration={toast.duration}
              onClose={removeToast}
            />
          ))}
        </div>
      )}

      {importantToasts.length > 0 && (
        <div className="toast-container centered">
          {importantToasts.map((toast) => (
            <Toast
              key={toast.id}
              id={toast.id}
              message={toast.message}
              type={toast.type}
              duration={toast.duration}
              onClose={removeToast}
            />
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
};

export default ToastProvider;