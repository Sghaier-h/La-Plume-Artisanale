import React, { useEffect, useState } from 'react';
import api from '../services/api';

interface Opportunity {
  id?: number;
  id_opportunite?: number;
  nom: string;
  client_nom?: string;
  id_client?: number | null;
  montant_prevue?: number | string | null;
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

const CrmLeads: React.FC = () => {
  const [leads, setLeads] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/crm/opportunites', {
          params: { statut: 'nouveau,qualification' },
        });
        const all = normalizeList(res) as Opportunity[];
        const filtered = all.filter((o) => {
          const s = (o.statut || '').toLowerCase();
          return s === 'nouveau' || s === 'qualification' || s === 'qualifie' || s === 'qualifié';
        });
        setLeads(filtered);
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

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Pistes / Leads</h1>
        <p className="text-sm text-slate-500">
          Opportunités au statut <em>nouveau</em> ou <em>qualification</em>
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {leads.length === 0 ? (
          <div className="p-12 text-center text-slate-500">Aucune piste.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Nom</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Client</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Date création</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Statut</th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-700">Montant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leads.map((o) => (
                  <tr key={o.id ?? o.id_opportunite} className="hover:bg-slate-50 group">
                    <td className="px-4 py-3 font-medium text-slate-800">{o.nom}</td>
                    <td className="px-4 py-3 text-slate-600">{o.client_nom || '-'}</td>
                    <td className="px-4 py-3 text-slate-600">{fmtDate(o.created_at)}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                        {o.statut}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-emerald-700">
                      {toNum(o.montant_prevue).toFixed(2)} TND
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

export default CrmLeads;
