import React, { useState, useEffect } from 'react';
import { fournisseursService } from '../services/api';
import { Building, PlusCircle, Edit, Trash2, Search, List, Grid, Eye, X, Mail, Phone, MapPin, Truck, Clock, CreditCard } from 'lucide-react';

interface Fournisseur {
  id_fournisseur: number;
  code_fournisseur: string;
  raison_sociale: string;
  ville: string;
  telephone: string;
  email: string;
  actif: boolean;
}

const Fournisseurs: React.FC = () => {
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [affichageMode, setAffichageMode] = useState<'ligne' | 'catalogue'>('ligne'); // Simple toggle ligne/catalogue
  const [showForm, setShowForm] = useState(false);
  const [editingFournisseur, setEditingFournisseur] = useState<any>(null);
  const [selectedFournisseur, setSelectedFournisseur] = useState<any>(null);
  const [formData, setFormData] = useState({
    code_fournisseur: '',
    raison_sociale: '',
    adresse: '',
    code_postal: '',
    ville: '',
    pays: 'Tunisie',
    telephone: '',
    email: '',
    contact_principal: '',
    delai_livraison_moyen: '',
    conditions_paiement: '',
    devise: 'TND'
  });

  useEffect(() => {
    loadData();
  }, [search]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fournisseursService.getFournisseurs({ search });
      setFournisseurs(res.data.data.fournisseurs || []);
    } catch (err: any) {
      console.error('Erreur chargement fournisseurs:', err);
      setError(err.response?.data?.error?.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (editingFournisseur) {
        await fournisseursService.updateFournisseur(editingFournisseur.id_fournisseur, formData);
      } else {
        await fournisseursService.createFournisseur(formData);
      }
      setShowForm(false);
      setEditingFournisseur(null);
      resetForm();
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Erreur lors de la sauvegarde');
    }
  };

  const handleEdit = (fournisseur: Fournisseur) => {
    setEditingFournisseur(fournisseur);
    setFormData({
      code_fournisseur: fournisseur.code_fournisseur,
      raison_sociale: fournisseur.raison_sociale,
      adresse: (fournisseur as any).adresse || '',
      code_postal: (fournisseur as any).code_postal || '',
      ville: fournisseur.ville || '',
      pays: (fournisseur as any).pays || 'Tunisie',
      telephone: fournisseur.telephone || '',
      email: fournisseur.email || '',
      contact_principal: (fournisseur as any).contact_principal || '',
      delai_livraison_moyen: (fournisseur as any).delai_livraison_moyen || '',
      conditions_paiement: (fournisseur as any).conditions_paiement || '',
      devise: (fournisseur as any).devise || 'TND'
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      code_fournisseur: '',
      raison_sociale: '',
      adresse: '',
      code_postal: '',
      ville: '',
      pays: 'Tunisie',
      telephone: '',
      email: '',
      contact_principal: '',
      delai_livraison_moyen: '',
      conditions_paiement: '',
      devise: 'TND'
    });
  };

  if (loading) {
    return (
      <div className="ml-64 p-6 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="ml-64 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              <Building className="w-8 h-8" />
              Fournisseurs
            </h1>
            <button
              onClick={() => { setShowForm(true); setEditingFournisseur(null); resetForm(); }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <PlusCircle className="w-5 h-5" />
              Nouveau Fournisseur
            </button>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

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
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher par code ou raison sociale..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
              />
            </div>
          </div>

          {/* Formulaire */}
          {showForm && (
            <div className="bg-white p-6 rounded-lg shadow mb-6">
              <h2 className="text-xl font-bold mb-4">{editingFournisseur ? 'Modifier' : 'Nouveau'} Fournisseur</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Code Fournisseur *</label>
                    <input
                      type="text"
                      required
                      value={formData.code_fournisseur}
                      onChange={(e) => setFormData({ ...formData, code_fournisseur: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Raison Sociale *</label>
                    <input
                      type="text"
                      required
                      value={formData.raison_sociale}
                      onChange={(e) => setFormData({ ...formData, raison_sociale: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Adresse</label>
                    <input
                      type="text"
                      value={formData.adresse}
                      onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Code Postal</label>
                    <input
                      type="text"
                      value={formData.code_postal}
                      onChange={(e) => setFormData({ ...formData, code_postal: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Ville</label>
                    <input
                      type="text"
                      value={formData.ville}
                      onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Téléphone</label>
                    <input
                      type="text"
                      value={formData.telephone}
                      onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Contact Principal</label>
                    <input
                      type="text"
                      value={formData.contact_principal}
                      onChange={(e) => setFormData({ ...formData, contact_principal: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Délai Livraison Moyen (jours)</label>
                    <input
                      type="number"
                      value={formData.delai_livraison_moyen}
                      onChange={(e) => setFormData({ ...formData, delai_livraison_moyen: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Conditions Paiement</label>
                    <input
                      type="text"
                      value={formData.conditions_paiement}
                      onChange={(e) => setFormData({ ...formData, conditions_paiement: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                    {editingFournisseur ? 'Modifier' : 'Créer'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowForm(false); setEditingFournisseur(null); resetForm(); }}
                    className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
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
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Raison Sociale</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ville</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Téléphone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {fournisseurs.map((fournisseur) => (
                    <tr key={fournisseur.id_fournisseur}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{fournisseur.code_fournisseur}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{fournisseur.raison_sociale}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{fournisseur.ville}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{fournisseur.telephone}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{fournisseur.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded ${fournisseur.actif ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {fournisseur.actif ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <button 
                            onClick={async () => {
                              try {
                                const result = await fournisseursService.getFournisseur(fournisseur.id_fournisseur);
                                if (result.data?.data) {
                                  setSelectedFournisseur(result.data.data);
                                }
                              } catch (error: any) {
                                console.error('Erreur chargement fournisseur:', error);
                                setSelectedFournisseur(fournisseur);
                              }
                            }}
                            className="text-blue-600 hover:text-blue-900"
                            title="Consulter"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleEdit(fournisseur)} className="text-gray-600 hover:text-gray-900" title="Modifier">
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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {fournisseurs.map((fournisseur) => (
              <div key={fournisseur.id_fournisseur} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-32 bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                  <div className="text-center">
                    <Building className="w-12 h-12 text-green-600 mx-auto mb-2" />
                    <span className="text-xs font-mono font-bold text-green-800">{fournisseur.code_fournisseur}</span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg text-gray-800 mb-2">{fournisseur.raison_sociale}</h3>
                  <div className="space-y-1 text-sm text-gray-600 mb-3">
                    <p><span className="font-medium">Ville:</span> {fournisseur.ville}</p>
                    <p><span className="font-medium">Téléphone:</span> {fournisseur.telephone}</p>
                    <p><span className="font-medium">Email:</span> {fournisseur.email}</p>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-2 py-1 rounded text-xs ${fournisseur.actif ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {fournisseur.actif ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                  <div className="flex gap-2 pt-3 border-t">
                    <button
                      onClick={async () => {
                        try {
                          const result = await fournisseursService.getFournisseur(fournisseur.id_fournisseur);
                          if (result.data?.data) {
                            setSelectedFournisseur(result.data.data);
                          }
                        } catch (error: any) {
                          console.error('Erreur chargement fournisseur:', error);
                          setSelectedFournisseur(fournisseur);
                        }
                      }}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                    >
                      <Eye className="w-4 h-4" />
                      Consulter
                    </button>
                    <button
                      onClick={() => handleEdit(fournisseur)}
                      className="px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal de consultation */}
        {selectedFournisseur && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <Building className="w-6 h-6 text-green-600" />
                  {selectedFournisseur.raison_sociale}
                </h2>
                <button
                  onClick={() => setSelectedFournisseur(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Informations générales */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Building className="w-5 h-5 text-green-600" />
                    Informations Générales
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Code Fournisseur</label>
                      <p className="text-gray-900 font-semibold">{selectedFournisseur.code_fournisseur}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Raison Sociale</label>
                      <p className="text-gray-900 font-semibold">{selectedFournisseur.raison_sociale}</p>
                    </div>
                    {(selectedFournisseur as any).contact_principal && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Contact Principal</label>
                        <p className="text-gray-900">{(selectedFournisseur as any).contact_principal}</p>
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium text-gray-500">Statut</label>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${selectedFournisseur.actif ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {selectedFournisseur.actif ? 'Actif' : 'Inactif'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Coordonnées */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-green-600" />
                    Coordonnées
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {(selectedFournisseur as any).adresse && (
                      <div className="col-span-2">
                        <label className="text-sm font-medium text-gray-500">Adresse</label>
                        <p className="text-gray-900">{(selectedFournisseur as any).adresse}</p>
                      </div>
                    )}
                    {(selectedFournisseur as any).code_postal && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Code Postal</label>
                        <p className="text-gray-900">{(selectedFournisseur as any).code_postal}</p>
                      </div>
                    )}
                    {selectedFournisseur.ville && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Ville</label>
                        <p className="text-gray-900">{selectedFournisseur.ville}</p>
                      </div>
                    )}
                    {(selectedFournisseur as any).pays && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Pays</label>
                        <p className="text-gray-900">{(selectedFournisseur as any).pays}</p>
                      </div>
                    )}
                    {selectedFournisseur.telephone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <div>
                          <label className="text-sm font-medium text-gray-500">Téléphone</label>
                          <p className="text-gray-900">{selectedFournisseur.telephone}</p>
                        </div>
                      </div>
                    )}
                    {selectedFournisseur.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <div>
                          <label className="text-sm font-medium text-gray-500">Email</label>
                          <p className="text-gray-900">{selectedFournisseur.email}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Informations commerciales */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-green-600" />
                    Informations Commerciales
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {(selectedFournisseur as any).devise && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Devise</label>
                        <p className="text-gray-900">{(selectedFournisseur as any).devise}</p>
                      </div>
                    )}
                    {(selectedFournisseur as any).delai_livraison_moyen && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <div>
                          <label className="text-sm font-medium text-gray-500">Délai Livraison Moyen</label>
                          <p className="text-gray-900">{(selectedFournisseur as any).delai_livraison_moyen} jours</p>
                        </div>
                      </div>
                    )}
                    {(selectedFournisseur as any).conditions_paiement && (
                      <div className="col-span-2 flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-gray-400" />
                        <div className="flex-1">
                          <label className="text-sm font-medium text-gray-500">Conditions de Paiement</label>
                          <p className="text-gray-900">{(selectedFournisseur as any).conditions_paiement}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="border-t pt-4 flex gap-2 justify-end">
                  <button
                    onClick={() => {
                      handleEdit(selectedFournisseur);
                      setSelectedFournisseur(null);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Modifier
                  </button>
                  <button
                    onClick={() => setSelectedFournisseur(null)}
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

export default Fournisseurs;
