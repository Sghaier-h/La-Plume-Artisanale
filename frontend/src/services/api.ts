import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token
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

// Intercepteur pour gérer les erreurs
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

export default api;

// Services API
export const authService = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
};

export const productionService = {
  getOFs: () => api.get('/production/ofs'),
  getOF: (id: number) => api.get(`/production/ofs/${id}`),
  createOF: (data: any) => api.post('/production/ofs', data),
  updateOF: (id: number, data: any) => api.put(`/production/ofs/${id}`, data),
  getMachines: () => api.get('/production/machines'),
  getPlanning: () => api.get('/production/planning'),
};

export const stockService = {
  getStockMP: () => api.get('/stock/mp'),
  getStockPF: () => api.get('/stock/pf'),
  createTransfert: (data: any) => api.post('/stock/transferts', data),
};

export const planningService = {
  getPlanning: () => api.get('/planning'),
  updatePlanning: (data: any) => api.put('/planning', data),
  assignMachine: (ofId: number, machineId: number) =>
    api.post(`/planning/assign/${ofId}`, { machineId }),
};

