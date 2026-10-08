import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import PortailLayout from './PortailLayout';
import { portailData } from '../../services/portailApi';

const fmt = (n: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'TND', maximumFractionDigits: 3 }).format(n || 0);
const fmtDate = (d: any) => d ? new Date(d).toLocaleDateString('fr-FR') : '—';

const PortailCommandeDetail: React.FC = () => {
  const { id = '' } = useParams();
  const [cmd, setCmd] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const r = await portailData.commande(id);
        setCmd(r.data.data || r.data);
      } catch (e: any) { setError(e?.response?.data?.error?.message || 'Erreur'); }
      finally { setLoading(false); }
    })();
  }, [id]);

  return (
    <PortailLayout>
      <div className="space-y-4">
        <Link to="/portail/commandes" className="inline-flex items-center gap-1 text-amber-700 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Retour
        </Link>
        {loading ? <div className="text-stone-500">Chargement…</div> : error ? <div className="text-red-700">{error}</div> : cmd && (
          <>
            <div className="bg-white rounded-xl border border-amber-200 shadow-sm p-6">
              <div className="flex flex-wrap justify-between gap-4">
                <div>
                  <h1 className="font-serif text-2xl text-stone-800">{cmd.numero_commande || `CMD-${cmd.id_commande}`}</h1>
                  <div className="text-sm text-stone-500">Commande du {fmtDate(cmd.date_commande)}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-stone-500">Total TTC</div>
                  <div className="text-2xl font-semibold text-amber-800">{fmt(cmd.montant_ttc || cmd.montant_total)}</div>
                  <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">{cmd.statut || '—'}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-amber-200 shadow-sm overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-amber-50 text-stone-700">
                  <tr>
                    <th className="text-left p-3">Article</th>
                    <th className="text-right p-3">Qté</th>
                    <th className="text-right p-3">PU</th>
                    <th className="text-right p-3">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-50">
                  {(cmd.lignes || []).length === 0 ?
                    <tr><td colSpan={4} className="p-4 text-stone-500">Aucune ligne</td></tr> :
                    (cmd.lignes || []).map((l: any) => (
                      <tr key={l.id_ligne}>
                        <td className="p-3">{l.designation || l.libelle || l.reference || '—'}</td>
                        <td className="p-3 text-right">{l.quantite}</td>
                        <td className="p-3 text-right">{fmt(l.prix_unitaire)}</td>
                        <td className="p-3 text-right">{fmt(l.montant_ttc || l.total_ttc || (l.quantite * l.prix_unitaire))}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </PortailLayout>
  );
};

export default PortailCommandeDetail;
