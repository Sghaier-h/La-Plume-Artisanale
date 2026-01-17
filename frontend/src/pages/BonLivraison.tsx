import React, { useEffect, useState } from 'react';
import { Truck, Plus, Edit, Trash2, Search, Download, Eye, CheckCircle, X, Package } from 'lucide-react';
import { bonsLivraisonService, commandesService, clientsService, articlesService } from '../services/api';

interface LigneBL {
  id_article?: number;
  id_ligne_commande?: number;
  designation?: string;
  quantite_livree: number;
  prix_unitaire_ht: number;
  taux_tva?: number;
  numero_lot?: string;
  date_peremption?: string;
}

const BonLivraison: React.FC = () => {
  const [bonsLivraison, setBonsLivraison] = useState<any[]>([]);
  const [commandes, setCommandes] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBL, setEditingBL] = useState<any>(null);
  const [selectedBL, setSelectedBL] = useState<any>(null);
  const [selectedCommande, setSelectedCommande] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ statut: '', client_id: '' });

  const [formData, setFormData] = useState({
    id_commande: '',
    id_client: '',
    date_livraison: new Date().toISOString().split('T')[0],
    statut: 'BROUILLON',
    transporteur: '',
    numero_suivi: '',
    adresse_livraison: '',
    notes: '',
    lignes: [] as LigneBL[]
  });

  useEffect(() => {
    loadData();
  }, [filters, search]);

  const loadData = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filters.statut) params.statut = filters.statut.toUpperCase();
      if (filters.client_id) params.client_id = filters.client_id;
      if (search) params.search = search;

      const [blRes, cmdRes, clientsRes, articlesRes] = await Promise.all([
        bonsLivraisonService.getBonsLivraison(params).catch(() => ({ data: { data: [], success: false } })),
        commandesService.getCommandes().catch(() => ({ data: { data: [] } })),
        clientsService.getClients().catch(() => ({ data: { data: [] } })),
        articlesService.getArticles().catch(() => ({ data: { data: [] } }))
      ]);

      if (blRes.data?.success) {
        setBonsLivraison(blRes.data.data || []);
      } else {
        setBonsLivraison([]);
      }
      
      setCommandes(cmdRes.data?.data || []);
      setClients(clientsRes.data?.data || []);
      setArticles(articlesRes.data?.data || []);
    } catch (error) {
      console.error('Erreur chargement BL:', error);
      setBonsLivraison([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.lignes.length === 0) {
      alert('Ajoutez au moins une ligne de livraison');
      return;
    }
    if (!formData.id_client || !formData.date_livraison) {
      alert('Client et date de livraison requis');
      return;
    }
    try {
      if (editingBL) {
        await bonsLivraisonService.updateBonLivraison(editingBL.id_bl, formData);
      } else {
        await bonsLivraisonService.createBonLivraison(formData);
      }
      setShowForm(false);
      setEditingBL(null);
      resetForm();
      loadData();
      alert(editingBL ? 'Bon de livraison modifié avec succès' : 'Bon de livraison créé avec succès');
    } catch (error: any) {
      console.error('Erreur sauvegarde BL:', error);
      alert(error.response?.data?.error?.message || 'Erreur lors de la sauvegarde');
    }
  };

  const handleGenerateFromCommande = async (commandeId: number) => {
    try {
      const result = await bonsLivraisonService.createFromCommande(commandeId, {
        date_livraison: new Date().toISOString().split('T')[0],
        statut: 'BROUILLON'
      });
      if (result.data?.success) {
        alert('Bon de livraison généré avec succès depuis la commande');
        loadData();
      }
    } catch (error: any) {
      console.error('Erreur génération BL:', error);
      alert(error.response?.data?.error?.message || 'Erreur lors de la génération');
    }
  };

  const addLigne = () => {
    setFormData({
      ...formData,
      lignes: [...formData.lignes, { quantite_livree: 1, prix_unitaire_ht: 0, taux_tva: 20 }]
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

  const calculerTotal = () => {
    let totalHt = 0;
    formData.lignes.forEach(ligne => {
      const prix = (ligne.prix_unitaire_ht || 0) * (ligne.quantite_livree || 0);
      totalHt += prix;
    });
    const tva = totalHt * (formData.lignes[0]?.taux_tva || 20) / 100;
    return { ht: totalHt, tva, ttc: totalHt + tva };
  };

  const resetForm = () => {
    setFormData({
      id_commande: '',
      id_client: '',
      date_livraison: new Date().toISOString().split('T')[0],
      statut: 'BROUILLON',
      transporteur: '',
      numero_suivi: '',
      adresse_livraison: '',
      notes: '',
      lignes: []
    });
    setSelectedCommande(null);
  };

  const getStatutColor = (statut: string) => {
    const statutLower = statut?.toLowerCase() || '';
    const colors: { [key: string]: string } = {
      'brouillon': 'bg-gray-100 text-gray-800',
      'prepare': 'bg-yellow-100 text-yellow-800',
      'livree': 'bg-green-100 text-green-800',
      'annule': 'bg-red-100 text-red-800'
    };
    return colors[statutLower] || 'bg-gray-100 text-gray-800';
  };

  const filteredBL = bonsLivraison.filter(bl => {
    if (search && !bl.numero_bl?.toLowerCase().includes(search.toLowerCase()) && 
        !bl.client_nom?.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (filters.statut && bl.statut !== filters.statut.toUpperCase()) {
      return false;
    }
    if (filters.client_id && bl.id_client?.toString() !== filters.client_id) {
      return false;
    }
    return true;
  });

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
              <Truck className="w-8 h-8 text-blue-600" />
              Bons de Livraison
            </h1>
            <p className="text-gray-600 mt-2">Gestion et suivi des livraisons</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setShowForm(true);
                setEditingBL(null);
                resetForm();
              }}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Nouveau BL
            </button>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
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
              value={filters.statut}
              onChange={(e) => setFilters({ ...filters, statut: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous les statuts</option>
              <option value="BROUILLON">Brouillon</option>
              <option value="PREPARE">Préparé</option>
              <option value="LIVREE">Livré</option>
              <option value="ANNULE">Annulé</option>
            </select>
            <select
              value={filters.client_id}
              onChange={(e) => setFilters({ ...filters, client_id: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous les clients</option>
              {clients.map(c => (
                <option key={c.id_client} value={c.id_client}>{c.raison_sociale || c.nom}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Formulaire */}
        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-bold mb-4">
              {editingBL ? 'Modifier le Bon de Livraison' : 'Nouveau Bon de Livraison'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Commande</label>
                  <select
                    value={formData.id_commande}
                    onChange={(e) => {
                      const cmd = commandes.find(c => c.id_commande?.toString() === e.target.value);
                      setFormData({ 
                        ...formData, 
                        id_commande: e.target.value,
                        id_client: cmd?.id_client?.toString() || formData.id_client
                      });
                      setSelectedCommande(cmd);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Sélectionner une commande (optionnel)</option>
                    {commandes.filter(c => c.statut === 'validee' || c.statut === 'en_cours').map(c => (
                      <option key={c.id_commande} value={c.id_commande}>
                        {c.numero_commande} - {c.client_nom || c.nom_client}
                      </option>
                    ))}
                  </select>
                  {formData.id_commande && (
                    <button
                      type="button"
                      onClick={() => handleGenerateFromCommande(parseInt(formData.id_commande))}
                      className="mt-2 text-sm text-blue-600 hover:text-blue-700"
                    >
                      Générer depuis cette commande
                    </button>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client *</label>
                  <select
                    value={formData.id_client}
                    onChange={(e) => setFormData({ ...formData, id_client: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Sélectionner un client</option>
                    {clients.map(c => (
                      <option key={c.id_client} value={c.id_client}>{c.raison_sociale || c.nom}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Livraison *</label>
                  <input
                    type="date"
                    value={formData.date_livraison}
                    onChange={(e) => setFormData({ ...formData, date_livraison: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                  <select
                    value={formData.statut}
                    onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="BROUILLON">Brouillon</option>
                    <option value="PREPARE">Préparé</option>
                    <option value="LIVREE">Livré</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Transporteur</label>
                  <input
                    type="text"
                    value={formData.transporteur}
                    onChange={(e) => setFormData({ ...formData, transporteur: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Nom du transporteur"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Numéro de Suivi</label>
                  <input
                    type="text"
                    value={formData.numero_suivi}
                    onChange={(e) => setFormData({ ...formData, numero_suivi: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Numéro de suivi colis"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adresse de Livraison</label>
                  <textarea
                    value={formData.adresse_livraison}
                    onChange={(e) => setFormData({ ...formData, adresse_livraison: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    placeholder="Adresse complète de livraison"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    placeholder="Notes additionnelles..."
                  />
                </div>
              </div>

              {/* Lignes de BL */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Lignes de Livraison</label>
                  <button
                    type="button"
                    onClick={addLigne}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    + Ajouter une ligne
                  </button>
                </div>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Article</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Qté Livrée</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Prix U. HT</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">TVA %</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Total TTC</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.lignes.map((ligne, index) => (
                        <tr key={index} className="border-t">
                          <td className="px-4 py-2">
                            <select
                              value={ligne.id_article || ''}
                              onChange={(e) => {
                                const article = articles.find(a => a.id_article?.toString() === e.target.value);
                                updateLigne(index, 'id_article', e.target.value ? parseInt(e.target.value) : undefined);
                                if (article) {
                                  updateLigne(index, 'designation', article.designation || article.libelle);
                                  updateLigne(index, 'prix_unitaire_ht', article.prix_vente || 0);
                                }
                              }}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            >
                              <option value="">Sélectionner</option>
                              {articles.map(a => (
                                <option key={a.id_article} value={a.id_article}>
                                  {a.designation || a.libelle}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="number"
                              value={ligne.quantite_livree}
                              onChange={(e) => updateLigne(index, 'quantite_livree', parseFloat(e.target.value))}
                              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                              min="0.01"
                              step="0.01"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="number"
                              value={ligne.prix_unitaire_ht || 0}
                              onChange={(e) => updateLigne(index, 'prix_unitaire_ht', parseFloat(e.target.value))}
                              className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                              min="0"
                              step="0.01"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="number"
                              value={ligne.taux_tva || 20}
                              onChange={(e) => updateLigne(index, 'taux_tva', parseFloat(e.target.value))}
                              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                              min="0"
                              max="100"
                              step="0.01"
                            />
                          </td>
                          <td className="px-4 py-2 text-sm">
                            {((ligne.prix_unitaire_ht || 0) * (ligne.quantite_livree || 0) * (1 + (ligne.taux_tva || 20) / 100)).toFixed(2)} TND
                          </td>
                          <td className="px-4 py-2">
                            <button
                              type="button"
                              onClick={() => removeLigne(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 flex justify-end">
                  <div className="text-right">
                    <div className="text-lg font-bold">
                      Total TTC: {calculerTotal().ttc.toFixed(2)} TND
                    </div>
                  </div>
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
                    setEditingBL(null);
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

        {/* Liste */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Numéro BL</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commande</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant TTC</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredBL.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    Aucun bon de livraison trouvé
                  </td>
                </tr>
              ) : (
                filteredBL.map((bl) => (
                  <tr key={bl.id_bl} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{bl.numero_bl}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{bl.numero_commande || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{bl.client_nom}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{bl.date_livraison}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-semibold">{bl.montant_ttc?.toFixed(2)} TND</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatutColor(bl.statut)}`}>
                        {bl.statut}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button 
                          onClick={async () => {
                            try {
                              const result = await bonsLivraisonService.getBonLivraisonById(bl.id_bl);
                              if (result.data?.success) {
                                setSelectedBL(result.data.data);
                              }
                            } catch (error: any) {
                              console.error('Erreur chargement BL:', error);
                              alert(error.response?.data?.error?.message || 'Erreur lors du chargement');
                            }
                          }}
                          className="text-blue-600 hover:text-blue-700"
                          title="Consulter"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-700" title="Télécharger PDF">
                          <Download className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={async () => {
                            try {
                              const result = await bonsLivraisonService.getBonLivraisonById(bl.id_bl);
                              if (result.data?.success) {
                                const blData = result.data.data;
                                setFormData({
                                  id_commande: blData.id_commande?.toString() || '',
                                  id_client: blData.id_client?.toString() || '',
                                  date_livraison: blData.date_livraison || new Date().toISOString().split('T')[0],
                                  statut: blData.statut || 'BROUILLON',
                                  transporteur: blData.transporteur || '',
                                  numero_suivi: blData.numero_suivi || '',
                                  adresse_livraison: blData.adresse_livraison || '',
                                  notes: blData.notes || '',
                                  lignes: (blData.lignes || []).map((l: any) => ({
                                    id_article: l.id_article,
                                    id_ligne_commande: l.id_ligne_commande,
                                    designation: l.designation,
                                    quantite_livree: l.quantite_livree,
                                    prix_unitaire_ht: l.prix_unitaire_ht,
                                    taux_tva: l.taux_tva || 20,
                                    numero_lot: l.numero_lot,
                                    date_peremption: l.date_peremption
                                  }))
                                });
                                setEditingBL(bl);
                                setShowForm(true);
                              }
                            } catch (error: any) {
                              console.error('Erreur chargement BL:', error);
                              alert(error.response?.data?.error?.message || 'Erreur lors du chargement');
                            }
                          }}
                          className="text-gray-600 hover:text-gray-700"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={async () => {
                            if (window.confirm(`Supprimer le bon de livraison ${bl.numero_bl} ?`)) {
                              try {
                                await bonsLivraisonService.deleteBonLivraison(bl.id_bl);
                                loadData();
                                alert('Bon de livraison supprimé avec succès');
                              } catch (error: any) {
                                console.error('Erreur suppression BL:', error);
                                alert(error.response?.data?.error?.message || 'Erreur lors de la suppression');
                              }
                            }
                          }}
                          className="text-red-600 hover:text-red-700"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Modal de consultation */}
        {selectedBL && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">
                  Bon de Livraison {selectedBL.numero_bl}
                </h2>
                <button
                  onClick={() => setSelectedBL(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Informations générales */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Client</label>
                    <p className="text-gray-900">{selectedBL.client_nom}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Date Livraison</label>
                    <p className="text-gray-900">{selectedBL.date_livraison}</p>
                  </div>
                  {selectedBL.numero_commande && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Commande</label>
                      <p className="text-gray-900">{selectedBL.numero_commande}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-500">Statut</label>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatutColor(selectedBL.statut)}`}>
                      {selectedBL.statut}
                    </span>
                  </div>
                  {selectedBL.transporteur && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Transporteur</label>
                      <p className="text-gray-900">{selectedBL.transporteur}</p>
                    </div>
                  )}
                  {selectedBL.numero_suivi && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Numéro de Suivi</label>
                      <p className="text-gray-900">{selectedBL.numero_suivi}</p>
                    </div>
                  )}
                </div>

                {/* Lignes */}
                {selectedBL.lignes && selectedBL.lignes.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Lignes de Livraison</h3>
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Désignation</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Qté</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Prix U. HT</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">TVA %</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Total TTC</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {selectedBL.lignes.map((ligne: any, index: number) => (
                            <tr key={index}>
                              <td className="px-4 py-2">{ligne.designation}</td>
                              <td className="px-4 py-2">{ligne.quantite_livree}</td>
                              <td className="px-4 py-2">{ligne.prix_unitaire_ht?.toFixed(2)} TND</td>
                              <td className="px-4 py-2">{ligne.taux_tva || 20}%</td>
                              <td className="px-4 py-2 font-semibold">
                                {ligne.montant_ttc?.toFixed(2)} TND
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Totaux */}
                <div className="border-t pt-4">
                  <div className="flex justify-end">
                    <div className="w-64 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Montant HT:</span>
                        <span className="font-semibold">{selectedBL.montant_ht?.toFixed(2)} TND</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">TVA:</span>
                        <span className="font-semibold">{selectedBL.montant_tva?.toFixed(2)} TND</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold border-t pt-2">
                        <span>Total TTC:</span>
                        <span>{selectedBL.montant_ttc?.toFixed(2)} TND</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="border-t pt-4 flex gap-2 justify-end">
                  <button
                    onClick={async () => {
                      try {
                        const result = await bonsLivraisonService.getBonLivraisonById(selectedBL.id_bl);
                        if (result.data?.success) {
                          const blData = result.data.data;
                          setFormData({
                            id_commande: blData.id_commande?.toString() || '',
                            id_client: blData.id_client?.toString() || '',
                            date_livraison: blData.date_livraison || new Date().toISOString().split('T')[0],
                            statut: blData.statut || 'BROUILLON',
                            transporteur: blData.transporteur || '',
                            numero_suivi: blData.numero_suivi || '',
                            adresse_livraison: blData.adresse_livraison || '',
                            notes: blData.notes || '',
                            lignes: (blData.lignes || []).map((l: any) => ({
                              id_article: l.id_article,
                              id_ligne_commande: l.id_ligne_commande,
                              designation: l.designation,
                              quantite_livree: l.quantite_livree,
                              prix_unitaire_ht: l.prix_unitaire_ht,
                              taux_tva: l.taux_tva || 20,
                              numero_lot: l.numero_lot,
                              date_peremption: l.date_peremption
                            }))
                          });
                          setEditingBL(selectedBL);
                          setSelectedBL(null);
                          setShowForm(true);
                        }
                      } catch (error: any) {
                        console.error('Erreur chargement BL:', error);
                        alert(error.response?.data?.error?.message || 'Erreur lors du chargement');
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Edit className="w-4 h-4 inline mr-2" />
                    Modifier
                  </button>
                  <button
                    onClick={() => setSelectedBL(null)}
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
  );
};

export default BonLivraison;
