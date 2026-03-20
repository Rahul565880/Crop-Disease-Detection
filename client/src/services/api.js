import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://crop-disease-detection-98fp.onrender.com/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data)
};

export const scanService = {
  uploadImage: async (formData) => {
    return api.post('/scans/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getScanById: (id) => api.get(`/scans/${id}`),
  getHistory: (page = 1, limit = 10) => api.get(`/scans?page=${page}&limit=${limit}`)
};

export const diseaseService = {
  getAll: () => api.get('/diseases'),
  getById: (id) => api.get(`/diseases/${id}`),
  getByCode: (code) => api.get(`/diseases/code/${code}`)
};

export const adminService = {
  getUsers: (page = 1, limit = 20) => api.get(`/admin/users?page=${page}&limit=${limit}`),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  createDisease: (data) => api.post('/admin/diseases', data),
  updateDisease: (id, data) => api.put(`/admin/diseases/${id}`, data),
  deleteDisease: (id) => api.delete(`/admin/diseases/${id}`),
  getStats: () => api.get('/admin/stats')
};

export default api;
