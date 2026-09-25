import React, { useEffect, useMemo, useState } from 'react';
import { KanbanSquare } from 'lucide-react';
import { DashboardShell, SectionCard } from '../components/dashboard';
import { opportunitesApi, pickData } from '../services/crmApi';
import { fmtMoney } from '../utils/formatters';

interface Opp {
  id_opportunite: number;
  numero_opportunite: string;
  libelle: string;
  etape: string;
  statut: string;
  montant_estime: number | string;
  probabilite: number;
}

// Colonnes canoniques (contrat §8 · pipeline La Plume)
const STAGES: { key: string; label: string; tone: string; match: (o: Opp) => boolean }[] = [
  { key: 'NOUVEAU',       label: 'Nouveau',       tone: 'var(--accent-indigo)',
    match: (o) => o.etape === 'NOUVEAU' },
  { key: 'QUALIFICATION', label: 'Qualification', tone: 'var(--accent-indigo)',
    match: (o) => o.etape === 'QUALIFICATION' },
  { key: 'PROPOSITION',   label: 'Proposition',   tone: 'var(--accent-terracotta)',
    match: (o) => o.etape === 'PROPOSITION' },
  { key: 'NEGOCIATION',   label: 'Négociation',   tone: 'var(--accent-gold)',
    match: (o) => o.etape === 'NEGOCIATION' },
  { key: 'CLOTURE_GAGNEE', label: 'Gagné',        tone: 'var(--accent-sage)',
    match: (o) => o.statut === 'GAGNEE' || o.etape === 'CLOTURE_GAGNEE' },
  { key: 'CLOTURE_PERDUE', label: 'Perdu',        tone: 'var(--color-danger)',
    match: (o) => o.statut === 'PERDUE' || o.etape === 'CLOTURE_PERDUE' },
];

const PipelineVente: React.FC = () => {
  const [opps, setOpps] = useState<Opp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drag, setDrag] = useState<number | null>(null);

  const reload = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await opportunitesApi.list({ limit: 500 });
      setOpps(pickData<Opp>(res));
    } catch (e: any) {
      setError(e?.response?.data?.error?.message || e.message);
    } finally { setLoading(false); }
  };

  useEffect(() => { reload(); }, []);

  const buckets = useMemo(() => {
    return STAGES.map((s) => {
      const list = opps.filter(s.match);
      const total = list.reduce((sum, o) => sum + Number(o.montant_estime || 0), 0);
      return { ...s, list, total };
    });
  }, [opps]);

  const moveTo = async (id: number, targetStage: string) => {
    const patch: any = {};
    if (targetStage === 'CLOTURE_GAGNEE') { patch.etape = 'CLOTURE_GAGNEE'; patch.statut = 'GAGNEE'; patch.probabilite = 100; }
    else if (targetStage === 'CLOTURE_PERDUE') { patch.etape = 'CLOTURE_PERDUE'; patch.statut = 'PERDUE'; patch.probabilite = 0; }
    else { patch.etape = targetStage; patch.statut = 'ACTIVE'; }
    try {
      await opportunitesApi.update(id, patch);
      await reload();
    } catch (e: any) {
      alert(e?.response?.data?.error?.message || e.message);
    }
  };

  return (
    <DashboardShell
      eyebrow="§8 · Pipeline"
      title="Pipeline de vente"
      subtitle="Vue kanban · glissez une opportunité pour changer son étape."
    >
      <SectionCard title="Kanban commercial" subtitle={`${opps.length} opportunité(s)`}>
        {loading ? (
          <div style={{ padding: 'var(--s-8)', textAlign: 'center', color: 'var(--fg-muted)' }}>Chargement…</div>
        ) : error ? (
          <div style={{ padding: 'var(--s-4)', color: 'var(--color-danger)', background: 'var(--color-danger-bg)', borderRadius: 'var(--radius-sm)' }}>{error}</div>
        ) : (
          <div style={{ display: 'flex', gap: 'var(--s-3)', overflowX: 'auto', paddingBottom: 'var(--s-3)' }}>
            {buckets.map((b) => (
              <div
                key={b.key}
                onDragOver={(e) => { e.preventDefault(); }}
                onDrop={() => { if (drag != null) moveTo(drag, b.key); setDrag(null); }}
                style={{
                  flex: '0 0 260px',
                  background: 'var(--bg-canvas)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex', flexDirection: 'column',
                }}
              >
                <header style={{
                  padding: 'var(--s-3)',
                  borderBottom: '1px solid var(--border-subtle)',
                  background: 'var(--bg-elevated)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 600, color: b.tone }}>{b.label}</div>
                    <span style={{
                      fontSize: 'var(--text-xs)', padding: '2px 8px', borderRadius: 999,
                      background: `color-mix(in srgb, ${b.tone} 12%, transparent)`,
                      color: b.tone, fontWeight: 600,
                    }}>{b.list.length}</span>
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-muted)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>
                    {fmtMoney(b.total, 'TND')}
                  </div>
                </header>
                <div style={{ padding: 'var(--s-2)', maxHeight: '70vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
                  {b.list.length === 0 ? (
                    <div style={{ padding: 'var(--s-4)', textAlign: 'center', fontSize: 'var(--text-xs)', color: 'var(--fg-muted)' }}>Vide</div>
                  ) : b.list.map((o) => (
                    <div
                      key={o.id_opportunite}
                      draggable
                      onDragStart={() => setDrag(o.id_opportunite)}
                      style={{
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        padding: 'var(--s-3)',
                        cursor: 'grab',
                        boxShadow: 'var(--shadow-sm)',
                      }}
                    >
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-muted)', fontFamily: 'var(--font-mono)' }}>{o.numero_opportunite}</div>
                      <div style={{ fontWeight: 600, marginTop: 2, color: 'var(--fg-primary)' }}>{o.libelle}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 'var(--text-xs)' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-sage)', fontWeight: 600 }}>
                          {fmtMoney(o.montant_estime, 'TND')}
                        </span>
                        <span style={{ color: 'var(--fg-muted)' }}>{o.probabilite}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </DashboardShell>
  );
};

export default PipelineVente;
