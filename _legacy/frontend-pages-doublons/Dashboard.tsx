import React, { useEffect, useState } from 'react';
import { dashboardService } from '../services/api';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Dashboard: React.FC = () => {
  const [kpis, setKpis] = useState<any>(null);
  const [productionStats, setProductionStats] = useState<any>(null);
  const [commandesStats, setCommandesStats] = useState<any>(null);
  const [alertes, setAlertes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [kpisRes, prodRes, cmdRes, alertesRes] = await Promise.all([
        dashboardService.getKPIs().catch(err => ({ data: { data: null } })),
        dashboardService.getProductionStats().catch(err => ({ data: { data: null } })),
        dashboardService.getCommandesStats().catch(err => ({ data: { data: null } })),
        dashboardService.getAlertes().catch(err => ({ data: { data: { alertes: [] } } }))
      ]);

      setKpis(kpisRes.data?.data || null);
      setProductionStats(prodRes.data?.data || null);
      setCommandesStats(cmdRes.data?.data || null);
      setAlertes(alertesRes.data?.data?.alertes || []);
    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
      // Ne pas bloquer l'affichage en cas d'erreur
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="ml-64 p-6">
        <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">📊 Dashboard</h1>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-gray-600 text-sm">OF en cours</div>
            <div className="text-3xl font-bold text-blue-600">{kpis?.of_en_cours || 0}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-gray-600 text-sm">Taux d'avancement</div>
            <div className="text-3xl font-bold text-green-600">{kpis?.taux_avancement?.toFixed(1) || 0}%</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-gray-600 text-sm">Délai moyen</div>
            <div className="text-3xl font-bold text-orange-600">{kpis?.delai_moyen_jours?.toFixed(1) || 0} jours</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-gray-600 text-sm">Taux de rebut</div>
            <div className="text-3xl font-bold text-red-600">{kpis?.taux_rebut?.toFixed(1) || 0}%</div>
          </div>
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Production par jour */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Production par jour</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={productionStats?.par_jour || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="jour" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="quantite" stroke="#0088FE" name="Quantité" />
                <Line type="monotone" dataKey="bonne" stroke="#00C49F" name="Bonne" />
                <Line type="monotone" dataKey="rebut" stroke="#FF8042" name="Rebut" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Production par machine */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Production par machine</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productionStats?.par_machine || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="numero_machine" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="quantite" fill="#0088FE" name="Quantité" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Commandes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Commandes par statut */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Commandes par statut</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={commandesStats?.par_statut || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {(commandesStats?.par_statut || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Top clients */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Top 10 Clients</h2>
            <div className="space-y-2">
              {(commandesStats?.top_clients || []).map((client: any, index: number) => (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="font-medium">{client.raison_sociale}</span>
                  <span className="text-blue-600 font-bold">{parseFloat(client.montant_total || 0).toFixed(2)} TND</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Alertes */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">🚨 Alertes Actives</h2>
          <div className="space-y-2">
            {alertes.length === 0 ? (
              <p className="text-gray-500">Aucune alerte active</p>
            ) : (
              alertes.map((alerte: any, index: number) => (
                <div key={index} className={`p-4 rounded border-l-4 ${alerte.couleur === 'red' ? 'border-red-500 bg-red-50' : alerte.couleur === 'orange' ? 'border-orange-500 bg-orange-50' : 'border-blue-500 bg-blue-50'}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold">{alerte.type_alerte}</h3>
                      <p className="text-sm text-gray-600">{alerte.message}</p>
                    </div>
                    <span className="text-xs text-gray-500">{new Date(alerte.date_creation).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
