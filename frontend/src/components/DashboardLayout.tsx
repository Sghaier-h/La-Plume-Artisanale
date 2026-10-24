/**
 * DashboardLayout - Shell principal de l'application La Plume Artisanale.
 * - Sidebar (240px, repliable a 64px) avec sections modulaires
 * - Top bar (64px) : breadcrumbs, recherche globale (Ctrl+K), theme toggle,
 *   notifications, messages, selecteur de societe, menu utilisateur.
 * - Responsive : sidebar en drawer (hamburger) sous 768px, repliee sous 1024px.
 * - Utilise exclusivement les design tokens (design-system.css).
 *
 * L'API existante (title / subtitle / activeSection / onSectionChange /
 * children / sidebarFooter) est preservee pour eviter de casser les pages.
 * Les sections propres au dashboard courant sont exposees en barre d'onglets
 * secondaire (juste sous la topbar).
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import {
  Menu as MenuIcon,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Settings,
  User,
  MessageSquare,
  Home as HomeIcon,
  ShoppingCart,
  Users,
  Factory,
  Package,
  UserCog,
  Truck,
  HeartHandshake as Handshake,
  Wrench,
  Sliders,
  Store,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useUnreadMessages } from '../hooks/useUnreadMessages';
import Breadcrumbs from './Breadcrumbs';
import GlobalSearch from './GlobalSearch';
import NotificationCenter from './NotificationCenter';
import CompanySwitcher from './CompanySwitcher';
import ThemeToggle from './dashboard/ThemeToggle';
import PlumeLogo from './PlumeLogo';
import {
  DASHBOARD_SECTIONS,
  getDashboardIdByPath,
  type DashboardSection,
} from '../config/dashboards';

function getIconComponent(name: string): React.ComponentType<{ size?: number }> {
  const Icon = (LucideIcons as unknown as Record<string, React.ComponentType<{ size?: number }>>)[
    name
  ];
  return Icon || LucideIcons.LayoutDashboard;
}

export interface DashboardLayoutProps {
  title: string;
  subtitle?: string;
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
  children: React.ReactNode;
  sidebarFooter?: React.ReactNode;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  path: string;
  matchPrefixes?: string[];
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Accueil', icon: HomeIcon, path: '/dashboard-admin', matchPrefixes: ['/dashboard-'] },
  { id: 'ventes', label: 'Ventes', icon: ShoppingCart, path: '/commandes', matchPrefixes: ['/commandes', '/sale-orders', '/factures', '/bl'] },
  { id: 'crm', label: 'CRM', icon: Users, path: '/crm', matchPrefixes: ['/crm', '/clients'] },
  { id: 'fabrication', label: 'Fabrication', icon: Factory, path: '/of', matchPrefixes: ['/of', '/productions', '/modeles', '/quality'] },
  { id: 'stock', label: 'Stock', icon: Package, path: '/stock', matchPrefixes: ['/stock', '/articles', '/articles-catalogue', '/inventory', '/warehouse'] },
  { id: 'personnel', label: 'Personnel', icon: UserCog, path: '/hr', matchPrefixes: ['/hr', '/personnel'] },
  { id: 'fournisseurs', label: 'Fournisseurs', icon: Truck, path: '/fournisseurs', matchPrefixes: ['/fournisseurs', '/purchase-orders', '/suppliers'] },
  { id: 'soustraitants', label: 'Sous-traitants', icon: Handshake, path: '/soustraitants' },
  { id: 'machines', label: 'Machines & Maintenance', icon: Wrench, path: '/machines', matchPrefixes: ['/machines', '/maintenance'] },
  { id: 'parametrage', label: 'Parametrage', icon: Sliders, path: '/parametrage', matchPrefixes: ['/parametrage', '/settings'] },
  { id: 'ecommerce', label: 'E-commerce', icon: Store, path: '/ecommerce' },
  { id: 'ia', label: 'IA', icon: Sparkles, path: '/ia' },
];

const SIDEBAR_KEY = 'lp_sidebar_collapsed';

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
  const unreadMsg = useUnreadMessages();

  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(SIDEBAR_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_KEY, collapsed ? '1' : '0');
    } catch {}
  }, [collapsed]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node))
        setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  useEffect(() => {
    const onResize = () => {
      const w = window.innerWidth;
      if (w < 1024) setCollapsed(true);
      if (w >= 768) setMobileOpen(false);
    };
    window.addEventListener('resize', onResize);
    onResize();
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setUserMenuOpen(false);
        setMobileOpen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const currentDashboardId = useMemo(
    () => getDashboardIdByPath(location.pathname),
    [location.pathname]
  );
  const sections: DashboardSection[] = useMemo(() => {
    if (!currentDashboardId) return [];
    return DASHBOARD_SECTIONS[currentDashboardId] || [];
  }, [currentDashboardId]);

  const isActiveNav = (n: NavItem) => {
    if (location.pathname === n.path) return true;
    const prefixes = n.matchPrefixes || [n.path];
    return prefixes.some((p) => location.pathname === p || location.pathname.startsWith(p + '/'));
  };

  const sidebarWidth = collapsed ? 64 : 240;

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-app)',
        color: 'var(--fg-primary)',
        fontFamily: 'var(--font-sans)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <style>{`
        .lp-focus:focus-visible {
          outline: 2px solid var(--accent-terracotta);
          outline-offset: 2px;
        }
        .lp-sidebar-scroll::-webkit-scrollbar { width: 6px; }
        .lp-sidebar-scroll::-webkit-scrollbar-thumb {
          background: var(--border-default); border-radius: 3px;
        }
        @media (max-width: 768px) {
          .lp-sidebar-desktop { display: none !important; }
          .lp-brand-label { display: none !important; }
        }
        @media (min-width: 769px) {
          .lp-hamburger { display: none !important; }
          .lp-sidebar-drawer { display: none !important; }
        }
        .lp-menu-item {
          transition: background var(--duration-fast) var(--ease), color var(--duration-fast) var(--ease);
        }
        .lp-menu-item:hover {
          background: rgba(200, 102, 61, 0.08) !important;
          color: var(--accent-terracotta) !important;
        }
        .lp-menu-item.lp-menu-item-danger:hover {
          background: var(--color-danger-bg) !important;
          color: var(--color-danger) !important;
        }
        @media (max-width: 900px) {
          .lp-user-name { display: none !important; }
        }
      `}</style>

      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          height: 'var(--header-h)',
          background: 'var(--bg-elevated)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--s-3)',
          padding: '0 var(--s-4)',
          boxShadow: 'var(--shadow-xs)',
        }}
      >
        <button
          className="lp-hamburger lp-focus"
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Ouvrir le menu"
          style={iconBtn()}
        >
          <MenuIcon size={20} />
        </button>

        <button
          type="button"
          className="lp-focus lp-brand-mark"
          onClick={() => navigate('/dashboard-admin')}
          aria-label="La Plume Artisanale · Accueil"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--s-2)',
            padding: '4px 10px 4px 4px',
            background: 'transparent',
            border: '1px solid transparent',
            borderRadius: 'var(--radius-full)',
            cursor: 'pointer',
            color: 'var(--fg-primary)',
            transition:
              'background var(--duration) var(--ease), border-color var(--duration) var(--ease)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--bg-hover)';
            e.currentTarget.style.borderColor = 'var(--border-subtle)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.borderColor = 'transparent';
          }}
        >
          <PlumeLogo size={32} />
          <span
            className="lp-brand-label"
            style={{
              fontFamily: 'var(--font-serif)',
              fontStyle: 'italic',
              fontWeight: 500,
              fontSize: 'var(--text-md)',
              color: 'var(--fg-primary)',
              letterSpacing: '-0.01em',
              whiteSpace: 'nowrap',
            }}
          >
            La Plume
          </span>
        </button>

        <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 'var(--s-4)' }}>
          <div style={{ flex: '0 1 auto', minWidth: 0 }}>
            <Breadcrumbs />
          </div>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', minWidth: 0 }}>
            <GlobalSearch />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-2)' }}>
          <ThemeToggle />
          <NotificationCenter />
          <button
            type="button"
            className="lp-focus"
            onClick={() => navigate('/messages')}
            aria-label={`Messages (${unreadMsg} non-lus)`}
            style={{ ...iconBtn(), position: 'relative' }}
          >
            <MessageSquare size={18} />
            {unreadMsg > 0 && (
              <span style={badgeStyle()}>{unreadMsg > 99 ? '99+' : unreadMsg}</span>
            )}
          </button>
          <div style={{ minWidth: 0 }}>
            <CompanySwitcher />
          </div>

          {user && (
            <div ref={userMenuRef} style={{ position: 'relative' }}>
              <button
                type="button"
                className="lp-focus"
                onClick={() => setUserMenuOpen((v) => !v)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 'var(--s-2)',
                  padding: '4px 8px 4px 4px',
                  background: userMenuOpen ? 'var(--bg-hover)' : 'transparent',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-full)',
                  cursor: 'pointer',
                  color: 'var(--fg-primary)',
                  transition: 'background var(--duration) var(--ease)',
                }}
              >
                {user.photo || user.avatar ? (
                  <img
                    src={user.photo || user.avatar}
                    alt=""
                    style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }}
                  />
                ) : (
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background:
                        'linear-gradient(135deg, var(--accent-terracotta) 0%, var(--accent-gold) 100%)',
                      color: '#FBF8F3',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'var(--font-serif)',
                      fontWeight: 600,
                      fontSize: 13,
                      letterSpacing: '0.02em',
                      boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.15)',
                    }}
                  >
                    {(user.prenom?.[0] || user.nom?.[0] || user.email?.[0] || 'U').toUpperCase()}
                  </div>
                )}
                <span
                  className="lp-user-name"
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 500,
                    color: 'var(--fg-primary)',
                    whiteSpace: 'nowrap',
                    maxWidth: 140,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {user.prenom || user.nom || (user.email ? user.email.split('@')[0] : 'Utilisateur')}
                </span>
                <ChevronDown size={14} style={{ color: 'var(--fg-muted)' }} />
              </button>
              {userMenuOpen && (
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: 'calc(100% + 6px)',
                    minWidth: 200,
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-lg)',
                    overflow: 'hidden',
                    zIndex: 30,
                  }}
                >
                  <div style={{ padding: 'var(--s-3) var(--s-4)', borderBottom: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>
                      {user.prenom && user.nom
                        ? `${user.prenom} ${user.nom}`
                        : user.nom || user.prenom || user.email}
                    </div>
                    {user.email && (
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-muted)' }}>
                        {user.email}
                      </div>
                    )}
                  </div>
                  <MenuBtn
                    icon={<User size={16} />}
                    onClick={() => {
                      setUserMenuOpen(false);
                      navigate('/mon-profil');
                    }}
                  >
                    Mon profil
                  </MenuBtn>
                  <MenuBtn
                    icon={<Settings size={16} />}
                    onClick={() => {
                      setUserMenuOpen(false);
                      navigate('/parametrage');
                    }}
                  >
                    Parametres
                  </MenuBtn>
                  <MenuBtn
                    icon={<LogOut size={16} />}
                    onClick={() => {
                      setUserMenuOpen(false);
                      logout();
                      navigate('/login');
                    }}
                    danger
                  >
                    Deconnexion
                  </MenuBtn>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <aside
          className="lp-sidebar-desktop lp-sidebar-scroll"
          style={{
            width: sidebarWidth,
            flexShrink: 0,
            background: 'var(--bg-canvas)',
            borderRight: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            transition: 'width var(--duration-slow) var(--ease)',
          }}
        >
          <SidebarBody
            collapsed={collapsed}
            items={NAV_ITEMS}
            isActive={isActiveNav}
            onNavigate={(p) => navigate(p)}
          />
          <div style={{ marginTop: 'auto', padding: 'var(--s-2)' }}>
            <button
              type="button"
              className="lp-focus"
              onClick={() => setCollapsed((v) => !v)}
              aria-label={collapsed ? 'Etendre le menu' : 'Reduire le menu'}
              style={{
                width: '100%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--s-2)',
                padding: 'var(--s-2)',
                background: 'transparent',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--fg-muted)',
                cursor: 'pointer',
                fontSize: 'var(--text-xs)',
              }}
            >
              {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              {!collapsed && <span>Replier</span>}
            </button>
          </div>
        </aside>

        {mobileOpen && (
          <div
            className="lp-sidebar-drawer"
            onClick={() => setMobileOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(20,12,6,0.5)',
              zIndex: 1000,
            }}
          >
            <aside
              onClick={(e) => e.stopPropagation()}
              style={{
                width: 260,
                height: '100%',
                background: 'var(--bg-canvas)',
                borderRight: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                overflowY: 'auto',
              }}
            >
              <SidebarBody
                collapsed={false}
                items={NAV_ITEMS}
                isActive={isActiveNav}
                onNavigate={(p) => {
                  setMobileOpen(false);
                  navigate(p);
                }}
              />
            </aside>
          </div>
        )}

        <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          {(title || subtitle) && (
            <div style={{ padding: 'var(--s-4) var(--s-6) 0 var(--s-6)' }}>
              <h1
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 'var(--text-xl)',
                  fontWeight: 600,
                  margin: 0,
                  color: 'var(--fg-primary)',
                }}
              >
                {title}
              </h1>
              {subtitle && (
                <div
                  style={{
                    marginTop: 4,
                    color: 'var(--fg-muted)',
                    fontSize: 'var(--text-sm)',
                  }}
                >
                  {subtitle}
                </div>
              )}
            </div>
          )}

          {sections.length > 0 && (
            <nav
              aria-label="Sections"
              style={{
                display: 'flex',
                gap: 'var(--s-1)',
                padding: 'var(--s-3) var(--s-6) 0 var(--s-6)',
                overflowX: 'auto',
              }}
            >
              {sections.map((s) => {
                const Icon = getIconComponent(s.icon);
                const active = activeSection === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    className="lp-focus"
                    onClick={() => onSectionChange(s.id)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 'var(--s-2)',
                      padding: 'var(--s-2) var(--s-3)',
                      background: active ? 'var(--bg-elevated)' : 'transparent',
                      border: '1px solid',
                      borderColor: active ? 'var(--border-default)' : 'transparent',
                      borderBottom: active
                        ? '2px solid var(--accent-terracotta)'
                        : '2px solid transparent',
                      borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
                      color: active ? 'var(--fg-primary)' : 'var(--fg-secondary)',
                      fontFamily: 'var(--font-sans)',
                      fontSize: 'var(--text-sm)',
                      fontWeight: active ? 600 : 500,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all var(--duration) var(--ease)',
                    }}
                  >
                    <Icon size={14} />
                    {s.label}
                  </button>
                );
              })}
            </nav>
          )}

          <div style={{ flex: 1, overflow: 'auto', padding: 'var(--s-4) var(--s-6)' }}>
            <div style={{ width: '100%', maxWidth: 'var(--container-max)', margin: '0 auto' }}>
              {children}
            </div>
          </div>
        </main>
      </div>

      {sidebarFooter && (
        <div
          title="Envoyer Message"
          style={{
            position: 'fixed',
            bottom: 'var(--s-6)',
            right: 'var(--s-6)',
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'var(--accent-sage)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 10,
          }}
        >
          {sidebarFooter}
        </div>
      )}
    </div>
  );
}

const SidebarBody: React.FC<{
  collapsed: boolean;
  items: NavItem[];
  isActive: (n: NavItem) => boolean;
  onNavigate: (path: string) => void;
}> = ({ collapsed, items, isActive, onNavigate }) => (
  <div style={{ padding: 'var(--s-3) var(--s-2)' }}>
    <div
      style={{
        padding: '0 var(--s-2) var(--s-3) var(--s-2)',
        fontFamily: 'var(--font-serif)',
        fontSize: 'var(--text-md)',
        fontWeight: 600,
        color: 'var(--fg-primary)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--s-2)',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
      }}
    >
      <span
        aria-hidden
        style={{
          width: 28,
          height: 28,
          borderRadius: 'var(--radius-sm)',
          background: 'var(--accent-terracotta)',
          color: '#fff',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        LP
      </span>
      {!collapsed && <span>La Plume</span>}
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {items.map((n) => {
        const active = isActive(n);
        const Icon = n.icon;
        return (
          <button
            key={n.id}
            type="button"
            className="lp-focus"
            onClick={() => onNavigate(n.path)}
            title={collapsed ? n.label : undefined}
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--s-3)',
              padding: collapsed ? 'var(--s-2)' : 'var(--s-2) var(--s-3)',
              justifyContent: collapsed ? 'center' : 'flex-start',
              background: active ? 'var(--bg-hover)' : 'transparent',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              color: active ? 'var(--fg-primary)' : 'var(--fg-secondary)',
              fontFamily: 'var(--font-sans)',
              fontSize: 'var(--text-sm)',
              fontWeight: active ? 600 : 500,
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'background var(--duration-fast) var(--ease)',
            }}
          >
            {active && (
              <span
                aria-hidden
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 6,
                  bottom: 6,
                  width: 3,
                  borderRadius: 3,
                  background: 'var(--accent-terracotta)',
                }}
              />
            )}
            <Icon size={18} />
            {!collapsed && <span style={{ flex: 1 }}>{n.label}</span>}
          </button>
        );
      })}
    </div>
  </div>
);

const MenuBtn: React.FC<{
  icon: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
  children: React.ReactNode;
}> = ({ icon, onClick, danger, children }) => (
  <button
    type="button"
    className={`lp-focus lp-menu-item${danger ? ' lp-menu-item-danger' : ''}`}
    onClick={onClick}
    style={{
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--s-2)',
      padding: 'var(--s-2) var(--s-4)',
      background: 'transparent',
      border: 'none',
      color: danger ? 'var(--color-danger)' : 'var(--fg-primary)',
      cursor: 'pointer',
      fontSize: 'var(--text-sm)',
      textAlign: 'left',
    }}
  >
    {icon}
    {children}
  </button>
);

function iconBtn(): React.CSSProperties {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
    background: 'transparent',
    border: 'none',
    borderRadius: 'var(--radius-full)',
    color: 'var(--fg-secondary)',
    cursor: 'pointer',
    transition: 'background var(--duration) var(--ease)',
  };
}

function badgeStyle(): React.CSSProperties {
  return {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 18,
    height: 18,
    padding: '0 5px',
    borderRadius: 'var(--radius-full)',
    background: 'var(--color-danger)',
    color: '#fff',
    fontSize: 10,
    fontWeight: 700,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  };
}

export default DashboardLayout;
