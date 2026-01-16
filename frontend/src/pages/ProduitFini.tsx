import React, { useState, useEffect } from 'react';
import { Package, Plus, Search, Edit, List, Grid, TrendingUp } from 'lucide-react';
import { articlesService } from '../services/api';

interface ProduitFini {
  id_article?: number;
  ref_commercial: string;
  ref_fabrication: string;
  designation: string;
  modele?: string;
  stock_total?: number;
  stock_par_entrepot?: Array<{entrepot: string; quantite: number; statut: string}>;
  prix_vente?: number;
  prix_reviens?: number;
  actif: boolean;
}

const ProduitFini: React.FC = () => {
  const [produits, setProduits] = useState<ProduitFini[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [affichageMode, setAffichageMode] = useState<'ligne' | 'catalogue'>('ligne');

  useEffect(() => {
    loadData();
  }, [search]);

  const loadData = async () => {
    setLoading(true);
    try {
      // TODO: Remplacer par l'API réelle avec filtre type = 'PRODUIT_FINI'
      const response = await articlesService.getArticles({ type: 'PRODUIT_FINI', search });
      const articles = response.data.data?.articles || response.data.data || [];
      setProduits(articles);
    } catch (error) {
      console.error('Erreur chargement produits finis:', error);
      // Données mockées
      const mockProduits: ProduitFini[] = [
        {
          id_article: 1,
          ref_commercial: 'AR1020-B02-03',
          ref_fabrication: 'AR1020-B-02-03',
          designation: 'ARTHUR 100/200 CM Blanc/Rouge',
          modele: 'ARTHUR',
          stock_total: 65,
          stock_par_entrepot: [
            { entrepot: 'Entrepôt Principal', quantite: 45, statut: 'disponible' },
            { entrepot: 'Showroom', quantite: 12, statut: 'disponible' },
            { entrepot: 'Réserve', quantite: 8, statut: 'reserve' }
          ],
          prix_vente: 9.75,
          prix_reviens: 7.5,
          actif: true
        },
        {
          id_article: 2,
          ref_commercial: 'AR1525-T03-04-05',
          ref_fabrication: 'AR1525-T-03-04-05',
          designation: 'ARTHUR 150/250 CM Rouge/Bleu/Vert',
          modele: 'ARTHUR',
          stock_total: 42,
          stock_par_entrepot: [
            { entrepot: 'Entrepôt Principal', quantite: 30, statut: 'disponible' },
            { entrepot: 'Showroom', quantite: 12, statut: 'disponible' }
          ],
          prix_vente: 12.50,
          prix_reviens: 9.80,
          actif: true
        }
      ];
      setProduits(mockProduits);
    } finally {
      setLoading(false);
    }
  };

  const filteredProduits = produits.filter(prod =>
    prod.ref_commercial?.toLowerCase().includes(search.toLowerCase()) ||
    prod.ref_fabrication?.toLowerCase().includes(search.toLowerCase()) ||
    prod.designation?.toLowerCase().includes(search.toLowerCase()) ||
    prod.modele?.toLowerCase().includes(search.toLowerCase())
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
              <Package className="w-8 h-8 text-blue-600" />
              Produits Finis
            </h1>
            <p className="text-gray-600 mt-2">Gestion du stock des produits finis</p>
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
              placeholder="Rechercher un produit fini..."
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ref Commerciale</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ref Fabrication</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Désignation</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Modèle</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prix Vente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prix Reviens</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProduits.map((produit) => (
                  <tr key={produit.id_article} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-sm font-medium text-blue-600">{produit.ref_commercial}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-gray-600">{produit.ref_fabrication}</td>
                    <td className="px-6 py-4 text-sm">{produit.designation}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{produit.modele || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        (produit.stock_total || 0) > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {produit.stock_total || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">{produit.prix_vente?.toFixed(2) || '0.00'} TND</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{produit.prix_reviens?.toFixed(2) || '0.00'} TND</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {produit.actif ? (
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
            {filteredProduits.map((produit) => (
              <div key={produit.id_article} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-32 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                  <Package className="w-16 h-16 text-blue-600" />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg text-gray-800 mb-2">{produit.designation}</h3>
                  <div className="space-y-1 text-sm text-gray-600 mb-3">
                    <p><span className="font-medium">Ref:</span> <span className="font-mono text-xs">{produit.ref_commercial}</span></p>
                    {produit.modele && <p><span className="font-medium">Modèle:</span> {produit.modele}</p>}
                    <div className="mt-2 pt-2 border-t">
                      <p className="font-semibold text-green-600 text-lg">{produit.prix_vente?.toFixed(2) || '0.00'} TND</p>
                      <p className="text-xs text-gray-500">Reviens: {produit.prix_reviens?.toFixed(2) || '0.00'} TND</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      (produit.stock_total || 0) > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      Stock: {produit.stock_total || 0}
                    </span>
                    {produit.actif ? (
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

        {filteredProduits.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Aucun produit fini trouvé</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProduitFini;
