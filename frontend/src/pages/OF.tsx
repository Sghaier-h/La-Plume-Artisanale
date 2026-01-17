import React, { useEffect, useState } from 'react';
import { ofService, articlesService, machinesService, commandesService } from '../services/api';
import { FileText, Plus, Edit, Trash2, Search, Eye, X, Play, Square, CheckCircle, Settings, Package, Calendar, AlertCircle, TrendingUp, Clock, User } from 'lucide-react';

interface LigneOF {
  id_operation?: number;
  id_machine?: number;
  designation_operation?: string;
  machine_designation?: string;
  temps_unitaire?: number;
  temps_preparation?: number;
  ordre?: number;
}

const OF: React.FC = () => {
  const [ofs, setOfs] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [machines, setMachines] = useState<any[]>([]);
  const [commandes, setCommandes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingOF, setEditingOF] = useState<any>(null);
  const [selectedOF, setSelectedOF] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ statut: '', article_id: '', commande_id: '' });

  const [formData, setFormData] = useState({
    id_commande: '',
    id_article: '',
    quantite_a_produire: '',
    date_debut_prevue: '',
    date_fin_prevue: '',
    priorite: 'normale',
    id_machine: '',
    observations: '',
    lignes_operations: [] as LigneOF[]
  });

  useEffect(() => {
    loadData();
  }, [filters, search]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ofsRes, articlesRes, machinesRes, cmdRes] = await Promise.all([
        ofService.getOFs({ ...filters, search }).catch(() => ({ data: { data: [] } })),
        articlesService.getArticles({ actif: 'true' }).catch(() => ({ data: { data: [] } })),
        machinesService.getMachines({ actif: 'true' }).catch(() => ({ data: { data: [] } })),
        commandesService.getCommandes({ statut: 'validee' }).catch(() => ({ data: { data: [] } }))
      ]);
      setOfs(ofsRes.data?.data || []);
      setArticles(articlesRes.data?.data || []);
      setMachines(machinesRes.data?.data || []);
      setCommandes(cmdRes.data?.data || []);
    } catch (error) {
      console.error('Erreur chargement OF:', error);
      setOfs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id_article || !formData.quantite_a_produire) {
      alert('Article et quantité requis');
      return;
    }
    try {
      if (editingOF) {
        await ofService.updateOF(editingOF.id_of, formData);
        alert('OF modifié avec succès');
      } else {
        await ofService.createOF(formData);
        alert('OF créé avec succès');
      }
      setShowForm(false);
      setEditingOF(null);
      resetForm();
      loadData();
    } catch (error: any) {
      console.error('Erreur sauvegarde OF:', error);
      alert(error.response?.data?.error?.message || 'Erreur lors de la sauvegarde');
    }
  };

  const handleAssignerMachine = async (id: number, id_machine: number, date_debut: string, date_fin: string) => {
    if (!date_debut || !date_fin) {
      alert('Dates de début et fin requises');
      return;
    }
    try {
      await ofService.assignerMachine(id, { id_machine, date_debut_prevue: date_debut, date_fin_prevue: date_fin });
      loadData();
      alert('Machine assignée avec succès');
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'Erreur lors de l\'assignation');
    }
  };

  const handleDemarrer = async (id: number) => {
    if (window.confirm('Démarrer cet ordre de fabrication ?')) {
      try {
        await ofService.demarrerOF(id);
        loadData();
        alert('OF démarré avec succès');
      } catch (error: any) {
        alert(error.response?.data?.error?.message || 'Erreur lors du démarrage');
      }
    }
  };

  const handleTerminer = async (id: number, quantite: string) => {
    if (!quantite || parseFloat(quantite) <= 0) {
      alert('Quantité produite invalide');
      return;
    }
    try {
      await ofService.terminerOF(id, { quantite_produite: parseFloat(quantite) });
      loadData();
      alert('OF terminé avec succès');
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'Erreur lors de la finalisation');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Supprimer cet ordre de fabrication ?')) {
      try {
        await ofService.deleteOF?.(id) || ofService.updateOF(id, { statut: 'annule' });
        loadData();
        alert('OF supprimé avec succès');
      } catch (error: any) {
        alert(error.response?.data?.error?.message || 'Erreur lors de la suppression');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      id_commande: '',
      id_article: '',
      quantite_a_produire: '',
      date_debut_prevue: '',
      date_fin_prevue: '',
      priorite: 'normale',
      id_machine: '',
      observations: '',
      lignes_operations: []
    });
  };

  const getStatutColor = (statut: string) => {
    const statutLower = statut?.toLowerCase() || '';
    const colors: { [key: string]: string } = {
      'planifie': 'bg-gray-100 text-gray-800',
      'attribue': 'bg-yellow-100 text-yellow-800',
      'en_cours': 'bg-blue-100 text-blue-800',
      'termine': 'bg-green-100 text-green-800',
      'arrete': 'bg-red-100 text-red-800',
      'annule': 'bg-orange-100 text-orange-800'
    };
    return colors[statutLower] || 'bg-gray-100 text-gray-800';
  };

  const calculerAvancement = (of: any) => {
    if (!of.quantite_a_produire || of.quantite_a_produire === 0) return 0;
    const produit = of.quantite_produite || 0;
    return Math.min(100, Math.round((produit / of.quantite_a_produire) * 100));
  };

  const filteredOFs = ofs.filter(of => {
    if (search && !of.numero_of?.toLowerCase().includes(search.toLowerCase()) && 
        !of.article_designation?.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (filters.statut && of.statut !== filters.statut) {
      return false;
    }
    if (filters.article_id && of.id_article?.toString() !== filters.article_id) {
      return false;
    }
    if (filters.commande_id && of.id_commande?.toString() !== filters.commande_id) {
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
              Ordres de Fabrication
            </h1>
            <p className="text-gray-600 mt-2">Gestion et suivi de la production</p>
          </div>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingOF(null);
              resetForm();
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nouvel OF
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
              <option value="planifie">Planifié</option>
              <option value="attribue">Attribué</option>
              <option value="en_cours">En cours</option>
              <option value="termine">Terminé</option>
              <option value="arrete">Arrêté</option>
            </select>
            <select
              value={filters.article_id}
              onChange={(e) => setFilters({ ...filters, article_id: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous les articles</option>
              {articles.map(a => (
                <option key={a.id_article} value={a.id_article}>{a.designation || a.code_article}</option>
              ))}
            </select>
            <select
              value={filters.commande_id}
              onChange={(e) => setFilters({ ...filters, commande_id: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Toutes les commandes</option>
              {commandes.map(c => (
                <option key={c.id_commande} value={c.id_commande}>{c.numero_commande}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Formulaire */}
        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-bold mb-4">
              {editingOF ? 'Modifier l\'OF' : 'Nouvel Ordre de Fabrication'}
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
                        id_article: cmd?.id_article?.toString() || formData.id_article
                      });
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Sélectionner une commande (optionnel)</option>
                    {commandes.filter(c => c.statut === 'validee' || c.statut === 'en_production').map(c => (
                      <option key={c.id_commande} value={c.id_commande}>
                        {c.numero_commande} - {c.client_nom}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Article *</label>
                  <select
                    required
                    value={formData.id_article}
                    onChange={(e) => setFormData({ ...formData, id_article: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Sélectionner un article</option>
                    {articles.map((article) => (
                      <option key={article.id_article} value={article.id_article}>
                        {article.code_article || article.ref_commercial} - {article.designation || article.designation_article}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantité à Produire *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.quantite_a_produire}
                    onChange={(e) => setFormData({ ...formData, quantite_a_produire: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Machine</label>
                  <select
                    value={formData.id_machine}
                    onChange={(e) => setFormData({ ...formData, id_machine: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Sélectionner une machine (optionnel)</option>
                    {machines.filter(m => m.statut === 'operationnel').map((machine) => (
                      <option key={machine.id_machine} value={machine.id_machine}>
                        {machine.numero_machine} - {machine.designation || machine.marque}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Début Prévue</label>
                  <input
                    type="date"
                    value={formData.date_debut_prevue}
                    onChange={(e) => {
                      const date = e.target.value;
                      setFormData({ ...formData, date_debut_prevue: date });
                      if (!formData.date_fin_prevue) {
                        const dateFin = new Date(date);
                        dateFin.setDate(dateFin.getDate() + 7);
                        setFormData({ ...formData, date_debut_prevue: date, date_fin_prevue: dateFin.toISOString().split('T')[0] });
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Fin Prévue</label>
                  <input
                    type="date"
                    value={formData.date_fin_prevue}
                    onChange={(e) => setFormData({ ...formData, date_fin_prevue: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priorité</label>
                  <select
                    value={formData.priorite}
                    onChange={(e) => setFormData({ ...formData, priorite: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="normale">Normale</option>
                    <option value="haute">Haute</option>
                    <option value="urgente">Urgente</option>
                  </select>
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
                  {editingOF ? 'Modifier' : 'Créer'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingOF(null);
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">N° OF</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Article</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantité</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avancement</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Machine</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dates</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOFs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    Aucun ordre de fabrication trouvé
                  </td>
                </tr>
              ) : (
                filteredOFs.map((of) => (
                  <tr key={of.id_of} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{of.numero_of}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium">{of.article_designation || of.code_article}</div>
                        {of.numero_commande && (
                          <div className="text-xs text-gray-500">Commande: {of.numero_commande}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-semibold">{of.quantite_produite || 0} / {of.quantite_a_produire}</div>
                        <div className="text-xs text-gray-500">Reste: {Math.max(0, (of.quantite_a_produire || 0) - (of.quantite_produite || 0))}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${calculerAvancement(of)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{calculerAvancement(of)}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {of.machine_designation || of.numero_machine || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div>
                        {of.date_debut_prevue && (
                          <div>Début: {new Date(of.date_debut_prevue).toLocaleDateString()}</div>
                        )}
                        {of.date_fin_prevue && (
                          <div>Fin: {new Date(of.date_fin_prevue).toLocaleDateString()}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatutColor(of.statut)}`}>
                        {of.statut}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button 
                          onClick={async () => {
                            try {
                              const result = await ofService.getOF(of.id_of);
                              if (result.data?.data) {
                                setSelectedOF(result.data.data);
                              }
                            } catch (error: any) {
                              console.error('Erreur chargement OF:', error);
                              setSelectedOF(of);
                            }
                          }}
                          className="text-blue-600 hover:text-blue-700"
                          title="Consulter"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {of.statut === 'planifie' && (
                          <button 
                            onClick={() => handleDemarrer(of.id_of)}
                            className="text-green-600 hover:text-green-700"
                            title="Démarrer"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                        )}
                        {of.statut === 'en_cours' && (
                          <button 
                            onClick={() => {
                              const qte = prompt(`Quantité produite ? (Max: ${of.quantite_a_produire})`);
                              if (qte) handleTerminer(of.id_of, qte);
                            }}
                            className="text-orange-600 hover:text-orange-700"
                            title="Terminer"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button 
                          onClick={() => {
                            handleEdit(of);
                          }}
                          className="text-gray-600 hover:text-gray-700"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {of.statut === 'planifie' && (
                          <button 
                            onClick={() => handleDelete(of.id_of)}
                            className="text-red-600 hover:text-red-700"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Modal de consultation */}
        {selectedOF && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <FileText className="w-6 h-6 text-blue-600" />
                  OF {selectedOF.numero_of}
                </h2>
                <button
                  onClick={() => setSelectedOF(null)}
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
                      <label className="text-sm font-medium text-gray-500">Article</label>
                      <p className="text-gray-900 font-semibold">{selectedOF.article_designation || selectedOF.code_article}</p>
                    </div>
                    {selectedOF.numero_commande && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Commande</label>
                        <p className="text-gray-900">{selectedOF.numero_commande}</p>
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium text-gray-500">Quantité</label>
                      <p className="text-gray-900 font-semibold">
                        {selectedOF.quantite_produite || 0} / {selectedOF.quantite_a_produire}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Avancement</label>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-blue-600 h-3 rounded-full transition-all"
                            style={{ width: `${calculerAvancement(selectedOF)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{calculerAvancement(selectedOF)}%</span>
                      </div>
                    </div>
                    {selectedOF.machine_designation && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Machine</label>
                        <p className="text-gray-900">{selectedOF.machine_designation}</p>
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium text-gray-500">Statut</label>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatutColor(selectedOF.statut)}`}>
                        {selectedOF.statut}
                      </span>
                    </div>
                    {selectedOF.priorite && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Priorité</label>
                        <p className="text-gray-900 capitalize">{selectedOF.priorite}</p>
                      </div>
                    )}
                    {selectedOF.date_debut_prevue && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                          <label className="text-sm font-medium text-gray-500">Date Début Prévue</label>
                          <p className="text-gray-900">{new Date(selectedOF.date_debut_prevue).toLocaleDateString()}</p>
                        </div>
                      </div>
                    )}
                    {selectedOF.date_fin_prevue && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                          <label className="text-sm font-medium text-gray-500">Date Fin Prévue</label>
                          <p className="text-gray-900">{new Date(selectedOF.date_fin_prevue).toLocaleDateString()}</p>
                        </div>
                      </div>
                    )}
                    {selectedOF.date_debut_reelle && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <div>
                          <label className="text-sm font-medium text-gray-500">Date Début Réelle</label>
                          <p className="text-gray-900">{new Date(selectedOF.date_debut_reelle).toLocaleDateString()}</p>
                        </div>
                      </div>
                    )}
                    {selectedOF.date_fin_reelle && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-gray-400" />
                        <div>
                          <label className="text-sm font-medium text-gray-500">Date Fin Réelle</label>
                          <p className="text-gray-900">{new Date(selectedOF.date_fin_reelle).toLocaleDateString()}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Opérations */}
                {selectedOF.operations && selectedOF.operations.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Settings className="w-5 h-5 text-blue-600" />
                      Opérations
                    </h3>
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Ordre</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Opération</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Machine</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Temps Unitaire</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Temps Préparation</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {selectedOF.operations.map((op: any, index: number) => (
                            <tr key={index}>
                              <td className="px-4 py-2">{op.ordre || index + 1}</td>
                              <td className="px-4 py-2">{op.designation_operation || op.libelle}</td>
                              <td className="px-4 py-2">{op.machine_designation || '-'}</td>
                              <td className="px-4 py-2">{op.temps_unitaire || 0} min</td>
                              <td className="px-4 py-2">{op.temps_preparation || 0} min</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="border-t pt-4 flex gap-2 justify-end">
                  {selectedOF.statut === 'planifie' && (
                    <button
                      onClick={() => {
                        const idMachine = prompt('ID Machine ?');
                        const dateDebut = prompt('Date début (YYYY-MM-DD) ?');
                        const dateFin = prompt('Date fin (YYYY-MM-DD) ?');
                        if (idMachine && dateDebut && dateFin) {
                          handleAssignerMachine(selectedOF.id_of, parseInt(idMachine), dateDebut, dateFin);
                          setSelectedOF(null);
                        }
                      }}
                      className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 flex items-center gap-2"
                    >
                      <Settings className="w-4 h-4" />
                      Assigner Machine
                    </button>
                  )}
                  {selectedOF.statut === 'planifie' && (
                    <button
                      onClick={() => {
                        handleDemarrer(selectedOF.id_of);
                        setSelectedOF(null);
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                    >
                      <Play className="w-4 h-4" />
                      Démarrer
                    </button>
                  )}
                  {selectedOF.statut === 'en_cours' && (
                    <button
                      onClick={() => {
                        const qte = prompt(`Quantité produite ? (Max: ${selectedOF.quantite_a_produire})`);
                        if (qte) {
                          handleTerminer(selectedOF.id_of, qte);
                          setSelectedOF(null);
                        }
                      }}
                      className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Terminer
                    </button>
                  )}
                  <button
                    onClick={async () => {
                      try {
                        const result = await ofService.getOF(selectedOF.id_of);
                        if (result.data?.data) {
                          const ofData = result.data.data;
                          setFormData({
                            id_commande: ofData.id_commande?.toString() || '',
                            id_article: ofData.id_article?.toString() || '',
                            quantite_a_produire: ofData.quantite_a_produire?.toString() || '',
                            date_debut_prevue: ofData.date_debut_prevue || '',
                            date_fin_prevue: ofData.date_fin_prevue || '',
                            priorite: ofData.priorite || 'normale',
                            id_machine: ofData.id_machine?.toString() || '',
                            observations: ofData.observations || '',
                            lignes_operations: ofData.operations || []
                          });
                          setEditingOF(selectedOF);
                          setSelectedOF(null);
                          setShowForm(true);
                        }
                      } catch (error: any) {
                        console.error('Erreur chargement OF:', error);
                        alert(error.response?.data?.error?.message || 'Erreur lors du chargement');
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Modifier
                  </button>
                  <button
                    onClick={() => setSelectedOF(null)}
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

export default OF;
