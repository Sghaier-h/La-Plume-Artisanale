import React, { useState, useEffect } from 'react';
import { articlesCatalogueService, parametresCatalogueService, matieresPremieresService } from '../services/api';
import { Package, PlusCircle, Edit, Trash2, Search, Filter, Settings, Layers } from 'lucide-react';

interface ArticleCatalogue {
  id_article: number;
  code_article: string;
  ref_commerciale: string;
  ref_fabrication: string;
  modele_libelle: string;
  dimension_libelle: string;
  finition_libelle: string;
  tissage_libelle: string;
  nb_couleurs: number;
  selecteurs: any[];
  prix_revient: number;
  temps_production: number;
  actif: boolean;
}

const ArticlesCatalogue: React.FC = () => {
  const [articles, setArticles] = useState<ArticleCatalogue[]>([]);
  const [modeles, setModeles] = useState<any[]>([]);
  const [dimensions, setDimensions] = useState<any[]>([]);
  const [finitions, setFinitions] = useState<any[]>([]);
  const [tissages, setTissages] = useState<any[]>([]);
  const [couleurs, setCouleurs] = useState<any[]>([]);
  const [matieresPremieres, setMatieresPremieres] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    modele: '',
    dimension: '',
    finition: '',
    tissage: '',
    nbCouleurs: ''
  });
  const [showForm, setShowForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState<any>(null);
  const [formData, setFormData] = useState({
    id_modele: '',
    id_dimension: '',
    id_finition: '',
    id_tissage: '',
    nb_couleurs: 1,
    selecteurs: [] as any[],
    prix_revient: '',
    temps_production: '',
    actif: true
  });

  useEffect(() => {
    loadData();
  }, [filters, search]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        articlesRes,
        modelesRes,
        dimensionsRes,
        finitionsRes,
        tissagesRes,
        couleursRes,
        mpRes
      ] = await Promise.all([
        articlesCatalogueService.getCatalogue({ ...filters, search }),
        parametresCatalogueService.getModeles(),
        parametresCatalogueService.getDimensions(),
        parametresCatalogueService.getFinitions(),
        parametresCatalogueService.getTissages(),
        parametresCatalogueService.getCouleurs(),
        matieresPremieresService.getMatieresPremieres()
      ]);

      setArticles(articlesRes.data.data.articles || []);
      setModeles(modelesRes.data.data || []);
      setDimensions(dimensionsRes.data.data || []);
      setFinitions(finitionsRes.data.data || []);
      setTissages(tissagesRes.data.data || []);
      setCouleurs(couleursRes.data.data || []);
      setMatieresPremieres(mpRes.data.data.matieresPremieres || []);
    } catch (err: any) {
      console.error('Erreur chargement catalogue:', err);
      setError(err.response?.data?.error?.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (editingArticle) {
        await articlesCatalogueService.updateArticleCatalogue(editingArticle.id_article, formData);
      } else {
        await articlesCatalogueService.createArticleCatalogue(formData);
      }
      setShowForm(false);
      setEditingArticle(null);
      resetForm();
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Erreur lors de la sauvegarde');
    }
  };

  const handleEdit = (article: ArticleCatalogue) => {
    setEditingArticle(article);
    setFormData({
      id_modele: (article as any).id_modele || '',
      id_dimension: (article as any).id_dimension || '',
      id_finition: (article as any).id_finition || '',
      id_tissage: (article as any).id_tissage || '',
      nb_couleurs: article.nb_couleurs || 1,
      selecteurs: article.selecteurs || [],
      prix_revient: article.prix_revient ? String(article.prix_revient) : '',
      temps_production: article.temps_production ? String(article.temps_production) : '',
      actif: article.actif
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir désactiver cet article ?')) {
      try {
        await articlesCatalogueService.updateArticleCatalogue(id, { actif: false });
        loadData();
      } catch (err) {
        alert('Erreur lors de la suppression');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      id_modele: '',
      id_dimension: '',
      id_finition: '',
      id_tissage: '',
      nb_couleurs: 1,
      selecteurs: [],
      prix_revient: '',
      temps_production: '',
      actif: true
    });
  };

  const addSelecteur = () => {
    setFormData({
      ...formData,
      selecteurs: [...formData.selecteurs, { position: formData.selecteurs.length + 1, id_mp: '', quantite_kg: '' }]
    });
  };

  const updateSelecteur = (index: number, field: string, value: any) => {
    const newSelecteurs = [...formData.selecteurs];
    newSelecteurs[index] = { ...newSelecteurs[index], [field]: value };
    setFormData({ ...formData, selecteurs: newSelecteurs });
  };

  const removeSelecteur = (index: number) => {
    setFormData({
      ...formData,
      selecteurs: formData.selecteurs.filter((_, i) => i !== index)
    });
  };

  if (loading) {
    return (
      <div className="ml-64 p-6 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="ml-64 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              <Layers className="w-8 h-8" />
              Catalogue Articles
            </h1>
            <button
              onClick={() => { setShowForm(true); setEditingArticle(null); resetForm(); }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <PlusCircle className="w-5 h-5" />
              Nouvel Article
            </button>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Filtres */}
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-gray-500" />
              <h3 className="font-semibold">Filtres</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <input
                type="text"
                placeholder="Rechercher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="px-4 py-2 border rounded-lg"
              />
              <select
                value={filters.modele}
                onChange={(e) => setFilters({ ...filters, modele: e.target.value })}
                className="px-4 py-2 border rounded-lg"
              >
                <option value="">Tous modèles</option>
                {modeles.map((m) => (
                  <option key={m.id} value={m.code_modele}>{m.libelle}</option>
                ))}
              </select>
              <select
                value={filters.dimension}
                onChange={(e) => setFilters({ ...filters, dimension: e.target.value })}
                className="px-4 py-2 border rounded-lg"
              >
                <option value="">Toutes dimensions</option>
                {dimensions.map((d) => (
                  <option key={d.id} value={d.code}>{d.libelle}</option>
                ))}
              </select>
              <select
                value={filters.finition}
                onChange={(e) => setFilters({ ...filters, finition: e.target.value })}
                className="px-4 py-2 border rounded-lg"
              >
                <option value="">Toutes finitions</option>
                {finitions.map((f) => (
                  <option key={f.id} value={f.code}>{f.libelle}</option>
                ))}
              </select>
              <select
                value={filters.tissage}
                onChange={(e) => setFilters({ ...filters, tissage: e.target.value })}
                className="px-4 py-2 border rounded-lg"
              >
                <option value="">Tous tissages</option>
                {tissages.map((t) => (
                  <option key={t.id} value={t.code}>{t.libelle}</option>
                ))}
              </select>
              <select
                value={filters.nbCouleurs}
                onChange={(e) => setFilters({ ...filters, nbCouleurs: e.target.value })}
                className="px-4 py-2 border rounded-lg"
              >
                <option value="">Tous</option>
                <option value="1">1 couleur</option>
                <option value="2">2 couleurs</option>
                <option value="3">3 couleurs</option>
                <option value="4">4 couleurs</option>
              </select>
            </div>
          </div>

          {/* Formulaire */}
          {showForm && (
            <div className="bg-white p-6 rounded-lg shadow mb-6">
              <h2 className="text-xl font-bold mb-4">{editingArticle ? 'Modifier' : 'Nouvel'} Article</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Modèle *</label>
                    <select
                      required
                      value={formData.id_modele}
                      onChange={(e) => setFormData({ ...formData, id_modele: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    >
                      <option value="">Sélectionner...</option>
                      {modeles.map((m) => (
                        <option key={m.id} value={m.id}>{m.libelle}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Dimensions *</label>
                    <select
                      required
                      value={formData.id_dimension}
                      onChange={(e) => setFormData({ ...formData, id_dimension: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    >
                      <option value="">Sélectionner...</option>
                      {dimensions.map((d) => (
                        <option key={d.id} value={d.id}>{d.libelle}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Finition *</label>
                    <select
                      required
                      value={formData.id_finition}
                      onChange={(e) => setFormData({ ...formData, id_finition: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    >
                      <option value="">Sélectionner...</option>
                      {finitions.map((f) => (
                        <option key={f.id} value={f.id}>{f.libelle}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Tissage *</label>
                    <select
                      required
                      value={formData.id_tissage}
                      onChange={(e) => setFormData({ ...formData, id_tissage: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    >
                      <option value="">Sélectionner...</option>
                      {tissages.map((t) => (
                        <option key={t.id} value={t.id}>{t.libelle}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Nombre de couleurs *</label>
                    <input
                      type="number"
                      min="1"
                      max="8"
                      required
                      value={formData.nb_couleurs}
                      onChange={(e) => {
                        const nb = parseInt(e.target.value);
                        setFormData({
                          ...formData,
                          nb_couleurs: nb,
                          selecteurs: Array(nb).fill(null).map((_, i) => formData.selecteurs[i] || { position: i + 1, id_mp: '', quantite_kg: '' })
                        });
                      }}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Prix de revient</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.prix_revient}
                      onChange={(e) => setFormData({ ...formData, prix_revient: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Temps production (h)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.temps_production}
                      onChange={(e) => setFormData({ ...formData, temps_production: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                {/* Sélecteurs */}
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold">Sélecteurs (BOM)</h3>
                    <button
                      type="button"
                      onClick={addSelecteur}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm"
                    >
                      + Ajouter
                    </button>
                  </div>
                  {formData.selecteurs.map((sel, index) => (
                    <div key={index} className="grid grid-cols-3 gap-4 mb-2 p-3 bg-gray-50 rounded">
                      <div>
                        <label className="block text-xs font-medium mb-1">Sélecteur {index + 1} - MP</label>
                        <select
                          value={sel.id_mp || ''}
                          onChange={(e) => updateSelecteur(index, 'id_mp', e.target.value)}
                          className="w-full px-3 py-2 border rounded text-sm"
                        >
                          <option value="">Sélectionner MP...</option>
                          {matieresPremieres.map((mp) => (
                            <option key={mp.id_mp} value={mp.id_mp}>
                              {mp.code_mp} - {mp.designation}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">Quantité (kg)</label>
                        <input
                          type="number"
                          step="0.001"
                          value={sel.quantite_kg || ''}
                          onChange={(e) => updateSelecteur(index, 'quantite_kg', e.target.value)}
                          className="w-full px-3 py-2 border rounded text-sm"
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => removeSelecteur(index)}
                          className="bg-red-600 text-white px-3 py-2 rounded text-sm"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-4">
                  <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                    {editingArticle ? 'Modifier' : 'Créer'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowForm(false); setEditingArticle(null); resetForm(); }}
                    className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Liste Catalogue */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Réf. Commerciale</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Modèle</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dimensions</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Finition</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Couleurs</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prix Revient</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {articles.map((article) => (
                    <tr key={article.id_article}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{article.ref_commerciale}</div>
                        <div className="text-xs text-gray-500">{article.ref_fabrication}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{article.modele_libelle}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{article.dimension_libelle}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{article.finition_libelle}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                          {article.nb_couleurs} couleur{article.nb_couleurs > 1 ? 's' : ''}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{article.prix_revient ? `${article.prix_revient} TND` : '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button onClick={() => handleEdit(article)} className="text-blue-600 hover:text-blue-900 mr-3">
                          <Edit className="w-4 h-4 inline" />
                        </button>
                        <button onClick={() => handleDelete(article.id_article)} className="text-red-600 hover:text-red-900">
                          <Trash2 className="w-4 h-4 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticlesCatalogue;
