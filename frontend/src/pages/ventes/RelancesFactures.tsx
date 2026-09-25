import React, { useEffect, useMemo, useState } from 'react';
import {
  Mail,
  Send,
  Clock,
  AlertTriangle,
  Search,
  Scale,
  X,
  History,
  MessageSquare,
  Phone,
  FileText,
} from 'lucide-react';
import KpiCard from '../../components/ecommerce/KpiCard';
import NiveauRelanceBadge from '../../components/ventes/NiveauRelanceBadge';
import {
  relancesFacturesService,
  RelanceFacture,
  NiveauRelance,
} from '../../services/ventesComplementsApi';

const isoDaysAgo = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
};

const MOCK_RELANCES: RelanceFacture[] = [
  {
    id_relance: 1,
    id_facture: 1002,
    numero_facture: 'FAC-2026-1002',
    id_client: 13,
    nom_client: 'Hotel Marina Djerba',
    email_client: 'compta@marina-djerba.tn',
    date_echeance: isoDaysAgo(5),
    jours_retard: 5,
    montant_du_dt: 6200,
    niveau_actuel: 1,
    derniere_relance_at: isoDaysAgo(2),
    derniere_relance_niveau: 1,
    prochaine_relance_at: isoDaysAgo(-8),
    email_envoye: true,
    historique: [
      { date: isoDaysAgo(2), niveau: 1, canal: 'email', auteur: 'Système' },
    ],
  },
  {
    id_relance: 2,
    id_facture: 1003,
    numero_facture: 'FAC-2026-1003',
    id_client: 14,
    nom_client: 'Boutique El Menzah SARL',
    email_client: 'contact@elmenzah.tn',
    date_echeance: isoDaysAgo(35),
    jours_retard: 35,
    montant_du_dt: 1240,
    niveau_actuel: 2,
    derniere_relance_at: isoDaysAgo(5),
    derniere_relance_niveau: 2,
    prochaine_relance_at: isoDaysAgo(-10),
    email_envoye: true,
    historique: [
      { date: isoDaysAgo(20), niveau: 1, canal: 'email', auteur: 'Système' },
      { date: isoDaysAgo(5), niveau: 2, canal: 'email', auteur: 'Fatma Trabelsi' },
    ],
  },
  {
    id_relance: 3,
    id_facture: 1004,
    numero_facture: 'FAC-2025-0998',
    id_client: 15,
    nom_client: 'Riad Souk Marrakech',
    email_client: 'admin@riadsouk.ma',
    date_echeance: isoDaysAgo(80),
    jours_retard: 80,
    montant_du_dt: 3400,
    niveau_actuel: 3,
    derniere_relance_at: isoDaysAgo(10),
    derniere_relance_niveau: 3,
    email_envoye: true,
    historique: [
      { date: isoDaysAgo(65), niveau: 1, canal: 'email' },
      { date: isoDaysAgo(45), niveau: 2, canal: 'email' },
      { date: isoDaysAgo(25), niveau: 2, canal: 'telephone', auteur: 'Sami Khemiri', reponse: 'Promesse règlement fin de mois' },
      { date: isoDaysAgo(10), niveau: 3, canal: 'courrier', auteur: 'Direction' },
    ],
  },
  {
    id_relance: 4,
    id_facture: 1005,
    numero_facture: 'FAC-2025-0972',
    id_client: 16,
    nom_client: 'Hammam SPA Nice',
    email_client: 'gerant@hammam-nice.fr',
    date_echeance: isoDaysAgo(130),
    jours_retard: 130,
    montant_du_dt: 5600,
    niveau_actuel: 4,
    derniere_relance_at: isoDaysAgo(15),
    derniere_relance_niveau: 4,
    email_envoye: true,
    historique: [
      { date: isoDaysAgo(115), niveau: 1, canal: 'email' },
      { date: isoDaysAgo(95), niveau: 2, canal: 'email' },
      { date: isoDaysAgo(60), niveau: 3, canal: 'courrier' },
      { date: isoDaysAgo(15), niveau: 4, canal: 'manuel', auteur: 'Salima Guelbi', reponse: 'Dossier transmis huissier' },
    ],
  },
];

const pickArray = <T,>(res: PromiseSettledResult<any>, key: string, fb: T[]): T[] => {
  if (res.status !== 'fulfilled') return fb;
  const d = res.value?.data?.data ?? res.value?.data;
  if (Array.isArray(d)) return d;
  if (d && Array.isArray(d[key])) return d[key];
  return fb;
};

const NIVEAUX_LABEL: Record<NiveauRelance, string> = {
  0: 'Aucun',
  1: 'Rappel amiable',
  2: '1ère relance',
  3: 'Mise en demeure',
  4: 'Précontentieux',
};

const RelancesFactures: React.FC = () => {
  const [relances, setRelances] = useState<RelanceFacture[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filtreNiveau, setFiltreNiveau] = useState<'tous' | NiveauRelance>('tous');
  const [detail, setDetail] = useState<RelanceFacture | null>(null);
  const [sending, setSending] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [res] = await Promise.allSettled([relancesFacturesService.list()]);
      if (cancelled) return;
      setRelances(pickArray<RelanceFacture>(res, 'relances', MOCK_RELANCES));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return relances
      .filter((r) => {
        if (filtreNiveau !== 'tous' && r.niveau_actuel !== filtreNiveau) return false;
        if (!s) return true;
        return `${r.numero_facture} ${r.nom_client}`.toLowerCase().includes(s);
      })
      .sort((a, b) => b.jours_retard - a.jours_retard);
  }, [relances, search, filtreNiveau]);

  const kpis = useMemo(() => {
    const parNiveau: Record<NiveauRelance, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };
    relances.forEach((r) => {
      parNiveau[r.niveau_actuel]++;
    });
    const totalDu = relances.reduce((s, r) => s + r.montant_du_dt, 0);
    return { parNiveau, totalDu };
  }, [relances]);

  const envoyerRelance = async (r: RelanceFacture, canal: 'email' | 'telephone' | 'courrier' | 'manuel') => {
    setSending(r.id_relance);
    const nextNiveau = Math.min((r.niveau_actuel + 1) as NiveauRelance, 4 as NiveauRelance) as NiveauRelance;
    try {
      await relancesFacturesService.envoyerRelance(r.id_facture, { niveau: nextNiveau, canal }).catch(() => {});
      setRelances((prev) =>
        prev.map((x) =>
          x.id_relance === r.id_relance
            ? {
                ...x,
                niveau_actuel: nextNiveau,
                derniere_relance_at: new Date().toISOString().slice(0, 10),
                derniere_relance_niveau: nextNiveau,
                email_envoye: canal === 'email' ? true : x.email_envoye,
                historique: [
                  ...(x.historique || []),
                  { date: new Date().toISOString().slice(0, 10), niveau: nextNiveau, canal },
                ],
              }
            : x,
        ),
      );
    } finally {
      setSending(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C8663D]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF8F3] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#2F1F12] flex items-center gap-2" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
            <Mail className="w-8 h-8 text-[#C8663D]" />
            Relances factures
          </h1>
          <p className="text-sm text-[#6B4E31] mt-1">
            Relances automatiques niveaux 1 à 4 &middot; §8.10
          </p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KpiCard
            label="Encours relancé (DT)"
            value={kpis.totalDu.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}
            color="terracotta"
          />
          <KpiCard label="Rappel amiable" value={kpis.parNiveau[1]} icon={<Mail className="w-5 h-5" />} color="indigo" />
          <KpiCard label="Mises en demeure" value={kpis.parNiveau[3]} icon={<AlertTriangle className="w-5 h-5" />} color="warning" />
          <KpiCard label="Précontentieux" value={kpis.parNiveau[4]} icon={<Scale className="w-5 h-5" />} color={kpis.parNiveau[4] > 0 ? 'warning' : 'neutral'} />
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-xl shadow-sm border border-[#EDE3CE] p-4 mb-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex-1 min-w-[240px] relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9B8874]" />
              <input
                type="text"
                placeholder="Rechercher (facture, client)"
                className="pl-9 pr-3 py-2 w-full border border-[#DFD3B8] rounded-lg text-sm bg-white focus:outline-none focus:border-[#C8663D]"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              value={filtreNiveau === 'tous' ? 'tous' : String(filtreNiveau)}
              onChange={(e) => setFiltreNiveau(e.target.value === 'tous' ? 'tous' : (Number(e.target.value) as NiveauRelance))}
              className="px-3 py-2 border border-[#DFD3B8] rounded-lg text-sm bg-white"
            >
              <option value="tous">Tous niveaux</option>
              <option value="1">Rappel amiable</option>
              <option value="2">1ère relance</option>
              <option value="3">Mise en demeure</option>
              <option value="4">Précontentieux</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-[#EDE3CE] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F5EFE5] text-left text-[11px] font-semibold text-[#6B4E31] uppercase tracking-wide">
                  <th className="px-4 py-3">Facture</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Échéance</th>
                  <th className="px-4 py-3 text-right">Retard (j)</th>
                  <th className="px-4 py-3 text-right">Montant (DT)</th>
                  <th className="px-4 py-3">Niveau actuel</th>
                  <th className="px-4 py-3">Dernière relance</th>
                  <th className="px-4 py-3 text-center">Email</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-10 text-[#9B8874]">
                      Aucune relance
                    </td>
                  </tr>
                ) : (
                  filtered.map((r) => (
                    <tr key={r.id_relance} className="border-t border-[#EDE3CE] hover:bg-[#FBF8F3]">
                      <td className="px-4 py-3 font-mono text-xs text-[#4A5D75] font-semibold">{r.numero_facture}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{r.nom_client}</div>
                        {r.email_client && (
                          <div className="text-xs text-[#9B8874]">{r.email_client}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs">{r.date_echeance}</td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-[#B84A2F]">
                        {r.jours_retard} j
                      </td>
                      <td className="px-4 py-3 text-right font-mono">
                        {r.montant_du_dt.toLocaleString('fr-FR', { minimumFractionDigits: 3 })}
                      </td>
                      <td className="px-4 py-3">
                        <NiveauRelanceBadge niveau={r.niveau_actuel} size="sm" />
                      </td>
                      <td className="px-4 py-3 text-xs text-[#6B4E31]">
                        {r.derniere_relance_at ? (
                          <>
                            {r.derniere_relance_at}
                            <div className="text-[10px] text-[#9B8874]">
                              {r.derniere_relance_niveau != null && NIVEAUX_LABEL[r.derniere_relance_niveau]}
                            </div>
                          </>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {r.email_envoye ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-[#4A6C5B]">
                            <Send className="w-3 h-3" /> OK
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] text-[#9B8874]">
                            <Clock className="w-3 h-3" />
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => setDetail(r)}
                            title="Historique"
                            className="p-1.5 rounded hover:bg-[#EDF0F5]"
                          >
                            <History className="w-4 h-4 text-[#3B4E68]" />
                          </button>
                          <button
                            onClick={() => envoyerRelance(r, 'email')}
                            disabled={sending === r.id_relance || r.niveau_actuel >= 4}
                            title="Relance email"
                            className="p-1.5 rounded hover:bg-[#FDF2ED] disabled:opacity-40"
                          >
                            <Mail className="w-4 h-4 text-[#C8663D]" />
                          </button>
                          <button
                            onClick={() => envoyerRelance(r, 'telephone')}
                            disabled={sending === r.id_relance}
                            title="Appel téléphonique"
                            className="p-1.5 rounded hover:bg-[#EEF4F0] disabled:opacity-40"
                          >
                            <Phone className="w-4 h-4 text-[#4A6C5B]" />
                          </button>
                          <button
                            onClick={() => envoyerRelance(r, 'courrier')}
                            disabled={sending === r.id_relance}
                            title="Courrier recommandé"
                            className="p-1.5 rounded hover:bg-[#FBF3E0] disabled:opacity-40"
                          >
                            <FileText className="w-4 h-4 text-[#8A6412]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal historique */}
      {detail && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={() => setDetail(null)}
        >
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b border-[#EDE3CE]">
              <h2 className="text-lg font-semibold" style={{ fontFamily: 'Fraunces, serif' }}>
                Historique — {detail.numero_facture}
              </h2>
              <button onClick={() => setDetail(null)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <div className="bg-[#F5EFE5] rounded p-3 mb-4">
                <div className="text-sm text-[#6B4E31]">{detail.nom_client}</div>
                <div className="text-lg font-bold text-[#B84A2F] mt-1">
                  {detail.montant_du_dt.toLocaleString('fr-FR', { minimumFractionDigits: 3 })} DT
                </div>
                <div className="text-xs text-[#9B8874]">
                  Retard : {detail.jours_retard} jours &middot; Échéance {detail.date_echeance}
                </div>
              </div>
              <div className="space-y-3">
                {(detail.historique || []).map((h, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#FDF2ED] text-[#C8663D] flex items-center justify-center shrink-0">
                      {h.canal === 'email' ? (
                        <Mail className="w-4 h-4" />
                      ) : h.canal === 'telephone' ? (
                        <Phone className="w-4 h-4" />
                      ) : h.canal === 'courrier' ? (
                        <FileText className="w-4 h-4" />
                      ) : (
                        <MessageSquare className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <NiveauRelanceBadge niveau={h.niveau} size="sm" />
                        <div className="text-xs text-[#9B8874]">{h.date}</div>
                      </div>
                      <div className="text-xs text-[#6B4E31] mt-1">
                        Canal : <b>{h.canal}</b>
                        {h.auteur && <> · Par : {h.auteur}</>}
                      </div>
                      {h.reponse && (
                        <div className="text-xs bg-[#FBF3E0] rounded p-2 mt-1 text-[#8A6412]">
                          « {h.reponse} »
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RelancesFactures;
