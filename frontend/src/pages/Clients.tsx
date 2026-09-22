import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clientsService, utilisateursService } from '../services/api';
import { List, Grid, Eye, X, User, Mail, Phone, MapPin, Building, CreditCard, Percent, Edit, Trash2, Filter, Tag, Briefcase, Globe, FileText } from 'lucide-react';

const Clients: React.FC = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [affichageMode, setAffichageMode] = useState<'ligne' | 'catalogue'>('ligne');
  const [filters, setFilters] = useState({
    type_client: '',
    id_categorie: '',
    actif: ''
  });
  const [categories, setCategories] = useState<any[]>([]);
  const [typesCommerciaux, setTypesCommerciaux] = useState<any[]>([]);
  const [commerciaux, setCommerciaux] = useState<any[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const [formData, setFormData] = useState({
    code_client: '',
    raison_sociale: '',
    civilite: '',
    id_categorie: '',
    id_commercial: '',
    id_type_commercial: '',
    siren_siret: '',
    numero_tva: '',
    site_web: '',
    conditions_paiement: '',
    plafond_credit: '',
    taux_remise: '0',
    actif: true,
    // Adresse de facturation
    adresse_facturation: {
      civilite: '',
      nom_adresse: '',
      adresse_ligne1: '',
      adresse_ligne2: '',
      code_postal: '',
      ville: '',
      departement: '',
      pays: 'Tunisie',
      site_web: ''
    },
    // Contact principal
    contact_principal: {
      civilite: '',
      nom: '',
      prenom: '',
      fonction: '',
      service_bureau: '',
      email: '',
      telephone_fixe: '',
      telephone_portable: ''
    }
  });

  useEffect(() => {
    loadData();
    loadCategories();
    loadTypesCommerciaux();
    loadCommerciaux();
  }, [search, filters]);

  const loadData = async () => {
    try {
      const params: any = { search };
      if (filters.type_client) params.type_client = filters.type_client;
      if (filters.id_categorie) params.id_categorie = filters.id_categorie;
      if (filters.actif !== '') params.actif = filters.actif;
      
      const res = await clientsService.getClients(params);
      { const _r = res.data?.data; setClients(Array.isArray(_r) ? _r : (_r?.data || _r?.clients || [])); }
    } catch (error) {
      console.error('Erreur chargement clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await clientsService.getCategories();
      setCategories(res.data.data || res.data || []);
    } catch (error) {
      console.error('Erreur chargement catégories:', error);
    }
  };

  const loadTypesCommerciaux = async () => {
    try {
      const res = await clientsService.getTypesCommerciaux();
      setTypesCommerciaux(res.data.data || res.data || []);
    } catch (error) {
      console.error('Erreur chargement types commerciaux:', error);
    }
  };

  const loadCommerciaux = async () => {
    try {
      const res = await utilisateursService.getCommerciaux();
      setCommerciaux(res.data.data || res.data || []);
    } catch (error) {
      console.error('Erreur chargement commerciaux:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Préparer les données pour l'API
      const clientData: any = {
        code_client: formData.code_client,
        raison_sociale: formData.raison_sociale,
        civilite: formData.civilite || undefined,
        id_categorie: formData.id_categorie || undefined,
        id_commercial: formData.id_commercial || undefined,
        id_type_commercial: formData.id_type_commercial || undefined,
        siren_siret: formData.siren_siret || undefined,
        numero_tva: formData.numero_tva || undefined,
        site_web: formData.site_web || undefined,
        conditions_paiement: formData.conditions_paiement || undefined,
        plafond_credit: formData.plafond_credit ? parseFloat(formData.plafond_credit) : undefined,
        taux_remise: formData.taux_remise ? parseFloat(formData.taux_remise) : 0,
        actif: formData.actif
      };

      // Pour la création, inclure l'adresse et le contact
      if (!editingClient) {
        clientData.adresse_facturation = formData.adresse_facturation.adresse_ligne1 ? formData.adresse_facturation : undefined;
        clientData.contact_principal = formData.contact_principal.nom ? formData.contact_principal : undefined;
      }

      if (editingClient) {
        await clientsService.updateClient(editingClient.id_client, clientData);
      } else {
        await clientsService.createClient(clientData);
      }
      setShowForm(false);
      setEditingClient(null);
      resetForm();
      loadData();
    } catch (error: any) {
      console.error('Erreur:', error);
      alert(error.response?.data?.error?.message || 'Erreur lors de la sauvegarde');
    }
  };

  const handleEdit = async (client: any) => {
    setEditingClient(client);
    
    // Charger les détails complets du client pour avoir adresses et contacts
    try {
      const res = await clientsService.getClient(client.id_client);
      const fullClient = res.data.data || res.data;
      
      const adresseFacturation = fullClient.adresses?.find((a: any) => a.type_adresse === 'FACTURATION' && a.principale) || {};
      const contactPrincipal = fullClient.contacts?.find((c: any) => c.contact_principal) || {};
      
      setFormData({
        code_client: client.code_client,
        raison_sociale: client.raison_sociale,
        civilite: client.civilite || '',
        id_categorie: client.id_categorie || '',
        id_commercial: client.id_commercial || '',
        id_type_commercial: client.id_type_commercial || '',
        siren_siret: client.siren_siret || '',
        numero_tva: client.numero_tva || '',
        site_web: client.site_web || '',
        conditions_paiement: client.conditions_paiement || '',
        plafond_credit: client.plafond_credit || '',
        taux_remise: client.taux_remise || '0',
        actif: client.actif,
        adresse_facturation: {
          civilite: adresseFacturation.civilite || '',
          nom_adresse: adresseFacturation.nom_adresse || client.raison_sociale,
          adresse_ligne1: adresseFacturation.adresse_ligne1 || '',
          adresse_ligne2: adresseFacturation.adresse_ligne2 || '',
          code_postal: adresseFacturation.code_postal || '',
          ville: adresseFacturation.ville || '',
          departement: adresseFacturation.departement || '',
          pays: adresseFacturation.pays || 'Tunisie',
          site_web: adresseFacturation.site_web || ''
        },
        contact_principal: {
          civilite: contactPrincipal.civilite || '',
          nom: contactPrincipal.nom || '',
          prenom: contactPrincipal.prenom || '',
          fonction: contactPrincipal.fonction || '',
          service_bureau: contactPrincipal.service_bureau || '',
          email: contactPrincipal.email || '',
          telephone_fixe: contactPrincipal.telephone_fixe || '',
          telephone_portable: contactPrincipal.telephone_portable || ''
        }
      });
    } catch (error) {
      console.error('Erreur chargement détails client:', error);
      // Utiliser les données de base si erreur
      setFormData({
        code_client: client.code_client,
        raison_sociale: client.raison_sociale,
        civilite: client.civilite || '',
        id_categorie: client.id_categorie || '',
        id_commercial: client.id_commercial || '',
        id_type_commercial: client.id_type_commercial || '',
        siren_siret: client.siren_siret || '',
        numero_tva: client.numero_tva || '',
        site_web: client.site_web || '',
        conditions_paiement: client.conditions_paiement || '',
        plafond_credit: client.plafond_credit || '',
        taux_remise: client.taux_remise || '0',
        actif: client.actif,
        adresse_facturation: {
          civilite: '',
          nom_adresse: client.raison_sociale,
          adresse_ligne1: '',
          adresse_ligne2: '',
          code_postal: '',
          ville: '',
          departement: '',
          pays: 'Tunisie',
          site_web: ''
        },
        contact_principal: {
          civilite: '',
          nom: '',
          prenom: '',
          fonction: '',
          service_bureau: '',
          email: '',
          telephone_fixe: '',
          telephone_portable: ''
        }
      });
    }
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir désactiver ce client ?')) {
      try {
        await clientsService.deleteClient(id);
        loadData();
      } catch (error) {
        alert('Erreur lors de la suppression');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      code_client: '',
      raison_sociale: '',
      civilite: '',
      id_categorie: '',
      id_commercial: '',
      id_type_commercial: '',
      siren_siret: '',
      numero_tva: '',
      site_web: '',
      conditions_paiement: '',
      plafond_credit: '',
      taux_remise: '0',
      actif: true,
      adresse_facturation: {
        civilite: '',
        nom_adresse: '',
        adresse_ligne1: '',
        adresse_ligne2: '',
        code_postal: '',
        ville: '',
        departement: '',
        pays: 'Tunisie',
        site_web: ''
      },
      contact_principal: {
        civilite: '',
        nom: '',
        prenom: '',
        fonction: '',
        service_bureau: '',
        email: '',
        telephone_fixe: '',
        telephone_portable: ''
      }
    });
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="ml-64 p-6">
        <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">👥 Clients</h1>
          <button
            onClick={() => { setShowForm(true); setEditingClient(null); resetForm(); }}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            + Nouveau Client
          </button>
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
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                showFilters ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filtres
            </button>
          </div>
          <input
            type="text"
            placeholder="Rechercher par code, raison sociale ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border rounded"
          />
          
          {/* Filtres */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  value={filters.type_client}
                  onChange={(e) => setFilters({ ...filters, type_client: e.target.value })}
                  className="w-full px-4 py-2 border rounded"
                >
                  <option value="">Tous</option>
                  <option value="CLIENT">Client</option>
                  <option value="PROSPECT">Prospect</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Catégorie</label>
                <select
                  value={filters.id_categorie}
                  onChange={(e) => setFilters({ ...filters, id_categorie: e.target.value })}
                  className="w-full px-4 py-2 border rounded"
                >
                  <option value="">Toutes</option>
                  {categories.map((cat) => (
                    <option key={cat.id_categorie} value={cat.id_categorie}>
                      {cat.libelle}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Statut</label>
                <select
                  value={filters.actif}
                  onChange={(e) => setFilters({ ...filters, actif: e.target.value })}
                  className="w-full px-4 py-2 border rounded"
                >
                  <option value="">Tous</option>
                  <option value="true">Actifs</option>
                  <option value="false">Inactifs</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Formulaire */}
        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">{editingClient ? 'Modifier' : 'Nouveau'} Client</h2>
              <button
                onClick={() => { setShowForm(false); setEditingClient(null); resetForm(); }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Informations générales */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Building className="w-5 h-5 text-blue-600" />
                  Informations générales
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Code Client *</label>
                    <input
                      type="text"
                      required
                      value={formData.code_client}
                      onChange={(e) => setFormData({ ...formData, code_client: e.target.value })}
                      className="w-full px-4 py-2 border rounded"
                      placeholder="CL00001"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Raison Sociale *</label>
                    <input
                      type="text"
                      required
                      value={formData.raison_sociale}
                      onChange={(e) => setFormData({ ...formData, raison_sociale: e.target.value })}
                      className="w-full px-4 py-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Civilité</label>
                    <input
                      type="text"
                      value={formData.civilite}
                      onChange={(e) => setFormData({ ...formData, civilite: e.target.value })}
                      className="w-full px-4 py-2 border rounded"
                      placeholder="SARL, BOUTIQUE, etc."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Catégorie</label>
                    <select
                      value={formData.id_categorie}
                      onChange={(e) => setFormData({ ...formData, id_categorie: e.target.value })}
                      className="w-full px-4 py-2 border rounded"
                    >
                      <option value="">Sélectionner une catégorie</option>
                      {categories.map((cat) => (
                        <option key={cat.id_categorie} value={cat.id_categorie}>
                          {cat.libelle}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">SIREN/SIRET</label>
                    <input
                      type="text"
                      value={formData.siren_siret}
                      onChange={(e) => setFormData({ ...formData, siren_siret: e.target.value })}
                      className="w-full px-4 py-2 border rounded"
                      placeholder="123456789"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">N° TVA intracommunautaire</label>
                    <input
                      type="text"
                      value={formData.numero_tva}
                      onChange={(e) => setFormData({ ...formData, numero_tva: e.target.value })}
                      className="w-full px-4 py-2 border rounded"
                      placeholder="FR12345678901"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Site web
                    </label>
                    <input
                      type="url"
                      value={formData.site_web}
                      onChange={(e) => setFormData({ ...formData, site_web: e.target.value })}
                      className="w-full px-4 py-2 border rounded"
                      placeholder="https://example.com"
                    />
                  </div>
                </div>
              </div>

              {/* Commercial */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                  Commercial
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Commercial assigné</label>
                    <select
                      value={formData.id_commercial}
                      onChange={(e) => setFormData({ ...formData, id_commercial: e.target.value })}
                      className="w-full px-4 py-2 border rounded"
                    >
                      <option value="">Aucun</option>
                      {commerciaux.map((com) => (
                        <option key={com.id_utilisateur} value={com.id_utilisateur}>
                          {com.nom_complet || com.nom_utilisateur}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Type commercial</label>
                    <select
                      value={formData.id_type_commercial}
                      onChange={(e) => setFormData({ ...formData, id_type_commercial: e.target.value })}
                      className="w-full px-4 py-2 border rounded"
                    >
                      <option value="">Sélectionner un type</option>
                      {typesCommerciaux.map((type) => (
                        <option key={type.id_type_commercial} value={type.id_type_commercial}>
                          {type.libelle}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Adresse de facturation */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  Adresse de facturation
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Civilité</label>
                    <input
                      type="text"
                      value={formData.adresse_facturation.civilite}
                      onChange={(e) => setFormData({
                        ...formData,
                        adresse_facturation: { ...formData.adresse_facturation, civilite: e.target.value }
                      })}
                      className="w-full px-4 py-2 border rounded"
                      placeholder="SARL, BOUTIQUE, etc."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Nom de l'adresse</label>
                    <input
                      type="text"
                      value={formData.adresse_facturation.nom_adresse}
                      onChange={(e) => setFormData({
                        ...formData,
                        adresse_facturation: { ...formData.adresse_facturation, nom_adresse: e.target.value }
                      })}
                      className="w-full px-4 py-2 border rounded"
                      placeholder="Siège social, Boutique..."
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Adresse ligne 1 *</label>
                    <input
                      type="text"
                      required
                      value={formData.adresse_facturation.adresse_ligne1}
                      onChange={(e) => setFormData({
                        ...formData,
                        adresse_facturation: { ...formData.adresse_facturation, adresse_ligne1: e.target.value }
                      })}
                      className="w-full px-4 py-2 border rounded"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Adresse ligne 2</label>
                    <input
                      type="text"
                      value={formData.adresse_facturation.adresse_ligne2}
                      onChange={(e) => setFormData({
                        ...formData,
                        adresse_facturation: { ...formData.adresse_facturation, adresse_ligne2: e.target.value }
                      })}
                      className="w-full px-4 py-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Code postal</label>
                    <input
                      type="text"
                      value={formData.adresse_facturation.code_postal}
                      onChange={(e) => setFormData({
                        ...formData,
                        adresse_facturation: { ...formData.adresse_facturation, code_postal: e.target.value }
                      })}
                      className="w-full px-4 py-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Ville</label>
                    <input
                      type="text"
                      value={formData.adresse_facturation.ville}
                      onChange={(e) => setFormData({
                        ...formData,
                        adresse_facturation: { ...formData.adresse_facturation, ville: e.target.value }
                      })}
                      className="w-full px-4 py-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Département</label>
                    <input
                      type="text"
                      value={formData.adresse_facturation.departement}
                      onChange={(e) => setFormData({
                        ...formData,
                        adresse_facturation: { ...formData.adresse_facturation, departement: e.target.value }
                      })}
                      className="w-full px-4 py-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Pays *</label>
                    <input
                      type="text"
                      required
                      value={formData.adresse_facturation.pays}
                      onChange={(e) => setFormData({
                        ...formData,
                        adresse_facturation: { ...formData.adresse_facturation, pays: e.target.value }
                      })}
                      className="w-full px-4 py-2 border rounded"
                    />
                  </div>
                </div>
              </div>

              {/* Contact principal */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Contact principal
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Civilité</label>
                    <input
                      type="text"
                      value={formData.contact_principal.civilite}
                      onChange={(e) => setFormData({
                        ...formData,
                        contact_principal: { ...formData.contact_principal, civilite: e.target.value }
                      })}
                      className="w-full px-4 py-2 border rounded"
                      placeholder="Monsieur, Madame, etc."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Nom *</label>
                    <input
                      type="text"
                      required
                      value={formData.contact_principal.nom}
                      onChange={(e) => setFormData({
                        ...formData,
                        contact_principal: { ...formData.contact_principal, nom: e.target.value }
                      })}
                      className="w-full px-4 py-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Prénom</label>
                    <input
                      type="text"
                      value={formData.contact_principal.prenom}
                      onChange={(e) => setFormData({
                        ...formData,
                        contact_principal: { ...formData.contact_principal, prenom: e.target.value }
                      })}
                      className="w-full px-4 py-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Fonction</label>
                    <input
                      type="text"
                      value={formData.contact_principal.fonction}
                      onChange={(e) => setFormData({
                        ...formData,
                        contact_principal: { ...formData.contact_principal, fonction: e.target.value }
                      })}
                      className="w-full px-4 py-2 border rounded"
                      placeholder="Gérant, Responsable..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Service/Bureau</label>
                    <input
                      type="text"
                      value={formData.contact_principal.service_bureau}
                      onChange={(e) => setFormData({
                        ...formData,
                        contact_principal: { ...formData.contact_principal, service_bureau: e.target.value }
                      })}
                      className="w-full px-4 py-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.contact_principal.email}
                      onChange={(e) => setFormData({
                        ...formData,
                        contact_principal: { ...formData.contact_principal, email: e.target.value }
                      })}
                      className="w-full px-4 py-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Téléphone fixe
                    </label>
                    <input
                      type="tel"
                      value={formData.contact_principal.telephone_fixe}
                      onChange={(e) => setFormData({
                        ...formData,
                        contact_principal: { ...formData.contact_principal, telephone_fixe: e.target.value }
                      })}
                      className="w-full px-4 py-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Téléphone portable
                    </label>
                    <input
                      type="tel"
                      value={formData.contact_principal.telephone_portable}
                      onChange={(e) => setFormData({
                        ...formData,
                        contact_principal: { ...formData.contact_principal, telephone_portable: e.target.value }
                      })}
                      className="w-full px-4 py-2 border rounded"
                    />
                  </div>
                </div>
              </div>

              {/* Conditions commerciales */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  Conditions commerciales
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Conditions de paiement</label>
                    <input
                      type="text"
                      value={formData.conditions_paiement}
                      onChange={(e) => setFormData({ ...formData, conditions_paiement: e.target.value })}
                      className="w-full px-4 py-2 border rounded"
                      placeholder="Chèque 60 jours, Virement..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Plafond de crédit</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.plafond_credit}
                      onChange={(e) => setFormData({ ...formData, plafond_credit: e.target.value })}
                      className="w-full px-4 py-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                      <Percent className="w-4 h-4" />
                      Taux de remise (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={formData.taux_remise}
                      onChange={(e) => setFormData({ ...formData, taux_remise: e.target.value })}
                      className="w-full px-4 py-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Statut</label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.actif}
                        onChange={(e) => setFormData({ ...formData, actif: e.target.checked })}
                        className="rounded"
                      />
                      <span>Client actif</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t">
                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
                  {editingClient ? 'Modifier' : 'Créer'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setEditingClient(null); resetForm(); }}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Liste */}
        {affichageMode === 'ligne' ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Raison Sociale</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Catégorie</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ville</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pays</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clients.map((client) => (
                <tr key={client.id_client} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium font-mono">{client.code_client}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{client.raison_sociale}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {client.type_client === 'CLIENT' ? (
                      <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">Client</span>
                    ) : (
                      <span className="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-800">Prospect</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{client.libelle_categorie || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{client.ville_facturation || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{client.pays_facturation || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{client.email_contact_principal || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded ${client.actif ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {client.actif ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (client.id_client) navigate(`/clients/${client.id_client}`);
                        }}
                        className="text-green-600 hover:text-green-900"
                        title="Voir les détails"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(client);
                        }} 
                        className="text-blue-600 hover:text-blue-900" 
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(client.id_client);
                        }} 
                        className="text-red-600 hover:text-red-900" 
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {clients.map((client) => (
              <div 
                key={client.id_client} 
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => {
                  if (client.id_client) navigate(`/clients/${client.id_client}`);
                }}
              >
                <div className="h-32 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-800">{client.raison_sociale?.charAt(0) || 'C'}</div>
                    <span className="text-xs font-mono text-blue-600">{client.code_client}</span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg text-gray-800 mb-2">{client.raison_sociale}</h3>
                  <div className="space-y-1 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-2 mb-2">
                      {client.type_client === 'CLIENT' ? (
                        <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">Client</span>
                      ) : (
                        <span className="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-800">Prospect</span>
                      )}
                      {client.libelle_categorie && (
                        <span className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-800">{client.libelle_categorie}</span>
                      )}
                    </div>
                    <p><span className="font-medium">Ville:</span> {client.ville_facturation || '-'}</p>
                    <p><span className="font-medium">Pays:</span> {client.pays_facturation || '-'}</p>
                    <p><span className="font-medium">Email:</span> {client.email_contact_principal || '-'}</p>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-2 py-1 rounded text-xs ${client.actif ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {client.actif ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                  <div className="flex gap-2 pt-3 border-t" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => {
                        if (client.id_client) navigate(`/clients/${client.id_client}`);
                      }}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                    >
                      <Eye className="w-4 h-4" />
                      Voir
                    </button>
                    <button
                      onClick={() => handleEdit(client)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                    >
                      <Edit className="w-4 h-4" />
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(client.id_client)}
                      className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal de consultation */}
        {selectedClient && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <Building className="w-6 h-6 text-blue-600" />
                  {selectedClient.raison_sociale}
                </h2>
                <button
                  onClick={() => setSelectedClient(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Informations générales */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    Informations Générales
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Code Client</label>
                      <p className="text-gray-900 font-semibold">{selectedClient.code_client}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Raison Sociale</label>
                      <p className="text-gray-900 font-semibold">{selectedClient.raison_sociale}</p>
                    </div>
                    {selectedClient.contact_principal && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Contact Principal</label>
                        <p className="text-gray-900">{selectedClient.contact_principal}</p>
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium text-gray-500">Statut</label>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${selectedClient.actif ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {selectedClient.actif ? 'Actif' : 'Inactif'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Coordonnées */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    Coordonnées
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedClient.adresse && (
                      <div className="col-span-2">
                        <label className="text-sm font-medium text-gray-500">Adresse</label>
                        <p className="text-gray-900">{selectedClient.adresse}</p>
                      </div>
                    )}
                    {selectedClient.code_postal && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Code Postal</label>
                        <p className="text-gray-900">{selectedClient.code_postal}</p>
                      </div>
                    )}
                    {selectedClient.ville && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Ville</label>
                        <p className="text-gray-900">{selectedClient.ville}</p>
                      </div>
                    )}
                    {selectedClient.pays && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Pays</label>
                        <p className="text-gray-900">{selectedClient.pays}</p>
                      </div>
                    )}
                    {selectedClient.telephone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <div>
                          <label className="text-sm font-medium text-gray-500">Téléphone</label>
                          <p className="text-gray-900">{selectedClient.telephone}</p>
                        </div>
                      </div>
                    )}
                    {selectedClient.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <div>
                          <label className="text-sm font-medium text-gray-500">Email</label>
                          <p className="text-gray-900">{selectedClient.email}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Informations commerciales */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    Informations Commerciales
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedClient.devise && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Devise</label>
                        <p className="text-gray-900">{selectedClient.devise}</p>
                      </div>
                    )}
                    {selectedClient.taux_remise && parseFloat(selectedClient.taux_remise) > 0 && (
                      <div className="flex items-center gap-2">
                        <Percent className="w-4 h-4 text-gray-400" />
                        <div>
                          <label className="text-sm font-medium text-gray-500">Taux de Remise</label>
                          <p className="text-gray-900">{selectedClient.taux_remise}%</p>
                        </div>
                      </div>
                    )}
                    {selectedClient.plafond_credit && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Plafond Crédit</label>
                        <p className="text-gray-900">{selectedClient.plafond_credit} {selectedClient.devise || 'TND'}</p>
                      </div>
                    )}
                    {selectedClient.conditions_paiement && (
                      <div className="col-span-2">
                        <label className="text-sm font-medium text-gray-500">Conditions de Paiement</label>
                        <p className="text-gray-900">{selectedClient.conditions_paiement}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="border-t pt-4 flex gap-2 justify-end">
                  <button
                    onClick={() => {
                      handleEdit(selectedClient);
                      setSelectedClient(null);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Modifier
                  </button>
                  <button
                    onClick={() => setSelectedClient(null)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default Clients;
