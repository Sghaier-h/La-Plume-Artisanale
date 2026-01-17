import React, { useEffect, useState } from 'react';
import { FileText, Plus, Edit, Trash2, Search, Download, Eye } from 'lucide-react';
import { devisService, commandesService, clientsService, articlesService } from '../services/api';

interface LigneDevis {
  id_article?: number;
  designation?: string;
  quantite: number;
  prix_unitaire_ht: number;
  remise?: number;
  taux_tva?: number;
}

const Devis: React.FC = () => {
  const [devis, setDevis] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDevis, setEditingDevis] = useState<any>(null);
  const [selectedDevis, setSelectedDevis] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ statut: '', client_id: '' });

  const [formData, setFormData] = useState({
    id_client: '',
    date_devis: new Date().toISOString().split('T')[0],
    date_validite: '',
    statut: 'BROUILLON',
    taux_tva: 20,
    remise_globale: 0,
    reference_client: '',
    conditions_paiement: '',
    conditions_livraison: '',
    notes: '',
    lignes: [] as LigneDevis[]
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

      const [devisRes, clientsRes, articlesRes] = await Promise.all([
        devisService.getDevis(params).catch(() => ({ data: { data: [], success: false } })),
        clientsService.getClients().catch(() => ({ data: { data: [] } })),
        articlesService.getArticles().catch(() => ({ data: { data: [] } }))
      ]);
      
      if (devisRes.data?.success) {
        setDevis(devisRes.data.data || []);
      } else {
        setDevis([]);
      }
      
      setClients(clientsRes.data?.data || []);
      setArticles(articlesRes.data?.data || []);
    } catch (error) {
      console.error('Erreur chargement devis:', error);
      setDevis([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.lignes.length === 0) {
      alert('Ajoutez au moins une ligne de devis');
      return;
    }
    if (!formData.id_client) {
      alert('Sélectionnez un client');
      return;
    }
    try {
      // Préparer les données pour l'API
      const lignesFormatees = formData.lignes.map(ligne => {
        const article = articles.find(a => a.id_article === ligne.id_article);
        return {
          id_article: ligne.id_article || null,
          designation: ligne.designation || article?.libelle || article?.designation || '',
          quantite: ligne.quantite,
          prix_unitaire_ht: ligne.prix_unitaire_ht,
          remise: ligne.remise || 0,
          taux_tva: ligne.taux_tva || formData.taux_tva || 20
        };
      });

      const dataToSend = {
        id_client: parseInt(formData.id_client),
        date_devis: formData.date_devis,
        date_validite: formData.date_validite || null,
        statut: formData.statut,
        taux_tva: formData.taux_tva,
        remise_globale: formData.remise_globale,
        reference_client: formData.reference_client || null,
        conditions_paiement: formData.conditions_paiement || null,
        conditions_livraison: formData.conditions_livraison || null,
        notes: formData.notes || null,
        lignes: lignesFormatees
      };

      if (editingDevis) {
        await devisService.updateDevis(editingDevis.id_devis, dataToSend);
      } else {
        await devisService.createDevis(dataToSend);
      }

      setShowForm(false);
      setEditingDevis(null);
      setFormData({
        id_client: '',
        date_devis: new Date().toISOString().split('T')[0],
        date_validite: '',
        statut: 'BROUILLON',
        taux_tva: 20,
        remise_globale: 0,
        reference_client: '',
        conditions_paiement: '',
        conditions_livraison: '',
        notes: '',
        lignes: []
      });
      loadData();
    } catch (error: any) {
      console.error('Erreur sauvegarde devis:', error);
      alert(error.response?.data?.error?.message || 'Erreur lors de la sauvegarde du devis');
    }
  };

  const addLigne = () => {
    setFormData({
      ...formData,
      lignes: [...formData.lignes, { id_article: undefined, quantite: 1, prix_unitaire_ht: 0, remise: 0, taux_tva: formData.taux_tva || 20 }]
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
    return htFinal + tva;
  };

  const getStatutColor = (statut: string) => {
    const statutLower = statut?.toLowerCase() || '';
    const colors: { [key: string]: string } = {
      'brouillon': 'bg-gray-100 text-gray-800',
      'envoye': 'bg-blue-100 text-blue-800',
      'envoyé': 'bg-blue-100 text-blue-800',
      'accepte': 'bg-green-100 text-green-800',
      'accepté': 'bg-green-100 text-green-800',
      'refuse': 'bg-red-100 text-red-800',
      'refusé': 'bg-red-100 text-red-800',
      'expire': 'bg-orange-100 text-orange-800',
      'expiré': 'bg-orange-100 text-orange-800',
      'transforme': 'bg-purple-100 text-purple-800',
      'transformé': 'bg-purple-100 text-purple-800'
    };
    return colors[statutLower] || 'bg-gray-100 text-gray-800';
  };

  const filteredDevis = devis.filter(d => {
    if (search && !d.numero_devis?.toLowerCase().includes(search.toLowerCase()) && 
        !d.client_nom?.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (filters.statut && d.statut !== filters.statut.toUpperCase()) {
      return false;
    }
    if (filters.client_id && d.id_client?.toString() !== filters.client_id) {
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
              <FileText className="w-8 h-8 text-blue-600" />
              Gestion des Devis
            </h1>
            <p className="text-gray-600 mt-2">Création et suivi des devis clients</p>
          </div>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingDevis(null);
              setFormData({
                id_client: '',
                date_devis: new Date().toISOString().split('T')[0],
                date_validite: '',
                statut: 'BROUILLON',
                taux_tva: 20,
                remise_globale: 0,
                reference_client: '',
                conditions_paiement: '',
                conditions_livraison: '',
                notes: '',
                lignes: []
              });
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nouveau Devis
          </button>
        </div>

        {/* Filtres et recherche */}
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
              <option value="ENVOYE">Envoyé</option>
              <option value="ACCEPTE">Accepté</option>
              <option value="REFUSE">Refusé</option>
              <option value="EXPIRE">Expiré</option>
              <option value="TRANSFORME">Transformé en commande</option>
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
              {editingDevis ? 'Modifier le Devis' : 'Nouveau Devis'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Devis *</label>
                  <input
                    type="date"
                    value={formData.date_devis}
                    onChange={(e) => setFormData({ ...formData, date_devis: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Validité</label>
                  <input
                    type="date"
                    value={formData.date_validite}
                    onChange={(e) => setFormData({ ...formData, date_validite: e.target.value })}
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
                    <option value="ENVOYE">Envoyé</option>
                    <option value="ACCEPTE">Accepté</option>
                    <option value="REFUSE">Refusé</option>
                  </select>
                </div>
              </div>

              {/* Lignes de devis */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Lignes de Devis</label>
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
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Qté</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Prix U.</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Remise %</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">TVA %</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Total</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.lignes.map((ligne, index) => (
                        <tr key={index} className="border-t">
                          <td className="px-4 py-2">
                            <select
                              value={ligne.id_article}
                              onChange={(e) => updateLigne(index, 'id_article', parseInt(e.target.value))}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            >
                              <option value="0">Sélectionner</option>
                              {articles.map(a => (
                                <option key={a.id_article} value={a.id_article}>{a.designation || a.libelle}</option>
                              ))}
                            </select>
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
                  <div className="text-right">
                    <div className="text-lg font-bold">
                      Total TTC: {calculerTotal().toFixed(2)} TND
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
                    setEditingDevis(null);
                  }}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Liste des devis */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Numéro</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant HT</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredDevis.map((devis) => (
                <tr key={devis.id_devis} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{devis.numero_devis}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{devis.client_nom}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{devis.date_devis}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{devis.montant_ht?.toFixed(2)} TND</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatutColor(devis.statut)}`}>
                      {devis.statut}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          setSelectedDevis(devis);
                        }}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-700">
                        <Download className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={async () => {
                          try {
                            const result = await devisService.getDevisById(devis.id_devis);
                            if (result.data?.success) {
                              const devisData = result.data.data;
                              setFormData({
                                id_client: devisData.id_client?.toString() || '',
                                date_devis: devisData.date_devis || new Date().toISOString().split('T')[0],
                                date_validite: devisData.date_validite || '',
                                statut: devisData.statut || 'BROUILLON',
                                taux_tva: devisData.taux_tva || 20,
                                remise_globale: devisData.remise_globale || 0,
                                reference_client: devisData.reference_client || '',
                                conditions_paiement: devisData.conditions_paiement || '',
                                conditions_livraison: devisData.conditions_livraison || '',
                                notes: devisData.notes || '',
                                lignes: (devisData.lignes || []).map((l: any) => ({
                                  id_article: l.id_article,
                                  designation: l.designation,
                                  quantite: l.quantite,
                                  prix_unitaire_ht: l.prix_unitaire_ht,
                                  remise: l.remise || 0,
                                  taux_tva: l.taux_tva || 20
                                }))
                              });
                              setEditingDevis(devis);
                              setShowForm(true);
                            }
                          } catch (error) {
                            console.error('Erreur chargement devis:', error);
                          }
                        }}
                        className="text-gray-600 hover:text-gray-700"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Devis;
