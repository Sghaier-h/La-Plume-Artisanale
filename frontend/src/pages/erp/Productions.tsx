/**
 * ProductionsERP - Ordres de Fabrication
 * Version complète avec design ERP moderne
 */

import React, { useEffect, useState } from 'react';
import { productionsService } from '../../services/api';
import { ERPHeader, ERPStatusbar, ERPNotebook, ERPChatter, ERPButtonBox, useNotifications } from '../../components/erp';
import KanbanView from '../../components/erp/KanbanView';
import { displayMany2One, formatDate, formatCurrency, formatState } from '../../utils/relations';
import { validateForm, commonRules } from '../../utils/validation';
import { Plus, Edit, Trash2, Eye, CheckCircle, Play, Factory, Search, List, Grid } from 'lucide-react';

interface Production {
  id: number;
  name: string;
  product_id: any;
  product_qty: number;
  date_planned_start: string;
  state: 'draft' | 'confirmed' | 'progress' | 'done' | 'cancel';
}

const ProductionsERP: React.FC = () => {
  const { success, error: showError } = useNotifications();
  const [productions, setProductions] = useState<Production[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState<'list' | 'kanban' | 'form'>('list');
  const [search, setSearch] = useState('');
  const [selectedProduction, setSelectedProduction] = useState<Production | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadProductions();
  }, [search]);

  const loadProductions = async () => {
    setLoading(true);
    try {
      const params: any = { loadRelations: true };
      if (search) params.search = search;
      const response = await productionsService.getProductions(params);
      const data = Array.isArray(response.data) ? response.data : response.data.data || [];
      setProductions(data);
    } catch (error) {
      console.error('Erreur chargement productions:', error);
      showError('Erreur', 'Impossible de charger les ordres de fabrication');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedProduction(null);
    setShowForm(true);
    setViewType('form');
  };

  const handleEdit = (production: Production) => {
    setSelectedProduction(production);
    setShowForm(true);
    setViewType('form');
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet ordre de fabrication ?')) {
      try {
        await productionsService.deleteProduction(id);
        success('Ordre supprimé', 'L\'ordre de fabrication a été supprimé avec succès');
        loadProductions();
      } catch (error: any) {
        showError('Erreur', error.response?.data?.error?.message || 'Erreur lors de la suppression');
      }
    }
  };

  const handleConfirm = async (id: number) => {
    try {
      await productionsService.confirmProduction(id);
      success('Ordre confirmé', 'L\'ordre de fabrication a été confirmé avec succès');
      loadProductions();
    } catch (error: any) {
      showError('Erreur', error.response?.data?.error?.message || 'Erreur lors de la confirmation');
    }
  };

  const getStatusColor = (state: string) => {
    const colors: Record<string, string> = {
      draft: 'draft',
      confirmed: 'confirmed',
      progress: 'confirmed',
      done: 'done',
      cancel: 'cancelled'
    };
    return colors[state] || 'draft';
  };

  const getStatusLabel = (state: string) => {
    const labels: Record<string, string> = {
      draft: 'Brouillon',
      confirmed: 'Confirmé',
      progress: 'En cours',
      done: 'Terminé',
      cancel: 'Annulé'
    };
    return labels[state] || state;
  };

  const kanbanColumns = [
    {
      id: 'draft',
      title: 'Brouillon',
      items: productions.filter(p => p.state === 'draft')
    },
    {
      id: 'confirmed',
      title: 'Confirmé',
      items: productions.filter(p => p.state === 'confirmed')
    },
    {
      id: 'progress',
      title: 'En cours',
      items: productions.filter(p => p.state === 'progress')
    },
    {
      id: 'done',
      title: 'Terminé',
      items: productions.filter(p => p.state === 'done')
    }
  ];

  if (showForm) {
    return (
      <ProductionForm
        production={selectedProduction}
        onClose={() => {
          setShowForm(false);
          setSelectedProduction(null);
          setViewType('list');
          loadProductions();
        }}
        onSave={loadProductions}
        onConfirm={selectedProduction?.id ? () => handleConfirm(selectedProduction.id) : undefined}
      />
    );
  }

  return (
    <div className="erp-layout">
      <ERPHeader
        title="Ordres de Fabrication"
        breadcrumb={[
          { label: 'Production' },
          { label: 'Ordres de Fabrication' }
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
              Nouvel Ordre
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
              placeholder="Rechercher un ordre..."
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
                  {item.product_id?.[1] || 'Produit'}
                </div>
                <div style={{ fontWeight: 600, color: 'var(--erp-primary)' }}>
                  Quantité: {item.product_qty || 0}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--erp-text-muted)', marginTop: '4px' }}>
                  {new Date(item.date_planned_start).toLocaleDateString()}
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
                  <th>Produit</th>
                  <th>Quantité</th>
                  <th>Date prévue</th>
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
                ) : productions.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--erp-text-muted)' }}>
                      Aucun ordre de fabrication
                    </td>
                  </tr>
                ) : (
                  productions.map(production => (
                    <tr key={production.id}>
                      <td>{production.name}</td>
                      <td>{displayMany2One(production.product_id)}</td>
                      <td>{production.product_qty || 0}</td>
                      <td>{formatDate(production.date_planned_start)}</td>
                      <td>
                        <span className={`erp-status-badge ${getStatusColor(production.state)}`}>
                          {getStatusLabel(production.state)}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            onClick={() => handleEdit(production)}
                            className="erp-btn erp-btn-outline"
                            style={{ padding: '4px 8px' }}
                            title="Voir/Modifier"
                          >
                            <Eye size={14} />
                          </button>
                          {production.state === 'draft' && (
                            <button
                              onClick={() => handleDelete(production.id)}
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
const ProductionForm: React.FC<{
  production: Production | null;
  onClose: () => void;
  onSave: () => void;
  onConfirm?: () => void;
}> = ({ production, onClose, onSave, onConfirm }) => {
  const [formData, setFormData] = useState({
    product_id: production?.product_id?.[0] || null,
    product_qty: production?.product_qty || 1,
    date_planned_start: production?.date_planned_start || new Date().toISOString().split('T')[0],
    notes: ''
  });

  const { success, error: showError } = useNotifications();

  const handleSaveClick = async () => {
    // Validation
    const rules = {
      product_id: commonRules.required
    };
    const validation = validateForm(formData, rules);
    if (!validation.isValid) {
      showError('Erreur de validation', Object.values(validation.errors)[0]);
      return;
    }

    try {
      if (production?.id) {
        await productionsService.updateProduction(production.id, formData);
        success('Ordre modifié', 'Les modifications ont été enregistrées');
      } else {
        await productionsService.createProduction(formData);
        success('Ordre créé', 'L\'ordre de fabrication a été créé avec succès');
      }
      onSave();
      onClose();
    } catch (error: any) {
      showError('Erreur', error.response?.data?.error?.message || 'Erreur lors de l\'enregistrement');
    }
  };

  return (
    <div className="erp-layout">
      <ERPHeader
        title={production ? `Ordre ${production.name}` : 'Nouvel Ordre de Fabrication'}
        breadcrumb={[
          { label: 'Production' },
          { label: 'Ordres de Fabrication' },
          { label: production ? production.name : 'Nouveau' }
        ]}
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={onClose} className="erp-btn erp-btn-outline">
              Annuler
            </button>
            <button onClick={handleSaveClick} className="erp-btn erp-btn-primary">
              Enregistrer
            </button>
            {onConfirm && production?.state === 'draft' && (
              <button onClick={onConfirm} className="erp-btn erp-btn-success">
                <CheckCircle size={16} style={{ marginRight: '4px' }} />
                Confirmer
              </button>
            )}
          </div>
        }
      />

      <div className="erp-content">
        {production && (
          <ERPStatusbar
            status={{
              label: getStatusLabel(production.state),
              value: production.state,
              color: getStatusColor(production.state) as any
            }}
            workflow={[
              { label: 'Brouillon', value: 'draft', color: 'draft' },
              { label: 'Confirmé', value: 'confirmed', color: 'confirmed' },
              { label: 'En cours', value: 'progress', color: 'confirmed' },
              { label: 'Terminé', value: 'done', color: 'done' }
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
                      <label className="erp-field-label erp-field-required">Produit</label>
                      <input
                        type="text"
                        value={formData.product_id || ''}
                        onChange={(e) => setFormData({ ...formData, product_id: e.target.value ? parseInt(e.target.value) : null })}
                        className="erp-field-input"
                        placeholder="Sélectionner un produit..."
                      />
                    </div>
                    <div className="erp-field">
                      <label className="erp-field-label erp-field-required">Quantité</label>
                      <input
                        type="number"
                        value={formData.product_qty}
                        onChange={(e) => setFormData({ ...formData, product_qty: parseFloat(e.target.value) || 1 })}
                        className="erp-field-input"
                        min="1"
                        step="0.01"
                      />
                    </div>
                    <div className="erp-field">
                      <label className="erp-field-label">Date prévue de début</label>
                      <input
                        type="date"
                        value={formData.date_planned_start}
                        onChange={(e) => setFormData({ ...formData, date_planned_start: e.target.value })}
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
    confirmed: 'confirmed',
    progress: 'confirmed',
    done: 'done',
    cancel: 'cancelled'
  };
  return colors[state] || 'draft';
};

const getStatusLabel = (state: string) => {
  const labels: Record<string, string> = {
    draft: 'Brouillon',
    confirmed: 'Confirmé',
    progress: 'En cours',
    done: 'Terminé',
    cancel: 'Annulé'
  };
  return labels[state] || state;
};

export default ProductionsERP;
