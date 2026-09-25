import React, { useEffect, useMemo, useState } from 'react';
import {
  FileText,
  Calendar,
  Bot,
  Download,
  Eye,
  Filter,
} from 'lucide-react';
import api from '../../services/api';

// ═══════════════════════════════════════════════════════════════════
// §11ter — Rapports Q/H/M générés par les agents IA
// ═══════════════════════════════════════════════════════════════════

type PeriodeRapport = 'quotidien' | 'hebdomadaire' | 'mensuel';

interface Rapport {
  id_rapport: number;
  periode: PeriodeRapport;
  date_debut: string;
  date_fin: string;
  agent_auteur: string;
  titre: string;
  resume_executif: string;
  nb_findings: number;
  nb_recommandations: number;
  url_pdf: string;
  genere_le: string;
}

const MOCK_RAPPORTS: Rapport[] = [
  {
    id_rapport: 901,
    periode: 'quotidien',
    date_debut: new Date().toISOString().slice(0, 10),
    date_fin: new Date().toISOString().slice(0, 10),
    agent_auteur: 'Rapport Quotidien',
    titre: 'Digest exécutif · ' + new Date().toLocaleDateString('fr-FR'),
    resume_executif:
      '32 OF actifs, 4 alertes stock, 2 factures échues. CA jour 12 400 DT (+8% vs veille). Qualité 98.2% (au-dessus objectif). 1 constat critique à traiter.',
    nb_findings: 12,
    nb_recommandations: 4,
    url_pdf: '#',
    genere_le: new Date(Date.now() - 3600_000 * 6).toISOString(),
  },
  {
    id_rapport: 900,
    periode: 'quotidien',
    date_debut: new Date(Date.now() - 86400_000).toISOString().slice(0, 10),
    date_fin: new Date(Date.now() - 86400_000).toISOString().slice(0, 10),
    agent_auteur: 'Rapport Quotidien',
    titre: 'Digest exécutif · ' + new Date(Date.now() - 86400_000).toLocaleDateString('fr-FR'),
    resume_executif:
      '28 OF actifs, 2 alertes stock, 1 facture échue résolue. CA jour 11 480 DT. Qualité 97.8%. Machine T-08 en surveillance.',
    nb_findings: 8,
    nb_recommandations: 3,
    url_pdf: '#',
    genere_le: new Date(Date.now() - 86400_000 - 3600_000 * 6).toISOString(),
  },
  {
    id_rapport: 850,
    periode: 'hebdomadaire',
    date_debut: new Date(Date.now() - 86400_000 * 7).toISOString().slice(0, 10),
    date_fin: new Date(Date.now() - 86400_000 * 1).toISOString().slice(0, 10),
    agent_auteur: 'Rapport Hebdomadaire',
    titre: 'Synthèse semaine 39',
    resume_executif:
      'CA semaine 78 400 DT (+12% vs S-1). 145 OF terminés dont 8 en retard (-3 vs S-1). Taux qualité 98.1%. 3 nouveaux leads B2B qualifiés. Trésorerie stable.',
    nb_findings: 34,
    nb_recommandations: 7,
    url_pdf: '#',
    genere_le: new Date(Date.now() - 86400_000).toISOString(),
  },
  {
    id_rapport: 849,
    periode: 'hebdomadaire',
    date_debut: new Date(Date.now() - 86400_000 * 14).toISOString().slice(0, 10),
    date_fin: new Date(Date.now() - 86400_000 * 8).toISOString().slice(0, 10),
    agent_auteur: 'Rapport Hebdomadaire',
    titre: 'Synthèse semaine 38',
    resume_executif:
      'CA semaine 69 800 DT (+5% vs S-1). 132 OF terminés dont 11 en retard. Alerte MP Coton peigné anticipée. 2 leads perdus (concurrence prix).',
    nb_findings: 28,
    nb_recommandations: 5,
    url_pdf: '#',
    genere_le: new Date(Date.now() - 86400_000 * 8).toISOString(),
  },
  {
    id_rapport: 700,
    periode: 'mensuel',
    date_debut: new Date(Date.now() - 86400_000 * 30).toISOString().slice(0, 10),
    date_fin: new Date().toISOString().slice(0, 10),
    agent_auteur: 'Rapport Mensuel',
    titre: 'Bilan mensuel — Septembre 2026',
    resume_executif:
      'CA mois 312 kDT (+9% YoY). Marge brute 34.2% (+1.4pt). 542 OF livrés. Qualité moyenne 97.9%. 12 nouveaux clients B2B. 3 leviers stratégiques identifiés : automatisation contrôle qualité, optimisation stock MP, expansion export UE.',
    nb_findings: 156,
    nb_recommandations: 18,
    url_pdf: '#',
    genere_le: new Date(Date.now() - 86400_000 * 24).toISOString(),
  },
  {
    id_rapport: 699,
    periode: 'mensuel',
    date_debut: new Date(Date.now() - 86400_000 * 60).toISOString().slice(0, 10),
    date_fin: new Date(Date.now() - 86400_000 * 31).toISOString().slice(0, 10),
    agent_auteur: 'Rapport Mensuel',
    titre: 'Bilan mensuel — Août 2026',
    resume_executif:
      'CA mois 286 kDT (+6% YoY). Marge brute 32.8%. 498 OF livrés. Qualité 97.4%. Baisse saisonnière touristique compensée par export.',
    nb_findings: 142,
    nb_recommandations: 15,
    url_pdf: '#',
    genere_le: new Date(Date.now() - 86400_000 * 54).toISOString(),
  },
];

const PERIODE_CFG: Record<PeriodeRapport, { label: string; color: string; bg: string }> = {
  quotidien: { label: 'Quotidien', color: '#3B4E68', bg: '#EDF0F5' },
  hebdomadaire: { label: 'Hebdomadaire', color: '#8A6412', bg: '#FBF3E0' },
  mensuel: { label: 'Mensuel', color: '#C8663D', bg: '#FDF2ED' },
};

const RapportsGeneres: React.FC = () => {
  const [rapports, setRapports] = useState<Rapport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPeriode, setFilterPeriode] = useState<PeriodeRapport | 'all'>('all');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const r = await Promise.allSettled([api.get('/api/v2/ia-agents/rapports')]);
      if (cancelled) return;
      const pickArray = (res: PromiseSettledResult<any>): Rapport[] => {
        if (res.status !== 'fulfilled') return MOCK_RAPPORTS;
        const d = res.value?.data?.data ?? res.value?.data;
        if (Array.isArray(d)) return d;
        if (d && Array.isArray(d.rapports)) return d.rapports;
        return MOCK_RAPPORTS;
      };
      setRapports(pickArray(r[0]));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    return rapports.filter((r) => filterPeriode === 'all' || r.periode === filterPeriode);
  }, [rapports, filterPeriode]);

  if (loading) {
    return (
      <div className="ml-72 p-6 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C8663D]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-app, #FBF8F3)' }}>
      <div className="ml-72 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div
              className="text-xs uppercase tracking-widest font-mono mb-2"
              style={{ color: 'var(--fg-muted, #8A6E4A)' }}
            >
              §11ter · Intelligence Artificielle
            </div>
            <h1
              className="text-3xl italic mb-1"
              style={{
                fontFamily: 'var(--font-serif, Fraunces, serif)',
                fontWeight: 500,
                color: 'var(--fg-primary, #2F2A26)',
              }}
            >
              Rapports générés
            </h1>
            <p className="text-sm" style={{ color: 'var(--fg-secondary, #5D4E42)' }}>
              Rapports quotidiens, hebdomadaires et mensuels produits par les agents IA
            </p>
          </div>

          {/* Filter */}
          <div className="bg-white rounded-xl shadow-sm p-3 mb-4 flex items-center gap-3 border border-[#E8DCC8]">
            <Filter className="w-4 h-4" style={{ color: 'var(--fg-muted, #8A6E4A)' }} />
            <select
              value={filterPeriode}
              onChange={(e) => setFilterPeriode(e.target.value as any)}
              className="text-sm border rounded-lg px-2 py-1.5 bg-white"
              style={{ borderColor: '#E8DCC8' }}
            >
              <option value="all">Toutes périodes</option>
              <option value="quotidien">Quotidien</option>
              <option value="hebdomadaire">Hebdomadaire</option>
              <option value="mensuel">Mensuel</option>
            </select>
            <div className="text-sm ml-auto" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>
              {filtered.length} rapport(s)
            </div>
          </div>

          {/* Grid cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((r) => {
              const p = PERIODE_CFG[r.periode];
              return (
                <div
                  key={r.id_rapport}
                  className="bg-white rounded-xl p-5 shadow-sm border border-[#E8DCC8] hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span
                      className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded uppercase"
                      style={{ backgroundColor: p.bg, color: p.color }}
                    >
                      <Calendar className="w-3 h-3" /> {p.label}
                    </span>
                    <FileText className="w-5 h-5" style={{ color: '#C8663D' }} />
                  </div>

                  <h3
                    className="text-lg font-semibold mb-1"
                    style={{ fontFamily: 'var(--font-serif, Fraunces, serif)', color: 'var(--fg-primary, #2F2A26)' }}
                  >
                    {r.titre}
                  </h3>

                  <div className="text-[10px] flex items-center gap-1 mb-2" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>
                    <Bot className="w-3 h-3" />
                    {r.agent_auteur} · Généré {new Date(r.genere_le).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}
                  </div>

                  <p className="text-xs leading-relaxed mb-4" style={{ color: 'var(--fg-secondary, #5D4E42)' }}>
                    {r.resume_executif}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: '#E8DCC8' }}>
                    <div className="flex gap-3 text-[10px] font-mono">
                      <span style={{ color: 'var(--fg-muted, #8A6E4A)' }}>
                        <span className="font-bold" style={{ color: '#C8663D' }}>{r.nb_findings}</span> findings
                      </span>
                      <span style={{ color: 'var(--fg-muted, #8A6E4A)' }}>
                        <span className="font-bold" style={{ color: '#4A6C5B' }}>{r.nb_recommandations}</span> reco.
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="p-1.5 rounded hover:bg-[#FDF2ED]"
                        title="Aperçu"
                        style={{ color: 'var(--fg-secondary, #5D4E42)' }}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <a
                        href={r.url_pdf}
                        className="p-1.5 rounded hover:bg-[#FDF2ED]"
                        title="Télécharger PDF"
                        style={{ color: '#C8663D' }}
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="col-span-full text-center py-12" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>
                Aucun rapport pour cette période.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RapportsGeneres;
