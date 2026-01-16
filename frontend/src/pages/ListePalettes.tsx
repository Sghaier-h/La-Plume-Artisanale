import React, { useState, useEffect } from 'react';
import { Layers, Plus, Search, Edit, Printer, List, Grid, Package } from 'lucide-react';

interface ListePalette {
  id_liste?: number;
  numero_liste: string;
  date_liste: string;
  id_commande?: number;
  numero_commande?: string;
  id_client?: number;
  nom_client?: string;
  statut: 'BROUILLON' | 'EN_COURS' | 'TERMINE' | 'EXPEDIE';
  nombre_palettes?: number;
  poids_total?: number;
  volume_total?: number;
  transporteur?: string;
  numero_suivi?: string;
  date_expedition?: string;
}

interface LignePalette {
  id_ligne?: number;
  id_liste?: number;
  numero_palette: string;
  id_article?: number;
  ref_article?: string;
  designation?: string;
  quantite: number;
  poids?: number;
  volume?: number;
  hauteur?: number;
  largeur?: number;
  longueur?: number;
}

const ListePalettes: React.FC = () => {
  const [listes, setListes] = useState<ListePalette[]>([]);
  const [lignes, setLignes] = useState<LignePalette[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingListe, setEditingListe] = useState<ListePalette | null>(null);
  const [affichageMode, setAffichageMode] = useState<'ligne' | 'catalogue'>('ligne');

  const [formData, setFormData] = useState<ListePalette>({
    numero_liste: '',
    date_liste: new Date().toISOString().split('T')[0],
    id_commande: undefined,
    numero_commande: '',
    id_client: undefined,
    nom_client: '',
    statut: 'BROUILLON',
    nombre_palettes: 0,
    poids_total: 0,
    volume_total: 0,
    transporteur: '',
    numero_suivi: '',
    date_expedition: undefined
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // TODO: Remplacer par l'API réelle
      const mockListes: ListePalette[] = [
        {
          id_liste: 1,
          numero_liste: 'PAL-2024-001',
          date_liste: '2024-01-15',
          id_commande: 1,
          numero_commande: 'CMD-2024-001',
          id_client: 1,
          nom_client: 'Client ABC',
          statut: 'TERMINE',
          nombre_palettes: 2,
          poids_total: 450.5,
          volume_total: 2.5,
          transporteur: 'DHL',
          numero_suivi: 'DHL987654321',
          date_expedition: '2024-01-16'
        },
        {
          id_liste: 2,
          numero_liste: 'PAL-2024-002',
          date_liste: '2024-01-20',
          id_commande: 2,
          numero_commande: 'CMD-2024-002',
          id_client: 2,
          nom_client: 'Client XYZ',
          statut: 'EN_COURS',
          nombre_palettes: 1,
          poids_total: 220.0
        }
      ];
      setListes(mockListes);

      const mockLignes: LignePalette[] = [
        {
          id_ligne: 1,
          id_liste: 1,
          numero_palette: 'PAL-001',
          id_article: 1,
          ref_article: 'AR1020-B02-03',
          designation: 'ARTHUR 100/200 CM Blanc/Rouge',
          quantite: 50,
          poids: 225.0,
          volume: 1.2,
          hauteur: 1.2,
          largeur: 0.8,
          longueur: 1.2
        }
      ];
      setLignes(mockLignes);
    } catch (error) {
      console.error('Erreur chargement listes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // TODO: Appel API
      if (editingListe) {
        setListes(listes.map(list => list.id_liste === editingListe.id_liste ? formData : list));
      } else {
        const newListe = { ...formData, id_liste: Date.now() };
        setListes([...listes, newListe]);
      }
      setShowForm(false);
      setEditingListe(null);
      resetForm();
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
    }
  };

  const handleEdit = (liste: ListePalette) => {
    setEditingListe(liste);
    setFormData(liste);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      numero_liste: '',
      date_liste: new Date().toISOString().split('T')[0],
      id_commande: undefined,
      numero_commande: '',
      id_client: undefined,
      nom_client: '',
      statut: 'BROUILLON',
      nombre_palettes: 0,
      poids_total: 0,
      volume_total: 0,
      transporteur: '',
      numero_suivi: '',
      date_expedition: undefined
    });
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'EXPEDIE': return 'bg-green-100 text-green-800';
      case 'TERMINE': return 'bg-blue-100 text-blue-800';
      case 'EN_COURS': return 'bg-yellow-100 text-yellow-800';
      case 'BROUILLON': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredListes = listes.filter(list =>
    list.numero_liste?.toLowerCase().includes(search.toLowerCase()) ||
    list.numero_commande?.toLowerCase().includes(search.toLowerCase()) ||
    list.nom_client?.toLowerCase().includes(search.toLowerCase()) ||
    list.statut?.toLowerCase().includes(search.toLowerCase())
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
              <Layers className="w-8 h-8 text-blue-600" />
              Liste des Palettes
            </h1>
            <p className="text-gray-600 mt-2">Gestion des listes de palettes pour les expéditions</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setEditingListe(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            Nouvelle Liste
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
              placeholder="Rechercher une liste..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        {/* Formulaire */}
        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-bold mb-4">{editingListe ? 'Modifier' : 'Nouvelle'} Liste de Palettes</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Numéro Liste *</label>
                  <input
                    type="text"
                    required
                    value={formData.numero_liste}
                    onChange={(e) => setFormData({ ...formData, numero_liste: e.target.value })}
                    className="w-full px-4 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date Liste *</label>
                  <input
                    type="date"
                    required
                    value={formData.date_liste}
                    onChange={(e) => setFormData({ ...formData, date_liste: e.target.value })}
                    className="w-full px-4 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Numéro Commande</label>
                  <input
                    type="text"
                    value={formData.numero_commande || ''}
                    onChange={(e) => setFormData({ ...formData, numero_commande: e.target.value })}
                    className="w-full px-4 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Client</label>
                  <input
                    type="text"
                    value={formData.nom_client || ''}
                    onChange={(e) => setFormData({ ...formData, nom_client: e.target.value })}
                    className="w-full px-4 py-2 border rounded"
                  />
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
                    <option value="EXPEDIE">Expédié</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Nombre de Palettes</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.nombre_palettes || 0}
                    onChange={(e) => setFormData({ ...formData, nombre_palettes: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Poids Total (kg)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.poids_total || 0}
                    onChange={(e) => setFormData({ ...formData, poids_total: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Volume Total (m³)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.volume_total || 0}
                    onChange={(e) => setFormData({ ...formData, volume_total: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Transporteur</label>
                  <input
                    type="text"
                    value={formData.transporteur || ''}
                    onChange={(e) => setFormData({ ...formData, transporteur: e.target.value })}
                    className="w-full px-4 py-2 border rounded"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
                  {editingListe ? 'Modifier' : 'Créer'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingListe(null);
                    resetForm();
                  }}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
                >
                  <Printer className="w-4 h-4" />
                  Imprimer
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commande</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nb Palettes</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Poids (kg)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Volume (m³)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transporteur</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredListes.map((liste) => (
                  <tr key={liste.id_liste} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-sm font-medium">{liste.numero_liste}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{liste.date_liste}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{liste.numero_commande || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{liste.nom_client || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{liste.nombre_palettes || 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{liste.poids_total?.toFixed(2) || '0.00'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{liste.volume_total?.toFixed(2) || '0.00'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{liste.transporteur || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs ${getStatutColor(liste.statut)}`}>
                        {liste.statut}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(liste)} className="text-blue-600 hover:text-blue-800">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-800">
                          <Printer className="w-4 h-4" />
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
            {filteredListes.map((liste) => (
              <div key={liste.id_liste} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-32 bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                  <Layers className="w-16 h-16 text-purple-600" />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg text-gray-800 mb-2">{liste.numero_liste}</h3>
                  <div className="space-y-1 text-sm text-gray-600 mb-3">
                    <p><span className="font-medium">Date:</span> {liste.date_liste}</p>
                    <p><span className="font-medium">Commande:</span> {liste.numero_commande || '-'}</p>
                    <p><span className="font-medium">Client:</span> {liste.nom_client || '-'}</p>
                    <div className="mt-2 pt-2 border-t">
                      <p className="text-xs text-gray-500">Palettes: {liste.nombre_palettes || 0}</p>
                      <p className="text-xs text-gray-500">Poids: {liste.poids_total?.toFixed(2) || '0.00'} kg</p>
                      <p className="text-xs text-gray-500">Volume: {liste.volume_total?.toFixed(2) || '0.00'} m³</p>
                      {liste.transporteur && <p className="text-xs text-gray-500">Transporteur: {liste.transporteur}</p>}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-2 py-1 rounded text-xs ${getStatutColor(liste.statut)}`}>
                      {liste.statut}
                    </span>
                  </div>
                  <div className="flex gap-2 pt-3 border-t">
                    <button
                      onClick={() => handleEdit(liste)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                    >
                      <Edit className="w-4 h-4" />
                      Modifier
                    </button>
                    <button className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                      <Printer className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredListes.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Layers className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Aucune liste de palettes trouvée</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListePalettes;
