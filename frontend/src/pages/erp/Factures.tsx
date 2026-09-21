/**
 * FacturesERP - Factures
 * Version complète avec design ERP moderne
 */

import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { ERPHeader, ERPStatusbar, ERPNotebook, ERPChatter, ERPButtonBox, useNotifications } from '../../components/erp';
import KanbanView from '../../components/erp/KanbanView';
import { displayMany2One, formatDate, formatCurrency, formatState } from '../../utils/relations';
import { validateForm, commonRules } from '../../utils/validation';
import { Plus, Edit, Trash2, Eye, CheckCircle, Receipt, Search, List, Grid } from 'lucide-react';

interface Facture {
  id: number;
  name: string;
  partner_id: any;
  invoice_date: string;
  amount_total: number;
  state: 'draft' | 'posted' | 'paid' | 'cancel';
}

const FacturesERP: React.FC = () => {
  const { success, error: showError } = useNotifications();
  const [factures, setFactures] = useState<Facture[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState<'list' | 'kanban' | 'form'>('list');
  const [search, setSearch] = useState('');
  const [selectedFacture, setSelectedFacture] = useState<Facture | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadFactures();
  }, [search]);

  const loadFactures = async () => {
    setLoading(true);
    try {
      const params: any = { loadRelations: true };
      if (search) params.search = search;
      const response = await api.get('/factures', { params });
      const data = Array.isArray(response.data) ? response.data : response.data.data || [];
      setFactures(data);
    } catch (error) {
      console.error('Erreur chargement factures:', error);
      showError('Erreur', 'Impossible de charger les factures');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedFacture(null);
    setShowForm(true);
    setViewType('form');
  };

  const handleEdit = (facture: Facture) => {
    setSelectedFacture(facture);
    setShowForm(true);
    setViewType('form');
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) {
      try {
        await api.delete(`/factures/${id}`);
        success('Facture supprimée', 'La facture a été supprimée avec succès');
        loadFactures();
      } catch (error: any) {
        showError('Erreur', error.response?.data?.error?.message || 'Erreur lors de la suppression');
      }
    }
  };

  const handlePost = async (id: number) => {
    try {
      await api.post(`/factures/${id}/post`);
      success('Facture comptabilisée', 'La facture a été comptabilisée avec succès');
      loadFactures();
    } catch (error: any) {
      showError('Erreur', error.response?.data?.error?.message || 'Erreur lors de la validation');
    }
  };

  const getStatusColor = (state: string) => {
    const colors: Record<string, string> = {
      draft: 'draft',
      posted: 'confirmed',
      paid: 'done',
      cancel: 'cancelled'
    };
    return colors[state] || 'draft';
  };

  const getStatusLabel = (state: string) => {
    const labels: Record<string, string> = {
      draft: 'Brouillon',
      posted: 'Comptabilisée',
      paid: 'Payée',
      cancel: 'Annulée'
    };
    return labels[state] || state;
  };

  const kanbanColumns = [
    {
      id: 'draft',
      title: 'Brouillon',
      items: factures.filter(f => f.state === 'draft')
    },
    {
      id: 'posted',
      title: 'Comptabilisée',
      items: factures.filter(f => f.state === 'posted')
    },
    {
      id: 'paid',
      title: 'Payée',
      items: factures.filter(f => f.state === 'paid')
    }
  ];

  if (showForm) {
    return (
      <FactureForm
        facture={selectedFacture}
        onClose={() => {
          setShowForm(false);
          setSelectedFacture(null);
          setViewType('list');
          loadFactures();
        }}
        onSave={loadFactures}
        onPost={selectedFacture?.id ? () => handlePost(selectedFacture.id) : undefined}
      />
    );
  }

  return (
    <div className="erp-layout">
      <ERPHeader
        title="Factures"
        breadcrumb={[
          { label: 'Comptabilité' },
          { label: 'Factures' }
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
              Nouvelle Facture
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
              placeholder="Rechercher une facture..."
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
                  {new Date(item.invoice_date).toLocaleDateString()}
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
                ) : factures.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--erp-text-muted)' }}>
                      Aucune facture
                    </td>
                  </tr>
                ) : (
                  factures.map(facture => (
                    <tr key={facture.id}>
                      <td>{facture.name}</td>
                    <td>{displayMany2One(facture.partner_id)}</td>
                    <td>{formatDate(facture.invoice_date)}</td>
                    <td>{formatCurrency(facture.amount_total)}</td>
                      <td>
                        <span className={`erp-status-badge ${getStatusColor(facture.state)}`}>
                          {getStatusLabel(facture.state)}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            onClick={() => handleEdit(facture)}
                            className="erp-btn erp-btn-outline"
                            style={{ padding: '4px 8px' }}
                            title="Voir/Modifier"
                          >
                            <Eye size={14} />
                          </button>
                          {facture.state === 'draft' && (
                            <button
                              onClick={() => handleDelete(facture.id)}
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
const FactureForm: React.FC<{
  facture: Facture | null;
  onClose: () => void;
  onSave: () => void;
  onPost?: () => void;
}> = ({ facture, onClose, onSave, onPost }) => {
  const { success, error: showError } = useNotifications();
  const [formData, setFormData] = useState({
    partner_id: facture?.partner_id?.[0] || null,
    invoice_date: facture?.invoice_date || new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [invoiceLines, setInvoiceLines] = useState<any[]>([]);

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
      if (facture?.id) {
        await api.put(`/factures/${facture.id}`, { ...formData, invoice_line_ids: invoiceLines });
        success('Facture modifiée', 'Les modifications ont été enregistrées');
      } else {
        await api.post('/factures', { ...formData, invoice_line_ids: invoiceLines });
        success('Facture créée', 'La facture a été créée avec succès');
      }
      onSave();
      onClose();
    } catch (error: any) {
      showError('Erreur', error.response?.data?.error?.message || 'Erreur lors de l\'enregistrement');
    }
  };

  const total = invoiceLines.reduce((sum, line) => sum + (line.price_subtotal || 0), 0);

  return (
    <div className="erp-layout">
      <ERPHeader
        title={facture ? `Facture ${facture.name}` : 'Nouvelle Facture'}
        breadcrumb={[
          { label: 'Comptabilité' },
          { label: 'Factures' },
          { label: facture ? facture.name : 'Nouvelle' }
        ]}
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={onClose} className="erp-btn erp-btn-outline">
              Annuler
            </button>
            <button onClick={handleSaveClick} className="erp-btn erp-btn-primary">
              Enregistrer
            </button>
            {onPost && facture?.state === 'draft' && (
              <button onClick={onPost} className="erp-btn erp-btn-success">
                <CheckCircle size={16} style={{ marginRight: '4px' }} />
                Comptabiliser
              </button>
            )}
          </div>
        }
      />

      <div className="erp-content">
        {facture && (
          <ERPStatusbar
            status={{
              label: getStatusLabel(facture.state),
              value: facture.state,
              color: getStatusColor(facture.state) as any
            }}
            workflow={[
              { label: 'Brouillon', value: 'draft', color: 'draft' },
              { label: 'Comptabilisée', value: 'posted', color: 'confirmed' },
              { label: 'Payée', value: 'paid', color: 'done' }
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
                      <label className="erp-field-label">Date de facture</label>
                      <input
                        type="date"
                        value={formData.invoice_date}
                        onChange={(e) => setFormData({ ...formData, invoice_date: e.target.value })}
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
                          setInvoiceLines([...invoiceLines, {
                            product_id: null,
                            quantity: 1,
                            price_unit: 0
                          }]);
                        }}
                        className="erp-btn erp-btn-primary"
                      >
                        <Plus size={16} style={{ marginRight: '4px' }} />
                        Ajouter une ligne
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
                          {invoiceLines.map((line, index) => (
                            <tr key={index}>
                              <td>{line.product_id?.[1] || 'Produit'}</td>
                              <td>{line.quantity || 1}</td>
                              <td>{line.price_unit?.toFixed(2) || '0.00'} TND</td>
                              <td>{(line.quantity * line.price_unit).toFixed(2)} TND</td>
                              <td>
                                <button
                                  onClick={() => setInvoiceLines(invoiceLines.filter((_, i) => i !== index))}
                                  className="erp-btn erp-btn-danger"
                                  style={{ padding: '4px 8px' }}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                          {invoiceLines.length === 0 && (
                            <tr>
                              <td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: 'var(--erp-text-muted)' }}>
                                Aucune ligne. Cliquez sur "Ajouter une ligne" pour commencer.
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
    posted: 'confirmed',
    paid: 'done',
    cancel: 'cancelled'
  };
  return colors[state] || 'draft';
};

const getStatusLabel = (state: string) => {
  const labels: Record<string, string> = {
    draft: 'Brouillon',
    posted: 'Comptabilisée',
    paid: 'Payée',
    cancel: 'Annulée'
  };
  return labels[state] || state;
};

export default FacturesERP;
