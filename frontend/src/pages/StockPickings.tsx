import React, { useEffect, useState } from 'react';
import { stockPickingsService } from '../services/api';
import { Truck, Plus, Edit, Trash2, Search, CheckCircle, Package, Calendar, User } from 'lucide-react';

const StockPickings: React.FC = () => {
  const [pickings, setPickings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPicking, setEditingPicking] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ state: '', picking_type_id: '' });

  useEffect(() => {
    loadPickings();
  }, [filters, search]);

  const loadPickings = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (search) params.search = search;
      if (filters.state) params.state = filters.state;
      if (filters.picking_type_id) params.picking_type_id = filters.picking_type_id;

      const response = await stockPickingsService.getPickings(params);
      setPickings(Array.isArray(response.data) ? response.data : response.data.data || []);
    } catch (error) {
      console.error('Erreur chargement livraisons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingPicking(null);
    setShowForm(true);
  };

  const handleEdit = (picking: any) => {
    setEditingPicking(picking);
    setShowForm(true);
  };

  const handleValidate = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir valider cette livraison ?')) {
      try {
        await stockPickingsService.validatePicking(id);
        loadPickings();
        alert('Livraison validée avec succès');
      } catch (error: any) {
        alert(error.response?.data?.error?.message || 'Erreur lors de la validation');
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette livraison ?')) {
      try {
        await stockPickingsService.deletePicking(id);
        loadPickings();
      } catch (error: any) {
        alert(error.response?.data?.error?.message || 'Erreur lors de la suppression');
      }
    }
  };

  const getStateBadge = (state: string) => {
    const states: { [key: string]: { bg: string; text: string; label: string } } = {
      draft: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Brouillon' },
      assigned: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Assigné' },
      done: { bg: 'bg-green-100', text: 'text-green-800', label: 'Terminé' },
      cancel: { bg: 'bg-red-100', text: 'text-red-800', label: 'Annulé' },
    };
    const stateStyle = states[state] || states.draft;
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${stateStyle.bg} ${stateStyle.text}`}>
        {stateStyle.label}
      </span>
    );
  };

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
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <Truck className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-800">Livraisons / Réceptions</h1>
            </div>
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-5 h-5" />
              Nouvelle Livraison
            </button>
          </div>

          {/* Filtres */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
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
            </div>
            <select
              value={filters.state}
              onChange={(e) => setFilters({ ...filters, state: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous les états</option>
              <option value="draft">Brouillon</option>
              <option value="assigned">Assigné</option>
              <option value="done">Terminé</option>
              <option value="cancel">Annulé</option>
            </select>
          </div>

          {/* Liste */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Référence</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Origine</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Destination</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date prévue</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">État</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {pickings.map((picking) => (
                  <tr key={picking.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{picking.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{picking.picking_type_id?.name || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{picking.location_id?.name || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{picking.location_dest_id?.name || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {picking.scheduled_date ? new Date(picking.scheduled_date).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm">{getStateBadge(picking.state)}</td>
                    <td className="px-4 py-3 text-sm text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEdit(picking)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {picking.state === 'assigned' && (
                          <button
                            onClick={() => handleValidate(picking.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded"
                            title="Valider"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {picking.state === 'draft' && (
                          <button
                            onClick={() => handleDelete(picking.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pickings.length === 0 && !loading && (
            <div className="text-center py-12">
              <Truck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Aucune livraison trouvée</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StockPickings;
