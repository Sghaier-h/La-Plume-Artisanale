import React, { useEffect, useMemo, useState } from 'react';
import {
  Calculator,
  Users,
  FileText,
  Percent,
  GraduationCap,
  Landmark,
  BarChart3,
  Download,
} from 'lucide-react';
import KpiCard from '../../components/ecommerce/KpiCard';
import { paieTunisieService, PaieMensuelle, TrancheIRPP } from '../../services/rhApi';

type TabKey = 'dashboard' | 'cnss' | 'irpp' | 'grille';

const MOIS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

// Barème IRPP Tunisie 2024
const TRANCHES_IRPP: TrancheIRPP[] = [
  { min_dt: 0, max_dt: 5000, taux_pct: 0 },
  { min_dt: 5000, max_dt: 10000, taux_pct: 15 },
  { min_dt: 10000, max_dt: 20000, taux_pct: 25 },
  { min_dt: 20000, max_dt: 30000, taux_pct: 30 },
  { min_dt: 30000, max_dt: 40000, taux_pct: 33 },
  { min_dt: 40000, max_dt: 50000, taux_pct: 36 },
  { min_dt: 50000, max_dt: null, taux_pct: 38 },
];

// Convention JORT N°49 — grille salariale textile 2024 (extrait)
const GRILLE_SALAIRES = [
  { coeff: 'I-1', categorie: 'Ouvrier', libelle: 'Ouvrier tissage / finition', salaire: 458.24 },
  { coeff: 'I-2', categorie: 'Ouvrier', libelle: 'Ouvrier spécialisé', salaire: 496.00 },
  { coeff: 'II-1', categorie: 'Ouvrier qualifié', libelle: 'Tisserand qualifié', salaire: 580.00 },
  { coeff: 'II-2', categorie: 'Ouvrier qualifié', libelle: 'Couturière qualifiée', salaire: 620.00 },
  { coeff: 'III-1', categorie: 'Ouvrier hautement qualifié', libelle: 'Conducteur machine', salaire: 720.00 },
  { coeff: 'III-2', categorie: 'Ouvrier hautement qualifié', libelle: 'Régleur mécanique', salaire: 820.00 },
  { coeff: 'IV-1', categorie: 'Maîtrise', libelle: 'Contremaître', salaire: 1050.00 },
  { coeff: 'IV-2', categorie: 'Maîtrise', libelle: 'Contrôleur qualité', salaire: 950.00 },
  { coeff: 'IV-3', categorie: 'Maîtrise supérieure', libelle: 'Chef d\'atelier', salaire: 1350.00 },
  { coeff: 'V-1', categorie: 'Cadre', libelle: 'Cadre commercial / RH', salaire: 1650.00 },
  { coeff: 'V-2', categorie: 'Cadre confirmé', libelle: 'Cadre confirmé', salaire: 1950.00 },
  { coeff: 'V-3', categorie: 'Cadre supérieur', libelle: 'Directeur / Directrice', salaire: 2450.00 },
];

const MOCK_PAIE: PaieMensuelle = {
  mois: new Date().getMonth() + 1,
  annee: new Date().getFullYear(),
  masse_brute: 38450.750,
  masse_nette: 30235.420,
  cnss_employeur: Math.round(38450.75 * 0.1657 * 1000) / 1000,
  cnss_employe: Math.round(38450.75 * 0.0918 * 1000) / 1000,
  irpp_total: 4230.500,
  css_total: 192.250,
  tfp: Math.round(38450.75 * 0.02 * 1000) / 1000,
  foprolos: Math.round(38450.75 * 0.01 * 1000) / 1000,
  nb_employes: 55,
  nb_bulletins: 55,
  statut: 'ouvert',
};

const PaieTunisie: React.FC = () => {
  const [tab, setTab] = useState<TabKey>('dashboard');
  const [mois, setMois] = useState(new Date().getMonth() + 1);
  const [annee, setAnnee] = useState(new Date().getFullYear());
  const [paie, setPaie] = useState<PaieMensuelle>(MOCK_PAIE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [res] = await Promise.allSettled([paieTunisieService.dashboard({ mois, annee })]);
      if (cancelled) return;
      if (res.status === 'fulfilled') {
        const d = res.value?.data?.data ?? res.value?.data;
        setPaie(d && typeof d === 'object' && 'masse_brute' in d ? (d as PaieMensuelle) : { ...MOCK_PAIE, mois, annee });
      } else {
        setPaie({ ...MOCK_PAIE, mois, annee });
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [mois, annee]);

  const trimestre = useMemo(() => Math.ceil(mois / 3), [mois]);
  const chargesSociales = useMemo(() => paie.cnss_employeur + paie.tfp + paie.foprolos, [paie]);
  const totalRetenues = useMemo(() => paie.cnss_employe + paie.irpp_total + paie.css_total, [paie]);

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
              <Landmark className="w-8 h-8 text-[#C8663D]" />
              Paie Tunisie — CNSS / IRPP
            </h1>
            <p className="text-sm text-[#6B4E31] mt-1">
              Bordereau CNSS · Déclaration IRPP · Convention JORT N°49 &middot; §11bis.9
            </p>
          </div>
          <div className="flex gap-2">
            <select value={mois} onChange={(e) => setMois(Number(e.target.value))} className="px-3 py-2 border border-[#DFD3B8] rounded-lg text-sm bg-white">
              {MOIS_FR.map((m, i) => (
                <option key={m} value={i + 1}>
                  {m}
                </option>
              ))}
            </select>
            <select value={annee} onChange={(e) => setAnnee(Number(e.target.value))} className="px-3 py-2 border border-[#DFD3B8] rounded-lg text-sm bg-white">
              {[annee - 1, annee, annee + 1].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Onglets */}
        <div className="flex flex-wrap gap-1 mb-6 border-b border-[#EDE3CE]">
          {(
            [
              { k: 'dashboard', l: 'Dashboard paie', i: <BarChart3 className="w-4 h-4" /> },
              { k: 'cnss', l: 'Bordereau CNSS', i: <Users className="w-4 h-4" /> },
              { k: 'irpp', l: 'Déclaration IRPP', i: <FileText className="w-4 h-4" /> },
              { k: 'grille', l: 'Grille salaires JORT N°49', i: <GraduationCap className="w-4 h-4" /> },
            ] as { k: TabKey; l: string; i: React.ReactNode }[]
          ).map((t) => (
            <button
              key={t.k}
              onClick={() => setTab(t.k)}
              className={`px-4 py-2.5 font-medium text-sm inline-flex items-center gap-2 border-b-2 transition-colors ${
                tab === t.k
                  ? 'border-[#C8663D] text-[#C8663D]'
                  : 'border-transparent text-[#6B4E31] hover:text-[#2F1F12]'
              }`}
            >
              {t.i}
              {t.l}
            </button>
          ))}
        </div>

        {tab === 'dashboard' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <KpiCard
                label="Masse salariale brute"
                value={paie.masse_brute.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}
                suffix="DT"
                icon={<Calculator className="w-5 h-5" />}
                color="terracotta"
              />
              <KpiCard
                label="CNSS employeur 16,57%"
                value={paie.cnss_employeur.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}
                suffix="DT"
                icon={<Users className="w-5 h-5" />}
                color="indigo"
              />
              <KpiCard
                label="CNSS employé 9,18%"
                value={paie.cnss_employe.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}
                suffix="DT"
                color="warning"
              />
              <KpiCard
                label="IRPP total"
                value={paie.irpp_total.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}
                suffix="DT"
                icon={<Percent className="w-5 h-5" />}
                color="sage"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Détail charges patronales */}
              <div className="bg-white rounded-xl shadow-sm border border-[#EDE3CE] p-6">
                <h3 className="text-lg font-semibold mb-4 text-[#2F1F12]" style={{ fontFamily: 'Fraunces, serif' }}>
                  Charges patronales du mois
                </h3>
                <table className="w-full text-sm">
                  <tbody>
                    {[
                      { l: 'CNSS employeur (16,57%)', v: paie.cnss_employeur, c: '#4A5D75' },
                      { l: 'TFP — Taxe Formation Prof. (2%)', v: paie.tfp, c: '#C89B3C' },
                      { l: 'FOPROLOS — logement social (1%)', v: paie.foprolos, c: '#7A8C6A' },
                    ].map((r) => (
                      <tr key={r.l} className="border-b border-[#EDE3CE]">
                        <td className="py-3 text-[#6B4E31]">{r.l}</td>
                        <td className="py-3 text-right font-mono font-semibold" style={{ color: r.c }}>
                          {r.v.toLocaleString('fr-FR', { minimumFractionDigits: 3 })} DT
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-[#FDF2ED]">
                      <td className="py-3 px-2 font-bold text-[#C8663D]">Total charges patronales</td>
                      <td className="py-3 px-2 text-right font-mono font-bold text-[#C8663D]">
                        {chargesSociales.toLocaleString('fr-FR', { minimumFractionDigits: 3 })} DT
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Détail retenues employés */}
              <div className="bg-white rounded-xl shadow-sm border border-[#EDE3CE] p-6">
                <h3 className="text-lg font-semibold mb-4 text-[#2F1F12]" style={{ fontFamily: 'Fraunces, serif' }}>
                  Retenues salariales du mois
                </h3>
                <table className="w-full text-sm">
                  <tbody>
                    {[
                      { l: 'CNSS employé (9,18%)', v: paie.cnss_employe },
                      { l: 'IRPP retenu à la source', v: paie.irpp_total },
                      { l: 'CSS (Contribution Sociale Solidarité)', v: paie.css_total },
                    ].map((r) => (
                      <tr key={r.l} className="border-b border-[#EDE3CE]">
                        <td className="py-3 text-[#6B4E31]">{r.l}</td>
                        <td className="py-3 text-right font-mono font-semibold text-[#B84A2F]">
                          {r.v.toLocaleString('fr-FR', { minimumFractionDigits: 3 })} DT
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-[#FBEBE4]">
                      <td className="py-3 px-2 font-bold text-[#B84A2F]">Total retenues</td>
                      <td className="py-3 px-2 text-right font-mono font-bold text-[#B84A2F]">
                        {totalRetenues.toLocaleString('fr-FR', { minimumFractionDigits: 3 })} DT
                      </td>
                    </tr>
                    <tr className="bg-[#EEF4F0]">
                      <td className="py-3 px-2 font-bold text-[#4A6C5B]">Net à payer total</td>
                      <td className="py-3 px-2 text-right font-mono font-bold text-[#4A6C5B]">
                        {paie.masse_nette.toLocaleString('fr-FR', { minimumFractionDigits: 3 })} DT
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {tab === 'cnss' && (
          <div className="bg-white rounded-xl shadow-sm border border-[#EDE3CE] p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-semibold" style={{ fontFamily: 'Fraunces, serif' }}>
                  Bordereau CNSS — T{trimestre} {annee}
                </h3>
                <p className="text-sm text-[#6B4E31] mt-1">
                  Déclaration trimestrielle à télédéclarer via <a className="text-[#C8663D] underline" href="https://www.cnss.tn" target="_blank" rel="noreferrer">www.cnss.tn</a>
                </p>
              </div>
              <button
                onClick={() =>
                  paieTunisieService.bordereauCNSS({ trimestre, annee }).catch(() => {})
                }
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#C8663D] text-white rounded text-sm hover:bg-[#B85528]"
              >
                <Download className="w-4 h-4" /> Générer PDF
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-[#EDF0F5] rounded-lg p-4 border border-[#4A5D75]/20">
                <div className="text-xs text-[#3B4E68] uppercase tracking-wide">N° employeur CNSS</div>
                <div className="font-mono font-bold text-lg text-[#4A5D75]">01-234567-89</div>
              </div>
              <div className="bg-[#EDF0F5] rounded-lg p-4 border border-[#4A5D75]/20">
                <div className="text-xs text-[#3B4E68] uppercase tracking-wide">Nombre de salariés</div>
                <div className="font-mono font-bold text-lg text-[#4A5D75]">{paie.nb_employes}</div>
              </div>
              <div className="bg-[#FBF3E0] rounded-lg p-4 border border-[#C89B3C]/40">
                <div className="text-xs text-[#8A6412] uppercase tracking-wide">Assiette cotisable trimestre</div>
                <div className="font-mono font-bold text-lg text-[#8A6412]">
                  {(paie.masse_brute * 3).toLocaleString('fr-FR', { minimumFractionDigits: 3 })} DT
                </div>
              </div>
              <div className="bg-[#FDF2ED] rounded-lg p-4 border border-[#C8663D]/40">
                <div className="text-xs text-[#C8663D] uppercase tracking-wide">Total cotisations dues (25,75%)</div>
                <div className="font-mono font-bold text-lg text-[#C8663D]">
                  {((paie.cnss_employeur + paie.cnss_employe) * 3).toLocaleString('fr-FR', {
                    minimumFractionDigits: 3,
                  })}{' '}
                  DT
                </div>
              </div>
            </div>

            <div className="mt-6 bg-[#F5EFE5] rounded-lg p-4 text-xs text-[#6B4E31]">
              <b>Rappel des taux CNSS :</b> régime général = 25,75% (part employeur 16,57% + part salarié 9,18%),
              plafond 6× SMIG mensuel = <span className="font-mono">2 749,44 DT</span> — Convention n°14
              (régime sans prestations en nature à long terme). Bordereau à déposer au plus tard le 25 du mois
              suivant la fin du trimestre.
            </div>
          </div>
        )}

        {tab === 'irpp' && (
          <div className="bg-white rounded-xl shadow-sm border border-[#EDE3CE] p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-semibold" style={{ fontFamily: 'Fraunces, serif' }}>
                  Déclaration IRPP annuelle — {annee}
                </h3>
                <p className="text-sm text-[#6B4E31] mt-1">
                  Retenues à la source · Barème progressif Tunisie 2024
                </p>
              </div>
              <button
                onClick={() => paieTunisieService.declarationIRPP({ annee }).catch(() => {})}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#C8663D] text-white rounded text-sm hover:bg-[#B85528]"
              >
                <Download className="w-4 h-4" /> Exporter déclaration
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#FDF2ED] text-left text-[11px] font-semibold text-[#6B4E31] uppercase tracking-wide">
                    <th className="px-4 py-3">Tranche annuelle (DT)</th>
                    <th className="px-4 py-3 text-right">Taux %</th>
                    <th className="px-4 py-3">Formule tranche</th>
                  </tr>
                </thead>
                <tbody>
                  {TRANCHES_IRPP.map((t, i) => (
                    <tr key={i} className="border-t border-[#EDE3CE]">
                      <td className="px-4 py-3 font-mono">
                        {t.min_dt.toLocaleString('fr-FR')} —{' '}
                        {t.max_dt ? t.max_dt.toLocaleString('fr-FR') : '∞'}
                      </td>
                      <td className="px-4 py-3 font-mono text-right font-bold text-[#C8663D]">
                        {t.taux_pct}%
                      </td>
                      <td className="px-4 py-3 text-xs text-[#6B4E31]">
                        (revenu net imposable − {t.min_dt.toLocaleString('fr-FR')}) × {t.taux_pct}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
              <div className="bg-[#EDF0F5] rounded-lg p-4">
                <div className="text-xs text-[#3B4E68]">IRPP mensuel retenu ({MOIS_FR[mois - 1]})</div>
                <div className="font-mono font-bold text-2xl text-[#4A5D75] mt-1">
                  {paie.irpp_total.toLocaleString('fr-FR', { minimumFractionDigits: 3 })} DT
                </div>
              </div>
              <div className="bg-[#FBF3E0] rounded-lg p-4">
                <div className="text-xs text-[#8A6412]">Projection IRPP annuel</div>
                <div className="font-mono font-bold text-2xl text-[#8A6412] mt-1">
                  {(paie.irpp_total * 12).toLocaleString('fr-FR', { minimumFractionDigits: 3 })} DT
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'grille' && (
          <div className="bg-white rounded-xl shadow-sm border border-[#EDE3CE] overflow-hidden">
            <div className="p-4 bg-[#F5EFE5] border-b border-[#EDE3CE]">
              <div className="text-sm font-semibold text-[#6B4E31]">
                Convention Collective Nationale Textile & Habillement · JORT N°49 (2024)
              </div>
              <div className="text-xs text-[#9B8874] mt-1">
                SMIG 40 h : 458,240 DT/mois · SMIG 48 h : 528,320 DT/mois · Majoration heures sup. 25% (jour) / 50% (nuit) / 75% (dimanche & férié)
              </div>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#FDF2ED] text-left text-[11px] font-semibold text-[#6B4E31] uppercase tracking-wide">
                  <th className="px-4 py-3">Coefficient</th>
                  <th className="px-4 py-3">Catégorie</th>
                  <th className="px-4 py-3">Libellé</th>
                  <th className="px-4 py-3 text-right">Salaire minimum (DT/mois)</th>
                </tr>
              </thead>
              <tbody>
                {GRILLE_SALAIRES.map((g) => (
                  <tr key={g.coeff} className="border-t border-[#EDE3CE] hover:bg-[#FBF8F3]">
                    <td className="px-4 py-3 font-mono text-xs text-[#4A5D75] font-semibold">{g.coeff}</td>
                    <td className="px-4 py-3 text-[#6B4E31]">{g.categorie}</td>
                    <td className="px-4 py-3 font-medium">{g.libelle}</td>
                    <td className="px-4 py-3 font-mono text-right font-bold text-[#C8663D]">
                      {g.salaire.toLocaleString('fr-FR', { minimumFractionDigits: 3 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaieTunisie;
