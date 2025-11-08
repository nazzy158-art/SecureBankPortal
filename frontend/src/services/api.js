import axios from 'axios';

// Create axios instance with base configuration
const API_BASE_URL = 'https://localhost:5000/api';


// Create axios instance with better error handling
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 second timeout
  httpsAgent: {
    rejectUnauthorized: false // Ignore self-signed certificate in development
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers['Content-Type'] = 'application/json';
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor with better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNREFUSED') {
      console.error('Backend server is not running. Please start the backend server.');
      alert('Cannot connect to server. Please make sure the backend is running on https://localhost:5000');
    } else if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication API calls
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/me')
};

// Payments API calls
export const paymentsAPI = {
  create: (paymentData) => api.post('/payments', paymentData),
  getMyPayments: () => api.get('/payments/my-payments'),
  getPending: () => api.get('/payments/pending'),
  verify: (paymentId) => api.put(`/payments/${paymentId}/verify`),
  submitToSwift: (paymentIds) => api.post('/payments/submit-to-swift', { paymentIds })
};

// Test backend connection
export const testConnection = async () => {
  try {
    const response = await api.get('/health');
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.message,
      details: 'Make sure backend is running on https://localhost:5000'
    };
  }
};

export default api;