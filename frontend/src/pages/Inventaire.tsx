import React, { useState, useEffect } from 'react';
import { ClipboardList, Plus, Search, Edit, CheckCircle, XCircle, List, Grid, Package } from 'lucide-react';

interface Inventaire {
  id_inventaire?: number;
  numero_inventaire: string;
  id_entrepot?: number;
  nom_entrepot?: string;
  date_inventaire: string;
  date_debut?: string;
  date_fin?: string;
  statut: 'BROUILLON' | 'EN_COURS' | 'TERMINE' | 'VALIDE' | 'ANNULE';
  type_inventaire: 'COMPLET' | 'PARTIEL' | 'CYCLIQUE' | 'ALTERNATIF';
  valeur_theorique?: number;
  valeur_reelle?: number;
  ecart_valeur?: number;
  motif?: string;
  notes?: string;
}

const Inventaire: React.FC = () => {
  const [inventaires, setInventaires] = useState<Inventaire[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingInventaire, setEditingInventaire] = useState<Inventaire | null>(null);
  const [affichageMode, setAffichageMode] = useState<'ligne' | 'catalogue'>('ligne');

  const [formData, setFormData] = useState<Inventaire>({
    numero_inventaire: '',
    id_entrepot: undefined,
    date_inventaire: new Date().toISOString().split('T')[0],
    date_debut: undefined,
    date_fin: undefined,
    statut: 'BROUILLON',
    type_inventaire: 'COMPLET',
    valeur_theorique: 0,
    valeur_reelle: 0,
    ecart_valeur: 0,
    motif: '',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // TODO: Remplacer par l'API réelle
      const mockInventaires: Inventaire[] = [
        {
          id_inventaire: 1,
          numero_inventaire: 'INV-2024-001',
          id_entrepot: 1,
          nom_entrepot: 'Entrepôt Principal',
          date_inventaire: '2024-01-15',
          date_debut: '2024-01-15',
          date_fin: '2024-01-16',
          statut: 'TERMINE',
          type_inventaire: 'COMPLET',
          valeur_theorique: 125000.50,
          valeur_reelle: 124850.25,
          ecart_valeur: -150.25,
          motif: 'Inventaire annuel',
          notes: 'Inventaire complet effectué avec succès'
        },
        {
          id_inventaire: 2,
          numero_inventaire: 'INV-2024-002',
          id_entrepot: 2,
          nom_entrepot: 'Showroom',
          date_inventaire: '2024-01-20',
          statut: 'EN_COURS',
          type_inventaire: 'PARTIEL',
          valeur_theorique: 45000.00,
          motif: 'Inventaire partiel Showroom'
        }
      ];
      setInventaires(mockInventaires);
    } catch (error) {
      console.error('Erreur chargement inventaires:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // TODO: Appel API
      if (editingInventaire) {
        // Update
        setInventaires(inventaires.map(inv => inv.id_inventaire === editingInventaire.id_inventaire ? formData : inv));
      } else {
        // Create
        const newInventaire = { ...formData, id_inventaire: Date.now() };
        setInventaires([...inventaires, newInventaire]);
      }
      setShowForm(false);
      setEditingInventaire(null);
      resetForm();
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
    }
  };

  const handleEdit = (inventaire: Inventaire) => {
    setEditingInventaire(inventaire);
    setFormData(inventaire);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Supprimer cet inventaire ?')) {
      setInventaires(inventaires.filter(inv => inv.id_inventaire !== id));
    }
  };

  const resetForm = () => {
    setFormData({
      numero_inventaire: '',
      id_entrepot: undefined,
      date_inventaire: new Date().toISOString().split('T')[0],
      date_debut: undefined,
      date_fin: undefined,
      statut: 'BROUILLON',
      type_inventaire: 'COMPLET',
      valeur_theorique: 0,
      valeur_reelle: 0,
      ecart_valeur: 0,
      motif: '',
      notes: ''
    });
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'VALIDE': return 'bg-green-100 text-green-800';
      case 'TERMINE': return 'bg-blue-100 text-blue-800';
      case 'EN_COURS': return 'bg-yellow-100 text-yellow-800';
      case 'BROUILLON': return 'bg-gray-100 text-gray-800';
      case 'ANNULE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredInventaires = inventaires.filter(inv =>
    inv.numero_inventaire?.toLowerCase().includes(search.toLowerCase()) ||
    inv.nom_entrepot?.toLowerCase().includes(search.toLowerCase()) ||
    inv.statut?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="ml-64 p-6 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="ml-64 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              <ClipboardList className="w-8 h-8 text-blue-600" />
              Inventaires
            </h1>
            <p className="text-gray-600 mt-2">Gestion des inventaires de stock</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setEditingInventaire(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            Nouvel Inventaire
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
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher un inventaire..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        {/* Formulaire */}
        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-bold mb-4">{editingInventaire ? 'Modifier' : 'Nouvel'} Inventaire</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Numéro Inventaire *</label>
                  <input
                    type="text"
                    required
                    value={formData.numero_inventaire}
                    onChange={(e) => setFormData({ ...formData, numero_inventaire: e.target.value })}
                    className="w-full px-4 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date Inventaire *</label>
                  <input
                    type="date"
                    required
                    value={formData.date_inventaire}
                    onChange={(e) => setFormData({ ...formData, date_inventaire: e.target.value })}
                    className="w-full px-4 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Type Inventaire</label>
                  <select
                    value={formData.type_inventaire}
                    onChange={(e) => setFormData({ ...formData, type_inventaire: e.target.value as any })}
                    className="w-full px-4 py-2 border rounded"
                  >
                    <option value="COMPLET">Complet</option>
                    <option value="PARTIEL">Partiel</option>
                    <option value="CYCLIQUE">Cyclique</option>
                    <option value="ALTERNATIF">Alternatif</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Statut</label>
                  <select
                    value={formData.statut}
                    onChange={(e) => setFormData({ ...formData, statut: e.target.value as any })}
                    className="w-full px-4 py-2 border rounded"
                  >
                    <option value="BROUILLON">Brouillon</option>
                    <option value="EN_COURS">En Cours</option>
                    <option value="TERMINE">Terminé</option>
                    <option value="VALIDE">Validé</option>
                    <option value="ANNULE">Annulé</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date Début</label>
                  <input
                    type="date"
                    value={formData.date_debut || ''}
                    onChange={(e) => setFormData({ ...formData, date_debut: e.target.value })}
                    className="w-full px-4 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date Fin</label>
                  <input
                    type="date"
                    value={formData.date_fin || ''}
                    onChange={(e) => setFormData({ ...formData, date_fin: e.target.value })}
                    className="w-full px-4 py-2 border rounded"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Motif</label>
                <input
                  type="text"
                  value={formData.motif || ''}
                  onChange={(e) => setFormData({ ...formData, motif: e.target.value })}
                  className="w-full px-4 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2 border rounded"
                  rows={3}
                />
              </div>
              <div className="flex gap-4">
                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
                  {editingInventaire ? 'Modifier' : 'Créer'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingInventaire(null);
                    resetForm();
                  }}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400"
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
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Numéro</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entrepôt</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valeur Théorique</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valeur Réelle</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Écart</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredInventaires.map((inventaire) => (
                  <tr key={inventaire.id_inventaire} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-sm font-medium">{inventaire.numero_inventaire}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{inventaire.nom_entrepot || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{inventaire.date_inventaire}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{inventaire.type_inventaire}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{inventaire.valeur_theorique?.toFixed(2) || '0.00'} TND</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{inventaire.valeur_reelle?.toFixed(2) || '-'}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${
                      (inventaire.ecart_valeur || 0) < 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {inventaire.ecart_valeur?.toFixed(2) || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs ${getStatutColor(inventaire.statut)}`}>
                        {inventaire.statut}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(inventaire)} className="text-blue-600 hover:text-blue-800">
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInventaires.map((inventaire) => (
              <div key={inventaire.id_inventaire} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-32 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                  <ClipboardList className="w-16 h-16 text-blue-600" />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg text-gray-800 mb-2">{inventaire.numero_inventaire}</h3>
                  <div className="space-y-1 text-sm text-gray-600 mb-3">
                    <p><span className="font-medium">Entrepôt:</span> {inventaire.nom_entrepot || '-'}</p>
                    <p><span className="font-medium">Date:</span> {inventaire.date_inventaire}</p>
                    <p><span className="font-medium">Type:</span> {inventaire.type_inventaire}</p>
                    <div className="mt-2 pt-2 border-t">
                      <p className="text-xs text-gray-500">Valeur Théorique: {inventaire.valeur_theorique?.toFixed(2) || '0.00'} TND</p>
                      <p className="text-xs text-gray-500">Valeur Réelle: {inventaire.valeur_reelle?.toFixed(2) || '-'}</p>
                      <p className={`text-sm font-semibold ${(inventaire.ecart_valeur || 0) < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        Écart: {inventaire.ecart_valeur?.toFixed(2) || '-'} TND
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-2 py-1 rounded text-xs ${getStatutColor(inventaire.statut)}`}>
                      {inventaire.statut}
                    </span>
                  </div>
                  <div className="flex gap-2 pt-3 border-t">
                    <button
                      onClick={() => handleEdit(inventaire)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                    >
                      <Edit className="w-4 h-4" />
                      Modifier
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredInventaires.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <ClipboardList className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Aucun inventaire trouvé</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inventaire;
