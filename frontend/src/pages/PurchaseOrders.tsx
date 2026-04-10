import React, { useEffect, useState } from 'react';
import { purchaseOrdersService } from '../services/api';
import { ShoppingBag, Plus, Edit, Trash2, Search, CheckCircle, DollarSign, Calendar, User } from 'lucide-react';

const PurchaseOrders: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ state: '', partner_id: '' });

  useEffect(() => {
    loadOrders();
  }, [filters, search]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (search) params.search = search;
      if (filters.state) params.state = filters.state;
      if (filters.partner_id) params.partner_id = filters.partner_id;

      const response = await purchaseOrdersService.getOrders(params);
      setOrders(Array.isArray(response.data) ? response.data : response.data.data || []);
    } catch (error) {
      console.error('Erreur chargement commandes achat:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingOrder(null);
    setShowForm(true);
  };

  const handleEdit = (order: any) => {
    setEditingOrder(order);
    setShowForm(true);
  };

  const handleConfirm = async (id: number) => {
    if (window.confirm('Confirmer cette commande d\'achat ?')) {
      try {
        await purchaseOrdersService.confirmOrder(id);
        loadOrders();
        alert('Commande confirmée avec succès');
      } catch (error: any) {
        alert(error.response?.data?.error?.message || 'Erreur lors de la confirmation');
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) {
      try {
        await purchaseOrdersService.deleteOrder(id);
        loadOrders();
      } catch (error: any) {
        alert(error.response?.data?.error?.message || 'Erreur lors de la suppression');
      }
    }
  };

  const getStateBadge = (state: string) => {
    const states: { [key: string]: { bg: string; text: string; label: string } } = {
      draft: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Brouillon' },
      sent: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Envoyé' },
      purchase: { bg: 'bg-green-100', text: 'text-green-800', label: 'Confirmé' },
      done: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Réceptionné' },
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
              <ShoppingBag className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-800">Commandes d'Achat</h1>
            </div>
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-5 h-5" />
              Nouvelle Commande
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
              <option value="sent">Envoyé</option>
              <option value="purchase">Confirmé</option>
              <option value="done">Réceptionné</option>
              <option value="cancel">Annulé</option>
            </select>
          </div>

          {/* Liste */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Référence</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Fournisseur</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Montant</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">État</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{order.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{order.partner_id?.name || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {order.date_order ? new Date(order.date_order).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900 font-medium">
                      {order.amount_total ? `${order.amount_total.toFixed(2)} TND` : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm">{getStateBadge(order.state)}</td>
                    <td className="px-4 py-3 text-sm text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEdit(order)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {order.state === 'draft' && (
                          <button
                            onClick={() => handleConfirm(order.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded"
                            title="Confirmer"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {order.state === 'draft' && (
                          <button
                            onClick={() => handleDelete(order.id)}
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

          {orders.length === 0 && !loading && (
            <div className="text-center py-12">
              <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Aucune commande d'achat trouvée</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrders;
