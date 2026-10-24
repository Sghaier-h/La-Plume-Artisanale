/**
 * SessionTimeoutManager.tsx — §14quater.10
 *
 * Déconnexion automatique après 15 minutes d'inactivité :
 *  - détection : mousemove / mousedown / keydown / click / scroll / touchstart
 *  - détection réseau : intercepteurs axios (request + response)
 *  - après 14 min idle → modal « Session expirée dans 60s... » avec bouton
 *    « Rester connecté » qui reset le timer
 *  - après 15 min idle → logout : clear localStorage, redirect /login,
 *    toast d'information
 *  - debounce 500 ms sur les événements souris/clavier pour ne pas spammer
 *
 * Monté dans App.tsx (près de AuthProvider / AppProvider).
 * Désactivé automatiquement sur /login, /portail/login, les routes TV
 * atelier (/tv/*) et les tablettes kiosque (/tablette/*).
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

const DEFAULT_IDLE_MS    = 14 * 60 * 1000;  // 14 min → warning
const DEFAULT_WARNING_MS = 60 * 1000;       // +60 s → logout = 15 min total
const DEBOUNCE_MS        = 500;

interface IdleOptions {
  idleMs?: number;
  warningMs?: number;
  excludePaths?: RegExp[];
}

/** Hook interne — surveille l'activité et déclenche onWarn/onLogout. */
export function useIdleTimeout({
  idleMs = DEFAULT_IDLE_MS,
  warningMs = DEFAULT_WARNING_MS,
  onWarn,
  onReset,
  onLogout,
  active = true,
}: {
  idleMs?: number;
  warningMs?: number;
  onWarn: () => void;
  onReset: () => void;
  onLogout: () => void;
  active?: boolean;
}) {
  const lastActivity = useRef<number>(Date.now());
  const warnTimer    = useRef<number | null>(null);
  const logoutTimer  = useRef<number | null>(null);
  const debounceTimer = useRef<number | null>(null);
  const warned       = useRef<boolean>(false);

  const clearAllTimers = useCallback(() => {
    if (warnTimer.current)   { window.clearTimeout(warnTimer.current);   warnTimer.current = null; }
    if (logoutTimer.current) { window.clearTimeout(logoutTimer.current); logoutTimer.current = null; }
  }, []);

  const scheduleTimers = useCallback(() => {
    clearAllTimers();
    warned.current = false;
    warnTimer.current = window.setTimeout(() => {
      warned.current = true;
      onWarn();
      logoutTimer.current = window.setTimeout(() => {
        onLogout();
      }, warningMs);
    }, idleMs);
  }, [idleMs, warningMs, onWarn, onLogout, clearAllTimers]);

  const resetActivity = useCallback(() => {
    lastActivity.current = Date.now();
    if (warned.current) {
      // Si on était en warning, on reset explicitement (bouton « Rester connecté »).
      warned.current = false;
      onReset();
    }
    scheduleTimers();
  }, [scheduleTimers, onReset]);

  const handleEvent = useCallback(() => {
    if (debounceTimer.current) window.clearTimeout(debounceTimer.current);
    debounceTimer.current = window.setTimeout(() => {
      // On NE reset PAS si on est déjà en warning :
      // il faut un clic explicite sur « Rester connecté ».
      if (warned.current) return;
      lastActivity.current = Date.now();
      scheduleTimers();
    }, DEBOUNCE_MS);
  }, [scheduleTimers]);

  useEffect(() => {
    if (!active) { clearAllTimers(); return; }

    const events = ['mousemove', 'mousedown', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach(e => window.addEventListener(e, handleEvent, { passive: true }));

    // Intercepteurs axios — reset sur chaque requête réussie
    const reqId = axios.interceptors.request.use((config) => {
      handleEvent();
      return config;
    });
    const resId = axios.interceptors.response.use(
      (response) => { handleEvent(); return response; },
      (error) => Promise.reject(error),
    );

    scheduleTimers();

    return () => {
      events.forEach(e => window.removeEventListener(e, handleEvent));
      axios.interceptors.request.eject(reqId);
      axios.interceptors.response.eject(resId);
      if (debounceTimer.current) window.clearTimeout(debounceTimer.current);
      clearAllTimers();
    };
  }, [active, handleEvent, scheduleTimers, clearAllTimers]);

  return { resetActivity };
}

/** Chemins où le gestionnaire NE DOIT PAS s'activer. */
const DEFAULT_EXCLUDE_PATHS: RegExp[] = [
  /^\/login/,
  /^\/portail\/login/,
  /^\/portail\/reset-password/,
  /^\/tv\//,
  /^\/tablette\//,
];

interface ManagerProps extends IdleOptions {
  /** Message toast affiché à la déconnexion. */
  logoutMessage?: string;
}

export const SessionTimeoutManager: React.FC<ManagerProps> = ({
  idleMs = DEFAULT_IDLE_MS,
  warningMs = DEFAULT_WARNING_MS,
  excludePaths = DEFAULT_EXCLUDE_PATHS,
  logoutMessage = 'Session expirée pour cause d\'inactivité (15 min).',
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [countdown, setCountdown] = useState<number>(Math.ceil(warningMs / 1000));
  const countdownTimer = useRef<number | null>(null);
  const hasToken = (): boolean => {
    try { return !!localStorage.getItem('token'); } catch { return false; }
  };

  const isExcluded = excludePaths.some(rx => rx.test(location.pathname));
  const active = !isExcluded && hasToken();

  const stopCountdown = useCallback(() => {
    if (countdownTimer.current) {
      window.clearInterval(countdownTimer.current);
      countdownTimer.current = null;
    }
  }, []);

  const startCountdown = useCallback(() => {
    stopCountdown();
    setCountdown(Math.ceil(warningMs / 1000));
    countdownTimer.current = window.setInterval(() => {
      setCountdown((c) => (c > 0 ? c - 1 : 0));
    }, 1000);
  }, [warningMs, stopCountdown]);

  const doLogout = useCallback(() => {
    stopCountdown();
    setShowModal(false);
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete axios.defaults.headers.common['Authorization'];
    } catch { /* ignore */ }
    // Petit toast via window.alert / console — le ToastContext n'est pas garanti ici.
    try { window.setTimeout(() => window.alert(logoutMessage), 50); } catch { /* ignore */ }
    navigate('/login', { replace: true });
  }, [navigate, logoutMessage, stopCountdown]);

  const { resetActivity } = useIdleTimeout({
    idleMs,
    warningMs,
    active,
    onWarn: () => { setShowModal(true); startCountdown(); },
    onReset: () => { setShowModal(false); stopCountdown(); },
    onLogout: doLogout,
  });

  const handleStay = () => {
    resetActivity();          // reset timers + état warned
    setShowModal(false);
    stopCountdown();
  };

  // Si le composant disparaît (navigation sur route exclue), on cache le modal.
  useEffect(() => {
    if (!active) {
      setShowModal(false);
      stopCountdown();
    }
  }, [active, stopCountdown]);

  if (!active || !showModal) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="session-timeout-title"
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 9999, padding: '1rem',
      }}
    >
      <div
        style={{
          background: 'var(--bg-card, #fff)', color: 'var(--fg-primary, #222)',
          borderRadius: 12, padding: '1.5rem', maxWidth: 440, width: '100%',
          boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
          fontFamily: 'var(--font-sans, sans-serif)',
        }}
      >
        <h2 id="session-timeout-title" style={{ margin: 0, fontSize: '1.25rem', color: 'var(--accent-terracotta, #c75a3b)' }}>
          Session inactive
        </h2>
        <p style={{ marginTop: '0.75rem', lineHeight: 1.5 }}>
          Vous allez être déconnecté dans <strong>{countdown}s</strong> pour cause
          d'inactivité. Cliquez sur « Rester connecté » pour prolonger votre session.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', justifyContent: 'flex-end' }}>
          <button
            onClick={doLogout}
            style={{
              padding: '0.6rem 1rem', minHeight: 44, borderRadius: 8,
              border: '1px solid var(--border, #ccc)', background: 'transparent',
              cursor: 'pointer',
            }}
          >
            Se déconnecter
          </button>
          <button
            onClick={handleStay}
            autoFocus
            style={{
              padding: '0.6rem 1rem', minHeight: 44, borderRadius: 8,
              border: 'none', background: 'var(--accent-terracotta, #c75a3b)',
              color: '#fff', cursor: 'pointer', fontWeight: 600,
            }}
          >
            Rester connecté
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionTimeoutManager;
