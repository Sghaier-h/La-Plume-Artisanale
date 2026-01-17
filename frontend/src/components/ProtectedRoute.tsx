import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

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

  // Vérification du dashboard attribué
  if (requiredDashboard) {
    // L'admin a accès à tout
    if (user.role !== 'ADMIN') {
      const hasDashboard = user.dashboardsAttribues?.includes(requiredDashboard);
      
      if (!hasDashboard) {
        return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="text-red-600 text-6xl mb-4">🔒</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Accès Refusé</h2>
              <p className="text-gray-600">
                Vous n'avez pas accès à ce dashboard.
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Contactez votre administrateur pour obtenir l'accès.
              </p>
            </div>
          </div>
        );
      }
    }
  }

  // Si toutes les vérifications passent, afficher le contenu
  return <>{children}</>;
};

export default ProtectedRoute;
