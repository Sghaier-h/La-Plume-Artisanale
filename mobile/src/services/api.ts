import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

// URL de l'API - ajuster selon l'environnement
const API_URL = __DEV__
  ? 'http://localhost:5000/api'
  : 'https://fabrication.laplume-artisanale.tn/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Ajouter l'ID de la société active
      const activeCompanyStr = await AsyncStorage.getItem('activeCompany');
      if (activeCompanyStr) {
        try {
          const activeCompany = JSON.parse(activeCompanyStr);
          if (activeCompany?.id_societe) {
            config.headers['X-Active-Company-Id'] = activeCompany.id_societe.toString();
          }
        } catch (e) {
          console.warn('Erreur parsing société active:', e);
        }
      }
    } catch (error) {
      console.error('Erreur intercepteur request:', error);
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
  async (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      await SecureStore.deleteItemAsync('token');
      await AsyncStorage.removeItem('user');
      // Rediriger vers login sera géré par AuthContext
    }
    return Promise.reject(error);
  }
);

export default api;
