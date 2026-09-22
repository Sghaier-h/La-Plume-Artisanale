import React, { useEffect, useState, useCallback } from 'react';
import { Truck, AlertTriangle, PlusCircle, CheckCircle, Clock, X, ArrowUpRight } from 'lucide-react';
import { DashboardShell, KpiCard, SectionCard, ThemeToggle } from '../components/dashboard';
import api from '../services/api';
import { connectSocket } from '../services/socket';

const asArray = (x: any): any[] =>
  Array.isArray(x) ? x : (x?.data || x?.items || x?.mouvements || []);

const fmtInt = (v: any) => {
  const n = Number(v ?? 0);
  return isNaN(n) ? '0' : n.toLocaleString('fr-FR');
};

const Soustraitants: React.FC = () => {
  const [mouvements, setMouvements] = useState<any[]>([]);
  const [soustraitants, setSoustraitants] = useState<any[]>([]);
  const [alertes, setAlertes] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [ofs, setOfs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSortie, setShowSortie] = useState(false);
  const [showRetour, setShowRetour] = useState<any | null>(null);
  const [sortieForm, setSortieForm] = useState<any>({
    id_sous_traitant: '', id_of: '', date_retour_prevue: '', details: [{ id_lot_coupe: '', quantite_envoyee: '' }],
  });
  const [retourForm, setRetourForm] = useState<any>({ lots: [] });

  const loadAll = useCallback(async () => {
    try {
      const [st, mv, al, sg, ofRes] = await Promise.all([
        api.get('/soustraitants').catch(() => ({ data: [] })),
        api.get('/soustraitants').catch(() => ({ data: [] })),
        api.get('/soustraitants/alertes/retard').catch(() => ({ data: [] })),
        api.get('/soustraitants/stats/global').catch(() => ({ data: {} })),
        api.get('/of').catch(() => ({ data: [] })),
      ]);
      setSoustraitants(asArray(st.data));
      // mv is same endpoint; refetch mouvements from first soustraitant list — treat records as mouvements too
      setMouvements(asArray(mv.data));
      setAlertes(asArray(al.data));
      setStats(sg.data?.data || sg.data || {});
      setOfs(asArray(ofRes.data));
    } catch (e) { console.error('Erreur chargement soustraitants:', e); }
  }, []);

  useEffect(() => {
    (async () => { setLoading(true); await loadAll(); setLoading(false); })();
  }, [loadAll]);

  useEffect(() => {
    const socket = connectSocket();
    const refresh = () => loadAll();
    socket.on('soustraitants:new', refresh);
    socket.on('soustraitants:retour', refresh);
    return () => {
      socket.off('soustraitants:new', refresh);
      socket.off('soustraitants:retour', refresh);
    };
  }, [loadAll]);

  const submitSortie = async () => {
    try {
      const { id_sous_traitant, id_of, date_retour_prevue, details } = sortieForm;
      await api.post(`/soustraitants/${id_sous_traitant}/sortie`, { id_of, date_retour_prevue, details });
      setShowSortie(false);
      setSortieForm({ id_sous_traitant: '', id_of: '', date_retour_prevue: '', details: [{ id_lot_coupe: '', quantite_envoyee: '' }] });
      await loadAll();
    } catch (e: any) {
      alert(`Erreur sortie: ${e?.response?.data?.error || e?.message}`);
    }
  };

  const openRetour = (mvt: any) => {
    setShowRetour(mvt);
    setRetourForm({
      lots: (mvt.details || mvt.lots || []).map((l: any) => ({
        id_lot_coupe: l.id_lot_coupe,
        libelle: l.libelle || `Lot #${l.id_lot_coupe}`,
        quantite_envoyee: l.quantite_envoyee,
        quantite_retournee: l.quantite_envoyee,
        quantite_conforme: l.quantite_envoyee,
        quantite_non_conforme: 0,
      })),
    });
  };

  const submitRetour = async () => {
    try {
      await api.put(`/soustraitants/${showRetour.id_mouvement || showRetour.id}/retour`, { lots: retourForm.lots });
      setShowRetour(null);
      await loadAll();
    } catch (e: any) {
      alert(`Erreur retour: ${e?.response?.data?.error || e?.message}`);
    }
  };

  const annulerMvt = async (id: number) => {
    if (!window.confirm('Annuler ce mouvement ?')) return;
    try {
      await api.put(`/soustraitants/${id}/annuler`);
      await loadAll();
    } catch (e: any) { alert(`Erreur: ${e?.response?.data?.error || e?.message}`); }
  };

  return (
    <>
      <DashboardShell
        eyebrow="Gestion sous-traitants"
        title="Gestion sous-traitants"
        subtitle="Suivi des mouvements, sorties et retours."
        headerRight={
          <>
            <button onClick={() => setShowSortie(true)} style={btnPrimary}>
              <PlusCircle size={14} /> Nouvelle sortie
            </button>
            <ThemeToggle />
          </>
        }
      >
        {alertes.length > 0 && (
          <div style={{
            background: 'color-mix(in srgb, var(--accent-terracotta) 15%, transparent)',
            border: '1px solid var(--accent-terracotta)',
            color: 'var(--accent-terracotta)',
            padding: 'var(--s-3) var(--s-4)',
            borderRadius: 'var(--radius-md)',
            display: 'flex', alignItems: 'center', gap: 'var(--s-3)',
            fontWeight: 600, fontSize: 'var(--text-sm)',
          }}>
            <AlertTriangle size={18} />
            {alertes.length} mouvement(s) en retard de retour
          </div>
        )}

        <div className="lp-metric-grid">
          <KpiCard label="Actifs" value={fmtInt(stats?.actifs ?? soustraitants.length)} icon={<Truck size={18} />} tone="terracotta" loading={loading} />
          <KpiCard label="En cours" value={fmtInt(stats?.en_cours)} icon={<Clock size={18} />} tone="gold" loading={loading} />
          <KpiCard label="Retournés" value={fmtInt(stats?.retournes ?? stats?.termines)} icon={<CheckCircle size={18} />} tone="sage" loading={loading} />
          <KpiCard label="En retard" value={fmtInt(stats?.en_retard ?? alertes.length)} icon={<AlertTriangle size={18} />} tone="indigo" loading={loading} />
        </div>

        <SectionCard title="Mouvements en cours" icon={<ArrowUpRight size={16} />} subtitle={`${mouvements.length} mouvement(s)`}>
          <div style={{ overflowX: 'auto' }}>
            <table style={tableStyle}>
              <thead>
                <tr>{['Numéro', 'Sous-traitant', 'OF', 'Type', 'Date sortie', 'Retour prévu', 'Statut', 'Actions'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {mouvements.length === 0 && <tr><td colSpan={8} style={{ padding: 'var(--s-5)', textAlign: 'center', color: 'var(--fg-muted)' }}>Aucun mouvement</td></tr>}
                {mouvements.map(mv => (
                  <tr key={mv.id_mouvement || mv.id} style={{ borderTop: '1px solid var(--border-subtle)' }}>
                    <td style={tdStyle}>{mv.numero || `#${mv.id_mouvement || mv.id}`}</td>
                    <td style={tdStyle}>{mv.raison_sociale || mv.sous_traitant_nom || mv.id_sous_traitant}</td>
                    <td style={tdStyle}>{mv.numero_of || mv.id_of || '—'}</td>
                    <td style={tdStyle}>{mv.type_mouvement || 'SORTIE'}</td>
                    <td style={tdStyle}>{mv.date_sortie || mv.created_at}</td>
                    <td style={tdStyle}>{mv.date_retour_prevue || '—'}</td>
                    <td style={tdStyle}><span style={badgeStyle(mv.statut)}>{mv.statut}</span></td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {mv.statut !== 'RETOURNE' && mv.statut !== 'ANNULE' && (
                          <>
                            <button style={btnGhostSm} onClick={() => openRetour(mv)}>Retour</button>
                            <button style={btnGhostSm} onClick={() => annulerMvt(mv.id_mouvement || mv.id)}>Annuler</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        {/* Sortie modal */}
        {showSortie && (
          <div style={modalOverlay} onClick={() => setShowSortie(false)}>
            <div style={modalBox} onClick={(e) => e.stopPropagation()}>
              <div style={modalHeader}>
                <h3 style={{ margin: 0, fontFamily: 'var(--font-serif)' }}>Nouvelle sortie</h3>
                <button style={btnGhostSm} onClick={() => setShowSortie(false)}><X size={14} /></button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-3)' }}>
                <select style={inputStyle} value={sortieForm.id_sous_traitant} onChange={(e) => setSortieForm({ ...sortieForm, id_sous_traitant: e.target.value })}>
                  <option value="">Sous-traitant…</option>
                  {soustraitants.map(s => <option key={s.id_sous_traitant || s.id} value={s.id_sous_traitant || s.id}>{s.raison_sociale || s.code_sous_traitant}</option>)}
                </select>
                <select style={inputStyle} value={sortieForm.id_of} onChange={(e) => setSortieForm({ ...sortieForm, id_of: e.target.value })}>
                  <option value="">OF…</option>
                  {ofs.map(o => <option key={o.id_of || o.id} value={o.id_of || o.id}>{o.numero_of || `OF#${o.id_of || o.id}`}</option>)}
                </select>
                <input type="date" style={inputStyle} value={sortieForm.date_retour_prevue} onChange={(e) => setSortieForm({ ...sortieForm, date_retour_prevue: e.target.value })} />
                {sortieForm.details.map((d: any, i: number) => (
                  <div key={i} style={{ display: 'flex', gap: 'var(--s-2)' }}>
                    <input placeholder="ID lot coupe" style={{ ...inputStyle, flex: 1 }} value={d.id_lot_coupe}
                      onChange={(e) => {
                        const details = [...sortieForm.details]; details[i].id_lot_coupe = e.target.value; setSortieForm({ ...sortieForm, details });
                      }} />
                    <input placeholder="Quantité" type="number" style={{ ...inputStyle, width: 120 }} value={d.quantite_envoyee}
                      onChange={(e) => {
                        const details = [...sortieForm.details]; details[i].quantite_envoyee = e.target.value; setSortieForm({ ...sortieForm, details });
                      }} />
                  </div>
                ))}
                <button style={btnGhostSm} onClick={() => setSortieForm({ ...sortieForm, details: [...sortieForm.details, { id_lot_coupe: '', quantite_envoyee: '' }] })}>+ Ajouter un lot</button>
                <div style={{ display: 'flex', gap: 'var(--s-2)', justifyContent: 'flex-end' }}>
                  <button style={btnGhostSm} onClick={() => setShowSortie(false)}>Annuler</button>
                  <button style={btnPrimary} onClick={submitSortie}>Créer</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Retour modal */}
        {showRetour && (
          <div style={modalOverlay} onClick={() => setShowRetour(null)}>
            <div style={{ ...modalBox, width: 'min(720px, 92vw)' }} onClick={(e) => e.stopPropagation()}>
              <div style={modalHeader}>
                <h3 style={{ margin: 0, fontFamily: 'var(--font-serif)' }}>Enregistrer retour</h3>
                <button style={btnGhostSm} onClick={() => setShowRetour(null)}><X size={14} /></button>
              </div>
              <table style={tableStyle}>
                <thead><tr>{['Lot', 'Envoyé', 'Retourné', 'Conforme', 'Non conforme'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
                <tbody>
                  {retourForm.lots.map((l: any, i: number) => (
                    <tr key={i} style={{ borderTop: '1px solid var(--border-subtle)' }}>
                      <td style={tdStyle}>{l.libelle}</td>
                      <td style={tdStyle}>{l.quantite_envoyee}</td>
                      <td style={tdStyle}><input type="number" style={{ ...inputStyle, width: 80 }} value={l.quantite_retournee}
                        onChange={(e) => { const lots = [...retourForm.lots]; lots[i].quantite_retournee = Number(e.target.value); setRetourForm({ lots }); }} /></td>
                      <td style={tdStyle}><input type="number" style={{ ...inputStyle, width: 80 }} value={l.quantite_conforme}
                        onChange={(e) => { const lots = [...retourForm.lots]; lots[i].quantite_conforme = Number(e.target.value); setRetourForm({ lots }); }} /></td>
                      <td style={tdStyle}><input type="number" style={{ ...inputStyle, width: 80 }} value={l.quantite_non_conforme}
                        onChange={(e) => { const lots = [...retourForm.lots]; lots[i].quantite_non_conforme = Number(e.target.value); setRetourForm({ lots }); }} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ display: 'flex', gap: 'var(--s-2)', justifyContent: 'flex-end', marginTop: 'var(--s-4)' }}>
                <button style={btnGhostSm} onClick={() => setShowRetour(null)}>Annuler</button>
                <button style={btnPrimary} onClick={submitRetour}>Enregistrer</button>
              </div>
            </div>
          </div>
        )}
      </DashboardShell>
    </>
  );
};

const btnPrimary: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'var(--accent-terracotta)', color: '#fff', border: '1px solid var(--accent-terracotta)', borderRadius: 'var(--radius-full)', fontSize: 'var(--text-xs)', fontWeight: 600, cursor: 'pointer' };
const btnGhostSm: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', background: 'var(--bg-hover)', color: 'var(--fg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-full)', fontSize: '11px', fontWeight: 500, cursor: 'pointer' };
const inputStyle: React.CSSProperties = { padding: '8px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--fg-primary)', fontSize: 'var(--text-sm)' };
const tableStyle: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' };
const thStyle: React.CSSProperties = { textAlign: 'left', padding: 'var(--s-3)', fontSize: 'var(--text-xs)', color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 };
const tdStyle: React.CSSProperties = { padding: 'var(--s-3)', color: 'var(--fg-primary)' };
const modalOverlay: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
const modalBox: React.CSSProperties = { background: 'var(--bg-elevated)', padding: 'var(--s-5)', borderRadius: 'var(--radius-md)', width: 'min(520px, 92vw)', border: '1px solid var(--border-default)', maxHeight: '90vh', overflowY: 'auto' };
const modalHeader: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--s-4)' };
const badgeStyle = (v: string): React.CSSProperties => {
  const map: Record<string, string> = {
    SORTIE: 'var(--accent-gold)', EN_COURS: 'var(--accent-terracotta)', RETOURNE: 'var(--accent-sage)',
    EN_RETARD: 'var(--accent-terracotta)', ANNULE: 'var(--fg-muted)',
  };
  const c = map[v] || 'var(--fg-muted)';
  return { padding: '2px 8px', borderRadius: 'var(--radius-full)', background: `${c}22`, color: c, fontSize: '11px', fontWeight: 600 };
};

export default Soustraitants;
