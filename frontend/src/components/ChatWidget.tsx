/**
 * ChatWidget — messagerie flottante temps-réel (Socket.IO)
 * Bas droite. Ouvre/ferme, sélection utilisateur, envoi + réception live.
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, X, Send, Minimize2, Maximize2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import { io, Socket } from 'socket.io-client';

interface Message {
  id: number;
  id_expediteur: number;
  id_destinataire: number;
  sujet?: string;
  contenu: string;
  urgent: boolean;
  lu: boolean;
  date_envoi: string;
  date_lecture?: string | null;
  expediteur_nom?: string | null;
  expediteur_prenom?: string | null;
  expediteur_email?: string;
}

interface OnlineUser {
  id_utilisateur: number;
  email: string;
  nom?: string | null;
  prenom?: string | null;
  role?: string;
}

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL ||
  (process.env.NODE_ENV === 'production' ? window.location.origin : 'http://localhost:5000');

const ChatWidget: React.FC = () => {
  const { user } = useAuth();
  const meId = Number(user?.id) || 0;
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [users, setUsers] = useState<OnlineUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load users list once
  useEffect(() => {
    api.get('/utilisateurs').then((r) => {
      const list: OnlineUser[] = Array.isArray(r.data?.data?.utilisateurs)
        ? r.data.data.utilisateurs
        : Array.isArray(r.data?.data)
        ? r.data.data
        : [];
      setUsers(list.filter((u) => u.id_utilisateur !== meId));
    }).catch(() => {});
  }, [meId]);

  // Fetch unread count on mount + every time we open the widget
  const refreshUnread = useCallback(async () => {
    try {
      const r = await api.get('/messages/non-lus/count');
      setUnreadCount(r.data?.data?.count ?? 0);
    } catch {}
  }, []);

  useEffect(() => { refreshUnread(); }, [refreshUnread]);

  // Socket.IO connection with JWT
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const s = io(SOCKET_URL, {
      transports: ['websocket'],
      auth: { token },
    });
    socketRef.current = s;

    s.on('message:new', (m: Message) => {
      // Update unread badge
      if (m.id_destinataire === meId) {
        setUnreadCount((c) => c + 1);
      }
      // Append to active conversation
      if (
        selectedUser &&
        (m.id_expediteur === selectedUser || m.id_destinataire === selectedUser)
      ) {
        setMessages((prev) => [...prev, m]);
      }
    });

    s.on('message:read', ({ id, date_lecture }: { id: number; date_lecture: string }) => {
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, lu: true, date_lecture } : m)));
    });

    return () => {
      s.disconnect();
      socketRef.current = null;
    };
  }, [meId, selectedUser]);

  // Load conversation when selectedUser changes
  useEffect(() => {
    if (!selectedUser) { setMessages([]); return; }
    api.get(`/messages/conversation/${selectedUser}`)
      .then((r) => {
        setMessages(r.data?.data?.messages ?? []);
        // Mark incoming ones as read
        (r.data?.data?.messages ?? [])
          .filter((m: Message) => !m.lu && m.id_destinataire === meId)
          .forEach((m: Message) => {
            api.put(`/messages/${m.id}/lu`).catch(() => {});
          });
        refreshUnread();
      })
      .catch(() => setMessages([]));
  }, [selectedUser, meId, refreshUnread]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return;
    try {
      await api.post('/messages', {
        destinataire_id: selectedUser,
        message: newMessage.trim(),
        sujet: 'Message',
        urgent: false,
      });
      setNewMessage('');
      // Optimistic — server will echo via Socket.IO too
    } catch (error) {
      console.error('Erreur envoi:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const displayName = (u: OnlineUser) => {
    if (u.prenom || u.nom) return `${u.prenom || ''} ${u.nom || ''}`.trim();
    return u.email;
  };

  const selected = users.find((u) => u.id_utilisateur === selectedUser);

  // Launcher (closed state)
  if (!isOpen) {
    return (
      <button
        onClick={() => { setIsOpen(true); refreshUnread(); }}
        title="Ouvrir la messagerie"
        style={{
          position: 'fixed', bottom: 24, right: 96,
          width: 56, height: 56,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'var(--accent-terracotta, #C8663D)', color: '#fff',
          border: 'none', borderRadius: '50%',
          boxShadow: '0 8px 20px rgba(75, 45, 20, 0.25)',
          cursor: 'pointer', zIndex: 50,
        }}
      >
        <MessageCircle size={22} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: -4, right: -4,
            minWidth: 22, height: 22, padding: '0 6px',
            background: '#B84A2F', color: '#fff',
            fontSize: 11, fontWeight: 700,
            borderRadius: 11, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            border: '2px solid var(--bg-app, #FBF8F3)',
          }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
    );
  }

  return (
    <div
      style={{
        position: 'fixed', bottom: 16, right: 16, zIndex: 50,
        width: isMinimized ? 320 : 384,
        height: isMinimized ? 48 : 600,
        background: 'var(--bg-elevated, #fff)',
        border: '1px solid var(--border-subtle, #EDE3CE)',
        borderRadius: 'var(--radius-md, 12px)',
        boxShadow: '0 24px 48px rgba(75, 45, 20, 0.18)',
        display: 'flex', flexDirection: 'column',
        transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 14px',
        background: 'var(--accent-terracotta, #C8663D)', color: '#fff',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <MessageCircle size={18} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>
              {selected ? displayName(selected) : 'Messagerie'}
            </div>
            {!selected && unreadCount > 0 && (
              <div style={{ fontSize: 11, opacity: 0.9 }}>{unreadCount} non lu{unreadCount > 1 ? 's' : ''}</div>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={() => setIsMinimized((v) => !v)}
            style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: 4 }}
            title={isMinimized ? 'Agrandir' : 'Réduire'}
          >
            {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: 4 }}
            title="Fermer"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
          {/* Users list */}
          <div style={{
            width: 130,
            borderRight: '1px solid var(--border-subtle, #EDE3CE)',
            overflowY: 'auto',
            background: 'var(--bg-canvas, #F5EFE5)',
          }}>
            {users.length === 0 && (
              <div style={{ padding: 12, fontSize: 12, color: 'var(--fg-muted, #9B8874)' }}>
                Aucun utilisateur
              </div>
            )}
            {users.map((u) => (
              <button
                key={u.id_utilisateur}
                onClick={() => setSelectedUser(u.id_utilisateur)}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '10px 12px',
                  background: selectedUser === u.id_utilisateur ? 'var(--bg-hover, #F0E9DA)' : 'transparent',
                  border: 'none',
                  borderBottom: '1px solid var(--border-subtle, #EDE3CE)',
                  cursor: 'pointer',
                  fontSize: 12, color: 'var(--fg-primary, #2F1F12)',
                }}
              >
                <div style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {displayName(u)}
                </div>
                {u.role && (
                  <div style={{ fontSize: 10, color: 'var(--fg-muted, #9B8874)', marginTop: 2 }}>{u.role}</div>
                )}
              </button>
            ))}
          </div>

          {/* Messages */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <div style={{
              flex: 1, overflowY: 'auto', padding: 12,
              background: 'var(--bg-app, #FBF8F3)',
              display: 'flex', flexDirection: 'column', gap: 6,
            }}>
              {!selectedUser ? (
                <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--fg-muted, #9B8874)', fontSize: 12 }}>
                  Choisis un utilisateur pour démarrer
                </div>
              ) : messages.length === 0 ? (
                <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--fg-muted, #9B8874)', fontSize: 12 }}>
                  Aucun message. Envoie le premier !
                </div>
              ) : (
                messages.map((m) => {
                  const mine = m.id_expediteur === meId;
                  return (
                    <div
                      key={m.id}
                      style={{
                        alignSelf: mine ? 'flex-end' : 'flex-start',
                        maxWidth: '80%',
                        padding: '6px 10px',
                        borderRadius: mine ? '10px 10px 2px 10px' : '10px 10px 10px 2px',
                        background: mine ? 'var(--accent-terracotta, #C8663D)' : 'var(--bg-elevated, #fff)',
                        color: mine ? '#fff' : 'var(--fg-primary, #2F1F12)',
                        fontSize: 13,
                        boxShadow: '0 1px 2px rgba(75, 45, 20, 0.06)',
                        border: mine ? 'none' : '1px solid var(--border-subtle, #EDE3CE)',
                        wordBreak: 'break-word',
                      }}
                    >
                      <div>{m.contenu}</div>
                      <div style={{
                        fontSize: 10, opacity: 0.7, marginTop: 3, textAlign: 'right',
                      }}>
                        {new Date(m.date_envoi).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        {mine && m.lu && ' ✓✓'}
                        {mine && !m.lu && ' ✓'}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            {selectedUser && (
              <div style={{
                display: 'flex', gap: 6, padding: 10,
                borderTop: '1px solid var(--border-subtle, #EDE3CE)',
                background: 'var(--bg-elevated, #fff)',
              }}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Écris un message…"
                  style={{
                    flex: 1, padding: '8px 12px',
                    background: 'var(--bg-app, #FBF8F3)',
                    border: '1px solid var(--border-subtle, #EDE3CE)',
                    borderRadius: 'var(--radius-full, 999px)',
                    fontSize: 13, color: 'var(--fg-primary, #2F1F12)',
                    outline: 'none',
                  }}
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  style={{
                    width: 36, height: 36,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: newMessage.trim() ? 'var(--accent-terracotta, #C8663D)' : 'var(--bg-hover, #F0E9DA)',
                    color: newMessage.trim() ? '#fff' : 'var(--fg-muted, #9B8874)',
                    border: 'none', borderRadius: '50%',
                    cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
                  }}
                >
                  <Send size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
