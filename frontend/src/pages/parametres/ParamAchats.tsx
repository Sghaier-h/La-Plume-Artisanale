import React, { useEffect, useState } from 'react';
import { ShoppingBag, Plus, Trash2, Users, FileCheck, Layers } from 'lucide-react';
import api from '../../services/api';

// §15 — Paramètres Achats

interface CategorieDepense { id: number; code: string; libelle: string; compte_compta: string; }
interface TypeContrat { id: number; code: string; libelle: string; duree_defaut_mois: number; }
interface SeuilValid { id: number; montant_max_dt: number; niveau_requis: string; role: string; }
interface EtapeWorkflow { id: number; ordre: number; role: string; libelle: string; obligatoire: boolean; }

const MOCK_CATEGORIES: CategorieDepense[] = [
  { id: 1, code: 'MP_COTON', libelle: 'Matière première coton', compte_compta: '601100' },
  { id: 2, code: 'MP_LIN', libelle: 'Matière première lin', compte_compta: '601200' },
  { id: 3, code: 'CONSOMMABLES', libelle: 'Consommables atelier', compte_compta: '602100' },
  { id: 4, code: 'FOURNITURES_BUR', libelle: 'Fournitures bureau', compte_compta: '606400' },
  { id: 5, code: 'PRESTATION_IT', libelle: 'Prestations IT', compte_compta: '622600' },
  { id: 6, code: 'TRANSPORT', libelle: 'Transport / logistique', compte_compta: '624100' },
];

const MOCK_CONTRATS: TypeContrat[] = [
  { id: 1, code: 'CONTRAT_MAINT', libelle: 'Contrat de maintenance', duree_defaut_mois: 12 },
  { id: 2, code: 'ABONNEMENT_SOFT', libelle: 'Abonnement logiciel SaaS', duree_defaut_mois: 12 },
  { id: 3, code: 'PRESTATION_ANN', libelle: 'Prestation annuelle', duree_defaut_mois: 12 },
  { id: 4, code: 'CONSEIL', libelle: 'Mission conseil ponctuelle', duree_defaut_mois: 3 },
];

const MOCK_SEUILS: SeuilValid[] = [
  { id: 1, montant_max_dt: 500, niveau_requis: 'Auto', role: 'Acheteur' },
  { id: 2, montant_max_dt: 5000, niveau_requis: 'Responsable achats', role: 'Resp. achats' },
  { id: 3, montant_max_dt: 25000, niveau_requis: 'Directeur financier', role: 'DAF' },
  { id: 4, montant_max_dt: 999999, niveau_requis: 'Direction générale', role: 'DG' },
];

const MOCK_WORKFLOW: EtapeWorkflow[] = [
  { id: 1, ordre: 1, role: 'Demandeur', libelle: 'Création demande d\'achat', obligatoire: true },
  { id: 2, ordre: 2, role: 'Manager', libelle: 'Validation manager équipe', obligatoire: true },
  { id: 3, ordre: 3, role: 'Achats', libelle: 'Consultation fournisseurs', obligatoire: true },
  { id: 4, ordre: 4, role: 'DAF', libelle: 'Validation budgétaire (si > 5k DT)', obligatoire: false },
  { id: 5, ordre: 5, role: 'DG', libelle: 'Signature DG (si > 25k DT)', obligatoire: false },
];

const ParamAchats: React.FC = () => {
  const [cats, setCats] = useState<CategorieDepense[]>(MOCK_CATEGORIES);
  const [contrats, setContrats] = useState<TypeContrat[]>(MOCK_CONTRATS);
  const [seuils, setSeuils] = useState<SeuilValid[]>(MOCK_SEUILS);
  const [workflow, setWorkflow] = useState<EtapeWorkflow[]>(MOCK_WORKFLOW);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const r = await Promise.allSettled([
        api.get('/api/v2/parametres/achats/categories'),
        api.get('/api/v2/parametres/achats/contrats'),
        api.get('/api/v2/parametres/achats/seuils'),
        api.get('/api/v2/parametres/achats/workflow'),
      ]);
      if (cancelled) return;
      const pick = <T,>(res: PromiseSettledResult<any>, fb: T[]): T[] => {
        if (res.status !== 'fulfilled') return fb;
        const d = res.value?.data?.data ?? res.value?.data;
        return Array.isArray(d) ? d : fb;
      };
      setCats(pick(r[0], MOCK_CATEGORIES));
      setContrats(pick(r[1], MOCK_CONTRATS));
      setSeuils(pick(r[2], MOCK_SEUILS));
      setWorkflow(pick(r[3], MOCK_WORKFLOW));
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
            <h1 className="text-3xl italic mb-1" style={h2Style}>Achats</h1>
            <p className="text-sm" style={{ color: 'var(--fg-secondary, #5D4E42)' }}>Catégories, contrats services, seuils validation, workflow approbation</p>
          </div>

          <div className="space-y-4">
            <div className={cardCls}>
              <h2 className="text-lg italic mb-4 flex items-center gap-2" style={h2Style}><Layers className="w-5 h-5" style={{ color: '#C8663D' }} /> Catégories de dépenses</h2>
              <table className="min-w-full text-sm">
                <thead><tr>
                  <th className="text-left pb-2 text-xs font-mono uppercase" style={thStyle}>Code</th>
                  <th className="text-left pb-2 text-xs font-mono uppercase" style={thStyle}>Libellé</th>
                  <th className="text-left pb-2 text-xs font-mono uppercase" style={thStyle}>Compte compta</th>
                  <th></th>
                </tr></thead>
                <tbody>{cats.map(c => (
                  <tr key={c.id} className="border-t" style={{ borderColor: '#F0E7D4' }}>
                    <td className="py-2 font-mono text-xs">{c.code}</td>
                    <td className="py-2">{c.libelle}</td>
                    <td className="py-2 font-mono text-xs">{c.compte_compta}</td>
                    <td className="py-2 text-right"><button onClick={() => setCats(cats.filter(x => x.id !== c.id))} className="p-1 rounded hover:bg-red-50" style={{ color: '#B84A4A' }}><Trash2 className="w-4 h-4" /></button></td>
                  </tr>
                ))}</tbody>
              </table>
              <button className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-white" style={{ backgroundColor: '#C8663D' }}><Plus className="w-4 h-4" /> Nouvelle catégorie</button>
            </div>

            <div className={cardCls}>
              <h2 className="text-lg italic mb-4 flex items-center gap-2" style={h2Style}><ShoppingBag className="w-5 h-5" style={{ color: '#C8663D' }} /> Types de contrats services</h2>
              <table className="min-w-full text-sm">
                <thead><tr>
                  <th className="text-left pb-2 text-xs font-mono uppercase" style={thStyle}>Code</th>
                  <th className="text-left pb-2 text-xs font-mono uppercase" style={thStyle}>Libellé</th>
                  <th className="text-left pb-2 text-xs font-mono uppercase" style={thStyle}>Durée (mois)</th>
                  <th></th>
                </tr></thead>
                <tbody>{contrats.map(c => (
                  <tr key={c.id} className="border-t" style={{ borderColor: '#F0E7D4' }}>
                    <td className="py-2 font-mono text-xs">{c.code}</td>
                    <td className="py-2">{c.libelle}</td>
                    <td className="py-2 font-mono">{c.duree_defaut_mois}</td>
                    <td className="py-2 text-right"><button onClick={() => setContrats(contrats.filter(x => x.id !== c.id))} className="p-1 rounded hover:bg-red-50" style={{ color: '#B84A4A' }}><Trash2 className="w-4 h-4" /></button></td>
                  </tr>
                ))}</tbody>
              </table>
              <button className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-white" style={{ backgroundColor: '#C8663D' }}><Plus className="w-4 h-4" /> Nouveau type</button>
            </div>

            <div className={cardCls}>
              <h2 className="text-lg italic mb-4 flex items-center gap-2" style={h2Style}><Users className="w-5 h-5" style={{ color: '#C8663D' }} /> Seuils de validation</h2>
              <table className="min-w-full text-sm">
                <thead><tr>
                  <th className="text-left pb-2 text-xs font-mono uppercase" style={thStyle}>Jusqu'à</th>
                  <th className="text-left pb-2 text-xs font-mono uppercase" style={thStyle}>Niveau requis</th>
                  <th className="text-left pb-2 text-xs font-mono uppercase" style={thStyle}>Rôle</th>
                </tr></thead>
                <tbody>{seuils.map((s, i) => (
                  <tr key={s.id} className="border-t" style={{ borderColor: '#F0E7D4' }}>
                    <td className="py-2 font-mono">{s.montant_max_dt >= 999999 ? '∞' : s.montant_max_dt.toLocaleString('fr-FR') + ' DT'}</td>
                    <td className="py-2">{s.niveau_requis}</td>
                    <td className="py-2 text-xs uppercase font-mono" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>{s.role}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>

            <div className={cardCls}>
              <h2 className="text-lg italic mb-4 flex items-center gap-2" style={h2Style}><FileCheck className="w-5 h-5" style={{ color: '#C8663D' }} /> Workflow d'approbation multi-niveaux</h2>
              <ol className="space-y-2">{workflow.map(w => (
                <li key={w.id} className="flex items-center gap-3 p-3 rounded border" style={{ borderColor: '#E8DCC8', backgroundColor: 'var(--bg-app, #FBF8F3)' }}>
                  <span className="inline-flex w-8 h-8 items-center justify-center rounded-full text-sm font-bold" style={{ backgroundColor: 'color-mix(in srgb, var(--accent-terracotta) 15%, var(--bg-elevated))', color: '#C8663D' }}>{w.ordre}</span>
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{w.libelle}</div>
                    <div className="text-xs" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>Rôle : {w.role}</div>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase ${w.obligatoire ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                    {w.obligatoire ? 'Obligatoire' : 'Conditionnel'}
                  </span>
                </li>
              ))}</ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParamAchats;
