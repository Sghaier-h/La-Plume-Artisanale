import React, { useEffect, useState } from 'react';
import { ArrowLeft, Plus, Edit, Trash2, Search, Download, Eye, X, FileText } from 'lucide-react';
import { avoirsService, clientsService, facturesService } from '../services/api';

interface LigneAvoir {
  id_article?: number;
  id_ligne_facture?: number;
  designation?: string;
  quantite: number;
  prix_unitaire_ht: number;
  taux_tva?: number;
  remise?: number;
  motif?: string;
}

const Avoir: React.FC = () => {
  const [avoirs, setAvoirs] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [factures, setFactures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAvoir, setEditingAvoir] = useState<any>(null);
  const [selectedAvoir, setSelectedAvoir] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ statut: '', client_id: '' });

  const [formData, setFormData] = useState({
    id_facture: '',
    id_client: '',
    date_avoir: new Date().toISOString().split('T')[0],
    statut: 'BROUILLON',
    taux_tva: 20,
    remise_globale: 0,
    motif_avoir: '',
    reference_client: '',
    notes: '',
    lignes: [] as LigneAvoir[]
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

      const [avoirsRes, clientsRes, facturesRes] = await Promise.all([
        avoirsService.getAvoirs(params).catch(() => ({ data: { data: [], success: false } })),
        clientsService.getClients().catch(() => ({ data: { data: [] } })),
        facturesService.getFactures().catch(() => ({ data: { data: [], success: false } }))
      ]);
      
      if (avoirsRes.data?.success) {
        setAvoirs(avoirsRes.data.data || []);
      } else {
        setAvoirs([]);
      }
      
      setClients(clientsRes.data?.data || []);
      if (facturesRes.data?.success) {
        setFactures(facturesRes.data.data || []);
      }
    } catch (error) {
      console.error('Erreur chargement avoirs:', error);
      setAvoirs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.lignes.length === 0) {
      alert('Ajoutez au moins une ligne d\'avoir');
      return;
    }
    if (!formData.id_client || !formData.date_avoir) {
      alert('Client et date d\'avoir requis');
      return;
    }
    try {
      if (editingAvoir) {
        await avoirsService.updateAvoir(editingAvoir.id_avoir, formData);
      } else {
        await avoirsService.createAvoir(formData);
      }
      setShowForm(false);
      setEditingAvoir(null);
      resetForm();
      loadData();
      alert(editingAvoir ? 'Avoir modifié avec succès' : 'Avoir créé avec succès');
    } catch (error: any) {
      console.error('Erreur sauvegarde avoir:', error);
      alert(error.response?.data?.error?.message || 'Erreur lors de la sauvegarde');
    }
  };

  const handleGenerateFromFacture = async (factureId: number) => {
    try {
      const result = await avoirsService.createFromFacture(factureId, {
        date_avoir: new Date().toISOString().split('T')[0],
        statut: 'BROUILLON'
      });
      if (result.data?.success) {
        alert('Avoir généré avec succès depuis la facture');
        loadData();
      }
    } catch (error: any) {
      console.error('Erreur génération avoir:', error);
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
      id_facture: '',
      id_client: '',
      date_avoir: new Date().toISOString().split('T')[0],
      statut: 'BROUILLON',
      taux_tva: 20,
      remise_globale: 0,
      motif_avoir: '',
      reference_client: '',
      notes: '',
      lignes: []
    });
  };

  const getStatutColor = (statut: string) => {
    const statutLower = statut?.toLowerCase() || '';
    const colors: { [key: string]: string } = {
      'brouillon': 'bg-gray-100 text-gray-800',
      'en_attente': 'bg-yellow-100 text-yellow-800',
      'applique': 'bg-green-100 text-green-800',
      'appliqué': 'bg-green-100 text-green-800',
      'annule': 'bg-red-100 text-red-800',
      'annulé': 'bg-red-100 text-red-800'
    };
    return colors[statutLower] || 'bg-gray-100 text-gray-800';
  };

  const filteredAvoirs = avoirs.filter(a => {
    if (search && !a.numero_avoir?.toLowerCase().includes(search.toLowerCase()) && 
        !a.client_nom?.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (filters.statut && a.statut !== filters.statut.toUpperCase()) {
      return false;
    }
    if (filters.client_id && a.id_client?.toString() !== filters.client_id) {
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
              <ArrowLeft className="w-8 h-8 text-blue-600" />
              Avoirs
            </h1>
            <p className="text-gray-600 mt-2">Gestion des avoirs et crédits clients</p>
          </div>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingAvoir(null);
              resetForm();
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nouvel Avoir
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
              <option value="APPLIQUE">Appliqué</option>
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
              {editingAvoir ? 'Modifier l\'Avoir' : 'Nouvel Avoir'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Facture</label>
                  <select
                    value={formData.id_facture}
                    onChange={(e) => {
                      const fac = factures.find(f => f.id_facture?.toString() === e.target.value);
                      setFormData({ 
                        ...formData, 
                        id_facture: e.target.value,
                        id_client: fac?.id_client?.toString() || formData.id_client
                      });
                      if (e.target.value) {
                        handleGenerateFromFacture(parseInt(e.target.value));
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Sélectionner une facture (optionnel)</option>
                    {factures.filter(f => f.statut === 'REGLEE' || f.statut === 'EN_ATTENTE').map(f => (
                      <option key={f.id_facture} value={f.id_facture}>
                        {f.numero_facture} - {f.client_nom}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Avoir *</label>
                  <input
                    type="date"
                    value={formData.date_avoir}
                    onChange={(e) => setFormData({ ...formData, date_avoir: e.target.value })}
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
                    <option value="EN_ATTENTE">En attente</option>
                    <option value="APPLIQUE">Appliqué</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Motif Avoir *</label>
                  <input
                    type="text"
                    value={formData.motif_avoir}
                    onChange={(e) => setFormData({ ...formData, motif_avoir: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Retour marchandise, Erreur facturation..."
                    required
                  />
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
                    placeholder="Réf. avoir client"
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

              {/* Lignes d'avoir */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Lignes d'Avoir</label>
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
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Motif</th>
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
                          <td className="px-4 py-2">
                            <input
                              type="text"
                              value={ligne.motif || ''}
                              onChange={(e) => updateLigne(index, 'motif', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              placeholder="Motif retour"
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
                    <div className="text-lg font-bold border-t pt-1 text-red-600">
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
                    setEditingAvoir(null);
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Facture</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant TTC</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAvoirs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    Aucun avoir trouvé
                  </td>
                </tr>
              ) : (
                filteredAvoirs.map((avoir) => (
                  <tr key={avoir.id_avoir} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{avoir.numero_avoir}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{avoir.numero_facture || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{avoir.client_nom}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{avoir.date_avoir}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-red-600">{avoir.montant_ttc?.toFixed(2)} TND</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatutColor(avoir.statut)}`}>
                        {avoir.statut}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button 
                          onClick={async () => {
                            try {
                              const result = await avoirsService.getAvoirById(avoir.id_avoir);
                              if (result.data?.success) {
                                setSelectedAvoir(result.data.data);
                              }
                            } catch (error: any) {
                              console.error('Erreur chargement avoir:', error);
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
                              const result = await avoirsService.getAvoirById(avoir.id_avoir);
                              if (result.data?.success) {
                                const avData = result.data.data;
                                setFormData({
                                  id_facture: avData.id_facture?.toString() || '',
                                  id_client: avData.id_client?.toString() || '',
                                  date_avoir: avData.date_avoir || new Date().toISOString().split('T')[0],
                                  statut: avData.statut || 'BROUILLON',
                                  taux_tva: avData.taux_tva || 20,
                                  remise_globale: avData.remise_globale || 0,
                                  motif_avoir: avData.motif_avoir || '',
                                  reference_client: avData.reference_client || '',
                                  notes: avData.notes || '',
                                  lignes: (avData.lignes || []).map((l: any) => ({
                                    id_article: l.id_article,
                                    id_ligne_facture: l.id_ligne_facture,
                                    designation: l.designation,
                                    quantite: l.quantite,
                                    prix_unitaire_ht: l.prix_unitaire_ht,
                                    taux_tva: l.taux_tva || 20,
                                    remise: l.remise || 0,
                                    motif: l.motif
                                  }))
                                });
                                setEditingAvoir(avoir);
                                setShowForm(true);
                              }
                            } catch (error: any) {
                              console.error('Erreur chargement avoir:', error);
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
                            if (window.confirm(`Supprimer l'avoir ${avoir.numero_avoir} ?`)) {
                              try {
                                await avoirsService.deleteAvoir(avoir.id_avoir);
                                loadData();
                                alert('Avoir supprimé avec succès');
                              } catch (error: any) {
                                console.error('Erreur suppression avoir:', error);
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
        {selectedAvoir && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">
                  Avoir {selectedAvoir.numero_avoir}
                </h2>
                <button
                  onClick={() => setSelectedAvoir(null)}
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
                    <p className="text-gray-900">{selectedAvoir.client_nom}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Date Avoir</label>
                    <p className="text-gray-900">{selectedAvoir.date_avoir}</p>
                  </div>
                  {selectedAvoir.numero_facture && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Facture</label>
                      <p className="text-gray-900">{selectedAvoir.numero_facture}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-500">Statut</label>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatutColor(selectedAvoir.statut)}`}>
                      {selectedAvoir.statut}
                    </span>
                  </div>
                  {selectedAvoir.motif_avoir && (
                    <div className="col-span-2">
                      <label className="text-sm font-medium text-gray-500">Motif</label>
                      <p className="text-gray-900">{selectedAvoir.motif_avoir}</p>
                    </div>
                  )}
                </div>

                {/* Lignes */}
                {selectedAvoir.lignes && selectedAvoir.lignes.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Lignes d'Avoir</h3>
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
                          {selectedAvoir.lignes.map((ligne: any, index: number) => (
                            <tr key={index}>
                              <td className="px-4 py-2">{ligne.designation}</td>
                              <td className="px-4 py-2">{ligne.quantite}</td>
                              <td className="px-4 py-2">{ligne.prix_unitaire_ht?.toFixed(2)} TND</td>
                              <td className="px-4 py-2">{ligne.remise || 0}%</td>
                              <td className="px-4 py-2">{ligne.taux_tva || 20}%</td>
                              <td className="px-4 py-2 font-semibold text-red-600">
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
                        <span className="font-semibold">{selectedAvoir.montant_ht?.toFixed(2)} TND</span>
                      </div>
                      {selectedAvoir.remise_globale > 0 && (
                        <div className="flex justify-between text-red-600">
                          <span>Remise globale ({selectedAvoir.remise_globale}%):</span>
                          <span>-{selectedAvoir.montant_remise?.toFixed(2)} TND</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">TVA ({selectedAvoir.taux_tva || 20}%):</span>
                        <span className="font-semibold">{selectedAvoir.montant_tva?.toFixed(2)} TND</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold border-t pt-2 text-red-600">
                        <span>Total TTC:</span>
                        <span>{selectedAvoir.montant_ttc?.toFixed(2)} TND</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="border-t pt-4 flex gap-2 justify-end">
                  <button
                    onClick={async () => {
                      try {
                        const result = await avoirsService.getAvoirById(selectedAvoir.id_avoir);
                        if (result.data?.success) {
                          const avData = result.data.data;
                          setFormData({
                            id_facture: avData.id_facture?.toString() || '',
                            id_client: avData.id_client?.toString() || '',
                            date_avoir: avData.date_avoir || new Date().toISOString().split('T')[0],
                            statut: avData.statut || 'BROUILLON',
                            taux_tva: avData.taux_tva || 20,
                            remise_globale: avData.remise_globale || 0,
                            motif_avoir: avData.motif_avoir || '',
                            reference_client: avData.reference_client || '',
                            notes: avData.notes || '',
                            lignes: (avData.lignes || []).map((l: any) => ({
                              id_article: l.id_article,
                              id_ligne_facture: l.id_ligne_facture,
                              designation: l.designation,
                              quantite: l.quantite,
                              prix_unitaire_ht: l.prix_unitaire_ht,
                              taux_tva: l.taux_tva || 20,
                              remise: l.remise || 0,
                              motif: l.motif
                            }))
                          });
                          setEditingAvoir(selectedAvoir);
                          setSelectedAvoir(null);
                          setShowForm(true);
                        }
                      } catch (error: any) {
                        console.error('Erreur chargement avoir:', error);
                        alert(error.response?.data?.error?.message || 'Erreur lors du chargement');
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Edit className="w-4 h-4 inline mr-2" />
                    Modifier
                  </button>
                  <button
                    onClick={() => setSelectedAvoir(null)}
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

export default Avoir;
