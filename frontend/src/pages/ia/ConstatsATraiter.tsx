import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  Info,
  CheckCircle2,
  XCircle,
  Eye,
  Code2,
  Filter,
} from 'lucide-react';
import KpiCard from '../../components/ecommerce/KpiCard';
import api from '../../services/api';

// ═══════════════════════════════════════════════════════════════════
// §14bis.6bis — Constats à traiter (findings agents IA)
// Backend : agents_ia_findings, workflow validation SQL correction
// ═══════════════════════════════════════════════════════════════════

type Severite = 'danger' | 'warning' | 'info';
type StatutFinding = 'nouveau' | 'en_revue' | 'valide' | 'rejete';

interface Finding {
  id_finding: number;
  id_agent: number;
  agent_source: string;
  agent_domaine: string;
  severite: Severite;
  titre: string;
  description: string;
  detecte_le: string;
  sql_correction_proposee: string | null;
  impact_estime: string;
  statut: StatutFinding;
  reviewer_nom: string | null;
}

const MOCK_FINDINGS: Finding[] = [
  {
    id_finding: 501,
    id_agent: 1,
    agent_source: 'Sentinelle Stock',
    agent_domaine: 'Stock',
    severite: 'danger',
    titre: 'MP Coton peigné 30/1 en rupture prévue J+3',
    description: 'Stock actuel 145 kg — conso quotidienne moy. 62 kg — épuisement prévu 28/09.',
    detecte_le: new Date(Date.now() - 3600_000 * 2).toISOString(),
    sql_correction_proposee: `INSERT INTO commandes_achat_urgent (id_mp, quantite_kg, motif)\nVALUES (215, 500, 'Rupture imminente J+3 détectée par IA');`,
    impact_estime: '~4 OF bloqués, 12k DT retard livraison',
    statut: 'nouveau',
    reviewer_nom: null,
  },
  {
    id_finding: 502,
    id_agent: 2,
    agent_source: 'Suivi Production',
    agent_domaine: 'Fabrication',
    severite: 'warning',
    titre: 'OF #4521 en retard — 3j après date échéance',
    description: 'OF Fouta Sfax lot 4521 : 60% avancement, date fin prévue dépassée.',
    detecte_le: new Date(Date.now() - 3600_000 * 5).toISOString(),
    sql_correction_proposee: `UPDATE ordres_fabrication SET priorite='urgente', alerte_client=1 WHERE id_of=4521;`,
    impact_estime: '1 client B2B en attente, risque pénalité 800 DT',
    statut: 'en_revue',
    reviewer_nom: 'Fatma Ben Salah',
  },
  {
    id_finding: 503,
    id_agent: 3,
    agent_source: 'Contrôle Qualité',
    agent_domaine: 'Qualité',
    severite: 'warning',
    titre: 'Taux défauts machine T-08 anormal (+340%)',
    description: 'Machine Picanol T-08 : 12 défauts sur 3 lots vs baseline 2.5 défauts.',
    detecte_le: new Date(Date.now() - 3600_000 * 8).toISOString(),
    sql_correction_proposee: `INSERT INTO ordres_maintenance (id_machine, type, priorite) VALUES (8, 'inspection_urgente', 'p1');`,
    impact_estime: 'Perte estimée 3-5 lots si non corrigé',
    statut: 'nouveau',
    reviewer_nom: null,
  },
  {
    id_finding: 504,
    id_agent: 4,
    agent_source: 'Vigilance Finance',
    agent_domaine: 'Finance',
    severite: 'danger',
    titre: 'Facture #2024-1120 échue 62j — client MAROC EXPORT',
    description: 'Montant 8 450 DT, dernière relance J-15, aucun paiement partiel.',
    detecte_le: new Date(Date.now() - 3600_000 * 12).toISOString(),
    sql_correction_proposee: `UPDATE factures_client SET statut='litige', date_mise_contentieux=NOW() WHERE id_facture=1120;`,
    impact_estime: 'Créance douteuse — provision comptable requise',
    statut: 'nouveau',
    reviewer_nom: null,
  },
  {
    id_finding: 505,
    id_agent: 5,
    agent_source: 'Radar Commercial',
    agent_domaine: 'CRM',
    severite: 'info',
    titre: '8 leads inactifs > 30j — pipeline à réactiver',
    description: 'Leads qualifiés sans interaction récente, valeur potentielle 45k DT.',
    detecte_le: new Date(Date.now() - 3600_000 * 20).toISOString(),
    sql_correction_proposee: `UPDATE leads SET flag_reactivation=1 WHERE derniere_interaction < NOW() - INTERVAL 30 DAY AND statut='qualifie';`,
    impact_estime: 'Opportunité 45k DT si 20% conversion',
    statut: 'en_revue',
    reviewer_nom: 'Ahmed Karray',
  },
  {
    id_finding: 506,
    id_agent: 4,
    agent_source: 'Vigilance Finance',
    agent_domaine: 'Finance',
    severite: 'warning',
    titre: 'Écart caisse siège : -12 DT (comptage soir)',
    description: 'Solde théorique 2400 DT, comptage physique 2388 DT.',
    detecte_le: new Date(Date.now() - 86400_000).toISOString(),
    sql_correction_proposee: `INSERT INTO mouvements_caisse (id_caisse, type_mouvement, montant, motif) VALUES (1, 'ajustement_-', 12, 'Écart comptage IA détecté');`,
    impact_estime: 'Faible — dans tolérance',
    statut: 'valide',
    reviewer_nom: 'Fatma Ben Salah',
  },
  {
    id_finding: 507,
    id_agent: 1,
    agent_source: 'Sentinelle Stock',
    agent_domaine: 'Stock',
    severite: 'info',
    titre: 'Sur-stock PF Fouta Beige 100x180 (+180%)',
    description: '340 unités en stock, rotation < 5 uni/mois.',
    detecte_le: new Date(Date.now() - 86400_000 * 2).toISOString(),
    sql_correction_proposee: null,
    impact_estime: 'Immobilisation 8 500 DT — envisager promo B2B',
    statut: 'rejete',
    reviewer_nom: 'Hedi Sghaier',
  },
];

const SEV_CFG: Record<Severite, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  danger: { label: 'Critique', color: '#B84A4A', bg: '#FBECEC', icon: <AlertOctagon className="w-3 h-3" /> },
  warning: { label: 'Attention', color: '#8A6412', bg: '#FBF3E0', icon: <AlertTriangle className="w-3 h-3" /> },
  info: { label: 'Info', color: '#3B4E68', bg: '#EDF0F5', icon: <Info className="w-3 h-3" /> },
};

const STATUT_CFG: Record<StatutFinding, { label: string; color: string; bg: string }> = {
  nouveau: { label: 'Nouveau', color: '#C8663D', bg: '#FDF2ED' },
  en_revue: { label: 'En revue', color: '#8A6412', bg: '#FBF3E0' },
  valide: { label: 'Validé', color: '#4A6C5B', bg: '#EEF4F0' },
  rejete: { label: 'Rejeté', color: '#8A6E4A', bg: '#F0E7D4' },
};

const ConstatsATraiter: React.FC = () => {
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSev, setFilterSev] = useState<Severite | 'all'>('all');
  const [filterStatut, setFilterStatut] = useState<StatutFinding | 'all'>('all');
  const [selected, setSelected] = useState<Finding | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const r = await Promise.allSettled([api.get('/api/v2/ia-agents/findings')]);
      if (cancelled) return;
      const pickArray = (res: PromiseSettledResult<any>): Finding[] => {
        if (res.status !== 'fulfilled') return MOCK_FINDINGS;
        const d = res.value?.data?.data ?? res.value?.data;
        if (Array.isArray(d)) return d;
        if (d && Array.isArray(d.findings)) return d.findings;
        return MOCK_FINDINGS;
      };
      setFindings(pickArray(r[0]));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    return findings.filter(
      (f) =>
        (filterSev === 'all' || f.severite === filterSev) &&
        (filterStatut === 'all' || f.statut === filterStatut)
    );
  }, [findings, filterSev, filterStatut]);

  const kpis = useMemo(() => {
    return {
      total: findings.length,
      critiques: findings.filter((f) => f.severite === 'danger' && f.statut !== 'rejete').length,
      nouveaux: findings.filter((f) => f.statut === 'nouveau').length,
      valides: findings.filter((f) => f.statut === 'valide').length,
    };
  }, [findings]);

  const valider = (id: number) => {
    setFindings((prev) =>
      prev.map((f) => (f.id_finding === id ? { ...f, statut: 'valide', reviewer_nom: 'Vous' } : f))
    );
    setSelected(null);
  };

  const rejeter = (id: number) => {
    setFindings((prev) =>
      prev.map((f) => (f.id_finding === id ? { ...f, statut: 'rejete', reviewer_nom: 'Vous' } : f))
    );
    setSelected(null);
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C8663D]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-app, #FBF8F3)' }}>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div
              className="text-xs uppercase tracking-widest font-mono mb-2"
              style={{ color: 'var(--fg-muted, #8A6E4A)' }}
            >
              §14bis.6bis · Intelligence Artificielle
            </div>
            <h1
              className="text-3xl italic mb-1"
              style={{
                fontFamily: 'var(--font-serif, Fraunces, serif)',
                fontWeight: 500,
                color: 'var(--fg-primary, #2F2A26)',
              }}
            >
              Constats à traiter
            </h1>
            <p className="text-sm" style={{ color: 'var(--fg-secondary, #5D4E42)' }}>
              Findings détectés par les agents IA — validation SQL avant application
            </p>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <KpiCard label="Total findings" value={kpis.total} color="indigo" icon={<Info className="w-5 h-5" />} />
            <KpiCard label="Critiques ouverts" value={kpis.critiques} color={kpis.critiques > 0 ? 'warning' : 'sage'} icon={<AlertOctagon className="w-5 h-5" />} />
            <KpiCard label="Nouveaux" value={kpis.nouveaux} color="terracotta" icon={<AlertTriangle className="w-5 h-5" />} />
            <KpiCard label="Validés" value={kpis.valides} color="sage" icon={<CheckCircle2 className="w-5 h-5" />} />
          </div>

          {/* Filtres */}
          <div className="bg-white rounded-xl shadow-sm p-3 mb-4 flex items-center gap-3 flex-wrap border border-[#E8DCC8]">
            <Filter className="w-4 h-4" style={{ color: 'var(--fg-muted, #8A6E4A)' }} />
            <select
              value={filterSev}
              onChange={(e) => setFilterSev(e.target.value as any)}
              className="text-sm border rounded-lg px-2 py-1.5 bg-white"
              style={{ borderColor: '#E8DCC8' }}
            >
              <option value="all">Toutes sévérités</option>
              <option value="danger">Critique</option>
              <option value="warning">Attention</option>
              <option value="info">Info</option>
            </select>
            <select
              value={filterStatut}
              onChange={(e) => setFilterStatut(e.target.value as any)}
              className="text-sm border rounded-lg px-2 py-1.5 bg-white"
              style={{ borderColor: '#E8DCC8' }}
            >
              <option value="all">Tous statuts</option>
              <option value="nouveau">Nouveau</option>
              <option value="en_revue">En revue</option>
              <option value="valide">Validé</option>
              <option value="rejete">Rejeté</option>
            </select>
            <div className="text-sm ml-auto" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>
              {filtered.length} finding(s)
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-[#E8DCC8]">
            <table className="min-w-full divide-y divide-[#E8DCC8] text-sm">
              <thead style={{ backgroundColor: 'var(--bg-subtle, #F5EFE4)' }}>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-mono uppercase tracking-wider" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>Agent</th>
                  <th className="px-4 py-3 text-left text-xs font-mono uppercase tracking-wider" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>Sévérité</th>
                  <th className="px-4 py-3 text-left text-xs font-mono uppercase tracking-wider" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>Titre / Description</th>
                  <th className="px-4 py-3 text-left text-xs font-mono uppercase tracking-wider" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>SQL corr.</th>
                  <th className="px-4 py-3 text-left text-xs font-mono uppercase tracking-wider" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>Statut</th>
                  <th className="px-4 py-3 text-center text-xs font-mono uppercase tracking-wider" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0E7D4]">
                {filtered.map((f) => {
                  const sev = SEV_CFG[f.severite];
                  const st = STATUT_CFG[f.statut];
                  return (
                    <tr key={f.id_finding} className="hover:bg-[#FDF2ED]/40 group">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-xs" style={{ color: 'var(--fg-primary, #2F2A26)' }}>{f.agent_source}</div>
                        <div className="text-[10px]" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>{f.agent_domaine}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded uppercase"
                          style={{ backgroundColor: sev.bg, color: sev.color }}
                        >
                          {sev.icon} {sev.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium" style={{ color: 'var(--fg-primary, #2F2A26)' }}>{f.titre}</div>
                        <div className="text-xs mt-0.5" style={{ color: 'var(--fg-secondary, #5D4E42)' }}>{f.description}</div>
                        <div className="text-[10px] mt-0.5 italic" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>
                          Impact : {f.impact_estime} · Détecté {new Date(f.detecte_le).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {f.sql_correction_proposee ? (
                          <code className="text-[10px] block max-w-xs truncate font-mono px-2 py-1 rounded" style={{ backgroundColor: '#F5EFE4', color: '#5D4E42' }}>
                            {f.sql_correction_proposee.split('\n')[0].slice(0, 40)}…
                          </code>
                        ) : (
                          <span className="text-[10px] italic" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex text-[10px] font-semibold px-2 py-0.5 rounded uppercase"
                          style={{ backgroundColor: st.bg, color: st.color }}
                        >
                          {st.label}
                        </span>
                        {f.reviewer_nom && (
                          <div className="text-[10px] mt-0.5" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>
                            par {f.reviewer_nom}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setSelected(f)}
                            title="Voir détails"
                            className="p-1.5 rounded hover:bg-[#FDF2ED]"
                            style={{ color: 'var(--fg-secondary, #5D4E42)' }}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {(f.statut === 'nouveau' || f.statut === 'en_revue') && (
                            <>
                              <button
                                onClick={() => valider(f.id_finding)}
                                title="Valider correction"
                                className="p-1.5 rounded hover:bg-emerald-50"
                                style={{ color: '#4A6C5B' }}
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => rejeter(f.id_finding)}
                                title="Rejeter"
                                className="p-1.5 rounded hover:bg-red-50"
                                style={{ color: '#B84A4A' }}
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>
                      Aucun finding.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal détail */}
      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            style={{ backgroundColor: 'var(--bg-app, #FBF8F3)' }}
          >
            <div className="p-5 space-y-4">
              <h3
                className="text-xl italic"
                style={{ fontFamily: 'var(--font-serif, Fraunces, serif)', fontWeight: 500, color: 'var(--fg-primary, #2F2A26)' }}
              >
                {selected.titre}
              </h3>
              <p className="text-sm" style={{ color: 'var(--fg-secondary, #5D4E42)' }}>
                {selected.description}
              </p>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="uppercase font-mono" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>Agent</div>
                  <div className="font-semibold">{selected.agent_source}</div>
                </div>
                <div>
                  <div className="uppercase font-mono" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>Impact</div>
                  <div className="font-semibold">{selected.impact_estime}</div>
                </div>
              </div>
              {selected.sql_correction_proposee && (
                <div>
                  <div className="uppercase font-mono text-xs mb-1 flex items-center gap-1" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>
                    <Code2 className="w-3 h-3" /> Correction SQL proposée
                  </div>
                  <pre className="text-[11px] font-mono p-3 rounded overflow-auto" style={{ backgroundColor: '#F5EFE4', color: '#2F2A26' }}>
                    {selected.sql_correction_proposee}
                  </pre>
                </div>
              )}
              <div className="flex justify-end gap-2 pt-3 border-t" style={{ borderColor: '#E8DCC8' }}>
                <button
                  onClick={() => setSelected(null)}
                  className="px-4 py-2 rounded-lg text-sm border"
                  style={{ backgroundColor: 'var(--bg-app, #FBF8F3)', borderColor: '#E8DCC8', color: 'var(--fg-secondary, #5D4E42)' }}
                >
                  Fermer
                </button>
                {(selected.statut === 'nouveau' || selected.statut === 'en_revue') && (
                  <>
                    <button
                      onClick={() => rejeter(selected.id_finding)}
                      className="px-4 py-2 rounded-lg text-sm text-white"
                      style={{ backgroundColor: '#B84A4A' }}
                    >
                      Rejeter
                    </button>
                    <button
                      onClick={() => valider(selected.id_finding)}
                      className="px-4 py-2 rounded-lg text-sm text-white"
                      style={{ backgroundColor: '#C8663D' }}
                    >
                      Valider correction
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConstatsATraiter;
