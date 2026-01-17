import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, Plus, Edit, Trash2, Search, Upload, Image as ImageIcon, DollarSign, Settings, Save, Tag, X, List, Grid, Eye, BarChart3 } from 'lucide-react';
import { produitsService } from '../services/api';
import api from '../services/api';

interface Prix {
  montant: number;
  devise: string; // TND, EUR, USD
  libelle: string; // "Prix de vente", "Prix promotionnel", etc.
  actif: boolean;
}

interface Modele {
  id_modele?: number;
  code_modele: string;
  designation: string;
  description?: string;
  produit: string;
  code_dimensions: string[]; // Tableau de dimensions (plusieurs possibles)
  type_tissage: string[]; // Tableau de types de tissage (plusieurs possibles)
  code_type_tissage: string[]; // Tableau de codes type de tissage (plusieurs possibles)
  nombre_couleur: string[]; // Tableau de nombres de couleur (plusieurs possibles)
  code_nombre_couleur: string[]; // Tableau de codes nombre de couleur (plusieurs possibles)
  type_finition: string[]; // Tableau de types de finition (plusieurs possibles)
  code_type_finition: string[]; // Tableau de codes type de finition (plusieurs possibles)
  composition_fabrication: number;
  prix_reviens: number;
  prix_vente: number;
  prix_multiple?: PrixConditionnel[]; // Système de prix conditionnels basés sur les attributs
  photo_modele?: string;
  actif: boolean;
  dans_catalogue_produit: boolean;
  description_auto?: boolean; // Indique si la description est générée automatiquement
}

interface PrixConditionnel {
  id_prix?: number;
  montant: number;
  devise: string;
  libelle: string;
  actif: boolean;
  conditions?: { // Conditions basées sur les attributs
    dimensions?: string[]; // Prix pour certaines dimensions
    type_tissage?: string[]; // Prix pour certains types de tissage
    type_finition?: string[]; // Prix pour certains types de finition
    // Combinaisons possibles : dimensions + type_tissage, etc.
  };
}

interface Attribut {
  id_attribut: number;
  code_attribut: string;
  libelle: string;
  type_attribut: string;
  valeurs_possibles: Array<{code: string; libelle: string; couleur_hex?: string; id_mp?: number}>;
}

interface PrixConditionnel {
  id_prix?: number;
  montant: number;
  devise: string;
  libelle: string;
  actif: boolean;
  conditions?: { // Conditions basées sur les attributs
    dimensions?: string[]; // Prix pour certaines dimensions
    type_tissage?: string[]; // Prix pour certains types de tissage
    type_finition?: string[]; // Prix pour certains types de finition
    // Combinaisons possibles : dimensions + type_tissage, etc.
  };
}

const Modeles: React.FC = () => {
  const navigate = useNavigate();
  const [modeles, setModeles] = useState<Modele[]>([]);
  const [attributs, setAttributs] = useState<Attribut[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingModele, setEditingModele] = useState<Modele | null>(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ actif: '', produit: '' });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [affichageMode, setAffichageMode] = useState<'ligne' | 'catalogue'>('ligne'); // Simple toggle ligne/catalogue

  const [formData, setFormData] = useState<Modele>({
    code_modele: '',
    designation: '',
    description: '',
    produit: 'Fouta',
    code_dimensions: [],
    type_tissage: [],
    code_type_tissage: [],
    nombre_couleur: [],
    code_nombre_couleur: [],
    type_finition: [],
    code_type_finition: [],
    composition_fabrication: 1,
    prix_reviens: 0,
    prix_vente: 0,
    prix_multiple: [],
    actif: true,
    dans_catalogue_produit: false,
    description_auto: true
  });

  // États pour les sélections multiples de tous les attributs
  const [selectedDimensionCode, setSelectedDimensionCode] = useState<string>('');
  const [selectedNombreCouleurCode, setSelectedNombreCouleurCode] = useState<string>('');
  const [selectedTypeTissageCode, setSelectedTypeTissageCode] = useState<string>('');
  const [selectedTypeFinitionCode, setSelectedTypeFinitionCode] = useState<string>('');
  
  // Nouveau prix conditionnel
  const [newPrixConditionnel, setNewPrixConditionnel] = useState<PrixConditionnel>({
    montant: 0,
    devise: 'TND',
    libelle: '',
    actif: true,
    conditions: {}
  });

  useEffect(() => {
    loadData();
  }, [filters, search]);

  const loadData = async () => {
    setLoading(true);
    try {
      // TODO: Remplacer par l'API réelle
      const mockModeles: Modele[] = [
        {
          id_modele: 1,
          code_modele: 'AR',
          designation: 'ARTHUR',
          produit: 'Fouta',
          code_dimensions: ['1020'], // Tableau de dimensions
          type_tissage: ['Tissage Plat'], // Tableau de types de tissage
          code_type_tissage: ['PL'], // Tableau de codes type de tissage
          nombre_couleur: ['2 Couleurs'], // Tableau de nombres de couleur
          code_nombre_couleur: ['B'], // Tableau de codes nombre de couleur
          type_finition: ['Frange'], // Tableau de types de finition
          code_type_finition: ['FR'], // Tableau de codes type de finition
          composition_fabrication: 1,
          prix_reviens: 7.5,
          prix_vente: 9.75,
          prix_multiple: [], // Tableau de prix multiples
          actif: true,
          dans_catalogue_produit: true,
          description_auto: true
        }
      ];
      setModeles(mockModeles);

      // Charger les attributs
      try {
        const attributsRes = await produitsService.getAttributs();
        // Gérer différents formats de réponse
        if (attributsRes?.data?.data) {
          setAttributs(Array.isArray(attributsRes.data.data) ? attributsRes.data.data : []);
        } else if (attributsRes?.data) {
          setAttributs(Array.isArray(attributsRes.data) ? attributsRes.data : []);
        } else {
          setAttributs([]);
        }
      } catch (error: any) {
        console.error('Erreur chargement attributs:', error);
        let errorMessage = 'Erreur inconnue';
        
        if (error?.code === 'ECONNREFUSED' || error?.code === 'ERR_NETWORK') {
          errorMessage = 'Impossible de se connecter au serveur. Vérifiez que le backend est démarré sur http://localhost:5000';
        } else if (error?.response?.status === 401) {
          errorMessage = 'Non authentifié. Veuillez vous reconnecter.';
        } else if (error?.response?.status === 403) {
          errorMessage = 'Accès refusé. Vous n\'avez pas les permissions nécessaires.';
        } else if (error?.response?.status === 404) {
          errorMessage = 'Endpoint non trouvé. Vérifiez la configuration du backend.';
        } else if (error?.response?.status >= 500) {
          errorMessage = 'Erreur serveur. Vérifiez les logs du backend.';
        } else if (error?.response?.data?.error?.message) {
          errorMessage = error.response.data.error.message;
        } else if (error?.message) {
          errorMessage = error.message;
        }
        
        setMessage({ type: 'error', text: `Erreur lors du chargement des attributs: ${errorMessage}` });
        // Utiliser des attributs vides en cas d'erreur
        setAttributs([]);
      }
    } catch (error: any) {
      console.error('Erreur chargement modèles:', error);
      const errorMessage = error?.response?.data?.error?.message || 
                          error?.message || 
                          (error?.code === 'ECONNREFUSED' || error?.code === 'ERR_NETWORK' 
                            ? 'Impossible de se connecter au serveur. Vérifiez que le backend est démarré sur http://localhost:5000' 
                            : 'Erreur lors du chargement des modèles');
      if (!message) { // Ne pas écraser le message d'erreur des attributs
        setMessage({ type: 'error', text: errorMessage });
      }
    } finally {
      setLoading(false);
    }
  };

  // Générer automatiquement la description selon le format: "Produit modèle Désignation finition Type de finition"
  const genererDescription = (): string => {
    const parts: string[] = [];
    
    if (formData.produit) parts.push(formData.produit);
    if (formData.designation) {
      parts.push('modèle');
      parts.push(formData.designation);
    }
    // Prendre le premier type de finition si plusieurs sont sélectionnés
    if (formData.type_finition && formData.type_finition.length > 0) {
      parts.push('finition');
      parts.push(formData.type_finition[0]); // Prendre le premier
    }
    
    return parts.join(' '); // Ex: "Fouta modèle ARTHUR finition Frange"
  };

  // Mettre à jour la description automatiquement
  useEffect(() => {
    if (formData.description_auto) {
      const autoDescription = genererDescription();
      setFormData(prev => ({ ...prev, description: autoDescription }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.produit, formData.designation, formData.type_finition, formData.description_auto]);

  // Charger la désignation depuis les attributs quand le code est sélectionné
  const handleCodeAttributChange = (code: string, typeAttribut: string) => {
    const attribut = attributs.find(a => 
      a.code_attribut.toLowerCase() === code.toLowerCase() ||
      a.valeurs_possibles?.some(v => v.code.toLowerCase() === code.toLowerCase())
    );

    if (attribut) {
      const valeur = attribut.valeurs_possibles?.find(v => 
        v.code.toLowerCase() === code.toLowerCase()
      );

      if (valeur && typeAttribut === 'designation') {
        // Si on change le code modèle, mettre à jour la désignation
        if (attribut.code_attribut.toLowerCase().includes('modele')) {
          setFormData(prev => ({ ...prev, designation: valeur.libelle }));
        }
      }
    }
  };

  // Ajouter une dimension
  const handleAddDimension = () => {
    if (selectedDimensionCode && !formData.code_dimensions.includes(selectedDimensionCode)) {
      setFormData(prev => ({
        ...prev,
        code_dimensions: [...prev.code_dimensions, selectedDimensionCode]
      }));
      setSelectedDimensionCode('');
    }
  };

  // Retirer une dimension
  const handleRemoveDimension = (code: string) => {
    setFormData(prev => ({
      ...prev,
      code_dimensions: prev.code_dimensions.filter(d => d !== code)
    }));
  };

  // Ajouter un nombre de couleur
  const handleAddNombreCouleur = () => {
    const attributCouleur = attributs.find(a => 
      a.code_attribut.toLowerCase().includes('coul') || 
      a.libelle.toLowerCase().includes('couleur')
    );

    if (selectedNombreCouleurCode && attributCouleur) {
      const valeur = attributCouleur.valeurs_possibles?.find(v => 
        v.code.toLowerCase() === selectedNombreCouleurCode.toLowerCase()
      );

      if (valeur && !formData.code_nombre_couleur.includes(selectedNombreCouleurCode)) {
        setFormData(prev => ({
          ...prev,
          code_nombre_couleur: [...prev.code_nombre_couleur, selectedNombreCouleurCode],
          nombre_couleur: [...prev.nombre_couleur, valeur.libelle]
        }));
        setSelectedNombreCouleurCode('');
      }
    }
  };

  // Retirer un nombre de couleur
  const handleRemoveNombreCouleur = (code: string) => {
    setFormData(prev => ({
      ...prev,
      code_nombre_couleur: prev.code_nombre_couleur.filter(c => c !== code),
      nombre_couleur: prev.nombre_couleur.filter((_, index) => 
        prev.code_nombre_couleur[index] !== code
      )
    }));
  };

  // Ajouter un type de tissage
  const handleAddTypeTissage = () => {
    const attributTissage = attributs.find(a => 
      a.code_attribut.toLowerCase().includes('tiss') || 
      a.libelle.toLowerCase().includes('tissage')
    );

    if (selectedTypeTissageCode && attributTissage) {
      const valeur = attributTissage.valeurs_possibles?.find(v => 
        v.code.toLowerCase() === selectedTypeTissageCode.toLowerCase()
      );

      if (valeur && !formData.code_type_tissage.includes(selectedTypeTissageCode)) {
        setFormData(prev => ({
          ...prev,
          code_type_tissage: [...prev.code_type_tissage, selectedTypeTissageCode],
          type_tissage: [...prev.type_tissage, valeur.libelle]
        }));
        setSelectedTypeTissageCode('');
      }
    }
  };

  // Retirer un type de tissage
  const handleRemoveTypeTissage = (code: string) => {
    setFormData(prev => ({
      ...prev,
      code_type_tissage: prev.code_type_tissage.filter(c => c !== code),
      type_tissage: prev.type_tissage.filter((_, index) => 
        prev.code_type_tissage[index] !== code
      )
    }));
  };

  // Ajouter un type de finition
  const handleAddTypeFinition = () => {
    const attributFinition = attributs.find(a => 
      a.code_attribut.toLowerCase().includes('fin') || 
      a.libelle.toLowerCase().includes('finition')
    );

    if (selectedTypeFinitionCode && attributFinition) {
      const valeur = attributFinition.valeurs_possibles?.find(v => 
        v.code.toLowerCase() === selectedTypeFinitionCode.toLowerCase()
      );

      if (valeur && !formData.code_type_finition.includes(selectedTypeFinitionCode)) {
        setFormData(prev => ({
          ...prev,
          code_type_finition: [...prev.code_type_finition, selectedTypeFinitionCode],
          type_finition: [...prev.type_finition, valeur.libelle]
        }));
        setSelectedTypeFinitionCode('');
      }
    }
  };

  // Retirer un type de finition
  const handleRemoveTypeFinition = (code: string) => {
    setFormData(prev => ({
      ...prev,
      code_type_finition: prev.code_type_finition.filter(c => c !== code),
      type_finition: prev.type_finition.filter((_, index) => 
        prev.code_type_finition[index] !== code
      )
    }));
  };

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
    
    // Validation : au moins une dimension, un type de tissage, un nombre de couleur et un type de finition
    if (formData.code_dimensions.length === 0) {
      setMessage({ type: 'error', text: 'Veuillez sélectionner au moins une dimension' });
      return;
    }
    if (formData.code_type_tissage.length === 0) {
      setMessage({ type: 'error', text: 'Veuillez sélectionner au moins un type de tissage' });
      return;
    }
    if (formData.code_nombre_couleur.length === 0) {
      setMessage({ type: 'error', text: 'Veuillez sélectionner au moins un nombre de couleur' });
      return;
    }
    if (formData.code_type_finition.length === 0) {
      setMessage({ type: 'error', text: 'Veuillez sélectionner au moins un type de finition' });
      return;
    }

    try {
      const formDataToSend = new FormData();
      
      // Convertir les tableaux en JSON pour FormData
      formDataToSend.append('code_modele', formData.code_modele);
      formDataToSend.append('designation', formData.designation);
      formDataToSend.append('description', formData.description || '');
      formDataToSend.append('produit', formData.produit);
      formDataToSend.append('code_dimensions', JSON.stringify(formData.code_dimensions));
      formDataToSend.append('type_tissage', JSON.stringify(formData.type_tissage));
      formDataToSend.append('code_type_tissage', JSON.stringify(formData.code_type_tissage));
      formDataToSend.append('nombre_couleur', JSON.stringify(formData.nombre_couleur));
      formDataToSend.append('code_nombre_couleur', JSON.stringify(formData.code_nombre_couleur));
      formDataToSend.append('type_finition', JSON.stringify(formData.type_finition));
      formDataToSend.append('code_type_finition', JSON.stringify(formData.code_type_finition));
      if (formData.prix_multiple && formData.prix_multiple.length > 0) {
        formDataToSend.append('prix_multiple', JSON.stringify(formData.prix_multiple));
      }
      formDataToSend.append('composition_fabrication', formData.composition_fabrication.toString());
      formDataToSend.append('prix_reviens', formData.prix_reviens.toString());
      formDataToSend.append('prix_vente', formData.prix_vente.toString());
      formDataToSend.append('actif', formData.actif.toString());
      formDataToSend.append('dans_catalogue_produit', formData.dans_catalogue_produit.toString());
      formDataToSend.append('description_auto', (formData.description_auto ?? true).toString());

      // Ajouter la photo si elle existe
      if (photoFile) {
        formDataToSend.append('photo', photoFile);
      }

      // TODO: Appel API réel
      if (editingModele?.id_modele) {
        // await modelesService.updateModele(editingModele.id_modele, formDataToSend);
        setMessage({ type: 'success', text: 'Modèle modifié avec succès' });
      } else {
        // await modelesService.createModele(formDataToSend);
        setMessage({ type: 'success', text: 'Modèle créé avec succès' });
      }

      setShowForm(false);
      setEditingModele(null);
      resetForm();
      loadData();
      
      // Effacer le message après 3 secondes
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      console.error('Erreur sauvegarde modèle:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error?.message || 'Erreur lors de la sauvegarde du modèle' 
      });
    }
  };

  const handleEdit = (modele: Modele) => {
    setEditingModele(modele);
    // Convertir les anciennes valeurs string en tableaux si nécessaire
    const modeleToEdit: Modele = {
      ...modele,
      code_dimensions: Array.isArray(modele.code_dimensions) 
        ? modele.code_dimensions 
        : modele.code_dimensions ? [modele.code_dimensions as any] : [],
      type_tissage: Array.isArray(modele.type_tissage)
        ? modele.type_tissage
        : modele.type_tissage ? [modele.type_tissage as any] : [],
      code_type_tissage: Array.isArray(modele.code_type_tissage)
        ? modele.code_type_tissage
        : modele.code_type_tissage ? [modele.code_type_tissage as any] : [],
      nombre_couleur: Array.isArray(modele.nombre_couleur)
        ? modele.nombre_couleur
        : modele.nombre_couleur ? [modele.nombre_couleur as any] : [],
      code_nombre_couleur: Array.isArray(modele.code_nombre_couleur)
        ? modele.code_nombre_couleur
        : modele.code_nombre_couleur ? [modele.code_nombre_couleur as any] : [],
      type_finition: Array.isArray(modele.type_finition)
        ? modele.type_finition
        : modele.type_finition ? [modele.type_finition as any] : [],
      code_type_finition: Array.isArray(modele.code_type_finition)
        ? modele.code_type_finition
        : modele.code_type_finition ? [modele.code_type_finition as any] : [],
      description_auto: modele.description_auto ?? false
    };
    setFormData(modeleToEdit);
    setPhotoPreview(modele.photo_modele || '');
    setPhotoFile(null);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce modèle ?')) {
      try {
        // TODO: Appel API
        console.log('Suppression modèle:', id);
        loadData();
      } catch (error) {
        console.error('Erreur suppression modèle:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      code_modele: '',
      designation: '',
      description: '',
      produit: 'Fouta',
      code_dimensions: [],
      type_tissage: [],
      code_type_tissage: [],
      nombre_couleur: [],
      code_nombre_couleur: [],
      type_finition: [],
      code_type_finition: [],
      composition_fabrication: 1,
      prix_reviens: 0,
      prix_vente: 0,
      prix_multiple: [],
      actif: true,
      dans_catalogue_produit: false,
      description_auto: true
    });
    setPhotoFile(null);
    setPhotoPreview('');
    setSelectedDimensionCode('');
    setSelectedNombreCouleurCode('');
    setSelectedTypeTissageCode('');
    setSelectedTypeFinitionCode('');
    setNewPrixConditionnel({ montant: 0, devise: 'TND', libelle: '', actif: true, conditions: {} });
  };

  const filteredModeles = modeles.filter(m =>
    m.code_modele?.toLowerCase().includes(search.toLowerCase()) ||
    m.designation?.toLowerCase().includes(search.toLowerCase()) ||
    m.produit?.toLowerCase().includes(search.toLowerCase())
  ).filter(m => {
    if (filters.actif && m.actif.toString() !== filters.actif) return false;
    if (filters.produit && m.produit !== filters.produit) return false;
    return true;
  });

  const produitsUniques = Array.from(new Set(modeles.map(m => m.produit)));

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
              <Layers className="w-8 h-8 text-blue-600" />
              Gestion des Modèles (Articles Parents)
            </h1>
            <p className="text-gray-600 mt-2">Création et gestion des modèles de base pour générer les articles</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setShowForm(true);
                setEditingModele(null);
                resetForm();
              }}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Nouveau Modèle
            </button>
          </div>
        </div>

        {message && (
          <div className={`mb-4 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

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
              value={filters.produit}
              onChange={(e) => setFilters({ ...filters, produit: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous les produits</option>
              {produitsUniques.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
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

        {/* Formulaire Modèle */}
        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-bold mb-4">
              {editingModele ? 'Modifier le Modèle' : 'Nouveau Modèle'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Section Informations de Base */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-700">Informations de Base</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Code Modèle *</label>
                    <select
                      value={formData.code_modele}
                      onChange={(e) => {
                        const code = e.target.value;
                        setFormData({ ...formData, code_modele: code });
                        handleCodeAttributChange(code, 'designation');
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Sélectionner...</option>
                      {attributs
                        .find(a => a.code_attribut.toLowerCase().includes('modele'))?.valeurs_possibles
                        ?.map(v => (
                          <option key={v.code} value={v.code}>{v.code} - {v.libelle}</option>
                        ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">La désignation sera remplie automatiquement</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Désignation *</label>
                    <input
                      type="text"
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value, description_auto: false })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Produit *</label>
                    <select
                      value={formData.produit}
                      onChange={(e) => setFormData({ ...formData, produit: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="Fouta">Fouta</option>
                      <option value="Coussin Sac">Coussin Sac</option>
                      <option value="Echarpe">Echarpe</option>
                      <option value="Fouta Enfant">Fouta Enfant</option>
                      <option value="Fouta Eponge">Fouta Eponge</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.description_auto ?? true}
                          onChange={(e) => {
                            const auto = e.target.checked;
                            setFormData({ 
                              ...formData, 
                              description_auto: auto,
                              description: auto ? genererDescription() : formData.description
                            });
                          }}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-xs text-gray-600">Génération automatique</span>
                      </label>
                    </div>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value, description_auto: false })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Ex: Fouta modèle ARTHUR finition Frange (généré automatiquement si activé)"
                    />
                    {formData.description_auto && (
                      <p className="text-xs text-gray-500 mt-1">
                        Format automatique : {genererDescription()}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Section Attributs */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-700">Attributs du Modèle</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Code Dimensions * (Plusieurs possibles)</label>
                    <div className="flex gap-2 mb-2">
                      <select
                        value={selectedDimensionCode}
                        onChange={(e) => setSelectedDimensionCode(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Sélectionner une dimension...</option>
                        {attributs
                          .find(a => a.code_attribut.toLowerCase().includes('dim'))?.valeurs_possibles
                          ?.map(v => (
                            <option key={v.code} value={v.code}>{v.code} - {v.libelle}</option>
                          ))}
                      </select>
                      <button
                        type="button"
                        onClick={handleAddDimension}
                        disabled={!selectedDimensionCode || formData.code_dimensions.includes(selectedDimensionCode)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.code_dimensions.map((code, index) => {
                        const attributDim = attributs.find(a => a.code_attribut.toLowerCase().includes('dim'));
                        const valeur = attributDim?.valeurs_possibles?.find(v => v.code === code);
                        return (
                          <span key={index} className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            {code} {valeur && `(${valeur.libelle})`}
                            <button
                              type="button"
                              onClick={() => handleRemoveDimension(code)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                    {formData.code_dimensions.length === 0 && (
                      <p className="text-xs text-red-500 mt-1">Au moins une dimension est requise</p>
                    )}
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type de Tissage * (Plusieurs possibles)</label>
                    <div className="flex gap-2 mb-2">
                      <select
                        value={selectedTypeTissageCode}
                        onChange={(e) => setSelectedTypeTissageCode(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Sélectionner un type de tissage...</option>
                        {attributs
                          .find(a => a.code_attribut.toLowerCase().includes('tiss') || a.libelle.toLowerCase().includes('tissage'))?.valeurs_possibles
                          ?.map(v => (
                            <option key={v.code} value={v.code}>{v.code} - {v.libelle}</option>
                          ))}
                      </select>
                      <button
                        type="button"
                        onClick={handleAddTypeTissage}
                        disabled={!selectedTypeTissageCode || formData.code_type_tissage.includes(selectedTypeTissageCode)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.code_type_tissage.map((code, index) => {
                        const attributTissage = attributs.find(a => a.code_attribut.toLowerCase().includes('tiss') || a.libelle.toLowerCase().includes('tissage'));
                        const valeur = attributTissage?.valeurs_possibles?.find(v => v.code === code);
                        return (
                          <span key={index} className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                            {code} {valeur && `(${valeur.libelle})`}
                            <button
                              type="button"
                              onClick={() => handleRemoveTypeTissage(code)}
                              className="text-green-600 hover:text-green-800"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                    {formData.code_type_tissage.length === 0 && (
                      <p className="text-xs text-red-500 mt-1">Au moins un type de tissage est requis</p>
                    )}
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de Couleur * (Plusieurs possibles)</label>
                    <div className="flex gap-2 mb-2">
                      <select
                        value={selectedNombreCouleurCode}
                        onChange={(e) => setSelectedNombreCouleurCode(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Sélectionner un nombre de couleur...</option>
                        {attributs
                          .find(a => a.code_attribut.toLowerCase().includes('coul') || a.libelle.toLowerCase().includes('couleur'))?.valeurs_possibles
                          ?.map(v => (
                            <option key={v.code} value={v.code}>{v.code} - {v.libelle}</option>
                          ))}
                      </select>
                      <button
                        type="button"
                        onClick={handleAddNombreCouleur}
                        disabled={!selectedNombreCouleurCode || formData.code_nombre_couleur.includes(selectedNombreCouleurCode)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.code_nombre_couleur.map((code, index) => (
                        <span key={index} className="flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                          {code} {formData.nombre_couleur[index] && `(${formData.nombre_couleur[index]})`}
                          <button
                            type="button"
                            onClick={() => handleRemoveNombreCouleur(code)}
                            className="text-purple-600 hover:text-purple-800"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                    {formData.code_nombre_couleur.length === 0 && (
                      <p className="text-xs text-red-500 mt-1">Au moins un nombre de couleur est requis</p>
                    )}
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type de Finition * (Plusieurs possibles)</label>
                    <div className="flex gap-2 mb-2">
                      <select
                        value={selectedTypeFinitionCode}
                        onChange={(e) => setSelectedTypeFinitionCode(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Sélectionner un type de finition...</option>
                        {attributs
                          .find(a => a.code_attribut.toLowerCase().includes('fin') || a.libelle.toLowerCase().includes('finition'))?.valeurs_possibles
                          ?.map(v => (
                            <option key={v.code} value={v.code}>{v.code} - {v.libelle}</option>
                          ))}
                      </select>
                      <button
                        type="button"
                        onClick={handleAddTypeFinition}
                        disabled={!selectedTypeFinitionCode || formData.code_type_finition.includes(selectedTypeFinitionCode)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.code_type_finition.map((code, index) => {
                        const attributFinition = attributs.find(a => a.code_attribut.toLowerCase().includes('fin') || a.libelle.toLowerCase().includes('finition'));
                        const valeur = attributFinition?.valeurs_possibles?.find(v => v.code === code);
                        return (
                          <span key={index} className="flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                            {code} {valeur && `(${valeur.libelle})`}
                            <button
                              type="button"
                              onClick={() => handleRemoveTypeFinition(code)}
                              className="text-orange-600 hover:text-orange-800"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                    {formData.code_type_finition.length === 0 && (
                      <p className="text-xs text-red-500 mt-1">Au moins un type de finition est requis</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Composition Pour Fabrication *</label>
                    <input
                      type="number"
                      value={formData.composition_fabrication}
                      onChange={(e) => setFormData({ ...formData, composition_fabrication: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      min="1"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Section Prix */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-700 flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Prix
                </h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prix de Reviens (TND) *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.prix_reviens}
                      onChange={(e) => setFormData({ ...formData, prix_reviens: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prix de Vente (TND) *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.prix_vente}
                      onChange={(e) => setFormData({ ...formData, prix_vente: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                {/* Système de Prix Multiples */}
                <div className="mt-6">
                  <h4 className="text-md font-semibold mb-3 text-gray-700">Prix Multiples (avec différentes devises)</h4>
                  
                  {/* Ajouter un nouveau prix */}
                  <div className="grid grid-cols-4 gap-2 mb-3 p-3 bg-gray-50 rounded-lg">
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Montant"
                      value={newPrixConditionnel.montant}
                      onChange={(e) => setNewPrixConditionnel({ ...newPrixConditionnel, montant: parseFloat(e.target.value) || 0 })}
                      className="px-3 py-2 border rounded text-sm"
                    />
                    <select
                      value={newPrixConditionnel.devise}
                      onChange={(e) => setNewPrixConditionnel({ ...newPrixConditionnel, devise: e.target.value })}
                      className="px-3 py-2 border rounded text-sm"
                    >
                      <option value="TND">TND</option>
                      <option value="EUR">EUR</option>
                      <option value="USD">USD</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Libellé (ex: Prix selon dimension)"
                      value={newPrixConditionnel.libelle}
                      onChange={(e) => setNewPrixConditionnel({ ...newPrixConditionnel, libelle: e.target.value })}
                      className="px-3 py-2 border rounded text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newPrixConditionnel.montant > 0 && newPrixConditionnel.libelle) {
                          setFormData({
                            ...formData,
                            prix_multiple: [...(formData.prix_multiple || []), { ...newPrixConditionnel }]
                          });
                          setNewPrixConditionnel({ montant: 0, devise: 'TND', libelle: '', actif: true, conditions: {} });
                        }
                      }}
                      className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 text-sm"
                    >
                      <Plus className="w-4 h-4 inline" />
                    </button>
                  </div>

                  {/* Liste des prix multiples */}
                  <div className="space-y-2">
                    {(formData.prix_multiple || []).map((prix, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                        <span className="flex-1 font-medium">{prix.montant} {prix.devise}</span>
                        <span className="flex-1 text-sm text-gray-600">{prix.libelle}</span>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={prix.actif}
                            onChange={(e) => {
                              const newPrix = [...(formData.prix_multiple || [])];
                              newPrix[index].actif = e.target.checked;
                              setFormData({ ...formData, prix_multiple: newPrix });
                            }}
                            className="w-4 h-4"
                          />
                          <span className="text-xs">Actif</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const newPrix = [...(formData.prix_multiple || [])];
                            newPrix.splice(index, 1);
                            setFormData({ ...formData, prix_multiple: newPrix });
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Section Photo */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-700 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Photo du Modèle
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
                <h3 className="text-lg font-semibold mb-4 text-gray-700 flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Options
                </h3>
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
                    <span className="text-xs text-gray-500">(Les articles générés seront inclus dans le catalogue)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.actif}
                      onChange={(e) => setFormData({ ...formData, actif: e.target.checked })}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Modèle actif</span>
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
                    setEditingModele(null);
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

        {/* Liste des modèles */}
        {affichageMode === 'ligne' ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Photo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code Modèle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Désignation</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prix Reviens</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prix Vente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Catalogue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredModeles.map((modele) => (
                <tr key={modele.id_modele} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    {modele.photo_modele ? (
                      <img src={modele.photo_modele} alt={modele.designation} className="w-12 h-12 object-cover rounded" />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{modele.code_modele}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{modele.designation}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{modele.produit}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{modele.prix_reviens?.toFixed(2)} TND</td>
                  <td className="px-6 py-4 whitespace-nowrap font-semibold text-green-600">{modele.prix_vente?.toFixed(2)} TND</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {modele.dans_catalogue_produit ? (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Oui</span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">Non</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs ${modele.actif ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {modele.actif ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(modele)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => modele.id_modele && handleDelete(modele.id_modele)}
                        className="text-red-600 hover:text-red-700"
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredModeles.map((modele) => (
              <div key={modele.id_modele} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 bg-gray-200 flex items-center justify-center overflow-hidden">
                  {modele.photo_modele ? (
                    <img src={modele.photo_modele} alt={modele.designation} className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-16 h-16 text-gray-400" />
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-lg text-gray-800">{modele.designation}</h3>
                      <p className="text-sm text-gray-500">{modele.code_modele}</p>
                    </div>
                    {modele.actif ? (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Actif</span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">Inactif</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{modele.produit}</p>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-xs text-gray-500">Prix de vente</p>
                      <p className="font-semibold text-green-600">{modele.prix_vente?.toFixed(2)} TND</p>
                    </div>
                    {modele.dans_catalogue_produit && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">Catalogue</span>
                    )}
                  </div>
                  <div className="flex gap-2 pt-3 border-t">
                    <button
                      onClick={() => handleEdit(modele)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                    >
                      <Edit className="w-4 h-4" />
                      Modifier
                    </button>
                    {modele.id_modele && (
                      <button
                        onClick={() => handleDelete(modele.id_modele!)}
                        className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
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
      </div>
    </div>
  );
};

export default Modeles;
