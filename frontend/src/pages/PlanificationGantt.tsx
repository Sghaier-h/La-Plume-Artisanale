import React, { useState, useEffect } from 'react';
import { planificationGanttService } from '../services/api';
import { Calendar, PlusCircle, Settings, BarChart3, Eye, X } from 'lucide-react';

const PlanificationGantt: React.FC = () => {
  const [projets, setProjets] = useState<any[]>([]);
  const [taches, setTaches] = useState<any[]>([]);
  const [selectedProjet, setSelectedProjet] = useState<number | null>(null);
  const [selectedTache, setSelectedTache] = useState<any | null>(null);
  const [selectedProjetDetail, setSelectedProjetDetail] = useState<any | null>(null);
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
          <button
            onClick={() => {
              const projet = projets.find(p => p.id_projet === selectedProjet);
              if (projet) setSelectedProjetDetail(projet);
            }}
            className="ml-2 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            title="Consulter le projet"
            disabled={!selectedProjet}
          >
            <Eye className="w-4 h-4" />
          </button>
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
                        <div className="flex gap-2">
                          <button 
                            onClick={() => setSelectedTache(tache)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Consulter"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="text-gray-600 hover:text-gray-800" title="Modifier">Modifier</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Modal consultation Tâche */}
      {selectedTache && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-blue-600" />
                Tâche - {selectedTache.libelle}
              </h2>
              <button
                onClick={() => setSelectedTache(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Libellé</label>
                  <p className="text-gray-900 font-semibold text-lg">{selectedTache.libelle}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Statut</label>
                  <span className={`inline-block px-3 py-1 rounded text-sm ${getStatutColor(selectedTache.statut)} text-white`}>
                    {selectedTache.statut}
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Date Début Prévue</label>
                  <p className="text-gray-900">{new Date(selectedTache.date_debut_prevue).toLocaleDateString('fr-FR')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Date Fin Prévue</label>
                  <p className="text-gray-900">{new Date(selectedTache.date_fin_prevue).toLocaleDateString('fr-FR')}</p>
                </div>
                {selectedTache.date_debut_reelle && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Date Début Réelle</label>
                    <p className="text-gray-900">{new Date(selectedTache.date_debut_reelle).toLocaleDateString('fr-FR')}</p>
                  </div>
                )}
                {selectedTache.date_fin_reelle && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Date Fin Réelle</label>
                    <p className="text-gray-900">{new Date(selectedTache.date_fin_reelle).toLocaleDateString('fr-FR')}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-500">Durée Prévue</label>
                  <p className="text-gray-900">{selectedTache.duree_prevue_jours || 0} jours</p>
                </div>
                {selectedTache.duree_reelle_jours && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Durée Réelle</label>
                    <p className="text-gray-900">{selectedTache.duree_reelle_jours} jours</p>
                  </div>
                )}
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-500 mb-2 block">Progression</label>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className="bg-blue-600 h-4 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                      style={{ width: `${selectedTache.progression_pourcentage || 0}%` }}
                    >
                      {selectedTache.progression_pourcentage || 0}%
                    </div>
                  </div>
                </div>
                {selectedTache.description && (
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-500">Description</label>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedTache.description}</p>
                  </div>
                )}
                {selectedTache.ressources && selectedTache.ressources.length > 0 && (
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-500 mb-2 block">Ressources</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedTache.ressources.map((ressource: any, idx: number) => (
                        <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                          {ressource.nom || ressource}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {selectedTache.notes && (
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-500">Notes</label>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedTache.notes}</p>
                  </div>
                )}
              </div>

              <div className="border-t pt-4 flex gap-2 justify-end">
                <button
                  onClick={() => setSelectedTache(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal consultation Projet */}
      {selectedProjetDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-blue-600" />
                Projet - {selectedProjetDetail.libelle}
              </h2>
              <button
                onClick={() => setSelectedProjetDetail(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Code Projet</label>
                  <p className="text-gray-900 font-mono font-semibold">{selectedProjetDetail.code_projet}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Libellé</label>
                  <p className="text-gray-900 font-semibold text-lg">{selectedProjetDetail.libelle}</p>
                </div>
                {selectedProjetDetail.date_debut && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Date Début</label>
                    <p className="text-gray-900">{new Date(selectedProjetDetail.date_debut).toLocaleDateString('fr-FR')}</p>
                  </div>
                )}
                {selectedProjetDetail.date_fin && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Date Fin</label>
                    <p className="text-gray-900">{new Date(selectedProjetDetail.date_fin).toLocaleDateString('fr-FR')}</p>
                  </div>
                )}
                {selectedProjetDetail.statut && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Statut</label>
                    <span className={`inline-block px-3 py-1 rounded text-sm ${getStatutColor(selectedProjetDetail.statut)} text-white`}>
                      {selectedProjetDetail.statut}
                    </span>
                  </div>
                )}
                {selectedProjetDetail.description && (
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-500">Description</label>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedProjetDetail.description}</p>
                  </div>
                )}
              </div>

              <div className="border-t pt-4 flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setSelectedProjet(selectedProjetDetail.id_projet);
                    setSelectedProjetDetail(null);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Voir les Tâches
                </button>
                <button
                  onClick={() => setSelectedProjetDetail(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanificationGantt;
