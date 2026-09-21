/**
 * ProductCatalogModal - Modal catalogue de produits pour sélection
 * Utilisée dans les formulaires de commande/devis pour choisir les produits
 */

import React, { useState, useEffect } from 'react';
import { productsService, articlesService } from '../../services/api';
import { useApp } from '../../store/AppContext';
import {
  X, Search, Package, Plus, Minus, ShoppingCart, CheckCircle,
  Grid, List, Image as ImageIcon, Eye
} from 'lucide-react';

interface ProductCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: any, quantity: number, price: number) => void;
  existingProducts?: Array<{ product_id: number; quantity: number }>; // Produits déjà dans la commande
  title?: string;
  mode?: 'order' | 'quotation'; // Commande ou devis
}

const ProductCatalogModal: React.FC<ProductCatalogModalProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
  existingProducts = [],
  title = 'Catalogue Produits',
  mode = 'order'
}) => {
  const { addNotification } = useApp();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [quantities, setQuantities] = useState<{ [key: number]: number }>({});
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [adding, setAdding] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    if (isOpen) {
      loadProducts();
      loadCategories();
    }
  }, [isOpen, search, selectedCategory]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params: any = { active: true };
      if (search) params.search = search;
      if (selectedCategory) params.category_id = selectedCategory;
      
      // Essayer d'abord avec productsService, sinon articlesService
      let response;
      try {
        response = await productsService.getProducts(params);
      } catch (error) {
        // Si productsService échoue, utiliser articlesService
        const { articlesService } = await import('../../services/api');
        response = await articlesService.getArticles({ dans_catalogue_produit: true, search });
      }
      
      const data = response.data?.data || response.data || [];
      const productsList = Array.isArray(data) ? data : (data.products || data.articles || []);
      
      // Filtrer les produits actifs et dans le catalogue
      const filteredProducts = productsList.filter((p: any) => 
        p.actif !== false && 
        (p.dans_catalogue_produit !== false || p.sale_ok !== false)
      );
      
      setProducts(filteredProducts);
      
      // Initialiser les quantités à 1
      const initialQuantities: { [key: number]: number } = {};
      filteredProducts.forEach((p: any) => {
        const id = p.id || p.id_produit || p.id_product;
        if (id) {
          const existing = existingProducts.find(ep => ep.product_id === id);
          initialQuantities[id] = existing ? existing.quantity : 1;
        }
      });
      setQuantities(initialQuantities);
    } catch (error) {
      console.error('Erreur chargement produits:', error);
      addNotification({
        id: `error-${Date.now()}`,
        type: 'error',
        title: 'Erreur',
        message: 'Erreur lors du chargement des produits',
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const { productCategoryService } = await import('../../services/api');
      const response = await productCategoryService.getCategoryTree();
      setCategories(response.data || []);
    } catch (error) {
      // Si pas de catégories, continuer sans
      console.warn('Catégories non disponibles:', error);
      setCategories([]);
    }
  };

  const handleQuantityChange = (productId: number, delta: number) => {
    setQuantities(prev => {
      const current = prev[productId] || 1;
      const newQty = Math.max(1, current + delta);
      return { ...prev, [productId]: newQty };
    });
  };

  const handleQuantityInput = (productId: number, value: string) => {
    const qty = parseInt(value) || 1;
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.max(1, qty)
    }));
  };

  const handleAddToOrder = async (product: any) => {
    const productId = product.id || product.id_produit || product.id_product;
    if (!productId) return;

    const quantity = quantities[productId] || 1;
    const price = product.list_price || product.prix_vente || product.price || 0;

    if (quantity <= 0) {
      addNotification({
        id: `error-${Date.now()}`,
        type: 'error',
        title: 'Erreur',
        message: 'La quantité doit être supérieure à 0',
        duration: 3000
      });
      return;
    }

    setAdding(prev => ({ ...prev, [productId]: true }));

    try {
      onSelectProduct(product, quantity, price);
      
      addNotification({
        id: `success-${Date.now()}`,
        type: 'success',
        title: 'Produit ajouté',
        message: `${quantity} × ${product.name || product.designation_article || product.libelle || 'Produit'} ajouté à la ${mode === 'order' ? 'commande' : 'devis'}`,
        duration: 2000
      });

      setTimeout(() => {
        setAdding(prev => ({ ...prev, [productId]: false }));
      }, 1000);
    } catch (error) {
      console.error('Erreur ajout produit:', error);
      setAdding(prev => ({ ...prev, [productId]: false }));
    }
  };

  const getProductImage = (product: any) => {
    return product.image_1920 || product.image || product.photo_article || null;
  };

  const getProductName = (product: any) => {
    return product.name || product.designation_article || product.libelle || `Produit #${product.id || product.id_produit}`;
  };

  const getProductCode = (product: any) => {
    return product.default_code || product.code_article || product.ref_commercial || '-';
  };

  const getProductPrice = (product: any) => {
    return product.list_price || product.prix_vente || product.price || 0;
  };

  if (!isOpen) return null;

  const filteredProducts = products.filter((p) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    const name = getProductName(p).toLowerCase();
    const code = getProductCode(p).toLowerCase();
    return name.includes(searchLower) || code.includes(searchLower);
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <Package className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Filtres et recherche */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex gap-4 items-center flex-wrap">
              {/* Recherche */}
              <div className="relative flex-1 min-w-[300px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher un produit..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Catégorie */}
              <select
                value={selectedCategory || ''}
                onChange={(e) => setSelectedCategory(e.target.value ? parseInt(e.target.value) : null)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Toutes les catégories</option>
                {categories.map((cat) => (
                  <option key={cat.id || cat.id_category} value={cat.id || cat.id_category}>
                    {cat.name || cat.complete_name}
                  </option>
                ))}
              </select>

              {/* Mode d'affichage */}
              <div className="flex gap-2 border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Contenu - Liste des produits */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Chargement des produits...</p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.map((product) => {
                  const productId = product.id || product.id_produit || product.id_product;
                  const name = getProductName(product);
                  const code = getProductCode(product);
                  const price = getProductPrice(product);
                  const image = getProductImage(product);
                  const qty = quantities[productId] || 1;
                  const isAdding = adding[productId] || false;
                  const existing = existingProducts.find(ep => ep.product_id === productId);

                  return (
                    <div
                      key={productId}
                      className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      {/* Image */}
                      <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden relative">
                        {image ? (
                          <img src={image} alt={name} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-16 h-16 text-gray-400" />
                        )}
                        {existing && (
                          <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                            Dans {mode === 'order' ? 'commande' : 'devis'}
                          </div>
                        )}
                      </div>

                      {/* Infos */}
                      <div className="p-4">
                        <h3 className="font-bold text-gray-900 mb-1 line-clamp-2">{name}</h3>
                        <p className="text-xs text-gray-500 font-mono mb-2">{code}</p>
                        
                        {/* Prix */}
                        <div className="mb-3">
                          <span className="text-lg font-bold text-green-600">
                            {price.toFixed(2)} TND
                          </span>
                        </div>

                        {/* Quantité */}
                        <div className="mb-3">
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Quantité
                          </label>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleQuantityChange(productId, -1)}
                              className="p-1 rounded hover:bg-gray-200 border border-gray-300"
                              disabled={qty <= 1}
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <input
                              type="number"
                              min="1"
                              value={qty}
                              onChange={(e) => handleQuantityInput(productId, e.target.value)}
                              className="flex-1 px-2 py-1 border border-gray-300 rounded text-center text-sm"
                            />
                            <button
                              onClick={() => handleQuantityChange(productId, 1)}
                              className="p-1 rounded hover:bg-gray-200 border border-gray-300"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Bouton Ajouter */}
                        <button
                          onClick={() => handleAddToOrder(product)}
                          disabled={isAdding}
                          className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                            isAdding
                              ? 'bg-green-500 text-white'
                              : existing
                              ? 'bg-blue-500 text-white hover:bg-blue-600'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        >
                          {isAdding ? (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              Ajouté
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="w-4 h-4" />
                              {existing ? 'Modifier quantité' : `Ajouter à ${mode === 'order' ? 'commande' : 'devis'}`}
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produit</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prix</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantité</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredProducts.map((product) => {
                      const productId = product.id || product.id_produit || product.id_product;
                      const name = getProductName(product);
                      const code = getProductCode(product);
                      const price = getProductPrice(product);
                      const image = getProductImage(product);
                      const qty = quantities[productId] || 1;
                      const isAdding = adding[productId] || false;

                      return (
                        <tr key={productId} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            {image ? (
                              <img src={image} alt={name} className="w-12 h-12 object-cover rounded" />
                            ) : (
                              <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                                <ImageIcon className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-medium text-gray-900">{name}</div>
                            <div className="text-sm text-gray-500 font-mono">{code}</div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-semibold text-green-600">
                              {price.toFixed(2)} TND
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleQuantityChange(productId, -1)}
                                className="p-1 rounded hover:bg-gray-200 border border-gray-300"
                                disabled={qty <= 1}
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <input
                                type="number"
                                min="1"
                                value={qty}
                                onChange={(e) => handleQuantityInput(productId, e.target.value)}
                                className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-sm"
                              />
                              <button
                                onClick={() => handleQuantityChange(productId, 1)}
                                className="p-1 rounded hover:bg-gray-200 border border-gray-300"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => handleAddToOrder(product)}
                              disabled={isAdding}
                              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                                isAdding
                                  ? 'bg-green-500 text-white'
                                  : 'bg-blue-600 text-white hover:bg-blue-700'
                              }`}
                            >
                              {isAdding ? (
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
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {!loading && filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Aucun produit trouvé</p>
                {search && (
                  <p className="text-sm text-gray-500 mt-2">
                    Essayez avec d'autres termes de recherche
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCatalogModal;
