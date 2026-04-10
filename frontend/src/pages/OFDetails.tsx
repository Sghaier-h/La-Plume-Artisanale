import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, FileText, Package, Calendar, Clock, AlertCircle, TrendingUp, CheckCircle, Play, Square, Settings, User, BarChart3, Factory, X } from 'lucide-react';
import { ofService, suiviFabricationService } from '../services/api';

interface LigneOF {
  id_operation?: number;
  id_machine?: number;
  designation_operation?: string;
  machine_designation?: string;
  temps_unitaire?: number;
  temps_preparation?: number;
  ordre?: number;
}

interface OF {
  id_of?: number;
  numero_of: string;
  id_commande?: number;
  numero_commande?: string;
  id_article: number;
  article_designation?: string;
  code_article?: string;
  ref_commercial?: string;
  quantite_a_produire: number;
  quantite_produite?: number;
  statut: string;
  date_debut_prevue?: string;
  date_fin_prevue?: string;
  date_debut_reelle?: string;
  date_fin_reelle?: string;
  id_machine?: number;
  machine_designation?: string;
  priorite?: string;
  observations?: string;
  lignes_operations?: LigneOF[];
  date_creation?: string;
}

const OFDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [of, setOf] = useState<OF | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [suivis, setSuivis] = useState<any[]>([]);

  useEffect(() => {
    loadOF();
  }, [id]);

  const loadOF = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const response = await ofService.getOF(parseInt(id));
      setOf(response.data.data || response.data);
      
      // Charger les suivis de fabrication associés
      try {
        const suivisRes = await suiviFabricationService.getSuivisFabrication({ id_of: id });
        setSuivis(suivisRes.data?.data || []);
      } catch (err) {
        console.warn('Erreur chargement suivis:', err);
      }
    } catch (err: any) {
      console.error('Erreur chargement OF:', err);
      setError('Impossible de charger l\'ordre de fabrication');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!of?.id_of || !window.confirm('Êtes-vous sûr de vouloir supprimer cet ordre de fabrication ?')) {
      return;
    }

    // Note: deleteOF n'est peut-être pas disponible dans l'API actuelle
    // Dans ce cas, on peut annuler l'OF ou gérer autrement
    try {
      // Tenter d'annuler l'OF si deleteOF n'est pas disponible
      if (of.statut === 'en_attente' || of.statut === 'planifie') {
        // Optionnel : mettre à jour le statut à 'annule' au lieu de supprimer
        // await ofService.updateOF(of.id_of, { statut: 'annule' });
        alert('La suppression directe des OF n\'est pas disponible. Utilisez la fonction Annuler dans la liste.');
      }
      navigate('/of');
    } catch (err: any) {
      console.error('Erreur suppression:', err);
      alert('Erreur lors de la suppression');
    }
  };

  const handleDemarrer = async () => {
    if (!of?.id_of || !window.confirm('Démarrer cet ordre de fabrication ?\n\nCeci va créer automatiquement un suivi de fabrication.')) {
      return;
    }
    try {
      await ofService.demarrerOF(of.id_of);
      loadOF();
      alert('OF démarré avec succès');
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Erreur lors du démarrage');
    }
  };

  const getStatutBadge = (statut: string) => {
    const badges: { [key: string]: { color: string; icon: any; label: string } } = {
      'en_attente': { color: 'bg-gray-100 text-gray-800', icon: Clock, label: 'En attente' },
      'attribue': { color: 'bg-blue-100 text-blue-800', icon: FileText, label: 'Attribué' },
      'en_cours': { color: 'bg-yellow-100 text-yellow-800', icon: Play, label: 'En cours' },
      'termine': { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Terminé' },
      'suspendu': { color: 'bg-orange-100 text-orange-800', icon: AlertCircle, label: 'Suspendu' },
      'annule': { color: 'bg-red-100 text-red-800', icon: X, label: 'Annulé' }
    };
    const badge = badges[statut.toLowerCase()] || badges['en_attente'];
    const Icon = badge.icon;
    return (
      <span className={`px-3 py-1 rounded text-sm flex items-center gap-1 ${badge.color}`}>
        <Icon className="w-4 h-4" />
        {badge.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="ml-64 p-6 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !of) {
    return (
      <div className="ml-64 p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error || 'Ordre de fabrication non trouvé'}</p>
          <Link to="/of" className="mt-4 inline-block text-blue-600 hover:underline">
            ← Retour à la liste
          </Link>
        </div>
      </div>
    );
  }

  const quantiteRestante = Math.max(0, of.quantite_a_produire - (of.quantite_produite || 0));
  const pourcentageAvancement = of.quantite_a_produire > 0 
    ? ((of.quantite_produite || 0) / of.quantite_a_produire) * 100 
    : 0;

  return (
    <div className="ml-64 p-6">
      {/* Header avec boutons d'action */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/of"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Retour</span>
          </Link>
          <div className="h-6 w-px bg-gray-300"></div>
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{of.numero_of}</h1>
              <p className="text-sm text-gray-500">{of.article_designation || of.code_article}</p>
            </div>
          </div>
          {getStatutBadge(of.statut)}
        </div>
        <div className="flex gap-2">
          {of.statut === 'en_attente' || of.statut === 'attribue' ? (
            <button
              onClick={handleDemarrer}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Play className="w-4 h-4" />
              Démarrer
            </button>
          ) : null}
          <button
            onClick={() => navigate(`/of?edit=${of.id_of}`)}
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
          {/* Informations générales */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-4 border-b bg-gray-50">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Informations générales
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Numéro OF</label>
                  <p className="text-gray-900 font-mono font-semibold">{of.numero_of}</p>
                </div>
                {of.numero_commande && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Commande associée</label>
                    <Link to={`/commandes?search=${of.numero_commande}`} className="text-blue-600 hover:underline font-mono">
                      {of.numero_commande}
                    </Link>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Article</label>
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-900">{of.article_designation || of.code_article}</p>
                  {of.id_article && (
                    <Link to={`/articles/${of.id_article}`} className="text-blue-600 hover:underline text-sm">
                      Voir l'article
                    </Link>
                  )}
                </div>
                {of.ref_commercial && (
                  <p className="text-sm text-gray-500 mt-1 font-mono">{of.ref_commercial}</p>
                )}
              </div>
              {of.observations && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Observations</label>
                  <p className="text-gray-900 whitespace-pre-wrap">{of.observations}</p>
                </div>
              )}
            </div>
          </div>

          {/* Progression */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-4 border-b bg-gray-50">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Progression
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Avancement</span>
                  <span className="text-sm font-semibold text-gray-900">{pourcentageAvancement.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-blue-600 h-4 rounded-full transition-all"
                    style={{ width: `${Math.min(100, pourcentageAvancement)}%` }}
                  ></div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-2">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{of.quantite_produite || 0}</p>
                  <p className="text-xs text-gray-500">Produite</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">{quantiteRestante}</p>
                  <p className="text-xs text-gray-500">Restante</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{of.quantite_a_produire}</p>
                  <p className="text-xs text-gray-500">Totale</p>
                </div>
              </div>
            </div>
          </div>

          {/* Lignes d'opérations */}
          {of.lignes_operations && of.lignes_operations.length > 0 && (
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-4 border-b bg-gray-50">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Lignes d'opérations
                </h2>
              </div>
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ordre</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Opération</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Machine</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Temps unitaire</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Temps préparation</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {of.lignes_operations.map((ligne, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">{ligne.ordre || idx + 1}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">{ligne.designation_operation || '-'}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">{ligne.machine_designation || '-'}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">{ligne.temps_unitaire || 0} min</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">{ligne.temps_preparation || 0} min</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Suivis de fabrication */}
          {suivis.length > 0 && (
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-4 border-b bg-gray-50">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Suivis de fabrication
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {suivis.map((suivi, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold">{suivi.numero_suivi || `Suivi ${idx + 1}`}</p>
                          {suivi.machine_designation && (
                            <p className="text-sm text-gray-600">Machine: {suivi.machine_designation}</p>
                          )}
                        </div>
                        <span className={`px-2 py-1 rounded text-xs ${
                          suivi.statut === 'TERMINE' ? 'bg-green-100 text-green-800' :
                          suivi.statut === 'EN_COURS' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {suivi.statut || 'EN_ATTENTE'}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
                        <div>
                          <p className="text-gray-500">Quantité produite</p>
                          <p className="font-semibold">{suivi.quantite_produite || 0}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Quantité bonne</p>
                          <p className="font-semibold text-green-600">{suivi.quantite_bonne || 0}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Rendement</p>
                          <p className="font-semibold">{suivi.rendement ? `${suivi.rendement.toFixed(1)}%` : '-'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Colonne latérale - Informations complémentaires */}
        <div className="space-y-6">
          {/* Dates */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-4 border-b bg-gray-50">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Dates
              </h2>
            </div>
            <div className="p-6 space-y-3">
              {of.date_debut_prevue && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Début prévu</label>
                  <p className="text-gray-900">{new Date(of.date_debut_prevue).toLocaleDateString('fr-FR')}</p>
                </div>
              )}
              {of.date_fin_prevue && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fin prévue</label>
                  <p className="text-gray-900">{new Date(of.date_fin_prevue).toLocaleDateString('fr-FR')}</p>
                </div>
              )}
              {of.date_debut_reelle && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Début réel</label>
                  <p className="text-gray-900 text-green-600">{new Date(of.date_debut_reelle).toLocaleDateString('fr-FR')}</p>
                </div>
              )}
              {of.date_fin_reelle && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fin réelle</label>
                  <p className="text-gray-900 text-green-600">{new Date(of.date_fin_reelle).toLocaleDateString('fr-FR')}</p>
                </div>
              )}
            </div>
          </div>

          {/* Machine assignée */}
          {of.machine_designation && (
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-4 border-b bg-gray-50">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Factory className="w-5 h-5" />
                  Machine assignée
                </h2>
              </div>
              <div className="p-6">
                <p className="text-gray-900 font-medium">{of.machine_designation}</p>
                {of.id_machine && (
                  <Link to={`/machines/${of.id_machine}`} className="mt-2 inline-block text-sm text-blue-600 hover:underline">
                    Voir la machine
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Informations */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-4 border-b bg-gray-50">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Informations
              </h2>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Priorité</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  of.priorite === 'haute' ? 'bg-red-100 text-red-800' :
                  of.priorite === 'normale' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {of.priorite || 'normale'}
                </span>
              </div>
              {of.date_creation && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Date de création</span>
                  <span className="font-medium">
                    {new Date(of.date_creation).toLocaleDateString('fr-FR')}
                  </span>
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
              {of.id_article && (
                <Link
                  to={`/articles/${of.id_article}`}
                  className="block w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded"
                >
                  Voir l'article
                </Link>
              )}
              <Link
                to={`/suivi-fabrication?of=${of.id_of}`}
                className="block w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded"
              >
                Voir les suivis de fabrication
              </Link>
              {of.id_commande && (
                <Link
                  to={`/commandes?search=${of.numero_commande}`}
                  className="block w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded"
                >
                  Voir la commande
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OFDetails;
