/**
 * AppContext - Gestion d'état globale de l'application
 * Remplace Redux pour une solution plus légère avec Context API
 */

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';

// Types
interface AppState {
  // Paramètres système
  settings: {
    company: any;
    system: any;
    sale: any;
    purchase: any;
    stock: any;
    production: any;
    accounting: any;
    [key: string]: any;
  };
  // Cache des données
  cache: {
    products: any[];
    partners: any[];
    orders: any[];
    [key: string]: any[];
  };
  // Panier de commande (e-commerce style)
  orderCart: {
    items: Array<{
      product_id: number;
      product: any;
      quantity: number;
      price: number;
    }>;
  };
  // État de l'UI
  ui: {
    sidebarCollapsed: boolean;
    theme: 'light' | 'dark';
    notifications: any[];
    loading: boolean;
  };
  // Permissions
  permissions: {
    [module: string]: {
      read: boolean;
      write: boolean;
      delete: boolean;
      [action: string]: boolean;
    };
  };
  // Société active
  activeCompany: {
    id_societe?: number;
    code_societe?: string;
    raison_sociale?: string;
    logo_url?: string;
    [key: string]: any;
  } | null;
}

type AppAction =
  | { type: 'SET_SETTINGS'; payload: { category: string; settings: any } }
  | { type: 'UPDATE_SETTING'; payload: { category: string; key: string; value: any } }
  | { type: 'SET_CACHE'; payload: { key: string; data: any[] } }
  | { type: 'ADD_TO_CACHE'; payload: { key: string; item: any } }
  | { type: 'UPDATE_CACHE_ITEM'; payload: { key: string; id: number; data: any } }
  | { type: 'REMOVE_FROM_CACHE'; payload: { key: string; id: number } }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' }
  | { type: 'ADD_NOTIFICATION'; payload: any }
  | { type: 'REMOVE_NOTIFICATION'; payload: number }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_PERMISSIONS'; payload: { [module: string]: any } }
  | { type: 'CLEAR_CACHE'; payload?: string }
  | { type: 'ADD_TO_ORDER_CART'; payload: { product_id: number; product: any; quantity: number; price: number } }
  | { type: 'UPDATE_ORDER_CART_ITEM'; payload: { product_id: number; quantity: number } }
  | { type: 'REMOVE_FROM_ORDER_CART'; payload: { product_id: number } }
  | { type: 'CLEAR_ORDER_CART' }
  | { type: 'SET_ACTIVE_COMPANY'; payload: any | null };

// État initial
const initialState: AppState = {
  settings: {
    company: {},
    system: {},
    sale: {},
    purchase: {},
    stock: {},
    production: {},
    accounting: {},
  },
  cache: {
    products: [],
    partners: [],
    orders: [],
  },
  orderCart: {
    items: [],
  },
  ui: {
    sidebarCollapsed: false,
    theme: 'light',
    notifications: [],
    loading: false,
  },
  permissions: {},
  activeCompany: null,
};

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_SETTINGS':
      return {
        ...state,
        settings: {
          ...state.settings,
          [action.payload.category]: action.payload.settings,
        },
      };

    case 'UPDATE_SETTING':
      return {
        ...state,
        settings: {
          ...state.settings,
          [action.payload.category]: {
            ...state.settings[action.payload.category],
            [action.payload.key]: action.payload.value,
          },
        },
      };

    case 'SET_CACHE':
      return {
        ...state,
        cache: {
          ...state.cache,
          [action.payload.key]: action.payload.data,
        },
      };

    case 'ADD_TO_CACHE':
      return {
        ...state,
        cache: {
          ...state.cache,
          [action.payload.key]: [...(state.cache[action.payload.key] || []), action.payload.item],
        },
      };

    case 'UPDATE_CACHE_ITEM':
      return {
        ...state,
        cache: {
          ...state.cache,
          [action.payload.key]: (state.cache[action.payload.key] || []).map((item: any) =>
            item.id === action.payload.id ? { ...item, ...action.payload.data } : item
          ),
        },
      };

    case 'REMOVE_FROM_CACHE':
      return {
        ...state,
        cache: {
          ...state.cache,
          [action.payload.key]: (state.cache[action.payload.key] || []).filter(
            (item: any) => item.id !== action.payload.id
          ),
        },
      };

    case 'TOGGLE_SIDEBAR':
      return {
        ...state,
        ui: {
          ...state.ui,
          sidebarCollapsed: !state.ui.sidebarCollapsed,
        },
      };

    case 'SET_THEME':
      return {
        ...state,
        ui: {
          ...state.ui,
          theme: action.payload,
        },
      };

    case 'ADD_NOTIFICATION':
      return {
        ...state,
        ui: {
          ...state.ui,
          notifications: [...state.ui.notifications, { ...action.payload, id: Date.now() }],
        },
      };

    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        ui: {
          ...state.ui,
          notifications: state.ui.notifications.filter((n) => n.id !== action.payload),
        },
      };

    case 'SET_LOADING':
      return {
        ...state,
        ui: {
          ...state.ui,
          loading: action.payload,
        },
      };

    case 'SET_PERMISSIONS':
      return {
        ...state,
        permissions: action.payload,
      };

    case 'CLEAR_CACHE':
      if (action.payload) {
        return {
          ...state,
          cache: {
            ...state.cache,
            [action.payload]: [],
          },
        };
      }
      return {
        ...state,
        cache: initialState.cache,
      };

    case 'ADD_TO_ORDER_CART': {
      const existingItem = state.orderCart.items.find(
        (item) => item.product_id === action.payload.product_id
      );
      
      if (existingItem) {
        // Mettre à jour la quantité si l'article existe déjà
        return {
          ...state,
          orderCart: {
            items: state.orderCart.items.map((item) =>
              item.product_id === action.payload.product_id
                ? { ...item, quantity: item.quantity + action.payload.quantity }
                : item
            ),
          },
        };
      }
      
      // Ajouter un nouvel article
      return {
        ...state,
        orderCart: {
          items: [...state.orderCart.items, action.payload],
        },
      };
    }

    case 'UPDATE_ORDER_CART_ITEM':
      return {
        ...state,
        orderCart: {
          items: state.orderCart.items.map((item) =>
            item.product_id === action.payload.product_id
              ? { ...item, quantity: action.payload.quantity }
              : item
          ),
        },
      };

    case 'REMOVE_FROM_ORDER_CART':
      return {
        ...state,
        orderCart: {
          items: state.orderCart.items.filter(
            (item) => item.product_id !== action.payload.product_id
          ),
        },
      };

    case 'CLEAR_ORDER_CART':
      return {
        ...state,
        orderCart: {
          items: [],
        },
      };

    case 'SET_ACTIVE_COMPANY':
      return {
        ...state,
        activeCompany: action.payload,
      };

    default:
      return state;
  }
}

// Context
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  // Helpers
  updateSetting: (category: string, key: string, value: any) => void;
  getSetting: (category: string, key: string, defaultValue?: any) => any;
  setCache: (key: string, data: any[]) => void;
  getCache: (key: string) => any[];
  addToCache: (key: string, item: any) => void;
  updateCacheItem: (key: string, id: number, data: any) => void;
  removeFromCache: (key: string, id: number) => void;
  clearCache: (key?: string) => void;
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  addNotification: (notification: any) => void;
  removeNotification: (id: number) => void;
  setLoading: (loading: boolean) => void;
  hasPermission: (module: string, action: string) => boolean;
  // Order Cart Helpers
  addToOrderCart: (product_id: number, product: any, quantity: number, price: number) => void;
  updateOrderCartItem: (product_id: number, quantity: number) => void;
  removeFromOrderCart: (product_id: number) => void;
  clearOrderCart: () => void;
  // Company Management
  setActiveCompany: (company: any | null) => void;
  getActiveCompany: () => any | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { user } = useAuth();

  // Charger les paramètres depuis localStorage au démarrage
  useEffect(() => {
    const savedSettings = localStorage.getItem('app_settings');
    const savedTheme = localStorage.getItem('app_theme');
    const savedSidebar = localStorage.getItem('app_sidebar_collapsed');
    const savedActiveCompany = localStorage.getItem('app_active_company');

    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        Object.keys(settings).forEach((category) => {
          dispatch({ type: 'SET_SETTINGS', payload: { category, settings: settings[category] } });
        });
      } catch (e) {
        console.error('Erreur chargement paramètres:', e);
      }
    }

    if (savedTheme) {
      dispatch({ type: 'SET_THEME', payload: savedTheme as 'light' | 'dark' });
    }

    if (savedSidebar) {
      if (savedSidebar === 'true') {
        dispatch({ type: 'TOGGLE_SIDEBAR' });
      }
    }

    if (savedActiveCompany) {
      try {
        const company = JSON.parse(savedActiveCompany);
        dispatch({ type: 'SET_ACTIVE_COMPANY', payload: company });
      } catch (e) {
        console.error('Erreur chargement société active:', e);
      }
    }
  }, []);

  // Sauvegarder les paramètres dans localStorage
  useEffect(() => {
    localStorage.setItem('app_settings', JSON.stringify(state.settings));
  }, [state.settings]);

  useEffect(() => {
    localStorage.setItem('app_theme', state.ui.theme);
  }, [state.ui.theme]);

  useEffect(() => {
    localStorage.setItem('app_sidebar_collapsed', state.ui.sidebarCollapsed.toString());
  }, [state.ui.sidebarCollapsed]);

  useEffect(() => {
    if (state.activeCompany) {
      localStorage.setItem('app_active_company', JSON.stringify(state.activeCompany));
    } else {
      localStorage.removeItem('app_active_company');
    }
  }, [state.activeCompany]);

  // Helpers
  const updateSetting = (category: string, key: string, value: any) => {
    dispatch({ type: 'UPDATE_SETTING', payload: { category, key, value } });
  };

  const getSetting = (category: string, key: string, defaultValue?: any) => {
    return state.settings[category]?.[key] ?? defaultValue;
  };

  const setCache = (key: string, data: any[]) => {
    dispatch({ type: 'SET_CACHE', payload: { key, data } });
  };

  const getCache = (key: string) => {
    return state.cache[key] || [];
  };

  const addToCache = (key: string, item: any) => {
    dispatch({ type: 'ADD_TO_CACHE', payload: { key, item } });
  };

  const updateCacheItem = (key: string, id: number, data: any) => {
    dispatch({ type: 'UPDATE_CACHE_ITEM', payload: { key, id, data } });
  };

  const removeFromCache = (key: string, id: number) => {
    dispatch({ type: 'REMOVE_FROM_CACHE', payload: { key, id } });
  };

  const clearCache = (key?: string) => {
    dispatch({ type: 'CLEAR_CACHE', payload: key });
  };

  const toggleSidebar = () => {
    dispatch({ type: 'TOGGLE_SIDEBAR' });
  };

  const setTheme = (theme: 'light' | 'dark') => {
    dispatch({ type: 'SET_THEME', payload: theme });
  };

  const addNotification = (notification: any) => {
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
  };

  const removeNotification = (id: number) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
  };

  const setLoading = (loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const hasPermission = (module: string, action: string): boolean => {
    // Si admin, toutes les permissions - vérification plus tolérante
    const userRole = user?.role?.toUpperCase();
    if (userRole === 'ADMIN' || user?.role === 'admin') {
      return true;
    }

    // Vérifier les permissions spécifiques
    const modulePermissions = state.permissions[module];
    if (!modulePermissions) {
      return false;
    }

    return modulePermissions[action] === true;
  };

  // Helpers pour le panier de commande
  const addToOrderCart = (product_id: number, product: any, quantity: number, price: number) => {
    dispatch({
      type: 'ADD_TO_ORDER_CART',
      payload: { product_id, product, quantity, price },
    });
  };

  const updateOrderCartItem = (product_id: number, quantity: number) => {
    dispatch({
      type: 'UPDATE_ORDER_CART_ITEM',
      payload: { product_id, quantity },
    });
  };

  const removeFromOrderCart = (product_id: number) => {
    dispatch({
      type: 'REMOVE_FROM_ORDER_CART',
      payload: { product_id },
    });
  };

  const clearOrderCart = () => {
    dispatch({ type: 'CLEAR_ORDER_CART' });
  };

  const setActiveCompany = (company: any | null) => {
    dispatch({ type: 'SET_ACTIVE_COMPANY', payload: company });
  };

  const getActiveCompany = () => {
    return state.activeCompany;
  };

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        updateSetting,
        getSetting,
        setCache,
        getCache,
        addToCache,
        updateCacheItem,
        removeFromCache,
        clearCache,
        toggleSidebar,
        setTheme,
        addNotification,
        removeNotification,
        setLoading,
        hasPermission,
        addToOrderCart,
        updateOrderCartItem,
        removeFromOrderCart,
        clearOrderCart,
        setActiveCompany,
        getActiveCompany,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// Hook
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
