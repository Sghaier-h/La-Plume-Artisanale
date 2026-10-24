/**
 * CandidaturesTablette (Phase H · §11bis.recrutement — admin)
 *
 * Liste des candidatures arrivées par la tablette publique accueil :
 *   - KPIs (nombre total, scoring moyen, derniers 7 j)
 *   - Tableau liste + drill-down détail
 *   - Action "Convertir en entretien" (crée entretien lié à la candidature)
 *
 * Accès : [ADMIN, RH_MANAGER].
 */
import React, { useEffect, useMemo, useState } from 'react';
import { UserPlus, Eye, UserCheck, RefreshCw } from 'lucide-react';
import {
  DashboardShell, KpiCard, SectionCard,
} from '../../components/dashboard';
import api from '../../services/api';
import rhRecrutementCandidatApi, {
  CandidatureTabletteSummary,
} from '../../services/rhRecrutementCandidatApi';

const CandidaturesTablette: React.FC = () => {
  const [rows, setRows] = useState<CandidatureTabletteSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<CandidatureTabletteSummary | null>(null);
  const [detail, setDetail] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const list = await rhRecrutementCandidatApi.listCandidatures({ limit: 200 });
      setRows(list);
    } catch (e: any) {
      setError(e?.response?.data?.error?.message || 'Erreur chargement');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const openDetail = async (c: CandidatureTabletteSummary) => {
    setSelected(c);
    try {
      const d = await rhRecrutementCandidatApi.getCandidatureDetail(c.id_candidature);
      setDetail(d);
    } catch {
      setDetail(null);
    }
  };

  const convertirEntretien = async (c: CandidatureTabletteSummary) => {
    const date = window.prompt(
      'Date et heure de l’entretien (YYYY-MM-DD HH:MM) :',
      new Date().toISOString().slice(0, 16).replace('T', ' '),
    );
    if (!date) return;
    try {
      await api.post('/v2/rh/candidatures/entretiens', {
        id_candidature: c.id_candidature,
        type_entretien: 'presentiel',
        date_entretien: new Date(date).toISOString(),
        duree_min: 60,
      }).catch(async (e) => {
        // Fallback : certains environnements exposent la route sous un autre segment
        if (e?.response?.status === 404) {
          await api.post('/v2/rh/entretiens', {
            id_candidature: c.id_candidature,
            type_entretien: 'presentiel',
            date_entretien: new Date(date).toISOString(),
            duree_min: 60,
          });
        } else {
          throw e;
        }
      });
      alert('Entretien créé.');
      load();
    } catch (e: any) {
      alert(e?.response?.data?.error?.message || 'Erreur création entretien');
    }
  };

  const stats = useMemo(() => {
    const total = rows.length;
    const score = rows.length
      ? rows.reduce((a, r) => a + Number(r.score_tablette || r.score_matching || 0), 0) / rows.length
      : 0;
    const now = Date.now();
    const last7 = rows.filter((r) => (now - new Date(r.created_at).getTime()) < 7 * 86400000).length;
    const enAttente = rows.filter((r) => r.statut === 'reçue').length;
    return { total, score: Math.round(score * 10) / 10, last7, enAttente };
  }, [rows]);

  return (
    <DashboardShell
      title="Candidatures tablette"
      subtitle="§11bis — recrutement candidat tablette publique"
    >
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 'var(--s-4)',
        marginBottom: 'var(--s-6)',
      }}>
        <KpiCard label="TOTAL" value={stats.total} tone="terracotta" icon={<UserPlus />} />
        <KpiCard label="SCORE MOYEN" value={stats.score} tone="gold" />
        <KpiCard label="7 DERNIERS JOURS" value={stats.last7} tone="indigo" />
        <KpiCard label="EN ATTENTE" value={stats.enAttente} tone="sage" />
      </div>

      {error && (
        <div style={errMsg}>{error}</div>
      )}

      <SectionCard
        title={`Candidatures (${rows.length})`}
        headerRight={
          <button type="button" onClick={load} style={btnGhost}>
            <RefreshCw size={14} /> Rafraîchir
          </button>
        }
      >
        {loading ? (
          <div style={{ padding: 'var(--s-6)', textAlign: 'center', color: 'var(--fg-muted)' }}>Chargement…</div>
        ) : rows.length === 0 ? (
          <div style={{ padding: 'var(--s-6)', textAlign: 'center', color: 'var(--fg-muted)' }}>
            Aucune candidature pour l’instant.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={tableSty}>
              <thead>
                <tr>
                  <th style={th}>Date</th>
                  <th style={th}>Candidat</th>
                  <th style={th}>Poste</th>
                  <th style={th}>Score</th>
                  <th style={th}>Statut</th>
                  <th style={th}>Durée</th>
                  <th style={th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id_candidature} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={td}>{new Date(r.created_at).toLocaleDateString('fr-FR')}</td>
                    <td style={td}><strong>{r.prenom} {r.nom}</strong><br/>
                      <span style={{ color: 'var(--fg-muted)', fontSize: 'var(--text-xs)' }}>
                        {r.email || '—'} · {r.telephone || '—'}
                      </span>
                    </td>
                    <td style={td}>{r.poste_cible_tablette || '—'}</td>
                    <td style={{ ...td, fontWeight: 700 }}>
                      {Number(r.score_tablette || r.score_matching || 0).toFixed(1)}
                    </td>
                    <td style={td}>{r.statut}</td>
                    <td style={td}>{r.duree_minutes || '—'} min</td>
                    <td style={td}>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <button type="button" onClick={() => openDetail(r)} style={btnSmall}>
                          <Eye size={12} /> Détail
                        </button>
                        <button type="button" onClick={() => convertirEntretien(r)} style={btnSmallPri}>
                          <UserCheck size={12} /> Entretien
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {selected && detail && (
        <div style={modalOverlay} onClick={() => { setSelected(null); setDetail(null); }}>
          <div style={modalSty} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', marginTop: 0 }}>
              {detail.prenom} {detail.nom} — {detail.poste_cible_tablette || detail.poste_cible}
            </h3>
            <div style={{ display: 'grid', gap: 12 }}>
              <section>
                <h4 style={h4}>Identité</h4>
                <pre style={pre}>{JSON.stringify(detail.identite_json, null, 2)}</pre>
              </section>
              <section>
                <h4 style={h4}>Parcours</h4>
                <pre style={pre}>{JSON.stringify(detail.parcours_json, null, 2)}</pre>
              </section>
              <section>
                <h4 style={h4}>Réponses questionnaire</h4>
                <pre style={pre}>{JSON.stringify(detail.reponses_json, null, 2)}</pre>
              </section>
              <section>
                <h4 style={h4}>Test logique</h4>
                <pre style={pre}>{JSON.stringify(detail.test_logique_json, null, 2)}</pre>
              </section>
              <div>
                <strong>Attentes salariales :</strong>{' '}
                {detail.attentes_salariales ? `${detail.attentes_salariales} TND` : '—'}
              </div>
              <div>
                <strong>Score total :</strong> {Number(detail.score_total || 0).toFixed(2)}
              </div>
              {detail.signature_svg && (
                <section>
                  <h4 style={h4}>Signature</h4>
                  <div dangerouslySetInnerHTML={{ __html: detail.signature_svg }} />
                </section>
              )}
            </div>
            <button type="button" onClick={() => { setSelected(null); setDetail(null); }} style={{ ...btnGhost, marginTop: 16 }}>
              Fermer
            </button>
          </div>
        </div>
      )}
    </DashboardShell>
  );
};

const btnGhost: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '8px 14px', background: 'transparent',
  color: 'var(--fg-secondary)', border: '1px solid var(--border-subtle)',
  borderRadius: 999, fontFamily: 'var(--font-sans)',
  fontSize: 'var(--text-sm)', cursor: 'pointer',
};
const btnSmall: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 4,
  padding: '4px 10px', background: 'transparent',
  color: 'var(--fg-secondary)', border: '1px solid var(--border-subtle)',
  borderRadius: 999, fontFamily: 'var(--font-sans)',
  fontSize: 'var(--text-xs)', cursor: 'pointer',
};
const btnSmallPri: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 4,
  padding: '4px 10px', background: 'var(--accent-terracotta)',
  color: '#FBF8F3', border: 'none', borderRadius: 999,
  fontFamily: 'var(--font-sans)', fontWeight: 600,
  fontSize: 'var(--text-xs)', cursor: 'pointer',
};
const errMsg: React.CSSProperties = {
  padding: 'var(--s-3)', marginBottom: 'var(--s-4)',
  background: 'color-mix(in srgb, var(--color-danger) 10%, transparent)',
  color: 'var(--color-danger)', borderRadius: 'var(--radius-sm)',
  fontSize: 'var(--text-sm)',
};
const tableSty: React.CSSProperties = {
  width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)',
};
const th: React.CSSProperties = {
  textAlign: 'left', padding: '8px 10px',
  borderBottom: '2px solid var(--border-strong)',
  fontSize: 'var(--text-xs)', textTransform: 'uppercase',
  letterSpacing: '0.05em', color: 'var(--fg-muted)',
};
const td: React.CSSProperties = { padding: '10px', verticalAlign: 'top' };
const modalOverlay: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 1000, padding: 20,
};
const modalSty: React.CSSProperties = {
  background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)',
  padding: 'var(--s-5)', maxWidth: 700, width: '100%', maxHeight: '85vh',
  overflow: 'auto', border: '1px solid var(--border-subtle)',
};
const h4: React.CSSProperties = { margin: '8px 0 4px', fontSize: 'var(--text-sm)', color: 'var(--fg-muted)',
                                  textTransform: 'uppercase', letterSpacing: '0.05em' };
const pre: React.CSSProperties = { background: 'var(--bg-canvas)', padding: 10,
                                   borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-mono)',
                                   fontSize: 'var(--text-xs)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' };

export default CandidaturesTablette;
