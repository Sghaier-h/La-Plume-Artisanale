import React, { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import PortailLayout from './PortailLayout';
import { portailData, downloadWithToken } from '../../services/portailApi';

const fmt = (n: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'TND', maximumFractionDigits: 3 }).format(n || 0);
const fmtDate = (d: any) => d ? new Date(d).toLocaleDateString('fr-FR') : '—';

const PortailFactures: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statut, setStatut] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try { const r = await portailData.factures(); setItems(r.data.data?.factures || r.data.factures || []); }
      finally { setLoading(false); }
    })();
  }, []);

  const filtered = items.filter(f => !statut || f.statut === statut);
  return (
    <PortailLayout>
      <div className="space-y-4">
        <h1 className="font-serif text-2xl text-stone-800">Mes factures</h1>
        <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-sm">
          <select value={statut} onChange={e => setStatut(e.target.value)} className="px-3 py-2 border border-stone-300 rounded-lg">
            <option value="">Tous statuts</option>
            <option value="BROUILLON">Brouillon</option>
            <option value="EMISE">Émise</option>
            <option value="PAYEE">Payée</option>
            <option value="EN_RETARD">En retard</option>
          </select>
        </div>
        <div className="bg-white rounded-xl border border-amber-200 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-amber-50 text-stone-700">
              <tr>
                <th className="text-left p-3">Numéro</th>
                <th className="text-left p-3">Date</th>
                <th className="text-left p-3">Échéance</th>
                <th className="text-right p-3">Montant TTC</th>
                <th className="text-right p-3">Restant</th>
                <th className="text-left p-3">Statut</th>
                <th className="text-right p-3">PDF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-50">
              {loading ? <tr><td colSpan={7} className="p-4 text-stone-500">Chargement…</td></tr> :
                filtered.length === 0 ? <tr><td colSpan={7} className="p-4 text-stone-500">Aucune facture</td></tr> :
                filtered.map(f => (
                  <tr key={f.id_facture} className="hover:bg-amber-50">
                    <td className="p-3 font-medium">{f.numero_facture || `FA-${f.id_facture}`}</td>
                    <td className="p-3">{fmtDate(f.date_facture)}</td>
                    <td className="p-3">{fmtDate(f.date_echeance)}</td>
                    <td className="p-3 text-right">{fmt(f.montant_ttc)}</td>
                    <td className="p-3 text-right">{fmt(f.montant_restant)}</td>
                    <td className="p-3"><span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">{f.statut || '—'}</span></td>
                    <td className="p-3 text-right">
                      <button onClick={() => downloadWithToken(portailData.facturePdfUrl(f.id_facture), `facture-${f.numero_facture || f.id_facture}.pdf`)}
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

export default PortailFactures;
