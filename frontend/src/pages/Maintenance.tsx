import React, { useState, useEffect } from 'react';
import { maintenanceService } from '../services/api';
import { Wrench, AlertTriangle, Calendar, PlusCircle, CheckCircle, Clock } from 'lucide-react';

const Maintenance: React.FC = () => {
  const [interventions, setInterventions] = useState<any[]>([]);
  const [alertes, setAlertes] = useState<any[]>([]);
  const [planification, setPlanification] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'interventions' | 'alertes' | 'planification'>('interventions');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [interventionsRes, alertesRes, planificationRes] = await Promise.all([
        maintenanceService.getInterventions(),
        maintenanceService.getAlertes({ lue: 'false' }),
        maintenanceService.getPlanification()
      ]);

      setInterventions(interventionsRes.data.data.interventions || []);
      setAlertes(alertesRes.data.data || []);
      setPlanification(planificationRes.data.data || []);
    } catch (error) {
      console.error('Erreur chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'TERMINEE': return 'bg-green-100 text-green-800';
      case 'EN_COURS': return 'bg-blue-100 text-blue-800';
      case 'PLANIFIEE': return 'bg-yellow-100 text-yellow-800';
      case 'ANNULEE': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
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
            <Wrench className="w-8 h-8" />
            Maintenance
          </h1>
          <button
            onClick={() => {/* TODO: Modal création */}}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <PlusCircle className="w-5 h-5" />
            Nouvelle Intervention
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b">
          <button
            onClick={() => setActiveTab('interventions')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'interventions'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Interventions ({interventions.length})
          </button>
          <button
            onClick={() => setActiveTab('alertes')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'alertes'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Alertes ({alertes.length})
          </button>
          <button
            onClick={() => setActiveTab('planification')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'planification'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Planification ({planification.length})
          </button>
        </div>

        {/* Contenu */}
        {activeTab === 'interventions' && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Numéro</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Machine</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {interventions.map((intervention: any) => (
                  <tr key={intervention.id_intervention}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {intervention.numero_intervention}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {intervention.numero_machine || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {intervention.type_intervention}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {new Date(intervention.date_planification).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs ${getStatutColor(intervention.statut)}`}>
                        {intervention.statut}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button className="text-blue-600 hover:text-blue-800">Voir</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'alertes' && (
          <div className="space-y-4">
            {alertes.map((alerte: any) => (
              <div
                key={alerte.id_alerte}
                className={`p-4 rounded-lg border-l-4 ${
                  alerte.priorite === 1
                    ? 'bg-red-50 border-red-500'
                    : alerte.priorite === 2
                    ? 'bg-yellow-50 border-yellow-500'
                    : 'bg-blue-50 border-blue-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className={`w-5 h-5 ${
                        alerte.priorite === 1 ? 'text-red-600' : 'text-yellow-600'
                      }`} />
                      <span className="font-semibold">{alerte.type_alerte}</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        alerte.priorite === 1
                          ? 'bg-red-200 text-red-800'
                          : 'bg-yellow-200 text-yellow-800'
                      }`}>
                        {alerte.priorite === 1 ? 'URGENT' : 'NORMAL'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{alerte.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Machine: {alerte.numero_machine || 'N/A'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                      Traiter
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'planification' && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Machine</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dernière</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prochaine</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {planification.map((plan: any) => (
                  <tr key={plan.id_planification}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {plan.numero_machine}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {plan.type_maintenance_libelle}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {plan.date_derniere ? new Date(plan.date_derniere).toLocaleDateString('fr-FR') : 'Jamais'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {new Date(plan.date_prochaine).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {plan.en_retard ? (
                        <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-800">
                          En retard ({plan.jours_retard} jours)
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800">
                          À jour
                        </span>
                      )}
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

export default Maintenance;
