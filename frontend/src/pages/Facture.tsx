import React, { useEffect, useState } from 'react';
import { Receipt, Plus, Edit, Trash2, Search, Download, Eye, Send } from 'lucide-react';
import { facturesService, clientsService } from '../services/api';

const Facture: React.FC = () => {
  const [factures, setFactures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ statut: '', client_id: '' });

  useEffect(() => {
    loadData();
  }, [filters, search]);

  const loadData = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filters.statut) params.statut = filters.statut.toUpperCase();
      if (filters.client_id) params.client_id = filters.client_id;
      if (search) params.search = search;

      const facturesRes = await facturesService.getFactures(params).catch(() => ({ data: { data: [], success: false } }));
      
      if (facturesRes.data?.success) {
        setFactures(facturesRes.data.data || []);
      } else {
        setFactures([]);
      }
    } catch (error) {
      console.error('Erreur chargement factures:', error);
      setFactures([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatutColor = (statut: string) => {
    const statutLower = statut?.toLowerCase() || '';
    const colors: { [key: string]: string } = {
      'brouillon': 'bg-gray-100 text-gray-800',
      'en_attente': 'bg-yellow-100 text-yellow-800',
      'payee': 'bg-green-100 text-green-800',
      'payée': 'bg-green-100 text-green-800',
      'reglee': 'bg-green-100 text-green-800',
      'partiellement_payee': 'bg-blue-100 text-blue-800',
      'partiellement_payée': 'bg-blue-100 text-blue-800',
      'impayee': 'bg-red-100 text-red-800',
      'impayée': 'bg-red-100 text-red-800',
      'annulee': 'bg-orange-100 text-orange-800',
      'annulée': 'bg-orange-100 text-orange-800'
    };
    return colors[statutLower] || 'bg-gray-100 text-gray-800';
  };

  const filteredFactures = factures.filter(f => {
    if (search && !f.numero_facture?.toLowerCase().includes(search.toLowerCase()) && 
        !f.client_nom?.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (filters.statut && f.statut !== filters.statut.toUpperCase()) {
      return false;
    }
    if (filters.client_id && f.id_client?.toString() !== filters.client_id) {
      return false;
    }
    return true;
  });

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
              <Receipt className="w-8 h-8 text-blue-600" />
              Factures
            </h1>
            <p className="text-gray-600 mt-2">Gestion et suivi des factures clients</p>
          </div>
          <button
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nouvelle Facture
          </button>
        </div>

        {/* Filtres */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filters.statut}
              onChange={(e) => setFilters({ ...filters, statut: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous les statuts</option>
              <option value="BROUILLON">Brouillon</option>
              <option value="EN_ATTENTE">En attente</option>
              <option value="REGLEE">Réglée</option>
              <option value="PARTIELLEMENT_REGLEE">Partiellement réglée</option>
              <option value="IMPAYEE">Impayée</option>
              <option value="ANNULEE">Annulée</option>
            </select>
          </div>
        </div>

        {/* Liste */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Numéro</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant TTC</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredFactures.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Aucune facture trouvée
                  </td>
                </tr>
              ) : (
                filteredFactures.map((facture) => (
                  <tr key={facture.id_facture} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{facture.numero_facture}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{facture.client_nom}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{facture.date_facture}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-semibold">{facture.montant_ttc?.toFixed(2)} TND</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatutColor(facture.statut)}`}>
                        {facture.statut}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button 
                          onClick={async () => {
                            try {
                              const result = await facturesService.getFactureById(facture.id_facture);
                              console.log('Détails facture:', result.data);
                            } catch (error) {
                              console.error('Erreur chargement facture:', error);
                            }
                          }}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-700">
                          <Download className="w-4 h-4" />
                        </button>
                        <button className="text-purple-600 hover:text-purple-700">
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Facture;
