/**
 * OpportunitiesERP - Opportunités CRM
 * Version complète avec design ERP moderne
 */

import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { ERPHeader, ERPStatusbar, ERPNotebook, ERPChatter, ERPButtonBox, useNotifications } from '../../components/erp';
import KanbanView from '../../components/erp/KanbanView';
import { displayMany2One, formatDate, formatCurrency, formatState } from '../../utils/relations';
import { Plus, Edit, Trash2, Eye, TrendingUp, Search, List, Grid } from 'lucide-react';
import { validateForm, commonRules } from '../../utils/validation';

interface Opportunity {
  id: number;
  name: string;
  partner_id?: any;
  expected_revenue: number;
  probability: number;
  stage_id?: any;
  user_id?: any;
}

const OpportunitiesERP: React.FC = () => {
  const { success, error } = useNotifications();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState<'list' | 'kanban' | 'form'>('list');
  const [search, setSearch] = useState('');
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadOpportunities();
  }, [search]);

  const loadOpportunities = async () => {
    setLoading(true);
    try {
      const params: any = { loadRelations: true };
      if (search) params.search = search;
      const response = await api.get('/crm/opportunities', { params });
      const data = Array.isArray(response.data) ? response.data : response.data.data || [];
      setOpportunities(data);
    } catch (error) {
      console.error('Erreur chargement opportunités:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedOpportunity(null);
    setShowForm(true);
    setViewType('form');
  };

  const handleEdit = (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity);
    setShowForm(true);
    setViewType('form');
  };

  const handleSave = async (formData: any) => {
    try {
      if (selectedOpportunity?.id) {
        await api.put(`/crm/opportunities/${selectedOpportunity.id}`, formData);
      } else {
        await api.post('/crm/opportunities', formData);
      }
      setShowForm(false);
      setSelectedOpportunity(null);
      setViewType('list');
      loadOpportunities();
    } catch (error: any) {
      error('Erreur', error.response?.data?.error?.message || 'Erreur lors de l\'enregistrement');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette opportunité ?')) {
      try {
        await api.delete(`/crm/opportunities/${id}`);
        success('Suppression réussie');
        loadOpportunities();
      } catch (error: any) {
        error('Erreur', error.response?.data?.error?.message || 'Erreur lors de la suppression');
      }
    }
  };

  const kanbanColumns = [
    {
      id: 'new',
      title: 'Nouveau',
      items: opportunities.filter(o => !o.stage_id || o.stage_id[1] === 'Nouveau')
    },
    {
      id: 'qualified',
      title: 'Qualifié',
      items: opportunities.filter(o => o.stage_id?.[1] === 'Qualifié')
    },
    {
      id: 'proposition',
      title: 'Proposition',
      items: opportunities.filter(o => o.stage_id?.[1] === 'Proposition')
    },
    {
      id: 'won',
      title: 'Gagné',
      items: opportunities.filter(o => o.stage_id?.[1] === 'Gagné')
    }
  ];

  if (showForm) {
    return (
      <OpportunityForm
        opportunity={selectedOpportunity}
        onClose={() => {
          setShowForm(false);
          setSelectedOpportunity(null);
          setViewType('list');
          loadOpportunities();
        }}
        onSave={handleSave}
      />
    );
  }

  return (
    <div className="erp-layout">
      <ERPHeader
        title="Opportunités"
        breadcrumb={[
          { label: 'CRM' },
          { label: 'Opportunités' }
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
              Nouvelle Opportunité
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
              placeholder="Rechercher une opportunité..."
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
                  {item.expected_revenue?.toFixed(2) || '0.00'} TND
                </div>
                <div style={{ fontSize: '11px', color: 'var(--erp-text-muted)', marginTop: '4px' }}>
                  Probabilité: {item.probability || 0}%
                </div>
              </div>
            )}
          />
        ) : (
          <div className="erp-tree-view">
            <table className="erp-tree-table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Client</th>
                  <th>Revenu attendu</th>
                  <th>Probabilité</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '32px' }}>
                      Chargement...
                    </td>
                  </tr>
                ) : opportunities.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: 'var(--erp-text-muted)' }}>
                      Aucune opportunité
                    </td>
                  </tr>
                ) : (
                  opportunities.map(opportunity => (
                    <tr key={opportunity.id}>
                      <td>{opportunity.name}</td>
                      <td>{displayMany2One(opportunity.partner_id)}</td>
                      <td>{formatCurrency(opportunity.expected_revenue)}</td>
                      <td>{opportunity.probability || 0}%</td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            onClick={() => handleEdit(opportunity)}
                            className="erp-btn erp-btn-outline"
                            style={{ padding: '4px 8px' }}
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(opportunity.id)}
                            className="erp-btn erp-btn-danger"
                            style={{ padding: '4px 8px' }}
                          >
                            <Trash2 size={14} />
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
const OpportunityForm: React.FC<{
  opportunity: Opportunity | null;
  onClose: () => void;
  onSave: (data: any) => void;
}> = ({ opportunity, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: opportunity?.name || '',
    partner_id: opportunity?.partner_id?.[0] || null,
    expected_revenue: opportunity?.expected_revenue || 0,
    probability: opportunity?.probability || 0,
    notes: ''
  });

  const handleSaveClick = () => {
    onSave(formData);
  };

  return (
    <div className="erp-layout">
      <ERPHeader
        title={opportunity ? `Opportunité ${opportunity.name}` : 'Nouvelle Opportunité'}
        breadcrumb={[
          { label: 'CRM' },
          { label: 'Opportunités' },
          { label: opportunity ? opportunity.name : 'Nouvelle' }
        ]}
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={onClose} className="erp-btn erp-btn-outline">
              Annuler
            </button>
            <button onClick={handleSaveClick} className="erp-btn erp-btn-primary">
              Enregistrer
            </button>
          </div>
        }
      />

      <div className="erp-content">
        <div className="erp-form-view">
          <ERPNotebook
            tabs={[
              {
                label: 'Informations',
                content: (
                  <div>
                    <div className="erp-field">
                      <label className="erp-field-label erp-field-required">Nom</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="erp-field-input"
                        placeholder="Nom de l'opportunité..."
                      />
                    </div>
                    <div className="erp-field">
                      <label className="erp-field-label">Client</label>
                      <input
                        type="text"
                        value={formData.partner_id || ''}
                        onChange={(e) => setFormData({ ...formData, partner_id: e.target.value ? parseInt(e.target.value) : null })}
                        className="erp-field-input"
                        placeholder="Sélectionner un client..."
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div className="erp-field">
                        <label className="erp-field-label">Revenu attendu</label>
                        <input
                          type="number"
                          value={formData.expected_revenue}
                          onChange={(e) => setFormData({ ...formData, expected_revenue: parseFloat(e.target.value) || 0 })}
                          className="erp-field-input"
                          step="0.01"
                          min="0"
                        />
                      </div>
                      <div className="erp-field">
                        <label className="erp-field-label">Probabilité (%)</label>
                        <input
                          type="number"
                          value={formData.probability}
                          onChange={(e) => setFormData({ ...formData, probability: parseInt(e.target.value) || 0 })}
                          className="erp-field-input"
                          min="0"
                          max="100"
                        />
                      </div>
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

export default OpportunitiesERP;
