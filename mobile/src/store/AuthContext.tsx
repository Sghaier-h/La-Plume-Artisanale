import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';

interface User {
  id: number;
  email: string;
  nom?: string;
  prenom?: string;
  role: string;
  poste?: string;
  dashboardsAttribues?: string[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await SecureStore.getItemAsync('token');
      const userData = await AsyncStorage.getItem('user');

      if (token && userData) {
        // Valider le token avec le serveur
        try {
          const response = await api.get('/auth/me');
          if (response.data.success && response.data.data) {
            setUser(response.data.data);
          } else {
            // Token invalide, déconnecter
            await logout();
          }
        } catch (error) {
          // Erreur de connexion, déconnecter
          console.error('Erreur validation token:', error);
          await logout();
        }
      }
    } catch (error) {
      console.error('Erreur vérification auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      
      if (response.data.success && response.data.data) {
        const { token, user: userData } = response.data.data;
        
        // Sauvegarder le token de manière sécurisée
        await SecureStore.setItemAsync('token', token);
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        
        // Mettre à jour le token dans l'API client
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        setUser(userData);
      } else {
        throw new Error(response.data.error?.message || 'Échec de la connexion');
      }
    } catch (error: any) {
      console.error('Erreur login:', error);
      throw new Error(
        error.response?.data?.error?.message || 
        error.message || 
        'Impossible de se connecter'
      );
    }
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync('token');
      await AsyncStorage.removeItem('user');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
    } catch (error) {
      console.error('Erreur logout:', error);
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      AsyncStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
