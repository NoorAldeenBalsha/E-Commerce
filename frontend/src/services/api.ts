import axios from 'axios';

// غيّر الرابط ليتوافق مع منفذ الباك إند لديك (مثلاً 3000 أو 5000)
const API = axios.create({
  baseURL: 'http://localhost:5000/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// إرفاق التوكن تلقائياً مع أي طلب مستقبلي إن وجد
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;