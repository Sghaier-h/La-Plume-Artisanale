import React, { useState, useEffect } from 'react';
import { articlesService } from '../services/api';
import { Package, Search, Image as ImageIcon, List, Grid } from 'lucide-react';

interface Article {
  id_article?: number;
  ref_commercial: string;
  ref_fabrication: string;
  produit: string;
  modele: string;
  code_modele: string;
  nombre_couleur: string;
  code_nombre_couleur: string;
  type_tissage: string;
  dimensions: string;
  code_dimensions: string;
  type_finition: string;
  couleur_article?: string;
  designation_article?: string;
  description_article?: string;
  photo_article?: string;
  stock_total?: number;
  prix_vente?: number;
  prix_reviens?: number;
  dans_catalogue_produit: boolean;
  actif: boolean;
}

const CatalogueProduit: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [affichageMode, setAffichageMode] = useState<'ligne' | 'catalogue'>('catalogue'); // Catalogue par défaut pour l'e-commerce

  useEffect(() => {
    loadData();
  }, [search]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Charger uniquement les articles qui sont dans le catalogue produit
      const response = await articlesService.getArticles({ dans_catalogue_produit: true, search });
      // Filtrer pour s'assurer que seuls les articles avec dans_catalogue_produit = true sont affichés
      const articlesCatalogue = (response.data.data?.articles || response.data.data || []).filter(
        (article: Article) => article.dans_catalogue_produit === true
      );
      setArticles(articlesCatalogue);
    } catch (error) {
      console.error('Erreur chargement articles catalogue:', error);
      // En cas d'erreur, utiliser des données mockées
      const mockArticles: Article[] = [
        {
          id_article: 1,
          ref_commercial: 'AR1020-B02-03',
          ref_fabrication: 'AR1020-B-02-03',
          produit: 'Fouta',
          modele: 'ARTHUR',
          code_modele: 'AR',
          nombre_couleur: '2 Couleurs',
          code_nombre_couleur: 'B',
          type_tissage: 'Tissage Plat',
          dimensions: '100/200 CM',
          code_dimensions: '1020',
          type_finition: 'Frange',
          couleur_article: 'Blanc/Rouge',
          designation_article: 'ARTHUR 100/200 CM Blanc/Rouge',
          stock_total: 65,
          prix_vente: 9.75,
          prix_reviens: 7.5,
          dans_catalogue_produit: true,
          actif: true
        }
      ];
      setArticles(mockArticles);
    } finally {
      setLoading(false);
    }
  };

  const filteredArticles = articles.filter(article =>
    article.ref_commercial?.toLowerCase().includes(search.toLowerCase()) ||
    article.ref_fabrication?.toLowerCase().includes(search.toLowerCase()) ||
    article.modele?.toLowerCase().includes(search.toLowerCase()) ||
    article.designation_article?.toLowerCase().includes(search.toLowerCase()) ||
    article.produit?.toLowerCase().includes(search.toLowerCase())
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
              Catalogue Produit
            </h1>
            <p className="text-gray-600 mt-2">Articles disponibles dans le catalogue e-commerce</p>
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
              placeholder="Rechercher un article..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Liste des articles */}
        {affichageMode === 'ligne' ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Photo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ref Commerciale</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Désignation</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Modèle</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Couleur</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prix</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredArticles.map((article) => (
                  <tr key={article.id_article} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      {article.photo_article ? (
                        <img src={article.photo_article} alt={article.designation_article} className="w-16 h-16 object-cover rounded" />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-sm font-medium text-blue-600">
                      {article.ref_commercial}
                    </td>
                    <td className="px-6 py-4 text-sm">{article.designation_article || article.modele}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{article.modele}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {article.couleur_article || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="font-semibold text-green-600">{article.prix_vente?.toFixed(2) || '0.00'} TND</div>
                        {article.prix_reviens && (
                          <div className="text-xs text-gray-500">Reviens: {article.prix_reviens.toFixed(2)} TND</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        (article.stock_total || 0) > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {article.stock_total || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {article.actif ? (
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
            {filteredArticles.map((article) => (
              <div key={article.id_article} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 bg-gray-200 flex items-center justify-center overflow-hidden">
                  {article.photo_article ? (
                    <img src={article.photo_article} alt={article.designation_article} className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-16 h-16 text-gray-400" />
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg text-gray-800 mb-2">{article.designation_article || article.modele}</h3>
                  <div className="space-y-1 text-sm text-gray-600 mb-3">
                    <p><span className="font-medium">Ref:</span> <span className="font-mono text-xs">{article.ref_commercial}</span></p>
                    <p><span className="font-medium">Modèle:</span> {article.modele}</p>
                    {article.couleur_article && (
                      <p><span className="font-medium">Couleur:</span> {article.couleur_article}</p>
                    )}
                    <div className="mt-2 pt-2 border-t">
                      <p className="font-semibold text-green-600 text-lg">{article.prix_vente?.toFixed(2) || '0.00'} TND</p>
                      {article.prix_reviens && (
                        <p className="text-xs text-gray-500">Reviens: {article.prix_reviens.toFixed(2)} TND</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      (article.stock_total || 0) > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      Stock: {article.stock_total || 0}
                    </span>
                    {article.actif ? (
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

        {filteredArticles.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Aucun article trouvé dans le catalogue</p>
            <p className="text-sm text-gray-500 mt-2">Les articles doivent avoir "Dans Catalogue Produit" activé</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CatalogueProduit;
