import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, ChevronDown, LayoutDashboard } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import {
  DASHBOARD_LIST,
  DASHBOARD_SECTIONS,
  getAllowedDashboardIds,
  getDashboardIdByPath,
  type DashboardId,
  type DashboardSection,
} from '../config/dashboards';

function getIconComponent(name: string): React.ComponentType<{ className?: string }> {
  const Icon = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[name];
  return Icon || LucideIcons.LayoutDashboard;
}

export interface DashboardLayoutProps {
  /** Titre affiché dans le header */
  title: string;
  /** Sous-titre optionnel */
  subtitle?: string;
  /** Section active (id) pour le menu gauche */
  activeSection: string;
  /** Callback au clic sur une section du menu gauche */
  onSectionChange: (sectionId: string) => void;
  /** Contenu principal (zone scrollable) */
  children: React.ReactNode;
  /** Action optionnelle en bas du menu gauche (ex: bouton Envoyer Message) */
  sidebarFooter?: React.ReactNode;
}

export function DashboardLayout({
  title,
  subtitle,
  activeSection,
  onSectionChange,
  children,
  sidebarFooter,
}: DashboardLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (userMenuRef.current && !userMenuRef.current.contains(target)) setUserMenuOpen(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);
  const allowedIds = useMemo(
    () => getAllowedDashboardIds(user?.role, user?.dashboardsAttribues),
    [user?.role, user?.dashboardsAttribues]
  );

  const currentDashboardId = useMemo(
    () => getDashboardIdByPath(location.pathname),
    [location.pathname]
  );

  const sections: DashboardSection[] = useMemo(() => {
    if (!currentDashboardId) return [];
    return DASHBOARD_SECTIONS[currentDashboardId] || [];
  }, [currentDashboardId]);

  const isCurrent = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  /** Dashboards autorisés pour l'opérateur (les désactivés ne s'affichent pas) */
  const allowedDashboards = useMemo(
    () => DASHBOARD_LIST.filter((d) => allowedIds.includes(d.id)),
    [allowedIds]
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Barre du haut : titre + onglets du dashboard (position 2e photo) puis PILOTAGE/Admin puis user */}
      <header className="bg-slate-100 border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="px-4 flex flex-col">
          {/* Ligne 1 : uniquement boutons à sélectionner (icônes dashboards) | Titre | User */}
          <div className="h-14 flex items-center justify-between gap-4">
            {/* Boutons dashboards : sélection uniquement, pas de menu déroulant */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {allowedDashboards.map((d) => {
                const Icon = getIconComponent(d.icon);
                const isActive = isCurrent(d.path);
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => navigate(d.path)}
                    title={d.label}
                    className={`p-2.5 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-amber-50 shadow-md ring-2 ring-amber-200/50'
                        : 'bg-slate-200 text-amber-400 hover:bg-slate-300 hover:text-amber-500'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </button>
                );
              })}
            </div>
            <h1 className="flex-1 text-center text-lg font-bold text-gray-900 truncate px-4 min-w-0">
              {title}
            </h1>
            <div className="flex items-center gap-3 flex-shrink-0 h-10">
            {/* Opérateur : même hauteur que dashboard et onglets */}
            {user && (
              <div className="relative h-full" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((o) => !o)}
                  className="flex items-center gap-2.5 h-full px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 border border-amber-400/50 text-amber-50 shadow-md hover:from-amber-600 hover:to-amber-700 transition-colors min-w-0"
                  title={`${user.prenom && user.nom ? `${user.prenom} ${user.nom}` : user.nom || user.prenom || user.email} - Connecté`}
                >
                  {user.photo || user.avatar ? (
                    <img
                      src={user.photo || user.avatar}
                      alt=""
                      className="w-9 h-9 rounded-full object-cover border-2 border-white/50 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-amber-400/30 text-amber-50 flex items-center justify-center text-sm font-bold flex-shrink-0 ring-1 ring-amber-300/50">
                      {(user.prenom?.[0] || user.nom?.[0] || user.email?.[0] || 'U').toUpperCase()}
                    </div>
                  )}
                  <div className="hidden sm:block text-left min-w-0">
                    <div className="text-sm font-semibold leading-tight truncate max-w-[140px]">
                      {user.prenom && user.nom ? `${user.prenom} ${user.nom}` : user.nom || user.prenom || user.email}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-amber-50/95">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse flex-shrink-0" title="Connecté" />
                      <span>Connecté</span>
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 flex-shrink-0 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 py-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                        navigate('/login');
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                    >
                      <LogOut className="w-4 h-4" />
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            )}
            {!user && (
              <div className="flex items-center gap-2 h-full px-3 rounded-xl bg-gray-100 text-gray-600 text-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                Non connecté
              </div>
            )}
            </div>
          </div>
          {/* Ligne 2 : onglets (teal/émeraude, distinct du bleu-violet) */}
          <div className="h-12 flex items-center border-t border-teal-100 bg-gradient-to-r from-teal-50/80 to-emerald-50/80">
            <nav className="flex flex-nowrap gap-1.5 overflow-x-auto scrollbar-thin items-center h-10 w-full px-1">
              {sections.map((sec) => {
                const SecIcon = getIconComponent(sec.icon);
                const active = activeSection === sec.id;
                return (
                  <button
                    key={sec.id}
                    onClick={() => onSectionChange(sec.id)}
                    className={`flex items-center gap-1.5 h-full px-3 rounded-lg text-sm font-medium whitespace-nowrap flex-shrink-0 transition-colors ${
                      active
                        ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-md'
                        : 'text-teal-700 bg-white/90 border border-teal-100 hover:bg-teal-50 hover:border-teal-200'
                    }`}
                  >
                    <SecIcon className="w-4 h-4" />
                    <span>{sec.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      <div className="flex flex-1 min-h-0 w-full">
        <main className="flex-1 min-w-0 flex flex-col">
          <div className="flex-1 overflow-auto p-3 sm:p-4">
            <div className="w-full max-w-7xl mx-auto">{children}</div>
          </div>
        </main>
      </div>

      {/* Bouton Envoyer Message style WhatsApp en bas à droite (icône plume) */}
      {sidebarFooter && (
        <div
          className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-green-500 shadow-xl hover:bg-green-600 text-white transition-all hover:scale-105 active:scale-95"
          title="Envoyer Message"
        >
          {sidebarFooter}
        </div>
      )}
    </div>
  );
}

export default DashboardLayout;
