import React, { useState, useEffect } from 'react';
import { multisocieteService } from '../services/api';
import { Building2, PlusCircle, ArrowRightLeft, TrendingUp } from 'lucide-react';

const MultiSociete: React.FC = () => {
  const [societes, setSocietes] = useState<any[]>([]);
  const [etablissements, setEtablissements] = useState<any[]>([]);
  const [transferts, setTransferts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'societes' | 'etablissements' | 'transferts'>('societes');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [societesRes, etablissementsRes, transfertsRes] = await Promise.all([
        multisocieteService.getSocietes(),
        multisocieteService.getEtablissements(),
        multisocieteService.getTransferts()
      ]);

      setSocietes(societesRes.data.data.societes || []);
      setEtablissements(etablissementsRes.data.data || []);
      setTransferts(transfertsRes.data.data || []);
    } catch (error) {
      console.error('Erreur chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'VALIDE': return 'bg-green-100 text-green-800';
      case 'EN_ATTENTE': return 'bg-yellow-100 text-yellow-800';
      case 'REFUSE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Building2 className="w-8 h-8" />
            Multi-Société
          </h1>
          <button
            onClick={() => {/* TODO: Modal création */}}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <PlusCircle className="w-5 h-5" />
            Nouvelle Société
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b">
          <button
            onClick={() => setActiveTab('societes')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'societes'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Sociétés ({societes.length})
          </button>
          <button
            onClick={() => setActiveTab('etablissements')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'etablissements'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Établissements ({etablissements.length})
          </button>
          <button
            onClick={() => setActiveTab('transferts')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'transferts'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Transferts ({transferts.length})
          </button>
        </div>

        {/* Contenu */}
        {activeTab === 'societes' && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Raison Sociale</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Forme Juridique</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SIRET</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ville</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {societes.map((societe: any) => (
                  <tr key={societe.id_societe}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {societe.code_societe}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {societe.raison_sociale}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {societe.forme_juridique || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {societe.siret || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {societe.ville_siege || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button className="text-blue-600 hover:text-blue-800">Voir</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'etablissements' && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Libellé</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Société</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ville</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {etablissements.map((etab: any) => (
                  <tr key={etab.id_etablissement}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {etab.code_etablissement}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {etab.libelle}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {etab.type_etablissement}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {etab.raison_sociale || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {etab.ville || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'transferts' && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Numéro</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Origine</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Destination</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transferts.map((transfert: any) => (
                  <tr key={transfert.id_transfert}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {transfert.numero_transfert}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {transfert.type_transfert}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {transfert.societe_origine_nom || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {transfert.societe_destination_nom || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {transfert.montant_ttc?.toLocaleString('fr-FR')} TND
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {new Date(transfert.date_transfert).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs ${getStatutColor(transfert.statut)}`}>
                        {transfert.statut}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiSociete;
