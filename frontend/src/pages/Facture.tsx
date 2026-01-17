import React, { useEffect, useState } from 'react';
import { Receipt, Plus, Edit, Trash2, Search, Download, Eye, Send, X, CheckCircle, FileText } from 'lucide-react';
import { facturesService, clientsService, commandesService, bonsLivraisonService } from '../services/api';

interface LigneFacture {
  id_article?: number;
  id_ligne_commande?: number;
  id_ligne_bl?: number;
  designation?: string;
  quantite: number;
  prix_unitaire_ht: number;
  taux_tva?: number;
  remise?: number;
}

const Facture: React.FC = () => {
  const [factures, setFactures] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [commandes, setCommandes] = useState<any[]>([]);
  const [bonsLivraison, setBonsLivraison] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingFacture, setEditingFacture] = useState<any>(null);
  const [selectedFacture, setSelectedFacture] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ statut: '', client_id: '' });

  const [formData, setFormData] = useState({
    id_commande: '',
    id_bl: '',
    id_client: '',
    date_facture: new Date().toISOString().split('T')[0],
    date_echeance: '',
    statut: 'BROUILLON',
    taux_tva: 20,
    remise_globale: 0,
    reference_client: '',
    conditions_paiement: '',
    notes: '',
    lignes: [] as LigneFacture[]
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

      const [facturesRes, clientsRes, cmdRes, blRes] = await Promise.all([
        facturesService.getFactures(params).catch(() => ({ data: { data: [], success: false } })),
        clientsService.getClients().catch(() => ({ data: { data: [] } })),
        commandesService.getCommandes().catch(() => ({ data: { data: [] } })),
        bonsLivraisonService.getBonsLivraison().catch(() => ({ data: { data: [], success: false } }))
      ]);
      
      if (facturesRes.data?.success) {
        setFactures(facturesRes.data.data || []);
      } else {
        setFactures([]);
      }
      
      setClients(clientsRes.data?.data || []);
      setCommandes(cmdRes.data?.data || []);
      if (blRes.data?.success) {
        setBonsLivraison(blRes.data.data || []);
      }
    } catch (error) {
      console.error('Erreur chargement factures:', error);
      setFactures([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.lignes.length === 0) {
      alert('Ajoutez au moins une ligne de facture');
      return;
    }
    if (!formData.id_client || !formData.date_facture) {
      alert('Client et date de facture requis');
      return;
    }
    try {
      if (editingFacture) {
        await facturesService.updateFacture(editingFacture.id_facture, formData);
      } else {
        await facturesService.createFacture(formData);
      }
      setShowForm(false);
      setEditingFacture(null);
      resetForm();
      loadData();
      alert(editingFacture ? 'Facture modifiée avec succès' : 'Facture créée avec succès');
    } catch (error: any) {
      console.error('Erreur sauvegarde facture:', error);
      alert(error.response?.data?.error?.message || 'Erreur lors de la sauvegarde');
    }
  };

  const handleGenerateFromCommande = async (commandeId: number) => {
    try {
      const result = await facturesService.createFromCommande(commandeId, {
        date_facture: new Date().toISOString().split('T')[0],
        statut: 'BROUILLON'
      });
      if (result.data?.success) {
        alert('Facture générée avec succès depuis la commande');
        loadData();
      }
    } catch (error: any) {
      console.error('Erreur génération facture:', error);
      alert(error.response?.data?.error?.message || 'Erreur lors de la génération');
    }
  };

  const handleGenerateFromBL = async (blId: number) => {
    try {
      const result = await facturesService.createFromBL(blId, {
        date_facture: new Date().toISOString().split('T')[0],
        statut: 'BROUILLON'
      });
      if (result.data?.success) {
        alert('Facture générée avec succès depuis le bon de livraison');
        loadData();
      }
    } catch (error: any) {
      console.error('Erreur génération facture:', error);
      alert(error.response?.data?.error?.message || 'Erreur lors de la génération');
    }
  };

  const addLigne = () => {
    setFormData({
      ...formData,
      lignes: [...formData.lignes, { quantite: 1, prix_unitaire_ht: 0, taux_tva: formData.taux_tva || 20, remise: 0 }]
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
      const prix = (ligne.prix_unitaire_ht || 0) * (ligne.quantite || 0);
      const remise = prix * (ligne.remise || 0) / 100;
      const ht = prix - remise;
      totalHt += ht;
    });
    const remiseGlobale = totalHt * (formData.remise_globale || 0) / 100;
    const htFinal = totalHt - remiseGlobale;
    const tva = htFinal * (formData.taux_tva || 20) / 100;
    return { ht: totalHt, remise: remiseGlobale, htFinal, tva, ttc: htFinal + tva };
  };

  const resetForm = () => {
    setFormData({
      id_commande: '',
      id_bl: '',
      id_client: '',
      date_facture: new Date().toISOString().split('T')[0],
      date_echeance: '',
      statut: 'BROUILLON',
      taux_tva: 20,
      remise_globale: 0,
      reference_client: '',
      conditions_paiement: '',
      notes: '',
      lignes: []
    });
  };

  const getStatutColor = (statut: string) => {
    const statutLower = statut?.toLowerCase() || '';
    const colors: { [key: string]: string } = {
      'brouillon': 'bg-gray-100 text-gray-800',
      'en_attente': 'bg-yellow-100 text-yellow-800',
      'payee': 'bg-green-100 text-green-800',
      'payée': 'bg-green-100 text-green-800',
      'reglee': 'bg-green-100 text-green-800',
      'partiellement_payee': 'bg-blue-100 text-blue-800',
      'partiellement_payée': 'bg-blue-100 text-blue-800',
      'impayee': 'bg-red-100 text-red-800',
      'impayée': 'bg-red-100 text-red-800',
      'annulee': 'bg-orange-100 text-orange-800',
      'annulée': 'bg-orange-100 text-orange-800'
    };
    return colors[statutLower] || 'bg-gray-100 text-gray-800';
  };

  const filteredFactures = factures.filter(f => {
    if (search && !f.numero_facture?.toLowerCase().includes(search.toLowerCase()) && 
        !f.client_nom?.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (filters.statut && f.statut !== filters.statut.toUpperCase()) {
      return false;
    }
    if (filters.client_id && f.id_client?.toString() !== filters.client_id) {
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
              <Receipt className="w-8 h-8 text-blue-600" />
              Factures
            </h1>
            <p className="text-gray-600 mt-2">Gestion et suivi des factures clients</p>
          </div>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingFacture(null);
              resetForm();
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nouvelle Facture
          </button>
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
              <option value="EN_ATTENTE">En attente</option>
              <option value="REGLEE">Réglée</option>
              <option value="PARTIELLEMENT_REGLEE">Partiellement réglée</option>
              <option value="IMPAYEE">Impayée</option>
              <option value="ANNULEE">Annulée</option>
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
              {editingFacture ? 'Modifier la Facture' : 'Nouvelle Facture'}
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
                      if (e.target.value) {
                        handleGenerateFromCommande(parseInt(e.target.value));
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Sélectionner une commande (optionnel)</option>
                    {commandes.filter(c => c.statut === 'validee' || c.statut === 'livree').map(c => (
                      <option key={c.id_commande} value={c.id_commande}>
                        {c.numero_commande} - {c.client_nom || c.nom_client}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bon de Livraison</label>
                  <select
                    value={formData.id_bl}
                    onChange={(e) => {
                      const bl = bonsLivraison.find(b => b.id_bl?.toString() === e.target.value);
                      setFormData({ 
                        ...formData, 
                        id_bl: e.target.value,
                        id_client: bl?.id_client?.toString() || formData.id_client,
                        id_commande: bl?.id_commande?.toString() || formData.id_commande
                      });
                      if (e.target.value) {
                        handleGenerateFromBL(parseInt(e.target.value));
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Sélectionner un BL (optionnel)</option>
                    {bonsLivraison.filter(b => b.statut === 'LIVREE').map(b => (
                      <option key={b.id_bl} value={b.id_bl}>
                        {b.numero_bl} - {b.client_nom}
                      </option>
                    ))}
                  </select>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Facture *</label>
                  <input
                    type="date"
                    value={formData.date_facture}
                    onChange={(e) => {
                      const date = e.target.value;
                      const dateEcheance = new Date(date);
                      dateEcheance.setDate(dateEcheance.getDate() + 30);
                      setFormData({ 
                        ...formData, 
                        date_facture: date,
                        date_echeance: dateEcheance.toISOString().split('T')[0]
                      });
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Échéance</label>
                  <input
                    type="date"
                    value={formData.date_echeance}
                    onChange={(e) => setFormData({ ...formData, date_echeance: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                    <option value="EN_ATTENTE">En attente</option>
                    <option value="REGLEE">Réglée</option>
                    <option value="PARTIELLEMENT_REGLEE">Partiellement réglée</option>
                    <option value="IMPAYEE">Impayée</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Taux TVA (%)</label>
                  <input
                    type="number"
                    value={formData.taux_tva}
                    onChange={(e) => setFormData({ ...formData, taux_tva: parseFloat(e.target.value) || 20 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="0"
                    max="100"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Remise Globale (%)</label>
                  <input
                    type="number"
                    value={formData.remise_globale}
                    onChange={(e) => setFormData({ ...formData, remise_globale: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="0"
                    max="100"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Référence Client</label>
                  <input
                    type="text"
                    value={formData.reference_client}
                    onChange={(e) => setFormData({ ...formData, reference_client: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Réf. commande client"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Conditions de Paiement</label>
                  <input
                    type="text"
                    value={formData.conditions_paiement}
                    onChange={(e) => setFormData({ ...formData, conditions_paiement: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: 30 jours"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Notes additionnelles..."
                  />
                </div>
              </div>

              {/* Lignes de facture */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Lignes de Facture</label>
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
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Désignation</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Qté</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Prix U. HT</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Remise %</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">TVA %</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Total TTC</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.lignes.map((ligne, index) => (
                        <tr key={index} className="border-t">
                          <td className="px-4 py-2">
                            <input
                              type="text"
                              value={ligne.designation || ''}
                              onChange={(e) => updateLigne(index, 'designation', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              placeholder="Désignation"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="number"
                              value={ligne.quantite}
                              onChange={(e) => updateLigne(index, 'quantite', parseFloat(e.target.value))}
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
                              value={ligne.remise || 0}
                              onChange={(e) => updateLigne(index, 'remise', parseFloat(e.target.value))}
                              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                              min="0"
                              max="100"
                              step="0.01"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="number"
                              value={ligne.taux_tva || formData.taux_tva || 20}
                              onChange={(e) => updateLigne(index, 'taux_tva', parseFloat(e.target.value))}
                              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                              min="0"
                              max="100"
                              step="0.01"
                            />
                          </td>
                          <td className="px-4 py-2 text-sm">
                            {((ligne.prix_unitaire_ht || 0) * (ligne.quantite || 0) * (1 - (ligne.remise || 0) / 100) * (1 + (ligne.taux_tva || formData.taux_tva || 20) / 100)).toFixed(2)} TND
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
                  <div className="text-right space-y-1">
                    <div className="text-sm text-gray-600">
                      HT: {calculerTotal().htFinal.toFixed(2)} TND
                    </div>
                    {formData.remise_globale > 0 && (
                      <div className="text-sm text-red-600">
                        Remise: -{calculerTotal().remise.toFixed(2)} TND
                      </div>
                    )}
                    <div className="text-sm text-gray-600">
                      TVA: {calculerTotal().tva.toFixed(2)} TND
                    </div>
                    <div className="text-lg font-bold border-t pt-1">
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
                    setEditingFacture(null);
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Numéro</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Échéance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant TTC</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Restant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredFactures.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    Aucune facture trouvée
                  </td>
                </tr>
              ) : (
                filteredFactures.map((facture) => (
                  <tr key={facture.id_facture} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{facture.numero_facture}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{facture.client_nom}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{facture.date_facture}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{facture.date_echeance || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-semibold">{facture.montant_ttc?.toFixed(2)} TND</td>
                    <td className="px-6 py-4 whitespace-nowrap text-red-600 font-semibold">
                      {facture.montant_restant?.toFixed(2)} TND
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatutColor(facture.statut)}`}>
                        {facture.statut}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button 
                          onClick={async () => {
                            try {
                              const result = await facturesService.getFactureById(facture.id_facture);
                              if (result.data?.success) {
                                setSelectedFacture(result.data.data);
                              }
                            } catch (error: any) {
                              console.error('Erreur chargement facture:', error);
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
                              const result = await facturesService.getFactureById(facture.id_facture);
                              if (result.data?.success) {
                                const facData = result.data.data;
                                setFormData({
                                  id_commande: facData.id_commande?.toString() || '',
                                  id_bl: facData.id_bl?.toString() || '',
                                  id_client: facData.id_client?.toString() || '',
                                  date_facture: facData.date_facture || new Date().toISOString().split('T')[0],
                                  date_echeance: facData.date_echeance || '',
                                  statut: facData.statut || 'BROUILLON',
                                  taux_tva: facData.taux_tva || 20,
                                  remise_globale: facData.remise_globale || 0,
                                  reference_client: facData.reference_client || '',
                                  conditions_paiement: facData.conditions_paiement || '',
                                  notes: facData.notes || '',
                                  lignes: (facData.lignes || []).map((l: any) => ({
                                    id_article: l.id_article,
                                    id_ligne_commande: l.id_ligne_commande,
                                    id_ligne_bl: l.id_ligne_bl,
                                    designation: l.designation,
                                    quantite: l.quantite,
                                    prix_unitaire_ht: l.prix_unitaire_ht,
                                    taux_tva: l.taux_tva || 20,
                                    remise: l.remise || 0
                                  }))
                                });
                                setEditingFacture(facture);
                                setShowForm(true);
                              }
                            } catch (error: any) {
                              console.error('Erreur chargement facture:', error);
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
                            if (window.confirm(`Supprimer la facture ${facture.numero_facture} ?`)) {
                              try {
                                await facturesService.deleteFacture(facture.id_facture);
                                loadData();
                                alert('Facture supprimée avec succès');
                              } catch (error: any) {
                                console.error('Erreur suppression facture:', error);
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
        {selectedFacture && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">
                  Facture {selectedFacture.numero_facture}
                </h2>
                <button
                  onClick={() => setSelectedFacture(null)}
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
                    <p className="text-gray-900">{selectedFacture.client_nom}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Date Facture</label>
                    <p className="text-gray-900">{selectedFacture.date_facture}</p>
                  </div>
                  {selectedFacture.date_echeance && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Date Échéance</label>
                      <p className="text-gray-900">{selectedFacture.date_echeance}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-500">Statut</label>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatutColor(selectedFacture.statut)}`}>
                      {selectedFacture.statut}
                    </span>
                  </div>
                  {selectedFacture.numero_commande && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Commande</label>
                      <p className="text-gray-900">{selectedFacture.numero_commande}</p>
                    </div>
                  )}
                  {selectedFacture.numero_bl && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Bon de Livraison</label>
                      <p className="text-gray-900">{selectedFacture.numero_bl}</p>
                    </div>
                  )}
                </div>

                {/* Lignes */}
                {selectedFacture.lignes && selectedFacture.lignes.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Lignes de Facture</h3>
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Désignation</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Qté</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Prix U. HT</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Remise %</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">TVA %</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Total TTC</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {selectedFacture.lignes.map((ligne: any, index: number) => (
                            <tr key={index}>
                              <td className="px-4 py-2">{ligne.designation}</td>
                              <td className="px-4 py-2">{ligne.quantite}</td>
                              <td className="px-4 py-2">{ligne.prix_unitaire_ht?.toFixed(2)} TND</td>
                              <td className="px-4 py-2">{ligne.remise || 0}%</td>
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
                        <span className="font-semibold">{selectedFacture.montant_ht?.toFixed(2)} TND</span>
                      </div>
                      {selectedFacture.remise_globale > 0 && (
                        <div className="flex justify-between text-red-600">
                          <span>Remise globale ({selectedFacture.remise_globale}%):</span>
                          <span>-{selectedFacture.montant_remise?.toFixed(2)} TND</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">TVA ({selectedFacture.taux_tva || 20}%):</span>
                        <span className="font-semibold">{selectedFacture.montant_tva?.toFixed(2)} TND</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold border-t pt-2">
                        <span>Total TTC:</span>
                        <span>{selectedFacture.montant_ttc?.toFixed(2)} TND</span>
                      </div>
                      {selectedFacture.montant_regle > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Montant Réglé:</span>
                          <span>{selectedFacture.montant_regle?.toFixed(2)} TND</span>
                        </div>
                      )}
                      {selectedFacture.montant_restant > 0 && (
                        <div className="flex justify-between text-red-600 font-semibold">
                          <span>Montant Restant:</span>
                          <span>{selectedFacture.montant_restant?.toFixed(2)} TND</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="border-t pt-4 flex gap-2 justify-end">
                  <button
                    onClick={async () => {
                      try {
                        const result = await facturesService.getFactureById(selectedFacture.id_facture);
                        if (result.data?.success) {
                          const facData = result.data.data;
                          setFormData({
                            id_commande: facData.id_commande?.toString() || '',
                            id_bl: facData.id_bl?.toString() || '',
                            id_client: facData.id_client?.toString() || '',
                            date_facture: facData.date_facture || new Date().toISOString().split('T')[0],
                            date_echeance: facData.date_echeance || '',
                            statut: facData.statut || 'BROUILLON',
                            taux_tva: facData.taux_tva || 20,
                            remise_globale: facData.remise_globale || 0,
                            reference_client: facData.reference_client || '',
                            conditions_paiement: facData.conditions_paiement || '',
                            notes: facData.notes || '',
                            lignes: (facData.lignes || []).map((l: any) => ({
                              id_article: l.id_article,
                              id_ligne_commande: l.id_ligne_commande,
                              id_ligne_bl: l.id_ligne_bl,
                              designation: l.designation,
                              quantite: l.quantite,
                              prix_unitaire_ht: l.prix_unitaire_ht,
                              taux_tva: l.taux_tva || 20,
                              remise: l.remise || 0
                            }))
                          });
                          setEditingFacture(selectedFacture);
                          setSelectedFacture(null);
                          setShowForm(true);
                        }
                      } catch (error: any) {
                        console.error('Erreur chargement facture:', error);
                        alert(error.response?.data?.error?.message || 'Erreur lors du chargement');
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Edit className="w-4 h-4 inline mr-2" />
                    Modifier
                  </button>
                  <button
                    onClick={() => setSelectedFacture(null)}
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

export default Facture;
