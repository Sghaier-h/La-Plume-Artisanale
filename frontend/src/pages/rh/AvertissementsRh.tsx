/**
 * Avertissements RH (Phase H · §11bis + §14ter.17c)
 *
 * Vue agrégée des avertissements auto + manuels :
 *   - KPIs par niveau (info / attention / grave / sanction)
 *   - Filtres (statut, niveau, période, employé)
 *   - Tableau drill-down par ligne
 *   - Bouton "Lancer scan" (déclenche POST /scan)
 *
 * Accès : [ADMIN, RH_MANAGER].
 */
import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Play, RefreshCw, Filter } from 'lucide-react';
import {
  DashboardShell,
  KpiCard,
  SectionCard,
} from '../../components/dashboard';
import rhAvertissementsApi, {
  Avertissement,
  AvertissementKpiRow,
} from '../../services/rhAvertissementsApi';

const NIVEAU_COLOR: Record<Avertissement['niveau'], string> = {
  info:       'var(--accent-indigo)',
  attention:  'var(--accent-gold)',
  grave:      'var(--accent-terracotta)',
  sanction:   'var(--color-danger)',
};

const NIVEAU_TONE: Record<Avertissement['niveau'], 'indigo'|'gold'|'terracotta'|'rose'> = {
  info:       'indigo',
  attention:  'gold',
  grave:      'terracotta',
  sanction:   'rose',
};

const STATUT_LABEL: Record<Avertissement['statut'], string> = {
  nouveau:   'Nouveau',
  lu:        'Lu',
  contestee: 'Contesté',
  traitee:   'Traité',
  classee:   'Classé',
};

const TYPE_LABEL: Record<Avertissement['type'], string> = {
  retard_repete:        'Retards répétés',
  absence_non_just:     'Absence non justifiée',
  baisse_productivite:  'Baisse de productivité',
  refus_consigne:       'Refus de consigne',
  autre:                'Autre',
};

const AvertissementsRh: React.FC = () => {
  const [rows, setRows] = useState<Avertissement[]>([]);
  const [kpiRows, setKpiRows] = useState<AvertissementKpiRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [filters, setFilters] = useState<{
    statut?: Avertissement['statut'] | '';
    niveau?: Avertissement['niveau'] | '';
    type?: Avertissement['type']   | '';
  }>({ statut: '', niveau: '', type: '' });
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [list, kpi] = await Promise.all([
        rhAvertissementsApi.list({
          ...(filters.statut ? { statut: filters.statut } : {}),
          ...(filters.niveau ? { niveau: filters.niveau } : {}),
          ...(filters.type   ? { type:   filters.type }   : {}),
          limit: 300,
        }),
        rhAvertissementsApi.kpi(),
      ]);
      setRows(list);
      setKpiRows(kpi);
    } catch (e: any) {
      setError(e?.response?.data?.error?.message || 'Erreur chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const kpiByNiveau = useMemo(() => {
    const map: Record<string, AvertissementKpiRow> = {};
    for (const r of kpiRows) map[r.niveau] = r;
    return map;
  }, [kpiRows]);

  const runScan = async () => {
    setScanning(true);
    setError(null);
    try {
      const res = await rhAvertissementsApi.scan();
      await load();
      alert(`Scan terminé : ${res.created_count} avertissement(s) généré(s).`);
    } catch (e: any) {
      setError(e?.response?.data?.error?.message || 'Erreur scan');
    } finally {
      setScanning(false);
    }
  };

  return (
    <DashboardShell
      title="Avertissements du personnel"
      subtitle="§11bis + §14ter.17c — scanner auto · accusé de réception · contestation"
    >
      {/* KPIs par niveau */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 'var(--s-4)',
        marginBottom: 'var(--s-6)',
      }}>
        {(['info','attention','grave','sanction'] as const).map((niv) => {
          const k = kpiByNiveau[niv];
          return (
            <KpiCard
              key={niv}
              label={niv.toUpperCase()}
              value={k?.total ?? 0}
              hint={`${k?.non_lus ?? 0} non lu(s) · ${k?.contestes ?? 0} contesté(s)`}
              tone={NIVEAU_TONE[niv]}
              icon={<AlertTriangle />}
            />
          );
        })}
      </div>

      <SectionCard
        title="Filtres & actions"
        headerRight={
          <div style={{ display: 'flex', gap: 'var(--s-2)' }}>
            <button
              type="button"
              onClick={runScan}
              disabled={scanning}
              style={btnPrimary}
            >
              <Play size={14} />
              {scanning ? 'Scan en cours…' : 'Lancer scan maintenant'}
            </button>
            <button type="button" onClick={load} style={btnGhost}>
              <RefreshCw size={14} /> Rafraîchir
            </button>
          </div>
        }
      >
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--s-3)',
          marginBottom: 'var(--s-3)',
        }}>
          <label style={fld}>
            <span style={lbl}><Filter size={12} /> Statut</span>
            <select
              value={filters.statut || ''}
              onChange={(e) => setFilters((f) => ({ ...f, statut: e.target.value as any }))}
              style={inp}
            >
              <option value="">Tous</option>
              {Object.entries(STATUT_LABEL).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </label>
          <label style={fld}>
            <span style={lbl}><Filter size={12} /> Niveau</span>
            <select
              value={filters.niveau || ''}
              onChange={(e) => setFilters((f) => ({ ...f, niveau: e.target.value as any }))}
              style={inp}
            >
              <option value="">Tous</option>
              <option value="info">Info</option>
              <option value="attention">Attention</option>
              <option value="grave">Grave</option>
              <option value="sanction">Sanction</option>
            </select>
          </label>
          <label style={fld}>
            <span style={lbl}><Filter size={12} /> Type</span>
            <select
              value={filters.type || ''}
              onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value as any }))}
              style={inp}
            >
              <option value="">Tous</option>
              {Object.entries(TYPE_LABEL).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </label>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button type="button" onClick={load} style={{ ...btnPrimary, width: '100%' }}>
              Appliquer
            </button>
          </div>
        </div>
        {error && <div style={errMsg}>{error}</div>}
      </SectionCard>

      <SectionCard title={`Avertissements (${rows.length})`}>
        {loading ? (
          <div style={{ padding: 'var(--s-6)', textAlign: 'center', color: 'var(--fg-muted)' }}>
            Chargement…
          </div>
        ) : rows.length === 0 ? (
          <div style={{ padding: 'var(--s-6)', textAlign: 'center', color: 'var(--fg-muted)' }}>
            Aucun avertissement sur cette période.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={tableSty}>
              <thead>
                <tr>
                  <th style={th}>Date</th>
                  <th style={th}>Employé</th>
                  <th style={th}>Type</th>
                  <th style={th}>Niveau</th>
                  <th style={th}>Statut</th>
                  <th style={th}>Message</th>
                  <th style={th}>Auto</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id_avertissement} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={td}>
                      {new Date(r.date_envoi).toLocaleDateString('fr-FR')}
                    </td>
                    <td style={td}>
                      <strong>{r.matricule}</strong> · {r.prenom} {r.nom}
                    </td>
                    <td style={td}>{TYPE_LABEL[r.type]}</td>
                    <td style={{ ...td, color: NIVEAU_COLOR[r.niveau], fontWeight: 700 }}>
                      {r.niveau.toUpperCase()}
                    </td>
                    <td style={td}>{STATUT_LABEL[r.statut]}</td>
                    <td style={{ ...td, maxWidth: 320, whiteSpace: 'normal' }}>{r.message}</td>
                    <td style={td}>{r.auto_genere ? 'Oui' : 'Manuel'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </DashboardShell>
  );
};

const btnPrimary: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '8px 16px', background: 'var(--accent-terracotta)',
  color: '#FBF8F3', border: 'none', borderRadius: 999,
  fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 'var(--text-sm)',
  cursor: 'pointer',
};
const btnGhost: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '8px 14px', background: 'transparent',
  color: 'var(--fg-secondary)', border: '1px solid var(--border-subtle)',
  borderRadius: 999, fontFamily: 'var(--font-sans)',
  fontSize: 'var(--text-sm)', cursor: 'pointer',
};
const fld: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 4 };
const lbl: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 4,
  fontSize: 'var(--text-xs)', color: 'var(--fg-muted)',
  textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600,
};
const inp: React.CSSProperties = {
  padding: '8px 12px', background: 'var(--bg-canvas)',
  border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)',
  fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)',
  color: 'var(--fg-primary)',
};
const errMsg: React.CSSProperties = {
  padding: 'var(--s-3)', background: 'color-mix(in srgb, var(--color-danger) 10%, transparent)',
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
const td: React.CSSProperties = { padding: '10px', whiteSpace: 'nowrap' };

export default AvertissementsRh;
