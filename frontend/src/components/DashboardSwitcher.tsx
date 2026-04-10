/**
 * DashboardSwitcher - Sélecteur de dashboard pour changer entre les dashboards attribués
 */

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LayoutDashboard, ChevronDown, Settings, LogOut, Menu, X } from 'lucide-react';
import NavigationEnhanced from './NavigationEnhanced';
import { useApp } from '../store/AppContext';

interface Dashboard {
  id: string;
  path: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

const DashboardSwitcher: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { state: appState, toggleSidebar } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'admin';
  const isDashboardAdmin = location.pathname === '/dashboard-admin';
  
  // Le menu est accessible pour tous les utilisateurs
  const shouldShowMenu = isMenuOpen;

  // Mapping des dashboards
  const allDashboards: Dashboard[] = [
    { id: 'dashboard', path: '/dashboard-admin', label: 'Dashboard Principal', icon: LayoutDashboard },
    { id: 'tisseur', path: '/dashboard-tisseur', label: 'Dashboard Tisseur', icon: LayoutDashboard },
    { id: 'chef-production', path: '/dashboard-chef-production', label: 'Dashboard Chef Production', icon: LayoutDashboard },
    { id: 'magasinier-mp', path: '/dashboard-magasinier-mp', label: 'Dashboard Magasinier MP', icon: LayoutDashboard },
    { id: 'controle-central', path: '/dashboard-controle-central', label: 'Dashboard Contrôle Central', icon: LayoutDashboard },
    { id: 'post-coupe', path: '/dashboard-post-coupe', label: 'Dashboard Post Coupe', icon: LayoutDashboard },
    { id: 'chef-atelier', path: '/chef-atelier-dashboard', label: 'Dashboard Chef Atelier', icon: LayoutDashboard },
    { id: 'magasinier-soustraitants', path: '/dashboard-magasinier-soustraitants', label: 'Dashboard Magasinier Sous-traitants', icon: LayoutDashboard },
    { id: 'gpao', path: '/dashboard-admin', label: 'Dashboard Admin (GPAO inclus)', icon: LayoutDashboard },
  ];

  // Récupérer les dashboards attribués à l'utilisateur
  // Pour les opérateurs (non-admin), ne montrer QUE les dashboards attribués
  // Pour l'admin, montrer tous les dashboards
  const userDashboards = isAdmin
    ? allDashboards
    : (user?.dashboardsAttribues && user.dashboardsAttribues.length > 0
        ? allDashboards.filter(dash => user.dashboardsAttribues?.includes(dash.id))
        : []);

  // Trouver le dashboard actuel basé sur le path
  const currentPath = window.location.pathname;
  const currentDashboard = userDashboards.find(dash => dash.path === currentPath) || userDashboards[0];

  const handleDashboardChange = (dashboard: Dashboard) => {
    navigate(dashboard.path);
    setIsOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (userDashboards.length === 0) {
    return (
      <div className="bg-white shadow-sm border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="w-6 h-6 text-blue-600" />
          <span className="font-semibold text-gray-800">Aucun dashboard disponible</span>
        </div>
        <button
          onClick={handleLogout}
          className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Déconnexion
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm border-b px-4 py-3 flex items-center justify-between relative z-50">
      <div className="flex items-center gap-4">
        {/* Bouton Menu Principal */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          title="Menu Principal"
        >
          <Menu className="w-6 h-6 text-gray-700" />
        </button>
        
        {/* Sélecteur de dashboard */}
        <div className="relative">
          {userDashboards.length > 1 ? (
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium"
            >
              {currentDashboard?.icon && <currentDashboard.icon className="w-5 h-5" />}
              <span>{currentDashboard?.label || 'Dashboard'}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
            </button>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2 text-gray-800">
              {currentDashboard?.icon && <currentDashboard.icon className="w-5 h-5 text-blue-600" />}
              <span className="font-semibold">{currentDashboard?.label || 'Dashboard'}</span>
            </div>
          )}

          {/* Menu déroulant */}
          {isOpen && userDashboards.length > 1 && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsOpen(false)}
              />
              <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                <div className="py-2">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase border-b border-gray-100">
                    Mes Dashboards
                  </div>
                  {userDashboards.map((dashboard) => (
                    <button
                      key={dashboard.id}
                      onClick={() => handleDashboardChange(dashboard)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-blue-50 transition-colors ${
                        currentDashboard?.id === dashboard.id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                      }`}
                    >
                      {dashboard.icon && <dashboard.icon className="w-5 h-5" />}
                      <span>{dashboard.label}</span>
                      {currentDashboard?.id === dashboard.id && (
                        <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Informations utilisateur */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>{user?.prenom} {user?.nom}</span>
          <span className="text-gray-400">•</span>
          <span className="text-xs px-2 py-1 bg-gray-100 rounded">{user?.role}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleLogout}
          className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
          title="Déconnexion"
        >
          <LogOut className="w-4 h-4" />
          Déconnexion
        </button>
      </div>
      
      {/* Menu Navigation - Overlay pour tous les utilisateurs */}
      {shouldShowMenu && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="fixed left-0 top-0 h-full w-80 bg-white shadow-2xl z-50 overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4 pb-4 border-b">
                <h2 className="text-lg font-semibold text-gray-800">Menu Principal</h2>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  title="Fermer"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <NavigationEnhanced onNavigate={() => setIsMenuOpen(false)} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardSwitcher;
