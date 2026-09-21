import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { MessageSquare, Send, Mail, Phone, Users, PlusCircle, X, RefreshCw } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { DashboardShell, SectionCard, ThemeToggle } from '../components/dashboard';
import { communicationService } from '../services/api';
import { useAuth } from '../hooks/useAuth';

const asArray = (x: any): any[] =>
  Array.isArray(x) ? x : (x?.data?.items || x?.data?.data || x?.data?.messages || x?.data || x?.items || []);

const CANAUX = [
  { code: 'email', label: 'Email', icon: Mail },
  { code: 'whatsapp', label: 'WhatsApp', icon: Phone },
  { code: 'sms', label: 'SMS', icon: MessageSquare },
  { code: 'interne', label: 'Interne', icon: Users },
];

const Communication: React.FC = () => {
  useAuth();
  const [canalFilter, setCanalFilter] = useState<string>('');
  const [conversations, setConversations] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedConv, setSelectedConv] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ canal: 'email', id_destinataire: '', contenu: '', template_code: '' });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: 'ok' | 'ko'; msg: string } | null>(null);

  const loadConversations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await communicationService.getConversations(canalFilter ? { canal: canalFilter } : undefined);
      setConversations(asArray(res.data));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [canalFilter]);

  const loadTemplates = useCallback(async () => {
    try {
      const res = await communicationService.getTemplates();
      setTemplates(asArray(res.data));
    } catch (e) { /* silent */ }
  }, []);

  const loadMessages = useCallback(async (conv: any) => {
    if (!conv) { setMessages([]); return; }
    try {
      const res = await communicationService.getMessages({
        entity_type: conv.entity_type || conv.type,
        entity_id: conv.entity_id || conv.id,
      });
      setMessages(asArray(res.data));
    } catch (e) { console.error(e); setMessages([]); }
  }, []);

  useEffect(() => { loadConversations(); }, [loadConversations]);
  useEffect(() => { loadTemplates(); }, [loadTemplates]);
  useEffect(() => { loadMessages(selectedConv); }, [selectedConv, loadMessages]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const url = process.env.REACT_APP_SOCKET_URL ||
      (process.env.NODE_ENV === 'production' ? 'https://fabrication.laplume-artisanale.tn' : 'http://localhost:5000');
    const socket: Socket = io(url, { auth: { token }, transports: ['websocket', 'polling'] });
    socket.on('communication:sent', () => {
      loadConversations();
      if (selectedConv) loadMessages(selectedConv);
    });
    return () => { socket.close(); };
  }, [loadConversations, loadMessages, selectedConv]);

  const showToast = (type: 'ok' | 'ko', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const submitMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await communicationService.envoyerMessage({
        canal: form.canal,
        id_destinataire: form.id_destinataire ? Number(form.id_destinataire) : undefined,
        contenu: form.contenu,
        template_code: form.template_code || undefined,
      });
      showToast('ok', 'Message envoyé');
      setShowModal(false);
      setForm({ canal: 'email', id_destinataire: '', contenu: '', template_code: '' });
      loadConversations();
      if (selectedConv) loadMessages(selectedConv);
    } catch (err: any) {
      showToast('ko', err.response?.data?.message || 'Erreur envoi');
    }
  };

  const btnGhost: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px',
    background: 'var(--bg-hover)', color: 'var(--fg-secondary)',
    border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-full)',
    fontSize: 'var(--text-xs)', fontWeight: 600, cursor: 'pointer',
  };
  const btnPrimary: React.CSSProperties = { ...btnGhost, background: 'var(--accent-terracotta)', color: '#fff', borderColor: 'var(--accent-terracotta)' };
  const inputStyle: React.CSSProperties = {
    padding: '8px 10px', background: 'var(--bg-elevated)',
    border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)',
    color: 'var(--fg-primary)', fontSize: 'var(--text-sm)', width: '100%',
  };

  const filteredConvs = useMemo(() => conversations, [conversations]);

  return (
    <DashboardLayout title="Communication" activeSection="communication" onSectionChange={() => {}}>
      <DashboardShell
        eyebrow="Communication"
        title="Communication multi-canal"
        subtitle="Gérez vos échanges email, WhatsApp, SMS et interne — le tout depuis une seule vue."
        headerRight={
          <>
            <select value={canalFilter} onChange={(e) => setCanalFilter(e.target.value)}
              style={{ ...inputStyle, width: 'auto', borderRadius: 'var(--radius-full)' }}>
              <option value="">Tous les canaux</option>
              {CANAUX.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
            </select>
            <button onClick={loadConversations} style={btnGhost}><RefreshCw size={14} /> Actualiser</button>
            <button onClick={() => setShowModal(true)} style={btnPrimary}><PlusCircle size={14} /> Nouveau message</button>
            <ThemeToggle />
          </>
        }
      >
        <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 16 }}>
          <SectionCard title="Conversations" icon={<MessageSquare size={16} />} subtitle={`${filteredConvs.length} discussion(s)`}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 520, overflowY: 'auto' }}>
              {loading ? (
                <div style={{ padding: 20, textAlign: 'center', color: 'var(--fg-muted)' }}>Chargement…</div>
              ) : filteredConvs.length === 0 ? (
                <div style={{ padding: 20, textAlign: 'center', color: 'var(--fg-muted)' }}>Aucune conversation</div>
              ) : filteredConvs.map((c, i) => {
                const active = selectedConv && (selectedConv.entity_id === c.entity_id || selectedConv.id === c.id);
                return (
                  <button key={c.id || c.entity_id || i} onClick={() => setSelectedConv(c)}
                    style={{
                      textAlign: 'left', padding: 10,
                      background: active ? 'var(--bg-hover)' : 'var(--bg-elevated)',
                      border: `1px solid ${active ? 'var(--accent-terracotta)' : 'var(--border-subtle)'}`,
                      borderRadius: 'var(--radius-sm)', cursor: 'pointer', color: 'var(--fg-primary)',
                    }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                      <strong style={{ fontSize: 'var(--text-sm)' }}>{c.titre || c.nom || c.destinataire || `Conversation #${c.id || i}`}</strong>
                      {(c.unread ?? c.non_lus) > 0 && (
                        <span style={{ background: 'var(--accent-terracotta)', color: '#fff', borderRadius: 'var(--radius-full)', padding: '1px 8px', fontSize: 10 }}>
                          {c.unread ?? c.non_lus}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--fg-muted)', marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.last_message || c.dernier_message || c.contenu || '—'}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--fg-muted)', marginTop: 3 }}>
                      {(c.canal || '').toUpperCase()} · {c.date ? new Date(c.date).toLocaleString('fr-FR') : ''}
                    </div>
                  </button>
                );
              })}
            </div>
          </SectionCard>

          <SectionCard
            title={selectedConv ? (selectedConv.titre || selectedConv.nom || 'Discussion') : 'Sélectionnez une conversation'}
            subtitle={selectedConv ? `Canal: ${selectedConv.canal || '—'}` : 'Cliquez sur une conversation à gauche'}
            icon={<Send size={16} />}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 520, overflowY: 'auto', padding: 4 }}>
              {!selectedConv ? (
                <div style={{ padding: 30, textAlign: 'center', color: 'var(--fg-muted)' }}>—</div>
              ) : messages.length === 0 ? (
                <div style={{ padding: 20, textAlign: 'center', color: 'var(--fg-muted)' }}>Aucun message</div>
              ) : messages.map((m, i) => {
                const mine = m.expediteur === 'moi' || m.direction === 'out';
                return (
                  <div key={m.id_message || m.id || i}
                    style={{
                      alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth: '75%',
                      padding: '8px 12px',
                      background: mine ? 'var(--accent-terracotta)' : 'var(--bg-hover)',
                      color: mine ? '#fff' : 'var(--fg-primary)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                    }}>
                    <div style={{ fontSize: 'var(--text-sm)' }}>{m.contenu || m.message || ''}</div>
                    <div style={{ fontSize: 10, opacity: 0.7, marginTop: 4 }}>
                      {m.date_envoi ? new Date(m.date_envoi).toLocaleString('fr-FR') : ''}
                      {m.statut ? ` · ${m.statut}` : ''}
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>
        </div>

        {showModal && (
          <div onClick={() => setShowModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
            <form onClick={(e) => e.stopPropagation()} onSubmit={submitMessage}
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', maxWidth: 520, width: '100%', padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ margin: 0, color: 'var(--fg-primary)' }}>Nouveau message</h3>
                <button type="button" onClick={() => setShowModal(false)} style={btnGhost}><X size={14} /></button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <select value={form.canal} onChange={(e) => setForm({ ...form, canal: e.target.value })} style={inputStyle}>
                  {CANAUX.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
                </select>
                <input placeholder="ID destinataire" value={form.id_destinataire}
                  onChange={(e) => setForm({ ...form, id_destinataire: e.target.value })} style={inputStyle} required />
                <select value={form.template_code} onChange={(e) => setForm({ ...form, template_code: e.target.value })} style={inputStyle}>
                  <option value="">-- Template (optionnel) --</option>
                  {templates.map((t, i) => (
                    <option key={t.code || t.id || i} value={t.code || t.id}>{t.nom || t.code || t.libelle}</option>
                  ))}
                </select>
                <textarea placeholder="Contenu du message" value={form.contenu}
                  onChange={(e) => setForm({ ...form, contenu: e.target.value })} rows={5}
                  style={{ ...inputStyle, resize: 'vertical' }} required />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
                <button type="button" onClick={() => setShowModal(false)} style={btnGhost}>Annuler</button>
                <button type="submit" style={btnPrimary}><Send size={14} /> Envoyer</button>
              </div>
            </form>
          </div>
        )}

        {toast && (
          <div style={{
            position: 'fixed', bottom: 20, right: 20, zIndex: 2000,
            padding: '12px 18px', borderRadius: 'var(--radius-md)',
            background: toast.type === 'ok' ? 'var(--accent-sage)' : 'var(--accent-rose, tomato)',
            color: '#fff', fontSize: 'var(--text-sm)', fontWeight: 600,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}>{toast.msg}</div>
        )}
      </DashboardShell>
    </DashboardLayout>
  );
};

export default Communication;
