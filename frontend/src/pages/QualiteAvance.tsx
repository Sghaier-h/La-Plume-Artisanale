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
      </div>
    </div>
  );
};

export default QualiteAvance;
