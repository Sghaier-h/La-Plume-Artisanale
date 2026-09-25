import React, { useState, useEffect } from 'react';
import { articlesService } from '../services/api';
import { Package, Search, Image as ImageIcon, List, Grid, ShoppingCart, Plus, Minus, CheckCircle } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { useNavigate } from 'react-router-dom';

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
  const { state, addToOrderCart, addNotification } = useApp();
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [affichageMode, setAffichageMode] = useState<'ligne' | 'catalogue'>('catalogue'); // Catalogue par défaut pour l'e-commerce
  const [quantities, setQuantities] = useState<{ [key: number]: number }>({});
  const [addingToCart, setAddingToCart] = useState<{ [key: number]: boolean }>({});

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
      // Initialiser les quantités à 1 par défaut
      const initialQuantities: { [key: number]: number } = {};
      articlesCatalogue.forEach((article: Article) => {
        if (article.id_article) {
          initialQuantities[article.id_article] = 1;
        }
      });
      setQuantities(initialQuantities);
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
      const initialQuantities: { [key: number]: number } = {};
      mockArticles.forEach((article: Article) => {
        if (article.id_article) {
          initialQuantities[article.id_article] = 1;
        }
      });
      setQuantities(initialQuantities);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (articleId: number, delta: number) => {
    setQuantities((prev) => {
      const currentQty = prev[articleId] || 1;
      const newQty = Math.max(1, currentQty + delta);
      return { ...prev, [articleId]: newQty };
    });
  };

  const handleQuantityInput = (articleId: number, value: string) => {
    const qty = parseInt(value) || 1;
    setQuantities((prev) => ({
      ...prev,
      [articleId]: Math.max(1, qty),
    }));
  };

  const handleAddToOrder = async (article: Article) => {
    if (!article.id_article) return;

    const quantity = quantities[article.id_article] || 1;
    const price = article.prix_vente || 0;

    if (quantity <= 0) {
      addNotification({
        id: Date.now(),
        type: 'error',
        message: 'La quantité doit être supérieure à 0',
      });
      return;
    }

    setAddingToCart((prev) => ({ ...prev, [article.id_article!]: true }));

    try {
      // Ajouter au panier de commande
      addToOrderCart(article.id_article, article, quantity, price);

      addNotification({
        id: Date.now(),
        type: 'success',
        message: `${quantity} × ${article.designation_article || article.modele} ajouté(s) à la commande`,
      });

      // Animation de feedback
      setTimeout(() => {
        setAddingToCart((prev) => ({ ...prev, [article.id_article!]: false }));
      }, 1000);
    } catch (error) {
      console.error('Erreur ajout à la commande:', error);
      addNotification({
        id: Date.now(),
        type: 'error',
        message: 'Erreur lors de l\'ajout à la commande',
      });
      setAddingToCart((prev) => ({ ...prev, [article.id_article!]: false }));
    }
  };

  const handleViewCart = () => {
    navigate('/sale-orders', { state: { mode: 'create_with_cart' } });
  };

  const handleCreateOrder = () => {
    // Créer une nouvelle commande avec les articles du panier
    if (state.orderCart.items.length > 0) {
      navigate('/sale-orders', { state: { mode: 'create_with_cart' } });
    } else {
      addNotification({
        id: Date.now(),
        type: 'warning',
        message: 'Veuillez d\'abord ajouter des produits à la commande',
      });
    }
  };

  const handleAddToExistingOrder = async () => {
    // TODO: Implémenter la sélection d'une commande existante
    // Pour l'instant, créer une nouvelle commande
    handleCreateOrder();
  };

  const filteredArticles = articles.filter((article) =>
    article.ref_commercial?.toLowerCase().includes(search.toLowerCase()) ||
    article.ref_fabrication?.toLowerCase().includes(search.toLowerCase()) ||
    article.modele?.toLowerCase().includes(search.toLowerCase()) ||
    article.designation_article?.toLowerCase().includes(search.toLowerCase()) ||
    article.produit?.toLowerCase().includes(search.toLowerCase())
  );

  const cartItemCount = state.orderCart.items.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              <Package className="w-8 h-8 text-blue-600" />
              Catalogue Produit
            </h1>
            <p className="text-gray-600 mt-2">Articles disponibles dans le catalogue e-commerce</p>
          </div>
          {cartItemCount > 0 && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
                <ShoppingCart className="w-5 h-5 text-blue-600" />
                <span className="text-blue-700 font-medium">{cartItemCount} article(s) sélectionné(s)</span>
              </div>
              <button
                onClick={handleCreateOrder}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Créer une commande ({cartItemCount})</span>
              </button>
              <button
                onClick={handleAddToExistingOrder}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-lg"
              >
                <Plus className="w-5 h-5" />
                <span>Ajouter à une commande</span>
              </button>
            </div>
          )}
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantité</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredArticles.map((article) => (
                  <tr key={article.id_article} className="hover:bg-gray-50 group">
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
                        <div className="font-semibold text-green-600">{Number(article.prix_vente || 0).toFixed(2) || '0.00'} TND</div>
                        {article.prix_reviens && (
                          <div className="text-xs text-gray-500">Reviens: {Number(article.prix_reviens || 0).toFixed(2)} TND</div>
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
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => article.id_article && handleQuantityChange(article.id_article, -1)}
                          className="p-1 rounded hover:bg-gray-200"
                          disabled={!article.id_article || (quantities[article.id_article] || 1) <= 1}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={article.id_article ? (quantities[article.id_article] || 1) : 1}
                          onChange={(e) => article.id_article && handleQuantityInput(article.id_article, e.target.value)}
                          className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-sm"
                        />
                        <button
                          onClick={() => article.id_article && handleQuantityChange(article.id_article, 1)}
                          className="p-1 rounded hover:bg-gray-200"
                          disabled={!article.id_article}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleAddToOrder(article)}
                        disabled={addingToCart[article.id_article!] || !article.actif || (article.stock_total || 0) === 0}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                          addingToCart[article.id_article!]
                            ? 'bg-green-500 text-white'
                            : article.actif && (article.stock_total || 0) > 0
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {addingToCart[article.id_article!] ? (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            Ajouté
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-4 h-4" />
                            Ajouter
                          </>
                        )}
                      </button>
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
                      <p className="font-semibold text-green-600 text-lg">{Number(article.prix_vente || 0).toFixed(2) || '0.00'} TND</p>
                      {article.prix_reviens && (
                        <p className="text-xs text-gray-500">Reviens: {Number(article.prix_reviens || 0).toFixed(2)} TND</p>
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
                  {/* Contrôle de quantité */}
                  <div className="mb-3">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Quantité</label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => article.id_article && handleQuantityChange(article.id_article, -1)}
                        className="p-1 rounded hover:bg-gray-200 border border-gray-300"
                        disabled={!article.id_article || (quantities[article.id_article] || 1) <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <input
                        type="number"
                        min="1"
                        max={article.stock_total || 999}
                        value={article.id_article ? (quantities[article.id_article] || 1) : 1}
                        onChange={(e) => article.id_article && handleQuantityInput(article.id_article, e.target.value)}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-center text-sm"
                      />
                      <button
                        onClick={() => article.id_article && handleQuantityChange(article.id_article, 1)}
                        className="p-1 rounded hover:bg-gray-200 border border-gray-300"
                        disabled={!article.id_article || (quantities[article.id_article] || 1) >= (article.stock_total || 999)}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {/* Bouton Ajouter à la commande */}
                  <button
                    onClick={() => handleAddToOrder(article)}
                    disabled={addingToCart[article.id_article!] || !article.actif || (article.stock_total || 0) === 0}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      addingToCart[article.id_article!]
                        ? 'bg-green-500 text-white'
                        : article.actif && (article.stock_total || 0) > 0
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {addingToCart[article.id_article!] ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Ajouté
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4" />
                        Ajouter à la commande
                      </>
                    )}
                  </button>
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
