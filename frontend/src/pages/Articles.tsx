import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Plus, Edit, Trash2, Search, RefreshCw, Upload, Image as ImageIcon, Eye, CheckSquare, XSquare, Save, FileText, Settings, Tag, X, Warehouse, TrendingUp, History, List, Grid, BarChart3, ArrowLeft } from 'lucide-react';
import { produitsService, articlesService, parametresCatalogueService, modelesService } from '../services/api';
import { genererRefCommerciale, genererRefFabrication } from '../utils/references';
import api from '../services/api';

interface Modele {
  id_modele: number;
  code_modele: string;
  designation: string;
  produit: string;
  code_dimensions: string;
  type_tissage: string;
  code_type_tissage: string;
  nombre_couleur: string;
  code_nombre_couleur: string;
  type_finition: string;
  code_type_finition: string;
  prix_reviens: number;
  prix_vente: number;
  prix_multiple?: Array<{montant: number; devise: string; libelle: string; actif: boolean}>;
}

interface Attribut {
  id_attribut: number;
  code_attribut: string;
  libelle: string;
  type_attribut: string;
  valeurs_possibles: Array<{code: string; libelle: string; couleur_hex?: string}>;
}

interface StockEntrepot {
  entrepot: string;
  quantite: number;
  statut: string; // 'disponible', 'reserve', 'bloque', etc.
}

interface MouvementStock {
  id_mouvement?: number;
  date_mouvement: string;
  type_mouvement: string; // 'entree', 'sortie', 'transfert', '2eme_choix', etc.
  quantite: number;
  entrepot_origine?: string;
  entrepot_destination?: string;
  motif?: string;
  effectue_par?: string;
}

interface Article {
  id_article?: number;
  ref_commercial: string;
  ref_fabrication: string;
  produit: string;
  modele: string;
  code_modele: string;
  id_modele?: number; // ID du modèle pour récupérer les prix
  nombre_couleur: string;
  code_nombre_couleur: string;
  type_tissage: string;
  id_tissage?: number;
  code_type_tissage?: string;
  dimensions: string;
  code_dimensions: string;
  id_dimension?: number;
  type_finition: string;
  code_type_finition?: string;
  id_finition?: number;
  code_selecteur_01?: string;
  code_selecteur_02?: string;
  code_selecteur_03?: string;
  code_selecteur_04?: string;
  code_selecteur_05?: string;
  code_selecteur_06?: string;
  couleur_article?: string;
  code_couleur_article?: string;
  designation_article?: string; // Désignation de l'article (générée automatiquement)
  designation_auto?: boolean; // Indique si la désignation est générée automatiquement
  description_article?: string;
  description_auto?: boolean; // Indique si la description est générée automatiquement
  couleur_auto?: boolean; // Indique si la couleur est générée automatiquement
  prix_revient?: number;
  prix_vente?: number;
  qte_minimal_stock?: number;
  vente_ecommerce?: boolean;
  total_commander: number;
  total_envoyer: number;
  total_a_fabriquer: number;
  // Stock par entrepôt
  stock_par_entrepot?: StockEntrepot[]; // Stock détaillé par entrepôt
  stock_total?: number; // Stock total (somme de tous les entrepôts)
  quantite_deuxieme_choix?: number; // Quantité 2ème choix (à calculer prochainement)
  historique_mouvements?: MouvementStock[]; // Historique des mouvements de stock
  photo_article?: string;
  dans_catalogue_produit: boolean;
  actif: boolean;
  composition_selecteurs?: {[key: string]: string}; // Pour la production
}

const Articles: React.FC = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [modeles, setModeles] = useState<Modele[]>([]);
  const [attributs, setAttributs] = useState<Attribut[]>([]);
  const [typesTissages, setTypesTissages] = useState<any[]>([]);
  const [dimensions, setDimensions] = useState<any[]>([]);
  const [finitions, setFinitions] = useState<any[]>([]);
  const [couleurs, setCouleurs] = useState<any[]>([]);
  const [nombreCouleurs, setNombreCouleurs] = useState<any[]>([]);
  const [selectedArticleForStock, setSelectedArticleForStock] = useState<Article | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [showStockDetail, setShowStockDetail] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [selectedModele, setSelectedModele] = useState<Modele | null>(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ modele: '', actif: '', catalogue: '' });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  // Plus besoin d'onglet paramètres - c'est au niveau de la catégorie maintenant
  const [affichageMode, setAffichageMode] = useState<'ligne' | 'catalogue'>('ligne'); // Simple toggle ligne/catalogue
  const [selectedModeleCatalogue, setSelectedModeleCatalogue] = useState<string | null>(null); // Modèle sélectionné dans le mode catalogue

  const [formData, setFormData] = useState<Article>({
    ref_commercial: '',
    ref_fabrication: '',
    produit: '',
    modele: '',
    code_modele: '',
    id_modele: undefined, // ID du modèle pour récupérer les prix
    nombre_couleur: '',
    code_nombre_couleur: '',
    type_tissage: '',
    id_tissage: undefined,
    code_type_tissage: '',
    dimensions: '',
    code_dimensions: '',
    id_dimension: undefined,
    type_finition: '',
    code_type_finition: '',
    id_finition: undefined,
    code_selecteur_01: '',
    code_selecteur_02: '',
    code_selecteur_03: '',
    code_selecteur_04: '',
    code_selecteur_05: '',
    code_selecteur_06: '',
    couleur_article: '',
    code_couleur_article: '',
    designation_article: '',
    designation_auto: true,
    description_article: '',
    description_auto: true, // Génération automatique de la description
    couleur_auto: true, // Génération automatique de la couleur article
    prix_revient: 0,
    prix_vente: 0,
    qte_minimal_stock: 0,
    vente_ecommerce: false,
    total_commander: 0,
    total_envoyer: 0,
    total_a_fabriquer: 0,
    dans_catalogue_produit: false,
    actif: true,
    composition_selecteurs: {}
  });

  useEffect(() => {
    loadData();
  }, [filters, search]);

  // Fonction pour récupérer le modèle associé à un article
  const getModeleForArticle = (article: Article): Modele | null => {
    if (article.id_modele) {
      return modeles.find(m => m.id_modele === article.id_modele) || null;
    }
    // Fallback : chercher par code_modele
    return modeles.find(m => m.code_modele === article.code_modele) || null;
  };

  // Fonction pour récupérer les prix depuis le modèle
  const getPrixFromModele = (article: Article) => {
    const modele = getModeleForArticle(article);
    if (!modele) {
      return { prix_reviens: 0, prix_vente: 0, prix_multiple: [] };
    }
    return {
      prix_reviens: modele.prix_reviens || 0,
      prix_vente: modele.prix_vente || 0,
      prix_multiple: modele.prix_multiple || []
    };
  };

  const loadData = async () => {
    setLoading(true);
    try {
      // TODO: Remplacer par l'API réelle
      const mockArticles: Article[] = [
        {
          id_article: 1,
          id_modele: 1, // ID du modèle pour récupérer les prix
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
          code_selecteur_01: 'C02',
          code_selecteur_02: 'C03',
          total_commander: 80,
          total_envoyer: 0,
          total_a_fabriquer: 80,
          stock_par_entrepot: [
            { entrepot: 'Entrepôt Principal', quantite: 45, statut: 'disponible' },
            { entrepot: 'Showroom', quantite: 12, statut: 'disponible' },
            { entrepot: 'Réserve', quantite: 8, statut: 'reserve' }
          ],
          stock_total: 65,
          quantite_deuxieme_choix: 0, // À calculer prochainement
          historique_mouvements: [
            { date_mouvement: '2024-01-15T10:30:00', type_mouvement: 'entree', quantite: 50, entrepot_destination: 'Entrepôt Principal', motif: 'Réception production', effectue_par: 'Magasinier PF' },
            { date_mouvement: '2024-01-16T14:20:00', type_mouvement: 'sortie', quantite: 5, entrepot_origine: 'Entrepôt Principal', motif: 'Expédition commande', effectue_par: 'Magasinier PF' }
          ],
          dans_catalogue_produit: true,
          actif: true
        }
      ];
      setArticles(mockArticles);

      // Charger les modèles
      const mockModeles: Modele[] = [
        {
          id_modele: 1,
          code_modele: 'AR',
          designation: 'ARTHUR',
          produit: 'Fouta',
          code_dimensions: '1020',
          type_tissage: 'Tissage Plat',
          code_type_tissage: 'PL',
          nombre_couleur: '2 Couleurs',
          code_nombre_couleur: 'B',
          type_finition: 'Frange',
          code_type_finition: 'FR',
          prix_reviens: 7.5,
          prix_vente: 9.75
        }
      ];
      setModeles(mockModeles);

      // Charger les couleurs depuis l'API
      try {
        const couleursRes = await parametresCatalogueService.getCouleurs();
        setCouleurs(couleursRes.data?.data || couleursRes.data || []);
      } catch (error) {
        console.error('Erreur chargement couleurs:', error);
      }

      // Charger les nombre de couleurs depuis l'API
      try {
        const nbCouleursRes = await parametresCatalogueService.getNombreCouleurs();
        setNombreCouleurs(nbCouleursRes.data?.data || nbCouleursRes.data || []);
      } catch (error) {
        console.error('Erreur chargement nombre de couleurs:', error);
      }

      // Charger les attributs (pour compatibilité)
      try {
        const attributsRes = await produitsService.getAttributs();
        setAttributs(attributsRes.data.data || []);
      } catch (error) {
        console.error('Erreur chargement attributs:', error);
      }
    } catch (error) {
      console.error('Erreur chargement articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleModeleChange = async (modeleId: number) => {
    const modele = modeles.find(m => m.id_modele === modeleId);
    if (modele) {
      // Charger les détails complets du modèle depuis l'API
      try {
        const modeleRes = await modelesService.getModele(modeleId);
        const modeleComplet = modeleRes.data?.data || modeleRes.data || modele;
        setSelectedModele(modeleComplet);
        
        setFormData({
          ...formData,
          id_modele: modeleComplet.id || modele.id_modele,
          modele: modeleComplet.libelle || modeleComplet.designation || modele.designation,
          code_modele: modeleComplet.code_modele || modele.code_modele,
          produit: modeleComplet.produit || modele.produit,
          // Réinitialiser les autres champs pour forcer la sélection
          code_dimensions: '',
          id_dimension: undefined,
          dimensions: '',
          id_tissage: undefined,
          code_type_tissage: '',
          type_tissage: '',
          id_finition: undefined,
          code_type_finition: '',
          type_finition: '',
          code_nombre_couleur: '',
          nombre_couleur: '',
          code_selecteur_01: '',
          code_selecteur_02: '',
          code_selecteur_03: '',
          code_selecteur_04: '',
          code_selecteur_05: '',
          code_selecteur_06: ''
        });
      } catch (error) {
        console.error('Erreur chargement modèle:', error);
        setSelectedModele(modele);
        setFormData({
          ...formData,
          id_modele: modele.id_modele,
          modele: modele.designation,
          code_modele: modele.code_modele,
          produit: modele.produit
        });
      }
    }
  };

  // Générer automatiquement la désignation de l'article
  const genererDesignationArticle = (): string => {
    const parts: string[] = [];
    
    // Désignation du modèle
    if (formData.modele || selectedModele?.designation) {
      parts.push(formData.modele || selectedModele?.designation || '');
    }
    
    // Dimensions
    if (formData.dimensions || formData.code_dimensions) {
      const dimAttribut = attributs.find(a => a.code_attribut.toLowerCase().includes('dim'));
      const dimValeur = dimAttribut?.valeurs_possibles?.find(v => 
        v.code === formData.code_dimensions || v.libelle === formData.dimensions
      );
      if (dimValeur?.libelle) {
        parts.push(dimValeur.libelle);
      } else if (formData.dimensions) {
        parts.push(formData.dimensions);
      }
    }
    
    // Couleurs (Sélecteurs)
    const selecteurs = [
      formData.code_selecteur_01,
      formData.code_selecteur_02,
      formData.code_selecteur_03,
      formData.code_selecteur_04,
      formData.code_selecteur_05,
      formData.code_selecteur_06
    ].filter(s => s && s.trim() !== '');
    
    if (selecteurs.length > 0) {
      const couleurAttribut = attributs.find(a => 
        a.code_attribut.toLowerCase().includes('coul') || 
        a.libelle.toLowerCase().includes('couleur')
      );
      
      selecteurs.forEach((code, index) => {
        const couleurValeur = couleurAttribut?.valeurs_possibles?.find(v => v.code === code);
        if (couleurValeur?.libelle) {
          parts.push(`Couleur S${String(index + 1).padStart(2, '0')}: ${couleurValeur.libelle}`);
        } else if (code) {
          parts.push(`Couleur S${String(index + 1).padStart(2, '0')}: ${code}`);
        }
      });
    }
    
    return parts.filter(p => p.trim() !== '').join(' + ');
  };

  // Générer la couleur article (concatenation des couleurs composées)
  const genererCouleurArticle = (): string => {
    const selecteurs = [
      formData.code_selecteur_01,
      formData.code_selecteur_02,
      formData.code_selecteur_03,
      formData.code_selecteur_04,
      formData.code_selecteur_05,
      formData.code_selecteur_06
    ].filter(s => s && s.trim() !== '');

    if (selecteurs.length === 0) return '';

    const couleurAttribut = attributs.find(a => 
      a.code_attribut.toLowerCase().includes('coul') || 
      a.libelle.toLowerCase().includes('couleur')
    );

    const couleurs = selecteurs.map(code => {
      const couleurValeur = couleurAttribut?.valeurs_possibles?.find(v => v.code === code);
      return couleurValeur?.libelle || code;
    });

    return couleurs.join(' ');
  };

  // Fonction pour obtenir les couleurs possibles depuis les attributs
  const getCouleursPossibles = () => {
    const couleurAttribut = attributs.find(a => 
      a.code_attribut.toLowerCase().includes('coul') || 
      a.libelle.toLowerCase().includes('couleur')
    );
    return couleurAttribut?.valeurs_possibles || [];
  };

  // Générer la description article : Description du modèle + " Couleur " + Couleur Article
  const genererDescriptionArticle = (): string => {
    const descriptionModele = selectedModele?.designation || formData.modele || '';
    const couleurArticle = genererCouleurArticle();
    
    if (!descriptionModele) return '';
    
    if (couleurArticle) {
      return `${descriptionModele} Couleur ${couleurArticle}`;
    }
    return descriptionModele;
  };

  const genererReferences = () => {
    if (!selectedModele || !formData.code_modele || !formData.code_dimensions || !formData.code_nombre_couleur) {
      return;
    }

    const articleData = {
      code_modele: formData.code_modele,
      code_dimensions: formData.code_dimensions,
      code_nombre_couleur: formData.code_nombre_couleur,
      code_selecteur_01: formData.code_selecteur_01 || '',
      code_selecteur_02: formData.code_selecteur_02 || '',
      code_selecteur_03: formData.code_selecteur_03 || '',
      code_selecteur_04: formData.code_selecteur_04 || '',
      code_selecteur_05: formData.code_selecteur_05 || '',
      code_selecteur_06: formData.code_selecteur_06 || ''
    };

    const refCommerciale = genererRefCommerciale(articleData);
    const refFabrication = genererRefFabrication(articleData);
    // Code couleur article généré automatiquement à partir des sélecteurs
    const codeCouleurArticle = [
      articleData.code_selecteur_01,
      articleData.code_selecteur_02,
      articleData.code_selecteur_03,
      articleData.code_selecteur_04,
      articleData.code_selecteur_05,
      articleData.code_selecteur_06
    ].filter(Boolean).join('');
    
    // Générer couleur et description seulement si l'option auto est activée
    const couleurArticle = formData.couleur_auto !== false ? genererCouleurArticle() : formData.couleur_article;
    const descriptionArticle = formData.description_auto !== false ? genererDescriptionArticle() : formData.description_article;

    setFormData({
      ...formData,
      ref_commercial: refCommerciale,
      ref_fabrication: refFabrication,
      code_couleur_article: codeCouleurArticle,
      couleur_article: couleurArticle,
      description_article: descriptionArticle,
      designation_article: formData.designation_auto ? genererDesignationArticle() : formData.designation_article
    });
  };

  // Mettre à jour automatiquement quand les éléments changent
  useEffect(() => {
    if (selectedModele && formData.designation_auto) {
      const autoDesignation = genererDesignationArticle();
      setFormData(prev => ({ ...prev, designation_article: autoDesignation }));
    }
  }, [formData.modele, formData.dimensions, formData.code_dimensions, formData.code_selecteur_01, formData.code_selecteur_02, formData.code_selecteur_03, formData.code_selecteur_04, formData.code_selecteur_05, formData.code_selecteur_06, selectedModele, attributs]);

  // Générer la couleur article automatiquement si l'option est activée
  useEffect(() => {
    if (formData.couleur_auto !== false && (formData.code_selecteur_01 || formData.code_selecteur_02 || formData.code_selecteur_03)) {
      const autoCouleur = genererCouleurArticle();
      setFormData(prev => ({ ...prev, couleur_article: autoCouleur }));
    }
  }, [formData.code_selecteur_01, formData.code_selecteur_02, formData.code_selecteur_03, formData.code_selecteur_04, formData.code_selecteur_05, formData.code_selecteur_06, formData.couleur_auto, couleurs]);

  // Générer la description article automatiquement si l'option est activée
  useEffect(() => {
    if (formData.description_auto !== false && selectedModele && formData.couleur_article) {
      const autoDescription = genererDescriptionArticle();
      setFormData(prev => ({ ...prev, description_article: autoDescription }));
    }
  }, [formData.couleur_article, selectedModele, formData.description_auto]);

  // Générer les références automatiquement
  useEffect(() => {
    if (selectedModele && formData.code_modele && formData.code_dimensions && formData.code_nombre_couleur) {
      genererReferences();
    }
  }, [formData.code_modele, formData.code_dimensions, formData.code_nombre_couleur, formData.code_selecteur_01, formData.code_selecteur_02, formData.code_selecteur_03, formData.code_selecteur_04, formData.code_selecteur_05, formData.code_selecteur_06, selectedModele]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      
      // Ajouter les données du formulaire
      Object.keys(formData).forEach(key => {
        if (key !== 'photo_article' && key !== 'composition_selecteurs') {
          formDataToSend.append(key, (formData as any)[key]);
        }
      });

      // Ajouter la composition des sélecteurs (pour la production)
      if (formData.composition_selecteurs) {
        formDataToSend.append('composition_selecteurs', JSON.stringify(formData.composition_selecteurs));
      }

      // Ajouter la photo si elle existe
      if (photoFile) {
        formDataToSend.append('photo', photoFile);
      }

      // TODO: Appel API
      console.log('Sauvegarde article:', formData);
      if (photoFile) {
        console.log('Photo à uploader:', photoFile.name);
      }

      setShowForm(false);
      setEditingArticle(null);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Erreur sauvegarde article:', error);
    }
  };

  const handleEdit = (article: Article) => {
    setEditingArticle(article);
    setFormData(article);
    setPhotoPreview(article.photo_article || '');
    setPhotoFile(null);
    
    // Trouver le modèle correspondant
    const modele = modeles.find(m => m.code_modele === article.code_modele);
    if (modele) {
      setSelectedModele(modele);
    }
    
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
      try {
        // TODO: Appel API
        console.log('Suppression article:', id);
        loadData();
      } catch (error) {
        console.error('Erreur suppression article:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      ref_commercial: '',
      ref_fabrication: '',
      produit: '',
      modele: '',
      code_modele: '',
      nombre_couleur: '',
      code_nombre_couleur: '',
      type_tissage: '',
      dimensions: '',
      code_dimensions: '',
      type_finition: '',
      code_selecteur_01: '',
      code_selecteur_02: '',
      code_selecteur_03: '',
      code_selecteur_04: '',
      code_selecteur_05: '',
      code_selecteur_06: '',
      couleur_article: '',
      description_article: '',
      total_commander: 0,
      total_envoyer: 0,
      total_a_fabriquer: 0,
      dans_catalogue_produit: false,
      actif: true,
      composition_selecteurs: {}
    });
    setSelectedModele(null);
    setPhotoFile(null);
    setPhotoPreview('');
  };

  // Récupérer les valeurs possibles pour les couleurs depuis les attributs
  // Les couleurs sont maintenant chargées depuis l'API dans loadData

  const filteredArticles = articles.filter(a =>
    a.ref_commercial?.toLowerCase().includes(search.toLowerCase()) ||
    a.ref_fabrication?.toLowerCase().includes(search.toLowerCase()) ||
    a.modele?.toLowerCase().includes(search.toLowerCase()) ||
    a.produit?.toLowerCase().includes(search.toLowerCase())
  ).filter(a => {
    if (filters.modele && a.code_modele !== filters.modele) return false;
    if (filters.actif && a.actif.toString() !== filters.actif) return false;
    if (filters.catalogue && a.dans_catalogue_produit.toString() !== filters.catalogue) return false;
    // Dans le mode catalogue, filtrer par modèle sélectionné
    if (affichageMode === 'catalogue' && selectedModeleCatalogue && a.code_modele !== selectedModeleCatalogue) return false;
    return true;
  });

  // Articles du catalogue uniquement
  const articlesCatalogue = articles.filter(a => a.dans_catalogue_produit === true && a.actif === true);

  // Grouper les articles du catalogue par modèle
  const modelesCatalogue = Array.from(new Set(articlesCatalogue.map(a => a.code_modele)))
    .map(codeModele => {
      const articlesDuModele = articlesCatalogue.filter(a => a.code_modele === codeModele);
      const premierArticle = articlesDuModele[0];
      return {
        code_modele: codeModele,
        modele: premierArticle?.modele || '',
        produit: premierArticle?.produit || '',
        nombre_articles: articlesDuModele.length,
        photo: premierArticle?.photo_article || null
      };
    })
    .sort((a, b) => a.modele.localeCompare(b.modele));

  const modelesUniques = Array.from(new Set(modeles.map(m => m.code_modele)));

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
              <Package className="w-8 h-8 text-blue-600" />
              Gestion des Articles
            </h1>
            <p className="text-gray-600 mt-2">Création et gestion des articles générés à partir des modèles</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setShowForm(true);
                setEditingArticle(null);
                resetForm();
              }}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Nouvel Article
            </button>
          </div>
        </div>

        {/* Toggle Affichage et Filtres */}
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              {modelesUniques.map(code => (
                <option key={code} value={code}>{code}</option>
              ))}
            </select>
            <select
              value={filters.catalogue}
              onChange={(e) => setFilters({ ...filters, catalogue: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous</option>
              <option value="true">Dans catalogue</option>
              <option value="false">Hors catalogue</option>
            </select>
            <select
              value={filters.actif}
              onChange={(e) => setFilters({ ...filters, actif: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous les statuts</option>
              <option value="true">Actifs</option>
              <option value="false">Inactifs</option>
            </select>
          </div>
        </div>

        {/* Formulaire Article */}
        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-bold mb-4">
              {editingArticle ? 'Modifier l\'Article' : 'Nouvel Article'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Section Sélection Modèle */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-700">Sélection du Modèle</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Modèle *</label>
                    <select
                      value={selectedModele?.id_modele || ''}
                      onChange={(e) => handleModeleChange(parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Sélectionner un modèle...</option>
                      {modeles.map(m => (
                        <option key={m.id_modele} value={m.id_modele}>
                          {m.code_modele} - {m.designation} ({m.produit})
                        </option>
                      ))}
                    </select>
                  </div>
                  {selectedModele && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-600">
                        <div><strong>Produit:</strong> {selectedModele.produit}</div>
                        <div><strong>Type Tissage:</strong> {selectedModele.type_tissage}</div>
                        <div><strong>Nombre Couleurs:</strong> {selectedModele.nombre_couleur}</div>
                        <div><strong>Finition:</strong> {selectedModele.type_finition}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Section Attributs Obligatoires */}
              {selectedModele && (
                <div className="border-b pb-4">
                  <h3 className="text-lg font-semibold mb-4 text-gray-700">Attributs Obligatoires</h3>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    {/* Type de Tissage */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Type de Tissage *</label>
                      <select
                        value={formData.id_tissage || ''}
                        onChange={(e) => {
                          const tissageId = e.target.value ? parseInt(e.target.value) : undefined;
                          const tissage = typesTissages.find(t => t.id === tissageId);
                          setFormData({ 
                            ...formData, 
                            id_tissage: tissageId,
                            code_type_tissage: tissage?.code || '',
                            type_tissage: tissage?.libelle || ''
                          });
                          genererReferences();
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Sélectionner...</option>
                        {typesTissages.map(t => (
                          <option key={t.id} value={t.id}>{t.code} - {t.libelle}</option>
                        ))}
                      </select>
                    </div>

                    {/* Dimensions */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Dimensions *</label>
                      <select
                        value={formData.id_dimension || ''}
                        onChange={(e) => {
                          const dimensionId = e.target.value ? parseInt(e.target.value) : undefined;
                          const dimension = dimensions.find(d => d.id === dimensionId);
                          setFormData({ 
                            ...formData, 
                            id_dimension: dimensionId,
                            code_dimensions: dimension?.code || '',
                            dimensions: dimension?.libelle || ''
                          });
                          genererReferences();
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Sélectionner...</option>
                        {dimensions.map(d => (
                          <option key={d.id} value={d.id}>{d.code} - {d.libelle}</option>
                        ))}
                      </select>
                    </div>

                    {/* Type de Finition */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Type de Finition *</label>
                      <select
                        value={formData.id_finition || ''}
                        onChange={(e) => {
                          const finitionId = e.target.value ? parseInt(e.target.value) : undefined;
                          const finition = finitions.find(f => f.id === finitionId);
                          setFormData({ 
                            ...formData, 
                            id_finition: finitionId,
                            code_type_finition: finition?.code || '',
                            type_finition: finition?.libelle || ''
                          });
                          genererReferences();
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Sélectionner...</option>
                        {finitions.map(f => (
                          <option key={f.id} value={f.id}>{f.code} - {f.libelle}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Nombre de Couleurs */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de Couleurs *</label>
                    <select
                      value={formData.code_nombre_couleur || ''}
                      onChange={(e) => {
                        const codeNbCouleur = e.target.value;
                        const nbCouleur = nombreCouleurs.find(nc => nc.code === codeNbCouleur);
                        setFormData({ 
                          ...formData, 
                          code_nombre_couleur: codeNbCouleur,
                          nombre_couleur: nbCouleur?.libelle || '',
                          // Réinitialiser les selecteurs
                          code_selecteur_01: '',
                          code_selecteur_02: '',
                          code_selecteur_03: '',
                          code_selecteur_04: '',
                          code_selecteur_05: '',
                          code_selecteur_06: ''
                        });
                        genererReferences();
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Sélectionner...</option>
                      {nombreCouleurs.map(nc => (
                        <option key={nc.code} value={nc.code}>{nc.code} - {nc.libelle}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Section Sélection des Couleurs (Sélecteurs) */}
              {selectedModele && formData.code_nombre_couleur && (
                <div className="border-b pb-4">
                  <h3 className="text-lg font-semibold mb-4 text-gray-700">Sélection des Couleurs (Sélecteurs)</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {formData.code_nombre_couleur === 'U' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Code Selecteur 01 (Couleur Unique) *</label>
                        <select
                          value={formData.code_selecteur_01}
                          onChange={(e) => {
                            setFormData({ ...formData, code_selecteur_01: e.target.value });
                            genererReferences();
                          }}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          required
                        >
                          <option value="">Sélectionner...</option>
                          {couleurs.map(c => (
                            <option key={c.code_commercial || c.code} value={c.code_commercial || c.code}>
                              {c.code_commercial || c.code} - {c.nom || c.libelle}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    {formData.code_nombre_couleur === 'B' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Code Selecteur 01 (Couleur 1) *</label>
                          <select
                            value={formData.code_selecteur_01}
                            onChange={(e) => {
                              setFormData({ ...formData, code_selecteur_01: e.target.value });
                              genererReferences();
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            required
                          >
                            <option value="">Sélectionner...</option>
                            {couleurs.map(c => (
                              <option key={c.code_commercial || c.code} value={c.code_commercial || c.code}>
                                {c.code_commercial || c.code} - {c.nom || c.libelle}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Code Selecteur 02 (Couleur 2) *</label>
                          <select
                            value={formData.code_selecteur_02}
                            onChange={(e) => {
                              setFormData({ ...formData, code_selecteur_02: e.target.value });
                              genererReferences();
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            required
                          >
                            <option value="">Sélectionner...</option>
                            {couleurs.map(c => (
                              <option key={c.code_commercial || c.code} value={c.code_commercial || c.code}>
                                {c.code_commercial || c.code} - {c.nom || c.libelle}
                              </option>
                            ))}
                          </select>
                        </div>
                      </>
                    )}
                    {['T', 'Q', 'C', 'S'].includes(formData.code_nombre_couleur) && (
                      <>
                        {[1, 2, 3, 4, 5, 6].slice(0, 
                          formData.code_nombre_couleur === 'T' ? 3 :
                          formData.code_nombre_couleur === 'Q' ? 4 :
                          formData.code_nombre_couleur === 'C' ? 5 : 6
                        ).map(num => (
                          <div key={num}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Code Selecteur {String(num).padStart(2, '0')} (Couleur {num}) *
                            </label>
                            <select
                              value={formData[`code_selecteur_${String(num).padStart(2, '0')}` as keyof Article] as string || ''}
                              onChange={(e) => {
                                const newData = { ...formData };
                                (newData as any)[`code_selecteur_${String(num).padStart(2, '0')}`] = e.target.value;
                                setFormData(newData);
                                genererReferences();
                              }}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              required
                            >
                              <option value="">Sélectionner...</option>
                              {getCouleursPossibles().map(c => (
                                <option key={c.code} value={c.code}>{c.code} - {c.libelle}</option>
                              ))}
                            </select>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Section Références Générées */}
              {(formData.ref_commercial || formData.ref_fabrication) && (
                <div className="border-b pb-4">
                  <h3 className="text-lg font-semibold mb-4 text-gray-700">Références Générées Automatiquement</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Référence Commerciale</label>
                      <div className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg font-mono text-sm">
                        {formData.ref_commercial || 'Génération automatique...'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Référence Fabrication</label>
                      <div className="px-4 py-2 bg-green-50 border border-green-200 rounded-lg font-mono text-sm">
                        {formData.ref_fabrication || 'Génération automatique...'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Section Informations Complémentaires */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-700">Informations Complémentaires</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dimensions</label>
                    <input
                      type="text"
                      value={formData.dimensions}
                      onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: 100/200 CM"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-sm font-medium text-gray-700">Couleur Article</label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.couleur_auto !== false}
                          onChange={(e) => {
                            const auto = e.target.checked;
                            setFormData({ 
                              ...formData, 
                              couleur_auto: auto,
                              couleur_article: auto ? genererCouleurArticle() : formData.couleur_article
                            });
                            genererReferences();
                          }}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-xs text-gray-600">Génération automatique</span>
                      </label>
                    </div>
                    <input
                      type="text"
                      value={formData.couleur_article || ''}
                      onChange={(e) => {
                        setFormData({ 
                          ...formData, 
                          couleur_article: e.target.value,
                          couleur_auto: false
                        });
                        genererReferences();
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: Ecru Rayé Naturel (généré automatiquement si activé)"
                    />
                    {formData.couleur_auto !== false && (
                      <p className="text-xs text-gray-500 mt-1">
                        Format automatique : {genererCouleurArticle()}
                      </p>
                    )}
                  </div>
                  <div className="col-span-2">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">Désignation Article *</label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.designation_auto ?? true}
                          onChange={(e) => {
                            const auto = e.target.checked;
                            setFormData({ 
                              ...formData, 
                              designation_auto: auto,
                              designation_article: auto ? genererDesignationArticle() : formData.designation_article
                            });
                          }}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-xs text-gray-600">Génération automatique</span>
                      </label>
                    </div>
                    <input
                      type="text"
                      value={formData.designation_article || ''}
                      onChange={(e) => setFormData({ ...formData, designation_article: e.target.value, designation_auto: false })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Désignation du modèle + Dimensions + Couleur S01 + Couleur S02 + ... (généré automatiquement si activé)"
                      required
                    />
                    {formData.designation_auto && (
                      <p className="text-xs text-gray-500 mt-1">
                        Format automatique : {genererDesignationArticle()}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1 italic">
                      Format : Désignation du modèle + Dimensions + Couleur S01 + Couleur S02 + ...
                    </p>
                  </div>
                  <div className="col-span-2">
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-sm font-medium text-gray-700">Description Article</label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.description_auto !== false}
                          onChange={(e) => {
                            const auto = e.target.checked;
                            setFormData({ 
                              ...formData, 
                              description_auto: auto,
                              description_article: auto ? genererDescriptionArticle() : formData.description_article
                            });
                            genererReferences();
                          }}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-xs text-gray-600">Génération automatique</span>
                      </label>
                    </div>
                    <textarea
                      value={formData.description_article || ''}
                      onChange={(e) => {
                        setFormData({ 
                          ...formData, 
                          description_article: e.target.value,
                          description_auto: false
                        });
                        genererReferences();
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Description de l'article (générée automatiquement si activé : Description du modèle + ' Couleur ' + Couleur Article)"
                    />
                    {formData.description_auto !== false && (
                      <p className="text-xs text-gray-500 mt-1">
                        Format automatique : {genererDescriptionArticle()}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Section Prix et Catégorie */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-700">Prix et Catégorie</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prix de Revient (HT) *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.prix_revient || ''}
                      onChange={(e) => setFormData({ ...formData, prix_revient: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prix de Vente (HT) *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.prix_vente || ''}
                      onChange={(e) => setFormData({ ...formData, prix_vente: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie *</label>
                    <select
                      value={formData.dans_catalogue_produit ? 'catalogue' : 'hors_catalogue'}
                      onChange={(e) => {
                        const dansCatalogue = e.target.value === 'catalogue';
                        setFormData({ 
                          ...formData, 
                          dans_catalogue_produit: dansCatalogue,
                          qte_minimal_stock: dansCatalogue ? (formData.qte_minimal_stock || 0) : 0
                        });
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="catalogue">Catalogue</option>
                      <option value="hors_catalogue">Hors Catalogue</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Les articles du catalogue seront affichés dans la partie catalogue
                    </p>
                  </div>
                  {formData.dans_catalogue_produit && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quantité Minimale Stock *</label>
                      <input
                        type="number"
                        value={formData.qte_minimal_stock || 0}
                        onChange={(e) => setFormData({ ...formData, qte_minimal_stock: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        min="0"
                        required
                      />
                    </div>
                  )}
                  <div className="col-span-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.vente_ecommerce || false}
                        onChange={(e) => setFormData({ ...formData, vente_ecommerce: e.target.checked })}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Vente E-commerce</span>
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      Cocher si cet article doit être mis en ligne sur le site e-commerce
                    </p>
                  </div>
                </div>
              </div>

              {/* Section Composition pour Production */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-700">Composition pour Production</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Définir la composition des sélecteurs de couleur nécessaires pour la production
                </p>
                <div className="space-y-2">
                  {formData.code_selecteur_01 && (
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-2 flex-1">
                        <input
                          type="checkbox"
                          checked={formData.composition_selecteurs?.[formData.code_selecteur_01] === 'required'}
                          onChange={(e) => {
                            const newComposition = { ...formData.composition_selecteurs };
                            if (e.target.checked) {
                              newComposition[formData.code_selecteur_01!] = 'required';
                            } else {
                              delete newComposition[formData.code_selecteur_01!];
                            }
                            setFormData({ ...formData, composition_selecteurs: newComposition });
                          }}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">Sélecteur 01 ({formData.code_selecteur_01}) requis pour production</span>
                      </label>
                    </div>
                  )}
                  {formData.code_selecteur_02 && (
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-2 flex-1">
                        <input
                          type="checkbox"
                          checked={formData.composition_selecteurs?.[formData.code_selecteur_02] === 'required'}
                          onChange={(e) => {
                            const newComposition = { ...formData.composition_selecteurs };
                            if (e.target.checked) {
                              newComposition[formData.code_selecteur_02!] = 'required';
                            } else {
                              delete newComposition[formData.code_selecteur_02!];
                            }
                            setFormData({ ...formData, composition_selecteurs: newComposition });
                          }}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">Sélecteur 02 ({formData.code_selecteur_02}) requis pour production</span>
                      </label>
                    </div>
                  )}
                  {formData.code_selecteur_03 && (
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-2 flex-1">
                        <input
                          type="checkbox"
                          checked={formData.composition_selecteurs?.[formData.code_selecteur_03] === 'required'}
                          onChange={(e) => {
                            const newComposition = { ...formData.composition_selecteurs };
                            if (e.target.checked) {
                              newComposition[formData.code_selecteur_03!] = 'required';
                            } else {
                              delete newComposition[formData.code_selecteur_03!];
                            }
                            setFormData({ ...formData, composition_selecteurs: newComposition });
                          }}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">Sélecteur 03 ({formData.code_selecteur_03}) requis pour production</span>
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Section Quantités */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-700">Quantités</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Commandé</label>
                    <input
                      type="number"
                      value={formData.total_commander}
                      onChange={(e) => setFormData({ ...formData, total_commander: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Envoyé</label>
                    <input
                      type="number"
                      value={formData.total_envoyer}
                      onChange={(e) => setFormData({ ...formData, total_envoyer: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total À Fabriquer</label>
                    <input
                      type="number"
                      value={formData.total_a_fabriquer}
                      onChange={(e) => setFormData({ ...formData, total_a_fabriquer: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Section Photo */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-700 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Photo de l'Article
                </h3>
                <div className="flex items-start gap-4">
                  {photoPreview && (
                    <div className="w-32 h-32 border-2 border-gray-300 rounded-lg overflow-hidden">
                      <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Télécharger une photo</label>
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors">
                        <Upload className="w-5 h-5" />
                        Choisir une photo
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoChange}
                          className="hidden"
                        />
                      </label>
                      {photoFile && (
                        <span className="text-sm text-gray-600">{photoFile.name}</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Format recommandé: JPG, PNG (max 5MB)</p>
                  </div>
                </div>
              </div>

              {/* Section Options */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-700">Options</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.dans_catalogue_produit}
                      onChange={(e) => setFormData({ ...formData, dans_catalogue_produit: e.target.checked })}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Appartient au catalogue produit
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.actif}
                      onChange={(e) => setFormData({ ...formData, actif: e.target.checked })}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Article actif</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Save className="w-5 h-5" />
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

        {/* Liste des articles */}
        {affichageMode === 'ligne' ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Photo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ref Commerciale</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ref Fabrication</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Modèle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Couleur</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prix (Modèle)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">2ème Choix</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">À Fabriquer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Catalogue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredArticles.map((article) => (
                <tr key={article.id_article} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    {article.photo_article ? (
                      <img src={article.photo_article} alt={article.ref_commercial} className="w-12 h-12 object-cover rounded" />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-sm font-medium text-blue-600">
                    {article.ref_commercial}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-green-600">
                    {article.ref_fabrication}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{article.modele}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {article.couleur_article || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {(() => {
                      const prix = getPrixFromModele(article);
                      return (
                        <div className="text-sm">
                          <div className="font-semibold text-green-600">{prix.prix_vente.toFixed(2)} TND</div>
                          <div className="text-xs text-gray-500">Reviens: {prix.prix_reviens.toFixed(2)} TND</div>
                          {prix.prix_multiple && prix.prix_multiple.length > 0 && (
                            <div className="text-xs text-blue-600 mt-1">
                              +{prix.prix_multiple.length} autre(s) prix
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => {
                        setSelectedArticleForStock(article);
                        setShowStockDetail(true);
                      }}
                      className="text-left hover:bg-blue-50 p-2 rounded transition-colors"
                    >
                      <div className="font-semibold text-blue-600">{article.stock_total || 0}</div>
                      <div className="text-xs text-gray-500">
                        {article.stock_par_entrepot && article.stock_par_entrepot.length > 0
                          ? `${article.stock_par_entrepot.length} entrepôt(s)`
                          : 'Aucun stock'}
                      </div>
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">
                      {article.quantite_deuxieme_choix || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs font-medium">
                      {article.total_a_fabriquer}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {article.dans_catalogue_produit ? (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Oui</span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">Non</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (article.id_article) navigate(`/articles/${article.id_article}`);
                        }}
                        className="text-green-600 hover:text-green-700"
                        title="Voir les détails"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedArticleForStock(article);
                          setShowStockDetail(true);
                        }}
                        className="text-blue-600 hover:text-blue-700"
                        title="Voir Stock"
                      >
                        <Warehouse className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          article.id_article && handleEdit(article);
                        }}
                        className="text-gray-600 hover:text-gray-700"
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          article.id_article && handleDelete(article.id_article);
                        }}
                        className="text-red-600 hover:text-red-700"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        ) : (
          // Mode Catalogue
          selectedModeleCatalogue ? (
            // Affichage des articles du modèle sélectionné
            <div>
              <div className="flex items-center gap-4 mb-6">
                <button
                  onClick={() => setSelectedModeleCatalogue(null)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Retour aux modèles
                </button>
                <h2 className="text-2xl font-bold text-gray-800">
                  Articles du modèle : {modelesCatalogue.find(m => m.code_modele === selectedModeleCatalogue)?.modele}
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredArticles.filter(a => a.dans_catalogue_produit === true && a.code_modele === selectedModeleCatalogue).map((article) => (
                  <div 
                    key={article.id_article} 
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => {
                      if (article.id_article) navigate(`/articles/${article.id_article}`);
                    }}
                  >
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
                        <p><span className="font-medium">Ref Commercial:</span> <span className="font-mono text-xs">{article.ref_commercial}</span></p>
                        <p><span className="font-medium">Ref Fabrication:</span> <span className="font-mono text-xs">{article.ref_fabrication}</span></p>
                        <p><span className="font-medium">Couleur:</span> {article.couleur_article || 'N/A'}</p>
                        <p><span className="font-medium">Dimensions:</span> {article.dimensions || 'N/A'}</p>
                        {article.prix_vente && (
                          <p><span className="font-medium">Prix:</span> {article.prix_vente.toFixed(2)} €</p>
                        )}
                      </div>
                      <div className="flex items-center justify-between mb-3">
                        {article.stock_total !== undefined && (
                          <div className={`px-2 py-1 rounded text-xs font-medium ${
                            article.stock_total > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            Stock: {article.stock_total}
                          </div>
                        )}
                        {article.dans_catalogue_produit && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Catalogue</span>
                        )}
                      </div>
                      <div className="flex gap-2 pt-3 border-t" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => {
                            if (article.id_article) navigate(`/articles/${article.id_article}`);
                          }}
                          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                        >
                          <Eye className="w-4 h-4" />
                          Voir
                        </button>
                        <button
                          onClick={() => handleEdit(article)}
                          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                        >
                          <Edit className="w-4 h-4" />
                          Modifier
                        </button>
                        {article.id_article && (
                          <button
                            onClick={() => handleDelete(article.id_article!)}
                            className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : modelesCatalogue.length > 0 ? (
            // Affichage des modèles du catalogue
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Modèles du Catalogue</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {modelesCatalogue.map((modele) => (
                  <div 
                    key={modele.code_modele} 
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => setSelectedModeleCatalogue(modele.code_modele)}
                  >
                    <div className="h-48 bg-gray-200 flex items-center justify-center overflow-hidden">
                      {modele.photo ? (
                        <img src={modele.photo} alt={modele.modele} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-16 h-16 text-gray-400" />
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-lg text-gray-800 mb-2">{modele.modele}</h3>
                      <div className="space-y-1 text-sm text-gray-600 mb-3">
                        <p><span className="font-medium">Code:</span> <span className="font-mono text-xs">{modele.code_modele}</span></p>
                        <p><span className="font-medium">Produit:</span> {modele.produit}</p>
                        <p><span className="font-medium">Nombre d'articles:</span> {modele.nombre_articles}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedModeleCatalogue(modele.code_modele);
                        }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                      >
                        <Eye className="w-4 h-4" />
                        Voir les articles ({modele.nombre_articles})
                      </button>
                    </div>
                  </div>
                  ))}
                </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">Aucun modèle avec des articles dans le catalogue.</p>
            </div>
          )
        )}
          
          {/* Ancien affichage des articles - gardé pour référence mais non utilisé */}
          {false && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredArticles.map((article) => (
              <div 
                key={article.id_article} 
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => {
                  if (article.id_article) navigate(`/articles/${article.id_article}`);
                }}
              >
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
                    <p><span className="font-medium">Ref Commercial:</span> <span className="font-mono text-xs">{article.ref_commercial}</span></p>
                    <p><span className="font-medium">Ref Fabrication:</span> <span className="font-mono text-xs text-green-600">{article.ref_fabrication}</span></p>
                    <p><span className="font-medium">Modèle:</span> {article.modele}</p>
                    {article.couleur_article && (
                      <p><span className="font-medium">Couleur:</span> {article.couleur_article}</p>
                    )}
                    {(() => {
                      const prix = getPrixFromModele(article);
                      return (
                        <div className="mt-2 pt-2 border-t">
                          <p className="font-semibold text-green-600">{prix.prix_vente.toFixed(2)} TND</p>
                          <p className="text-xs text-gray-500">Reviens: {prix.prix_reviens.toFixed(2)} TND</p>
                        </div>
                      );
                    })()}
                  </div>
                  <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                    <button
                      onClick={() => {
                        setSelectedArticleForStock(article);
                        setShowStockDetail(true);
                      }}
                      className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium hover:bg-blue-200"
                    >
                      Stock: {article.stock_total || 0}
                    </button>
                    {article.quantite_deuxieme_choix && article.quantite_deuxieme_choix > 0 && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">
                        2ème: {article.quantite_deuxieme_choix}
                      </span>
                    )}
                    <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs font-medium">
                      À fabriquer: {article.total_a_fabriquer}
                    </span>
                    {article.dans_catalogue_produit && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Catalogue</span>
                    )}
                  </div>
                  <div className="flex gap-2 pt-3 border-t" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => {
                        if (article.id_article) navigate(`/articles/${article.id_article}`);
                      }}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                    >
                      <Eye className="w-4 h-4" />
                      Voir
                    </button>
                    <button
                      onClick={() => handleEdit(article)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                    >
                      <Edit className="w-4 h-4" />
                      Modifier
                    </button>
                    {article.id_article && (
                      <button
                        onClick={() => handleDelete(article.id_article!)}
                        className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal Détail Stock et Historique */}
        {showStockDetail && selectedArticleForStock && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                  <Warehouse className="w-7 h-7 text-blue-600" />
                  Détail du Stock - {selectedArticleForStock.ref_commercial}
                </h2>
                <button
                  onClick={() => {
                    setShowStockDetail(false);
                    setSelectedArticleForStock(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Informations de l'article */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Informations de l'article</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Désignation:</span>
                      <span className="ml-2 font-medium">{selectedArticleForStock.designation_article || selectedArticleForStock.modele}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Modèle:</span>
                      <span className="ml-2 font-medium">{selectedArticleForStock.modele}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Ref Commercial:</span>
                      <span className="ml-2 font-mono text-xs">{selectedArticleForStock.ref_commercial}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Ref Fabrication:</span>
                      <span className="ml-2 font-mono text-xs text-green-600">{selectedArticleForStock.ref_fabrication}</span>
                    </div>
                  </div>
                </div>

                {/* Stock Total et 2ème Choix */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="text-sm text-blue-600 font-medium mb-1">Stock Total</div>
                    <div className="text-3xl font-bold text-blue-700">{selectedArticleForStock.stock_total || 0}</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <div className="text-sm text-purple-600 font-medium mb-1">2ème Choix</div>
                    <div className="text-3xl font-bold text-purple-700">{selectedArticleForStock.quantite_deuxieme_choix || 0}</div>
                    <div className="text-xs text-purple-500 mt-1">À calculer prochainement</div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                    <div className="text-sm text-orange-600 font-medium mb-1">À Fabriquer</div>
                    <div className="text-3xl font-bold text-orange-700">{selectedArticleForStock.total_a_fabriquer || 0}</div>
                  </div>
                </div>

                {/* Stock par Entrepôt */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Warehouse className="w-5 h-5 text-blue-600" />
                    Stock par Entrepôt
                  </h3>
                  {selectedArticleForStock.stock_par_entrepot && selectedArticleForStock.stock_par_entrepot.length > 0 ? (
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entrepôt</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantité</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {selectedArticleForStock.stock_par_entrepot.map((stock, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-4 py-3 font-medium">{stock.entrepot}</td>
                              <td className="px-4 py-3">
                                <span className="font-semibold text-blue-600">{stock.quantite}</span>
                              </td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  stock.statut === 'disponible' ? 'bg-green-100 text-green-800' :
                                  stock.statut === 'reserve' ? 'bg-yellow-100 text-yellow-800' :
                                  stock.statut === 'bloque' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {stock.statut === 'disponible' ? 'Disponible' :
                                   stock.statut === 'reserve' ? 'Réservé' :
                                   stock.statut === 'bloque' ? 'Bloqué' :
                                   stock.statut}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-8 text-center">
                      <Warehouse className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Aucun stock enregistré</p>
                    </div>
                  )}
                </div>

                {/* Historique des Mouvements */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <History className="w-5 h-5 text-blue-600" />
                    Historique des Mouvements
                  </h3>
                  {selectedArticleForStock.historique_mouvements && selectedArticleForStock.historique_mouvements.length > 0 ? (
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantité</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Origine</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Destination</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Motif</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Effectué par</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {selectedArticleForStock.historique_mouvements.map((mouvement, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm">
                                {new Date(mouvement.date_mouvement).toLocaleString('fr-FR')}
                              </td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  mouvement.type_mouvement === 'entree' ? 'bg-green-100 text-green-800' :
                                  mouvement.type_mouvement === 'sortie' ? 'bg-red-100 text-red-800' :
                                  mouvement.type_mouvement === 'transfert' ? 'bg-blue-100 text-blue-800' :
                                  mouvement.type_mouvement === '2eme_choix' ? 'bg-purple-100 text-purple-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {mouvement.type_mouvement === 'entree' ? 'Entrée' :
                                   mouvement.type_mouvement === 'sortie' ? 'Sortie' :
                                   mouvement.type_mouvement === 'transfert' ? 'Transfert' :
                                   mouvement.type_mouvement === '2eme_choix' ? '2ème Choix' :
                                   mouvement.type_mouvement}
                                </span>
                              </td>
                              <td className="px-4 py-3 font-semibold">{mouvement.quantite}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{mouvement.entrepot_origine || '-'}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{mouvement.entrepot_destination || '-'}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{mouvement.motif || '-'}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{mouvement.effectue_par || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-8 text-center">
                      <History className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Aucun mouvement enregistré</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
                <button
                  onClick={() => {
                    setShowStockDetail(false);
                    setSelectedArticleForStock(null);
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Articles;
