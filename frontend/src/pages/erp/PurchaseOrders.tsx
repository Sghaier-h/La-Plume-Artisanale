/**
 * PurchaseOrdersERP - Commandes d'Achat
 * Version complète avec design ERP moderne
 */

import React, { useEffect, useState } from 'react';
import { purchaseOrdersService } from '../../services/api';
import { ERPHeader, ERPStatusbar, ERPNotebook, ERPChatter, ERPButtonBox, useNotifications } from '../../components/erp';
import KanbanView from '../../components/erp/KanbanView';
import { displayMany2One, formatDate, formatCurrency, formatState } from '../../utils/relations';
import { validateForm, commonRules } from '../../utils/validation';
import { Plus, Edit, Trash2, Eye, CheckCircle, XCircle, ShoppingBag, Search, List, Grid } from 'lucide-react';

interface PurchaseOrder {
  id_commande_fournisseur: number;
  numero_commande: string;
  id_fournisseur: any;
  date_commande: string;
  montant_total: number;
  statut: 'draft' | 'sent' | 'to approve' | 'purchase' | 'done' | 'cancel';
  lignes_commande?: any[];
  created_at?: string;
  updated_at?: string;
  // Alias pour compatibilité
  id?: number;
  name?: string;
  partner_id?: any;
  date_order?: string;
  amount_total?: number;
  state?: 'draft' | 'sent' | 'to approve' | 'purchase' | 'done' | 'cancel';
  order_line?: any[];
}

const PurchaseOrdersERP: React.FC = () => {
  const { success, error: showError } = useNotifications();
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState<'list' | 'kanban' | 'form'>('list');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadOrders();
  }, [search]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const params: any = { loadRelations: true };
      if (search) params.search = search;
      const response = await purchaseOrdersService.getOrders(params);
      const data = Array.isArray(response.data) ? response.data : response.data.data || [];
      setOrders(data);
    } catch (error) {
      console.error('Erreur chargement commandes achat:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedOrder(null);
    setShowForm(true);
    setViewType('form');
  };

  const handleEdit = (order: PurchaseOrder) => {
    setSelectedOrder(order);
    setShowForm(true);
    setViewType('form');
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette commande d\'achat ?')) {
      try {
        await purchaseOrdersService.deleteOrder(id);
        success('Commande supprimée', 'La commande d\'achat a été supprimée avec succès');
        loadOrders();
      } catch (error: any) {
        showError('Erreur', error.response?.data?.error?.message || 'Erreur lors de la suppression');
      }
    }
  };

  const handleConfirm = async (id: number) => {
    try {
      await purchaseOrdersService.confirmOrder(id);
      success('Commande confirmée', 'La commande d\'achat a été confirmée avec succès');
      loadOrders();
      if (selectedOrder?.id === id) {
        loadOrderDetails(id);
      }
    } catch (error: any) {
      showError('Erreur', error.response?.data?.error?.message || 'Erreur lors de la confirmation');
    }
  };

  const loadOrderDetails = async (id: number) => {
    try {
      const response = await purchaseOrdersService.getOrder(id);
      setSelectedOrder(response.data);
    } catch (error) {
      console.error('Erreur chargement détails:', error);
    }
  };

  const getStatusColor = (state: string) => {
    const colors: Record<string, string> = {
      draft: 'draft',
      sent: 'confirmed',
      'to approve': 'confirmed',
      purchase: 'done',
      done: 'done',
      cancel: 'cancelled'
    };
    return colors[state] || 'draft';
  };

  const getStatusLabel = (state: string) => {
    const labels: Record<string, string> = {
      draft: 'Brouillon',
      sent: 'Envoyé',
      'to approve': 'À approuver',
      purchase: 'Acheté',
      done: 'Terminé',
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
      items: orders.filter(o => o.state === 'sent' || o.state === 'to approve')
    },
    {
      id: 'purchase',
      title: 'Acheté',
      items: orders.filter(o => o.state === 'purchase' || o.state === 'done')
    }
  ];

  if (showForm) {
    return (
      <PurchaseOrderForm
        order={selectedOrder}
        onClose={() => {
          setShowForm(false);
          setSelectedOrder(null);
          setViewType('list');
          loadOrders();
        }}
        onSave={loadOrders}
        onConfirm={selectedOrder?.id ? () => handleConfirm(selectedOrder.id!) : undefined}
      />
    );
  }

  return (
    <div className="erp-layout">
      <ERPHeader
        title="Commandes d'Achat"
        breadcrumb={[
          { label: 'Achats' },
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
                  {item.partner_id?.[1] || 'Fournisseur'}
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
                  <th>Fournisseur</th>
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
                      <td>{displayMany2One(order.partner_id)}</td>
                      <td>{formatDate(order.date_order)}</td>
                      <td>{formatCurrency(order.amount_total)}</td>
                      <td>
                        <span className={`erp-status-badge ${getStatusColor(order.state || 'draft')}`}>
                          {getStatusLabel(order.state || 'draft')}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            onClick={() => handleEdit(order)}
                            className="erp-btn erp-btn-outline"
                            style={{ padding: '4px 8px' }}
                            title="Voir/Modifier"
                          >
                            <Eye size={14} />
                          </button>
                          {order.state === 'draft' && (
                            <button
                              onClick={() => handleDelete(order.id!)}
                              className="erp-btn erp-btn-danger"
                              style={{ padding: '4px 8px' }}
                              title="Supprimer"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
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
const PurchaseOrderForm: React.FC<{
  order: PurchaseOrder | null;
  onClose: () => void;
  onSave: () => void;
  onConfirm?: () => void;
}> = ({ order, onClose, onSave, onConfirm }) => {
  const { success, error: showError } = useNotifications();
  const [formData, setFormData] = useState({
    partner_id: order?.partner_id?.[0] || null,
    date_order: order?.date_order || new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [orderLines, setOrderLines] = useState<any[]>(order?.order_line || []);

  const handleSaveClick = async () => {
    // Validation
    const rules = {
      partner_id: commonRules.required
    };
    const validation = validateForm(formData, rules);
    if (!validation.isValid) {
      showError('Erreur de validation', Object.values(validation.errors)[0]);
      return;
    }

    try {
      if (order?.id) {
        await purchaseOrdersService.updateOrder(order.id, { ...formData, order_line: orderLines });
        success('Commande modifiée', 'Les modifications ont été enregistrées');
      } else {
        await purchaseOrdersService.createOrder({ ...formData, order_line: orderLines });
        success('Commande créée', 'La commande d\'achat a été créée avec succès');
      }
      onSave();
      onClose();
    } catch (error: any) {
      showError('Erreur', error.response?.data?.error?.message || 'Erreur lors de l\'enregistrement');
    }
  };

  const total = orderLines.reduce((sum, line) => sum + (line.price_subtotal || 0), 0);

  return (
    <div className="erp-layout">
      <ERPHeader
        title={order ? `Commande ${order.name}` : 'Nouvelle Commande d\'Achat'}
        breadcrumb={[
          { label: 'Achats' },
          { label: 'Commandes' },
          { label: order ? order.name || '' : 'Nouvelle' }
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
          </div>
        }
      />

      <div className="erp-content">
        {order && (
          <ERPStatusbar
            status={{
              label: getStatusLabel(order.state || 'draft'),
              value: order.state || 'draft',
              color: getStatusColor(order.state || 'draft') as any
            }}
            workflow={[
              { label: 'Brouillon', value: 'draft', color: 'draft' },
              { label: 'Envoyé', value: 'sent', color: 'confirmed' },
              { label: 'Acheté', value: 'purchase', color: 'done' }
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
                      <label className="erp-field-label erp-field-required">Fournisseur</label>
                      <input
                        type="text"
                        value={formData.partner_id || ''}
                        onChange={(e) => setFormData({ ...formData, partner_id: e.target.value ? parseInt(e.target.value) : null })}
                        className="erp-field-input"
                        placeholder="Sélectionner un fournisseur..."
                      />
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
                          setOrderLines([...orderLines, {
                            product_id: null,
                            product_qty: 0,
                            price_unit: 0
                          }]);
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
                              <td>{line.product_id?.[1] || 'Produit'}</td>
                              <td>{line.product_qty || 0}</td>
                              <td>{line.price_unit?.toFixed(2) || '0.00'} TND</td>
                              <td>{(line.product_qty * line.price_unit).toFixed(2)} TND</td>
                              <td>
                                <button
                                  onClick={() => setOrderLines(orderLines.filter((_, i) => i !== index))}
                                  className="erp-btn erp-btn-danger"
                                  style={{ padding: '4px 8px' }}
                                >
                                  <Trash2 size={14} />
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

                    <div style={{ marginTop: '16px', textAlign: 'right', fontSize: '18px', fontWeight: 600 }}>
                      Total: {total.toFixed(2)} TND
                    </div>
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
    'to approve': 'confirmed',
    purchase: 'done',
    done: 'done',
    cancel: 'cancelled'
  };
  return colors[state] || 'draft';
};

const getStatusLabel = (state: string) => {
  const labels: Record<string, string> = {
    draft: 'Brouillon',
    sent: 'Envoyé',
    'to approve': 'À approuver',
    purchase: 'Acheté',
    done: 'Terminé',
    cancel: 'Annulé'
  };
  return labels[state] || state;
};

export default PurchaseOrdersERP;
