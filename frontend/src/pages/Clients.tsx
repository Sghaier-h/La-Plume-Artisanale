import React, { useEffect, useState } from 'react';
import { clientsService } from '../services/api';
import { List, Grid, Eye, X, User, Mail, Phone, MapPin, Building, CreditCard, Percent, Edit, Trash2 } from 'lucide-react';

const Clients: React.FC = () => {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [affichageMode, setAffichageMode] = useState<'ligne' | 'catalogue'>('ligne'); // Simple toggle ligne/catalogue

  const [formData, setFormData] = useState({
    code_client: '',
    raison_sociale: '',
    adresse: '',
    code_postal: '',
    ville: '',
    pays: 'Tunisie',
    telephone: '',
    email: '',
    contact_principal: '',
    conditions_paiement: '',
    plafond_credit: '',
    devise: 'TND',
    taux_remise: '0',
    actif: true
  });

  useEffect(() => {
    loadData();
  }, [search]);

  const loadData = async () => {
    try {
      const res = await clientsService.getClients({ search });
      setClients(res.data.data);
    } catch (error) {
      console.error('Erreur chargement clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingClient) {
        await clientsService.updateClient(editingClient.id_client, formData);
      } else {
        await clientsService.createClient(formData);
      }
      setShowForm(false);
      setEditingClient(null);
      resetForm();
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'Erreur');
    }
  };

  const handleEdit = (client: any) => {
    setEditingClient(client);
    setFormData({
      code_client: client.code_client,
      raison_sociale: client.raison_sociale,
      adresse: client.adresse || '',
      code_postal: client.code_postal || '',
      ville: client.ville || '',
      pays: client.pays || 'Tunisie',
      telephone: client.telephone || '',
      email: client.email || '',
      contact_principal: client.contact_principal || '',
      conditions_paiement: client.conditions_paiement || '',
      plafond_credit: client.plafond_credit || '',
      devise: client.devise || 'TND',
      taux_remise: client.taux_remise || '0',
      actif: client.actif
    });
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
      adresse: '',
      code_postal: '',
      ville: '',
      pays: 'Tunisie',
      telephone: '',
      email: '',
      contact_principal: '',
      conditions_paiement: '',
      plafond_credit: '',
      devise: 'TND',
      taux_remise: '0',
      actif: true
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
          </div>
          <input
            type="text"
            placeholder="Rechercher par code, raison sociale ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border rounded"
          />
        </div>

        {/* Formulaire */}
        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-bold mb-4">{editingClient ? 'Modifier' : 'Nouveau'} Client</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Code Client *</label>
                  <input
                    type="text"
                    required
                    value={formData.code_client}
                    onChange={(e) => setFormData({ ...formData, code_client: e.target.value })}
                    className="w-full px-4 py-2 border rounded"
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
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Adresse</label>
                  <input
                    type="text"
                    value={formData.adresse}
                    onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                    className="w-full px-4 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Code Postal</label>
                  <input
                    type="text"
                    value={formData.code_postal}
                    onChange={(e) => setFormData({ ...formData, code_postal: e.target.value })}
                    className="w-full px-4 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Ville</label>
                  <input
                    type="text"
                    value={formData.ville}
                    onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                    className="w-full px-4 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Téléphone</label>
                  <input
                    type="text"
                    value={formData.telephone}
                    onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                    className="w-full px-4 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Contact Principal</label>
                  <input
                    type="text"
                    value={formData.contact_principal}
                    onChange={(e) => setFormData({ ...formData, contact_principal: e.target.value })}
                    className="w-full px-4 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Plafond Crédit</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.plafond_credit}
                    onChange={(e) => setFormData({ ...formData, plafond_credit: e.target.value })}
                    className="w-full px-4 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Taux Remise (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.taux_remise}
                    onChange={(e) => setFormData({ ...formData, taux_remise: e.target.value })}
                    className="w-full px-4 py-2 border rounded"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
                  {editingClient ? 'Modifier' : 'Créer'}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setEditingClient(null); resetForm(); }} className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400">
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ville</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Téléphone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clients.map((client) => (
                <tr key={client.id_client}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{client.code_client}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{client.raison_sociale}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{client.ville || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{client.email || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{client.telephone || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded ${client.actif ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {client.actif ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      <button 
                        onClick={async () => {
                          try {
                            const result = await clientsService.getClient(client.id_client);
                            if (result.data?.data) {
                              setSelectedClient(result.data.data);
                            }
                          } catch (error: any) {
                            console.error('Erreur chargement client:', error);
                            setSelectedClient(client);
                          }
                        }}
                        className="text-blue-600 hover:text-blue-900"
                        title="Consulter"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleEdit(client)} className="text-gray-600 hover:text-gray-900" title="Modifier">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(client.id_client)} className="text-red-600 hover:text-red-900" title="Supprimer">
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
              <div key={client.id_client} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-32 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-800">{client.raison_sociale?.charAt(0) || 'C'}</div>
                    <span className="text-xs font-mono text-blue-600">{client.code_client}</span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg text-gray-800 mb-2">{client.raison_sociale}</h3>
                  <div className="space-y-1 text-sm text-gray-600 mb-3">
                    <p><span className="font-medium">Ville:</span> {client.ville || '-'}</p>
                    <p><span className="font-medium">Email:</span> {client.email || '-'}</p>
                    <p><span className="font-medium">Téléphone:</span> {client.telephone || '-'}</p>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-2 py-1 rounded text-xs ${client.actif ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {client.actif ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                  <div className="flex gap-2 pt-3 border-t">
                    <button
                      onClick={() => handleEdit(client)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(client.id_client)}
                      className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Supprimer
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
