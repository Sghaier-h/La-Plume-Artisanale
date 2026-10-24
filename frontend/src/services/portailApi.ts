import axios from 'axios';

const API_URL =
  process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://fabrication.laplume-artisanale.tn/api'
    : 'http://localhost:5000/api');

const portailApi = axios.create({
  baseURL: `${API_URL}/portail`,
  headers: { 'Content-Type': 'application/json' },
});

portailApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('portail_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

portailApi.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem('portail_token');
      localStorage.removeItem('portail_client');
      if (!window.location.pathname.startsWith('/portail/login')) {
        window.location.href = '/portail/login';
      }
    }
    return Promise.reject(error);
  }
);

export const portailAuth = {
  login: (email: string, password: string) => portailApi.post('/login', { email, password }),
  logout: () => portailApi.post('/logout'),
  me: () => portailApi.get('/me'),
  forgotPassword: (email: string) => portailApi.post('/forgot-password', { email }),
  resetPassword: (token: string, new_password: string) =>
    portailApi.post('/reset-password', { token, new_password }),
  changePassword: (current_password: string, new_password: string) =>
    portailApi.post('/change-password', { current_password, new_password }),
};

export const portailData = {
  stats: () => portailApi.get('/stats'),
  commandes: (params?: any) => portailApi.get('/commandes', { params }),
  commande: (id: number | string) => portailApi.get(`/commandes/${id}`),
  factures: () => portailApi.get('/factures'),
  facturePdfUrl: (id: number | string) => `${portailApi.defaults.baseURL}/factures/${id}/pdf`,
  bl: () => portailApi.get('/bons-livraison'),
  blPdfUrl: (id: number | string) => `${portailApi.defaults.baseURL}/bons-livraison/${id}/pdf`,
  devis: () => portailApi.get('/devis'),
  devisPdfUrl: (id: number | string) => `${portailApi.defaults.baseURL}/devis/${id}/pdf`,
  accepterDevis: (id: number | string) => portailApi.post(`/devis/${id}/accepter`),
  demandes: () => portailApi.get('/demandes'),
  createDemande: (payload: any) => portailApi.post('/demandes', payload),
};

export const downloadWithToken = async (url: string, filename: string) => {
  const token = localStorage.getItem('portail_token');
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token || ''}` } });
  if (!res.ok) throw new Error('Téléchargement impossible');
  const blob = await res.blob();
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
};

export default portailApi;
