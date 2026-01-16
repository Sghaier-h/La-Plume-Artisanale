import React, { useState, useEffect } from 'react';
import { ArrowRightLeft, Plus, Search, Edit, List, Grid, Package, ArrowRight } from 'lucide-react';

interface Mouvement {
  id_mouvement?: number;
  numero_mouvement: string;
  date_mouvement: string;
  type_mouvement: 'ENTREE' | 'SORTIE' | 'TRANSFERT' | 'RETOUR' | 'INVENTAIRE' | 'RESERVATION' | 'LIBERATION';
  type_produit: 'PRODUIT_FINI' | 'SEMI_FINI' | 'MATIERE_PREMIERE' | 'FOURNITURE';
  id_article?: number;
  ref_article?: string;
  id_entrepot_origine?: number;
  nom_entrepot_origine?: string;
  id_entrepot_destination?: number;
  nom_entrepot_destination?: string;
  quantite: number;
  motif?: string;
  reference_document?: string;
  created_by?: string;
}

const Mouvement: React.FC = () => {
  const [mouvements, setMouvements] = useState<Mouvement[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingMouvement, setEditingMouvement] = useState<Mouvement | null>(null);
  const [affichageMode, setAffichageMode] = useState<'ligne' | 'catalogue'>('ligne');

  const [formData, setFormData] = useState<Mouvement>({
    numero_mouvement: '',
    date_mouvement: new Date().toISOString().split('T')[0],
    type_mouvement: 'ENTREE',
    type_produit: 'PRODUIT_FINI',
    id_article: undefined,
    ref_article: '',
    id_entrepot_origine: undefined,
    id_entrepot_destination: undefined,
    quantite: 0,
    motif: '',
    reference_document: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // TODO: Remplacer par l'API réelle
      const mockMouvements: Mouvement[] = [
        {
          id_mouvement: 1,
          numero_mouvement: 'MOV-2024-001',
          date_mouvement: '2024-01-15',
          type_mouvement: 'ENTREE',
          type_produit: 'PRODUIT_FINI',
          id_article: 1,
          ref_article: 'AR1020-B02-03',
          id_entrepot_destination: 1,
          nom_entrepot_destination: 'Entrepôt Principal',
          quantite: 50,
          motif: 'Réception production',
          reference_document: 'OF-001',
          created_by: 'Magasinier PF'
        },
        {
          id_mouvement: 2,
          numero_mouvement: 'MOV-2024-002',
          date_mouvement: '2024-01-16',
          type_mouvement: 'TRANSFERT',
          type_produit: 'PRODUIT_FINI',
          id_article: 1,
          ref_article: 'AR1020-B02-03',
          id_entrepot_origine: 1,
          nom_entrepot_origine: 'Entrepôt Principal',
          id_entrepot_destination: 2,
          nom_entrepot_destination: 'Showroom',
          quantite: 10,
          motif: 'Transfert vers showroom',
          created_by: 'Magasinier PF'
        },
        {
          id_mouvement: 3,
          numero_mouvement: 'MOV-2024-003',
          date_mouvement: '2024-01-17',
          type_mouvement: 'SORTIE',
          type_produit: 'PRODUIT_FINI',
          id_article: 1,
          ref_article: 'AR1020-B02-03',
          id_entrepot_origine: 2,
          nom_entrepot_origine: 'Showroom',
          quantite: 5,
          motif: 'Vente',
          reference_document: 'BL-001',
          created_by: 'Vendeur'
        },
        {
          id_mouvement: 4,
          numero_mouvement: 'MOV-2024-004',
          date_mouvement: '2024-01-18',
          type_mouvement: 'ENTREE',
          type_produit: 'MATIERE_PREMIERE',
          id_article: 10,
          ref_article: 'MP-001',
          id_entrepot_destination: 1,
          nom_entrepot_destination: 'Entrepôt Principal',
          quantite: 500,
          motif: 'Réception achat',
          reference_document: 'BL-FOUR-001',
          created_by: 'Magasinier MP'
        },
        {
          id_mouvement: 5,
          numero_mouvement: 'MOV-2024-005',
          date_mouvement: '2024-01-19',
          type_mouvement: 'SORTIE',
          type_produit: 'FOURNITURE',
          id_article: 20,
          ref_article: 'FOU-001',
          id_entrepot_origine: 1,
          nom_entrepot_origine: 'Entrepôt Principal',
          quantite: 100,
          motif: 'Utilisation production',
          reference_document: 'OF-002',
          created_by: 'Magasinier PF'
        }
      ];
      setMouvements(mockMouvements);
    } catch (error) {
      console.error('Erreur chargement mouvements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // TODO: Appel API
      if (editingMouvement) {
        setMouvements(mouvements.map(mov => mov.id_mouvement === editingMouvement.id_mouvement ? formData : mov));
      } else {
        const newMouvement = { ...formData, id_mouvement: Date.now() };
        setMouvements([...mouvements, newMouvement]);
      }
      setShowForm(false);
      setEditingMouvement(null);
      resetForm();
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
    }
  };

  const handleEdit = (mouvement: Mouvement) => {
    setEditingMouvement(mouvement);
    setFormData(mouvement);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      numero_mouvement: '',
      date_mouvement: new Date().toISOString().split('T')[0],
      type_mouvement: 'ENTREE',
      type_produit: 'PRODUIT_FINI',
      id_article: undefined,
      ref_article: '',
      id_entrepot_origine: undefined,
      id_entrepot_destination: undefined,
      quantite: 0,
      motif: '',
      reference_document: ''
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'ENTREE': return 'bg-green-100 text-green-800';
      case 'SORTIE': return 'bg-red-100 text-red-800';
      case 'TRANSFERT': return 'bg-blue-100 text-blue-800';
      case 'RETOUR': return 'bg-yellow-100 text-yellow-800';
      case 'INVENTAIRE': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeProduitLabel = (type: string) => {
    switch (type) {
      case 'PRODUIT_FINI': return 'Produit Fini';
      case 'SEMI_FINI': return 'Semi-Fini';
      case 'MATIERE_PREMIERE': return 'Matière Première';
      case 'FOURNITURE': return 'Fourniture';
      default: return type;
    }
  };

  const filteredMouvements = mouvements.filter(mov =>
    mov.numero_mouvement?.toLowerCase().includes(search.toLowerCase()) ||
    mov.ref_article?.toLowerCase().includes(search.toLowerCase()) ||
    mov.type_mouvement?.toLowerCase().includes(search.toLowerCase()) ||
    mov.type_produit?.toLowerCase().includes(search.toLowerCase()) ||
    mov.motif?.toLowerCase().includes(search.toLowerCase())
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
              <ArrowRightLeft className="w-8 h-8 text-blue-600" />
              Mouvements de Stock
            </h1>
            <p className="text-gray-600 mt-2">Gestion des mouvements d'entrée, sortie et transfert</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setEditingMouvement(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            Nouveau Mouvement
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
              placeholder="Rechercher un mouvement..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        {/* Formulaire */}
        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-bold mb-4">{editingMouvement ? 'Modifier' : 'Nouveau'} Mouvement</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Numéro Mouvement *</label>
                  <input
                    type="text"
                    required
                    value={formData.numero_mouvement}
                    onChange={(e) => setFormData({ ...formData, numero_mouvement: e.target.value })}
                    className="w-full px-4 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date Mouvement *</label>
                  <input
                    type="date"
                    required
                    value={formData.date_mouvement}
                    onChange={(e) => setFormData({ ...formData, date_mouvement: e.target.value })}
                    className="w-full px-4 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Type Mouvement *</label>
                  <select
                    value={formData.type_mouvement}
                    onChange={(e) => setFormData({ ...formData, type_mouvement: e.target.value as any })}
                    className="w-full px-4 py-2 border rounded"
                  >
                    <option value="ENTREE">Entrée</option>
                    <option value="SORTIE">Sortie</option>
                    <option value="TRANSFERT">Transfert</option>
                    <option value="RETOUR">Retour</option>
                    <option value="INVENTAIRE">Inventaire</option>
                    <option value="RESERVATION">Réservation</option>
                    <option value="LIBERATION">Libération</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Type Produit *</label>
                  <select
                    value={formData.type_produit}
                    onChange={(e) => setFormData({ ...formData, type_produit: e.target.value as any })}
                    className="w-full px-4 py-2 border rounded"
                  >
                    <option value="PRODUIT_FINI">Produit Fini</option>
                    <option value="SEMI_FINI">Semi-Fini</option>
                    <option value="MATIERE_PREMIERE">Matière Première</option>
                    <option value="FOURNITURE">Fourniture</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Référence Article *</label>
                  <input
                    type="text"
                    required
                    value={formData.ref_article}
                    onChange={(e) => setFormData({ ...formData, ref_article: e.target.value })}
                    className="w-full px-4 py-2 border rounded"
                  />
                </div>
                {(formData.type_mouvement === 'TRANSFERT' || formData.type_mouvement === 'SORTIE') && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Entrepôt Origine *</label>
                    <input
                      type="text"
                      required
                      value={formData.nom_entrepot_origine || ''}
                      onChange={(e) => setFormData({ ...formData, nom_entrepot_origine: e.target.value })}
                      className="w-full px-4 py-2 border rounded"
                    />
                  </div>
                )}
                {(formData.type_mouvement === 'ENTREE' || formData.type_mouvement === 'TRANSFERT') && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Entrepôt Destination *</label>
                    <input
                      type="text"
                      required
                      value={formData.nom_entrepot_destination || ''}
                      onChange={(e) => setFormData({ ...formData, nom_entrepot_destination: e.target.value })}
                      className="w-full px-4 py-2 border rounded"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium mb-1">Quantité *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.quantite}
                    onChange={(e) => setFormData({ ...formData, quantite: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Référence Document</label>
                  <input
                    type="text"
                    value={formData.reference_document || ''}
                    onChange={(e) => setFormData({ ...formData, reference_document: e.target.value })}
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
              <div className="flex gap-4">
                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
                  {editingMouvement ? 'Modifier' : 'Créer'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingMouvement(null);
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type Mouvement</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type Produit</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Article</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Origine</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Destination</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantité</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Motif</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredMouvements.map((mouvement) => (
                  <tr key={mouvement.id_mouvement} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-sm font-medium">{mouvement.numero_mouvement}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{mouvement.date_mouvement}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs ${getTypeColor(mouvement.type_mouvement)}`}>
                        {mouvement.type_mouvement}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 rounded text-xs bg-purple-100 text-purple-800">
                        {getTypeProduitLabel(mouvement.type_produit)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">{mouvement.ref_article}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{mouvement.nom_entrepot_origine || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{mouvement.nom_entrepot_destination || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">{mouvement.quantite}</td>
                    <td className="px-6 py-4 text-sm">{mouvement.motif || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button onClick={() => handleEdit(mouvement)} className="text-blue-600 hover:text-blue-800">
                        <Edit className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMouvements.map((mouvement) => (
              <div key={mouvement.id_mouvement} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-32 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                  <ArrowRightLeft className="w-16 h-16 text-blue-600" />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg text-gray-800 mb-2">{mouvement.numero_mouvement}</h3>
                  <div className="space-y-1 text-sm text-gray-600 mb-3">
                    <p><span className="font-medium">Date:</span> {mouvement.date_mouvement}</p>
                    <p><span className="font-medium">Article:</span> <span className="font-mono text-xs">{mouvement.ref_article}</span></p>
                    <div className="flex items-center gap-2">
                      {mouvement.nom_entrepot_origine && (
                        <>
                          <span className="text-xs">{mouvement.nom_entrepot_origine}</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                      <span className="text-xs">{mouvement.nom_entrepot_destination || mouvement.nom_entrepot_origine}</span>
                    </div>
                    <p className="font-semibold text-lg">Quantité: {mouvement.quantite}</p>
                    {mouvement.motif && <p className="text-xs text-gray-500">{mouvement.motif}</p>}
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-2 py-1 rounded text-xs ${getTypeColor(mouvement.type_mouvement)}`}>
                      {mouvement.type_mouvement}
                    </span>
                  </div>
                  <div className="flex gap-2 pt-3 border-t">
                    <button
                      onClick={() => handleEdit(mouvement)}
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

        {filteredMouvements.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <ArrowRightLeft className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Aucun mouvement trouvé</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Mouvement;
