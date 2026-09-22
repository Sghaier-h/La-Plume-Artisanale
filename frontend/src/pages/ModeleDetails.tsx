import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Image as ImageIcon, DollarSign, Layers, Package, Tag, TrendingUp, BarChart3, Settings, Eye } from 'lucide-react';
import { modelesService } from '../services/api';

interface Modele {
  id_modele?: number;
  code_modele: string;
  designation: string;
  description?: string;
  produit: string;
  code_dimensions: string[];
  type_tissage: string[];
  code_type_tissage: string[];
  nombre_couleur: string[];
  code_nombre_couleur: string[];
  type_finition: string[];
  code_type_finition: string[];
  composition_fabrication: number;
  prix_reviens: number;
  prix_vente: number;
  prix_multiple?: any[];
  photo_modele?: string;
  actif: boolean;
  dans_catalogue_produit: boolean;
  description_auto?: boolean;
}

const ModeleDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [modele, setModele] = useState<Modele | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadModele();
  }, [id]);

  const loadModele = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const response = await modelesService.getModele(parseInt(id));
      setModele(response.data.data || response.data);
    } catch (err: any) {
      console.error('Erreur chargement modèle:', err);
      setError('Impossible de charger le modèle');
      // Fallback sur données mock pour le développement
      const mockModele: Modele = {
        id_modele: parseInt(id),
        code_modele: 'AR',
        designation: 'ARTHUR',
        description: 'Modèle Arthur - Fouta premium',
        produit: 'Fouta',
        code_dimensions: ['1020', '1626', '2020'],
        type_tissage: ['Tissage Plat'],
        code_type_tissage: ['PL'],
        nombre_couleur: ['2 Couleurs'],
        code_nombre_couleur: ['B'],
        type_finition: ['Frange'],
        code_type_finition: ['FR'],
        composition_fabrication: 1,
        prix_reviens: 7.5,
        prix_vente: 9.75,
        prix_multiple: [],
        actif: true,
        dans_catalogue_produit: true,
        description_auto: true
      };
      setModele(mockModele);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!modele?.id_modele || !window.confirm('Êtes-vous sûr de vouloir supprimer ce modèle ?')) {
      return;
    }

    try {
      await modelesService.deleteModele(modele.id_modele);
      navigate('/modeles');
    } catch (err: any) {
      console.error('Erreur suppression:', err);
      alert('Erreur lors de la suppression');
    }
  };

  if (loading) {
    return (
      <div className="ml-64 p-6 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !modele) {
    return (
      <div className="ml-64 p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error || 'Modèle non trouvé'}</p>
          <Link to="/modeles" className="mt-4 inline-block text-blue-600 hover:underline">
            ← Retour à la liste
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="ml-64 p-6">
      {/* Header avec boutons d'action */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/modeles"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Retour</span>
          </Link>
          <div className="h-6 w-px bg-gray-300"></div>
          <h1 className="text-3xl font-bold text-gray-900">{modele.designation}</h1>
          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm">
            {modele.code_modele}
          </span>
          {modele.actif ? (
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm">Actif</span>
          ) : (
            <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded text-sm">Inactif</span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/modeles?edit=${modele.id_modele}`)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Edit className="w-4 h-4" />
            Modifier
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <Trash2 className="w-4 h-4" />
            Supprimer
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne principale - Informations détaillées */}
        <div className="lg:col-span-2 space-y-6">
          {/* Photo du modèle */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Photo du modèle
              </h2>
            </div>
            <div className="p-6">
              <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                {modele.photo_modele ? (
                  <img src={modele.photo_modele} alt={modele.designation} className="w-full h-full object-contain" />
                ) : (
                  <ImageIcon className="w-16 h-16 text-gray-400" />
                )}
              </div>
            </div>
          </div>

          {/* Informations générales */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-4 border-b bg-gray-50">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Layers className="w-5 h-5" />
                Informations générales
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Code modèle</label>
                  <p className="text-gray-900 font-mono">{modele.code_modele}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Produit</label>
                  <p className="text-gray-900">{modele.produit}</p>
                </div>
              </div>
              {modele.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <p className="text-gray-900">{modele.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Attributs */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-4 border-b bg-gray-50">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Tag className="w-5 h-5" />
                Attributs configurables
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dimensions disponibles</label>
                <div className="flex flex-wrap gap-2">
                  {modele.code_dimensions.map((dim, idx) => (
                    <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                      {modele.code_dimensions[idx]} {modele.code_dimensions[idx] && `(${modele.code_dimensions[idx]})`}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Types de tissage</label>
                <div className="flex flex-wrap gap-2">
                  {modele.type_tissage.map((tissage, idx) => (
                    <span key={idx} className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm">
                      {tissage} {modele.code_type_tissage[idx] && `(${modele.code_type_tissage[idx]})`}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de couleurs</label>
                <div className="flex flex-wrap gap-2">
                  {modele.nombre_couleur.map((nb, idx) => (
                    <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-800 rounded text-sm">
                      {nb} {modele.code_nombre_couleur[idx] && `(${modele.code_nombre_couleur[idx]})`}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Types de finition</label>
                <div className="flex flex-wrap gap-2">
                  {modele.type_finition.map((fin, idx) => (
                    <span key={idx} className="px-3 py-1 bg-orange-100 text-orange-800 rounded text-sm">
                      {fin} {modele.code_type_finition[idx] && `(${modele.code_type_finition[idx]})`}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Colonne latérale - Informations complémentaires */}
        <div className="space-y-6">
          {/* Prix */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-4 border-b bg-gray-50">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Prix
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prix de revient</label>
                <p className="text-2xl font-bold text-gray-900">{Number(modele.prix_reviens || 0).toFixed(2)} TND</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prix de vente</label>
                <p className="text-2xl font-bold text-green-600">{Number(modele.prix_vente || 0).toFixed(2)} TND</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Marge</label>
                <p className="text-lg font-semibold text-blue-600">
                  {modele.prix_vente && modele.prix_reviens 
                    ? ((modele.prix_vente - modele.prix_reviens) / modele.prix_reviens * 100).toFixed(1)
                    : '0'}%
                </p>
              </div>
            </div>
          </div>

          {/* Statistiques */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-4 border-b bg-gray-50">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Informations
              </h2>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Composition fabrication</span>
                <span className="font-medium">{modele.composition_fabrication}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Dans catalogue</span>
                {modele.dans_catalogue_produit ? (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">Oui</span>
                ) : (
                  <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">Non</span>
                )}
              </div>
              {modele.description_auto !== undefined && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Description auto</span>
                  {modele.description_auto ? (
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Oui</span>
                  ) : (
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">Non</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Actions rapides */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-4 border-b bg-gray-50">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Actions rapides
              </h2>
            </div>
            <div className="p-4 space-y-2">
              <Link
                to={`/articles?modele=${modele.code_modele}`}
                className="block w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded"
              >
                Voir les articles de ce modèle
              </Link>
              <Link
                to={`/of?modele=${modele.code_modele}`}
                className="block w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded"
              >
                Voir les OF de ce modèle
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModeleDetails;
