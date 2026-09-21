import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, FileText, Package, Calendar, Clock, User, DollarSign, Truck, ShoppingCart, CheckCircle, X, AlertCircle } from 'lucide-react';
import { commandesService, clientsService, articlesService } from '../services/api';

interface LigneCommande {
  id_article_commande?: number;
  id_article?: number;
  ref_commerciale?: string;
  description_article?: string;
  dimensions?: string;
  type_finition?: string;
  quantite_commandee: number;
  quantite_produite?: number;
  quantite_livree?: number;
  prix_unitaire: number;
  prix_total_ht?: number;
  remise?: number;
  personnalisation?: boolean;
  details_personnalisation?: string;
  date_livraison_prevue?: string;
  statut?: string;
  article?: any;
}

interface Commande {
  id_commande: number;
  numero_commande: string;
  id_client: number;
  client_nom?: string;
  client_raison_sociale?: string;
  ref_client?: string;
  num_commande_client?: string;
  date_commande: string;
  date_livraison_prevue?: string;
  date_envoie?: string;
  statut: string;
  priorite?: string;
  montant_total?: number;
  devise?: string;
  conditions_paiement?: string;
  adresse_livraison?: string;
  observations?: string;
  lignes?: LigneCommande[];
}

const CommandeDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [commande, setCommande] = useState<Commande | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCommande();
  }, [id]);

  const loadCommande = async () => {
    if (!id) {
      setError('ID de la commande manquant.');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const response = await commandesService.getCommande(parseInt(id));
      const data = response.data.data || response.data;
      setCommande(data);
    } catch (err: any) {
      console.error('Erreur chargement commande:', err);
      setError(`Impossible de charger la commande. Erreur: ${err.message || 'Inconnue'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!commande?.id_commande || !window.confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) {
      return;
    }
    try {
      // Note: deleteCommande n'est peut-être pas disponible
      alert('La suppression directe des commandes n\'est pas disponible. Utilisez la fonction Annuler dans la liste.');
      navigate('/commandes');
    } catch (err: any) {
      console.error('Erreur suppression:', err);
      alert('Erreur lors de la suppression');
    }
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'validee':
        return 'bg-green-100 text-green-800';
      case 'en_production':
        return 'bg-blue-100 text-blue-800';
      case 'livree':
        return 'bg-gray-100 text-gray-800';
      case 'annulee':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getPrioriteColor = (priorite?: string) => {
    switch (priorite) {
      case 'urgente':
        return 'bg-red-100 text-red-800';
      case 'haute':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="ml-64 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-red-600" />
                <div>
                  <h3 className="text-lg font-semibold text-red-800">Erreur</h3>
                  <p className="text-red-600">{error}</p>
                </div>
              </div>
              <div className="mt-4 flex gap-3">
                <button
                  onClick={loadCommande}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Réessayer
                </button>
                <Link
                  to="/commandes"
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Retour à la liste
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!commande) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="ml-64 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600">Commande non trouvée.</p>
              <Link to="/commandes" className="text-blue-600 hover:text-blue-700 mt-4 inline-block">
                Retour à la liste
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalHT = commande.lignes?.reduce((sum, ligne) => {
    const prixUnitaire = ligne.prix_unitaire || 0;
    const quantite = ligne.quantite_commandee || 0;
    const remise = ligne.remise || 0;
    return sum + (prixUnitaire * quantite * (1 - remise / 100));
  }, 0) || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="ml-64 p-6">
        <div className="max-w-7xl mx-auto">
          {/* En-tête */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Link
                to="/commandes"
                className="text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Commande {commande.numero_commande}</h1>
                <p className="text-gray-600 mt-1">
                  Créée le {new Date(commande.date_commande).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link
                to={`/commandes?edit=${commande.id_commande}`}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Edit className="w-4 h-4" />
                Modifier
              </Link>
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4" />
                Supprimer
              </button>
            </div>
          </div>

          {/* Informations principales */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Informations commande */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Informations Commande
              </h2>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-600">Numéro:</span>
                  <p className="font-semibold">{commande.numero_commande}</p>
                </div>
                {commande.num_commande_client && (
                  <div>
                    <span className="text-sm text-gray-600">Num Commande Client:</span>
                    <p className="font-semibold">{commande.num_commande_client}</p>
                  </div>
                )}
                <div>
                  <span className="text-sm text-gray-600">Statut:</span>
                  <span className={`ml-2 px-2 py-1 text-xs rounded ${getStatutColor(commande.statut)}`}>
                    {commande.statut}
                  </span>
                </div>
                {commande.priorite && (
                  <div>
                    <span className="text-sm text-gray-600">Priorité:</span>
                    <span className={`ml-2 px-2 py-1 text-xs rounded ${getPrioriteColor(commande.priorite)}`}>
                      {commande.priorite}
                    </span>
                  </div>
                )}
                <div>
                  <span className="text-sm text-gray-600">Date Commande:</span>
                  <p className="font-semibold">{new Date(commande.date_commande).toLocaleDateString('fr-FR')}</p>
                </div>
                {commande.date_livraison_prevue && (
                  <div>
                    <span className="text-sm text-gray-600">Date Livraison Prévue:</span>
                    <p className="font-semibold">{new Date(commande.date_livraison_prevue).toLocaleDateString('fr-FR')}</p>
                  </div>
                )}
                {commande.date_envoie && (
                  <div>
                    <span className="text-sm text-gray-600">Date d'Envoie:</span>
                    <p className="font-semibold">{new Date(commande.date_envoie).toLocaleDateString('fr-FR')}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Informations client */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Client
              </h2>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-600">Nom:</span>
                  <p className="font-semibold">{commande.client_nom || commande.client_raison_sociale || 'N/A'}</p>
                </div>
                {commande.ref_client && (
                  <div>
                    <span className="text-sm text-gray-600">Référence Client:</span>
                    <p className="font-semibold">{commande.ref_client}</p>
                  </div>
                )}
                <Link
                  to={`/clients/${commande.id_client}`}
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  Voir les détails du client →
                </Link>
              </div>
            </div>

            {/* Totaux */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Totaux
              </h2>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-600">Total HT:</span>
                  <p className="font-semibold text-lg">{totalHT.toFixed(2)} {commande.devise || 'TND'}</p>
                </div>
                {commande.montant_total && (
                  <div>
                    <span className="text-sm text-gray-600">Montant Total:</span>
                    <p className="font-semibold text-lg">{commande.montant_total.toFixed(2)} {commande.devise || 'TND'}</p>
                  </div>
                )}
                {commande.conditions_paiement && (
                  <div>
                    <span className="text-sm text-gray-600">Conditions Paiement:</span>
                    <p className="font-semibold">{commande.conditions_paiement}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Lignes de commande */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Lignes de Commande ({commande.lignes?.length || 0})
            </h2>
            {commande.lignes && commande.lignes.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Réf. Commerciale</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dimensions</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Finition</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantité</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prix Unitaire</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Remise</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total HT</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Personnalisation</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {commande.lignes.map((ligne, index) => {
                      const prixUnitaire = ligne.prix_unitaire || 0;
                      const quantite = ligne.quantite_commandee || 0;
                      const remise = ligne.remise || 0;
                      const totalLigne = prixUnitaire * quantite * (1 - remise / 100);
                      
                      return (
                        <tr key={ligne.id_article_commande || index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap">
                            {ligne.ref_commerciale ? (
                              <Link
                                to={`/articles?ref=${ligne.ref_commerciale}`}
                                className="text-blue-600 hover:text-blue-700 font-medium"
                              >
                                {ligne.ref_commerciale}
                              </Link>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-gray-900">
                              {ligne.description_article || ligne.article?.description_article || '-'}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                            {ligne.dimensions || '-'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                            {ligne.type_finition || '-'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            <div>
                              <span className="font-medium">{quantite}</span>
                              {ligne.quantite_produite !== undefined && ligne.quantite_produite > 0 && (
                                <span className="text-gray-500 ml-2">
                                  (Produite: {ligne.quantite_produite})
                                </span>
                              )}
                              {ligne.quantite_livree !== undefined && ligne.quantite_livree > 0 && (
                                <span className="text-gray-500 ml-2">
                                  (Livrée: {ligne.quantite_livree})
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            {prixUnitaire.toFixed(2)} {commande.devise || 'TND'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            {remise > 0 ? `${remise}%` : '-'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold">
                            {totalLigne.toFixed(2)} {commande.devise || 'TND'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {ligne.personnalisation ? (
                              <div>
                                <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">Oui</span>
                                {ligne.details_personnalisation && (
                                  <div className="mt-1 text-xs text-gray-600 max-w-xs truncate" title={ligne.details_personnalisation}>
                                    {ligne.details_personnalisation}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-800">Non</span>
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded ${getStatutColor(ligne.statut || 'en_attente')}`}>
                              {ligne.statut || 'en_attente'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan={7} className="px-4 py-3 text-right font-semibold">
                        Total HT:
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap font-bold text-lg">
                        {totalHT.toFixed(2)} {commande.devise || 'TND'}
                      </td>
                      <td colSpan={2}></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <p className="text-gray-600">Aucune ligne de commande.</p>
            )}
          </div>

          {/* Observations */}
          {commande.observations && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Observations
              </h2>
              <p className="text-gray-700 whitespace-pre-wrap">{commande.observations}</p>
            </div>
          )}

          {/* Adresse de livraison */}
          {commande.adresse_livraison && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5" />
                Adresse de Livraison
              </h2>
              <p className="text-gray-700 whitespace-pre-wrap">{commande.adresse_livraison}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommandeDetails;
