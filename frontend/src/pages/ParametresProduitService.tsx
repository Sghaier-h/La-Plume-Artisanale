import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Package2, Layers, Package, Box, Briefcase, Tag, Edit, Plus, X, Save } from 'lucide-react';
import { produitsService } from '../services/api';

interface Attribut {
  id_attribut?: number;
  code_attribut: string;
  libelle: string;
  type_attribut: string;
  valeurs_possibles?: Array<{code: string; libelle: string; couleur_hex?: string; id_mp?: number}>;
}

const ParametresProduitService: React.FC = () => {
  const navigate = useNavigate();
  const [attributs, setAttributs] = useState<Attribut[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'modeles' | 'articles' | 'matieres' | 'services'>('modeles');
  const [filterCategory, setFilterCategory] = useState<string>('tous');
  const [editingAttribut, setEditingAttribut] = useState<Attribut | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadAttributs();
  }, []);

  const loadAttributs = async () => {
    try {
      setLoading(true);
      const response = await produitsService.getAttributs();
      setAttributs(response.data.data || []);
    } catch (error) {
      console.error('Erreur chargement attributs:', error);
      setMessage({ type: 'error', text: 'Erreur lors du chargement des attributs' });
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les attributs selon la section active
  const getFilteredAttributs = () => {
    let filtered = attributs;

    // Filtrer par section
    switch (activeSection) {
      case 'modeles':
        filtered = filtered.filter(a => 
          a.code_attribut.toLowerCase().includes('dim') ||
          a.code_attribut.toLowerCase().includes('tiss') ||
          a.code_attribut.toLowerCase().includes('fin') ||
          a.code_attribut.toLowerCase().includes('modele') ||
          a.code_attribut.toLowerCase().includes('coul')
        );
        break;
      case 'articles':
        filtered = filtered.filter(a => 
          a.code_attribut.toLowerCase().includes('select') ||
          a.code_attribut.toLowerCase().includes('coul') ||
          a.code_attribut.toLowerCase().includes('dim') ||
          a.code_attribut.toLowerCase().includes('comp')
        );
        break;
      case 'matieres':
        filtered = filtered.filter(a => 
          a.code_attribut.toLowerCase().includes('type') ||
          a.code_attribut.toLowerCase().includes('coul') ||
          a.code_attribut.toLowerCase().includes('fabrication')
        );
        break;
      case 'services':
        filtered = filtered.filter(a => 
          a.code_attribut.toLowerCase().includes('service') ||
          a.code_attribut.toLowerCase().includes('type')
        );
        break;
    }

    // Filtrer par catégorie si sélectionnée
    if (filterCategory !== 'tous') {
      filtered = filtered.filter(a => 
        a.code_attribut.toLowerCase().includes(filterCategory.toLowerCase()) ||
        a.libelle.toLowerCase().includes(filterCategory.toLowerCase())
      );
    }

    return filtered;
  };

  const handleEdit = (attribut: Attribut) => {
    setEditingAttribut(attribut);
    setShowForm(true);
  };

  const handleSave = async (attribut: Attribut) => {
    try {
      if (editingAttribut?.id_attribut) {
        await produitsService.updateAttribut(editingAttribut.id_attribut, attribut);
        setMessage({ type: 'success', text: 'Attribut modifié avec succès' });
      } else {
        await produitsService.createAttribut(attribut);
        setMessage({ type: 'success', text: 'Attribut créé avec succès' });
      }
      setShowForm(false);
      setEditingAttribut(null);
      loadAttributs();
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde' });
    }
  };

  const sections = [
    { id: 'modeles', label: 'Modèles', icon: Layers, description: 'Dimensions, Tissage, Finition, Nombre de Couleur' },
    { id: 'articles', label: 'Articles', icon: Package, description: 'Sélecteurs Couleur, Dimensions, Composition' },
    { id: 'matieres', label: 'Matières Premières', icon: Box, description: 'Types, Codes Couleur, Codes Fabrication' },
    { id: 'services', label: 'Services', icon: Briefcase, description: 'Types de services, Catégories' }
  ];

  const categories = [
    { id: 'tous', label: 'Tous' },
    { id: 'dim', label: 'Dimensions' },
    { id: 'tiss', label: 'Tissage' },
    { id: 'fin', label: 'Finition' },
    { id: 'coul', label: 'Couleur' },
    { id: 'select', label: 'Sélecteurs' },
    { id: 'comp', label: 'Composition' },
    { id: 'type', label: 'Types' }
  ];

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
              <Settings className="w-8 h-8 text-blue-600" />
              Paramètres - Produit et Service
            </h1>
            <p className="text-gray-600 mt-2">Gérez tous les paramètres nécessaires pour la catégorie Produit et Service</p>
          </div>
          <button
            onClick={() => navigate('/gestion-attributs')}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
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

        {/* Sections */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {sections.map((section) => {
                const SectionIcon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id as any)}
                    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                      activeSection === section.id
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <SectionIcon className="w-5 h-5" />
                    {section.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Description de la section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>{sections.find(s => s.id === activeSection)?.label}:</strong>{' '}
            {sections.find(s => s.id === activeSection)?.description}
          </p>
        </div>

        {/* Filtres par catégorie */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Filtrer par catégorie</label>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFilterCategory(cat.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterCategory === cat.id
                    ? 'bg-blue-100 text-blue-700 border-2 border-blue-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Liste des attributs */}
        <div className="space-y-4">
          {getFilteredAttributs().length > 0 ? (
            getFilteredAttributs().map((attribut) => (
              <div key={attribut.id_attribut} className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">{attribut.libelle}</h3>
                    <p className="text-sm text-gray-500">Code: {attribut.code_attribut} | Type: {attribut.type_attribut}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(attribut)}
                      className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded"
                      title="Modifier"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => navigate(`/gestion-attributs?edit=${attribut.id_attribut}`)}
                      className="text-gray-600 hover:text-gray-800 p-2 hover:bg-gray-50 rounded"
                      title="Voir détails"
                    >
                      <Tag className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Valeurs possibles ({attribut.valeurs_possibles?.length || 0}) :
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {attribut.valeurs_possibles?.slice(0, 10).map((valeur, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                        {valeur.code} - {valeur.libelle}
                      </span>
                    ))}
                    {(attribut.valeurs_possibles?.length || 0) > 10 && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                        +{(attribut.valeurs_possibles?.length || 0) - 10} autres...
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <Tag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">Aucun attribut trouvé pour cette section</p>
              <button
                onClick={() => navigate('/gestion-attributs')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Créer un attribut
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParametresProduitService;
