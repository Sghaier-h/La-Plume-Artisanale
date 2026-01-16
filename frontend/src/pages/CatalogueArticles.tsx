import React, { useEffect, useState } from 'react';
import { ShoppingCart, Plus, Edit, Trash2, Search, Package, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../services/api';

interface ArticleCatalogue {
  id_commande?: number;
  id_article?: number;
  num_client: string;
  num_commande: string;
  ref_commercial: string;
  modele: string;
  type_tissage: string;
  code_dimensions: string;
  type_finition: string;
  personnalisation: string;
  qte_commande: number; // Quantité minimale en stock
  stock_showroom?: number;
  stock_fab?: number;
  reserve?: number;
  a_fabriquer: number;
  ordre_fabrication: boolean;
}

const CatalogueArticles: React.FC = () => {
  const [articles, setArticles] = useState<ArticleCatalogue[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState<ArticleCatalogue | null>(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ modele: '', ordre_fabrication: '' });

  const [formData, setFormData] = useState<ArticleCatalogue>({
    num_client: 'All by Fouta',
    num_commande: 'Catalogue',
    ref_commercial: '',
    modele: '',
    type_tissage: '',
    code_dimensions: '',
    type_finition: '',
    personnalisation: 'Non',
    qte_commande: 0,
    stock_showroom: 0,
    stock_fab: 0,
    reserve: 0,
    a_fabriquer: 0,
    ordre_fabrication: false
  });

  useEffect(() => {
    loadData();
  }, [filters, search]);

  const loadData = async () => {
    setLoading(true);
    try {
      // TODO: Remplacer par l'API réelle
      const mockArticles: ArticleCatalogue[] = [
        {
          id_commande: 1,
          id_article: 1,
          num_client: 'All by Fouta',
          num_commande: 'Catalogue',
          ref_commercial: 'UNS1020-02',
          modele: 'UNI SURPIQUE',
          type_tissage: 'Tissage Plat',
          code_dimensions: '1020',
          type_finition: 'Frange',
          personnalisation: 'Non',
          qte_commande: 60,
          stock_showroom: 0,
          stock_fab: 0,
          reserve: 0,
          a_fabriquer: 60,
          ordre_fabrication: true
        }
      ];
      setArticles(mockArticles);
    } catch (error) {
      console.error('Erreur chargement catalogue:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // TODO: Appel API
      console.log('Sauvegarde article catalogue:', formData);
      setShowForm(false);
      setEditingArticle(null);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Erreur sauvegarde article catalogue:', error);
    }
  };

  const handleEdit = (article: ArticleCatalogue) => {
    setEditingArticle(article);
    setFormData(article);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir retirer cet article du catalogue ?')) {
      try {
        // TODO: Appel API
        console.log('Suppression article catalogue:', id);
        loadData();
      } catch (error) {
        console.error('Erreur suppression article catalogue:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      num_client: 'All by Fouta',
      num_commande: 'Catalogue',
      ref_commercial: '',
      modele: '',
      type_tissage: '',
      code_dimensions: '',
      type_finition: '',
      personnalisation: 'Non',
      qte_commande: 0,
      stock_showroom: 0,
      stock_fab: 0,
      reserve: 0,
      a_fabriquer: 0,
      ordre_fabrication: false
    });
  };

  const filteredArticles = articles.filter(a =>
    a.ref_commercial?.toLowerCase().includes(search.toLowerCase()) ||
    a.modele?.toLowerCase().includes(search.toLowerCase()) ||
    a.num_client?.toLowerCase().includes(search.toLowerCase())
  ).filter(a => {
    if (filters.modele && a.modele !== filters.modele) return false;
    if (filters.ordre_fabrication && a.ordre_fabrication.toString() !== filters.ordre_fabrication) return false;
    return true;
  });

  const modelesUniques = Array.from(new Set(articles.map(a => a.modele)));

  // Calculer les statistiques
  const totalQteCommande = articles.reduce((sum, a) => sum + (a.qte_commande || 0), 0);
  const totalAFabriquer = articles.reduce((sum, a) => sum + (a.a_fabriquer || 0), 0);
  const articlesAvecOF = articles.filter(a => a.ordre_fabrication).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 ml-64 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <ShoppingCart className="w-8 h-8 text-blue-600" />
              Catalogue Produit
            </h1>
            <p className="text-gray-600 mt-2">Articles du catalogue avec quantités minimales (stock de sécurité)</p>
          </div>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingArticle(null);
              resetForm();
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Ajouter au Catalogue
          </button>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-gray-600 text-sm">Quantité Minimale Totale</div>
            <div className="text-2xl font-bold text-blue-600">{totalQteCommande}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-gray-600 text-sm">À Fabriquer</div>
            <div className="text-2xl font-bold text-orange-600">{totalAFabriquer}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-gray-600 text-sm">Avec Ordre de Fabrication</div>
            <div className="text-2xl font-bold text-green-600">{articlesAvecOF}</div>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filters.modele}
              onChange={(e) => setFilters({ ...filters, modele: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous les modèles</option>
              {modelesUniques.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <select
              value={filters.ordre_fabrication}
              onChange={(e) => setFilters({ ...filters, ordre_fabrication: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous</option>
              <option value="true">Avec OF</option>
              <option value="false">Sans OF</option>
            </select>
          </div>
        </div>

        {/* Formulaire */}
        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-bold mb-4">
              {editingArticle ? 'Modifier l\'Article du Catalogue' : 'Ajouter un Article au Catalogue'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Référence Commerciale *</label>
                  <input
                    type="text"
                    value={formData.ref_commercial}
                    onChange={(e) => setFormData({ ...formData, ref_commercial: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Modèle *</label>
                  <input
                    type="text"
                    value={formData.modele}
                    onChange={(e) => setFormData({ ...formData, modele: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type de Tissage</label>
                  <input
                    type="text"
                    value={formData.type_tissage}
                    onChange={(e) => setFormData({ ...formData, type_tissage: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Code Dimensions</label>
                  <input
                    type="text"
                    value={formData.code_dimensions}
                    onChange={(e) => setFormData({ ...formData, code_dimensions: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type de Finition</label>
                  <input
                    type="text"
                    value={formData.type_finition}
                    onChange={(e) => setFormData({ ...formData, type_finition: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Personnalisation</label>
                  <select
                    value={formData.personnalisation}
                    onChange={(e) => setFormData({ ...formData, personnalisation: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Non">Non</option>
                    <option value="Oui">Oui</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantité Minimale (Stock de Sécurité) *
                  </label>
                  <input
                    type="number"
                    value={formData.qte_commande}
                    onChange={(e) => {
                      const qte = parseInt(e.target.value);
                      setFormData({ 
                        ...formData, 
                        qte_commande: qte,
                        a_fabriquer: qte - (formData.stock_showroom || 0) - (formData.stock_fab || 0) - (formData.reserve || 0)
                      });
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="0"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Quantité minimale à maintenir en stock</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock Showroom</label>
                  <input
                    type="number"
                    value={formData.stock_showroom || 0}
                    onChange={(e) => {
                      const stock = parseInt(e.target.value) || 0;
                      setFormData({ 
                        ...formData, 
                        stock_showroom: stock,
                        a_fabriquer: (formData.qte_commande || 0) - stock - (formData.stock_fab || 0) - (formData.reserve || 0)
                      });
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock Fab</label>
                  <input
                    type="number"
                    value={formData.stock_fab || 0}
                    onChange={(e) => {
                      const stock = parseInt(e.target.value) || 0;
                      setFormData({ 
                        ...formData, 
                        stock_fab: stock,
                        a_fabriquer: (formData.qte_commande || 0) - (formData.stock_showroom || 0) - stock - (formData.reserve || 0)
                      });
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Réservé</label>
                  <input
                    type="number"
                    value={formData.reserve || 0}
                    onChange={(e) => {
                      const reserve = parseInt(e.target.value) || 0;
                      setFormData({ 
                        ...formData, 
                        reserve: reserve,
                        a_fabriquer: (formData.qte_commande || 0) - (formData.stock_showroom || 0) - (formData.stock_fab || 0) - reserve
                      });
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">À Fabriquer</label>
                  <div className="px-4 py-2 bg-orange-50 border border-orange-200 rounded-lg font-semibold text-orange-700">
                    {formData.a_fabriquer || 0}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Calculé automatiquement</p>
                </div>
                <div className="col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.ordre_fabrication}
                      onChange={(e) => setFormData({ ...formData, ordre_fabrication: e.target.checked })}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Ordre de Fabrication créé</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Enregistrer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingArticle(null);
                    resetForm();
                  }}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Liste des articles du catalogue */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ref Commerciale</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Modèle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qte Minimale</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock Showroom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock Fab</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Réservé</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">À Fabriquer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">OF</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredArticles.map((article) => {
                const besoinFabrication = (article.qte_commande || 0) - (article.stock_showroom || 0) - (article.stock_fab || 0) - (article.reserve || 0);
                const alerteStock = besoinFabrication > 0;
                
                return (
                  <tr key={article.id_commande} className={`hover:bg-gray-50 ${alerteStock ? 'bg-orange-50' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-sm font-medium">{article.ref_commercial}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{article.modele}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                        {article.qte_commande}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{article.stock_showroom || 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{article.stock_fab || 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{article.reserve || 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {besoinFabrication > 0 ? (
                        <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs font-medium flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {besoinFabrication}
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          0
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {article.ordre_fabrication ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Oui</span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">Non</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button
                          onClick={() => article.id_commande && handleEdit(article)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => article.id_commande && handleDelete(article.id_commande)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CatalogueArticles;
