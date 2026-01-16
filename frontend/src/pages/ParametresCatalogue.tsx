import React, { useState, useEffect } from 'react';
import { parametresCatalogueService } from '../services/api';
import { Settings, PlusCircle, Edit, Trash2, Ruler, Palette, Layers, Scissors, Box } from 'lucide-react';

const ParametresCatalogue: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dimensions' | 'finitions' | 'tissages' | 'couleurs' | 'modeles'>('dimensions');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      let res;
      switch (activeTab) {
        case 'dimensions':
          res = await parametresCatalogueService.getDimensions();
          break;
        case 'finitions':
          res = await parametresCatalogueService.getFinitions();
          break;
        case 'tissages':
          res = await parametresCatalogueService.getTissages();
          break;
        case 'couleurs':
          res = await parametresCatalogueService.getCouleurs();
          break;
        case 'modeles':
          res = await parametresCatalogueService.getModeles();
          break;
      }
      setData(res.data.data || []);
    } catch (err: any) {
      console.error('Erreur chargement paramètres:', err);
      setError(err.response?.data?.error?.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (editingItem) {
        await parametresCatalogueService.updateParametre(activeTab, editingItem.id, formData);
      } else {
        await parametresCatalogueService.createParametre(activeTab, formData);
      }
      setShowForm(false);
      setEditingItem(null);
      resetForm();
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Erreur lors de la sauvegarde');
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData(item);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({});
  };

  const getFormFields = () => {
    switch (activeTab) {
      case 'dimensions':
        return (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Code *</label>
              <input
                type="text"
                required
                value={formData.code || ''}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Libellé *</label>
              <input
                type="text"
                required
                value={formData.libelle || ''}
                onChange={(e) => setFormData({ ...formData, libelle: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Largeur (cm)</label>
              <input
                type="number"
                step="0.01"
                value={formData.largeur || ''}
                onChange={(e) => setFormData({ ...formData, largeur: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Longueur (cm)</label>
              <input
                type="number"
                step="0.01"
                value={formData.longueur || ''}
                onChange={(e) => setFormData({ ...formData, longueur: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
          </>
        );
      case 'finitions':
        return (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Code *</label>
              <input
                type="text"
                required
                value={formData.code || ''}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Libellé *</label>
              <input
                type="text"
                required
                value={formData.libelle || ''}
                onChange={(e) => setFormData({ ...formData, libelle: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                rows={3}
              />
            </div>
          </>
        );
      case 'tissages':
        return (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Code *</label>
              <input
                type="text"
                required
                value={formData.code || ''}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Libellé *</label>
              <input
                type="text"
                required
                value={formData.libelle || ''}
                onChange={(e) => setFormData({ ...formData, libelle: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                rows={3}
              />
            </div>
          </>
        );
      case 'couleurs':
        return (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Code Commercial *</label>
              <input
                type="text"
                required
                value={formData.code_commercial || ''}
                onChange={(e) => setFormData({ ...formData, code_commercial: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nom *</label>
              <input
                type="text"
                required
                value={formData.nom || ''}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Code Hex</label>
              <input
                type="color"
                value={formData.code_hex || '#FFFFFF'}
                onChange={(e) => setFormData({ ...formData, code_hex: e.target.value })}
                className="w-full h-10 border rounded-lg"
              />
            </div>
          </>
        );
      case 'modeles':
        return (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Code Modèle *</label>
              <input
                type="text"
                required
                value={formData.code_modele || ''}
                onChange={(e) => setFormData({ ...formData, code_modele: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Libellé *</label>
              <input
                type="text"
                required
                value={formData.libelle || ''}
                onChange={(e) => setFormData({ ...formData, libelle: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                rows={3}
              />
            </div>
          </>
        );
    }
  };

  const getTabIcon = () => {
    switch (activeTab) {
      case 'dimensions': return <Ruler className="w-5 h-5" />;
      case 'finitions': return <Scissors className="w-5 h-5" />;
      case 'tissages': return <Layers className="w-5 h-5" />;
      case 'couleurs': return <Palette className="w-5 h-5" />;
      case 'modeles': return <Box className="w-5 h-5" />;
    }
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
              <Settings className="w-8 h-8" />
              Paramètres Catalogue
            </h1>
            <button
              onClick={() => { setShowForm(true); setEditingItem(null); resetForm(); }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <PlusCircle className="w-5 h-5" />
              Ajouter
            </button>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Onglets */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="flex border-b border-gray-200">
              {[
                { key: 'dimensions', label: 'Dimensions', icon: Ruler },
                { key: 'finitions', label: 'Finitions', icon: Scissors },
                { key: 'tissages', label: 'Tissages', icon: Layers },
                { key: 'couleurs', label: 'Couleurs', icon: Palette },
                { key: 'modeles', label: 'Modèles', icon: Box }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`flex items-center gap-2 py-3 px-6 text-sm font-medium ${
                      activeTab === tab.key
                        ? 'border-b-2 border-blue-600 text-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Formulaire */}
            {showForm && (
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold mb-4">{editingItem ? 'Modifier' : 'Nouveau'} {activeTab}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {getFormFields()}
                  </div>
                  <div className="flex gap-4">
                    <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                      {editingItem ? 'Modifier' : 'Créer'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowForm(false); setEditingItem(null); resetForm(); }}
                      className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Liste */}
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {activeTab === 'dimensions' && (
                        <>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Libellé</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Largeur</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Longueur</th>
                        </>
                      )}
                      {activeTab === 'couleurs' && (
                        <>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Couleur</th>
                        </>
                      )}
                      {(activeTab === 'finitions' || activeTab === 'tissages' || activeTab === 'modeles') && (
                        <>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Libellé</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                        </>
                      )}
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.map((item) => (
                      <tr key={item.id}>
                        {activeTab === 'dimensions' && (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{item.code}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{item.libelle}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{item.largeur} cm</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{item.longueur} cm</td>
                          </>
                        )}
                        {activeTab === 'couleurs' && (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{item.code_commercial}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{item.nom}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-6 h-6 rounded border"
                                  style={{ backgroundColor: item.code_hex || '#FFFFFF' }}
                                />
                                <span className="text-xs">{item.code_hex}</span>
                              </div>
                            </td>
                          </>
                        )}
                        {(activeTab === 'finitions' || activeTab === 'tissages' || activeTab === 'modeles') && (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              {item.code || item.code_modele}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{item.libelle}</td>
                            <td className="px-6 py-4 text-sm">{item.description || '-'}</td>
                          </>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-900">
                            <Edit className="w-4 h-4 inline" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParametresCatalogue;
