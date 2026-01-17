import React, { useState, useEffect } from 'react';
import { 
  Package, Truck, AlertTriangle, CheckCircle, Clock, Search, Scan, 
  ArrowRight, ArrowLeft, Plus, Filter, FileText, Calendar, Building2 
} from 'lucide-react';
import { soustraitantsService, ofService } from '../services/api';

interface Mouvement {
  id_mouvement_st: number;
  numero_mouvement: string;
  id_sous_traitant: number;
  raison_sociale: string;
  numero_of: string;
  type_mouvement: string;
  date_mouvement: string;
  date_retour_prevue: string;
  date_retour_reelle?: string;
  qr_code_sortie?: string;
  qr_code_retour?: string;
  numero_suivi_transporteur?: string;
  statut: string;
  quantite?: number;
}

const DashboardMagasinierSoustraitants: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'sorties' | 'retours' | 'historique'>('sorties');
  const [mouvements, setMouvements] = useState<Mouvement[]>([]);
  const [soustraitants, setSoustraitants] = useState<any[]>([]);
  const [ofs, setOfs] = useState<any[]>([]);
  const [alertes, setAlertes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal Sortie
  const [showModalSortie, setShowModalSortie] = useState(false);
  const [formSortie, setFormSortie] = useState({
    id_sous_traitant: '',
    id_of: '',
    qr_code_sortie: '',
    numero_suivi_transporteur: '',
    date_sortie: new Date().toISOString().split('T')[0],
    quantite: '',
    observations: ''
  });

  // Modal Retour
  const [showModalRetour, setShowModalRetour] = useState(false);
  const [formRetour, setFormRetour] = useState({
    id_mouvement: '',
    qr_code_retour: '',
    date_retour: new Date().toISOString().split('T')[0],
    quantite_retournee: '',
    quantite_conforme: '',
    quantite_non_conforme: '',
    observations: ''
  });

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Charger tous les mouvements via les sous-traitants
      const [soustraitantsRes, ofsRes, alertesRes] = await Promise.all([
        soustraitantsService.getSoustraitants({ actif: 'true' }),
        ofService.getOFs({ statut: 'PLANIFIE' }),
        soustraitantsService.getAlertesRetard()
      ]);

      setSoustraitants(soustraitantsRes.data.data);
      setOfs(ofsRes.data?.data || []);
      setAlertes(alertesRes.data.data);

      // Charger les mouvements pour chaque sous-traitant
      const mouvementsData: Mouvement[] = [];
      for (const st of soustraitantsRes.data.data) {
        try {
          const mouvRes = await soustraitantsService.getMouvements(st.id_sous_traitant, {
            statut: activeTab === 'retours' ? 'en_cours' : undefined
          });
          if (mouvRes.data.data) {
            mouvRes.data.data.forEach((m: any) => {
              mouvementsData.push({
                ...m,
                raison_sociale: st.raison_sociale
              });
            });
          }
        } catch (err) {
          console.error(`Erreur chargement mouvements pour ST ${st.id_sous_traitant}:`, err);
        }
      }

      // Filtrer selon l'onglet actif
      if (activeTab === 'sorties') {
        setMouvements(mouvementsData.filter(m => m.type_mouvement === 'sortie' && m.statut === 'en_cours'));
      } else if (activeTab === 'retours') {
        setMouvements(mouvementsData.filter(m => m.statut === 'en_cours'));
      } else {
        setMouvements(mouvementsData);
      }
    } catch (error) {
      console.error('Erreur chargement données:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnregistrerSortie = async () => {
    try {
      if (!formSortie.id_sous_traitant || !formSortie.id_of) {
        alert('Veuillez sélectionner un sous-traitant et un OF');
        return;
      }

      await soustraitantsService.enregistrerSortie(
        parseInt(formSortie.id_sous_traitant),
        {
          id_of: parseInt(formSortie.id_of),
          quantite: parseFloat(formSortie.quantite) || 0,
          date_sortie_prevue: formSortie.date_sortie,
          qr_code_sortie: formSortie.qr_code_sortie,
          numero_suivi_transporteur: formSortie.numero_suivi_transporteur,
          observations: formSortie.observations || `QR Sortie: ${formSortie.qr_code_sortie}, Suivi: ${formSortie.numero_suivi_transporteur}`
        }
      );

      alert('Sortie enregistrée avec succès !');
      setShowModalSortie(false);
      resetFormSortie();
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'Erreur lors de l\'enregistrement');
    }
  };

  const handleEnregistrerRetour = async () => {
    try {
      const mouvement = mouvements.find(m => m.id_mouvement_st.toString() === formRetour.id_mouvement);
      if (!mouvement) {
        alert('Mouvement non trouvé');
        return;
      }

      await soustraitantsService.enregistrerRetour(
        mouvement.id_sous_traitant,
        {
          id_mouvement: parseInt(formRetour.id_mouvement),
          quantite_retournee: parseFloat(formRetour.quantite_retournee) || 0,
          date_retour: formRetour.date_retour,
          qr_code_retour: formRetour.qr_code_retour,
          conforme: parseFloat(formRetour.quantite_conforme) > 0,
          observations: formRetour.observations || `QR Retour: ${formRetour.qr_code_retour}`
        }
      );

      alert('Retour enregistré avec succès !');
      setShowModalRetour(false);
      resetFormRetour();
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'Erreur lors de l\'enregistrement');
    }
  };

  const resetFormSortie = () => {
    setFormSortie({
      id_sous_traitant: '',
      id_of: '',
      qr_code_sortie: '',
      numero_suivi_transporteur: '',
      date_sortie: new Date().toISOString().split('T')[0],
      quantite: '',
      observations: ''
    });
  };

  const resetFormRetour = () => {
    setFormRetour({
      id_mouvement: '',
      qr_code_retour: '',
      date_retour: new Date().toISOString().split('T')[0],
      quantite_retournee: '',
      quantite_conforme: '',
      quantite_non_conforme: '',
      observations: ''
    });
  };

  const filteredMouvements = mouvements.filter(m => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      m.numero_mouvement.toLowerCase().includes(searchLower) ||
      m.raison_sociale.toLowerCase().includes(searchLower) ||
      m.numero_of?.toLowerCase().includes(searchLower) ||
      m.qr_code_sortie?.toLowerCase().includes(searchLower) ||
      m.qr_code_retour?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 ml-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 ml-64">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Dashboard Magasinier Sous-Traitants
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Gestion des transferts et retours vers/des sous-traitants
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  if (activeTab === 'sorties') {
                    setShowModalSortie(true);
                  } else if (activeTab === 'retours') {
                    setShowModalRetour(true);
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                {activeTab === 'sorties' ? 'Nouvelle Sortie' : activeTab === 'retours' ? 'Enregistrer Retour' : 'Nouveau'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Alertes Retards */}
      {alertes.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-orange-600 mr-2" />
              <h3 className="text-lg font-bold text-orange-800">
                {alertes.length} Retour(s) en retard
              </h3>
            </div>
            <div className="mt-2 space-y-1">
              {alertes.slice(0, 3).map((alerte: any) => (
                <div key={alerte.id_mouvement_st} className="text-sm text-orange-700">
                  {alerte.raison_sociale} - {alerte.numero_of} - Retard de{' '}
                  {Math.ceil((new Date().getTime() - new Date(alerte.date_retour_prevue).getTime()) / (1000 * 60 * 60 * 24))} jours
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('sorties')}
              className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === 'sorties'
                  ? 'border-blue-600 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <ArrowRight className="w-4 h-4" />
              <span className="font-medium">Sorties</span>
            </button>
            <button
              onClick={() => setActiveTab('retours')}
              className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === 'retours'
                  ? 'border-blue-600 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-medium">Retours</span>
            </button>
            <button
              onClick={() => setActiveTab('historique')}
              className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === 'historique'
                  ? 'border-blue-600 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span className="font-medium">Historique</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher par numéro mouvement, sous-traitant, OF, QR code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Liste des mouvements */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Numéro</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Sous-Traitant</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">OF</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">QR Code</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Num. Suivi</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Date Sortie</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Retour Prévu</th>
                  <th className="text-center py-3 px-4 font-semibold text-sm text-gray-700">Statut</th>
                  <th className="text-center py-3 px-4 font-semibold text-sm text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMouvements.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-8 text-gray-500">
                      Aucun mouvement trouvé
                    </td>
                  </tr>
                ) : (
                  filteredMouvements.map((mouvement) => (
                    <tr key={mouvement.id_mouvement_st} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{mouvement.numero_mouvement}</td>
                      <td className="py-3 px-4">{mouvement.raison_sociale}</td>
                      <td className="py-3 px-4">{mouvement.numero_of || '-'}</td>
                      <td className="py-3 px-4 font-mono text-xs">
                        {mouvement.qr_code_sortie || mouvement.qr_code_retour || '-'}
                      </td>
                      <td className="py-3 px-4 font-mono text-xs">
                        {mouvement.numero_suivi_transporteur || '-'}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {new Date(mouvement.date_mouvement).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {mouvement.date_retour_prevue ? (
                          new Date(mouvement.date_retour_prevue).toLocaleDateString('fr-FR')
                        ) : '-'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          mouvement.statut === 'en_cours' ? 'bg-yellow-100 text-yellow-800' :
                          mouvement.statut === 'retourne' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {mouvement.statut}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {activeTab === 'retours' && mouvement.statut === 'en_cours' && (
                          <button
                            onClick={() => {
                              setFormRetour({
                                ...formRetour,
                                id_mouvement: mouvement.id_mouvement_st.toString(),
                                qr_code_retour: mouvement.qr_code_sortie || ''
                              });
                              setShowModalRetour(true);
                            }}
                            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                          >
                            Enregistrer Retour
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Sortie */}
      {showModalSortie && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h3 className="text-xl font-bold text-gray-900">Enregistrer Sortie vers Sous-Traitant</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Sous-Traitant *</label>
                  <select
                    value={formSortie.id_sous_traitant}
                    onChange={(e) => setFormSortie({ ...formSortie, id_sous_traitant: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  >
                    <option value="">Sélectionner...</option>
                    {soustraitants.map(st => (
                      <option key={st.id_sous_traitant} value={st.id_sous_traitant}>
                        {st.raison_sociale}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Ordre de Fabrication *</label>
                  <select
                    value={formSortie.id_of}
                    onChange={(e) => setFormSortie({ ...formSortie, id_of: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  >
                    <option value="">Sélectionner...</option>
                    {ofs.map(of => (
                      <option key={of.id_of} value={of.id_of}>
                        {of.numero_of}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  QR Code / Numéro de Suivi (Scanner ou Saisir) *
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={formSortie.qr_code_sortie}
                    onChange={(e) => setFormSortie({ ...formSortie, qr_code_sortie: e.target.value })}
                    placeholder="Scannez ou saisissez le numéro de suivi"
                    className="flex-1 px-3 py-2 border rounded-lg"
                    autoFocus
                  />
                  <button className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
                    <Scan className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Numéro de Suivi Transporteur</label>
                <input
                  type="text"
                  value={formSortie.numero_suivi_transporteur}
                  onChange={(e) => setFormSortie({ ...formSortie, numero_suivi_transporteur: e.target.value })}
                  placeholder="Numéro de suivi du transporteur (optionnel)"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Date Sortie *</label>
                  <input
                    type="date"
                    value={formSortie.date_sortie}
                    onChange={(e) => setFormSortie({ ...formSortie, date_sortie: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Quantité</label>
                  <input
                    type="number"
                    value={formSortie.quantite}
                    onChange={(e) => setFormSortie({ ...formSortie, quantite: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Observations</label>
                <textarea
                  value={formSortie.observations}
                  onChange={(e) => setFormSortie({ ...formSortie, observations: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={3}
                />
              </div>
            </div>
            <div className="p-6 border-t bg-gray-50 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowModalSortie(false);
                  resetFormSortie();
                }}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
              >
                Annuler
              </button>
              <button
                onClick={handleEnregistrerSortie}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Enregistrer Sortie
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Retour */}
      {showModalRetour && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h3 className="text-xl font-bold text-gray-900">Enregistrer Retour depuis Sous-Traitant</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  QR Code / Numéro de Suivi Retour (Scanner ou Saisir) *
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={formRetour.qr_code_retour}
                    onChange={(e) => setFormRetour({ ...formRetour, qr_code_retour: e.target.value })}
                    placeholder="Scannez ou saisissez le numéro de suivi"
                    className="flex-1 px-3 py-2 border rounded-lg"
                    autoFocus
                  />
                  <button className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
                    <Scan className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Date Retour *</label>
                  <input
                    type="date"
                    value={formRetour.date_retour}
                    onChange={(e) => setFormRetour({ ...formRetour, date_retour: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Quantité Retournée *</label>
                  <input
                    type="number"
                    value={formRetour.quantite_retournee}
                    onChange={(e) => setFormRetour({ ...formRetour, quantite_retournee: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Quantité Conforme</label>
                  <input
                    type="number"
                    value={formRetour.quantite_conforme}
                    onChange={(e) => setFormRetour({ ...formRetour, quantite_conforme: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Quantité Non Conforme</label>
                  <input
                    type="number"
                    value={formRetour.quantite_non_conforme}
                    onChange={(e) => setFormRetour({ ...formRetour, quantite_non_conforme: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Observations</label>
                <textarea
                  value={formRetour.observations}
                  onChange={(e) => setFormRetour({ ...formRetour, observations: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={3}
                />
              </div>
            </div>
            <div className="p-6 border-t bg-gray-50 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowModalRetour(false);
                  resetFormRetour();
                }}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
              >
                Annuler
              </button>
              <button
                onClick={handleEnregistrerRetour}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Enregistrer Retour
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardMagasinierSoustraitants;
