import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Navigation from './Navigation';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string | string[];
  requiredDashboard?: string;
  showNav?: boolean;
}

/**
 * Composant de route protégée avec vérification des permissions
 * - requiredRole: Rôle(s) requis pour accéder (ex: 'ADMIN' ou ['ADMIN', 'CHEF_PROD'])
 * - requiredDashboard: Dashboard spécifique requis (vérifie dans dashboardsAttribues)
 * - Si aucun paramètre, vérifie juste l'authentification
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole, 
  requiredDashboard,
  showNav = true 
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  // Vérification du rôle
  if (requiredRole) {
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    const hasRole = allowedRoles.includes(user.role) || user.role === 'ADMIN';
    
    if (!hasRole) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="text-red-600 text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Accès Refusé</h2>
            <p className="text-gray-600 mb-4">
              Vous n'avez pas les permissions nécessaires pour accéder à cette page.
            </p>
            <p className="text-sm text-gray-500">
              Rôle requis: {Array.isArray(requiredRole) ? requiredRole.join(' ou ') : requiredRole}
            </p>
          </div>
        </div>
      );
    }
  }

  // Vérification: si l'utilisateur est un opérateur avec des dashboards attribués,
  // il ne doit avoir accès QU'aux dashboards attribués, pas aux autres modules
  const isAdmin = user.role === 'ADMIN' || user.role === 'admin' || user.role?.toUpperCase() === 'ADMIN';
  const hasOnlyDashboards = !isAdmin && user.dashboardsAttribues && user.dashboardsAttribues.length > 0;
  
  // Si l'utilisateur est un opérateur avec dashboards attribués et qu'on n'est pas sur un dashboard,
  // bloquer l'accès (sauf si c'est le dashboard admin pour l'admin)
  if (hasOnlyDashboards && !requiredDashboard) {
    // Rediriger vers le premier dashboard attribué
    const firstDashboard = user.dashboardsAttribues![0];
    const dashboardPaths: { [key: string]: string } = {
      'dashboard': '/dashboard-admin',
      'admin': '/dashboard-admin',
      'tisseur': '/dashboard-tisseur',
      'chef-production': '/dashboard-chef-production',
      'magasinier-mp': '/dashboard-magasinier-mp',
      'controle-central': '/dashboard-controle-central',
      'post-coupe': '/dashboard-post-coupe',
      'chef-atelier': '/chef-atelier-dashboard',
      'magasinier-soustraitants': '/dashboard-magasinier-soustraitants',
      'gpao': '/dashboard-admin',
    };
    const dashboardPath = dashboardPaths[firstDashboard] || '/dashboard-admin';
    return <Navigate to={dashboardPath} replace />;
  }

  // Vérification du dashboard attribué
  if (requiredDashboard) {
    // L'admin a accès à tout - skip la vérification dashboard
    if (!isAdmin) {
      const hasDashboard = user.dashboardsAttribues?.includes(requiredDashboard);
      
      if (!hasDashboard) {
        return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="text-orange-600 text-6xl mb-4">🔒</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Accès Refusé</h2>
              <p className="text-gray-600">
                Vous n'avez pas accès à ce dashboard.
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Contactez votre administrateur pour obtenir l'accès.
              </p>
              <p className="text-xs text-gray-400 mt-4">
                Debug: Rôle={user.role || 'undefined'} | Dashboard requis={requiredDashboard} | Dashboards attribués={JSON.stringify(user.dashboardsAttribues || [])}
              </p>
            </div>
          </div>
        );
      }
    }
  }

  // Si toutes les vérifications passent, afficher le contenu
  return (
    <>
      {showNav && <Navigation />}
      {children}
    </>
  );
};

export default ProtectedRoute;
