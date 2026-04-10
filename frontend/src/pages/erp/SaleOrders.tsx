/**
 * SaleOrdersOdoo - Commandes de Vente
 * Version complète avec design Odoo et langue française
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { saleOrdersService, stockPickingsService, accountMovesService } from '../../services/api';
import api from '../../services/api';
import { ERPHeader, ERPStatusbar, ERPNotebook, ERPChatter, ERPButtonBox } from '../../components/erp';
import KanbanView from '../../components/erp/KanbanView';
import { useApp } from '../../store/AppContext';
import { displayMany2One, formatDate, formatCurrency, formatState } from '../../utils/relations';
import { Plus, Edit, Trash2, Eye, CheckCircle, XCircle, Truck, Receipt, ShoppingCart, Minus, Trash, Package, Search, List, Grid } from 'lucide-react';

interface SaleOrder {
  id_commande: number;
  numero_commande: string;
  id_client: any;
  date_commande: string;
  montant_total: number;
  statut: 'draft' | 'sent' | 'sale' | 'cancel';
  lignes_commande?: any[];
  created_at?: string;
  updated_at?: string;
  // Alias pour compatibilité
  id?: number;
  name?: string;
  partner_id?: any;
  date_order?: string;
  amount_total?: number;
  state?: 'draft' | 'sent' | 'sale' | 'cancel';
  order_lines?: any[];
}

const SaleOrdersOdoo: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state: appState, updateOrderCartItem, removeFromOrderCart, clearOrderCart, addNotification } = useApp();
  const [orders, setOrders] = useState<SaleOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState<'list' | 'kanban' | 'form'>('list');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<SaleOrder | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [orderLines, setOrderLines] = useState<any[]>([]);
  const [relatedPickings, setRelatedPickings] = useState<any[]>([]);
  const [relatedInvoices, setRelatedInvoices] = useState<any[]>([]);

  useEffect(() => {
    loadOrders();
  }, [search]);

  useEffect(() => {
    if (location.state?.mode === 'create_with_cart' && appState.orderCart.items.length > 0) {
      setSelectedOrder(null);
      setShowForm(true);
      setViewType('form');
      const lines = appState.orderCart.items.map(item => ({
        product_id: item.product_id,
        product: item.product,
        product_uom_qty: item.quantity,
        price_unit: item.price,
        price_subtotal: item.quantity * item.price
      }));
      setOrderLines(lines);
    }
  }, [location.state, appState.orderCart.items]);

  useEffect(() => {
    if (selectedOrder?.id) {
      loadOrderDetails();
    }
  }, [selectedOrder?.id]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const params: any = { loadRelations: true };
      if (search) params.search = search;
      const response = await saleOrdersService.getOrders(params);
      const data = Array.isArray(response.data) ? response.data : response.data.data || [];
      setOrders(data);
    } catch (error) {
      console.error('Erreur chargement commandes:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOrderDetails = async () => {
    if (!selectedOrder?.id) return;
    try {
      const [orderResponse, pickingsResponse, invoicesResponse] = await Promise.all([
        saleOrdersService.getOrder(selectedOrder.id, { loadRelations: true }),
        stockPickingsService.getPickings({ sale_id: selectedOrder.id }),
        accountMovesService.getMoves({ sale_id: selectedOrder.id })
      ]);
      
      const orderData = orderResponse.data?.data || orderResponse.data;
      
      // Charger les lignes de commande
      if (orderData?.order_line) {
        setOrderLines(Array.isArray(orderData.order_line) ? orderData.order_line : []);
      } else if (orderData?.order_lines) {
        setOrderLines(Array.isArray(orderData.order_lines) ? orderData.order_lines : []);
      } else {
        // Charger depuis l'API si pas dans la réponse
        try {
          const linesResponse = await saleOrdersService.getOrderLines(selectedOrder.id);
          setOrderLines(linesResponse.data?.data || linesResponse.data || []);
        } catch (error) {
          console.error('Erreur chargement lignes:', error);
          setOrderLines([]);
        }
      }
      
      setRelatedPickings(pickingsResponse.data?.data || pickingsResponse.data || []);
      setRelatedInvoices(invoicesResponse.data?.data || invoicesResponse.data || []);
    } catch (error) {
      console.error('Erreur chargement détails:', error);
    }
  };

  const handleCreate = () => {
    setSelectedOrder(null);
    setOrderLines([]);
    setShowForm(true);
    setViewType('form');
  };

  const handleEdit = (order: SaleOrder) => {
    setSelectedOrder(order);
    setShowForm(true);
    setViewType('form');
  };

  const handleSave = async (formData: any) => {
    try {
      if (selectedOrder?.id) {
        await saleOrdersService.updateOrder(selectedOrder.id, { ...formData, order_lines: orderLines });
      } else {
        await saleOrdersService.createOrder({ ...formData, order_lines: orderLines });
        clearOrderCart();
      }
      addNotification({
        id: Date.now(),
        type: 'success',
        message: 'Commande enregistrée avec succès'
      });
      setShowForm(false);
      setSelectedOrder(null);
      setViewType('list');
      loadOrders();
    } catch (error: any) {
      addNotification({
        id: Date.now(),
        type: 'error',
        message: error.response?.data?.error?.message || 'Erreur lors de l\'enregistrement'
      });
    }
  };

  const handleConfirm = async (id: number) => {
    try {
      await saleOrdersService.confirmOrder(id);
      loadOrders();
      if (selectedOrder?.id === id) {
        loadOrderDetails();
      }
    } catch (error: any) {
      addNotification({
        id: Date.now(),
        type: 'error',
        message: error.response?.data?.error?.message || 'Erreur lors de la confirmation'
      });
    }
  };

  const handleCancelOrder = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) {
      try {
        await saleOrdersService.cancelOrder(id);
        loadOrders();
      } catch (error: any) {
        addNotification({
          id: Date.now(),
          type: 'error',
          message: error.response?.data?.error?.message || 'Erreur lors de l\'annulation'
        });
      }
    }
  };

  const getStatusColor = (state: string) => {
    const colors: Record<string, string> = {
      draft: 'draft',
      sent: 'confirmed',
      sale: 'done',
      cancel: 'cancelled'
    };
    return colors[state] || 'draft';
  };

  const getStatusLabel = (state: string) => {
    const labels: Record<string, string> = {
      draft: 'Brouillon',
      sent: 'Envoyé',
      sale: 'Confirmé',
      cancel: 'Annulé'
    };
    return labels[state] || state;
  };

  const kanbanColumns = [
    {
      id: 'draft',
      title: 'Brouillon',
      items: orders.filter(o => o.state === 'draft')
    },
    {
      id: 'sent',
      title: 'Envoyé',
      items: orders.filter(o => o.state === 'sent')
    },
    {
      id: 'sale',
      title: 'Confirmé',
      items: orders.filter(o => o.state === 'sale')
    },
    {
      id: 'cancel',
      title: 'Annulé',
      items: orders.filter(o => o.state === 'cancel')
    }
  ];

  if (showForm) {
    return (
      <SaleOrderForm
        order={selectedOrder}
        orderLines={orderLines}
        setOrderLines={setOrderLines}
        relatedPickings={relatedPickings}
        relatedInvoices={relatedInvoices}
        onClose={() => {
          setShowForm(false);
          setSelectedOrder(null);
          setViewType('list');
          loadOrders();
        }}
        onSave={handleSave}
        onConfirm={selectedOrder?.id ? () => handleConfirm(selectedOrder.id!) : undefined}
        onCancel={selectedOrder?.id ? () => handleCancelOrder(selectedOrder.id!) : undefined}
      />
    );
  }

  return (
    <div className="erp-layout">
      <ERPHeader
        title="Commandes de Vente"
        breadcrumb={[
          { label: 'Ventes', path: '/erp/home' },
          { label: 'Commandes' }
        ]}
        actions={
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                onClick={() => setViewType('list')}
                className={`erp-btn ${viewType === 'list' ? 'erp-btn-primary' : 'erp-btn-outline'}`}
                style={{ padding: '8px 12px' }}
              >
                <List size={16} />
              </button>
              <button
                onClick={() => setViewType('kanban')}
                className={`erp-btn ${viewType === 'kanban' ? 'erp-btn-primary' : 'erp-btn-outline'}`}
                style={{ padding: '8px 12px' }}
              >
                <Grid size={16} />
              </button>
            </div>
            <button onClick={handleCreate} className="erp-btn erp-btn-primary">
              <Plus size={16} style={{ marginRight: '4px' }} />
              Nouvelle Commande
            </button>
          </div>
        }
      />

      <div className="erp-content">
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <div style={{ flex: 1, display: 'flex', gap: '8px' }}>
            <Search size={20} style={{ color: 'var(--erp-text-muted)' }} />
            <input
              type="text"
              placeholder="Rechercher une commande..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="erp-field-input"
              style={{ flex: 1 }}
            />
          </div>
        </div>

        {viewType === 'kanban' ? (
          <KanbanView
            columns={kanbanColumns}
            onItemClick={(item) => handleEdit(item)}
            renderItem={(item) => (
              <div>
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                  {item.name}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--erp-text-secondary)', marginBottom: '8px' }}>
                  {item.partner_id?.[1] || 'Client'}
                </div>
                <div style={{ fontWeight: 600, color: 'var(--erp-primary)' }}>
                  {item.amount_total?.toFixed(2) || '0.00'} TND
                </div>
                <div style={{ fontSize: '11px', color: 'var(--erp-text-muted)', marginTop: '4px' }}>
                  {new Date(item.date_order).toLocaleDateString()}
                </div>
              </div>
            )}
          />
        ) : (
          <div className="erp-tree-view">
            <table className="erp-tree-table">
              <thead>
                <tr>
                  <th>Référence</th>
                  <th>Client</th>
                  <th>Date</th>
                  <th>Montant</th>
                  <th>État</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '32px' }}>
                      Chargement...
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--erp-text-muted)' }}>
                      Aucune commande
                    </td>
                  </tr>
                ) : (
                  orders.map(order => (
                    <tr key={order.id}>
                      <td>{order.name}</td>
                      <td>{displayMany2One(order.partner_id) || 'Client'}</td>
                      <td>{formatDate(order.date_order)}</td>
                      <td>{formatCurrency(order.amount_total)}</td>
                      <td>
                        <span className={`erp-status-badge ${formatState(order.state).color}`}>
                          {formatState(order.state).label}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            onClick={() => handleEdit(order)}
                            className="erp-btn erp-btn-outline"
                            style={{ padding: '4px 8px' }}
                          >
                            <Eye size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// Composant Formulaire
const SaleOrderForm: React.FC<{
  order: SaleOrder | null;
  orderLines: any[];
  setOrderLines: (lines: any[]) => void;
  relatedPickings: any[];
  relatedInvoices: any[];
  onClose: () => void;
  onSave: (data: any) => void;
  onConfirm?: () => void;
  onCancel?: () => void;
}> = ({ order, orderLines, setOrderLines, relatedPickings, relatedInvoices, onClose, onSave, onConfirm, onCancel }) => {
  const [formData, setFormData] = useState({
    partner_id: order?.partner_id || null,
    date_order: order?.date_order || new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [partners, setPartners] = useState<any[]>([]);

  useEffect(() => {
    loadPartners();
  }, []);

  const loadPartners = async () => {
    try {
      const response = await saleOrdersService.getOrders({ limit: 1000 });
      // Récupérer les partenaires depuis les commandes
      const partnersMap = new Map();
      (response.data?.data || []).forEach((o: any) => {
        if (o.partner_id && !partnersMap.has(o.partner_id[0])) {
          partnersMap.set(o.partner_id[0], o.partner_id);
        }
      });
      setPartners(Array.from(partnersMap.values()));
    } catch (error) {
      console.error('Erreur chargement partenaires:', error);
    }
  };

  const handleSaveClick = () => {
    onSave(formData);
  };

  const total = orderLines.reduce((sum, line) => sum + (line.price_subtotal || 0), 0);

  return (
    <div className="erp-layout">
      <ERPHeader
        title={order ? `Commande ${order.name}` : 'Nouvelle Commande de Vente'}
        breadcrumb={[
          { label: 'Ventes', path: '/erp/home' },
          { label: 'Commandes', path: '/sale-orders' },
          { label: order ? (order.numero_commande || order.name || 'Nouvelle') : 'Nouvelle' }
        ]}
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={onClose} className="erp-btn erp-btn-outline">
              Annuler
            </button>
            <button onClick={handleSaveClick} className="erp-btn erp-btn-primary">
              Enregistrer
            </button>
            {onConfirm && order?.state === 'draft' && (
              <button onClick={onConfirm} className="erp-btn erp-btn-success">
                <CheckCircle size={16} style={{ marginRight: '4px' }} />
                Confirmer
              </button>
            )}
            {onCancel && order?.state !== 'cancel' && (
              <button onClick={onCancel} className="erp-btn erp-btn-danger">
                <XCircle size={16} style={{ marginRight: '4px' }} />
                Annuler
              </button>
            )}
          </div>
        }
      />

      <div className="erp-content">
        {order && (
          <ERPStatusbar
            status={{
              label: formatState(order.state || 'draft').label,
              value: order.state || 'draft',
              color: formatState(order.state || 'draft').color as any
            }}
            workflow={[
              { label: 'Brouillon', value: 'draft', color: 'draft' },
              { label: 'Envoyé', value: 'sent', color: 'confirmed' },
              { label: 'Confirmé', value: 'sale', color: 'done' }
            ]}
          />
        )}

        <div className="erp-form-view">
          <ERPNotebook
            tabs={[
              {
                label: 'Informations',
                content: (
                  <div>
                    <div className="erp-field">
                      <label className="erp-field-label erp-field-required">Client</label>
                      <select
                        value={formData.partner_id?.[0] || ''}
                        onChange={(e) => {
                          const partner = partners.find(p => p[0] === parseInt(e.target.value));
                          setFormData({ ...formData, partner_id: partner || null });
                        }}
                        className="erp-field-input"
                      >
                        <option value="">Sélectionner un client...</option>
                        {partners.map(partner => (
                          <option key={partner[0]} value={partner[0]}>
                            {partner[1]}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="erp-field">
                      <label className="erp-field-label erp-field-required">Date de commande</label>
                      <input
                        type="date"
                        value={formData.date_order}
                        onChange={(e) => setFormData({ ...formData, date_order: e.target.value })}
                        className="erp-field-input"
                      />
                    </div>
                    <div className="erp-field">
                      <label className="erp-field-label">Notes</label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="erp-field-input"
                        rows={4}
                        placeholder="Notes internes..."
                      />
                    </div>
                  </div>
                )
              },
              {
                label: 'Lignes de commande',
                content: (
                  <div>
                    <ERPButtonBox>
                      <button
                        onClick={() => {
                          // TODO: Ouvrir modal de sélection de produits
                        }}
                        className="erp-btn erp-btn-primary"
                      >
                        <Plus size={16} style={{ marginRight: '4px' }} />
                        Ajouter un produit
                      </button>
                    </ERPButtonBox>

                    <div className="erp-tree-view" style={{ marginTop: '16px' }}>
                      <table className="erp-tree-table">
                        <thead>
                          <tr>
                            <th>Produit</th>
                            <th>Quantité</th>
                            <th>Prix unitaire</th>
                            <th>Total</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orderLines.map((line, index) => (
                            <tr key={index}>
                              <td>{line.product?.name || line.name || 'Produit'}</td>
                              <td>{line.product_uom_qty || line.quantity || 0}</td>
                              <td>{line.price_unit?.toFixed(2) || '0.00'} TND</td>
                              <td>{line.price_subtotal?.toFixed(2) || '0.00'} TND</td>
                              <td>
                                <button
                                  onClick={() => setOrderLines(orderLines.filter((_, i) => i !== index))}
                                  className="erp-btn erp-btn-danger"
                                  style={{ padding: '4px 8px' }}
                                >
                                  <Trash size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                          {orderLines.length === 0 && (
                            <tr>
                              <td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: 'var(--erp-text-muted)' }}>
                                Aucune ligne. Cliquez sur "Ajouter un produit" pour commencer.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    <div style={{ marginTop: '16px', textAlign: 'right', fontSize: '18px', fontWeight: 600, color: 'var(--erp-primary)' }}>
                      Total: {formatCurrency(total)}
                    </div>
                  </div>
                )
              },
              {
                label: 'Livraisons',
                content: (
                  <div>
                    {relatedPickings.length === 0 ? (
                      <p style={{ color: 'var(--erp-text-muted)', textAlign: 'center', padding: '32px' }}>
                        Aucune livraison
                      </p>
                    ) : (
                      <div className="erp-tree-view">
                        <table className="erp-tree-table">
                          <thead>
                            <tr>
                              <th>Référence</th>
                              <th>Date</th>
                              <th>État</th>
                            </tr>
                          </thead>
                          <tbody>
                            {relatedPickings.map(picking => (
                              <tr key={picking.id}>
                                <td>{picking.name}</td>
                                <td>{new Date(picking.date).toLocaleDateString()}</td>
                                <td>
                                  <span className={`erp-status-badge ${picking.state === 'done' ? 'done' : 'confirmed'}`}>
                                    {picking.state === 'done' ? 'Terminé' : 'En cours'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )
              },
              {
                label: 'Factures',
                content: (
                  <div>
                    {relatedInvoices.length === 0 ? (
                      <p style={{ color: 'var(--erp-text-muted)', textAlign: 'center', padding: '32px' }}>
                        Aucune facture
                      </p>
                    ) : (
                      <div className="erp-tree-view">
                        <table className="erp-tree-table">
                          <thead>
                            <tr>
                              <th>Référence</th>
                              <th>Date</th>
                              <th>Montant</th>
                              <th>État</th>
                            </tr>
                          </thead>
                          <tbody>
                            {relatedInvoices.map(invoice => (
                              <tr key={invoice.id}>
                                <td>{invoice.name}</td>
                                <td>{new Date(invoice.date).toLocaleDateString()}</td>
                                <td>{invoice.amount_total?.toFixed(2) || '0.00'} TND</td>
                                <td>
                                  <span className={`erp-status-badge ${invoice.state === 'posted' ? 'done' : 'draft'}`}>
                                    {invoice.state === 'posted' ? 'Comptabilisé' : 'Brouillon'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )
              },
              {
                label: 'Notes',
                content: (
                  <ERPChatter
                    messages={[]}
                    onSendMessage={(content, type) => {
                      console.log('Message:', content, type);
                    }}
                  />
                )
              }
            ]}
          />
        </div>
      </div>
    </div>
  );
};

const getStatusColor = (state: string) => {
  const colors: Record<string, string> = {
    draft: 'draft',
    sent: 'confirmed',
    sale: 'done',
    cancel: 'cancelled'
  };
  return colors[state] || 'draft';
};

const getStatusLabel = (state: string) => {
  const labels: Record<string, string> = {
    draft: 'Brouillon',
    sent: 'Envoyé',
    sale: 'Confirmé',
    cancel: 'Annulé'
  };
  return labels[state] || state;
};

export default SaleOrdersOdoo;
