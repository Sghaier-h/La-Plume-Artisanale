import React, { useState, useEffect } from 'react';
import { qualiteAvanceService } from '../services/api';
import { CheckCircle, XCircle, AlertTriangle, BarChart3, TrendingUp, Eye, X } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const QualiteAvance: React.FC = () => {
  const [controles, setControles] = useState<any[]>([]);
  const [nonConformites, setNonConformites] = useState<any[]>([]);
  const [statistiques, setStatistiques] = useState<any>(null);
  const [diagrammes, setDiagrammes] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'controles' | 'non-conformites' | 'statistiques' | 'diagrammes'>('controles');
  const [selectedControle, setSelectedControle] = useState<any | null>(null);
  const [selectedNonConformite, setSelectedNonConformite] = useState<any | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [controlesRes, ncRes, statsRes, diagrammesRes] = await Promise.all([
        qualiteAvanceService.getControles(),
        qualiteAvanceService.getNonConformites(),
        qualiteAvanceService.getStatistiques(),
        qualiteAvanceService.getDiagrammes({ type_diagramme: 'PARETO' })
      ]);

      setControles(controlesRes.data.data.controles || []);
      setNonConformites(ncRes.data.data || []);
      setStatistiques(statsRes.data.data);
      setDiagrammes(diagrammesRes.data.data);
    } catch (error) {
      console.error('Erreur chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const getResultatColor = (resultat: string) => {
    switch (resultat) {
      case 'CONFORME': return 'bg-green-100 text-green-800';
      case 'NON_CONFORME': return 'bg-red-100 text-red-800';
      case 'CONFORME_AVEC_RESERVE': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getGraviteColor = (gravite: string) => {
    switch (gravite) {
      case 'CRITIQUE': return 'bg-red-600 text-white';
      case 'MAJEURE': return 'bg-orange-500 text-white';
      case 'MOYENNE': return 'bg-yellow-500 text-white';
      case 'MINEURE': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

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
            <CheckCircle className="w-8 h-8" />
            Contrôle Qualité Avancé
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b">
          <button
            onClick={() => setActiveTab('controles')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'controles'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Contrôles ({controles.length})
          </button>
          <button
            onClick={() => setActiveTab('non-conformites')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'non-conformites'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Non-conformités ({nonConformites.length})
          </button>
          <button
            onClick={() => setActiveTab('statistiques')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'statistiques'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Statistiques
          </button>
          <button
            onClick={() => setActiveTab('diagrammes')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'diagrammes'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Diagrammes
          </button>
        </div>

        {/* Contenu */}
        {activeTab === 'controles' && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Numéro</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">OF</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Taux conformité</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Résultat</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {controles.map((controle: any) => (
                  <tr key={controle.id_controle}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {controle.numero_controle}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {controle.numero_of || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {controle.type_controle}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {new Date(controle.date_controle).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              controle.taux_conformite >= 95 ? 'bg-green-600' :
                              controle.taux_conformite >= 80 ? 'bg-yellow-600' : 'bg-red-600'
                            }`}
                            style={{ width: `${controle.taux_conformite || 0}%` }}
                          ></div>
                        </div>
                        <span className="text-sm">{controle.taux_conformite || 0}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs ${getResultatColor(controle.resultat_global)}`}>
                        {controle.resultat_global}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedControle(controle)}
                        className="text-blue-600 hover:text-blue-700"
                        title="Consulter"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'non-conformites' && (
          <div className="space-y-4">
            {nonConformites.map((nc: any) => (
              <div
                key={nc.id_nc}
                className="bg-white rounded-lg shadow-lg p-4 border-l-4 border-red-500"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <XCircle className="w-5 h-5 text-red-600" />
                      <span className="font-semibold">{nc.numero_nc}</span>
                      <span className={`px-2 py-1 rounded text-xs ${getGraviteColor(nc.gravite)}`}>
                        {nc.gravite}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{nc.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      OF: {nc.numero_of || 'N/A'} | Ouvert le: {new Date(nc.date_ouverture).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      nc.statut === 'FERMEE' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {nc.statut}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'statistiques' && statistiques && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-sm text-gray-600 mb-2">Taux de conformité</div>
              <div className="text-3xl font-bold text-green-600">
                {statistiques.taux_conformite?.toFixed(1) || 0}%
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-sm text-gray-600 mb-2">Contrôles totaux</div>
              <div className="text-3xl font-bold text-blue-600">
                {statistiques.nb_controles_total || 0}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-sm text-gray-600 mb-2">Conformes</div>
              <div className="text-3xl font-bold text-green-600">
                {statistiques.nb_conformes || 0}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-sm text-gray-600 mb-2">Non-conformités</div>
              <div className="text-3xl font-bold text-red-600">
                {statistiques.nb_nc_total || 0}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'diagrammes' && diagrammes && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Diagramme de Pareto</h2>
            {diagrammes.pareto && (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={diagrammes.pareto}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="cause" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="frequence" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        )}

        {/* Modal consultation Contrôle */}
        {selectedControle && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                  Contrôle Qualité - {selectedControle.numero_controle}
                </h2>
                <button
                  onClick={() => setSelectedControle(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Numéro Contrôle</label>
                    <p className="text-gray-900 font-semibold">{selectedControle.numero_controle}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Numéro OF</label>
                    <p className="text-gray-900">{selectedControle.numero_of || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Type de Contrôle</label>
                    <p className="text-gray-900">{selectedControle.type_controle}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Date</label>
                    <p className="text-gray-900">{new Date(selectedControle.date_controle).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Taux de Conformité</label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full ${
                            selectedControle.taux_conformite >= 95 ? 'bg-green-600' :
                            selectedControle.taux_conformite >= 80 ? 'bg-yellow-600' : 'bg-red-600'
                          }`}
                          style={{ width: `${selectedControle.taux_conformite || 0}%` }}
                        ></div>
                      </div>
                      <span className="font-semibold">{selectedControle.taux_conformite || 0}%</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Résultat Global</label>
                    <span className={`inline-block px-3 py-1 rounded text-sm ${getResultatColor(selectedControle.resultat_global)}`}>
                      {selectedControle.resultat_global}
                    </span>
                  </div>
                  {selectedControle.observations && (
                    <div className="col-span-2">
                      <label className="text-sm font-medium text-gray-500">Observations</label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedControle.observations}</p>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4 flex gap-2 justify-end">
                  <button
                    onClick={() => setSelectedControle(null)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal consultation Non-Conformité */}
        {selectedNonConformite && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <XCircle className="w-6 h-6 text-red-600" />
                  Non-Conformité - {selectedNonConformite.numero_nc}
                </h2>
                <button
                  onClick={() => setSelectedNonConformite(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Numéro NC</label>
                    <p className="text-gray-900 font-semibold">{selectedNonConformite.numero_nc}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Gravité</label>
                    <span className={`inline-block px-3 py-1 rounded text-sm ${getGraviteColor(selectedNonConformite.gravite)}`}>
                      {selectedNonConformite.gravite}
                    </span>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Numéro OF</label>
                    <p className="text-gray-900">{selectedNonConformite.numero_of || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Statut</label>
                    <span className={`inline-block px-3 py-1 rounded text-sm ${
                      selectedNonConformite.statut === 'FERMEE' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedNonConformite.statut}
                    </span>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Date Ouverture</label>
                    <p className="text-gray-900">{new Date(selectedNonConformite.date_ouverture).toLocaleDateString('fr-FR')}</p>
                  </div>
                  {selectedNonConformite.date_fermeture && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Date Fermeture</label>
                      <p className="text-gray-900">{new Date(selectedNonConformite.date_fermeture).toLocaleDateString('fr-FR')}</p>
                    </div>
                  )}
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-500">Description</label>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedNonConformite.description}</p>
                  </div>
                  {selectedNonConformite.cause && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Cause</label>
                      <p className="text-gray-900">{selectedNonConformite.cause}</p>
                    </div>
                  )}
                  {selectedNonConformite.action_corrective && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Action Corrective</label>
                      <p className="text-gray-900 bg-blue-50 p-3 rounded-lg">{selectedNonConformite.action_corrective}</p>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4 flex gap-2 justify-end">
                  <button
                    onClick={() => setSelectedNonConformite(null)}
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
    </div>
  );
};

export default QualiteAvance;
