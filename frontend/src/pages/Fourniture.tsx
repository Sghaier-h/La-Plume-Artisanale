import React, { useState, useEffect } from 'react';
import { ShoppingBag, Plus, Search, Edit, List, Grid } from 'lucide-react';

interface Fourniture {
  id_fourniture?: number;
  code_fourniture: string;
  designation: string;
  categorie?: string;
  stock_total?: number;
  stock_par_entrepot?: Array<{entrepot: string; quantite: number; statut: string}>;
  prix_unitaire?: number;
  stock_minimum?: number;
  stock_alerte?: number;
  actif: boolean;
}

const Fourniture: React.FC = () => {
  const [fournitures, setFournitures] = useState<Fourniture[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [affichageMode, setAffichageMode] = useState<'ligne' | 'catalogue'>('ligne');

  useEffect(() => {
    loadData();
  }, [search]);

  const loadData = async () => {
    setLoading(true);
    try {
      // TODO: Remplacer par l'API réelle avec filtre type = 'FOURNITURE'
      const mockFournitures: Fourniture[] = [
        {
          id_fourniture: 1,
          code_fourniture: 'FOU-001',
          designation: 'Étiquettes Produit',
          categorie: 'Emballage',
          stock_total: 5000,
          stock_par_entrepot: [
            { entrepot: 'Entrepôt Principal', quantite: 3000, statut: 'disponible' },
            { entrepot: 'Fabrication', quantite: 2000, statut: 'en_utilisation' }
          ],
          prix_unitaire: 0.15,
          stock_minimum: 1000,
          stock_alerte: 500,
          actif: true
        },
        {
          id_fourniture: 2,
          code_fourniture: 'FOU-002',
          designation: 'Sacs Plastique',
          categorie: 'Emballage',
          stock_total: 8000,
          stock_par_entrepot: [
            { entrepot: 'Entrepôt Principal', quantite: 5000, statut: 'disponible' },
            { entrepot: 'Fabrication', quantite: 3000, statut: 'en_utilisation' }
          ],
          prix_unitaire: 0.10,
          stock_minimum: 2000,
          stock_alerte: 1000,
          actif: true
        },
        {
          id_fourniture: 3,
          code_fourniture: 'FOU-003',
          designation: 'Fils de Couture',
          categorie: 'Consommable',
          stock_total: 250,
          stock_par_entrepot: [
            { entrepot: 'Fabrication', quantite: 250, statut: 'en_utilisation' }
          ],
          prix_unitaire: 2.00,
          stock_minimum: 100,
          stock_alerte: 50,
          actif: true
        }
      ];
      setFournitures(mockFournitures);
    } catch (error) {
      console.error('Erreur chargement fournitures:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFournitures = fournitures.filter(fou =>
    fou.code_fourniture?.toLowerCase().includes(search.toLowerCase()) ||
    fou.designation?.toLowerCase().includes(search.toLowerCase()) ||
    fou.categorie?.toLowerCase().includes(search.toLowerCase())
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
              <ShoppingBag className="w-8 h-8 text-blue-600" />
              Fournitures
            </h1>
            <p className="text-gray-600 mt-2">Gestion du stock des fournitures et consommables</p>
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
              placeholder="Rechercher une fourniture..."
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Désignation</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Catégorie</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock Min</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prix Unitaire</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredFournitures.map((fourniture) => (
                  <tr key={fourniture.id_fourniture} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-sm font-medium text-blue-600">{fourniture.code_fourniture}</td>
                    <td className="px-6 py-4 text-sm">{fourniture.designation}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{fourniture.categorie || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        (fourniture.stock_total || 0) >= (fourniture.stock_minimum || 0) 
                          ? 'bg-green-100 text-green-800' 
                          : (fourniture.stock_total || 0) >= (fourniture.stock_alerte || 0)
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {fourniture.stock_total || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{fourniture.stock_minimum || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">{fourniture.prix_unitaire?.toFixed(2) || '0.00'} TND</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {fourniture.actif ? (
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
            {filteredFournitures.map((fourniture) => (
              <div key={fourniture.id_fourniture} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-32 bg-gradient-to-br from-pink-100 to-pink-200 flex items-center justify-center">
                  <ShoppingBag className="w-16 h-16 text-pink-600" />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg text-gray-800 mb-2">{fourniture.designation}</h3>
                  <div className="space-y-1 text-sm text-gray-600 mb-3">
                    <p><span className="font-medium">Code:</span> <span className="font-mono text-xs">{fourniture.code_fourniture}</span></p>
                    {fourniture.categorie && <p><span className="font-medium">Catégorie:</span> {fourniture.categorie}</p>}
                    <div className="mt-2 pt-2 border-t">
                      <p className="font-semibold text-green-600 text-lg">{fourniture.prix_unitaire?.toFixed(2) || '0.00'} TND</p>
                      <p className="text-xs text-gray-500">Stock Min: {fourniture.stock_minimum || '-'}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      (fourniture.stock_total || 0) >= (fourniture.stock_minimum || 0) 
                        ? 'bg-green-100 text-green-800' 
                        : (fourniture.stock_total || 0) >= (fourniture.stock_alerte || 0)
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      Stock: {fourniture.stock_total || 0}
                    </span>
                    {fourniture.actif ? (
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

        {filteredFournitures.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Aucune fourniture trouvée</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Fourniture;
