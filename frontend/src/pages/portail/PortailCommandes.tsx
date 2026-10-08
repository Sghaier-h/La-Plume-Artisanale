import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Search } from 'lucide-react';
import PortailLayout from './PortailLayout';
import { portailData } from '../../services/portailApi';

const fmt = (n: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'TND', maximumFractionDigits: 3 }).format(n || 0);
const fmtDate = (d: any) => d ? new Date(d).toLocaleDateString('fr-FR') : '—';

const PortailCommandes: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [statut, setStatut] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const r = await portailData.commandes(statut ? { statut } : undefined);
        setItems(r.data.data?.commandes || r.data.commandes || []);
      } finally { setLoading(false); }
    })();
  }, [statut]);

  const filtered = items.filter(c =>
    !q || (c.numero_commande || '').toLowerCase().includes(q.toLowerCase())
  );

  return (
    <PortailLayout>
      <div className="space-y-4">
        <h1 className="font-serif text-2xl text-stone-800">Mes commandes</h1>
        <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-sm flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Rechercher un numéro…"
              className="w-full pl-9 pr-3 py-2 border border-stone-300 rounded-lg" />
          </div>
          <select value={statut} onChange={e=>setStatut(e.target.value)}
            className="px-3 py-2 border border-stone-300 rounded-lg">
            <option value="">Tous statuts</option>
            <option value="BROUILLON">Brouillon</option>
            <option value="CONFIRMEE">Confirmée</option>
            <option value="EN_COURS">En cours</option>
            <option value="LIVREE">Livrée</option>
            <option value="ANNULEE">Annulée</option>
          </select>
        </div>

        <div className="bg-white rounded-xl border border-amber-200 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-amber-50 text-stone-700">
              <tr>
                <th className="text-left p-3">Numéro</th>
                <th className="text-left p-3">Date</th>
                <th className="text-left p-3">Livraison prévue</th>
                <th className="text-right p-3">Montant TTC</th>
                <th className="text-left p-3">Statut</th>
                <th className="text-right p-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-50">
              {loading ? <tr><td colSpan={6} className="p-4 text-stone-500">Chargement…</td></tr> :
                filtered.length === 0 ? <tr><td colSpan={6} className="p-4 text-stone-500">Aucune commande</td></tr> :
                filtered.map(c => (
                  <tr key={c.id_commande} className="hover:bg-amber-50">
                    <td className="p-3 font-medium">{c.numero_commande || `CMD-${c.id_commande}`}</td>
                    <td className="p-3">{fmtDate(c.date_commande)}</td>
                    <td className="p-3">{fmtDate(c.date_livraison_prevue)}</td>
                    <td className="p-3 text-right">{fmt(c.montant_ttc || c.montant_total)}</td>
                    <td className="p-3"><span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">{c.statut || '—'}</span></td>
                    <td className="p-3 text-right">
                      <Link to={`/portail/commandes/${c.id_commande}`} className="inline-flex items-center gap-1 text-amber-700 hover:underline">
                        <Eye className="w-4 h-4" /> Détail
                      </Link>
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

export default PortailCommandes;
