import React, { useState, useEffect } from 'react';
import { planificationGanttService } from '../services/api';
import { Calendar, PlusCircle, Settings, BarChart3 } from 'lucide-react';

const PlanificationGantt: React.FC = () => {
  const [projets, setProjets] = useState<any[]>([]);
  const [taches, setTaches] = useState<any[]>([]);
  const [selectedProjet, setSelectedProjet] = useState<number | null>(null);
  const [ganttData, setGanttData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjets();
  }, []);

  useEffect(() => {
    if (selectedProjet) {
      loadTaches();
      loadGanttData();
    }
  }, [selectedProjet]);

  const loadProjets = async () => {
    try {
      const res = await planificationGanttService.getProjets();
      setProjets(res.data.data.projets || []);
      if (res.data.data.projets && res.data.data.projets.length > 0) {
        setSelectedProjet(res.data.data.projets[0].id_projet);
      }
    } catch (error) {
      console.error('Erreur chargement projets:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTaches = async () => {
    if (!selectedProjet) return;
    try {
      const res = await planificationGanttService.getTaches({ id_projet: selectedProjet });
      setTaches(res.data.data.taches || []);
    } catch (error) {
      console.error('Erreur chargement tâches:', error);
    }
  };

  const loadGanttData = async () => {
    if (!selectedProjet) return;
    try {
      const res = await planificationGanttService.getGanttData({ id_projet: selectedProjet });
      setGanttData(res.data.data);
    } catch (error) {
      console.error('Erreur chargement Gantt:', error);
    }
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'TERMINEE': return 'bg-green-500';
      case 'EN_COURS': return 'bg-blue-500';
      case 'PLANIFIEE': return 'bg-yellow-500';
      case 'BLOQUEE': return 'bg-red-500';
      default: return 'bg-gray-500';
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
            <BarChart3 className="w-8 h-8" />
            Planification Gantt
          </h1>
          <button
            onClick={() => {/* TODO: Modal création */}}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <PlusCircle className="w-5 h-5" />
            Nouveau Projet
          </button>
        </div>

        {/* Sélection projet */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Projet
          </label>
          <select
            value={selectedProjet || ''}
            onChange={(e) => setSelectedProjet(parseInt(e.target.value))}
            className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Sélectionner un projet</option>
            {projets.map((projet) => (
              <option key={projet.id_projet} value={projet.id_projet}>
                {projet.libelle} ({projet.code_projet})
              </option>
            ))}
          </select>
        </div>

        {selectedProjet && (
          <>
            {/* Diagramme Gantt simplifié */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">Diagramme de Gantt</h2>
              <div className="overflow-x-auto">
                <div className="min-w-full">
                  {taches.map((tache) => {
                    const startDate = new Date(tache.date_debut_prevue);
                    const endDate = new Date(tache.date_fin_prevue);
                    const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
                    const progress = (tache.progression_pourcentage || 0) / 100;

                    return (
                      <div key={tache.id_tache} className="mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-48 text-sm font-medium">{tache.libelle}</div>
                          <div className="flex-1 relative h-8 bg-gray-200 rounded">
                            <div
                              className={`absolute h-full rounded ${getStatutColor(tache.statut)}`}
                              style={{
                                width: `${duration * 20}px`,
                                opacity: 0.7
                              }}
                            ></div>
                            <div
                              className="absolute h-full bg-green-500 rounded"
                              style={{
                                width: `${duration * 20 * progress}px`,
                                opacity: 0.5
                              }}
                            ></div>
                            <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold">
                              {tache.date_debut_prevue} - {tache.date_fin_prevue}
                            </div>
                          </div>
                          <div className="w-24 text-sm text-center">
                            {Math.round(progress * 100)}%
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Liste tâches */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tâche</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Début</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fin</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durée</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progression</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {taches.map((tache) => (
                    <tr key={tache.id_tache}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {tache.libelle}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {new Date(tache.date_debut_prevue).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {new Date(tache.date_fin_prevue).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {tache.duree_prevue_jours || 0} jours
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${tache.progression_pourcentage || 0}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500">{tache.progression_pourcentage || 0}%</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded text-xs ${getStatutColor(tache.statut)} text-white`}>
                          {tache.statut}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button className="text-blue-600 hover:text-blue-800">Modifier</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PlanificationGantt;
