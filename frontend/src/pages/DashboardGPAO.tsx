import React, { useState, useEffect } from 'react';
import { maintenanceService, planificationGanttService } from '../services/api';
import { 
  LayoutDashboard, Wrench, AlertTriangle, Calendar, TrendingUp, 
  Package, Users, Clock, CheckCircle, XCircle, Activity
} from 'lucide-react';

const DashboardGPAO: React.FC = () => {
  const [stats, setStats] = useState({
    interventions: { total: 0, en_cours: 0, planifiees: 0 },
    alertes: { total: 0, urgentes: 0 },
    taches: { total: 0, en_cours: 0, terminees: 0 },
    machines: { operationnelles: 0, en_maintenance: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [alertes, setAlertes] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [interventionsRes, alertesRes, tachesRes] = await Promise.all([
        maintenanceService.getInterventions(),
        maintenanceService.getAlertes({ lue: 'false' }),
        planificationGanttService.getTaches()
      ]);

      const interventions = interventionsRes.data.data.interventions || [];
      const alertesData = alertesRes.data.data || [];
      const taches = tachesRes.data.data.taches || [];

      setStats({
        interventions: {
          total: interventions.length,
          en_cours: interventions.filter((i: any) => i.statut === 'EN_COURS').length,
          planifiees: interventions.filter((i: any) => i.statut === 'PLANIFIEE').length
        },
        alertes: {
          total: alertesData.length,
          urgentes: alertesData.filter((a: any) => a.priorite === 1).length
        },
        taches: {
          total: taches.length,
          en_cours: taches.filter((t: any) => t.statut === 'EN_COURS').length,
          terminees: taches.filter((t: any) => t.statut === 'TERMINEE').length
        },
        machines: {
          operationnelles: 0, // TODO: Récupérer depuis API machines
          en_maintenance: interventions.filter((i: any) => i.statut === 'EN_COURS').length
        }
      });

      setAlertes(alertesData.slice(0, 5));
    } catch (error) {
      console.error('Erreur chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="ml-64 p-6 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="ml-64 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <LayoutDashboard className="w-8 h-8" />
            Dashboard GPAO
          </h1>
        </div>

        {/* Indicateurs clés */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Interventions */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Interventions</p>
                <p className="text-3xl font-bold text-gray-800">{stats.interventions.total}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.interventions.en_cours} en cours
                </p>
              </div>
              <Wrench className="w-12 h-12 text-blue-600" />
            </div>
          </div>

          {/* Alertes */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Alertes</p>
                <p className="text-3xl font-bold text-gray-800">{stats.alertes.total}</p>
                <p className="text-xs text-red-500 mt-1">
                  {stats.alertes.urgentes} urgentes
                </p>
              </div>
              <AlertTriangle className="w-12 h-12 text-red-600" />
            </div>
          </div>

          {/* Tâches */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Tâches</p>
                <p className="text-3xl font-bold text-gray-800">{stats.taches.total}</p>
                <p className="text-xs text-green-500 mt-1">
                  {stats.taches.terminees} terminées
                </p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </div>

          {/* Machines */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Machines</p>
                <p className="text-3xl font-bold text-gray-800">{stats.machines.operationnelles}</p>
                <p className="text-xs text-orange-500 mt-1">
                  {stats.machines.en_maintenance} en maintenance
                </p>
              </div>
              <Activity className="w-12 h-12 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Alertes urgentes */}
        {alertes.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              Alertes Urgentes
            </h2>
            <div className="space-y-2">
              {alertes.map((alerte: any) => (
                <div
                  key={alerte.id_alerte}
                  className={`p-3 rounded-lg border-l-4 ${
                    alerte.priorite === 1 ? 'bg-red-50 border-red-500' : 'bg-yellow-50 border-yellow-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{alerte.type_alerte}</p>
                      <p className="text-sm text-gray-600">{alerte.message}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      alerte.priorite === 1 ? 'bg-red-200 text-red-800' : 'bg-yellow-200 text-yellow-800'
                    }`}>
                      {alerte.priorite === 1 ? 'URGENT' : 'NORMAL'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Graphiques et statistiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Progression tâches */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Progression Tâches</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Tâches terminées</span>
                  <span className="text-sm font-semibold">
                    {stats.taches.total > 0 
                      ? Math.round((stats.taches.terminees / stats.taches.total) * 100) 
                      : 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{
                      width: `${stats.taches.total > 0 ? (stats.taches.terminees / stats.taches.total) * 100 : 0}%`
                    }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Tâches en cours</span>
                  <span className="text-sm font-semibold">
                    {stats.taches.total > 0 
                      ? Math.round((stats.taches.en_cours / stats.taches.total) * 100) 
                      : 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${stats.taches.total > 0 ? (stats.taches.en_cours / stats.taches.total) * 100 : 0}%`
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Statut interventions */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Statut Interventions</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">En cours</span>
                </div>
                <span className="font-bold text-blue-600">{stats.interventions.en_cours}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-yellow-600" />
                  <span className="font-medium">Planifiées</span>
                </div>
                <span className="font-bold text-yellow-600">{stats.interventions.planifiees}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium">Terminées</span>
                </div>
                <span className="font-bold text-green-600">
                  {stats.interventions.total - stats.interventions.en_cours - stats.interventions.planifiees}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardGPAO;
