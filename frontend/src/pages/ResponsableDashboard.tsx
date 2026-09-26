import React, { useState, useEffect } from 'react';
import { tachesService, messagesService } from '../services/api';
import { useWebSocket } from '../hooks/useWebSocket';
import {
  Factory, Users, CheckCircle, Clock, AlertCircle, Send, Bell, Activity,
} from 'lucide-react';
import { DashboardShell, KpiCard, SectionCard, ThemeToggle } from '../components/dashboard';

interface Tache {
  id_tache: number;
  id_of: number;
  numero_of: string;
  type_tache: string;
  assigne_a_nom?: string;
  assigne_a_prenom?: string;
  assigne_a_poste?: string;
  statut: string;
  priorite: number;
  quantite_demandee?: number;
  quantite_realisee?: number;
}

interface Operateur {
  id: number;
  nom: string;
  prenom: string;
  poste_travail: string;
  machine_assignee?: string;
  statut: 'online' | 'offline' | 'pause';
  tache_en_cours?: string;
}

const ResponsableDashboard: React.FC = () => {
  const [taches, setTaches] = useState<Tache[]>([]);
  const [operateurs, setOperateurs] = useState<Operateur[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMessageForm, setShowMessageForm] = useState(false);
  const [messageData, setMessageData] = useState({ destinataire_id: '', destinataire_poste: '', sujet: '', message: '' });
  const { connected, notifications } = useWebSocket();

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [tachesRes] = await Promise.all([tachesService.getTaches()]);
      setTaches(tachesRes.data.data.taches || []);
      setOperateurs([
        { id: 1, nom: 'Ahmed', prenom: 'Ben Ali', poste_travail: 'TISSEUR', machine_assignee: 'M2301', statut: 'online', tache_en_cours: 'OF-001' },
        { id: 2, nom: 'Mohamed', prenom: 'Trabelsi', poste_travail: 'MAGASINIER_MP', statut: 'online', tache_en_cours: 'OF-002' },
        { id: 3, nom: 'Fatma', prenom: 'Khelifi', poste_travail: 'COUPEUR', statut: 'online' },
        { id: 4, nom: 'Ali', prenom: 'Mahjoub', poste_travail: 'TISSEUR', machine_assignee: 'M2305', statut: 'pause' },
        { id: 5, nom: 'Sami', prenom: 'Bouslama', poste_travail: 'CONTROLEUR_QUALITE', statut: 'offline' },
      ]);
    } catch (err) {
      console.error('Erreur chargement:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssigner = async (tacheId: number, assigne_a: number) => {
    try {
      await tachesService.assignerTache(tacheId, { assigne_a });
      loadData();
    } catch {
      alert("Erreur lors de l'assignation");
    }
  };

  const handleEnvoyerMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await messagesService.envoyerMessage(messageData);
      setShowMessageForm(false);
      setMessageData({ destinataire_id: '', destinataire_poste: '', sujet: '', message: '' });
    } catch {
      alert("Erreur lors de l'envoi");
    }
  };

  const tachesParPoste = {
    MAGASINIER_MP: taches.filter((t) => t.type_tache === 'PREPARATION_MP'),
    TISSEUR: taches.filter((t) => t.type_tache === 'TISSAGE'),
    COUPEUR: taches.filter((t) => t.type_tache === 'COUPE'),
    CONTROLEUR_QUALITE: taches.filter((t) => t.type_tache === 'CONTROLE_QUALITE'),
  };

  const statutBadge = (statut: string) => {
    const map: Record<string, { bg: string; c: string; icon: any }> = {
      EN_COURS: { bg: 'var(--color-success-bg)', c: 'var(--color-success)', icon: CheckCircle },
      ASSIGNEE: { bg: 'var(--color-info-bg)', c: 'var(--color-info)', icon: Clock },
      EN_ATTENTE: { bg: 'var(--bg-hover)', c: 'var(--fg-secondary)', icon: Clock },
      EN_PAUSE: { bg: 'var(--color-warning-bg)', c: 'var(--color-warning)', icon: AlertCircle },
      TERMINEE: { bg: 'var(--color-success-bg)', c: 'var(--color-success)', icon: CheckCircle },
    };
    const b = map[statut] || map.EN_ATTENTE;
    const Icon = b.icon;
    return (
      <span style={{ ...badgeBase, background: b.bg, color: b.c, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        <Icon size={11} />
        {statut.replace('_', ' ')}
      </span>
    );
  };

  const prioriteBadge = (p: number) => {
    if (p === 1) return <span style={{ ...badgeBase, background: 'var(--color-danger-bg)', color: 'var(--color-danger)' }}>Urgente</span>;
    if (p === 2) return <span style={{ ...badgeBase, background: 'var(--color-warning-bg)', color: 'var(--color-warning)' }}>Prioritaire</span>;
    return <span style={{ ...badgeBase, background: 'var(--color-info-bg)', color: 'var(--color-info)' }}>Normale</span>;
  };

  return (
    <>
      <DashboardShell
        eyebrow="Poste — Responsable général"
        title="Tableau de bord — Responsable"
        subtitle="Attribution des tâches, supervision des opérateurs et pilotage global de la production."
        headerRight={
          <>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-xs)', color: connected ? 'var(--color-success)' : 'var(--color-danger)' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: connected ? 'var(--color-success)' : 'var(--color-danger)' }} />
              {connected ? 'Connecté' : 'Déconnecté'}
            </span>
            {notifications.length > 0 && (
              <span style={{ position: 'relative', display: 'inline-flex' }}>
                <Bell size={16} style={{ color: 'var(--fg-secondary)' }} />
                <span style={{ position: 'absolute', top: -6, right: -8, background: 'var(--color-danger)', color: '#fff', borderRadius: '50%', width: 16, height: 16, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {notifications.length}
                </span>
              </span>
            )}
            <button onClick={loadData} style={btnGhost} title="Actualiser">
              <Activity size={14} /> Actualiser
            </button>
            <ThemeToggle />
          </>
        }
      >
        <div className="lp-metric-grid">
          <KpiCard label="Magasin MP" value={tachesParPoste.MAGASINIER_MP.length} hint={`${tachesParPoste.MAGASINIER_MP.filter((t) => t.statut === 'EN_COURS').length} actives`} icon={<Factory size={18} />} tone="brown" loading={loading} />
          <KpiCard label="Tissage" value={tachesParPoste.TISSEUR.length} hint={`${tachesParPoste.TISSEUR.filter((t) => t.statut === 'EN_COURS').length} actives`} icon={<Factory size={18} />} tone="terracotta" loading={loading} />
          <KpiCard label="Coupe" value={tachesParPoste.COUPEUR.length} hint={`${tachesParPoste.COUPEUR.filter((t) => t.statut === 'EN_COURS').length} actives`} icon={<Factory size={18} />} tone="gold" loading={loading} />
          <KpiCard label="Qualité" value={tachesParPoste.CONTROLEUR_QUALITE.length} hint={`${tachesParPoste.CONTROLEUR_QUALITE.filter((t) => t.statut === 'EN_COURS').length} actives`} icon={<CheckCircle size={18} />} tone="sage" loading={loading} />
        </div>

        <div className="lp-metric-grid">
          <KpiCard label="Opérateurs en ligne" value={operateurs.filter((o) => o.statut === 'online').length} hint={`sur ${operateurs.length} au total`} icon={<Users size={16} />} tone="indigo" loading={loading} />
          <KpiCard label="En pause" value={operateurs.filter((o) => o.statut === 'pause').length} icon={<AlertCircle size={16} />} tone="rose" loading={loading} />
          <KpiCard label="Tâches non assignées" value={taches.filter((t) => !t.assigne_a_nom).length} icon={<Clock size={16} />} tone="gold" loading={loading} />
          <KpiCard label="Notifications" value={notifications.length} icon={<Bell size={16} />} tone="indigo" loading={loading} />
        </div>

        <SectionCard
          title="Attribution des tâches"
          subtitle="Suivi et affectation aux opérateurs"
          icon={<Send size={16} />}
          actions={
            <button onClick={() => setShowMessageForm(!showMessageForm)} style={btnPrimary}>
              <Send size={12} /> Envoyer message
            </button>
          }
        >
          {showMessageForm && (
            <form onSubmit={handleEnvoyerMessage} style={{ marginBottom: 'var(--s-4)', padding: 'var(--s-4)', background: 'var(--bg-hover)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--s-3)' }}>
                <div>
                  <label style={labelStyle}>Poste destinataire</label>
                  <select value={messageData.destinataire_poste} onChange={(e) => setMessageData({ ...messageData, destinataire_poste: e.target.value, destinataire_id: '' })} style={inputStyle}>
                    <option value="">Sélectionner...</option>
                    <option value="MAGASINIER_MP">Magasinier MP</option>
                    <option value="TISSEUR">Tisseur</option>
                    <option value="COUPEUR">Coupeur</option>
                    <option value="CONTROLEUR_QUALITE">Contrôleur Qualité</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Sujet</label>
                  <input type="text" value={messageData.sujet} onChange={(e) => setMessageData({ ...messageData, sujet: e.target.value })} style={inputStyle} placeholder="Sujet du message" />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Message</label>
                  <textarea value={messageData.message} onChange={(e) => setMessageData({ ...messageData, message: e.target.value })} style={{ ...inputStyle, minHeight: 80 }} required />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 'var(--s-2)', marginTop: 'var(--s-3)' }}>
                <button type="submit" style={btnPrimary}>Envoyer</button>
                <button type="button" onClick={() => setShowMessageForm(false)} style={btnGhost}>Annuler</button>
              </div>
            </form>
          )}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
              <thead>
                <tr style={{ background: 'var(--bg-hover)' }}>
                  {['OF', 'Type', 'Assigné à', 'Statut', 'Priorité', 'Progression', 'Actions'].map((h) => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {taches.map((t) => (
                  <tr key={t.id_tache} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={tdStyle}><strong style={{ color: 'var(--fg-primary)' }}>{t.numero_of}</strong></td>
                    <td style={tdStyle}>{t.type_tache}</td>
                    <td style={tdStyle}>{t.assigne_a_nom ? `${t.assigne_a_nom} ${t.assigne_a_prenom || ''}`.trim() : <span style={{ color: 'var(--fg-muted)' }}>Non assigné</span>}</td>
                    <td style={tdStyle}>{statutBadge(t.statut)}</td>
                    <td style={tdStyle}>{prioriteBadge(t.priorite)}</td>
                    <td style={tdStyle}>
                      {t.quantite_demandee && t.quantite_realisee !== undefined ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 80, height: 6, background: 'var(--border-subtle)', borderRadius: 999 }}>
                            <div style={{ width: `${(t.quantite_realisee / t.quantite_demandee) * 100}%`, height: '100%', background: 'var(--accent-indigo)', borderRadius: 999 }} />
                          </div>
                          <span style={{ fontSize: 11, color: 'var(--fg-secondary)' }}>{t.quantite_realisee}/{t.quantite_demandee}</span>
                        </div>
                      ) : '-'}
                    </td>
                    <td style={tdStyle}>
                      {!t.assigne_a_nom && (
                        <select
                          onChange={(e) => e.target.value && handleAssigner(t.id_tache, parseInt(e.target.value))}
                          style={{ ...inputStyle, padding: '4px 8px', fontSize: 11 }}
                          defaultValue=""
                        >
                          <option value="">Assigner...</option>
                          {operateurs
                            .filter((op) => {
                              if (t.type_tache === 'TISSAGE') return op.poste_travail === 'TISSEUR';
                              if (t.type_tache === 'PREPARATION_MP') return op.poste_travail === 'MAGASINIER_MP';
                              if (t.type_tache === 'COUPE') return op.poste_travail === 'COUPEUR';
                              if (t.type_tache === 'CONTROLE_QUALITE') return op.poste_travail === 'CONTROLEUR_QUALITE';
                              return true;
                            })
                            .map((op) => (
                              <option key={op.id} value={op.id}>
                                {op.prenom} {op.nom} {op.machine_assignee ? `(${op.machine_assignee})` : ''}
                              </option>
                            ))}
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard title="Opérateurs" subtitle="Statut en temps réel" icon={<Users size={16} />}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
            {operateurs.map((op) => (
              <div key={op.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--s-3) var(--s-4)', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: op.statut === 'online' ? 'var(--color-success)' : op.statut === 'pause' ? 'var(--color-warning)' : 'var(--fg-muted)' }} />
                  <div>
                    <div style={{ fontWeight: 500, color: 'var(--fg-primary)' }}>
                      {op.prenom} {op.nom}
                      {op.machine_assignee && <span style={{ color: 'var(--fg-muted)', marginLeft: 6 }}>({op.machine_assignee})</span>}
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-secondary)' }}>
                      {op.poste_travail.replace('_', ' ')}
                      {op.tache_en_cours && ` — ${op.tache_en_cours} en cours`}
                    </div>
                  </div>
                </div>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-muted)' }}>
                  {op.statut === 'online' ? 'En ligne' : op.statut === 'pause' ? 'Pause' : 'Hors ligne'}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>
      </DashboardShell>
    </>
  );
};

const badgeBase: React.CSSProperties = { padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: 'var(--text-xs)', fontWeight: 600 };
const thStyle: React.CSSProperties = { textAlign: 'left', padding: 'var(--s-3) var(--s-4)', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--fg-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' };
const tdStyle: React.CSSProperties = { padding: 'var(--s-3) var(--s-4)', color: 'var(--fg-primary)' };
const labelStyle: React.CSSProperties = { display: 'block', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--fg-secondary)', marginBottom: 4 };
const inputStyle: React.CSSProperties = { width: '100%', padding: '8px 12px', background: 'var(--bg-elevated)', color: 'var(--fg-primary)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--text-sm)' };

const btnPrimary: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'var(--accent-indigo)', color: '#fff', border: '1px solid var(--accent-indigo)', borderRadius: 'var(--radius-full)', fontSize: 'var(--text-xs)', fontWeight: 600, cursor: 'pointer' };
const btnGhost: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'var(--bg-hover)', color: 'var(--fg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-full)', fontSize: 'var(--text-xs)', fontWeight: 600, cursor: 'pointer' };

export default ResponsableDashboard;
