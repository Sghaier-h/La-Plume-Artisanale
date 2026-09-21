import React from 'react';
import { Users, ShoppingCart, FileText, Receipt, Settings, Activity } from 'lucide-react';
import { useDashboardKpis } from '../hooks/useDashboardKpis';

interface KpiCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon: React.ReactNode;
  color: string;
}

const KpiCard: React.FC<KpiCardProps> = ({ label, value, subValue, icon, color }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</span>
      <div className={`p-2 rounded-lg ${color}`}>{icon}</div>
    </div>
    <div className="text-2xl font-bold text-gray-900">{value}</div>
    {subValue && <div className="text-xs text-gray-500 mt-1">{subValue}</div>}
  </div>
);

/**
 * Bannière KPI temps réel connectée à l'API /api/dashboard/kpis-admin
 * Rafraîchissement automatique toutes les 30s
 */
export const KpiBanner: React.FC = () => {
  const { kpis, loading, error, refresh } = useDashboardKpis(30000);

  if (loading && !kpis) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="bg-gray-100 rounded-lg h-24 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-red-800">
          ⚠️ Impossible de charger les KPIs : {error}
        </p>
        <button
          onClick={refresh}
          className="mt-2 text-xs text-red-700 underline hover:text-red-900"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (!kpis) return null;

  const formatMoney = (val: string) => {
    const num = parseFloat(val || '0');
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND',
      maximumFractionDigits: 0
    }).format(num);
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      <KpiCard
        label="Clients actifs"
        value={kpis.clients.total_actifs}
        subValue={`${kpis.clients.clients} clients / ${kpis.clients.prospects} prospects`}
        icon={<Users className="w-5 h-5 text-white" />}
        color="bg-blue-500"
      />
      <KpiCard
        label="Commandes"
        value={kpis.commandes.total}
        subValue={`${kpis.commandes.en_attente} en attente`}
        icon={<ShoppingCart className="w-5 h-5 text-white" />}
        color="bg-orange-500"
      />
      <KpiCard
        label="Devis"
        value={kpis.devis.total}
        subValue={`${kpis.devis.transformes} transformés`}
        icon={<FileText className="w-5 h-5 text-white" />}
        color="bg-purple-500"
      />
      <KpiCard
        label="Factures"
        value={kpis.factures.total}
        subValue={`${kpis.factures.payees} payées`}
        icon={<Receipt className="w-5 h-5 text-white" />}
        color="bg-green-500"
      />
      <KpiCard
        label="CA 30 derniers jours"
        value={formatMoney(kpis.commandes.ca_30j)}
        subValue="Commandes"
        icon={<Activity className="w-5 h-5 text-white" />}
        color="bg-emerald-600"
      />
      <KpiCard
        label="OF en cours"
        value={kpis.ordres_fabrication.en_cours}
        subValue={`${kpis.ordres_fabrication.total} total`}
        icon={<Settings className="w-5 h-5 text-white" />}
        color="bg-indigo-500"
      />
    </div>
  );
};

export default KpiBanner;
