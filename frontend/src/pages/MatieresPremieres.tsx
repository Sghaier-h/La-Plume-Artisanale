import React, { useState, useEffect } from 'react';
import { matieresPremieresService } from '../services/api';
import { Plus, Search, Edit, Package, Settings, Tag, List, Grid, Eye, X, AlertTriangle, DollarSign, BarChart3 } from 'lucide-react';

const MatieresPremieres: React.FC = () => {
  const [matieres, setMatieres] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingMatiere, setEditingMatiere] = useState<any>(null);
  const [selectedMatiere, setSelectedMatiere] = useState<any>(null);
  const [affichageMode, setAffichageMode] = useState<'ligne' | 'catalogue'>('ligne'); // Simple toggle ligne/catalogue
  const [formData, setFormData] = useState<any>({
    code_mp: '',
    designation: '',
    id_type_mp: '',
    code_couleur: '', // Code Couleur (ex: C01, C02, etc.)
    couleur: '', // Couleur (ex: BLANC, ECRU, etc.)
    code_fabrication_mp: '', // Code Fabrication MP (ex: NM05-01.00, NM15-01.00, etc.)
    numero_metrique: '', // Numéro Métrique (ex: NM05, NM15, etc.)
    num_lot: '', // Num de Lot (ex: S2023, 63555, etc.)
    couleur_commerciale: '', // Couleur Commerciale (optionnel)
    qr_mp: '', // QR MP généré automatiquement
    prix_unitaire: 0,
    stock_minimum: 0,
    stock_alerte: 0
  });
  const [typesMP, setTypesMP] = useState<any[]>([]);

  useEffect(() => {
    loadData();
    loadTypesMP();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await matieresPremieresService.getMatieresPremieres({ search });
      setMatieres(response.data.data.matieres || []);
    } catch (error) {
      console.error('Erreur chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTypesMP = async () => {
    try {
      const response = await matieresPremieresService.getTypesMP();
      setTypesMP(response.data.data || []);
    } catch (error) {
      console.error('Erreur chargement types:', error);
    }
  };

  // Générer automatiquement le QR MP selon la formule Excel
  // CONCATENER([Code Couleur];"_";[Couleur];"_";[Code Fabrication MP];"_";[Num de Lot];"__")
  const genererQRMP = (data: any): string => {
    const parts: string[] = [];
    
    if (data.code_couleur) parts.push(data.code_couleur);
    if (data.couleur) parts.push(data.couleur);
    if (data.code_fabrication_mp) parts.push(data.code_fabrication_mp);
    if (data.num_lot) parts.push(data.num_lot);
    
    // Joindre avec "_" et ajouter "__" à la fin
    const qrMP = parts.length > 0 ? parts.join('_') + '__' : '';
    return qrMP;
  };

  // Fonction pour mettre à jour le QR MP lors des changements de champs
  const updateFormDataWithQRMP = (updates: any) => {
    const newData = { ...formData, ...updates };
    const qrMP = genererQRMP(newData);
    setFormData({ ...newData, qr_mp: qrMP });
  };

  const handleCreate = () => {
    setEditingMatiere(null);
    setFormData({
      code_mp: '',
      designation: '',
      id_type_mp: '',
      code_couleur: '',
      couleur: '',
      code_fabrication_mp: '',
      numero_metrique: '',
      num_lot: '',
      couleur_commerciale: '',
      qr_mp: '',
      prix_unitaire: 0,
      stock_minimum: 0,
      stock_alerte: 0
    });
    setShowModal(true);
  };

  const handleEdit = (matiere: any) => {
    setEditingMatiere(matiere);
    const matiereData = {
      code_mp: matiere.code_mp || '',
      designation: matiere.designation || '',
      id_type_mp: matiere.id_type_mp || '',
      code_couleur: matiere.code_couleur || '',
      couleur: matiere.couleur || '',
      code_fabrication_mp: matiere.code_fabrication_mp || '',
      numero_metrique: matiere.numero_metrique || '',
      num_lot: matiere.num_lot || '',
      couleur_commerciale: matiere.couleur_commerciale || '',
      prix_unitaire: matiere.prix_unitaire || 0,
      stock_minimum: matiere.stock_minimum || 0,
      stock_alerte: matiere.stock_alerte || 0
    };
    setFormData({
      ...matiereData,
      qr_mp: matiere.qr_mp || genererQRMP(matiereData)
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (editingMatiere) {
        await matieresPremieresService.updateMatierePremiere(editingMatiere.id_mp, formData);
      } else {
        await matieresPremieresService.createMatierePremiere(formData);
      }
      setShowModal(false);
      loadData();
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
    }
  };

  const getStockStatus = (matiere: any) => {
    const stock = matiere.stock_disponible || 0;
    const minimum = matiere.stock_minimum || 0;
    const alerte = matiere.stock_alerte || 0;

    if (stock < minimum) return 'critical';
    if (stock < alerte) return 'warning';
    return 'ok';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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
              <Package className="w-8 h-8" />
              Matières Premières
            </h1>
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="w-5 h-5" />
              Ajouter
            </button>
          </div>

          {/* Toggle Affichage et Recherche */}
          <div className="mb-6">
            <div className="bg-white p-4 rounded-lg shadow mb-4">
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
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher une matière première..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  loadData();
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Liste */}
          {affichageMode === 'ligne' ? (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">QR MP</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code Couleur</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Couleur</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code Fabrication MP</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Num de Lot</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prix unitaire</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {matieres.map((matiere) => {
                  const status = getStockStatus(matiere);
                  return (
                    <tr key={matiere.id_mp} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-xs font-medium text-blue-600">
                        {matiere.qr_mp || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">{matiere.code_couleur || matiere.code_mp || '-'}</td>
                      <td className="px-6 py-4">{matiere.couleur || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">{matiere.code_fabrication_mp || matiere.numero_metrique || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">{matiere.num_lot || '-'}</td>
                      <td className="px-6 py-4">{parseFloat(matiere.prix_unitaire || 0).toFixed(2)} TND</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-medium">{matiere.stock_disponible || 0} kg</span>
                          <span className="text-xs text-gray-500">
                            Min: {matiere.stock_minimum || 0} | Alerte: {matiere.stock_alerte || 0}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          status === 'critical' ? 'bg-red-100 text-red-800' :
                          status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {status === 'critical' ? 'Critique' : status === 'warning' ? 'Alerte' : 'OK'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={async () => {
                              try {
                                const result = await matieresPremieresService.getMatierePremiere(matiere.id_mp);
                                if (result.data?.data) {
                                  setSelectedMatiere(result.data.data);
                                }
                              } catch (error: any) {
                                console.error('Erreur chargement matière:', error);
                                setSelectedMatiere(matiere);
                              }
                            }}
                            className="text-blue-600 hover:text-blue-800"
                            title="Consulter"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(matiere)}
                            className="text-gray-600 hover:text-gray-800"
                            title="Modifier"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          ) : (
            // Mode Catalogue
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {matieres.map((matiere) => {
                const status = getStockStatus(matiere);
                return (
                  <div key={matiere.id_mp} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="h-32 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                      <div className="text-center">
                        <Package className="w-12 h-12 text-blue-600 mx-auto mb-2" />
                        <span className="font-mono text-xs font-bold text-blue-800">{matiere.qr_mp || matiere.code_couleur || '-'}</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-lg text-gray-800 mb-2">{matiere.couleur || matiere.designation || '-'}</h3>
                      <div className="space-y-1 text-sm text-gray-600 mb-3">
                        <p><span className="font-medium">Code:</span> {matiere.code_couleur || matiere.code_mp || '-'}</p>
                        <p><span className="font-medium">Fabrication:</span> <span className="font-mono text-xs">{matiere.code_fabrication_mp || '-'}</span></p>
                        <p><span className="font-medium">Lot:</span> {matiere.num_lot || '-'}</p>
                        <p><span className="font-medium">Prix:</span> {parseFloat(matiere.prix_unitaire || 0).toFixed(2)} TND</p>
                        <p><span className="font-medium">Stock:</span> {matiere.stock_disponible || 0} kg</p>
                      </div>
                      <div className="flex items-center justify-between mb-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          status === 'critical' ? 'bg-red-100 text-red-800' :
                          status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {status === 'critical' ? 'Critique' : status === 'warning' ? 'Alerte' : 'OK'}
                        </span>
                      </div>
                      <div className="flex gap-2 pt-3 border-t">
                        <button
                          onClick={async () => {
                            try {
                              const result = await matieresPremieresService.getMatierePremiere(matiere.id_mp);
                              if (result.data?.data) {
                                setSelectedMatiere(result.data.data);
                              }
                            } catch (error: any) {
                              console.error('Erreur chargement matière:', error);
                              setSelectedMatiere(matiere);
                            }
                          }}
                          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                        >
                          <Eye className="w-4 h-4" />
                          Consulter
                        </button>
                        <button
                          onClick={() => handleEdit(matiere)}
                          className="px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
                <h2 className="text-xl font-bold mb-4">
                  {editingMatiere ? 'Modifier' : 'Créer'} une Matière Première
                </h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Code Couleur * (ex: C01, C02)</label>
                    <input
                      type="text"
                      value={formData.code_couleur}
                      onChange={(e) => updateFormDataWithQRMP({ code_couleur: e.target.value.toUpperCase() })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md"
                      placeholder="C01"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Couleur * (ex: BLANC, ECRU)</label>
                    <input
                      type="text"
                      value={formData.couleur}
                      onChange={(e) => updateFormDataWithQRMP({ couleur: e.target.value.toUpperCase() })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md"
                      placeholder="BLANC"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Numéro Métrique (ex: NM05, NM15)</label>
                    <input
                      type="text"
                      value={formData.numero_metrique}
                      onChange={(e) => setFormData({ ...formData, numero_metrique: e.target.value.toUpperCase() })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md"
                      placeholder="NM05"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Code Fabrication MP * (ex: NM05-01.00)</label>
                    <input
                      type="text"
                      value={formData.code_fabrication_mp}
                      onChange={(e) => updateFormDataWithQRMP({ code_fabrication_mp: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md"
                      placeholder="NM05-01.00"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Num de Lot * (ex: S2023, 63555)</label>
                    <input
                      type="text"
                      value={formData.num_lot}
                      onChange={(e) => updateFormDataWithQRMP({ num_lot: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md"
                      placeholder="S2023"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Couleur Commerciale (optionnel)</label>
                    <input
                      type="text"
                      value={formData.couleur_commerciale}
                      onChange={(e) => setFormData({ ...formData, couleur_commerciale: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md"
                      placeholder="Ex: Terra, Bleu Delave"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">QR MP (Généré automatiquement)</label>
                    <input
                      type="text"
                      value={formData.qr_mp}
                      readOnly
                      className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 font-mono text-sm"
                      placeholder="C01_BLANC_NM05-01.00_S2023__"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Format: Code Couleur + "_" + Couleur + "_" + Code Fabrication MP + "_" + Num de Lot + "__"
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Code MP (interne)</label>
                    <input
                      type="text"
                      value={formData.code_mp}
                      onChange={(e) => setFormData({ ...formData, code_mp: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md"
                      placeholder="Code interne"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type MP</label>
                    <select
                      value={formData.id_type_mp}
                      onChange={(e) => setFormData({ ...formData, id_type_mp: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Sélectionner...</option>
                      {typesMP.map((type) => (
                        <option key={type.id_type_mp} value={type.id_type_mp}>
                          {type.libelle}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Désignation</label>
                    <input
                      type="text"
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md"
                      placeholder="Désignation de la matière première"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Prix unitaire (TND)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.prix_unitaire}
                      onChange={(e) => setFormData({ ...formData, prix_unitaire: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Stock minimum</label>
                    <input
                      type="number"
                      value={formData.stock_minimum}
                      onChange={(e) => setFormData({ ...formData, stock_minimum: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Stock alerte</label>
                    <input
                      type="number"
                      value={formData.stock_alerte}
                      onChange={(e) => setFormData({ ...formData, stock_alerte: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-4 mt-6">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Enregistrer
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal de consultation */}
          {selectedMatiere && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Package className="w-6 h-6 text-blue-600" />
                    Matière Première - {selectedMatiere.couleur || selectedMatiere.designation || selectedMatiere.code_couleur}
                  </h2>
                  <button
                    onClick={() => setSelectedMatiere(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="p-6 space-y-6">
                  {/* Informations générales */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Tag className="w-5 h-5 text-blue-600" />
                      Informations Générales
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedMatiere.qr_mp && (
                        <div className="col-span-2">
                          <label className="text-sm font-medium text-gray-500">QR MP</label>
                          <p className="text-gray-900 font-mono font-semibold text-sm">{selectedMatiere.qr_mp}</p>
                        </div>
                      )}
                      {selectedMatiere.code_couleur && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Code Couleur</label>
                          <p className="text-gray-900 font-semibold">{selectedMatiere.code_couleur}</p>
                        </div>
                      )}
                      {selectedMatiere.couleur && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Couleur</label>
                          <p className="text-gray-900 font-semibold">{selectedMatiere.couleur}</p>
                        </div>
                      )}
                      {selectedMatiere.code_mp && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Code MP</label>
                          <p className="text-gray-900">{selectedMatiere.code_mp}</p>
                        </div>
                      )}
                      {selectedMatiere.designation && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Désignation</label>
                          <p className="text-gray-900">{selectedMatiere.designation}</p>
                        </div>
                      )}
                      {selectedMatiere.code_fabrication_mp && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Code Fabrication MP</label>
                          <p className="text-gray-900 font-mono text-sm">{selectedMatiere.code_fabrication_mp}</p>
                        </div>
                      )}
                      {selectedMatiere.num_lot && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Numéro de Lot</label>
                          <p className="text-gray-900 font-mono text-sm">{selectedMatiere.num_lot}</p>
                        </div>
                      )}
                      {selectedMatiere.numero_metrique && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Numéro Métrique</label>
                          <p className="text-gray-900 font-mono text-sm">{selectedMatiere.numero_metrique}</p>
                        </div>
                      )}
                      {selectedMatiere.couleur_commerciale && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Couleur Commerciale</label>
                          <p className="text-gray-900">{selectedMatiere.couleur_commerciale}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stock et Prix */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                      Stock et Prix
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedMatiere.stock_disponible !== undefined && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Stock Disponible</label>
                          <p className="text-gray-900 font-semibold text-lg">{selectedMatiere.stock_disponible || 0} kg</p>
                        </div>
                      )}
                      {selectedMatiere.prix_unitaire && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-gray-400" />
                          <div>
                            <label className="text-sm font-medium text-gray-500">Prix Unitaire</label>
                            <p className="text-gray-900 font-semibold text-lg">{parseFloat(selectedMatiere.prix_unitaire || 0).toFixed(2)} TND</p>
                          </div>
                        </div>
                      )}
                      {selectedMatiere.stock_minimum !== undefined && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Stock Minimum</label>
                          <p className="text-gray-900">{selectedMatiere.stock_minimum || 0} kg</p>
                        </div>
                      )}
                      {selectedMatiere.stock_alerte !== undefined && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Stock Alerte</label>
                          <p className="text-gray-900">{selectedMatiere.stock_alerte || 0} kg</p>
                        </div>
                      )}
                      <div className="col-span-2">
                        <label className="text-sm font-medium text-gray-500">Statut Stock</label>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-1 ${
                          getStockStatus(selectedMatiere) === 'critical' ? 'bg-red-100 text-red-800' :
                          getStockStatus(selectedMatiere) === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {getStockStatus(selectedMatiere) === 'critical' ? 'Critique' : 
                           getStockStatus(selectedMatiere) === 'warning' ? 'Alerte' : 'OK'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="border-t pt-4 flex gap-2 justify-end">
                    <button
                      onClick={() => {
                        handleEdit(selectedMatiere);
                        setSelectedMatiere(null);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Modifier
                    </button>
                    <button
                      onClick={() => setSelectedMatiere(null)}
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

export default MatieresPremieres;
