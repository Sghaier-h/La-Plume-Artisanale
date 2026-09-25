import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Navigation from './NavigationTopBar';
import TabletteLayout from './TabletteLayout';
import UserBar from './UserBar';

/**
 * Rôles TABLETTE ATELIER — mode kiosque terrain sans sidebar.
 * Alignement strict sur docs/domain.md §15 qui marque explicitement
 * « (tablette) » uniquement pour Tisseur / Coupeur / Ourdisseur.
 *
 * Ces postes ont une **application terrain** (interface tactile, gros
 * boutons XL, saisie chiffres au pavé, scan QR). Ils naviguent depuis
 * l'écran métier lui-même (pas de menu §15 gauche).
 *
 * Tous les autres postes (Chef Production, Chef Atelier, Magasiniers,
 * Contrôleur Qualité, Mécanicien, Commercial, Comptable, RH Manager,
 * Marketing, Sécurité) sont sur PC de bureau : ils voient le menu §15
 * latéral, filtré par leurs permissions (§2.4 + rolePermissions.ts).
 */
const TABLETTE_ROLES = new Set([
  'TISSEUR',
  'COUPEUR',
  'OURDISSEUR',
]);

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
          <div className="animate-spin rounded-full h-12 w-12 mx-auto" style={{ borderBottom: '2px solid var(--accent-terracotta)' }}></div>
          <p className="mt-4" style={{ color: 'var(--fg-secondary)' }}>Chargement...</p>
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
        <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-app)' }}>
          <div className="text-center">
            <div className="text-6xl mb-4" style={{ color: 'var(--color-danger)' }}>🔒</div>
            <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--fg-primary)' }}>Accès Refusé</h2>
            <p className="mb-4" style={{ color: 'var(--fg-secondary)' }}>
              Vous n'avez pas les permissions nécessaires pour accéder à cette page.
            </p>
            <p className="text-sm" style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-mono)' }}>
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
          <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-app)' }}>
            <div className="text-center">
              <div className="text-6xl mb-4" style={{ color: 'var(--accent-gold)' }}>🔒</div>
              <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--fg-primary)' }}>Accès Refusé</h2>
              <p style={{ color: 'var(--fg-secondary)' }}>
                Vous n'avez pas accès à ce dashboard.
              </p>
              <p className="text-sm mt-2" style={{ color: 'var(--fg-muted)' }}>
                Contactez votre administrateur pour obtenir l'accès.
              </p>
              <p className="text-xs mt-4" style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-mono)', opacity: 0.6 }}>
                Debug: Rôle={user.role || 'undefined'} | Dashboard requis={requiredDashboard} | Dashboards attribués={JSON.stringify(user.dashboardsAttribues || [])}
              </p>
            </div>
          </div>
        );
      }
    }
  }

  // Si toutes les vérifications passent, afficher le contenu.
  //
  // UserBar : TOUJOURS affichée dès qu'on est authentifié (barre système
  // permanente). Le prop `showNav` ne contrôle QUE le menu latéral —
  // certaines pages métier (dashboards dédiés, tablettes atelier)
  // désactivent le menu tout en gardant la barre système.
  //
  // Layout gauche :
  // - Rôles tablette (Tisseur/Coupeur/Ourdisseur) → TabletteLayout kiosque
  // - Autres rôles (bureau) → NavigationEnhanced sidebar §15 filtrée
  // - showNav=false → aucun menu à gauche (UserBar seule)
  const roleUpper = user.role?.toUpperCase() || '';
  const isTabletteRole = TABLETTE_ROLES.has(roleUpper);

  if (showNav && isTabletteRole) {
    return (
      <>
        <UserBar />
        <TabletteLayout>{children}</TabletteLayout>
      </>
    );
  }

  // NavigationTopBar occupe le haut (48px). UserBar juste dessous (topOffset=48).
  // showNav=false → UserBar seule tout en haut (dashboards §14 dédiés)
  return (
    <>
      {showNav && <Navigation />}
      <UserBar topOffset={showNav ? 48 : 0} leftOffset={0} />
      {children}
    </>
  );
};

export default ProtectedRoute;
