import React, { useEffect, useState } from 'react';
import { Truck, Plus, Edit, Trash2, Search, Download, Eye, CheckCircle } from 'lucide-react';
import { commandesService, clientsService } from '../services/api';

const BonLivraison: React.FC = () => {
  const [bonsLivraison, setBonsLivraison] = useState<any[]>([]);
  const [commandes, setCommandes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ statut: '', client_id: '' });

  useEffect(() => {
    loadData();
  }, [filters, search]);

  const loadData = async () => {
    try {
      // TODO: Remplacer par l'API réelle des bons de livraison
      const mockBL = [
        { id: 1, numero: 'BL-2024-001', commande: 'CMD-2024-001', client: 'Client A', date: '2024-01-20', statut: 'livré' },
        { id: 2, numero: 'BL-2024-002', commande: 'CMD-2024-002', client: 'Client B', date: '2024-01-21', statut: 'en_cours' },
      ];
      setBonsLivraison(mockBL);
      
      const cmdRes = await commandesService.getCommandes().catch(() => ({ data: { data: [] } }));
      setCommandes(cmdRes.data?.data || []);
    } catch (error) {
      console.error('Erreur chargement BL:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatutColor = (statut: string) => {
    const colors: { [key: string]: string } = {
      'en_preparation': 'bg-yellow-100 text-yellow-800',
      'en_cours': 'bg-blue-100 text-blue-800',
      'livré': 'bg-green-100 text-green-800',
      'annulé': 'bg-red-100 text-red-800'
    };
    return colors[statut] || 'bg-gray-100 text-gray-800';
  };

  const filteredBL = bonsLivraison.filter(bl =>
    bl.numero?.toLowerCase().includes(search.toLowerCase()) ||
    bl.client?.toLowerCase().includes(search.toLowerCase())
  );

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
              <Truck className="w-8 h-8 text-blue-600" />
              Bons de Livraison
            </h1>
            <p className="text-gray-600 mt-2">Gestion et suivi des livraisons</p>
          </div>
          <button
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nouveau BL
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
              <option value="en_preparation">En préparation</option>
              <option value="en_cours">En cours</option>
              <option value="livré">Livré</option>
              <option value="annulé">Annulé</option>
            </select>
          </div>
        </div>

        {/* Liste */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Numéro BL</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commande</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredBL.map((bl) => (
                <tr key={bl.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{bl.numero}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{bl.commande}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{bl.client}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{bl.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatutColor(bl.statut)}`}>
                      {bl.statut}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      <button className="text-blue-600 hover:text-blue-700">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-700">
                        <Download className="w-4 h-4" />
                      </button>
                      <button className="text-purple-600 hover:text-purple-700">
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BonLivraison;
