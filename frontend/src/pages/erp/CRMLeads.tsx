/**
 * CRMLeadsERP - Pistes CRM
 * Version complète avec design ERP moderne
 */

import React, { useEffect, useState } from 'react';
import { crmLeadsService } from '../../services/api';
import { ERPHeader, ERPStatusbar, ERPNotebook, ERPChatter, ERPButtonBox, useNotifications } from '../../components/erp';
import KanbanView from '../../components/erp/KanbanView';
import { displayMany2One, formatDate, formatCurrency, formatState } from '../../utils/relations';
import { validateForm, commonRules } from '../../utils/validation';
import { Plus, Edit, Trash2, Eye, TrendingUp, User, Phone, Mail, Search, List, Grid } from 'lucide-react';

interface Lead {
  id: number;
  name: string;
  partner_name?: string;
  email?: string;
  phone?: string;
  expected_revenue: number;
  probability: number;
  stage_id?: any;
  user_id?: any;
}

const CRMLeadsERP: React.FC = () => {
  const { success, error: showError } = useNotifications();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState<'list' | 'kanban' | 'form'>('list');
  const [search, setSearch] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadLeads();
  }, [search]);

  const loadLeads = async () => {
    setLoading(true);
    try {
      const params: any = { loadRelations: true };
      if (search) params.search = search;
      const response = await crmLeadsService.getLeads(params);
      const data = Array.isArray(response.data) ? response.data : response.data.data || [];
      setLeads(data);
    } catch (error) {
      console.error('Erreur chargement leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedLead(null);
    setShowForm(true);
    setViewType('form');
  };

  const handleEdit = (lead: Lead) => {
    setSelectedLead(lead);
    setShowForm(true);
    setViewType('form');
  };

  const handleDelete = async (leadId: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette piste CRM ?')) {
      try {
        if (leadId) {
          await crmLeadsService.deleteLead(leadId);
          success('Piste supprimée', 'La piste CRM a été supprimée avec succès');
          loadLeads();
        }
      } catch (error: any) {
        showError('Erreur', error.response?.data?.error?.message || 'Erreur lors de la suppression');
      }
    }
  };

  const getStatusColor = (stage: string) => {
    const colors: Record<string, string> = {
      new: 'draft',
      qualified: 'confirmed',
      proposition: 'confirmed',
      won: 'done',
      lost: 'cancelled'
    };
    return colors[stage] || 'draft';
  };

  const kanbanColumns = [
    {
      id: 'new',
      title: 'Nouveau',
      items: leads.filter(l => {
        const stage = l.stage_id;
        return !stage || (Array.isArray(stage) && stage[1] === 'Nouveau');
      })
    },
    {
      id: 'qualified',
      title: 'Qualifié',
      items: leads.filter(l => {
        const stage = l.stage_id;
        return Array.isArray(stage) && stage[1] === 'Qualifié';
      })
    },
    {
      id: 'proposition',
      title: 'Proposition',
      items: leads.filter(l => {
        const stage = l.stage_id;
        return Array.isArray(stage) && stage[1] === 'Proposition';
      })
    },
    {
      id: 'won',
      title: 'Gagné',
      items: leads.filter(l => {
        const stage = l.stage_id;
        return Array.isArray(stage) && stage[1] === 'Gagné';
      })
    }
  ];

  if (showForm) {
    return (
      <LeadForm
        lead={selectedLead}
        onClose={() => {
          setShowForm(false);
          setSelectedLead(null);
          setViewType('list');
          loadLeads();
        }}
        onSave={loadLeads}
      />
    );
  }

  return (
    <div className="erp-layout">
      <ERPHeader
        title="Pistes CRM"
        breadcrumb={[
          { label: 'CRM' },
          { label: 'Pistes' }
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
              Nouvelle Piste
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
              placeholder="Rechercher une piste..."
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
                  {item.partner_name || 'Contact'}
                </div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', fontSize: '11px' }}>
                  {item.email && (
                    <span style={{ color: 'var(--erp-text-muted)' }}>
                      <Mail size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                      {item.email}
                    </span>
                  )}
                  {item.phone && (
                    <span style={{ color: 'var(--erp-text-muted)' }}>
                      <Phone size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                      {item.phone}
                    </span>
                  )}
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
                  <th>Contact</th>
                  <th>Email</th>
                  <th>Téléphone</th>
                  <th>Revenu attendu</th>
                  <th>Probabilité</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '32px' }}>
                      Chargement...
                    </td>
                  </tr>
                ) : leads.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--erp-text-muted)' }}>
                      Aucune piste
                    </td>
                  </tr>
                ) : (
                  leads.map(lead => (
                    <tr key={lead.id}>
                      <td>{lead.name}</td>
                      <td>{lead.partner_name || '-'}</td>
                      <td>{lead.email || '-'}</td>
                      <td>{lead.phone || '-'}</td>
                      <td>{formatCurrency(lead.expected_revenue)}</td>
                      <td>{lead.probability || 0}%</td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            onClick={() => handleEdit(lead)}
                            className="erp-btn erp-btn-outline"
                            style={{ padding: '4px 8px' }}
                            title="Voir/Modifier"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(lead.id)}
                            className="erp-btn erp-btn-danger"
                            style={{ padding: '4px 8px' }}
                            title="Supprimer"
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
const LeadForm: React.FC<{
  lead: Lead | null;
  onClose: () => void;
  onSave: () => void;
}> = ({ lead, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: lead?.name || '',
    partner_name: lead?.partner_name || '',
    email: lead?.email || '',
    phone: lead?.phone || '',
    expected_revenue: lead?.expected_revenue || 0,
    probability: lead?.probability || 0,
    notes: ''
  });

  const handleSaveClick = async () => {
    try {
      if (lead?.id) {
        await crmLeadsService.updateLead(lead.id, formData);
      } else {
        await crmLeadsService.createLead(formData);
      }
      onSave();
      onClose();
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'Erreur lors de l\'enregistrement');
    }
  };

  return (
    <div className="erp-layout">
      <ERPHeader
        title={lead ? `Piste ${lead.name}` : 'Nouvelle Piste CRM'}
        breadcrumb={[
          { label: 'CRM' },
          { label: 'Pistes' },
          { label: lead ? lead.name : 'Nouvelle' }
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
                        placeholder="Nom de la piste..."
                      />
                    </div>
                    <div className="erp-field">
                      <label className="erp-field-label">Contact</label>
                      <input
                        type="text"
                        value={formData.partner_name}
                        onChange={(e) => setFormData({ ...formData, partner_name: e.target.value })}
                        className="erp-field-input"
                        placeholder="Nom du contact..."
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div className="erp-field">
                        <label className="erp-field-label">Email</label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="erp-field-input"
                          placeholder="email@example.com"
                        />
                      </div>
                      <div className="erp-field">
                        <label className="erp-field-label">Téléphone</label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="erp-field-input"
                          placeholder="+216 XX XXX XXX"
                        />
                      </div>
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

export default CRMLeadsERP;
