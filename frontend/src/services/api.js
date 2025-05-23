import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
  initAdmin: () => api.post('/auth/init'),
};

// Parking Slots API
export const parkingSlotsAPI = {
  getAll: (params) => api.get('/parking-slots', { params }),
  getById: (id) => api.get(`/parking-slots/${id}`),
  create: (data) => api.post('/parking-slots', data),
  update: (id, data) => api.put(`/parking-slots/${id}`, data),
  delete: (id) => api.delete(`/parking-slots/${id}`),
  getStats: () => api.get('/parking-slots/stats/summary'),
};

// Cars API
export const carsAPI = {
  getAll: (params) => api.get('/cars', { params }),
  getById: (id) => api.get(`/cars/${id}`),
  getByPlate: (plateNumber) => api.get(`/cars/plate/${plateNumber}`),
  create: (data) => api.post('/cars', data),
  update: (id, data) => api.put(`/cars/${id}`, data),
};

// Parking Records API
export const parkingRecordsAPI = {
  getAll: (params) => api.get('/parking-records', { params }),
  getById: (id) => api.get(`/parking-records/${id}`),
  create: (data) => api.post('/parking-records', data),
  update: (id, data) => api.put(`/parking-records/${id}`, data),
  delete: (id) => api.delete(`/parking-records/${id}`),
  processExit: (id, data) => api.put(`/parking-records/${id}/exit`, data),
  getStats: () => api.get('/parking-records/stats/summary'),
};

// Payments API
export const paymentsAPI = {
  getAll: (params) => api.get('/payments', { params }),
  getById: (id) => api.get(`/payments/${id}`),
  create: (data) => api.post('/payments', data),
  update: (id, data) => api.put(`/payments/${id}`, data),
  getStats: () => api.get('/payments/stats/summary'),
};

// Health check
export const healthAPI = {
  check: () => api.get('/health'),
};

export default api;
