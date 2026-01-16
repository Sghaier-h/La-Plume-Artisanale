import React, { useEffect, useState } from 'react';
import { ofService, articlesService, machinesService } from '../services/api';

const OF: React.FC = () => {
  const [ofs, setOfs] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [machines, setMachines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedOF, setSelectedOF] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ statut: '', article_id: '' });

  const [formData, setFormData] = useState({
    id_article: '',
    quantite_a_produire: '',
    date_debut_prevue: '',
    date_fin_prevue: '',
    priorite: 'normale',
    observations: ''
  });

  useEffect(() => {
    loadData();
  }, [filters, search]);

  const loadData = async () => {
    try {
      const [ofsRes, articlesRes, machinesRes] = await Promise.all([
        ofService.getOFs({ ...filters, search }),
        articlesService.getArticles({ actif: 'true' }),
        machinesService.getMachines({ actif: 'true', statut: 'operationnel' })
      ]);
      setOfs(ofsRes.data.data);
      setArticles(articlesRes.data.data);
      setMachines(machinesRes.data.data);
    } catch (error) {
      console.error('Erreur chargement OF:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await ofService.createOF(formData);
      setShowForm(false);
      resetForm();
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'Erreur');
    }
  };

  const handleAssignerMachine = async (id: number, id_machine: number, date_debut: string, date_fin: string) => {
    try {
      await ofService.assignerMachine(id, { id_machine, date_debut_prevue: date_debut, date_fin_prevue: date_fin });
      loadData();
      alert('Machine assignée avec succès');
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'Erreur');
    }
  };

  const handleDemarrer = async (id: number) => {
    try {
      await ofService.demarrerOF(id);
      loadData();
    } catch (error) {
      alert('Erreur');
    }
  };

  const handleTerminer = async (id: number, quantite: string) => {
    try {
      await ofService.terminerOF(id, { quantite_produite: quantite });
      loadData();
    } catch (error) {
      alert('Erreur');
    }
  };

  const resetForm = () => {
    setFormData({
      id_article: '',
      quantite_a_produire: '',
      date_debut_prevue: '',
      date_fin_prevue: '',
      priorite: 'normale',
      observations: ''
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
          <h1 className="text-3xl font-bold text-gray-800">📋 Ordres de Fabrication</h1>
          <button
            onClick={() => { setShowForm(true); resetForm(); }}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            + Nouvel OF
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
              <option value="planifie">Planifié</option>
              <option value="attribue">Attribué</option>
              <option value="en_cours">En cours</option>
              <option value="termine">Terminé</option>
            </select>
          </div>
        </div>

        {/* Formulaire */}
        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-bold mb-4">Nouvel OF</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Article *</label>
                  <select
                    required
                    value={formData.id_article}
                    onChange={(e) => setFormData({ ...formData, id_article: e.target.value })}
                    className="w-full px-4 py-2 border rounded"
                  >
                    <option value="">Sélectionner...</option>
                    {articles.map((article) => (
                      <option key={article.id_article} value={article.id_article}>{article.code_article} - {article.designation}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Quantité à Produire *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.quantite_a_produire}
                    onChange={(e) => setFormData({ ...formData, quantite_a_produire: e.target.value })}
                    className="w-full px-4 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date Début Prévue</label>
                  <input
                    type="date"
                    value={formData.date_debut_prevue}
                    onChange={(e) => setFormData({ ...formData, date_debut_prevue: e.target.value })}
                    className="w-full px-4 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date Fin Prévue</label>
                  <input
                    type="date"
                    value={formData.date_fin_prevue}
                    onChange={(e) => setFormData({ ...formData, date_fin_prevue: e.target.value })}
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
              <div className="flex gap-4">
                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
                  Créer
                </button>
                <button type="button" onClick={() => { setShowForm(false); resetForm(); }} className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400">
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">N° OF</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Article</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantité</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date Création</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ofs.map((of) => (
                <tr key={of.id_of}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{of.numero_of}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{of.article_designation || of.code_article}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{of.quantite_a_produire} / {of.quantite_produite || 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded ${
                      of.statut === 'termine' ? 'bg-green-100 text-green-800' :
                      of.statut === 'en_cours' ? 'bg-blue-100 text-blue-800' :
                      of.statut === 'attribue' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {of.statut}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(of.date_creation_of).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button onClick={() => setSelectedOF(of)} className="text-blue-600 hover:text-blue-900 mr-3">Voir</button>
                    {of.statut === 'planifie' && (
                      <button onClick={() => handleDemarrer(of.id_of)} className="text-green-600 hover:text-green-900 mr-3">Démarrer</button>
                    )}
                    {of.statut === 'en_cours' && (
                      <button onClick={() => {
                        const qte = prompt('Quantité produite ?');
                        if (qte) handleTerminer(of.id_of, qte);
                      }} className="text-orange-600 hover:text-orange-900">Terminer</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </div>
      </div>
    </div>
  );
};

export default OF;
