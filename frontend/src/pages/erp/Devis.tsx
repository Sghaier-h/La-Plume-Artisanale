/**
 * DevisERP - Devis
 * Version complète avec design ERP moderne
 */

import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { ERPHeader, ERPStatusbar, ERPNotebook, ERPChatter, ERPButtonBox, useNotifications } from '../../components/erp';
import KanbanView from '../../components/erp/KanbanView';
import { displayMany2One, formatDate, formatCurrency, formatState } from '../../utils/relations';
import { validateForm, commonRules } from '../../utils/validation';
import { Plus, Edit, Trash2, Eye, CheckCircle, FileText, Search, List, Grid } from 'lucide-react';

interface Devis {
  id: number;
  name: string;
  partner_id: any;
  date_order: string;
  amount_total: number;
  state: 'draft' | 'sent' | 'accepted' | 'refused' | 'cancel';
}

const DevisERP: React.FC = () => {
  const { success, error: showError } = useNotifications();
  const [devis, setDevis] = useState<Devis[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState<'list' | 'kanban' | 'form'>('list');
  const [search, setSearch] = useState('');
  const [selectedDevis, setSelectedDevis] = useState<Devis | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadDevis();
  }, [search]);

  const loadDevis = async () => {
    setLoading(true);
    try {
      const params: any = { loadRelations: true };
      if (search) params.search = search;
      const response = await api.get('/devis', { params });
      const data = Array.isArray(response.data) ? response.data : response.data.data || [];
      setDevis(data);
    } catch (error) {
      console.error('Erreur chargement devis:', error);
      showError('Erreur', 'Impossible de charger les devis');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedDevis(null);
    setShowForm(true);
    setViewType('form');
  };

  const handleEdit = (devis: Devis) => {
    setSelectedDevis(devis);
    setShowForm(true);
    setViewType('form');
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce devis ?')) {
      try {
        await api.delete(`/devis/${id}`);
        success('Devis supprimé', 'Le devis a été supprimé avec succès');
        loadDevis();
      } catch (error: any) {
        showError('Erreur', error.response?.data?.error?.message || 'Erreur lors de la suppression');
      }
    }
  };

  const handleConfirm = async (id: number) => {
    try {
      await api.post(`/devis/${id}/confirm`);
      success('Devis confirmé', 'Le devis a été confirmé avec succès');
      loadDevis();
    } catch (error: any) {
      showError('Erreur', error.response?.data?.error?.message || 'Erreur lors de la confirmation');
    }
  };

  const getStatusColor = (state: string) => {
    const colors: Record<string, string> = {
      draft: 'draft',
      sent: 'confirmed',
      accepted: 'done',
      refused: 'cancelled',
      cancel: 'cancelled'
    };
    return colors[state] || 'draft';
  };

  const getStatusLabel = (state: string) => {
    const labels: Record<string, string> = {
      draft: 'Brouillon',
      sent: 'Envoyé',
      accepted: 'Accepté',
      refused: 'Refusé',
      cancel: 'Annulé'
    };
    return labels[state] || state;
  };

  const kanbanColumns = [
    {
      id: 'draft',
      title: 'Brouillon',
      items: devis.filter(d => d.state === 'draft')
    },
    {
      id: 'sent',
      title: 'Envoyé',
      items: devis.filter(d => d.state === 'sent')
    },
    {
      id: 'accepted',
      title: 'Accepté',
      items: devis.filter(d => d.state === 'accepted')
    }
  ];

  if (showForm) {
    return (
      <DevisForm
        devis={selectedDevis}
        onClose={() => {
          setShowForm(false);
          setSelectedDevis(null);
          setViewType('list');
          loadDevis();
        }}
        onSave={loadDevis}
        onConfirm={selectedDevis?.id ? () => handleConfirm(selectedDevis.id) : undefined}
      />
    );
  }

  return (
    <div className="erp-layout">
      <ERPHeader
        title="Devis"
        breadcrumb={[
          { label: 'Ventes' },
          { label: 'Devis' }
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
              Nouveau Devis
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
              placeholder="Rechercher un devis..."
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
                ) : devis.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--erp-text-muted)' }}>
                      Aucun devis
                    </td>
                  </tr>
                ) : (
                  devis.map(devis => (
                    <tr key={devis.id}>
                      <td>{devis.name}</td>
                    <td>{displayMany2One(devis.partner_id)}</td>
                    <td>{formatDate(devis.date_order)}</td>
                    <td>{formatCurrency(devis.amount_total)}</td>
                      <td>
                        <span className={`erp-status-badge ${getStatusColor(devis.state)}`}>
                          {getStatusLabel(devis.state)}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            onClick={() => handleEdit(devis)}
                            className="erp-btn erp-btn-outline"
                            style={{ padding: '4px 8px' }}
                            title="Voir/Modifier"
                          >
                            <Eye size={14} />
                          </button>
                          {devis.state === 'draft' && (
                            <button
                              onClick={() => handleDelete(devis.id)}
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
const DevisForm: React.FC<{
  devis: Devis | null;
  onClose: () => void;
  onSave: () => void;
  onConfirm?: () => void;
}> = ({ devis, onClose, onSave, onConfirm }) => {
  const { success, error: showError } = useNotifications();
  const [formData, setFormData] = useState({
    partner_id: devis?.partner_id?.[0] || null,
    date_order: devis?.date_order || new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [orderLines, setOrderLines] = useState<any[]>([]);

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
      if (devis?.id) {
        await api.put(`/devis/${devis.id}`, { ...formData, order_line: orderLines });
        success('Devis modifié', 'Les modifications ont été enregistrées');
      } else {
        await api.post('/devis', { ...formData, order_line: orderLines });
        success('Devis créé', 'Le devis a été créé avec succès');
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
        title={devis ? `Devis ${devis.name}` : 'Nouveau Devis'}
        breadcrumb={[
          { label: 'Ventes' },
          { label: 'Devis' },
          { label: devis ? devis.name : 'Nouveau' }
        ]}
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={onClose} className="erp-btn erp-btn-outline">
              Annuler
            </button>
            <button onClick={handleSaveClick} className="erp-btn erp-btn-primary">
              Enregistrer
            </button>
            {onConfirm && devis?.state === 'draft' && (
              <button onClick={onConfirm} className="erp-btn erp-btn-success">
                <CheckCircle size={16} style={{ marginRight: '4px' }} />
                Confirmer
              </button>
            )}
          </div>
        }
      />

      <div className="erp-content">
        {devis && (
          <ERPStatusbar
            status={{
              label: getStatusLabel(devis.state),
              value: devis.state,
              color: getStatusColor(devis.state) as any
            }}
            workflow={[
              { label: 'Brouillon', value: 'draft', color: 'draft' },
              { label: 'Envoyé', value: 'sent', color: 'confirmed' },
              { label: 'Accepté', value: 'accepted', color: 'done' }
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
                      <input
                        type="text"
                        value={formData.partner_id || ''}
                        onChange={(e) => setFormData({ ...formData, partner_id: e.target.value ? parseInt(e.target.value) : null })}
                        className="erp-field-input"
                        placeholder="Sélectionner un client..."
                      />
                    </div>
                    <div className="erp-field">
                      <label className="erp-field-label">Date</label>
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
                label: 'Lignes',
                content: (
                  <div>
                    <ERPButtonBox>
                      <button
                        onClick={() => {
                          setOrderLines([...orderLines, {
                            product_id: null,
                            product_qty: 1,
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
                              <td>{line.product_qty || 1}</td>
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
    accepted: 'done',
    refused: 'cancelled',
    cancel: 'cancelled'
  };
  return colors[state] || 'draft';
};

const getStatusLabel = (state: string) => {
  const labels: Record<string, string> = {
    draft: 'Brouillon',
    sent: 'Envoyé',
    accepted: 'Accepté',
    refused: 'Refusé',
    cancel: 'Annulé'
  };
  return labels[state] || state;
};

export default DevisERP;
