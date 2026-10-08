import React, { useEffect, useState } from 'react';
import { Download, Check } from 'lucide-react';
import PortailLayout from './PortailLayout';
import { portailData, downloadWithToken } from '../../services/portailApi';

const fmt = (n: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'TND', maximumFractionDigits: 3 }).format(n || 0);
const fmtDate = (d: any) => d ? new Date(d).toLocaleDateString('fr-FR') : '—';

const PortailDevis: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const load = async () => {
    setLoading(true);
    try { const r = await portailData.devis(); setItems(r.data.data?.devis || r.data.devis || []); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const accepter = async (id: number) => {
    if (!window.confirm('Confirmer l’acceptation de ce devis ?')) return;
    try { await portailData.accepterDevis(id); await load(); }
    catch (e: any) { alert(e?.response?.data?.error?.message || 'Erreur'); }
  };

  return (
    <PortailLayout>
      <div className="space-y-4">
        <h1 className="font-serif text-2xl text-stone-800">Mes devis</h1>
        <div className="bg-white rounded-xl border border-amber-200 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-amber-50 text-stone-700">
              <tr>
                <th className="text-left p-3">Numéro</th>
                <th className="text-left p-3">Date</th>
                <th className="text-left p-3">Validité</th>
                <th className="text-right p-3">Montant TTC</th>
                <th className="text-left p-3">Statut</th>
                <th className="text-right p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-50">
              {loading ? <tr><td colSpan={6} className="p-4 text-stone-500">Chargement…</td></tr> :
                items.length === 0 ? <tr><td colSpan={6} className="p-4 text-stone-500">Aucun devis</td></tr> :
                items.map(d => (
                  <tr key={d.id_devis} className="hover:bg-amber-50">
                    <td className="p-3 font-medium">{d.numero_devis || `DV-${d.id_devis}`}</td>
                    <td className="p-3">{fmtDate(d.date_devis)}</td>
                    <td className="p-3">{fmtDate(d.date_validite)}</td>
                    <td className="p-3 text-right">{fmt(d.montant_ttc)}</td>
                    <td className="p-3"><span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">{d.statut || '—'}</span></td>
                    <td className="p-3 text-right space-x-1">
                      <button onClick={() => downloadWithToken(portailData.devisPdfUrl(d.id_devis), `devis-${d.numero_devis || d.id_devis}.pdf`)}
                        className="p-2 rounded-lg text-amber-700 hover:bg-amber-100" title="PDF">
                        <Download className="w-4 h-4 inline" />
                      </button>
                      {!['ACCEPTE','REFUSE','TRANSFORME','ANNULE'].includes(d.statut || '') && (
                        <button onClick={() => accepter(d.id_devis)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs">
                          <Check className="w-3.5 h-3.5" /> Accepter
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </PortailLayout>
  );
};

export default PortailDevis;
