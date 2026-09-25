import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Image as ImageIcon, Package, Tag, Eye, Warehouse, TrendingUp, History, BarChart3, Settings } from 'lucide-react';
import { articlesService } from '../services/api';

interface Article {
  id_article?: number;
  ref_commercial: string;
  ref_fabrication: string;
  produit: string;
  modele: string;
  code_modele: string;
  id_modele?: number;
  nombre_couleur: string;
  code_nombre_couleur: string;
  type_tissage: string;
  dimensions: string;
  code_dimensions: string;
  type_finition: string;
  code_selecteur_01?: string;
  code_selecteur_02?: string;
  code_selecteur_03?: string;
  code_selecteur_04?: string;
  code_selecteur_05?: string;
  code_selecteur_06?: string;
  couleur_article?: string;
  designation_article?: string;
  designation_auto?: boolean;
  description_article?: string;
  total_commander: number;
  total_envoyer: number;
  total_a_fabriquer: number;
  stock_par_entrepot?: any[];
  stock_total?: number;
  quantite_deuxieme_choix?: number;
  historique_mouvements?: any[];
  photo_article?: string;
  dans_catalogue_produit: boolean;
  actif: boolean;
  composition_selecteurs?: {[key: string]: string};
}

const ArticleDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadArticle();
  }, [id]);

  const loadArticle = async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await articlesService.getArticle(parseInt(id));
      console.log('Réponse API getArticle:', response);
      
      const data = response.data?.data || response.data;
      
      if (!data) {
        throw new Error('Aucune donnée retournée par l\'API');
      }
      
      // Mapper les données du backend vers l'interface Article
      const mappedArticle: Article = {
        id_article: data.id_article,
        ref_commercial: data.ref_commerciale || data.code_article || `ART-${id}`,
        ref_fabrication: data.ref_fabrication || data.code_article || `ART-${id}`,
        produit: data.produit || '',
        modele: data.modele || '',
        code_modele: data.code_modele || '',
        id_modele: data.id_modele,
        nombre_couleur: data.nombre_couleur || data.nb_couleurs?.toString() || '1',
        code_nombre_couleur: data.code_nombre_couleur || '',
        type_tissage: data.type_tissage || '',
        dimensions: data.dimensions || data.dimension_libelle || '',
        code_dimensions: data.code_dimensions || data.code_dimension || '',
        type_finition: data.type_finition || data.finition_libelle || '',
        code_selecteur_01: data.code_selecteur_01,
        code_selecteur_02: data.code_selecteur_02,
        code_selecteur_03: data.code_selecteur_03,
        code_selecteur_04: data.code_selecteur_04,
        code_selecteur_05: data.code_selecteur_05,
        code_selecteur_06: data.code_selecteur_06,
        couleur_article: data.couleur_article || data.couleur_nom || '',
        designation_article: data.designation_article || data.designation || data.code_article || `Article ${id}`,
        designation_auto: data.designation_auto,
        description_article: data.description_article || data.specification || '',
        total_commander: data.total_commander || 0,
        total_envoyer: data.total_envoyer || 0,
        total_a_fabriquer: data.total_a_fabriquer || 0,
        stock_par_entrepot: data.stock_par_entrepot,
        stock_total: data.stock_total || 0,
        quantite_deuxieme_choix: data.quantite_deuxieme_choix,
        historique_mouvements: data.historique_mouvements,
        photo_article: data.photo_article || data.image_url,
        dans_catalogue_produit: data.dans_catalogue_produit !== undefined ? data.dans_catalogue_produit : true,
        actif: data.actif !== undefined ? data.actif : true,
        composition_selecteurs: data.composition_selecteurs
      };
      
      setArticle(mappedArticle);
    } catch (err: any) {
      console.error('Erreur chargement article:', err);
      console.error('Détails erreur:', err.response?.data);
      console.error('Status:', err.response?.status);
      console.error('URL:', err.config?.url);
      
      // Fallback : essayer de charger depuis la liste des articles
      try {
        console.log('Tentative de fallback avec getArticles...');
        const articlesRes = await articlesService.getArticles({});
        const articles = articlesRes.data?.data || articlesRes.data || [];
        console.log('Articles chargés:', articles.length);
        
        const foundArticle = articles.find((a: any) => a.id_article === parseInt(id) || a.id_article?.toString() === id);
        
        if (foundArticle) {
          console.log('Article trouvé dans la liste:', foundArticle);
          // Mapper les données
          const mappedArticle: Article = {
            id_article: foundArticle.id_article,
            ref_commercial: foundArticle.ref_commerciale || foundArticle.code_article || `ART-${id}`,
            ref_fabrication: foundArticle.ref_fabrication || foundArticle.code_article || `ART-${id}`,
            produit: foundArticle.produit || '',
            modele: foundArticle.modele || '',
            code_modele: foundArticle.code_modele || '',
            id_modele: foundArticle.id_modele,
            nombre_couleur: foundArticle.nombre_couleur || '1',
            code_nombre_couleur: foundArticle.code_nombre_couleur || '',
            type_tissage: foundArticle.type_tissage || '',
            dimensions: foundArticle.dimensions || foundArticle.dimension_libelle || '',
            code_dimensions: foundArticle.code_dimensions || foundArticle.code_dimension || '',
            type_finition: foundArticle.type_finition || foundArticle.finition_libelle || '',
            couleur_article: foundArticle.couleur_article || foundArticle.couleur_nom || '',
            designation_article: foundArticle.designation_article || foundArticle.designation || foundArticle.code_article || `Article ${id}`,
            total_commander: foundArticle.total_commander || 0,
            total_envoyer: foundArticle.total_envoyer || 0,
            total_a_fabriquer: foundArticle.total_a_fabriquer || 0,
            dans_catalogue_produit: foundArticle.dans_catalogue_produit !== undefined ? foundArticle.dans_catalogue_produit : true,
            actif: foundArticle.actif !== undefined ? foundArticle.actif : true
          };
          setArticle(mappedArticle);
        } else {
          console.error('Article non trouvé dans la liste. ID recherché:', id);
          setError(`Article non trouvé (ID: ${id}). Vérifiez que l'article existe dans la base de données.`);
        }
      } catch (fallbackErr: any) {
        console.error('Erreur fallback:', fallbackErr);
        setError(`Impossible de charger l'article. Erreur: ${fallbackErr.message || 'Erreur inconnue'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!article?.id_article || !window.confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
      return;
    }

    try {
      await articlesService.deleteArticle(article.id_article);
      navigate('/articles');
    } catch (err: any) {
      console.error('Erreur suppression:', err);
      alert('Erreur lors de la suppression');
    }
  };

  if (loading) {
    return (
      <div className="ml-64 p-6 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C8663D]"></div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="ml-64 p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-semibold mb-2">Erreur de chargement</h3>
          <p className="text-red-700 mb-4">{error || 'Article non trouvé'}</p>
          <div className="space-y-2">
            <p className="text-sm text-red-600">
              ID recherché: <span className="font-mono">{id}</span>
            </p>
            <p className="text-sm text-red-600">
              Vérifiez que l'article existe dans la base de données et que vous avez les permissions nécessaires.
            </p>
            <div className="mt-4 flex gap-2">
              <Link
                to="/articles"
                className="inline-block px-4 py-2 bg-[#C8663D] text-white rounded hover:bg-[#a55231]"
              >
                ← Retour à la liste
              </Link>
              <button
                onClick={() => loadArticle()}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Réessayer
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const selecteurs = [
    article.code_selecteur_01,
    article.code_selecteur_02,
    article.code_selecteur_03,
    article.code_selecteur_04,
    article.code_selecteur_05,
    article.code_selecteur_06
  ].filter(s => s);

  return (
    <div className="ml-64 p-6">
      {/* Header avec boutons d'action */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/articles"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Retour</span>
          </Link>
          <div className="h-6 w-px bg-gray-300"></div>
          <h1 className="text-3xl font-bold text-gray-900">{article.designation_article || article.ref_commercial}</h1>
          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm font-mono">
            {article.ref_commercial}
          </span>
          {article.actif ? (
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm">Actif</span>
          ) : (
            <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded text-sm">Inactif</span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/articles?edit=${article.id_article}`)}
            className="flex items-center gap-2 px-4 py-2 bg-[#C8663D] text-white rounded-lg hover:bg-[#a55231]"
          >
            <Edit className="w-4 h-4" />
            Modifier
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <Trash2 className="w-4 h-4" />
            Supprimer
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne principale - Informations détaillées */}
        <div className="lg:col-span-2 space-y-6">
          {/* Photo de l'article */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Photo de l'article
              </h2>
            </div>
            <div className="p-6">
              <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                {article.photo_article ? (
                  <img src={article.photo_article} alt={article.designation_article} className="w-full h-full object-contain" />
                ) : (
                  <ImageIcon className="w-16 h-16 text-gray-400" />
                )}
              </div>
            </div>
          </div>

          {/* Informations générales */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-4 border-b bg-gray-50">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Package className="w-5 h-5" />
                Informations générales
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Référence commerciale</label>
                  <p className="text-gray-900 font-mono">{article.ref_commercial}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Référence fabrication</label>
                  <p className="text-gray-900 font-mono">{article.ref_fabrication}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Produit</label>
                  <p className="text-gray-900">{article.produit}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Modèle</label>
                  <p className="text-gray-900">{article.modele} ({article.code_modele})</p>
                </div>
              </div>
              {article.description_article && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <p className="text-gray-900">{article.description_article}</p>
                </div>
              )}
            </div>
          </div>

          {/* Caractéristiques */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-4 border-b bg-gray-50">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Tag className="w-5 h-5" />
                Caractéristiques
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dimensions</label>
                  <span className="px-3 py-1 bg-[#F5EFE5] text-[#4A5D75] rounded text-sm">
                    {article.dimensions} ({article.code_dimensions})
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type de tissage</label>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm">
                    {article.type_tissage}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de couleurs</label>
                  <span className="px-3 py-1 bg-[#EFF3E7] text-[#4A6C5B] rounded text-sm">
                    {article.nombre_couleur} ({article.code_nombre_couleur})
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type de finition</label>
                  <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded text-sm">
                    {article.type_finition}
                  </span>
                </div>
              </div>
              {article.couleur_article && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Couleur</label>
                  <span className="px-3 py-1 bg-pink-100 text-pink-800 rounded text-sm">
                    {article.couleur_article}
                  </span>
                </div>
              )}
              {selecteurs.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Codes sélecteurs</label>
                  <div className="flex flex-wrap gap-2">
                    {selecteurs.map((sel, idx) => (
                      <span key={idx} className="px-3 py-1 bg-[#E8EFF6] text-[#4A5D75] rounded text-sm">
                        S{String(idx + 1).padStart(2, '0')}: {sel}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Colonne latérale - Informations complémentaires */}
        <div className="space-y-6">
          {/* Stock */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-4 border-b bg-gray-50">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Warehouse className="w-5 h-5" />
                Stock
              </h2>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Stock total</span>
                <span className="font-semibold text-lg">{article.stock_total || 0} unités</span>
              </div>
              {article.quantite_deuxieme_choix !== undefined && (
                <div className="flex justify-between">
                  <span className="text-gray-600">2ème choix</span>
                  <span className="font-medium">{article.quantite_deuxieme_choix} unités</span>
                </div>
              )}
              {article.stock_par_entrepot && article.stock_par_entrepot.length > 0 && (
                <div className="pt-3 border-t">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Par entrepôt</label>
                  {article.stock_par_entrepot.map((stock: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{stock.entrepot || 'Entrepôt'}</span>
                      <span className="font-medium">{stock.quantite || 0}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Statistiques de production */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-4 border-b bg-gray-50">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Production
              </h2>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total commandé</span>
                <span className="font-medium">{article.total_commander || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total envoyé</span>
                <span className="font-medium text-green-600">{article.total_envoyer || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">À fabriquer</span>
                <span className="font-medium text-orange-600">{article.total_a_fabriquer || 0}</span>
              </div>
            </div>
          </div>

          {/* Informations */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-4 border-b bg-gray-50">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Informations
              </h2>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Dans catalogue</span>
                {article.dans_catalogue_produit ? (
                  <span className="px-2 py-1 bg-[#F5EFE5] text-[#4A5D75] rounded text-xs">Oui</span>
                ) : (
                  <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">Non</span>
                )}
              </div>
              {article.designation_auto !== undefined && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Désignation auto</span>
                  {article.designation_auto ? (
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Oui</span>
                  ) : (
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">Non</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Actions rapides */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-4 border-b bg-gray-50">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Actions rapides
              </h2>
            </div>
            <div className="p-4 space-y-2">
              {article.id_modele && (
                <Link
                  to={`/modeles/${article.id_modele}`}
                  className="block w-full text-left px-4 py-2 text-sm text-[#C8663D] hover:bg-[#F5EFE5] rounded"
                >
                  Voir le modèle
                </Link>
              )}
              <Link
                to={`/of?article=${article.id_article}`}
                className="block w-full text-left px-4 py-2 text-sm text-[#C8663D] hover:bg-[#F5EFE5] rounded"
              >
                Voir les OF de cet article
              </Link>
              <Link
                to={`/mouvement?article=${article.id_article}`}
                className="block w-full text-left px-4 py-2 text-sm text-[#C8663D] hover:bg-[#F5EFE5] rounded"
              >
                Voir les mouvements de stock
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetails;
