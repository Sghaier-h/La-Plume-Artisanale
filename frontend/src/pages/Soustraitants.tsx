import React, { useEffect, useState } from 'react';
import { soustraitantsService } from '../services/api';

const Soustraitants: React.FC = () => {
  const [soustraitants, setSoustraitants] = useState<any[]>([]);
  const [alertes, setAlertes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingST, setEditingST] = useState<any>(null);
  const [selectedST, setSelectedST] = useState<any>(null);
  const [search, setSearch] = useState('');

  const [formData, setFormData] = useState({
    code_sous_traitant: '',
    raison_sociale: '',
    adresse: '',
    telephone: '',
    email: '',
    contact_principal: '',
    specialite: '',
    capacite_production: '',
    delai_moyen_jours: '12',
    taux_qualite: '',
    actif: true
  });

  useEffect(() => {
    loadData();
    loadAlertes();
  }, [search]);

  const loadData = async () => {
    try {
      const res = await soustraitantsService.getSoustraitants({ search });
      setSoustraitants(res.data.data);
    } catch (error) {
      console.error('Erreur chargement sous-traitants:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAlertes = async () => {
    try {
      const res = await soustraitantsService.getAlertesRetard();
      setAlertes(res.data.data);
    } catch (error) {
      console.error('Erreur chargement alertes:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingST) {
        await soustraitantsService.updateSoustraitant(editingST.id_sous_traitant, formData);
      } else {
        await soustraitantsService.createSoustraitant(formData);
      }
      setShowForm(false);
      setEditingST(null);
      resetForm();
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'Erreur');
    }
  };

  const handleEdit = (st: any) => {
    setEditingST(st);
    setFormData({
      code_sous_traitant: st.code_sous_traitant,
      raison_sociale: st.raison_sociale,
      adresse: st.adresse || '',
      telephone: st.telephone || '',
      email: st.email || '',
      contact_principal: st.contact_principal || '',
      specialite: st.specialite || '',
      capacite_production: st.capacite_production || '',
      delai_moyen_jours: st.delai_moyen_jours || '12',
      taux_qualite: st.taux_qualite || '',
      actif: st.actif
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      code_sous_traitant: '',
      raison_sociale: '',
      adresse: '',
      telephone: '',
      email: '',
      contact_principal: '',
      specialite: '',
      capacite_production: '',
      delai_moyen_jours: '12',
      taux_qualite: '',
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
          <h1 className="text-3xl font-bold text-gray-800">🤝 Sous-traitants</h1>
          <button
            onClick={() => { setShowForm(true); setEditingST(null); resetForm(); }}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            + Nouveau Sous-traitant
          </button>
        </div>

        {/* Alertes retards */}
        {alertes.length > 0 && (
          <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-6 rounded">
            <h2 className="text-lg font-bold text-orange-800 mb-2">⚠️ Alertes Retards ({alertes.length})</h2>
            <div className="space-y-2">
              {alertes.slice(0, 5).map((alerte: any) => (
                <div key={alerte.id_mouvement_st} className="text-sm text-orange-700">
                  {alerte.raison_sociale} - {alerte.numero_of} - Retard de {Math.ceil((new Date().getTime() - new Date(alerte.date_retour_prevue).getTime()) / (1000 * 60 * 60 * 24))} jours
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recherche */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <input
            type="text"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border rounded"
          />
        </div>

        {/* Formulaire */}
        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-bold mb-4">{editingST ? 'Modifier' : 'Nouveau'} Sous-traitant</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.code_sous_traitant}
                    onChange={(e) => setFormData({ ...formData, code_sous_traitant: e.target.value })}
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
                <div>
                  <label className="block text-sm font-medium mb-1">Spécialité</label>
                  <input
                    type="text"
                    value={formData.specialite}
                    onChange={(e) => setFormData({ ...formData, specialite: e.target.value })}
                    className="w-full px-4 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Délai Moyen (jours)</label>
                  <input
                    type="number"
                    value={formData.delai_moyen_jours}
                    onChange={(e) => setFormData({ ...formData, delai_moyen_jours: e.target.value })}
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
              </div>
              <div className="flex gap-4">
                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
                  {editingST ? 'Modifier' : 'Créer'}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setEditingST(null); resetForm(); }} className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400">
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Raison Sociale</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Spécialité</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Délai Moyen</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Téléphone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {soustraitants.map((st) => (
                <tr key={st.id_sous_traitant}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{st.code_sous_traitant}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{st.raison_sociale}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{st.specialite || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{st.delai_moyen_jours} jours</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{st.telephone || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded ${st.actif ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {st.actif ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button onClick={() => setSelectedST(st)} className="text-blue-600 hover:text-blue-900 mr-3">Voir</button>
                    <button onClick={() => handleEdit(st)} className="text-blue-600 hover:text-blue-900">Modifier</button>
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

export default Soustraitants;
