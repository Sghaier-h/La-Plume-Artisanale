/**
 * SaleOrders - Page de gestion des commandes de vente
 */

import React, { useState, useEffect } from 'react';
import api from '../services/api';
import SaleOrderForm from '../components/erp/SaleOrderForm';

const SaleOrders: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    state: '',
    partner_id: ''
  });

  useEffect(() => {
    loadOrders();
  }, [filters]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filters.search) params.search = filters.search;
      if (filters.state) params.state = filters.state;
      if (filters.partner_id) params.partner_id = filters.partner_id;

      const response = await api.get('/api/sale/orders', { params });
      setOrders(response.data.data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedOrder(null);
    setShowForm(true);
  };

  const handleEdit = (id: string) => {
    setSelectedOrder(id);
    setShowForm(true);
  };

  const handleSave = () => {
    setShowForm(false);
    setSelectedOrder(null);
    loadOrders();
  };

  const handleCancel = () => {
    setShowForm(false);
    setSelectedOrder(null);
  };

  const handleConfirm = async (id: string) => {
    try {
      await api.post(`/api/sale/orders/${id}/confirm`);
      loadOrders();
    } catch (error) {
      console.error('Error confirming order:', error);
    }
  };

  const handleCancelOrder = async (id: string) => {
    try {
      await api.post(`/api/sale/orders/${id}/cancel`);
      loadOrders();
    } catch (error) {
      console.error('Error canceling order:', error);
    }
  };

  if (showForm) {
    return (
      <div className="sale-orders-page">
        <div className="page-header">
          <h1>{selectedOrder ? 'Modifier la commande' : 'Nouvelle commande'}</h1>
          <button onClick={handleCancel} className="btn btn-secondary">
            Retour
          </button>
        </div>
        <SaleOrderForm
          recordId={selectedOrder || undefined}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>
    );
  }

  return (
    <div className="sale-orders-page">
      <div className="page-header">
        <h1>Commandes de vente</h1>
        <button onClick={handleCreate} className="btn btn-primary">
          Nouvelle commande
        </button>
      </div>

      {/* Filtres */}
      <div className="filters">
        <input
          type="text"
          placeholder="Rechercher..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
        <select
          value={filters.state}
          onChange={(e) => setFilters({ ...filters, state: e.target.value })}
        >
          <option value="">Tous les états</option>
          <option value="draft">Brouillon</option>
          <option value="sent">Envoyé</option>
          <option value="sale">Confirmé</option>
          <option value="cancel">Annulé</option>
        </select>
      </div>

      {/* Liste */}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Référence</th>
              <th>Client</th>
              <th>Date</th>
              <th>Total</th>
              <th>État</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.name}</td>
                <td>{order.partner_id?.name || order.partner_id}</td>
                <td>{new Date(order.date_order).toLocaleDateString()}</td>
                <td>{order.amount_total?.toFixed(2)}</td>
                <td>
                  <span className={`badge badge-${order.state}`}>
                    {order.state === 'draft' ? 'Brouillon' : order.state === 'sent' ? 'Envoyé' : order.state === 'sale' ? 'Confirmé' : order.state === 'cancel' ? 'Annulé' : order.state}
                  </span>
                </td>
                <td>
                  <button
                    onClick={() => handleEdit(order.id)}
                    className="btn btn-sm btn-primary"
                  >
                    Modifier
                  </button>
                  {order.state === 'draft' && (
                    <button
                      onClick={() => handleConfirm(order.id)}
                      className="btn btn-sm btn-success"
                    >
                      Confirmer
                    </button>
                  )}
                  {!['cancel', 'done'].includes(order.state) && (
                    <button
                      onClick={() => handleCancelOrder(order.id)}
                      className="btn btn-sm btn-danger"
                    >
                      Annuler
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default SaleOrders;
