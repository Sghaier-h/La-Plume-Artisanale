/**
 * UserBar — barre utilisateur permanente en haut de TOUTES les vues.
 *
 * Contient : Recherche ⌘K, Assistant IA, Messages, Notifications,
 * Sélecteur sociétés (LP / AF / FT), Session · Déconnexion.
 *
 * Sticky top zIndex 200 pour être toujours au-dessus des sidebars et
 * autres layouts. Height 48px sur desktop, se replie en 4 icônes sur mobile.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme, ThemeMode } from '../contexts/ThemeContext';
import PlumeLogo from './PlumeLogo';
import type { LucideIcon } from 'lucide-react';
import {
  Search,
  Sparkles,
  MessageSquare,
  Bell,
  Building2,
  LogOut,
  ChevronDown,
  Sun,
  Moon,
  Monitor,
  Mail,
  LayoutDashboard,
  TrendingUp,
  Package,
  Package2,
  Boxes,
  Truck,
  Factory,
  HardHat,
  Activity,
  CheckCircle,
  Wrench,
  BookOpen,
  Briefcase,
  BrainCircuit,
  Calendar,
} from 'lucide-react';

const CREAM = '#FBF8F3';

// Sociétés multi-tenant (à remplacer par un fetch API)
const SOCIETES = [
  { code: 'LP', nom: 'La Plume Artisanale' },
  { code: 'AF', nom: 'Al Fouta Export' },
  { code: 'FT', nom: 'Flying Tex' },
];

interface UserBarProps {
  /** Décalage top additionnel (pour navigation sticky au-dessus). Par défaut 0. */
  topOffset?: number;
  /** Décalage gauche (largeur sidebar). Passe 288 pour laisser la place au menu §15. */
  leftOffset?: number;
}

type MessageChannel = 'interne' | 'whatsapp' | 'telegram' | 'email' | 'sms';

// Mock data — à remplacer par un fetch API. Regroupe messagerie inter-postes
// (§12 domain) + messages externes (WhatsApp / Telegram / email).
const MOCK_MESSAGES: Array<{
  id: number;
  from: string;
  preview: string;
  time: string;
  urgent: boolean;
  channel: MessageChannel;
}> = [
  { id: 1, from: 'Chef Production', preview: 'Machine 3 en pause depuis 15 min, tu vérifies ?', time: 'il y a 5 min', urgent: true, channel: 'interne' },
  { id: 2, from: 'Hotel Marina · Djerba', preview: 'Nous confirmons la commande de 200 foutas plage 100×180.', time: 'il y a 12 min', urgent: false, channel: 'whatsapp' },
  { id: 3, from: 'Magasinier MP', preview: 'Stock coton 20/1 en rupture, préparation OF-2609001 bloquée', time: 'il y a 22 min', urgent: false, channel: 'interne' },
  { id: 4, from: 'SOTUFIL Achats', preview: 'Devis fournisseur mis à jour pour lot fil polyester NM40', time: 'il y a 45 min', urgent: false, channel: 'email' },
  { id: 5, from: '+216 24 xxx xxx', preview: 'Bonjour, j\'aimerais un devis pour 500 serviettes hammam brodées', time: 'il y a 1 h', urgent: false, channel: 'telegram' },
  { id: 6, from: 'Système', preview: 'Nouveau devis DV-2026-0148 en attente de validation', time: 'il y a 2 h', urgent: false, channel: 'interne' },
];

// Icônes SVG WhatsApp / Telegram (compactes, cohérentes avec Lucide 14px)
const WhatsAppIcon: React.FC<{ size?: number }> = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.6 6.32A8 8 0 0 0 4.53 15.5L4 20l4.63-1.22a8 8 0 0 0 11.7-6.94 7.96 7.96 0 0 0-2.73-5.52zm-5.6 12.28a6.65 6.65 0 0 1-3.38-.93l-.24-.14-2.75.72.73-2.68-.16-.25a6.65 6.65 0 0 1 10.34-8.2 6.6 6.6 0 0 1 1.94 4.72 6.65 6.65 0 0 1-6.48 6.76zm3.66-4.98c-.2-.1-1.18-.58-1.37-.65-.18-.06-.32-.1-.45.1-.13.2-.5.65-.62.78-.11.14-.23.15-.43.05-.2-.1-.85-.31-1.62-1-.6-.53-1-1.19-1.12-1.39-.11-.2-.01-.31.09-.41.1-.1.2-.23.3-.35.1-.11.13-.2.2-.33.06-.13.03-.24-.02-.34-.05-.1-.45-1.09-.62-1.5-.16-.4-.33-.34-.45-.35h-.38a.73.73 0 0 0-.53.25c-.18.2-.7.68-.7 1.66s.72 1.93.82 2.07c.1.13 1.42 2.17 3.44 3.04.48.21.86.33 1.15.42.48.15.92.13 1.27.08.39-.06 1.18-.48 1.35-.95.17-.47.17-.87.12-.95-.05-.09-.18-.13-.38-.23z" />
  </svg>
);

const TelegramIcon: React.FC<{ size?: number }> = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.66 3.72L2.98 10.63c-1.2.48-1.2 1.16-.22 1.46l4.53 1.42 10.5-6.63c.5-.3.95-.14.58.19l-8.5 7.68-.32 4.68c.47 0 .68-.22.94-.47l2.26-2.2 4.7 3.47c.86.47 1.48.23 1.7-.8l3.07-14.5c.32-1.24-.49-1.8-1.3-1.5z" />
  </svg>
);

const channelLabel: Record<MessageChannel, string> = {
  interne: 'Inter-postes',
  whatsapp: 'WhatsApp',
  telegram: 'Telegram',
  email: 'Email',
  sms: 'SMS',
};

const channelColor: Record<MessageChannel, string> = {
  interne: 'var(--accent-terracotta, #C8663D)',
  whatsapp: '#25D366',
  telegram: '#26A5E4',
  email: 'var(--accent-indigo, #4A5D75)',
  sms: 'var(--accent-sage, #7A8C6A)',
};

// Dashboards §14 (16 dashboards + planification centrale)
type DashboardEntry = {
  path: string;
  label: string;
  icon: LucideIcon;
  perm?: string;
  todo?: boolean;
};
const DASHBOARDS: DashboardEntry[] = [
  { path: '/dashboard-admin', label: 'Admin', icon: LayoutDashboard, perm: 'dashboard.read' },
  { path: '/dashboard-commercial', label: 'Commercial', icon: TrendingUp, perm: 'dashboard.commercial' },
  { path: '/tablette/magasinier', label: 'Magasinier Préparation', icon: Package, perm: 'dashboard.magasinier' },
  { path: '/dashboard-magasinier-mp', label: 'Magasinier MP', icon: Boxes, perm: 'dashboard.magasinier-mp' },
  { path: '/magasin-pf', label: 'Magasinier Stock (PF)', icon: Package2, perm: 'dashboard.magasin-pf' },
  { path: '/dashboard-magasinier-soustraitants', label: 'Magasinier Sous-Traitants', icon: Truck, perm: 'dashboard.magasinier-soustraitants' },
  { path: '/dashboard-chef-production', label: 'Chef Production', icon: Factory, perm: 'dashboard.chef-production' },
  { path: '/chef-atelier-dashboard', label: "Chef d'Atelier", icon: HardHat, perm: 'dashboard.chef-atelier' },
  { path: '/dashboard-tisseur', label: 'Tisseur', icon: Activity, perm: 'dashboard.tisseur' },
  { path: '/dashboard-post-coupe', label: 'Post-Coupe', icon: Activity, perm: 'dashboard.coupe' },
  { path: '/dashboard-controle-central', label: 'Contrôle Qualité', icon: CheckCircle, perm: 'dashboard.controle-central' },
  { path: '/mecanicien', label: 'Mécanicien / Maintenance', icon: Wrench, perm: 'dashboard.mecanicien' },
  { path: '/dashboard-comptable', label: 'Comptable', icon: BookOpen },
  { path: '/dashboard-rh-manager', label: 'RH Manager', icon: Briefcase },
  { path: '/dashboard-ia', label: 'IA (agents & rapports)', icon: BrainCircuit },
  { path: '/planning', label: 'Planification & Suivis', icon: Calendar, perm: 'mrp.production.read' },
];

const MOCK_NOTIFS = [
  { id: 1, title: 'Facture impayée', body: 'Hotel Marina Djerba · échéance dépassée de 15 j', time: 'il y a 12 min', level: 'danger' },
  { id: 2, title: 'OF terminé', body: 'OF-2609015 finalisé, 180 pcs 1er choix', time: 'il y a 45 min', level: 'success' },
  { id: 3, title: 'Nouvelle commande web', body: 'CMD-B2C-0088 · 340 €', time: 'il y a 1 h', level: 'info' },
];

const UserBar: React.FC<UserBarProps> = ({ topOffset = 0, leftOffset = 0 }) => {
  const { user, logout } = useAuth();
  const { theme, setMode, isDark } = useTheme();
  const navigate = useNavigate();
  const [societeIdx, setSocieteIdx] = React.useState(0);
  const [societeOpen, setSocieteOpen] = React.useState(false);
  const [themeOpen, setThemeOpen] = React.useState(false);
  const [messagesOpen, setMessagesOpen] = React.useState(false);
  const [notifsOpen, setNotifsOpen] = React.useState(false);
  const [dashboardsOpen, setDashboardsOpen] = React.useState(false);
  const [notifCount] = React.useState(MOCK_NOTIFS.length);
  const [messageCount] = React.useState(MOCK_MESSAGES.length);

  const currentModeLabel: Record<ThemeMode, string> = {
    light: 'Clair',
    dark: 'Sombre',
    auto: 'Auto',
  };

  // Ctrl+K / Cmd+K → focus recherche
  const handleSearch = () => {
    // Emit un event global pour que GlobalSearch modal l'écoute
    window.dispatchEvent(new CustomEvent('open-global-search'));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleAssistantIA = () => {
    // Emit un event pour ouvrir le chat widget IA
    window.dispatchEvent(new CustomEvent('open-ai-assistant'));
  };

  const handleMessages = () => navigate('/messages-operateurs');
  const handleNotifs = () => {
    window.dispatchEvent(new CustomEvent('open-notifications'));
  };

  const btnGhost: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 12px',
    background: 'var(--bg-canvas, #F5EFE5)',
    border: '1px solid var(--border-subtle, #EDE3CE)',
    borderRadius: 999,
    color: 'var(--fg-secondary, #6B4E31)',
    fontFamily: 'var(--font-sans, Inter, sans-serif)',
    fontSize: 12,
    fontWeight: 500,
    cursor: 'pointer',
    minHeight: 32,
    whiteSpace: 'nowrap',
    transition: 'background 0.15s, border-color 0.15s',
  };

  const kbdStyle: React.CSSProperties = {
    padding: '1px 5px',
    background: 'var(--bg-elevated, #FFFFFF)',
    border: '1px solid var(--border-default, #DFD3B8)',
    borderRadius: 4,
    fontSize: 10,
    fontFamily: 'var(--font-mono, monospace)',
    color: 'var(--fg-muted, #9B8874)',
    marginLeft: 4,
  };

  // La UserBar se positionne toujours SOUS la NavigationTopBar dont la
  // hauteur est publiée dans la CSS var --nav-height (via ResizeObserver
  // dans NavigationTopBar). Elle suit donc automatiquement le wrap sur
  // plusieurs lignes. topOffset est un décalage additionnel (rare).
  const computedTop = topOffset > 0
    ? `calc(var(--nav-height, 48px) + ${topOffset}px)`
    : 'var(--nav-height, 48px)';

  // Publie sa propre hauteur dans --userbar-height afin que le layout
  // principal puisse réserver l'espace correct pour que RIEN ne se cache
  // sous la UserBar quand elle wrap sur 2 lignes (petits écrans).
  const barRef = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    const el = barRef.current;
    if (!el) return;
    const publish = () => {
      document.documentElement.style.setProperty('--userbar-height', `${el.offsetHeight}px`);
    };
    publish();
    const obs = new ResizeObserver(publish);
    obs.observe(el);
    window.addEventListener('resize', publish);
    return () => {
      obs.disconnect();
      window.removeEventListener('resize', publish);
    };
  }, []);

  return (
    <div
      ref={barRef}
      style={{
        position: 'fixed',
        top: computedTop,
        left: leftOffset,
        right: 0,
        zIndex: 30,
        background: 'var(--bg-elevated, #FFFFFF)',
        borderBottom: '1px solid var(--border-subtle, #EDE3CE)',
        padding: '8px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        minHeight: 48,
        fontFamily: 'var(--font-sans, Inter, sans-serif)',
      }}
    >
      {/* Brand La Plume à gauche (cliquable → accueil) */}
      <button
        type="button"
        onClick={() => navigate('/')}
        aria-label="Retour à l'accueil"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          padding: '4px 8px',
          background: 'transparent',
          border: 'none',
          borderRadius: 8,
          cursor: 'pointer',
          transition: 'background 0.15s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--bg-canvas, #F5EFE5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
        }}
      >
        <PlumeLogo size={28} variant="icon" />
        <div style={{ textAlign: 'left', lineHeight: 1.1 }}>
          <div
            style={{
              fontFamily: 'var(--font-serif, Fraunces, serif)',
              fontStyle: 'italic',
              fontWeight: 500,
              fontSize: 14,
              color: 'var(--fg-primary, #2F1F12)',
            }}
          >
            La Plume
          </div>
          <div
            style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: 9,
              color: 'var(--fg-muted, #9B8874)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginTop: 1,
            }}
          >
            Artisanale · ERP
          </div>
        </div>
      </button>

      {/* Groupe droit : outils + session */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {/* Recherche globale */}
      <button
        type="button"
        onClick={handleSearch}
        aria-label="Rechercher (Ctrl+K)"
        style={btnGhost}
      >
        <Search size={14} />
        <span>Recherche</span>
        <kbd style={kbdStyle}>⌘K</kbd>
      </button>

      {/* Assistant IA */}
      <button
        type="button"
        onClick={handleAssistantIA}
        aria-label="Assistant IA"
        style={btnGhost}
      >
        <Sparkles size={14} style={{ color: 'var(--accent-terracotta, #C8663D)' }} />
        <span>Assistant IA</span>
      </button>

      {/* Messages — dropdown scrollable */}
      <div style={{ position: 'relative' }}>
        <button
          type="button"
          onClick={() => setMessagesOpen((v) => !v)}
          onBlur={() => setTimeout(() => setMessagesOpen(false), 200)}
          aria-label={`${messageCount} messages`}
          style={{ ...btnGhost, position: 'relative' }}
        >
          <MessageSquare size={14} />
          <span>Messages</span>
          {messageCount > 0 && (
            <span
              style={{
                minWidth: 16,
                height: 16,
                padding: '0 4px',
                background: 'var(--accent-terracotta, #C8663D)',
                color: CREAM,
                borderRadius: 8,
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: 9,
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {messageCount}
            </span>
          )}
        </button>
        {messagesOpen && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              right: 0,
              width: 360,
              maxHeight: 420,
              background: 'var(--bg-elevated, #FFFFFF)',
              border: '1px solid var(--border-default, #DFD3B8)',
              borderRadius: 8,
              boxShadow: 'var(--shadow-xl, 0 20px 25px rgba(0,0,0,0.15))',
              zIndex: 210,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                padding: '10px 14px',
                borderBottom: '1px solid var(--border-subtle, #EDE3CE)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ fontFamily: 'var(--font-serif, Fraunces, serif)', fontStyle: 'italic', fontWeight: 500, fontSize: 15, color: 'var(--fg-primary)' }}>
                Messages
              </div>
              <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 10, color: 'var(--fg-muted)', textTransform: 'uppercase' }}>
                {messageCount} non lus
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {MOCK_MESSAGES.map((m) => {
                const ChannelIcon =
                  m.channel === 'whatsapp' ? WhatsAppIcon
                  : m.channel === 'telegram' ? TelegramIcon
                  : m.channel === 'email' ? Mail
                  : MessageSquare;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setMessagesOpen(false);
                      navigate('/messages-operateurs');
                    }}
                    style={{
                      display: 'flex',
                      width: '100%',
                      textAlign: 'left',
                      padding: '10px 14px',
                      gap: 10,
                      background: 'transparent',
                      border: 'none',
                      borderBottom: '1px solid var(--border-subtle, #EDE3CE)',
                      cursor: 'pointer',
                      alignItems: 'flex-start',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-hover, #F0E9DA)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    {/* Puce canal avec icône */}
                    <div
                      style={{
                        flexShrink: 0,
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: channelColor[m.channel],
                        color: '#FFFFFF',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginTop: 2,
                      }}
                      title={channelLabel[m.channel]}
                    >
                      <ChannelIcon size={14} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 3 }}>
                        <span style={{ fontFamily: 'var(--font-sans, Inter, sans-serif)', fontSize: 12, fontWeight: 600, color: 'var(--fg-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {m.from}
                        </span>
                        {m.urgent && (
                          <span style={{ flexShrink: 0, background: 'var(--color-danger, #B84A2F)', color: CREAM, fontSize: 9, padding: '1px 6px', borderRadius: 6, fontFamily: 'var(--font-mono, monospace)', fontWeight: 700 }}>
                            URGENT
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--fg-secondary)', marginBottom: 3, lineHeight: 1.35 }}>
                        {m.preview}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--fg-muted)', fontFamily: 'var(--font-mono, monospace)', display: 'flex', justifyContent: 'space-between' }}>
                        <span>{m.time}</span>
                        <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>{channelLabel[m.channel]}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                setMessagesOpen(false);
                navigate('/messages-operateurs');
              }}
              style={{
                padding: '10px',
                background: 'var(--bg-canvas, #F5EFE5)',
                border: 'none',
                borderTop: '1px solid var(--border-subtle, #EDE3CE)',
                color: 'var(--accent-terracotta, #C8663D)',
                fontFamily: 'var(--font-sans, Inter, sans-serif)',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Voir tous les messages →
            </button>
          </div>
        )}
      </div>

      {/* Notifications — dropdown scrollable */}
      <div style={{ position: 'relative' }}>
        <button
          type="button"
          onClick={() => setNotifsOpen((v) => !v)}
          onBlur={() => setTimeout(() => setNotifsOpen(false), 200)}
          aria-label={`${notifCount} notifications`}
          style={{ ...btnGhost, position: 'relative' }}
        >
          <Bell size={14} />
          <span>Notifs</span>
          {notifCount > 0 && (
            <span
              style={{
                minWidth: 16,
                height: 16,
                padding: '0 4px',
                background: 'var(--color-danger, #B84A2F)',
                color: CREAM,
                borderRadius: 8,
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: 9,
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {notifCount}
            </span>
          )}
        </button>
        {notifsOpen && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              right: 0,
              width: 360,
              maxHeight: 420,
              background: 'var(--bg-elevated, #FFFFFF)',
              border: '1px solid var(--border-default, #DFD3B8)',
              borderRadius: 8,
              boxShadow: 'var(--shadow-xl, 0 20px 25px rgba(0,0,0,0.15))',
              zIndex: 210,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                padding: '10px 14px',
                borderBottom: '1px solid var(--border-subtle, #EDE3CE)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ fontFamily: 'var(--font-serif, Fraunces, serif)', fontStyle: 'italic', fontWeight: 500, fontSize: 15, color: 'var(--fg-primary)' }}>
                Notifications
              </div>
              <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 10, color: 'var(--fg-muted)', textTransform: 'uppercase' }}>
                {notifCount} nouvelles
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {MOCK_NOTIFS.map((n) => {
                const levelColor = n.level === 'danger' ? 'var(--color-danger, #B84A2F)'
                  : n.level === 'success' ? 'var(--accent-sage, #7A8C6A)'
                  : 'var(--accent-indigo, #4A5D75)';
                return (
                  <div
                    key={n.id}
                    style={{
                      padding: '10px 14px',
                      borderBottom: '1px solid var(--border-subtle, #EDE3CE)',
                      borderLeft: `3px solid ${levelColor}`,
                    }}
                  >
                    <div style={{ fontFamily: 'var(--font-sans, Inter, sans-serif)', fontSize: 12, fontWeight: 600, color: 'var(--fg-primary)', marginBottom: 3 }}>
                      {n.title}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--fg-secondary)', marginBottom: 3, lineHeight: 1.35 }}>
                      {n.body}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--fg-muted)', fontFamily: 'var(--font-mono, monospace)' }}>
                      {n.time}
                    </div>
                  </div>
                );
              })}
            </div>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                setNotifsOpen(false);
              }}
              style={{
                padding: '10px',
                background: 'var(--bg-canvas, #F5EFE5)',
                border: 'none',
                borderTop: '1px solid var(--border-subtle, #EDE3CE)',
                color: 'var(--accent-terracotta, #C8663D)',
                fontFamily: 'var(--font-sans, Inter, sans-serif)',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Tout marquer comme lu →
            </button>
          </div>
        )}
      </div>

      {/* Dashboards §14 — dropdown scrollable */}
      <div style={{ position: 'relative' }}>
        <button
          type="button"
          onClick={() => setDashboardsOpen((v) => !v)}
          onBlur={() => setTimeout(() => setDashboardsOpen(false), 200)}
          aria-label="Dashboards"
          style={btnGhost}
        >
          <LayoutDashboard size={14} style={{ color: 'var(--accent-indigo, #4A5D75)' }} />
          <span>Dashboards</span>
          <ChevronDown size={12} />
        </button>
        {dashboardsOpen && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              right: 0,
              width: 300,
              maxHeight: 480,
              background: 'var(--bg-elevated, #FFFFFF)',
              border: '1px solid var(--border-default, #DFD3B8)',
              borderRadius: 8,
              boxShadow: 'var(--shadow-xl, 0 20px 25px rgba(0,0,0,0.15))',
              zIndex: 210,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                padding: '10px 14px',
                borderBottom: '1px solid var(--border-subtle, #EDE3CE)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ fontFamily: 'var(--font-serif, Fraunces, serif)', fontStyle: 'italic', fontWeight: 500, fontSize: 15, color: 'var(--fg-primary)' }}>
                Dashboards §14
              </div>
              <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 10, color: 'var(--fg-muted)', textTransform: 'uppercase' }}>
                {DASHBOARDS.length} vues
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: 4 }}>
              {DASHBOARDS.map((d) => {
                const Icon = d.icon;
                return (
                  <button
                    key={d.path}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setDashboardsOpen(false);
                      navigate(d.path);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      width: '100%',
                      padding: '8px 12px',
                      background: 'transparent',
                      border: 'none',
                      borderRadius: 6,
                      fontFamily: 'var(--font-sans, Inter, sans-serif)',
                      fontSize: 13,
                      color: 'var(--fg-primary, #2F1F12)',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-hover, #F0E9DA)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <Icon size={14} style={{ color: 'var(--accent-indigo, #4A5D75)', flexShrink: 0 }} />
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {d.label}
                    </span>
                    {d.todo && (
                      <span
                        style={{
                          flexShrink: 0,
                          padding: '1px 6px',
                          background: 'var(--accent-gold, #C89B3C)',
                          color: CREAM,
                          borderRadius: 6,
                          fontFamily: 'var(--font-mono, monospace)',
                          fontSize: 9,
                          fontWeight: 700,
                          textTransform: 'uppercase',
                        }}
                      >
                        TODO
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Sélecteur thème (light / dark / auto) */}
      <div style={{ position: 'relative' }}>
        <button
          type="button"
          onClick={() => setThemeOpen((v) => !v)}
          onBlur={() => setTimeout(() => setThemeOpen(false), 150)}
          aria-label={`Thème : ${currentModeLabel[theme.mode]}`}
          title={`Thème : ${currentModeLabel[theme.mode]}`}
          style={btnGhost}
        >
          {theme.mode === 'light' ? <Sun size={14} /> : theme.mode === 'dark' ? <Moon size={14} /> : <Monitor size={14} />}
          <span>{currentModeLabel[theme.mode]}</span>
          <ChevronDown size={12} />
        </button>
        {themeOpen && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              right: 0,
              minWidth: 160,
              background: 'var(--bg-elevated, #FFFFFF)',
              border: '1px solid var(--border-default, #DFD3B8)',
              borderRadius: 8,
              boxShadow: 'var(--shadow-lg, 0 10px 15px rgba(0,0,0,0.1))',
              padding: 4,
              zIndex: 210,
            }}
          >
            {(['light', 'dark', 'auto'] as ThemeMode[]).map((m) => {
              const Icon = m === 'light' ? Sun : m === 'dark' ? Moon : Monitor;
              const active = theme.mode === m;
              return (
                <button
                  key={m}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setMode(m);
                    setThemeOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    width: '100%',
                    padding: '8px 12px',
                    background: active ? 'var(--accent-terracotta, #C8663D)' : 'transparent',
                    color: active ? CREAM : 'var(--fg-primary, #2F1F12)',
                    border: 'none',
                    borderRadius: 6,
                    fontFamily: 'var(--font-sans, Inter, sans-serif)',
                    fontSize: 13,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <Icon size={14} />
                  <span>{currentModeLabel[m]}</span>
                  {m === 'auto' && (
                    <span
                      style={{
                        marginLeft: 'auto',
                        fontFamily: 'var(--font-mono, monospace)',
                        fontSize: 10,
                        color: active ? 'rgba(251,248,243,0.75)' : 'var(--fg-muted, #9B8874)',
                        textTransform: 'uppercase',
                      }}
                    >
                      {isDark ? '↓ sombre' : '↑ clair'}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Sélecteur sociétés (multi-tenant §16) */}
      <div style={{ position: 'relative' }}>
        <button
          type="button"
          onClick={() => setSocieteOpen((v) => !v)}
          onBlur={() => setTimeout(() => setSocieteOpen(false), 150)}
          aria-label="Changer de société"
          style={{ ...btnGhost, fontFamily: 'var(--font-mono, monospace)', fontWeight: 700 }}
        >
          <Building2 size={14} />
          <span>Sociétés</span>
          <span style={{ padding: '0 4px', color: 'var(--accent-indigo, #4A5D75)' }}>
            {SOCIETES.map((s) => s.code).join('/')}
          </span>
          <ChevronDown size={12} />
        </button>
        {societeOpen && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              right: 0,
              minWidth: 220,
              background: 'var(--bg-elevated, #FFFFFF)',
              border: '1px solid var(--border-default, #DFD3B8)',
              borderRadius: 8,
              boxShadow: 'var(--shadow-lg, 0 10px 15px rgba(0,0,0,0.1))',
              padding: 4,
              zIndex: 210,
            }}
          >
            {SOCIETES.map((s, idx) => (
              <button
                key={s.code}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  setSocieteIdx(idx);
                  setSocieteOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '8px 12px',
                  background: idx === societeIdx ? 'var(--bg-canvas, #F5EFE5)' : 'transparent',
                  border: 'none',
                  borderRadius: 6,
                  fontFamily: 'var(--font-sans, Inter, sans-serif)',
                  fontSize: 13,
                  color: 'var(--fg-primary, #2F1F12)',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <span>{s.nom}</span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: 10,
                    color: 'var(--fg-muted, #9B8874)',
                    fontWeight: 700,
                  }}
                >
                  {s.code}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Session · Déconnexion */}
      <button
        type="button"
        onClick={handleLogout}
        aria-label="Déconnexion"
        style={{
          ...btnGhost,
          background: 'var(--accent-terracotta, #C8663D)',
          color: CREAM,
          borderColor: 'var(--accent-terracotta, #C8663D)',
          fontWeight: 600,
        }}
      >
        <LogOut size={14} />
        <span>Session</span>
        <span style={{ opacity: 0.7 }}>·</span>
        <span>Déconnexion</span>
      </button>
      </div>
    </div>
  );
};

export default UserBar;
