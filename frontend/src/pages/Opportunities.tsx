import React, { useEffect, useState } from 'react';
import api from '../services/api';

interface Opportunity {
  id?: number;
  id_opportunite?: number;
  nom: string;
  client_nom?: string;
  id_client?: number | null;
  montant_prevue?: number | string | null;
  probabilite?: number | string | null;
  statut?: string;
  created_at?: string | null;
  date_fermeture_prevue?: string | null;
}

const normalizeList = (res: any): any[] => {
  const _r = res?.data?.data;
  if (Array.isArray(_r)) return _r;
  if (_r?.data && Array.isArray(_r.data)) return _r.data;
  if (Array.isArray(res?.data)) return res.data;
  return [];
};

const toNum = (v: any): number => {
  const n = typeof v === 'number' ? v : parseFloat(v);
  return Number.isFinite(n) ? n : 0;
};

const fmtDate = (d?: string | null): string => {
  if (!d) return '-';
  try {
    return new Date(d).toLocaleDateString('fr-FR');
  } catch {
    return String(d);
  }
};

const statutColor = (statut?: string): string => {
  const s = (statut || '').toLowerCase();
  if (s.includes('gagn')) return 'bg-emerald-100 text-emerald-800';
  if (s.includes('perdu')) return 'bg-red-100 text-red-800';
  if (s.includes('nouveau')) return 'bg-[#E8EFF6] text-[#4A5D75]';
  if (s.includes('negoc') || s.includes('négoc')) return 'bg-[#F0E9DA] text-[#6B4E31]';
  return 'bg-amber-100 text-amber-800';
};

const Opportunities: React.FC = () => {
  const [items, setItems] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/crm/opportunites');
        setItems(normalizeList(res) as Opportunity[]);
      } catch (e: any) {
        setError(e?.response?.data?.error?.message || e?.message || 'Erreur de chargement');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  const totalMontant = items.reduce((s, o) => s + toNum(o.montant_prevue), 0);

  return (
    <div className="p-6">
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Opportunités</h1>
          <p className="text-sm text-slate-500">Toutes les opportunités CRM</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-white rounded-lg border border-slate-200 px-4 py-2">
            <p className="text-xs text-slate-500">Total</p>
            <p className="font-semibold text-slate-800">{items.length}</p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 px-4 py-2">
            <p className="text-xs text-slate-500">Montant total</p>
            <p className="font-semibold text-emerald-700">{totalMontant.toFixed(2)} TND</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {items.length === 0 ? (
          <div className="p-12 text-center text-slate-500">Aucune opportunité.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Nom</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Client</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Statut</th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-700">Montant</th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-700">Probabilité</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Fermeture prévue</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Créée le</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((o) => (
                  <tr key={o.id ?? o.id_opportunite} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800">{o.nom}</td>
                    <td className="px-4 py-3 text-slate-600">{o.client_nom || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statutColor(o.statut)}`}>
                        {o.statut}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-emerald-700">
                      {toNum(o.montant_prevue).toFixed(2)} TND
                    </td>
                    <td className="px-4 py-3 text-right text-slate-600">
                      {toNum(o.probabilite).toFixed(0)}%
                    </td>
                    <td className="px-4 py-3 text-slate-600">{fmtDate(o.date_fermeture_prevue)}</td>
                    <td className="px-4 py-3 text-slate-600">{fmtDate(o.created_at)}</td>
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

export default Opportunities;
