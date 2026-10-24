import React, { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import PortailLayout from './PortailLayout';
import { portailData, downloadWithToken } from '../../services/portailApi';

const fmtDate = (d: any) => d ? new Date(d).toLocaleDateString('fr-FR') : '—';

const PortailBL: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      try { const r = await portailData.bl(); setItems(r.data.data?.bons_livraison || r.data.bons_livraison || []); }
      finally { setLoading(false); }
    })();
  }, []);

  return (
    <PortailLayout>
      <div className="space-y-4">
        <h1 className="font-serif text-2xl text-stone-800">Mes bons de livraison</h1>
        <div className="bg-white rounded-xl border border-amber-200 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-amber-50 text-stone-700">
              <tr>
                <th className="text-left p-3">Numéro</th>
                <th className="text-left p-3">Commande liée</th>
                <th className="text-left p-3">Date</th>
                <th className="text-left p-3">Livraison</th>
                <th className="text-left p-3">Statut</th>
                <th className="text-right p-3">PDF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-50">
              {loading ? <tr><td colSpan={6} className="p-4 text-stone-500">Chargement…</td></tr> :
                items.length === 0 ? <tr><td colSpan={6} className="p-4 text-stone-500">Aucun BL</td></tr> :
                items.map(b => (
                  <tr key={b.id_bl} className="hover:bg-amber-50">
                    <td className="p-3 font-medium">{b.numero_bl || `BL-${b.id_bl}`}</td>
                    <td className="p-3">{b.numero_commande || '—'}</td>
                    <td className="p-3">{fmtDate(b.date_bl)}</td>
                    <td className="p-3">{fmtDate(b.date_livraison)}</td>
                    <td className="p-3"><span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">{b.statut || '—'}</span></td>
                    <td className="p-3 text-right">
                      <button onClick={() => downloadWithToken(portailData.blPdfUrl(b.id_bl), `bl-${b.numero_bl || b.id_bl}.pdf`)}
                        className="p-2 rounded-lg text-amber-700 hover:bg-amber-100">
                        <Download className="w-4 h-4" />
                      </button>
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

export default PortailBL;
