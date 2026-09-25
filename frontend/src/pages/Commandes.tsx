import React, { useEffect, useState, useMemo } from 'react';
import { commandesService, clientsService, articlesService, bonsLivraisonService, parametresCatalogueService } from '../services/api';
import { ShoppingCart, Plus, Edit, Trash2, Search, Eye, X, CheckCircle, Package, Calendar, User, DollarSign, Truck, Upload, File, Clock, TrendingUp, Zap } from 'lucide-react';
import ArticlePicker from '../components/ArticlePicker';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import KpiCard from '../components/ecommerce/KpiCard';

const Commandes: React.FC = () => {
  const [commandes, setCommandes] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [typesPersonnalisation, setTypesPersonnalisation] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCommande, setEditingCommande] = useState<any>(null);
  const [selectedCommande, setSelectedCommande] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ statut: '', client_id: '', sans_of: '' });
  const [pickerIndex, setPickerIndex] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    id_client: '',
    ref_client: '',
    num_commande_client: '',
    date_commande: new Date().toISOString().split('T')[0],
    date_livraison_prevue: '',
    date_envoie: '',
    priorite: 'normale',
    devise: 'TND',
    conditions_paiement: '',
    statut: 'en_attente',
    lignes: [] as any[]
  });
  
  const [uploadingFiles, setUploadingFiles] = useState<{ [key: number]: boolean }>({});

  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    loadData();
  }, [filters, search]);

  useEffect(() => {
    const editId = searchParams.get('edit');
    if (editId && commandes.length > 0) {
      const cmd = commandes.find((c: any) => c.id_commande?.toString() === editId);
      if (cmd) {
        handleEdit(cmd);
        const next = new URLSearchParams(searchParams);
        next.delete('edit');
        setSearchParams(next, { replace: true });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commandes]);

  const loadData = async () => {
    try {
      const [cmdRes, clientsRes, articlesRes, typesPersoRes] = await Promise.all([
        commandesService.getCommandes({ ...filters, search }),
        clientsService.getClients(),
        articlesService.getArticles(),
        parametresCatalogueService.getTypesPersonnalisation().catch(() => ({ data: { data: [] } }))
      ]);
      const cmdRaw = cmdRes.data?.data; setCommandes(Array.isArray(cmdRaw) ? cmdRaw : (cmdRaw?.data || cmdRaw?.commandes || []));
      const clRaw = clientsRes.data?.data; setClients(Array.isArray(clRaw) ? clRaw : (clRaw?.data || clRaw?.clients || []));
      const arRaw = articlesRes.data?.data; setArticles(Array.isArray(arRaw) ? arRaw : (arRaw?.data || arRaw?.articles || []));
      const tpRaw = typesPersoRes.data?.data; setTypesPersonnalisation(Array.isArray(tpRaw) ? tpRaw : (tpRaw?.data || []));
    } catch (error) {
      console.error('Erreur chargement commandes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.lignes.length === 0) {
      alert('Ajoutez au moins une ligne de commande');
      return;
    }
    try {
      if (editingCommande) {
        await commandesService.updateCommande(editingCommande.id_commande, formData);
      } else {
        await commandesService.createCommande(formData);
      }
      setShowForm(false);
      setEditingCommande(null);
      resetForm();
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'Erreur');
    }
  };

  const addLigne = () => {
    setFormData({
      ...formData,
      lignes: [...formData.lignes, { 
        id_article: '', 
        ref_commerciale: '',
        quantite_commandee: '', 
        prix_unitaire: '', 
        prix_total_ht: 0,
        remise: '0', 
        date_livraison_prevue: '',
        personnalisation: false,
        details_personnalisation: ''
      }]
    });
  };

  const removeLigne = (index: number) => {
    setFormData({
      ...formData,
      lignes: formData.lignes.filter((_, i) => i !== index)
    });
  };

  const updateLigne = (index: number, field: string, value: any) => {
    const newLignes = [...formData.lignes];
    newLignes[index] = { ...newLignes[index], [field]: value };
    setFormData({ ...formData, lignes: newLignes });
  };

  const handleValider = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir valider cette commande ?')) {
      try {
        await commandesService.validerCommande(id);
        loadData();
        alert('Commande validée avec succès');
      } catch (error: any) {
        alert(error.response?.data?.error?.message || 'Erreur lors de la validation');
      }
    }
  };

  const handleCreerBL = async (commandeId: number) => {
    if (window.confirm('Créer un bon de livraison depuis cette commande ?')) {
      try {
        const result = await bonsLivraisonService.createFromCommande(commandeId, {
          date_livraison: new Date().toISOString().split('T')[0],
          statut: 'BROUILLON'
        });
        if (result.data?.success) {
          alert('Bon de livraison créé avec succès !');
          loadData();
        }
      } catch (error: any) {
        alert(error.response?.data?.error?.message || 'Erreur lors de la création du BL');
      }
    }
  };

  const handleEdit = (commande: any) => {
    setEditingCommande(commande);
    setFormData({
      id_client: commande.id_client || '',
      ref_client: commande.ref_client || '',
      num_commande_client: commande.num_commande_client || '',
      date_commande: commande.date_commande ? commande.date_commande.split('T')[0] : new Date().toISOString().split('T')[0],
      date_livraison_prevue: commande.date_livraison_prevue ? commande.date_livraison_prevue.split('T')[0] : '',
      date_envoie: commande.date_envoie ? commande.date_envoie.split('T')[0] : '',
      priorite: commande.priorite || 'normale',
      devise: commande.devise || 'TND',
      conditions_paiement: commande.conditions_paiement || '',
      statut: commande.statut || 'en_attente',
      lignes: commande.lignes || []
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      id_client: '',
      ref_client: '',
      num_commande_client: '',
      date_commande: new Date().toISOString().split('T')[0],
      date_livraison_prevue: '',
      date_envoie: '',
      priorite: 'normale',
      devise: 'TND',
      conditions_paiement: '',
      statut: 'en_attente',
      lignes: []
    });
  };

  const kpis = useMemo(() => {
    const total = commandes.length;
    const enAttente = commandes.filter(c => c.statut === 'en_attente').length;
    const enProduction = commandes.filter(c => c.statut === 'en_production' || c.statut === 'validee').length;
    const caTotal = commandes.reduce((s, c) => s + Number(c.montant_total || 0), 0);
    return { total, enAttente, enProduction, caTotal };
  }, [commandes]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-app)' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--accent-terracotta)' }}></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-app)' }}>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
        <div style={{ marginBottom: 'var(--s-6)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--s-2)' }}>
            VENTES · COMMANDES
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 500, fontSize: 'var(--text-3xl)', color: 'var(--fg-primary)', marginBottom: 'var(--s-2)' }}>
                Commandes
              </h1>
              <p style={{ color: 'var(--fg-secondary)', fontSize: 'var(--text-md)' }}>
                Suivi des commandes clients — de la prise de commande à la livraison.
              </p>
            </div>
            <button
              onClick={() => { setShowForm(true); setEditingCommande(null); resetForm(); }}
              className="inline-flex items-center gap-2 transition-shadow"
              style={{
                background: 'var(--accent-terracotta)',
                color: 'var(--fg-inverse)',
                padding: '0.6rem 1.1rem',
                borderRadius: 'var(--radius-full)',
                boxShadow: 'var(--shadow-md)',
                fontWeight: 600,
                fontSize: 'var(--text-sm)',
              }}
            >
              <Plus className="w-4 h-4" />
              Nouvelle commande
            </button>
          </div>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KpiCard label="Total commandes" value={kpis.total} icon={<ShoppingCart className="w-5 h-5" />} color="terracotta" />
          <KpiCard label="En attente" value={kpis.enAttente} icon={<Clock className="w-5 h-5" />} color={kpis.enAttente > 0 ? 'warning' : 'neutral'} />
          <KpiCard label="En production" value={kpis.enProduction} icon={<Zap className="w-5 h-5" />} color="indigo" />
          <KpiCard label="CA cumulé" value={kpis.caTotal.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} suffix="TND" icon={<TrendingUp className="w-5 h-5" />} color="sage" />
        </div>

        {/* Filtres */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-4 py-2 border rounded"
            />
            <select
              value={filters.statut}
              onChange={(e) => setFilters({ ...filters, statut: e.target.value })}
              className="px-4 py-2 border rounded"
            >
              <option value="">Tous les statuts</option>
              <option value="en_attente">En attente</option>
              <option value="validee">Validée</option>
              <option value="en_production">En production</option>
              <option value="livree">Livrée</option>
            </select>
            <select
              value={filters.client_id}
              onChange={(e) => setFilters({ ...filters, client_id: e.target.value })}
              className="px-4 py-2 border rounded"
            >
              <option value="">Tous les clients</option>
              {clients.map((client) => (
                <option key={client.id_client} value={client.id_client}>{client.raison_sociale}</option>
              ))}
            </select>
            <select
              value={filters.sans_of}
              onChange={(e) => setFilters({ ...filters, sans_of: e.target.value })}
              className="px-4 py-2 border rounded"
              title="Filtrer par présence d'OF"
            >
              <option value="">OF: tous</option>
              <option value="1">Validées sans OF</option>
              <option value="0">Avec OF</option>
            </select>
          </div>
        </div>

        {/* Formulaire */}
        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-bold mb-4">{editingCommande ? 'Modifier' : 'Nouvelle'} Commande</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Client *</label>
                  <select
                    required
                    value={formData.id_client}
                    onChange={(e) => {
                      const client = clients.find(c => c.id_client === parseInt(e.target.value));
                      setFormData({ 
                        ...formData, 
                        id_client: e.target.value,
                        ref_client: client?.code_client || ''
                      });
                    }}
                    className="w-full px-4 py-2 border rounded"
                  >
                    <option value="">Sélectionner...</option>
                    {clients.filter(c => c.actif).map((client) => (
                      <option key={client.id_client} value={client.id_client}>{client.raison_sociale}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Référence Client</label>
                  <input
                    type="text"
                    value={formData.ref_client}
                    onChange={(e) => setFormData({ ...formData, ref_client: e.target.value })}
                    className="w-full px-4 py-2 border rounded"
                    placeholder="Référence client (optionnel)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Num Commande Client</label>
                  <input
                    type="text"
                    value={formData.num_commande_client}
                    onChange={(e) => setFormData({ ...formData, num_commande_client: e.target.value })}
                    className="w-full px-4 py-2 border rounded"
                    placeholder="Numéro de commande client (optionnel)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date Commande *</label>
                  <input
                    type="date"
                    required
                    value={formData.date_commande}
                    onChange={(e) => setFormData({ ...formData, date_commande: e.target.value })}
                    className="w-full px-4 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date Livraison Prévue</label>
                  <input
                    type="date"
                    value={formData.date_livraison_prevue}
                    onChange={(e) => setFormData({ ...formData, date_livraison_prevue: e.target.value })}
                    className="w-full px-4 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date d'Envoie</label>
                  <input
                    type="date"
                    value={formData.date_envoie}
                    onChange={(e) => setFormData({ ...formData, date_envoie: e.target.value })}
                    className="w-full px-4 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">État</label>
                  <select
                    value={formData.statut}
                    onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
                    className="w-full px-4 py-2 border rounded"
                  >
                    <option value="en_attente">En attente</option>
                    <option value="validee">Validée</option>
                    <option value="en_production">En production</option>
                    <option value="livree">Livrée</option>
                    <option value="annulee">Annulée</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Priorité</label>
                  <select
                    value={formData.priorite}
                    onChange={(e) => setFormData({ ...formData, priorite: e.target.value })}
                    className="w-full px-4 py-2 border rounded"
                  >
                    <option value="normale">Normale</option>
                    <option value="haute">Haute</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </div>
              </div>

              {/* Lignes de commande */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium">Lignes de Commande *</label>
                  <button type="button" onClick={addLigne} className="text-sm font-medium hover:underline" style={{ color: 'var(--accent-terracotta)' }}>+ Ajouter ligne</button>
                </div>
                {formData.lignes.map((ligne, index) => {
                  const selectedArticle = articles.find(a => a.id_article === parseInt(ligne.id_article) || a.ref_commercial === ligne.ref_commerciale);
                  const prixUnitaire = parseFloat(ligne.prix_unitaire) || 0;
                  const quantite = parseFloat(ligne.quantite_commandee) || 0;
                  const remise = parseFloat(ligne.remise) || 0;
                  const prixTotalHT = prixUnitaire * quantite * (1 - remise / 100);
                  
                  return (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4 bg-white">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        {/* Référence Commerciale */}
                        <div className="col-span-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Référence Commerciale *</label>
                          <button
                            type="button"
                            onClick={() => setPickerIndex(index)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8663D]/40 text-left bg-white hover:bg-gray-50"
                          >
                            {ligne.description_article || ligne.ref_commerciale || (ligne.id_article ? `Article #${ligne.id_article}` : 'Sélectionner un article...')}
                          </button>
                        </div>

                        {/* Description Article (automatique) */}
                        <div className="col-span-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Description Article</label>
                          <input
                            type="text"
                            value={ligne.description_article || selectedArticle?.description_article || selectedArticle?.designation_article || ''}
                            readOnly
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                            placeholder="Généré automatiquement"
                          />
                        </div>

                        {/* Dimensions (automatique) */}
                        <div className="col-span-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Dimensions</label>
                          <input
                            type="text"
                            value={ligne.dimensions || selectedArticle?.dimensions || ''}
                            readOnly
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                            placeholder="Généré automatiquement"
                          />
                        </div>

                        {/* Type de Finition (automatique) */}
                        <div className="col-span-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Type de Finition</label>
                          <input
                            type="text"
                            value={ligne.type_finition || selectedArticle?.type_finition || ''}
                            readOnly
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                            placeholder="Généré automatiquement"
                          />
                        </div>

                        {/* Quantité */}
                        <div className="col-span-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Quantité Commandée *</label>
                          <input
                            type="number"
                            step="0.01"
                            required
                            value={ligne.quantite_commandee}
                            onChange={(e) => {
                              updateLigne(index, 'quantite_commandee', e.target.value);
                              const qte = parseFloat(e.target.value) || 0;
                              const prix = parseFloat(ligne.prix_unitaire) || 0;
                              const rem = parseFloat(ligne.remise) || 0;
                              updateLigne(index, 'prix_total_ht', (prix * qte * (1 - rem / 100)).toFixed(2));
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8663D]/40"
                          />
                        </div>

                        {/* Prix Unitaire */}
                        <div className="col-span-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Prix Unitaire (HT) *</label>
                          <input
                            type="number"
                            step="0.01"
                            required
                            value={ligne.prix_unitaire}
                            onChange={(e) => {
                              updateLigne(index, 'prix_unitaire', e.target.value);
                              const prix = parseFloat(e.target.value) || 0;
                              const qte = parseFloat(ligne.quantite_commandee) || 0;
                              const rem = parseFloat(ligne.remise) || 0;
                              updateLigne(index, 'prix_total_ht', (prix * qte * (1 - rem / 100)).toFixed(2));
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8663D]/40"
                          />
                        </div>

                        {/* Remise */}
                        <div className="col-span-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Remise (%)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={ligne.remise || 0}
                            onChange={(e) => {
                              updateLigne(index, 'remise', e.target.value);
                              const rem = parseFloat(e.target.value) || 0;
                              const prix = parseFloat(ligne.prix_unitaire) || 0;
                              const qte = parseFloat(ligne.quantite_commandee) || 0;
                              updateLigne(index, 'prix_total_ht', (prix * qte * (1 - rem / 100)).toFixed(2));
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8663D]/40"
                          />
                        </div>

                        {/* Prix Total HT */}
                        <div className="col-span-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Prix Total HT</label>
                          <input
                            type="number"
                            step="0.01"
                            value={ligne.prix_total_ht || prixTotalHT.toFixed(2)}
                            readOnly
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 font-semibold"
                          />
                        </div>

                        {/* Personnalisation */}
                        <div className="col-span-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Personnalisation</label>
                          <select
                            value={ligne.personnalisation ? 'oui' : 'non'}
                            onChange={(e) => {
                              updateLigne(index, 'personnalisation', e.target.value === 'oui');
                              if (e.target.value === 'non') {
                                updateLigne(index, 'details_personnalisation', '');
                              }
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8663D]/40"
                          >
                            <option value="non">Non</option>
                            <option value="oui">Oui</option>
                          </select>
                        </div>

                        {/* Détails Personnalisation (si Oui) */}
                        {ligne.personnalisation && (
                          <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Détails Personnalisation *</label>
                            <textarea
                              required
                              value={ligne.details_personnalisation || ''}
                              onChange={(e) => updateLigne(index, 'details_personnalisation', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8663D]/40"
                              rows={2}
                              placeholder="Décrire les détails de la personnalisation..."
                            />
                          </div>
                        )}

                        {/* Date Livraison Prévue */}
                        <div className="col-span-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Date Livraison Prévue</label>
                          <input
                            type="date"
                            value={ligne.date_livraison_prevue || formData.date_livraison_prevue}
                            onChange={(e) => updateLigne(index, 'date_livraison_prevue', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8663D]/40"
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-end mt-2">
                        <button 
                          type="button" 
                          onClick={() => removeLigne(index)} 
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Supprimer cette ligne
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-4">
                <button type="submit" className="px-6 py-2 rounded hover:opacity-90 transition" style={{ background: 'var(--accent-terracotta)', color: 'var(--fg-inverse)', fontWeight: 600 }}>
                  {editingCommande ? 'Modifier' : 'Créer'}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setEditingCommande(null); resetForm(); }} className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400">
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Liste */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">N° Commande</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {commandes.map((commande) => (
                <tr key={commande.id_commande}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{commande.numero_commande}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{commande.client_nom}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(commande.date_commande).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{commande.montant_total ? `${commande.montant_total} ${commande.devise}` : '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded ${
                      commande.statut === 'validee' ? 'bg-green-100 text-green-800' :
                      commande.statut === 'en_production' ? 'bg-[#EDF0F5] text-[#3B4E68]' :
                      commande.statut === 'livree' ? 'bg-gray-100 text-gray-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {commande.statut}
                    </span>
                    {typeof commande.nb_ofs === 'number' && (
                      <span
                        className={`ml-2 px-2 py-1 text-xs rounded ${
                          commande.nb_ofs > 0
                            ? 'bg-[#EFF3E7] text-[#3F5E29]'
                            : commande.statut === 'validee'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-gray-100 text-gray-600'
                        }`}
                        title="Nombre d'ordres de fabrication liés"
                      >
                        {commande.nb_ofs > 0 ? `${commande.nb_ofs} OF` : 'OF manquants'}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link
                        to={`/commandes/${commande.id_commande}`}
                        className="hover:opacity-70 transition"
                        style={{ color: 'var(--accent-indigo)' }}
                        title="Consulter"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button 
                        onClick={() => {
                          handleEdit(commande);
                        }}
                        className="text-gray-600 hover:text-gray-900"
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {commande.statut === 'en_attente' && (
                        <button 
                          onClick={() => handleValider(commande.id_commande)} 
                          className="text-green-600 hover:text-green-900"
                          title="Valider"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal de consultation */}
        {selectedCommande && (
          <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(20,12,6,0.45)', backdropFilter: 'blur(6px)' }}>
            <div className="rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto" style={{ background: 'var(--bg-elevated)', boxShadow: 'var(--shadow-xl)' }}>
              <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold flex items-center gap-2" style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 500, color: 'var(--fg-primary)' }}>
                  <ShoppingCart className="w-6 h-6" style={{ color: 'var(--accent-terracotta)' }} />
                  Commande {selectedCommande.numero_commande}
                </h2>
                <button
                  onClick={() => setSelectedCommande(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Informations générales */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--fg-primary)' }}>
                    <User className="w-5 h-5" style={{ color: 'var(--accent-terracotta)' }} />
                    Informations Générales
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Client</label>
                      <p className="text-gray-900 font-semibold">{selectedCommande.client_nom || selectedCommande.nom_client}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <div>
                        <label className="text-sm font-medium text-gray-500">Date Commande</label>
                        <p className="text-gray-900">{new Date(selectedCommande.date_commande).toLocaleDateString()}</p>
                      </div>
                    </div>
                    {selectedCommande.date_livraison_prevue && (
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-gray-400" />
                        <div>
                          <label className="text-sm font-medium text-gray-500">Date Livraison Prévue</label>
                          <p className="text-gray-900">{new Date(selectedCommande.date_livraison_prevue).toLocaleDateString()}</p>
                        </div>
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium text-gray-500">Statut</label>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        selectedCommande.statut === 'validee' ? 'bg-green-100 text-green-800' :
                        selectedCommande.statut === 'en_production' ? 'bg-[#EDF0F5] text-[#3B4E68]' :
                        selectedCommande.statut === 'livree' ? 'bg-gray-100 text-gray-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {selectedCommande.statut}
                      </span>
                    </div>
                    {selectedCommande.priorite && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Priorité</label>
                        <p className="text-gray-900 capitalize">{selectedCommande.priorite}</p>
                      </div>
                    )}
                    {selectedCommande.devise && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <div>
                          <label className="text-sm font-medium text-gray-500">Devise</label>
                          <p className="text-gray-900">{selectedCommande.devise}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Lignes de commande */}
                {(selectedCommande.lignes || selectedCommande.articles_commande) && (selectedCommande.lignes || selectedCommande.articles_commande).length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Lignes de Commande</h3>
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Article</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Désignation</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Qté</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Prix U.</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Remise %</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {(selectedCommande.lignes || selectedCommande.articles_commande).map((ligne: any, index: number) => (
                            <tr key={index}>
                              <td className="px-4 py-2">{ligne.code_article || ligne.ref_article || '-'}</td>
                              <td className="px-4 py-2">{ligne.designation || ligne.libelle || '-'}</td>
                              <td className="px-4 py-2">{ligne.quantite_commandee || ligne.quantite}</td>
                              <td className="px-4 py-2">{Number(ligne.prix_unitaire || 0).toFixed(2)} {selectedCommande.devise || 'TND'}</td>
                              <td className="px-4 py-2">{ligne.remise || 0}%</td>
                              <td className="px-4 py-2 font-semibold">
                                {((ligne.prix_unitaire || 0) * (ligne.quantite_commandee || ligne.quantite || 0) * (1 - (ligne.remise || 0) / 100)).toFixed(2)} {selectedCommande.devise || 'TND'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Totaux */}
                {selectedCommande.montant_total && (
                  <div className="border-t pt-4">
                    <div className="flex justify-end">
                      <div className="w-64">
                        <div className="flex justify-between text-lg font-bold border-t pt-2">
                          <span>Total:</span>
                          <span>{Number(selectedCommande.montant_total || 0).toFixed(2)} {selectedCommande.devise || 'TND'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="border-t pt-4 flex gap-2 justify-end">
                  <button
                    onClick={() => {
                      handleEdit(selectedCommande);
                      setSelectedCommande(null);
                    }}
                    className="px-4 py-2 rounded-lg hover:opacity-90 transition flex items-center gap-2"
                    style={{ background: 'var(--accent-terracotta)', color: 'var(--fg-inverse)', fontWeight: 600 }}
                  >
                    <Edit className="w-4 h-4" />
                    Modifier
                  </button>
                  {selectedCommande.statut === 'en_attente' && (
                    <button
                      onClick={() => {
                        handleValider(selectedCommande.id_commande);
                        setSelectedCommande(null);
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Valider
                    </button>
                  )}
                  {selectedCommande.statut === 'validee' && !selectedCommande.id_bl && (
                    <button
                      onClick={() => {
                        handleCreerBL(selectedCommande.id_commande);
                      }}
                      className="px-4 py-2 rounded-lg hover:opacity-90 transition flex items-center gap-2"
                      style={{ background: 'var(--accent-indigo)', color: 'var(--fg-inverse)', fontWeight: 600 }}
                    >
                      <Truck className="w-4 h-4" />
                      Créer BL
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedCommande(null)}
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

      <ArticlePicker
        isOpen={pickerIndex !== null}
        onClose={() => setPickerIndex(null)}
        onSelect={(article) => {
          if (pickerIndex === null) return;
          const newLignes = [...formData.lignes];
          newLignes[pickerIndex] = {
            ...newLignes[pickerIndex],
            id_article: article.id_article,
            ref_commerciale: article.code_article,
            description_article: article.designation,
            prix_unitaire: article.prix_vente,
            quantite_commandee: article.quantite,
          };
          setFormData({ ...formData, lignes: newLignes });
          setPickerIndex(null);
        }}
      />
    </div>
  );
};

export default Commandes;
