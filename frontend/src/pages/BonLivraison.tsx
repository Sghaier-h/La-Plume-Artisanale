import React, { useEffect, useState } from 'react';
import { Truck, Plus, Edit, Trash2, Search, Download, Eye, CheckCircle } from 'lucide-react';
import { bonsLivraisonService, commandesService, clientsService } from '../services/api';

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
      setLoading(true);
      const params: any = {};
      if (filters.statut) params.statut = filters.statut.toUpperCase();
      if (filters.client_id) params.client_id = filters.client_id;
      if (search) params.search = search;

      const [blRes, cmdRes] = await Promise.all([
        bonsLivraisonService.getBonsLivraison(params).catch(() => ({ data: { data: [], success: false } })),
        commandesService.getCommandes().catch(() => ({ data: { data: [] } }))
      ]);

      if (blRes.data?.success) {
        setBonsLivraison(blRes.data.data || []);
      } else {
        setBonsLivraison([]);
      }
      
      setCommandes(cmdRes.data?.data || []);
    } catch (error) {
      console.error('Erreur chargement BL:', error);
      setBonsLivraison([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatutColor = (statut: string) => {
    const statutLower = statut?.toLowerCase() || '';
    const colors: { [key: string]: string } = {
      'brouillon': 'bg-gray-100 text-gray-800',
      'en_preparation': 'bg-yellow-100 text-yellow-800',
      'prepare': 'bg-yellow-100 text-yellow-800',
      'en_cours': 'bg-blue-100 text-blue-800',
      'livre': 'bg-green-100 text-green-800',
      'livré': 'bg-green-100 text-green-800',
      'livree': 'bg-green-100 text-green-800',
      'annule': 'bg-red-100 text-red-800',
      'annulé': 'bg-red-100 text-red-800'
    };
    return colors[statutLower] || 'bg-gray-100 text-gray-800';
  };

  const filteredBL = bonsLivraison.filter(bl => {
    if (search && !bl.numero_bl?.toLowerCase().includes(search.toLowerCase()) && 
        !bl.client_nom?.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (filters.statut && bl.statut !== filters.statut.toUpperCase()) {
      return false;
    }
    if (filters.client_id && bl.id_client?.toString() !== filters.client_id) {
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
              <option value="BROUILLON">Brouillon</option>
              <option value="PREPARE">Préparé</option>
              <option value="LIVREE">Livré</option>
              <option value="ANNULE">Annulé</option>
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
              {filteredBL.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Aucun bon de livraison trouvé
                  </td>
                </tr>
              ) : (
                filteredBL.map((bl) => (
                  <tr key={bl.id_bl} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{bl.numero_bl}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{bl.numero_commande || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{bl.client_nom}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{bl.date_livraison}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatutColor(bl.statut)}`}>
                        {bl.statut}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button 
                          onClick={async () => {
                            try {
                              const result = await bonsLivraisonService.getBonLivraisonById(bl.id_bl);
                              console.log('Détails BL:', result.data);
                            } catch (error) {
                              console.error('Erreur chargement BL:', error);
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
                          <CheckCircle className="w-4 h-4" />
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

export default BonLivraison;
