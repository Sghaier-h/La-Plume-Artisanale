import React, { useState, useEffect } from 'react';
import { Warehouse, Plus, Search, Edit, Trash2, List, Grid, MapPin } from 'lucide-react';

interface Entrepot {
  id_entrepot?: number;
  code_entrepot: string;
  nom_entrepot: string;
  adresse?: string;
  ville?: string;
  code_postal?: string;
  telephone?: string;
  email?: string;
  responsable?: string;
  type_entrepot: 'PRINCIPAL' | 'SECONDAIRE' | 'SHOWROOM' | 'FABRICATION' | 'RESERVE';
  capacite_max?: number;
  actif: boolean;
}

const Entrepot: React.FC = () => {
  const [entrepots, setEntrepots] = useState<Entrepot[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingEntrepot, setEditingEntrepot] = useState<Entrepot | null>(null);
  const [affichageMode, setAffichageMode] = useState<'ligne' | 'catalogue'>('ligne');

  const [formData, setFormData] = useState<Entrepot>({
    code_entrepot: '',
    nom_entrepot: '',
    adresse: '',
    ville: '',
    code_postal: '',
    telephone: '',
    email: '',
    responsable: '',
    type_entrepot: 'PRINCIPAL',
    capacite_max: undefined,
    actif: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // TODO: Remplacer par l'API réelle
      const mockEntrepots: Entrepot[] = [
        {
          id_entrepot: 1,
          code_entrepot: 'ENT-001',
          nom_entrepot: 'Entrepôt Principal',
          adresse: 'Zone Industrielle',
          ville: 'Tunis',
          code_postal: '1000',
          telephone: '+216 71 123 456',
          email: 'entrepot@laplume.tn',
          responsable: 'Ahmed Ben Ali',
          type_entrepot: 'PRINCIPAL',
          capacite_max: 10000,
          actif: true
        },
        {
          id_entrepot: 2,
          code_entrepot: 'ENT-002',
          nom_entrepot: 'Showroom Centre-Ville',
          adresse: 'Avenue Habib Bourguiba',
          ville: 'Tunis',
          code_postal: '1000',
          telephone: '+216 71 234 567',
          type_entrepot: 'SHOWROOM',
          capacite_max: 500,
          actif: true
        },
        {
          id_entrepot: 3,
          code_entrepot: 'ENT-003',
          nom_entrepot: 'Entrepôt Fabrication',
          adresse: 'Usine',
          ville: 'Ben Arous',
          type_entrepot: 'FABRICATION',
          capacite_max: 5000,
          actif: true
        }
      ];
      setEntrepots(mockEntrepots);
    } catch (error) {
      console.error('Erreur chargement entrepôts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // TODO: Appel API
      if (editingEntrepot) {
        setEntrepots(entrepots.map(ent => ent.id_entrepot === editingEntrepot.id_entrepot ? formData : ent));
      } else {
        const newEntrepot = { ...formData, id_entrepot: Date.now() };
        setEntrepots([...entrepots, newEntrepot]);
      }
      setShowForm(false);
      setEditingEntrepot(null);
      resetForm();
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
    }
  };

  const handleEdit = (entrepot: Entrepot) => {
    setEditingEntrepot(entrepot);
    setFormData(entrepot);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Supprimer cet entrepôt ?')) {
      setEntrepots(entrepots.filter(ent => ent.id_entrepot !== id));
    }
  };

  const resetForm = () => {
    setFormData({
      code_entrepot: '',
      nom_entrepot: '',
      adresse: '',
      ville: '',
      code_postal: '',
      telephone: '',
      email: '',
      responsable: '',
      type_entrepot: 'PRINCIPAL',
      capacite_max: undefined,
      actif: true
    });
  };

  const filteredEntrepots = entrepots.filter(ent =>
    ent.code_entrepot?.toLowerCase().includes(search.toLowerCase()) ||
    ent.nom_entrepot?.toLowerCase().includes(search.toLowerCase()) ||
    ent.ville?.toLowerCase().includes(search.toLowerCase()) ||
    ent.type_entrepot?.toLowerCase().includes(search.toLowerCase())
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
              <Warehouse className="w-8 h-8 text-blue-600" />
              Entrepôts
            </h1>
            <p className="text-gray-600 mt-2">Gestion des entrepôts et emplacements de stockage</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setEditingEntrepot(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            Nouvel Entrepôt
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
              placeholder="Rechercher un entrepôt..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        {/* Formulaire */}
        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-bold mb-4">{editingEntrepot ? 'Modifier' : 'Nouvel'} Entrepôt</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Code Entrepôt *</label>
                  <input
                    type="text"
                    required
                    value={formData.code_entrepot}
                    onChange={(e) => setFormData({ ...formData, code_entrepot: e.target.value })}
                    className="w-full px-4 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Nom Entrepôt *</label>
                  <input
                    type="text"
                    required
                    value={formData.nom_entrepot}
                    onChange={(e) => setFormData({ ...formData, nom_entrepot: e.target.value })}
                    className="w-full px-4 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Type Entrepôt</label>
                  <select
                    value={formData.type_entrepot}
                    onChange={(e) => setFormData({ ...formData, type_entrepot: e.target.value as any })}
                    className="w-full px-4 py-2 border rounded"
                  >
                    <option value="PRINCIPAL">Principal</option>
                    <option value="SECONDAIRE">Secondaire</option>
                    <option value="SHOWROOM">Showroom</option>
                    <option value="FABRICATION">Fabrication</option>
                    <option value="RESERVE">Réserve</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Responsable</label>
                  <input
                    type="text"
                    value={formData.responsable || ''}
                    onChange={(e) => setFormData({ ...formData, responsable: e.target.value })}
                    className="w-full px-4 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Adresse</label>
                  <input
                    type="text"
                    value={formData.adresse || ''}
                    onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                    className="w-full px-4 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Ville</label>
                  <input
                    type="text"
                    value={formData.ville || ''}
                    onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                    className="w-full px-4 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Code Postal</label>
                  <input
                    type="text"
                    value={formData.code_postal || ''}
                    onChange={(e) => setFormData({ ...formData, code_postal: e.target.value })}
                    className="w-full px-4 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Téléphone</label>
                  <input
                    type="text"
                    value={formData.telephone || ''}
                    onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                    className="w-full px-4 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Capacité Max</label>
                  <input
                    type="number"
                    value={formData.capacite_max || ''}
                    onChange={(e) => setFormData({ ...formData, capacite_max: e.target.value ? parseInt(e.target.value) : undefined })}
                    className="w-full px-4 py-2 border rounded"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.actif}
                    onChange={(e) => setFormData({ ...formData, actif: e.target.checked })}
                    className="mr-2"
                  />
                  <label className="text-sm font-medium">Actif</label>
                </div>
              </div>
              <div className="flex gap-4">
                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
                  {editingEntrepot ? 'Modifier' : 'Créer'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingEntrepot(null);
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ville</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Responsable</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacité</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredEntrepots.map((entrepot) => (
                  <tr key={entrepot.id_entrepot} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-sm font-medium">{entrepot.code_entrepot}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">{entrepot.nom_entrepot}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{entrepot.type_entrepot}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{entrepot.ville || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{entrepot.responsable || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{entrepot.capacite_max || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs ${entrepot.actif ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {entrepot.actif ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(entrepot)} className="text-blue-600 hover:text-blue-800">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(entrepot.id_entrepot!)} className="text-red-600 hover:text-red-800">
                          <Trash2 className="w-4 h-4" />
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
            {filteredEntrepots.map((entrepot) => (
              <div key={entrepot.id_entrepot} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-32 bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                  <Warehouse className="w-16 h-16 text-green-600" />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg text-gray-800 mb-2">{entrepot.nom_entrepot}</h3>
                  <div className="space-y-1 text-sm text-gray-600 mb-3">
                    <p><span className="font-medium">Code:</span> <span className="font-mono text-xs">{entrepot.code_entrepot}</span></p>
                    <p><span className="font-medium">Type:</span> {entrepot.type_entrepot}</p>
                    {entrepot.ville && <p><span className="font-medium">Ville:</span> {entrepot.ville}</p>}
                    {entrepot.responsable && <p><span className="font-medium">Responsable:</span> {entrepot.responsable}</p>}
                    {entrepot.capacite_max && <p><span className="font-medium">Capacité:</span> {entrepot.capacite_max}</p>}
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-2 py-1 rounded text-xs ${entrepot.actif ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {entrepot.actif ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                  <div className="flex gap-2 pt-3 border-t">
                    <button
                      onClick={() => handleEdit(entrepot)}
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

        {filteredEntrepots.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Warehouse className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Aucun entrepôt trouvé</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Entrepot;
