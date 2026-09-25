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
import PlumeLogo from './PlumeLogo';
import {
  Search,
  Sparkles,
  MessageSquare,
  Bell,
  Building2,
  LogOut,
  ChevronDown,
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

const UserBar: React.FC<UserBarProps> = ({ topOffset = 0, leftOffset = 0 }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [societeIdx, setSocieteIdx] = React.useState(0);
  const [societeOpen, setSocieteOpen] = React.useState(false);
  const [notifCount] = React.useState(3);
  const [messageCount] = React.useState(2);

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

  return (
    <div
      style={{
        position: 'fixed',
        top: topOffset,
        left: leftOffset,      // décalé de la largeur sidebar
        right: 0,
        zIndex: 30,            // sous la sidebar (z-50) pour qu'elle passe par-dessus
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

      {/* Messages */}
      <button
        type="button"
        onClick={handleMessages}
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

      {/* Notifications */}
      <button
        type="button"
        onClick={handleNotifs}
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
