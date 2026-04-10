/**
 * NavigationContext - Système de navigation contextuelle
 * Permet d'ajouter des actions contextuelles entre modules
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface ContextAction {
  label: string;
  icon?: React.ReactNode;
  action: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  condition?: () => boolean;
}

interface NavigationContextType {
  addContextActions: (actions: ContextAction[]) => void;
  clearContextActions: () => void;
  contextActions: ContextAction[];
  navigateWithData: (path: string, data?: any) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [contextActions, setContextActions] = useState<ContextAction[]>([]);
  const navigate = useNavigate();

  const addContextActions = (actions: ContextAction[]) => {
    // Filtrer les actions selon leur condition
    const filteredActions = actions.filter(action => 
      !action.condition || action.condition()
    );
    setContextActions(filteredActions);
  };

  const clearContextActions = () => {
    setContextActions([]);
  };

  const navigateWithData = (path: string, data?: any) => {
    if (data) {
      // Stocker les données dans sessionStorage pour les récupérer après navigation
      sessionStorage.setItem(`navData_${path}`, JSON.stringify(data));
    }
    navigate(path);
  };

  return (
    <NavigationContext.Provider
      value={{
        addContextActions,
        clearContextActions,
        contextActions,
        navigateWithData,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigationContext = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigationContext must be used within NavigationProvider');
  }
  return context;
};

// Hook pour récupérer les données de navigation
export const useNavigationData = <T,>(path: string, clear = true): T | null => {
  const key = `navData_${path}`;
  const data = sessionStorage.getItem(key);
  if (data) {
    if (clear) {
      sessionStorage.removeItem(key);
    }
    try {
      return JSON.parse(data) as T;
    } catch {
      return null;
    }
  }
  return null;
};
