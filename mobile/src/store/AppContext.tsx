import React, { createContext, useContext, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AppState {
  notifications: any[];
  loading: boolean;
  activeCompany: any | null;
}

interface AppContextType {
  state: AppState;
  addNotification: (notification: any) => void;
  removeNotification: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setActiveCompany: (company: any) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>({
    notifications: [],
    loading: false,
    activeCompany: null,
  });

  const addNotification = (notification: any) => {
    const newNotification = {
      ...notification,
      id: notification.id || Date.now().toString(),
      timestamp: new Date(),
    };
    setState(prev => ({
      ...prev,
      notifications: [...prev.notifications, newNotification],
    }));
  };

  const removeNotification = (id: string) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.filter(n => n.id !== id),
    }));
  };

  const setLoading = (loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  };

  const setActiveCompany = async (company: any) => {
    setState(prev => ({ ...prev, activeCompany: company }));
    if (company) {
      await AsyncStorage.setItem('activeCompany', JSON.stringify(company));
    } else {
      await AsyncStorage.removeItem('activeCompany');
    }
  };

  return (
    <AppContext.Provider
      value={{
        state,
        addNotification,
        removeNotification,
        setLoading,
        setActiveCompany,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
