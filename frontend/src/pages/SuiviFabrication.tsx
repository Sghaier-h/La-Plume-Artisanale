import React, { useState, useEffect } from 'react';
import { suiviFabricationService, ofService, machinesService } from '../services/api';
import { TrendingUp, Clock, CheckCircle, XCircle, AlertTriangle, Search, Filter, Eye, X, Plus, Edit, Play, Square, Calendar, Package, Settings, User, Percent, BarChart3 } from 'lucide-react';

interface SuiviFabrication {
  id_suivi: number;
  numero_suivi: string;
  numero_of: string;
  machine_designation: string;
  operateur_nom: string;
  operateur_prenom: string;
  quantite_produite: number;
  quantite_bonne: number;
  quantite_rebut: number;
  statut: string;
  date_debut: string;
  date_fin: string | null;
  temps_production: number;
  rendement: number;
}

const SuiviFabrication: React.FC = () => {
  const [suivis, setSuivis] = useState<SuiviFabrication[]>([]);
  const [ofs, setOfs] = useState<any[]>([]);
  const [machines, setMachines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ statut: '', ofId: '' });
  const [showForm, setShowForm] = useState(false);
  const [editingSuivi, setEditingSuivi] = useState<any>(null);
  const [selectedSuivi, setSelectedSuivi] = useState<any>(null);

  const [formData, setFormData] = useState({
    id_of: '',
    id_machine: '',
    id_operateur: '',
    date_debut: new Date().toISOString().split('T')[0],
    quantite_produite: '',
    quantite_bonne: '',
    quantite_rebut: '',
    quantite_2eme_choix: '',
    temps_production: '',
    observations: ''
  });

  useEffect(() => {
    loadData();
  }, [filters, search]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [suivisRes, ofsRes, machinesRes] = await Promise.all([
        suiviFabricationService.getSuivisFabrication({ ...filters, search }).catch(() => ({ data: { data: { suivis: [] } } })),
        ofService.getOFs({ statut: 'en_cours' }).catch(() => ({ data: { data: [] } })),
        machinesService.getMachines({ actif: 'true' }).catch(() => ({ data: { data: [] } }))
      ]);
      setSuivis(suivisRes.data?.data?.suivis || []);
      setOfs(ofsRes.data?.data || []);
      setMachines(machinesRes.data?.data || []);
    } catch (err: any) {
      console.error('Erreur chargement suivis:', err);
      setError(err.response?.data?.error?.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id_of || !formData.id_machine) {
      alert('OF et Machine requis');
      return;
    }
    try {
      if (editingSuivi) {
        await suiviFabricationService.updateSuiviFabrication(editingSuivi.id_suivi, formData);
        alert('Suivi modifié avec succès');
      } else {
        await suiviFabricationService.createSuiviFabrication(formData);
        alert('Suivi créé avec succès');
      }
      setShowForm(false);
      setEditingSuivi(null);
      resetForm();
      loadData();
    } catch (error: any) {
      console.error('Erreur sauvegarde suivi:', error);
      alert(error.response?.data?.error?.message || 'Erreur lors de la sauvegarde');
    }
  };

  const handleEdit = async (suivi: any) => {
    try {
      const result = await suiviFabricationService.getSuiviFabrication(suivi.id_suivi);
      if (result.data?.data) {
        const suiviData = result.data.data;
        setFormData({
          id_of: suiviData.id_of?.toString() || '',
          id_machine: suiviData.id_machine?.toString() || '',
          id_operateur: suiviData.id_operateur?.toString() || '',
          date_debut: suiviData.date_debut ? new Date(suiviData.date_debut).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          quantite_produite: suiviData.quantite_produite?.toString() || '',
          quantite_bonne: suiviData.quantite_bonne?.toString() || '',
          quantite_rebut: suiviData.quantite_rebut?.toString() || '',
          quantite_2eme_choix: suiviData.quantite_2eme_choix?.toString() || '',
          temps_production: suiviData.temps_production?.toString() || '',
          observations: suiviData.observations || ''
        });
        setEditingSuivi(suivi);
        setShowForm(true);
      }
    } catch (error: any) {
      console.error('Erreur chargement suivi:', error);
      alert(error.response?.data?.error?.message || 'Erreur lors du chargement');
    }
  };

  const resetForm = () => {
    setFormData({
      id_of: '',
      id_machine: '',
      id_operateur: '',
      date_debut: new Date().toISOString().split('T')[0],
      quantite_produite: '',
      quantite_bonne: '',
      quantite_rebut: '',
      quantite_2eme_choix: '',
      temps_production: '',
      observations: ''
    });
  };

  const calculerRendement = (bonne: number, totale: number) => {
    if (!totale || totale === 0) return 0;
    return Math.round((bonne / totale) * 100 * 100) / 100;
  };

  const getStatutBadge = (statut: string) => {
    const badges: { [key: string]: { bg: string; text: string; icon: any } } = {
      'en_cours': { bg: 'bg-blue-100', text: 'text-blue-800', icon: Clock },
      'termine': { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      'arrete': { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
      'en_attente': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: AlertTriangle }
    };
    const badge = badges[statut] || badges['en_attente'];
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        <Icon className="w-3 h-3 mr-1" />
        {statut.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  const filteredSuivis = suivis.filter(s => {
    if (search && !s.numero_suivi?.toLowerCase().includes(search.toLowerCase()) && 
        !s.numero_of?.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (filters.statut && s.statut !== filters.statut) {
      return false;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="ml-64 p-6 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 ml-64 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              <TrendingUp className="w-8 h-8 text-blue-600" />
              Suivi de Fabrication
            </h1>
            <p className="text-gray-600 mt-2">Suivi en temps réel de la production</p>
          </div>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingSuivi(null);
              resetForm();
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nouveau Suivi
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Filtres */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-500" />
            <h3 className="font-semibold">Filtres</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher par N° Suivi ou OF..."
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
              <option value="en_cours">En cours</option>
              <option value="termine">Terminé</option>
              <option value="arrete">Arrêté</option>
              <option value="en_attente">En attente</option>
            </select>
            <select
              value={filters.ofId}
              onChange={(e) => setFilters({ ...filters, ofId: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous les OF</option>
              {ofs.map(of => (
                <option key={of.id_of} value={of.id_of}>{of.numero_of}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-500">Total Suivis</div>
            <div className="text-2xl font-bold text-gray-800">{filteredSuivis.length}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-500">En Cours</div>
            <div className="text-2xl font-bold text-blue-600">
              {filteredSuivis.filter(s => s.statut === 'en_cours').length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-500">Quantité Totale Produite</div>
            <div className="text-2xl font-bold text-green-600">
              {filteredSuivis.reduce((sum, s) => sum + (s.quantite_produite || 0), 0).toFixed(0)}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-500">Rendement Moyen</div>
            <div className="text-2xl font-bold text-purple-600">
              {filteredSuivis.length > 0 
                ? (filteredSuivis.reduce((sum, s) => {
                    const rendement = calculerRendement(s.quantite_bonne || 0, s.quantite_produite || 0);
                    return sum + rendement;
                  }, 0) / filteredSuivis.length).toFixed(1)
                : '0'}%
            </div>
          </div>
        </div>

        {/* Formulaire */}
        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-bold mb-4">
              {editingSuivi ? 'Modifier le Suivi' : 'Nouveau Suivi de Fabrication'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ordre de Fabrication *</label>
                  <select
                    required
                    value={formData.id_of}
                    onChange={(e) => setFormData({ ...formData, id_of: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Sélectionner un OF</option>
                    {ofs.filter(of => of.statut === 'en_cours' || of.statut === 'attribue').map(of => (
                      <option key={of.id_of} value={of.id_of}>
                        {of.numero_of} - {of.article_designation || of.code_article}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Machine *</label>
                  <select
                    required
                    value={formData.id_machine}
                    onChange={(e) => setFormData({ ...formData, id_machine: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Sélectionner une machine</option>
                    {machines.filter(m => m.statut === 'operationnel').map(machine => (
                      <option key={machine.id_machine} value={machine.id_machine}>
                        {machine.numero_machine} - {machine.designation || machine.marque}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Début</label>
                  <input
                    type="date"
                    value={formData.date_debut}
                    onChange={(e) => setFormData({ ...formData, date_debut: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantité Produite</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.quantite_produite}
                    onChange={(e) => setFormData({ ...formData, quantite_produite: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantité Bonne</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.quantite_bonne}
                    onChange={(e) => setFormData({ ...formData, quantite_bonne: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantité Rebut</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.quantite_rebut}
                    onChange={(e) => setFormData({ ...formData, quantite_rebut: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantité 2ème Choix</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.quantite_2eme_choix}
                    onChange={(e) => setFormData({ ...formData, quantite_2eme_choix: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Temps Production (min)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.temps_production}
                    onChange={(e) => setFormData({ ...formData, temps_production: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Observations</label>
                  <textarea
                    value={formData.observations}
                    onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Notes et observations..."
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingSuivi ? 'Modifier' : 'Créer'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingSuivi(null);
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
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">N° Suivi</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">N° OF</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Machine</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Opérateur</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qté Produite</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qté Bonne</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rebut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rendement</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSuivis.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-6 py-8 text-center text-gray-500">
                      Aucun suivi de fabrication trouvé
                    </td>
                  </tr>
                ) : (
                  filteredSuivis.map((suivi) => {
                    const rendement = calculerRendement(suivi.quantite_bonne || 0, suivi.quantite_produite || 0);
                    return (
                      <tr key={suivi.id_suivi} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{suivi.numero_suivi}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{suivi.numero_of}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{suivi.machine_designation}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {suivi.operateur_nom} {suivi.operateur_prenom}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{suivi.quantite_produite || 0}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                          {suivi.quantite_bonne || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                          {suivi.quantite_rebut || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`font-medium ${rendement >= 90 ? 'text-green-600' : rendement >= 80 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {rendement.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatutBadge(suivi.statut)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-2">
                            <button 
                              onClick={async () => {
                                try {
                                  const result = await suiviFabricationService.getSuiviFabrication(suivi.id_suivi);
                                  if (result.data?.data) {
                                    setSelectedSuivi(result.data.data);
                                  }
                                } catch (error: any) {
                                  console.error('Erreur chargement suivi:', error);
                                  setSelectedSuivi(suivi);
                                }
                              }}
                              className="text-blue-600 hover:text-blue-700"
                              title="Consulter"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleEdit(suivi)}
                              className="text-gray-600 hover:text-gray-700"
                              title="Modifier"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal de consultation */}
        {selectedSuivi && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                  Suivi {selectedSuivi.numero_suivi}
                </h2>
                <button
                  onClick={() => setSelectedSuivi(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Informations générales */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Package className="w-5 h-5 text-blue-600" />
                    Informations Générales
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">N° Suivi</label>
                      <p className="text-gray-900 font-semibold">{selectedSuivi.numero_suivi}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">N° OF</label>
                      <p className="text-gray-900 font-semibold">{selectedSuivi.numero_of}</p>
                    </div>
                    {selectedSuivi.article_designation && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Article</label>
                        <p className="text-gray-900">{selectedSuivi.article_designation}</p>
                      </div>
                    )}
                    {selectedSuivi.machine_designation && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Machine</label>
                        <p className="text-gray-900">{selectedSuivi.machine_designation}</p>
                      </div>
                    )}
                    {(selectedSuivi.operateur_nom || selectedSuivi.operateur_prenom) && (
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <div>
                          <label className="text-sm font-medium text-gray-500">Opérateur</label>
                          <p className="text-gray-900">
                            {selectedSuivi.operateur_nom} {selectedSuivi.operateur_prenom}
                          </p>
                        </div>
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium text-gray-500">Statut</label>
                      <div className="mt-1">
                        {getStatutBadge(selectedSuivi.statut)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Production */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    Production
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Quantité Produite</label>
                      <p className="text-gray-900 font-semibold text-lg">{selectedSuivi.quantite_produite || 0}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Quantité Bonne</label>
                      <p className="text-gray-900 font-semibold text-lg text-green-600">{selectedSuivi.quantite_bonne || 0}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Quantité Rebut</label>
                      <p className="text-gray-900 font-semibold text-lg text-red-600">{selectedSuivi.quantite_rebut || 0}</p>
                    </div>
                    {(selectedSuivi.quantite_2eme_choix || 0) > 0 && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Quantité 2ème Choix</label>
                        <p className="text-gray-900 font-semibold text-lg text-yellow-600">{selectedSuivi.quantite_2eme_choix || 0}</p>
                      </div>
                    )}
                    <div className="col-span-2">
                      <label className="text-sm font-medium text-gray-500">Rendement</label>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 bg-gray-200 rounded-full h-3">
                          <div 
                            className={`h-3 rounded-full transition-all ${
                              calculerRendement(selectedSuivi.quantite_bonne || 0, selectedSuivi.quantite_produite || 0) >= 90 
                                ? 'bg-green-600' 
                                : calculerRendement(selectedSuivi.quantite_bonne || 0, selectedSuivi.quantite_produite || 0) >= 80
                                ? 'bg-yellow-600'
                                : 'bg-red-600'
                            }`}
                            style={{ width: `${Math.min(100, calculerRendement(selectedSuivi.quantite_bonne || 0, selectedSuivi.quantite_produite || 0))}%` }}
                          ></div>
                        </div>
                        <span className={`text-sm font-medium ${
                          calculerRendement(selectedSuivi.quantite_bonne || 0, selectedSuivi.quantite_produite || 0) >= 90 
                            ? 'text-green-600' 
                            : calculerRendement(selectedSuivi.quantite_bonne || 0, selectedSuivi.quantite_produite || 0) >= 80
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }`}>
                          {calculerRendement(selectedSuivi.quantite_bonne || 0, selectedSuivi.quantite_produite || 0).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Temps et dates */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    Temps et Dates
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedSuivi.date_debut && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                          <label className="text-sm font-medium text-gray-500">Date Début</label>
                          <p className="text-gray-900">{new Date(selectedSuivi.date_debut).toLocaleString()}</p>
                        </div>
                      </div>
                    )}
                    {selectedSuivi.date_fin && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-gray-400" />
                        <div>
                          <label className="text-sm font-medium text-gray-500">Date Fin</label>
                          <p className="text-gray-900">{new Date(selectedSuivi.date_fin).toLocaleString()}</p>
                        </div>
                      </div>
                    )}
                    {selectedSuivi.temps_production && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Temps Production</label>
                        <p className="text-gray-900">{selectedSuivi.temps_production} minutes</p>
                      </div>
                    )}
                    {selectedSuivi.vitesse_moyenne && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Vitesse Moyenne</label>
                        <p className="text-gray-900">{selectedSuivi.vitesse_moyenne}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Observations */}
                {selectedSuivi.observations && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-blue-600" />
                      Observations
                    </h3>
                    <p className="text-gray-900 bg-gray-50 p-4 rounded-lg">{selectedSuivi.observations}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="border-t pt-4 flex gap-2 justify-end">
                  <button
                    onClick={() => {
                      handleEdit(selectedSuivi);
                      setSelectedSuivi(null);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Modifier
                  </button>
                  <button
                    onClick={() => setSelectedSuivi(null)}
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

export default SuiviFabrication;
