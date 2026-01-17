import React, { useEffect, useState } from 'react';
import { RotateCcw, Plus, Edit, Trash2, Search, Download, Eye, X, Package } from 'lucide-react';
import { bonsRetourService, bonsLivraisonService, clientsService } from '../services/api';

interface LigneRetour {
  id_article?: number;
  id_ligne_bl?: number;
  designation?: string;
  quantite_retournee: number;
  prix_unitaire_ht: number;
  taux_tva?: number;
  motif_retour?: string;
}

const BonRetour: React.FC = () => {
  const [bonsRetour, setBonsRetour] = useState<any[]>([]);
  const [bonsLivraison, setBonsLivraison] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBR, setEditingBR] = useState<any>(null);
  const [selectedBR, setSelectedBR] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ statut: '', client_id: '' });

  const [formData, setFormData] = useState({
    id_bl: '',
    id_client: '',
    date_retour: new Date().toISOString().split('T')[0],
    statut: 'BROUILLON',
    motif_retour: '',
    reference_client: '',
    notes: '',
    lignes: [] as LigneRetour[]
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

      const [brRes, blRes, clientsRes] = await Promise.all([
        bonsRetourService.getBonsRetour(params).catch(() => ({ data: { data: [], success: false } })),
        bonsLivraisonService.getBonsLivraison().catch(() => ({ data: { data: [], success: false } })),
        clientsService.getClients().catch(() => ({ data: { data: [] } }))
      ]);

      if (brRes.data?.success) {
        setBonsRetour(brRes.data.data || []);
      } else {
        setBonsRetour([]);
      }
      
      if (blRes.data?.success) {
        setBonsLivraison(blRes.data.data || []);
      }
      setClients(clientsRes.data?.data || []);
    } catch (error) {
      console.error('Erreur chargement BR:', error);
      setBonsRetour([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.lignes.length === 0) {
      alert('Ajoutez au moins une ligne de retour');
      return;
    }
    if (!formData.id_client || !formData.date_retour) {
      alert('Client et date de retour requis');
      return;
    }
    try {
      if (editingBR) {
        await bonsRetourService.updateBonRetour(editingBR.id_retour, formData);
      } else {
        await bonsRetourService.createBonRetour(formData);
      }
      setShowForm(false);
      setEditingBR(null);
      resetForm();
      loadData();
      alert(editingBR ? 'Bon de retour modifié avec succès' : 'Bon de retour créé avec succès');
    } catch (error: any) {
      console.error('Erreur sauvegarde BR:', error);
      alert(error.response?.data?.error?.message || 'Erreur lors de la sauvegarde');
    }
  };

  const handleGenerateFromBL = async (blId: number) => {
    try {
      const result = await bonsRetourService.createFromBL(blId, {
        date_retour: new Date().toISOString().split('T')[0],
        statut: 'BROUILLON'
      });
      if (result.data?.success) {
        alert('Bon de retour généré avec succès depuis le bon de livraison');
        loadData();
      }
    } catch (error: any) {
      console.error('Erreur génération BR:', error);
      alert(error.response?.data?.error?.message || 'Erreur lors de la génération');
    }
  };

  const addLigne = () => {
    setFormData({
      ...formData,
      lignes: [...formData.lignes, { quantite_retournee: 1, prix_unitaire_ht: 0, taux_tva: 20 }]
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
      const prix = (ligne.prix_unitaire_ht || 0) * (ligne.quantite_retournee || 0);
      totalHt += prix;
    });
    const tva = totalHt * (formData.lignes[0]?.taux_tva || 20) / 100;
    return { ht: totalHt, tva, ttc: totalHt + tva };
  };

  const resetForm = () => {
    setFormData({
      id_bl: '',
      id_client: '',
      date_retour: new Date().toISOString().split('T')[0],
      statut: 'BROUILLON',
      motif_retour: '',
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
      'traite': 'bg-green-100 text-green-800',
      'traité': 'bg-green-100 text-green-800',
      'refuse': 'bg-red-100 text-red-800',
      'refusé': 'bg-red-100 text-red-800'
    };
    return colors[statutLower] || 'bg-gray-100 text-gray-800';
  };

  const filteredBR = bonsRetour.filter(br => {
    if (search && !br.numero_retour?.toLowerCase().includes(search.toLowerCase()) && 
        !br.client_nom?.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (filters.statut && br.statut !== filters.statut.toUpperCase()) {
      return false;
    }
    if (filters.client_id && br.id_client?.toString() !== filters.client_id) {
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
              <RotateCcw className="w-8 h-8 text-blue-600" />
              Bons de Retour
            </h1>
            <p className="text-gray-600 mt-2">Gestion des retours clients</p>
          </div>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingBR(null);
              resetForm();
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nouveau Bon de Retour
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
              <option value="TRAITE">Traité</option>
              <option value="REFUSE">Refusé</option>
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
              {editingBR ? 'Modifier le Bon de Retour' : 'Nouveau Bon de Retour'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bon de Livraison</label>
                  <select
                    value={formData.id_bl}
                    onChange={(e) => {
                      const bl = bonsLivraison.find(b => b.id_bl?.toString() === e.target.value);
                      setFormData({ 
                        ...formData, 
                        id_bl: e.target.value,
                        id_client: bl?.id_client?.toString() || formData.id_client
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Retour *</label>
                  <input
                    type="date"
                    value={formData.date_retour}
                    onChange={(e) => setFormData({ ...formData, date_retour: e.target.value })}
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
                    <option value="TRAITE">Traité</option>
                    <option value="REFUSE">Refusé</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Motif Retour *</label>
                  <input
                    type="text"
                    value={formData.motif_retour}
                    onChange={(e) => setFormData({ ...formData, motif_retour: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Défaut qualité, Non conforme..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Référence Client</label>
                  <input
                    type="text"
                    value={formData.reference_client}
                    onChange={(e) => setFormData({ ...formData, reference_client: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Réf. retour client"
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

              {/* Lignes de retour */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Lignes de Retour</label>
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
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Qté Retournée</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Prix U. HT</th>
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
                              value={ligne.quantite_retournee}
                              onChange={(e) => updateLigne(index, 'quantite_retournee', parseFloat(e.target.value))}
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
                          <td className="px-4 py-2">
                            <input
                              type="text"
                              value={ligne.motif_retour || ''}
                              onChange={(e) => updateLigne(index, 'motif_retour', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              placeholder="Motif retour"
                            />
                          </td>
                          <td className="px-4 py-2 text-sm">
                            {((ligne.prix_unitaire_ht || 0) * (ligne.quantite_retournee || 0) * (1 + (ligne.taux_tva || 20) / 100)).toFixed(2)} TND
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
                    setEditingBR(null);
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Numéro BR</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">BL</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Motif</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredBR.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    Aucun bon de retour trouvé
                  </td>
                </tr>
              ) : (
                filteredBR.map((br) => (
                  <tr key={br.id_retour} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{br.numero_retour}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{br.numero_bl || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{br.client_nom}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{br.date_retour}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{br.motif_retour || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatutColor(br.statut)}`}>
                        {br.statut}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button 
                          onClick={async () => {
                            try {
                              const result = await bonsRetourService.getBonRetourById(br.id_retour);
                              if (result.data?.success) {
                                setSelectedBR(result.data.data);
                              }
                            } catch (error: any) {
                              console.error('Erreur chargement BR:', error);
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
                              const result = await bonsRetourService.getBonRetourById(br.id_retour);
                              if (result.data?.success) {
                                const brData = result.data.data;
                                setFormData({
                                  id_bl: brData.id_bl?.toString() || '',
                                  id_client: brData.id_client?.toString() || '',
                                  date_retour: brData.date_retour || new Date().toISOString().split('T')[0],
                                  statut: brData.statut || 'BROUILLON',
                                  motif_retour: brData.motif_retour || '',
                                  reference_client: brData.reference_client || '',
                                  notes: brData.notes || '',
                                  lignes: (brData.lignes || []).map((l: any) => ({
                                    id_article: l.id_article,
                                    id_ligne_bl: l.id_ligne_bl,
                                    designation: l.designation,
                                    quantite_retournee: l.quantite_retournee,
                                    prix_unitaire_ht: l.prix_unitaire_ht,
                                    taux_tva: l.taux_tva || 20,
                                    motif_retour: l.motif_retour
                                  }))
                                });
                                setEditingBR(br);
                                setShowForm(true);
                              }
                            } catch (error: any) {
                              console.error('Erreur chargement BR:', error);
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
                            if (window.confirm(`Supprimer le bon de retour ${br.numero_retour} ?`)) {
                              try {
                                await bonsRetourService.deleteBonRetour(br.id_retour);
                                loadData();
                                alert('Bon de retour supprimé avec succès');
                              } catch (error: any) {
                                console.error('Erreur suppression BR:', error);
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
        {selectedBR && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">
                  Bon de Retour {selectedBR.numero_retour}
                </h2>
                <button
                  onClick={() => setSelectedBR(null)}
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
                    <p className="text-gray-900">{selectedBR.client_nom}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Date Retour</label>
                    <p className="text-gray-900">{selectedBR.date_retour}</p>
                  </div>
                  {selectedBR.numero_bl && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Bon de Livraison</label>
                      <p className="text-gray-900">{selectedBR.numero_bl}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-500">Statut</label>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatutColor(selectedBR.statut)}`}>
                      {selectedBR.statut}
                    </span>
                  </div>
                  {selectedBR.motif_retour && (
                    <div className="col-span-2">
                      <label className="text-sm font-medium text-gray-500">Motif Retour</label>
                      <p className="text-gray-900">{selectedBR.motif_retour}</p>
                    </div>
                  )}
                </div>

                {/* Lignes */}
                {selectedBR.lignes && selectedBR.lignes.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Lignes de Retour</h3>
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Désignation</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Qté Retournée</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Prix U. HT</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">TVA %</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Motif</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Total TTC</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {selectedBR.lignes.map((ligne: any, index: number) => (
                            <tr key={index}>
                              <td className="px-4 py-2">{ligne.designation}</td>
                              <td className="px-4 py-2">{ligne.quantite_retournee}</td>
                              <td className="px-4 py-2">{ligne.prix_unitaire_ht?.toFixed(2)} TND</td>
                              <td className="px-4 py-2">{ligne.taux_tva || 20}%</td>
                              <td className="px-4 py-2">{ligne.motif_retour || '-'}</td>
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
                        <span className="font-semibold">{selectedBR.montant_ht?.toFixed(2)} TND</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">TVA:</span>
                        <span className="font-semibold">{selectedBR.montant_tva?.toFixed(2)} TND</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold border-t pt-2">
                        <span>Total TTC:</span>
                        <span>{selectedBR.montant_ttc?.toFixed(2)} TND</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="border-t pt-4 flex gap-2 justify-end">
                  <button
                    onClick={async () => {
                      try {
                        const result = await bonsRetourService.getBonRetourById(selectedBR.id_retour);
                        if (result.data?.success) {
                          const brData = result.data.data;
                          setFormData({
                            id_bl: brData.id_bl?.toString() || '',
                            id_client: brData.id_client?.toString() || '',
                            date_retour: brData.date_retour || new Date().toISOString().split('T')[0],
                            statut: brData.statut || 'BROUILLON',
                            motif_retour: brData.motif_retour || '',
                            reference_client: brData.reference_client || '',
                            notes: brData.notes || '',
                            lignes: (brData.lignes || []).map((l: any) => ({
                              id_article: l.id_article,
                              id_ligne_bl: l.id_ligne_bl,
                              designation: l.designation,
                              quantite_retournee: l.quantite_retournee,
                              prix_unitaire_ht: l.prix_unitaire_ht,
                              taux_tva: l.taux_tva || 20,
                              motif_retour: l.motif_retour
                            }))
                          });
                          setEditingBR(selectedBR);
                          setSelectedBR(null);
                          setShowForm(true);
                        }
                      } catch (error: any) {
                        console.error('Erreur chargement BR:', error);
                        alert(error.response?.data?.error?.message || 'Erreur lors du chargement');
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Edit className="w-4 h-4 inline mr-2" />
                    Modifier
                  </button>
                  <button
                    onClick={() => setSelectedBR(null)}
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

export default BonRetour;
