import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Tag } from 'lucide-react';
import { produitsService } from '../services/api';
import { matieresPremieresService } from '../services/api';

interface Attribut {
  id_attribut?: number;
  code_attribut: string;
  libelle: string;
  type_attribut: string;
  valeurs_possibles?: Array<{code: string; libelle: string; couleur_hex?: string; id_mp?: number}>;
}

const GestionAttributs: React.FC = () => {
  const [attributs, setAttributs] = useState<Attribut[]>([]);
  const [matieresPremieres, setMatieresPremieres] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAttribut, setEditingAttribut] = useState<Attribut | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [formData, setFormData] = useState<Attribut>({
    code_attribut: '',
    libelle: '',
    type_attribut: 'select',
    valeurs_possibles: []
  });
  
  const [newValeur, setNewValeur] = useState({ code: '', libelle: '', couleur_hex: '', id_mp: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Charger les attributs
      try {
        const attributsRes = await produitsService.getAttributs();
        setAttributs(attributsRes.data.data || []);
      } catch (error) {
        console.error('Erreur chargement attributs:', error);
        setMessage({ type: 'error', text: 'Erreur lors du chargement des attributs' });
      }
      
      // Charger les matières premières pour les couleurs
      try {
        const mpRes = await matieresPremieresService.getMatieresPremieres({});
        setMatieresPremieres(mpRes.data.data?.matieres || []);
      } catch (error) {
        console.error('Erreur chargement matières premières:', error);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingAttribut(null);
    setFormData({
      code_attribut: '',
      libelle: '',
      type_attribut: 'select',
      valeurs_possibles: []
    });
    setNewValeur({ code: '', libelle: '', couleur_hex: '', id_mp: '' });
    setShowForm(true);
  };

  const handleEdit = (attribut: Attribut) => {
    setEditingAttribut(attribut);
    setFormData(attribut);
    setShowForm(true);
  };

  const handleAddValeur = () => {
    if (!newValeur.code || !newValeur.libelle) {
      setMessage({ type: 'error', text: 'Code et libellé sont requis' });
      return;
    }
    
    setFormData({
      ...formData,
      valeurs_possibles: [...(formData.valeurs_possibles || []), {
        code: newValeur.code,
        libelle: newValeur.libelle,
        couleur_hex: newValeur.couleur_hex || undefined,
        id_mp: newValeur.id_mp ? parseInt(newValeur.id_mp) : undefined
      }]
    });
    setNewValeur({ code: '', libelle: '', couleur_hex: '', id_mp: '' });
  };

  const handleRemoveValeur = (index: number) => {
    const newValeurs = [...(formData.valeurs_possibles || [])];
    newValeurs.splice(index, 1);
    setFormData({ ...formData, valeurs_possibles: newValeurs });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAttribut?.id_attribut) {
        // TODO: Implémenter updateAttribut dans l'API
        await produitsService.updateAttribut(editingAttribut.id_attribut, formData);
        setMessage({ type: 'success', text: 'Attribut modifié avec succès' });
      } else {
        await produitsService.createAttribut(formData);
        setMessage({ type: 'success', text: 'Attribut créé avec succès' });
      }
      setShowForm(false);
      loadData();
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error?.message || 'Erreur lors de la sauvegarde' 
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet attribut ?')) return;
    
    try {
      // TODO: Implémenter deleteAttribut dans l'API
      await produitsService.deleteAttribut(id);
      setMessage({ type: 'success', text: 'Attribut supprimé avec succès' });
      loadData();
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error?.message || 'Erreur lors de la suppression' 
      });
    }
  };

  // Filtrer les matières premières de type couleur
  const couleursMP = matieresPremieres.filter(mp => 
    mp.type_mp?.toLowerCase().includes('couleur') || 
    mp.designation?.toLowerCase().includes('couleur')
  );

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
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <Tag className="w-8 h-8 text-blue-600" />
              Gestion des Attributs
            </h1>
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-5 h-5" />
              Nouvel Attribut
            </button>
          </div>

          {message && (
            <div className={`mb-4 p-4 rounded-lg ${
              message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {message.text}
            </div>
          )}

          {/* Formulaire */}
          {showForm && (
            <div className="bg-white p-6 rounded-lg shadow mb-6">
              <h2 className="text-xl font-bold mb-4">
                {editingAttribut ? 'Modifier' : 'Nouvel'} Attribut
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Code Attribut *</label>
                    <input
                      type="text"
                      required
                      value={formData.code_attribut}
                      onChange={(e) => setFormData({ ...formData, code_attribut: e.target.value })}
                      className="w-full px-4 py-2 border rounded"
                      placeholder="Ex: DIM, TISS, COUL"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Libellé *</label>
                    <input
                      type="text"
                      required
                      value={formData.libelle}
                      onChange={(e) => setFormData({ ...formData, libelle: e.target.value })}
                      className="w-full px-4 py-2 border rounded"
                      placeholder="Ex: Dimensions, Tissage, Couleur"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">Type *</label>
                    <select
                      required
                      value={formData.type_attribut}
                      onChange={(e) => setFormData({ ...formData, type_attribut: e.target.value })}
                      className="w-full px-4 py-2 border rounded"
                    >
                      <option value="select">Liste déroulante</option>
                      <option value="text">Texte</option>
                      <option value="number">Nombre</option>
                      <option value="couleur">Couleur (depuis Matière Première)</option>
                    </select>
                  </div>
                </div>

                {/* Valeurs possibles */}
                {(formData.type_attribut === 'select' || formData.type_attribut === 'couleur') && (
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold mb-4">Valeurs Possibles</h3>
                    
                    {/* Ajouter une valeur */}
                    <div className="grid grid-cols-4 gap-2 mb-4 p-3 bg-gray-50 rounded">
                      <input
                        type="text"
                        placeholder="Code"
                        value={newValeur.code}
                        onChange={(e) => setNewValeur({ ...newValeur, code: e.target.value })}
                        className="px-3 py-2 border rounded text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Libellé"
                        value={newValeur.libelle}
                        onChange={(e) => setNewValeur({ ...newValeur, libelle: e.target.value })}
                        className="px-3 py-2 border rounded text-sm"
                      />
                      {(formData.type_attribut === 'couleur' || formData.code_attribut?.toLowerCase().includes('coul')) ? (
                        <select
                          value={newValeur.id_mp}
                          onChange={(e) => setNewValeur({ ...newValeur, id_mp: e.target.value })}
                          className="px-3 py-2 border rounded text-sm"
                        >
                          <option value="">Sélectionner couleur MP</option>
                          {couleursMP.map(mp => (
                            <option key={mp.id_mp} value={mp.id_mp}>
                              {mp.designation} ({mp.code_mp})
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="color"
                          value={newValeur.couleur_hex || '#000000'}
                          onChange={(e) => setNewValeur({ ...newValeur, couleur_hex: e.target.value })}
                          className="px-3 py-2 border rounded text-sm h-10"
                        />
                      )}
                      <button
                        type="button"
                        onClick={handleAddValeur}
                        className="bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600 text-sm"
                      >
                        <Plus className="w-4 h-4 inline" />
                      </button>
                    </div>

                    {/* Liste des valeurs */}
                    <div className="space-y-2">
                      {formData.valeurs_possibles?.map((valeur, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                          <span className="flex-1 font-medium">{valeur.code}</span>
                          <span className="flex-1">{valeur.libelle}</span>
                          {valeur.couleur_hex && (
                            <div className="w-8 h-8 rounded border" style={{ backgroundColor: valeur.couleur_hex }}></div>
                          )}
                          {valeur.id_mp && (
                            <span className="text-xs text-gray-500">
                              MP: {matieresPremieres.find(mp => mp.id_mp === valeur.id_mp)?.code_mp}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveValeur(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                  >
                    <Save className="w-5 h-5" />
                    Enregistrer
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="bg-gray-200 text-gray-700 px-6 py-2 rounded hover:bg-gray-300"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Liste des attributs */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Libellé</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nb Valeurs</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {attributs.map((attribut) => (
                  <tr key={attribut.id_attribut} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{attribut.code_attribut}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{attribut.libelle}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {attribut.type_attribut}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {attribut.valeurs_possibles?.length || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(attribut)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      {attribut.id_attribut && (
                        <button
                          onClick={() => handleDelete(attribut.id_attribut!)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
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

export default GestionAttributs;
