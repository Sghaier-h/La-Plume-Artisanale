import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, FileText, AlertTriangle, MessageSquare, Download, Plus } from 'lucide-react';
import PortailLayout from './PortailLayout';
import { portailData, downloadWithToken } from '../../services/portailApi';

const KpiCard: React.FC<{ icon: any; label: string; value: string; color: string }> = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white rounded-xl border border-amber-200 shadow-sm p-4 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}><Icon className="w-6 h-6 text-white" /></div>
    <div>
      <div className="text-xs text-stone-500 uppercase tracking-wide">{label}</div>
      <div className="text-xl font-semibold text-stone-800">{value}</div>
    </div>
  </div>
);

const fmt = (n: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'TND', maximumFractionDigits: 3 }).format(n || 0);
const fmtDate = (d: any) => d ? new Date(d).toLocaleDateString('fr-FR') : '—';

const PortailDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>({});
  const [commandes, setCommandes] = useState<any[]>([]);
  const [factures, setFactures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [s, c, f] = await Promise.all([portailData.stats(), portailData.commandes(), portailData.factures()]);
        setStats(s.data.data || s.data);
        setCommandes((c.data.data?.commandes || c.data.commandes || []).slice(0, 5));
        setFactures((f.data.data?.factures || f.data.factures || []).slice(0, 5));
      } finally { setLoading(false); }
    })();
  }, []);

  return (
    <PortailLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-serif text-2xl text-stone-800">Bienvenue sur votre espace</h1>
          <Link to="/portail/demandes" className="inline-flex items-center gap-2 bg-amber-700 hover:bg-amber-800 text-white px-4 py-2 rounded-lg shadow">
            <Plus className="w-4 h-4" /> Nouvelle demande
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard icon={ShoppingBag} label="Commandes" value={String(stats.total_commandes ?? 0)} color="bg-amber-600" />
          <KpiCard icon={FileText} label="CA (année)" value={fmt(stats.ca_annee)} color="bg-emerald-600" />
          <KpiCard icon={AlertTriangle} label="Factures impayées" value={`${stats.factures_impayees_count ?? 0} — ${fmt(stats.factures_impayees_montant)}`} color="bg-red-600" />
          <KpiCard icon={MessageSquare} label="Demandes en cours" value={String(stats.demandes_en_cours ?? 0)} color="bg-slate-600" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-amber-200 shadow-sm">
            <div className="px-4 py-3 border-b border-amber-100 flex items-center justify-between">
              <h2 className="font-semibold text-stone-800">Dernières commandes</h2>
              <Link to="/portail/commandes" className="text-sm text-amber-700 hover:underline">Tout voir</Link>
            </div>
            <div className="divide-y divide-amber-50">
              {loading ? <div className="p-4 text-stone-500 text-sm">Chargement…</div> :
                commandes.length === 0 ? <div className="p-4 text-stone-500 text-sm">Aucune commande</div> :
                commandes.map((c) => (
                  <Link key={c.id_commande} to={`/portail/commandes/${c.id_commande}`}
                    className="flex items-center justify-between p-3 hover:bg-amber-50 transition">
                    <div>
                      <div className="font-medium text-stone-800">{c.numero_commande || `CMD-${c.id_commande}`}</div>
                      <div className="text-xs text-stone-500">{fmtDate(c.date_commande)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-stone-800">{fmt(c.montant_ttc || c.montant_total)}</div>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">{c.statut || '—'}</span>
                    </div>
                  </Link>
                ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-amber-200 shadow-sm">
            <div className="px-4 py-3 border-b border-amber-100 flex items-center justify-between">
              <h2 className="font-semibold text-stone-800">Dernières factures</h2>
              <Link to="/portail/factures" className="text-sm text-amber-700 hover:underline">Tout voir</Link>
            </div>
            <div className="divide-y divide-amber-50">
              {loading ? <div className="p-4 text-stone-500 text-sm">Chargement…</div> :
                factures.length === 0 ? <div className="p-4 text-stone-500 text-sm">Aucune facture</div> :
                factures.map((f) => (
                  <div key={f.id_facture} className="flex items-center justify-between p-3 hover:bg-amber-50 transition">
                    <div>
                      <div className="font-medium text-stone-800">{f.numero_facture || `FA-${f.id_facture}`}</div>
                      <div className="text-xs text-stone-500">{fmtDate(f.date_facture)}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-semibold text-stone-800">{fmt(f.montant_ttc)}</div>
                      <button onClick={() => downloadWithToken(portailData.facturePdfUrl(f.id_facture), `facture-${f.numero_facture || f.id_facture}.pdf`)}
                        className="p-2 rounded-lg text-amber-700 hover:bg-amber-100" title="PDF">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </PortailLayout>
  );
};

export default PortailDashboard;
