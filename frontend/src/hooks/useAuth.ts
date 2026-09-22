import { useState, useEffect } from 'react';
import axios from 'axios';

export interface User {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  role: string;
  dashboardsAttribues?: string[];
  /** URL de la photo de profil (si fournie par l'API) */
  photo?: string;
  avatar?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (!token || !userStr) return null;
    try {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      return JSON.parse(userStr) as User;
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  const isAuthenticated = () => {
    return !!user && !!localStorage.getItem('token');
  };

  const hasRole = (role: string) => {
    return user?.role === role;
  };

  const hasAnyRole = (roles: string[]) => {
    return user ? roles.includes(user.role) : false;
  };

  return { 
    user, 
    loading, 
    logout, 
    isAuthenticated, 
    hasRole, 
    hasAnyRole 
  };
};
