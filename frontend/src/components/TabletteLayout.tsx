/**
 * TabletteLayout — layout dédié aux postes tablette atelier
 *
 * Utilisé pour : TISSEUR, COUPEUR, OURDISSEUR, CONTROLEUR_QUALITE,
 * MECANICIEN, MAGASINIER_PREPARATION, MAGASINIER_MP, MAGASINIER_STOCK,
 * MAGASINIER_SOUSTRAITANTS.
 *
 * Différences vs le layout PC (NavigationEnhanced sidebar 288px) :
 * - Pas de sidebar : gain de place sur écran tablette
 * - Header sticky top avec : poste + icône, société, cloche notif,
 *   heure, bouton déconnexion — tout en gros (touch-friendly, min 44px)
 * - Bouton "Accueil" central pour revenir au dashboard principal du poste
 * - Design cohérent avec les écrans tablette existants (TabletteTisseur,
 *   TabletteCoupeur, TabletteQualite, TabletteMagasinier)
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import PlumeLogo from './PlumeLogo';
import { Bell, LogOut, Home, User } from 'lucide-react';

interface TabletteLayoutProps {
  children: React.ReactNode;
}

const CREAM = '#FBF8F3';

// Mapping rôle → dashboard principal du poste
const HOME_ROUTE_BY_ROLE: Record<string, string> = {
  TISSEUR: '/tablette/tisseur',
  COUPEUR: '/dashboard-post-coupe',
  OURDISSEUR: '/dashboard-ourdisseur',
  CONTROLEUR_QUALITE: '/dashboard-controle-central',
  MECANICIEN: '/mecanicien',
  MAGASINIER_PREPARATION: '/tablette/magasinier',
  MAGASINIER_MP: '/dashboard-magasinier-mp',
  MAGASINIER_STOCK: '/magasin-pf',
  MAGASINIER_SOUSTRAITANTS: '/dashboard-magasinier-soustraitants',
};

// Label lisible du poste
const ROLE_LABEL: Record<string, string> = {
  TISSEUR: 'Poste Tisseur',
  COUPEUR: 'Poste Coupeur',
  OURDISSEUR: 'Poste Ourdisseur',
  CONTROLEUR_QUALITE: 'Poste Contrôle Qualité',
  MECANICIEN: 'Poste Mécanicien',
  MAGASINIER_PREPARATION: 'Magasinier Préparation',
  MAGASINIER_MP: 'Magasinier Matière Première',
  MAGASINIER_STOCK: 'Magasinier Stock',
  MAGASINIER_SOUSTRAITANTS: 'Magasinier Sous-Traitants',
};

const TabletteLayout: React.FC<TabletteLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [now, setNow] = React.useState(new Date());

  React.useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  const role = (user as any)?.role?.toUpperCase() || 'USER';
  const homeRoute = HOME_ROUTE_BY_ROLE[role] || '/';
  const posteLabel = ROLE_LABEL[role] || role;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleHome = () => navigate(homeRoute);

  const heure = now.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const jour = now.toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-app, #FBF8F3)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header sticky tablette 64px */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'var(--bg-elevated, #FFFFFF)',
          borderBottom: '1px solid var(--border-subtle, #EDE3CE)',
          boxShadow: 'var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.05))',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          minHeight: 72,
        }}
      >
        {/* Gauche : marque + poste */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: 0 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              paddingRight: 16,
              borderRight: '1px solid var(--border-subtle, #EDE3CE)',
            }}
          >
            <PlumeLogo size={40} variant="icon" />
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-serif, Fraunces, serif)',
                  fontStyle: 'italic',
                  fontWeight: 500,
                  fontSize: 16,
                  color: 'var(--fg-primary, #2F1F12)',
                  lineHeight: 1.1,
                }}
              >
                La Plume
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: 10,
                  color: 'var(--fg-muted, #9B8874)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Artisanale
              </div>
            </div>
          </div>

          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: 10,
                color: 'var(--fg-muted, #9B8874)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Poste
            </div>
            <div
              style={{
                fontFamily: 'var(--font-serif, Fraunces, serif)',
                fontStyle: 'italic',
                fontSize: 20,
                fontWeight: 500,
                color: 'var(--fg-primary, #2F1F12)',
                lineHeight: 1.1,
              }}
            >
              {posteLabel}
            </div>
          </div>
        </div>

        {/* Centre : bouton Accueil */}
        <button
          type="button"
          onClick={handleHome}
          aria-label="Retour au dashboard poste"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 20px',
            background: 'var(--accent-terracotta, #C8663D)',
            color: CREAM,
            border: 'none',
            borderRadius: 999,
            fontFamily: 'var(--font-sans, Inter, sans-serif)',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            minHeight: 44,
            boxShadow: '0 4px 12px rgba(200, 102, 61, 0.28)',
          }}
        >
          <Home size={18} />
          <span>Mon poste</span>
        </button>

        {/* Droite : heure + notif + utilisateur + logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Heure */}
          <div style={{ textAlign: 'right', paddingRight: 12, borderRight: '1px solid var(--border-subtle)' }}>
            <div
              style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontWeight: 700,
                fontSize: 20,
                color: 'var(--fg-primary, #2F1F12)',
                lineHeight: 1,
              }}
            >
              {heure}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: 10,
                color: 'var(--fg-muted, #9B8874)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginTop: 2,
              }}
            >
              {jour}
            </div>
          </div>

          {/* Notifications */}
          <button
            type="button"
            aria-label="Notifications"
            style={{
              width: 44,
              height: 44,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--bg-canvas, #F5EFE5)',
              border: '1px solid var(--border-subtle, #EDE3CE)',
              borderRadius: 12,
              color: 'var(--fg-secondary, #6B4E31)',
              cursor: 'pointer',
              position: 'relative',
            }}
          >
            <Bell size={20} />
          </button>

          {/* Avatar + nom */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '6px 12px 6px 6px',
              background: 'var(--bg-canvas, #F5EFE5)',
              border: '1px solid var(--border-subtle, #EDE3CE)',
              borderRadius: 999,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--accent-terracotta, #C8663D), var(--accent-gold, #C89B3C))',
                color: CREAM,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-serif, Fraunces, serif)',
                fontStyle: 'italic',
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              <User size={16} />
            </div>
            <div style={{ lineHeight: 1.1 }}>
              <div
                style={{
                  fontFamily: 'var(--font-sans, Inter, sans-serif)',
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--fg-primary, #2F1F12)',
                }}
              >
                {(user as any)?.prenom
                  ? `${(user as any).prenom} ${(user as any).nom || ''}`.trim()
                  : (user as any)?.email || 'Utilisateur'}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: 9,
                  color: 'var(--fg-muted, #9B8874)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {role}
              </div>
            </div>
          </div>

          {/* Déconnexion */}
          <button
            type="button"
            onClick={handleLogout}
            aria-label="Se déconnecter"
            title="Déconnexion"
            style={{
              width: 44,
              height: 44,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              border: '1px solid var(--border-default, #DFD3B8)',
              borderRadius: 12,
              color: 'var(--fg-secondary, #6B4E31)',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--color-danger-bg, #FBEBE4)';
              e.currentTarget.style.color = 'var(--color-danger, #B84A2F)';
              e.currentTarget.style.borderColor = 'var(--color-danger, #B84A2F)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--fg-secondary, #6B4E31)';
              e.currentTarget.style.borderColor = 'var(--border-default, #DFD3B8)';
            }}
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Contenu */}
      <main style={{ flex: 1, padding: 0 }}>{children}</main>
    </div>
  );
};

export default TabletteLayout;
