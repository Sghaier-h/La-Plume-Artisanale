import React, { useEffect, useMemo, useState } from 'react';
import {
  Receipt,
  Search,
  Download,
  RefreshCw,
  CheckCircle2,
  Printer,
  X,
  FilePlus,
} from 'lucide-react';
import KpiCard from '../../components/ecommerce/KpiCard';
import BulletinPaiePro from '../../components/rh/BulletinPaiePro';
import { bulletinsService, BulletinPaie, LigneBulletin } from '../../services/rhApi';

// Codes standards de bulletin de paie Tunisie (§11bis.8)
// 1010 = salaire base, 1060 = ancienneté, 1070 = prime rendement,
// 1110-1140 = primes légales (panier / transport / présence / assiduité)
// 2000 = brut, 2010 = imposable, 4000 = CNSS 9.18%, 4010 = IRPP, 4011 = CSS
// 4099 = autres retenues, 5010 = net à payer
const buildLignes = (base: number, primes: number = 0): { lignes: LigneBulletin[]; totals: any } => {
  const lignes: LigneBulletin[] = [
    { code: '1010', libelle: 'Salaire de base (26 j)', base, gain: base },
    { code: '1060', libelle: 'Prime d\'ancienneté', base: base, taux: 5, gain: Math.round(base * 0.05 * 1000) / 1000 },
    { code: '1110', libelle: 'Panier mensuel', gain: 100 },
    { code: '1120', libelle: 'Transport mensuel', gain: 80 },
    { code: '1130', libelle: 'Prime présence', gain: 40 },
    { code: '1140', libelle: 'Prime assiduité', gain: 30 },
  ];
  if (primes > 0) {
    lignes.push({ code: '1180', libelle: 'Prime exceptionnelle', gain: primes });
  }
  const brut = lignes.reduce((s, l) => s + (l.gain || 0), 0);
  const cnss = Math.round(brut * 0.0918 * 1000) / 1000;
  const imposable = Math.round((brut - cnss) * 1000) / 1000;
  // IRPP simplifié 5 tranches Tunisie 2024
  const irpp = calculIRPP(imposable * 12) / 12;
  const css = Math.round(imposable * 0.005 * 1000) / 1000; // CSS 0.5% >= 5000 DT/an, simplifié
  const net = Math.round((brut - cnss - irpp - css) * 1000) / 1000;

  lignes.push({ code: '2000', libelle: 'Salaire BRUT', gain: brut });
  lignes.push({ code: '4000', libelle: 'CNSS employé', base: brut, taux: 9.18, retenue: cnss });
  lignes.push({ code: '2010', libelle: 'Assiette imposable', gain: imposable });
  lignes.push({ code: '4010', libelle: 'IRPP', retenue: Math.round(irpp * 1000) / 1000 });
  lignes.push({ code: '4011', libelle: 'CSS (Contribution Sociale Solidarité)', retenue: css });
  lignes.push({ code: '5010', libelle: 'NET À PAYER', gain: net });

  return { lignes, totals: { brut, cnss, imposable, irpp: Math.round(irpp * 1000) / 1000, css, net } };
};

function calculIRPP(brutAnnuel: number): number {
  // Barème IRPP Tunisie 2024 (progressif)
  // 0-5000: 0% · 5000-20000: 26% · 20000-30000: 28% · 30000-50000: 32% · >50000: 35%
  const tranches = [
    { max: 5000, taux: 0 },
    { max: 20000, taux: 0.26 },
    { max: 30000, taux: 0.28 },
    { max: 50000, taux: 0.32 },
    { max: Infinity, taux: 0.35 },
  ];
  let irpp = 0;
  let precedent = 0;
  for (const t of tranches) {
    if (brutAnnuel <= precedent) break;
    const part = Math.min(brutAnnuel, t.max) - precedent;
    irpp += part * t.taux;
    precedent = t.max;
    if (brutAnnuel <= t.max) break;
  }
  return irpp;
}

const makeMockBulletin = (
  id: number,
  employe: { id: number; prenom: string; nom: string; fonction: string; matricule: string; cin: string; cnss: string },
  base: number,
  moisAnnee: [number, number],
  primes = 0,
): BulletinPaie => {
  const { lignes, totals } = buildLignes(base, primes);
  const [mois, annee] = moisAnnee;
  return {
    id_bulletin: id,
    numero_bulletin: `BP-${annee}-${String(mois).padStart(2, '0')}-${String(id).padStart(3, '0')}`,
    id_employe: employe.id,
    employe_prenom: employe.prenom,
    employe_nom: employe.nom,
    fonction: employe.fonction,
    matricule: employe.matricule,
    cin: employe.cin,
    cnss_num: employe.cnss,
    mois,
    annee,
    jours_travailles: 26,
    heures_travaillees: 208,
    salaire_brut: totals.brut,
    cnss_9_18: totals.cnss,
    imposable: totals.imposable,
    irpp: totals.irpp,
    css: totals.css,
    avances: 0,
    autres_retenues: 0,
    net_a_payer: totals.net,
    lignes,
    statut: 'valide',
    date_generation: new Date().toISOString(),
  };
};

const MOCK_BULLETINS: BulletinPaie[] = [
  makeMockBulletin(
    1,
    { id: 1001, prenom: 'Salima', nom: 'Guelbi', fonction: 'Directrice générale', matricule: 'LP-001', cin: '01234567', cnss: '01-234567-89' },
    2450,
    [new Date().getMonth() + 1, new Date().getFullYear()],
    500,
  ),
  makeMockBulletin(
    2,
    { id: 1002, prenom: 'Hedi', nom: 'Sghaier', fonction: 'Contremaître tissage', matricule: 'LP-002', cin: '07654321', cnss: '01-345678-90' },
    1180,
    [new Date().getMonth() + 1, new Date().getFullYear()],
  ),
  makeMockBulletin(
    3,
    { id: 1003, prenom: 'Fatma', nom: 'Trabelsi', fonction: 'Ouvrière tissage', matricule: 'LP-003', cin: '02233445', cnss: '01-456789-01' },
    620,
    [new Date().getMonth() + 1, new Date().getFullYear()],
  ),
  makeMockBulletin(
    4,
    { id: 1004, prenom: 'Karim', nom: 'Bouazizi', fonction: 'Conducteur machine', matricule: 'LP-004', cin: '05566778', cnss: '01-567890-12' },
    720,
    [new Date().getMonth() + 1, new Date().getFullYear()],
    150,
  ),
  makeMockBulletin(
    5,
    { id: 1006, prenom: 'Amel', nom: 'Ferchichi', fonction: 'Ouvrière finition', matricule: 'LP-006', cin: '08899001', cnss: '01-678901-23' },
    580,
    [new Date().getMonth() + 1, new Date().getFullYear()],
  ),
];

const pickArray = <T,>(res: PromiseSettledResult<any>, key: string, fb: T[]): T[] => {
  if (res.status !== 'fulfilled') return fb;
  const d = res.value?.data?.data ?? res.value?.data;
  if (Array.isArray(d)) return d;
  if (d && Array.isArray(d[key])) return d[key];
  return fb;
};

const BulletinsPaie: React.FC = () => {
  const [bulletins, setBulletins] = useState<BulletinPaie[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedMois, setSelectedMois] = useState(new Date().getMonth() + 1);
  const [selectedAnnee, setSelectedAnnee] = useState(new Date().getFullYear());
  const [preview, setPreview] = useState<BulletinPaie | null>(null);
  const [genLoading, setGenLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [res] = await Promise.allSettled([
        bulletinsService.list({ mois: selectedMois, annee: selectedAnnee }),
      ]);
      if (cancelled) return;
      setBulletins(pickArray<BulletinPaie>(res, 'bulletins', MOCK_BULLETINS));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedMois, selectedAnnee]);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return bulletins.filter((b) => {
      if (!s) return true;
      return `${b.numero_bulletin} ${b.employe_nom || ''} ${b.employe_prenom || ''}`.toLowerCase().includes(s);
    });
  }, [bulletins, search]);

  const totalMasse = useMemo(
    () => bulletins.reduce((s, b) => s + b.salaire_brut, 0),
    [bulletins],
  );
  const totalNet = useMemo(() => bulletins.reduce((s, b) => s + b.net_a_payer, 0), [bulletins]);
  const totalCNSS = useMemo(() => bulletins.reduce((s, b) => s + b.cnss_9_18, 0), [bulletins]);
  const totalIRPP = useMemo(() => bulletins.reduce((s, b) => s + b.irpp, 0), [bulletins]);

  const genererBulletins = async () => {
    setGenLoading(true);
    try {
      await bulletinsService.generer({ mois: selectedMois, annee: selectedAnnee }).catch(() => {});
      // en mode mock, rien à faire
    } finally {
      setGenLoading(false);
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
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
          <div>
            <h1 className="text-3xl font-bold text-[#2F1F12] flex items-center gap-2" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
              <Receipt className="w-8 h-8 text-[#C8663D]" />
              Bulletins de paie
            </h1>
            <p className="text-sm text-[#6B4E31] mt-1">
              Codes 1010 · 1060 · 1070 · 1110-1140 · 2000-2010 · 4000-4011 · 5010 &middot; §11bis.8
            </p>
          </div>
          <button
            onClick={genererBulletins}
            disabled={genLoading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#C8663D] text-white rounded-lg hover:bg-[#B85528] disabled:opacity-50 font-medium text-sm"
          >
            {genLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FilePlus className="w-4 h-4" />}
            Générer bulletins du mois
          </button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KpiCard
            label="Masse salariale brute"
            value={totalMasse.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}
            suffix="DT"
            color="terracotta"
          />
          <KpiCard
            label="Net à payer total"
            value={totalNet.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}
            suffix="DT"
            color="sage"
          />
          <KpiCard
            label="CNSS employé 9,18%"
            value={totalCNSS.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}
            suffix="DT"
            color="indigo"
          />
          <KpiCard
            label="IRPP total"
            value={totalIRPP.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}
            suffix="DT"
            color="warning"
          />
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-xl shadow-sm border border-[#EDE3CE] p-4 mb-4">
          <div className="flex flex-wrap gap-3 items-center">
            <select
              value={selectedMois}
              onChange={(e) => setSelectedMois(Number(e.target.value))}
              className="px-3 py-2 border border-[#DFD3B8] rounded-lg text-sm bg-white"
            >
              {['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'].map(
                (m, i) => (
                  <option key={m} value={i + 1}>
                    {m}
                  </option>
                ),
              )}
            </select>
            <select
              value={selectedAnnee}
              onChange={(e) => setSelectedAnnee(Number(e.target.value))}
              className="px-3 py-2 border border-[#DFD3B8] rounded-lg text-sm bg-white"
            >
              {[selectedAnnee - 1, selectedAnnee, selectedAnnee + 1].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <div className="flex-1 min-w-[240px] relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9B8874]" />
              <input
                type="text"
                placeholder="Rechercher (employé, n° bulletin)"
                className="pl-9 pr-3 py-2 w-full border border-[#DFD3B8] rounded-lg text-sm bg-white focus:outline-none focus:border-[#C8663D]"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-[#EDE3CE] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F5EFE5] text-left text-[11px] font-semibold text-[#6B4E31] uppercase tracking-wide">
                  <th className="px-4 py-3">N° bulletin</th>
                  <th className="px-4 py-3">Employé</th>
                  <th className="px-4 py-3">Fonction</th>
                  <th className="px-4 py-3 text-right">Brut (DT)</th>
                  <th className="px-4 py-3 text-right">CNSS 9,18%</th>
                  <th className="px-4 py-3 text-right">Imposable</th>
                  <th className="px-4 py-3 text-right">IRPP</th>
                  <th className="px-4 py-3 text-right">CSS</th>
                  <th className="px-4 py-3 text-right">NET (DT)</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="text-center py-10 text-[#9B8874]">
                      Aucun bulletin pour cette période
                    </td>
                  </tr>
                ) : (
                  filtered.map((b) => (
                    <tr
                      key={b.id_bulletin}
                      className="border-t border-[#EDE3CE] hover:bg-[#FBF8F3] group cursor-pointer"
                      onClick={() => setPreview(b)}
                    >
                      <td className="px-4 py-3 font-mono text-xs text-[#4A5D75]">{b.numero_bulletin}</td>
                      <td className="px-4 py-3 font-medium">
                        {b.employe_prenom} {b.employe_nom}
                      </td>
                      <td className="px-4 py-3 text-[#6B4E31] text-xs">{b.fonction}</td>
                      <td className="px-4 py-3 font-mono text-right">
                        {b.salaire_brut.toLocaleString('fr-FR', { minimumFractionDigits: 3 })}
                      </td>
                      <td className="px-4 py-3 font-mono text-right text-[#B84A2F]">
                        -{b.cnss_9_18.toLocaleString('fr-FR', { minimumFractionDigits: 3 })}
                      </td>
                      <td className="px-4 py-3 font-mono text-right">
                        {b.imposable.toLocaleString('fr-FR', { minimumFractionDigits: 3 })}
                      </td>
                      <td className="px-4 py-3 font-mono text-right text-[#B84A2F]">
                        -{b.irpp.toLocaleString('fr-FR', { minimumFractionDigits: 3 })}
                      </td>
                      <td className="px-4 py-3 font-mono text-right text-[#B84A2F]">
                        -{b.css.toLocaleString('fr-FR', { minimumFractionDigits: 3 })}
                      </td>
                      <td className="px-4 py-3 font-mono text-right font-bold text-[#4A6C5B]">
                        {b.net_a_payer.toLocaleString('fr-FR', { minimumFractionDigits: 3 })}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border ${
                            b.statut === 'paye'
                              ? 'bg-[#EEF4F0] text-[#4A6C5B] border-[#7A8C6A]'
                              : b.statut === 'valide'
                              ? 'bg-[#EDF0F5] text-[#3B4E68] border-[#4A5D75]'
                              : 'bg-[#FBF3E0] text-[#8A6412] border-[#C89B3C]'
                          }`}
                        >
                          {b.statut === 'paye' && <CheckCircle2 className="w-3 h-3" />}
                          {b.statut}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          <a
                            href={bulletinsService.pdfUrl(b.id_bulletin)}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            title="Télécharger PDF"
                            className="p-1.5 rounded hover:bg-[#EDF0F5]"
                          >
                            <Download className="w-4 h-4 text-[#3B4E68]" />
                          </a>
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

      {/* Modal bulletin PRO */}
      {preview && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setPreview(null)}
        >
          <div onClick={(e) => e.stopPropagation()} className="my-10 relative">
            <div className="absolute -top-12 right-0 flex gap-2 z-10">
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 bg-white text-[#C8663D] rounded shadow inline-flex items-center gap-1 text-sm hover:bg-[#FDF2ED]"
              >
                <Printer className="w-4 h-4" /> Imprimer
              </button>
              <button
                onClick={() => setPreview(null)}
                className="px-3 py-1.5 bg-white rounded shadow inline-flex items-center gap-1 text-sm hover:bg-gray-100"
              >
                <X className="w-4 h-4" /> Fermer
              </button>
            </div>
            <BulletinPaiePro bulletin={preview} />
          </div>
        </div>
      )}
    </div>
  );
};

export default BulletinsPaie;
