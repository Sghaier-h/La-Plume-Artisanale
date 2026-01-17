import React, { useEffect, useState } from 'react';
import { commandesService, clientsService, articlesService } from '../services/api';
import { ShoppingCart, Plus, Edit, Trash2, Search, Eye, X, CheckCircle, Package, Calendar, User, DollarSign } from 'lucide-react';

const Commandes: React.FC = () => {
  const [commandes, setCommandes] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCommande, setEditingCommande] = useState<any>(null);
  const [selectedCommande, setSelectedCommande] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ statut: '', client_id: '' });

  const [formData, setFormData] = useState({
    id_client: '',
    date_commande: new Date().toISOString().split('T')[0],
    date_livraison_prevue: '',
    priorite: 'normale',
    devise: 'TND',
    conditions_paiement: '',
    lignes: [] as any[]
  });

  useEffect(() => {
    loadData();
  }, [filters, search]);

  const loadData = async () => {
    try {
      const [cmdRes, clientsRes, articlesRes] = await Promise.all([
        commandesService.getCommandes({ ...filters, search }),
        clientsService.getClients(),
        articlesService.getArticles()
      ]);
      setCommandes(cmdRes.data.data);
      setClients(clientsRes.data.data);
      setArticles(articlesRes.data.data);
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
      lignes: [...formData.lignes, { id_article: '', quantite_commandee: '', prix_unitaire: '', remise: '0', date_livraison_prevue: '' }]
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
      } catch (error) {
        alert('Erreur lors de la validation');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      id_client: '',
      date_commande: new Date().toISOString().split('T')[0],
      date_livraison_prevue: '',
      priorite: 'normale',
      devise: 'TND',
      conditions_paiement: '',
      lignes: []
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
          <h1 className="text-3xl font-bold text-gray-800">🛒 Commandes</h1>
          <button
            onClick={() => { setShowForm(true); setEditingCommande(null); resetForm(); }}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            + Nouvelle Commande
          </button>
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
          </div>
        </div>

        {/* Formulaire */}
        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-bold mb-4">{editingCommande ? 'Modifier' : 'Nouvelle'} Commande</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Client *</label>
                  <select
                    required
                    value={formData.id_client}
                    onChange={(e) => setFormData({ ...formData, id_client: e.target.value })}
                    className="w-full px-4 py-2 border rounded"
                  >
                    <option value="">Sélectionner...</option>
                    {clients.filter(c => c.actif).map((client) => (
                      <option key={client.id_client} value={client.id_client}>{client.raison_sociale}</option>
                    ))}
                  </select>
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
                  <button type="button" onClick={addLigne} className="text-blue-600 hover:text-blue-800 text-sm">+ Ajouter ligne</button>
                </div>
                {formData.lignes.map((ligne, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 mb-2 p-3 bg-gray-50 rounded">
                    <div className="col-span-4">
                      <select
                        required
                        value={ligne.id_article}
                        onChange={(e) => updateLigne(index, 'id_article', e.target.value)}
                        className="w-full px-2 py-1 border rounded text-sm"
                      >
                        <option value="">Article...</option>
                        {articles.filter(a => a.actif).map((article) => (
                          <option key={article.id_article} value={article.id_article}>{article.code_article} - {article.designation}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        step="0.01"
                        required
                        placeholder="Quantité"
                        value={ligne.quantite_commandee}
                        onChange={(e) => updateLigne(index, 'quantite_commandee', e.target.value)}
                        className="w-full px-2 py-1 border rounded text-sm"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        step="0.01"
                        required
                        placeholder="Prix unitaire"
                        value={ligne.prix_unitaire}
                        onChange={(e) => updateLigne(index, 'prix_unitaire', e.target.value)}
                        className="w-full px-2 py-1 border rounded text-sm"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Remise %"
                        value={ligne.remise}
                        onChange={(e) => updateLigne(index, 'remise', e.target.value)}
                        className="w-full px-2 py-1 border rounded text-sm"
                      />
                    </div>
                    <div className="col-span-2 flex gap-1">
                      <button type="button" onClick={() => removeLigne(index)} className="text-red-600 hover:text-red-800 text-sm">Supprimer</button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-4">
                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
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
                      commande.statut === 'en_production' ? 'bg-blue-100 text-blue-800' :
                      commande.statut === 'livree' ? 'bg-gray-100 text-gray-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {commande.statut}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      <button 
                        onClick={async () => {
                          try {
                            const result = await commandesService.getCommande(commande.id_commande);
                            if (result.data?.data) {
                              setSelectedCommande(result.data.data);
                            }
                          } catch (error: any) {
                            console.error('Erreur chargement commande:', error);
                            setSelectedCommande(commande);
                          }
                        }}
                        className="text-blue-600 hover:text-blue-900"
                        title="Consulter"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <ShoppingCart className="w-6 h-6 text-blue-600" />
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
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
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
                        selectedCommande.statut === 'en_production' ? 'bg-blue-100 text-blue-800' :
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
                              <td className="px-4 py-2">{ligne.prix_unitaire?.toFixed(2)} {selectedCommande.devise || 'TND'}</td>
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
                          <span>{selectedCommande.montant_total?.toFixed(2)} {selectedCommande.devise || 'TND'}</span>
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
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
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
    </div>
  );
};

export default Commandes;
