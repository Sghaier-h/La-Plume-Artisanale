import React, { useEffect, useState } from 'react';
import { Calculator, Book, Lock, Percent, Plus, Trash2 } from 'lucide-react';
import api from '../../services/api';

// §15 — Paramètres Comptabilité

interface Exercice { id: number; annee: number; date_debut: string; date_fin: string; statut: 'ouvert' | 'clos' | 'verrouille'; }
interface Journal { id: number; code: string; libelle: string; type: string; compte_contrepartie: string; }
interface TauxTva { id: number; code: string; libelle: string; taux_pct: number; compte_collecte: string; compte_deductible: string; }

const MOCK_EXERCICES: Exercice[] = [
  { id: 1, annee: 2024, date_debut: '2024-01-01', date_fin: '2024-12-31', statut: 'verrouille' },
  { id: 2, annee: 2025, date_debut: '2025-01-01', date_fin: '2025-12-31', statut: 'clos' },
  { id: 3, annee: 2026, date_debut: '2026-01-01', date_fin: '2026-12-31', statut: 'ouvert' },
];

const MOCK_JOURNAUX: Journal[] = [
  { id: 1, code: 'VE', libelle: 'Ventes', type: 'Vente', compte_contrepartie: '411' },
  { id: 2, code: 'AC', libelle: 'Achats', type: 'Achat', compte_contrepartie: '401' },
  { id: 3, code: 'BQ', libelle: 'Banque BIAT', type: 'Trésorerie', compte_contrepartie: '5121' },
  { id: 4, code: 'CA', libelle: 'Caisse', type: 'Trésorerie', compte_contrepartie: '5310' },
  { id: 5, code: 'OD', libelle: 'Opérations diverses', type: 'OD', compte_contrepartie: '—' },
  { id: 6, code: 'AN', libelle: 'À nouveau', type: 'AN', compte_contrepartie: '—' },
];

const MOCK_TVA: TauxTva[] = [
  { id: 1, code: 'TVA_19', libelle: 'TVA 19% (taux normal)', taux_pct: 19, compte_collecte: '43671', compte_deductible: '43661' },
  { id: 2, code: 'TVA_13', libelle: 'TVA 13% (taux réduit)', taux_pct: 13, compte_collecte: '43672', compte_deductible: '43662' },
  { id: 3, code: 'TVA_7', libelle: 'TVA 7% (taux minoré)', taux_pct: 7, compte_collecte: '43673', compte_deductible: '43663' },
  { id: 4, code: 'TVA_0', libelle: 'Exonéré / Export', taux_pct: 0, compte_collecte: '—', compte_deductible: '—' },
];

const STATUT_CFG = {
  ouvert: { color: '#4A6C5B', bg: '#EEF4F0', label: 'Ouvert' },
  clos: { color: '#8A6412', bg: 'color-mix(in srgb, var(--accent-gold) 15%, var(--bg-elevated))', label: 'Clos' },
  verrouille: { color: '#8A6E4A', bg: '#F0E7D4', label: 'Verrouillé' },
} as const;

const ParamComptabilite: React.FC = () => {
  const [exercices, setExercices] = useState<Exercice[]>(MOCK_EXERCICES);
  const [journaux, setJournaux] = useState<Journal[]>(MOCK_JOURNAUX);
  const [tvas, setTvas] = useState<TauxTva[]>(MOCK_TVA);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const r = await Promise.allSettled([
        api.get('/api/v2/parametres/compta/exercices'),
        api.get('/api/v2/parametres/compta/journaux'),
        api.get('/api/v2/parametres/compta/tva'),
      ]);
      if (cancelled) return;
      const pick = <T,>(res: PromiseSettledResult<any>, fb: T[]): T[] => {
        if (res.status !== 'fulfilled') return fb;
        const d = res.value?.data?.data ?? res.value?.data;
        return Array.isArray(d) ? d : fb;
      };
      setExercices(pick(r[0], MOCK_EXERCICES));
      setJournaux(pick(r[1], MOCK_JOURNAUX));
      setTvas(pick(r[2], MOCK_TVA));
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C8663D]" />
      </div>
    );
  }

  const cardCls = 'bg-white rounded-xl shadow-sm p-5 border border-[#E8DCC8]';
  const h2Style: React.CSSProperties = { fontFamily: 'var(--font-serif, Fraunces, serif)', fontWeight: 500, color: 'var(--fg-primary, #2F2A26)' };
  const thStyle: React.CSSProperties = { color: 'var(--fg-muted, #8A6E4A)' };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-app, #FBF8F3)' }}>
      <div className="p-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6">
            <div className="text-xs uppercase tracking-widest font-mono mb-2" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>§15 · Paramètres</div>
            <h1 className="text-3xl italic mb-1" style={h2Style}>Comptabilité</h1>
            <p className="text-sm" style={{ color: 'var(--fg-secondary, #5D4E42)' }}>Exercices, journaux, verrouillage périodes, taux TVA</p>
          </div>

          <div className="space-y-4">
            <div className={cardCls}>
              <h2 className="text-lg italic mb-4 flex items-center gap-2" style={h2Style}><Lock className="w-5 h-5" style={{ color: '#C8663D' }} /> Exercices comptables</h2>
              <table className="min-w-full text-sm">
                <thead><tr>
                  <th className="text-left pb-2 text-xs font-mono uppercase" style={thStyle}>Année</th>
                  <th className="text-left pb-2 text-xs font-mono uppercase" style={thStyle}>Période</th>
                  <th className="text-left pb-2 text-xs font-mono uppercase" style={thStyle}>Statut</th>
                  <th></th>
                </tr></thead>
                <tbody>{exercices.map(e => {
                  const st = STATUT_CFG[e.statut];
                  return (
                    <tr key={e.id} className="border-t" style={{ borderColor: '#F0E7D4' }}>
                      <td className="py-2 font-mono font-bold">{e.annee}</td>
                      <td className="py-2 text-xs font-mono">{e.date_debut} → {e.date_fin}</td>
                      <td className="py-2"><span className="inline-flex text-[10px] font-semibold px-2 py-0.5 rounded uppercase" style={{ backgroundColor: st.bg, color: st.color }}>{st.label}</span></td>
                      <td className="py-2 text-right">
                        {e.statut === 'ouvert' && (
                          <button className="text-xs px-2 py-1 rounded" style={{ backgroundColor: 'color-mix(in srgb, var(--accent-gold) 15%, var(--bg-elevated))', color: '#8A6412' }}>Clôturer</button>
                        )}
                      </td>
                    </tr>
                  );
                })}</tbody>
              </table>
              <button className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-white" style={{ backgroundColor: '#C8663D' }}><Plus className="w-4 h-4" /> Nouvel exercice</button>
            </div>

            <div className={cardCls}>
              <h2 className="text-lg italic mb-4 flex items-center gap-2" style={h2Style}><Book className="w-5 h-5" style={{ color: '#C8663D' }} /> Journaux comptables</h2>
              <table className="min-w-full text-sm">
                <thead><tr>
                  <th className="text-left pb-2 text-xs font-mono uppercase" style={thStyle}>Code</th>
                  <th className="text-left pb-2 text-xs font-mono uppercase" style={thStyle}>Libellé</th>
                  <th className="text-left pb-2 text-xs font-mono uppercase" style={thStyle}>Type</th>
                  <th className="text-left pb-2 text-xs font-mono uppercase" style={thStyle}>Contrepartie</th>
                  <th></th>
                </tr></thead>
                <tbody>{journaux.map(j => (
                  <tr key={j.id} className="border-t" style={{ borderColor: '#F0E7D4' }}>
                    <td className="py-2 font-mono font-bold">{j.code}</td>
                    <td className="py-2">{j.libelle}</td>
                    <td className="py-2 text-xs">{j.type}</td>
                    <td className="py-2 font-mono text-xs">{j.compte_contrepartie}</td>
                    <td className="py-2 text-right"><button onClick={() => setJournaux(journaux.filter(x => x.id !== j.id))} className="p-1 rounded hover:bg-red-50" style={{ color: '#B84A4A' }}><Trash2 className="w-4 h-4" /></button></td>
                  </tr>
                ))}</tbody>
              </table>
              <button className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-white" style={{ backgroundColor: '#C8663D' }}><Plus className="w-4 h-4" /> Nouveau journal</button>
            </div>

            <div className={cardCls}>
              <h2 className="text-lg italic mb-4 flex items-center gap-2" style={h2Style}><Percent className="w-5 h-5" style={{ color: '#C8663D' }} /> Taux TVA</h2>
              <table className="min-w-full text-sm">
                <thead><tr>
                  <th className="text-left pb-2 text-xs font-mono uppercase" style={thStyle}>Code</th>
                  <th className="text-left pb-2 text-xs font-mono uppercase" style={thStyle}>Libellé</th>
                  <th className="text-left pb-2 text-xs font-mono uppercase" style={thStyle}>Taux</th>
                  <th className="text-left pb-2 text-xs font-mono uppercase" style={thStyle}>Compte collecte</th>
                  <th className="text-left pb-2 text-xs font-mono uppercase" style={thStyle}>Compte déductible</th>
                </tr></thead>
                <tbody>{tvas.map(t => (
                  <tr key={t.id} className="border-t" style={{ borderColor: '#F0E7D4' }}>
                    <td className="py-2 font-mono text-xs">{t.code}</td>
                    <td className="py-2">{t.libelle}</td>
                    <td className="py-2 font-mono font-bold" style={{ color: '#C8663D' }}>{t.taux_pct}%</td>
                    <td className="py-2 font-mono text-xs">{t.compte_collecte}</td>
                    <td className="py-2 font-mono text-xs">{t.compte_deductible}</td>
                  </tr>
                ))}</tbody>
              </table>
              <button className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-white" style={{ backgroundColor: '#C8663D' }}><Plus className="w-4 h-4" /> Nouveau taux</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParamComptabilite;
