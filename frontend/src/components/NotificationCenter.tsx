/**
 * NotificationCenter - Cloche + panneau déroulant des notifications.
 * - Badge rouge avec compteur (non-lues)
 * - Dernières 20 notifications (icône par type, titre, snippet, temps relatif)
 * - Marquer lu + naviguer sur clic
 * - Footer: "Tout marquer lu" / "Voir tout"
 * - Socket.IO: `notification:new` => toast + increment
 * Utilise les design tokens design-system.css.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Info,
  AlertTriangle,
  AlertOctagon,
  MessageSquare,
  CheckCheck,
} from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import api from '../services/api';
import { useToast } from '../hooks/useToast';

interface Notification {
  id: number | string;
  type?: 'info' | 'warning' | 'danger' | 'message' | string;
  titre?: string;
  title?: string;
  message?: string;
  contenu?: string;
  lien?: string;
  lu?: boolean;
  read?: boolean;
  date?: string;
  created_at?: string;
}

const SOCKET_URL =
  process.env.REACT_APP_SOCKET_URL ||
  (process.env.NODE_ENV === 'production' ? window.location.origin : 'http://localhost:5000');

function relativeTime(iso?: string): string {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const diff = Math.max(0, Date.now() - then);
  const s = Math.floor(diff / 1000);
  if (s < 60) return `il y a ${s} s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `il y a ${h} h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `il y a ${d} j`;
  return new Date(iso).toLocaleDateString('fr-FR');
}

function iconFor(type?: string) {
  switch (type) {
    case 'warning':
      return { Icon: AlertTriangle, color: 'var(--color-warning)' };
    case 'danger':
    case 'error':
      return { Icon: AlertOctagon, color: 'var(--color-danger)' };
    case 'message':
      return { Icon: MessageSquare, color: 'var(--accent-indigo)' };
    default:
      return { Icon: Info, color: 'var(--color-info)' };
  }
}

const NotificationCenter: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const refreshCount = useCallback(async () => {
    try {
      const r = await api.get('/notifications/non-lues/count');
      const c = r.data?.data?.count ?? r.data?.count ?? 0;
      setCount(c);
    } catch {}
  }, []);

  const loadList = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get('/notifications', { params: { limit: 20 } });
      const arr: Notification[] =
        r.data?.data?.notifications ?? r.data?.data ?? r.data?.notifications ?? [];
      setItems(Array.isArray(arr) ? arr.slice(0, 20) : []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // First load
  useEffect(() => {
    refreshCount();
  }, [refreshCount]);

  // Load list on open
  useEffect(() => {
    if (open) loadList();
  }, [open, loadList]);

  // Click outside to close
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  // Socket.IO subscription
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    let s: Socket | null = null;
    try {
      s = io(SOCKET_URL, { transports: ['websocket'], auth: { token } });
      s.on('notification:new', (payload: Notification) => {
        setCount((c) => c + 1);
        setItems((prev) => [payload, ...prev].slice(0, 20));
        const title = payload.titre || payload.title || 'Nouvelle notification';
        const msg = payload.message || payload.contenu || '';
        toast.info(msg, title);
      });
    } catch {}
    return () => {
      s?.disconnect();
    };
  }, [toast]);

  const markAllRead = async () => {
    try {
      await api.post('/notifications/tout-marquer-lu');
    } catch {}
    setCount(0);
    setItems((prev) => prev.map((n) => ({ ...n, lu: true, read: true })));
  };

  const openItem = async (n: Notification) => {
    try {
      if (!(n.lu || n.read)) {
        await api.post(`/notifications/${n.id}/marquer-lu`);
        setCount((c) => Math.max(0, c - 1));
        setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, lu: true, read: true } : x)));
      }
    } catch {}
    setOpen(false);
    if (n.lien) navigate(n.lien);
  };

  const displayCount = useMemo(() => (count > 99 ? '99+' : String(count)), [count]);

  return (
    <div ref={rootRef} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Notifications (${count} non-lues)`}
        style={{
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 36,
          height: 36,
          background: open ? 'var(--bg-hover)' : 'transparent',
          border: '1px solid transparent',
          borderRadius: 'var(--radius-full)',
          color: 'var(--fg-secondary)',
          cursor: 'pointer',
          transition: 'all var(--duration) var(--ease)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--bg-hover)';
        }}
        onMouseLeave={(e) => {
          if (!open) e.currentTarget.style.background = 'transparent';
        }}
      >
        <Bell size={18} />
        {count > 0 && (
          <span
            style={{
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
              boxShadow: 'var(--shadow-xs)',
            }}
          >
            {displayCount}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: 380,
            maxWidth: '92vw',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            overflow: 'hidden',
            zIndex: 30,
            fontFamily: 'var(--font-sans)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 'var(--s-3) var(--s-4)',
              borderBottom: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ fontWeight: 600, color: 'var(--fg-primary)' }}>Notifications</div>
            <button
              type="button"
              onClick={markAllRead}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--s-1)',
                background: 'transparent',
                border: 'none',
                color: 'var(--accent-terracotta)',
                cursor: 'pointer',
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
              }}
            >
              <CheckCheck size={14} /> Tout marquer lu
            </button>
          </div>

          <div style={{ maxHeight: 420, overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: 'var(--s-6)', textAlign: 'center', color: 'var(--fg-muted)' }}>
                Chargement…
              </div>
            ) : items.length === 0 ? (
              <div style={{ padding: 'var(--s-6)', textAlign: 'center', color: 'var(--fg-muted)' }}>
                Aucune notification
              </div>
            ) : (
              items.map((n) => {
                const { Icon, color } = iconFor(n.type);
                const unread = !(n.lu || n.read);
                const title = n.titre || n.title || 'Notification';
                const msg = n.message || n.contenu || '';
                return (
                  <button
                    key={String(n.id)}
                    onClick={() => openItem(n)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      gap: 'var(--s-3)',
                      alignItems: 'flex-start',
                      padding: 'var(--s-3) var(--s-4)',
                      background: 'transparent',
                      border: 'none',
                      borderLeft: `3px solid ${unread ? 'var(--accent-terracotta)' : 'transparent'}`,
                      borderBottom: '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      color: 'inherit',
                      fontFamily: 'inherit',
                      transition: 'background var(--duration-fast) var(--ease)',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = 'transparent';
                    }}
                  >
                    <div style={{ color, marginTop: 2, flexShrink: 0 }}>
                      <Icon size={16} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 'var(--text-sm)',
                          fontWeight: unread ? 600 : 500,
                          color: 'var(--fg-primary)',
                        }}
                      >
                        {title}
                      </div>
                      {msg && (
                        <div
                          style={{
                            marginTop: 2,
                            fontSize: 'var(--text-xs)',
                            color: 'var(--fg-secondary)',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {msg}
                        </div>
                      )}
                      <div
                        style={{
                          marginTop: 4,
                          fontSize: 11,
                          color: 'var(--fg-muted)',
                        }}
                      >
                        {relativeTime(n.date || n.created_at)}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 'var(--s-2) var(--s-4)',
              background: 'var(--bg-canvas)',
              borderTop: '1px solid var(--border-subtle)',
            }}
          >
            <button
              type="button"
              onClick={markAllRead}
              style={footerBtn()}
            >
              Tout marquer lu
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                navigate('/notifications');
              }}
              style={{ ...footerBtn(), color: 'var(--accent-terracotta)' }}
            >
              Voir tout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

function footerBtn(): React.CSSProperties {
  return {
    background: 'transparent',
    border: 'none',
    color: 'var(--fg-secondary)',
    fontSize: 'var(--text-xs)',
    fontWeight: 600,
    cursor: 'pointer',
    padding: 'var(--s-1) var(--s-2)',
    borderRadius: 'var(--radius-sm)',
  };
}

export default NotificationCenter;
