import React, { useState, useEffect } from 'react';
import { Box, Plus, Search, Edit, List, Grid } from 'lucide-react';
import { matieresPremieresService } from '../services/api';

interface MatierePremiere {
  id_mp?: number;
  code_mp: string;
  designation: string;
  qr_mp?: string;
  stock_total?: number;
  stock_par_entrepot?: Array<{entrepot: string; quantite: number; statut: string}>;
  prix_unitaire?: number;
  stock_minimum?: number;
  stock_alerte?: number;
  actif: boolean;
}

const MatierePremiereStock: React.FC = () => {
  const [matieres, setMatieres] = useState<MatierePremiere[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [affichageMode, setAffichageMode] = useState<'ligne' | 'catalogue'>('ligne');

  useEffect(() => {
    loadData();
  }, [search]);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await matieresPremieresService.getMatieresPremieres({ search });
      const matieresData = response.data.data?.matieres || response.data.data || [];
      setMatieres(matieresData);
    } catch (error) {
      console.error('Erreur chargement matières premières:', error);
      // Données mockées
      const mockMatieres: MatierePremiere[] = [
        {
          id_mp: 1,
          code_mp: 'MP-001',
          designation: 'Fil Coton Blanc',
          qr_mp: 'C01_BLANC_NM05-01.00_S2023__',
          stock_total: 2500,
          stock_par_entrepot: [
            { entrepot: 'Entrepôt Principal', quantite: 1500, statut: 'disponible' },
            { entrepot: 'Fabrication', quantite: 1000, statut: 'en_production' }
          ],
          prix_unitaire: 2.50,
          stock_minimum: 500,
          stock_alerte: 300,
          actif: true
        },
        {
          id_mp: 2,
          code_mp: 'MP-002',
          designation: 'Fil Coton Rouge',
          qr_mp: 'C20_ROUGE_NM15-01.00_63555__',
          stock_total: 1800,
          stock_par_entrepot: [
            { entrepot: 'Entrepôt Principal', quantite: 1200, statut: 'disponible' },
            { entrepot: 'Fabrication', quantite: 600, statut: 'en_production' }
          ],
          prix_unitaire: 2.50,
          stock_minimum: 500,
          stock_alerte: 300,
          actif: true
        }
      ];
      setMatieres(mockMatieres);
    } finally {
      setLoading(false);
    }
  };

  const filteredMatieres = matieres.filter(mp =>
    mp.code_mp?.toLowerCase().includes(search.toLowerCase()) ||
    mp.designation?.toLowerCase().includes(search.toLowerCase()) ||
    mp.qr_mp?.toLowerCase().includes(search.toLowerCase())
  );

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
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              <Box className="w-8 h-8 text-blue-600" />
              Matières Premières
            </h1>
            <p className="text-gray-600 mt-2">Gestion du stock des matières premières</p>
          </div>
        </div>

        {/* Toggle Affichage et Recherche */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Affichage:</span>
              <button
                onClick={() => setAffichageMode('ligne')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  affichageMode === 'ligne' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <List className="w-4 h-4" />
                Ligne
              </button>
              <button
                onClick={() => setAffichageMode('catalogue')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  affichageMode === 'catalogue' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <Grid className="w-4 h-4" />
                Catalogue
              </button>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher une matière première..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        {/* Liste */}
        {affichageMode === 'ligne' ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code MP</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Désignation</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">QR MP</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock Min</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prix Unitaire</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredMatieres.map((matiere) => (
                  <tr key={matiere.id_mp} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-sm font-medium text-blue-600">{matiere.code_mp}</td>
                    <td className="px-6 py-4 text-sm">{matiere.designation}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-gray-600">{matiere.qr_mp || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        (matiere.stock_total || 0) >= (matiere.stock_minimum || 0) 
                          ? 'bg-green-100 text-green-800' 
                          : (matiere.stock_total || 0) >= (matiere.stock_alerte || 0)
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {matiere.stock_total || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{matiere.stock_minimum || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">{matiere.prix_unitaire?.toFixed(2) || '0.00'} TND</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {matiere.actif ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Actif</span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">Inactif</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMatieres.map((matiere) => (
              <div key={matiere.id_mp} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-32 bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                  <Box className="w-16 h-16 text-green-600" />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg text-gray-800 mb-2">{matiere.designation}</h3>
                  <div className="space-y-1 text-sm text-gray-600 mb-3">
                    <p><span className="font-medium">Code:</span> <span className="font-mono text-xs">{matiere.code_mp}</span></p>
                    {matiere.qr_mp && <p className="font-mono text-xs text-gray-500">{matiere.qr_mp}</p>}
                    <div className="mt-2 pt-2 border-t">
                      <p className="font-semibold text-green-600 text-lg">{matiere.prix_unitaire?.toFixed(2) || '0.00'} TND</p>
                      <p className="text-xs text-gray-500">Stock Min: {matiere.stock_minimum || '-'}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      (matiere.stock_total || 0) >= (matiere.stock_minimum || 0) 
                        ? 'bg-green-100 text-green-800' 
                        : (matiere.stock_total || 0) >= (matiere.stock_alerte || 0)
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      Stock: {matiere.stock_total || 0}
                    </span>
                    {matiere.actif ? (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Actif</span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">Inactif</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredMatieres.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Box className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Aucune matière première trouvée</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatierePremiereStock;
