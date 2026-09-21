/**
 * CRMCampaignsERP - Campagnes CRM
 * Module de campagnes marketing
 */

import React, { useState, useEffect } from 'react';
import { Mail, Users, Target, TrendingUp, Plus, Edit, Trash2, Play, Pause } from 'lucide-react';
import api from '../../services/api';
import { crmCampaignsService } from '../../services/api';
import { ERPHeader, ERPStatusbar, ERPNotebook, ERPChatter, useNotifications } from '../../components/erp';
import { displayMany2One, formatDate, formatCurrency, formatState } from '../../utils/relations';
import { validateForm, commonRules } from '../../utils/validation';

interface Campaign {
  id: number;
  name: string;
  type: 'email' | 'sms' | 'social';
  statut: 'draft' | 'running' | 'completed' | 'cancelled';
  date_start: string;
  date_end: string;
  participants_count: number;
  opened_count: number;
  clicked_count: number;
  converted_count: number;
}

const CRMCampaignsERP: React.FC = () => {
  const { success, error } = useNotifications();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadCampaigns();
  }, [search]);

  const loadCampaigns = async () => {
    setLoading(true);
    try {
      const params: any = { loadRelations: true };
      if (search) params.search = search;

      const response = await crmCampaignsService.getCampaigns(params);
      setCampaigns(response.data.data || []);
    } catch (error) {
      console.error('Erreur chargement campagnes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedCampaign(null);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette campagne ?')) {
      try {
        await crmCampaignsService.deleteCampaign(id);
        success('Campagne supprimée');
        loadCampaigns();
      } catch (err: any) {
        error('Erreur suppression', err.response?.data?.error?.message || 'Erreur lors de la suppression');
      }
    }
  };

  const handleStart = async (id: number) => {
    try {
      await crmCampaignsService.startCampaign(id);
      success('Campagne démarrée');
      loadCampaigns();
    } catch (err: any) {
      error('Erreur démarrage', err.response?.data?.error?.message || 'Erreur lors du démarrage');
    }
  };

  const getStatusColor = (statut: string) => {
    const colors: Record<string, string> = {
      draft: 'draft',
      running: 'confirmed',
      completed: 'done',
      cancelled: 'cancelled'
    };
    return colors[statut] || 'draft';
  };

  const getStatusLabel = (statut: string) => {
    const labels: Record<string, string> = {
      draft: 'Brouillon',
      running: 'En cours',
      completed: 'Terminée',
      cancelled: 'Annulée'
    };
    return labels[statut] || statut;
  };

  if (showForm) {
    return (
      <CampaignForm
        campaign={selectedCampaign}
        onClose={() => {
          setShowForm(false);
          setSelectedCampaign(null);
          loadCampaigns();
        }}
        onSave={loadCampaigns}
      />
    );
  }

  return (
    <div className="erp-layout">
      <ERPHeader
        title="Campagnes CRM"
        breadcrumb={[{ label: 'CRM', path: '/crm/leads' }, { label: 'Campagnes' }]}
        actions={
          <button onClick={handleCreate} className="erp-btn erp-btn-primary">
            <Plus size={16} style={{ marginRight: '4px' }} />
            Nouvelle Campagne
          </button>
        }
      />

      <div className="erp-content">
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <input
            type="text"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="erp-field-input"
            style={{ flex: 1 }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {loading ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '32px' }}>
              Chargement...
            </div>
          ) : campaigns.length === 0 ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '32px', color: 'var(--erp-text-muted)' }}>
              Aucune campagne
            </div>
          ) : (
            campaigns.map(campaign => (
              <div
                key={campaign.id}
                className="erp-kanban-card"
                onClick={() => {
                  setSelectedCampaign(campaign);
                  setShowForm(true);
                }}
              >
                <div className="erp-kanban-card-header">
                  <span className="erp-kanban-card-title">{campaign.name}</span>
                  <span className={`erp-status-badge ${getStatusColor(campaign.statut)}`}>
                    {getStatusLabel(campaign.statut)}
                  </span>
                </div>
                <div className="erp-kanban-card-content">
                  <div style={{ display: 'flex', gap: '16px', marginTop: '12px', fontSize: '14px' }}>
                    <div>
                      <Users size={16} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                      {campaign.participants_count} participants
                    </div>
                    <div>
                      <Mail size={16} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                      {campaign.opened_count} ouverts
                    </div>
                  </div>
                  <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--erp-text-secondary)' }}>
                    {new Date(campaign.date_start).toLocaleDateString()} - {new Date(campaign.date_end).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                  {campaign.statut === 'draft' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStart(campaign.id);
                      }}
                      className="erp-btn erp-btn-success"
                      style={{ flex: 1, padding: '8px' }}
                    >
                      <Play size={14} style={{ marginRight: '4px' }} />
                      Démarrer
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// Composant Formulaire
const CampaignForm: React.FC<{
  campaign: Campaign | null;
  onClose: () => void;
  onSave: () => void;
}> = ({ campaign, onClose, onSave }) => {
  const { success, error: errorNotify } = useNotifications();
  const [formData, setFormData] = useState({
    name: campaign?.name || '',
    type: campaign?.type || 'email',
    date_start: campaign?.date_start || '',
    date_end: campaign?.date_end || '',
    description: ''
  });
  const [participants, setParticipants] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);

  useEffect(() => {
    loadLeads();
    loadOpportunities();
  }, []);

  const loadLeads = async () => {
    try {
      const response = await api.get(`/crm/campaigns/${campaign!.id}/leads`);
      setLeads(response.data.data || []);
    } catch (error) {
      console.error('Erreur chargement leads:', error);
    }
  };

  const loadOpportunities = async () => {
    try {
      const response = await api.get(`/crm/campaigns/${campaign!.id}/opportunities`);
      setOpportunities(response.data.data || []);
    } catch (error) {
      console.error('Erreur chargement opportunités:', error);
    }
  };

  const handleSave = async () => {
    try {
      if (campaign?.id) {
        await api.put(`/crm/campaigns/${campaign.id}`, {
          ...formData,
          participants
        });
      } else {
        await crmCampaignsService.createCampaign({
          ...formData,
          participants
        });
      }
      success('Campagne enregistrée');
      onSave();
      onClose();
    } catch (err: any) {
      errorNotify('Erreur enregistrement', err.response?.data?.error?.message || 'Erreur lors de l\'enregistrement');
    }
  };

  return (
    <div className="erp-layout">
      <ERPHeader
        title={campaign ? `Campagne ${campaign.name}` : 'Nouvelle Campagne'}
        breadcrumb={[
          { label: 'CRM' },
          { label: 'Campagnes' },
          { label: campaign ? campaign.name : 'Nouvelle' }
        ]}
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={onClose} className="erp-btn erp-btn-outline">
              Annuler
            </button>
            <button onClick={handleSave} className="erp-btn erp-btn-primary">
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
                      />
                    </div>
                    <div className="erp-field">
                      <label className="erp-field-label erp-field-required">Type</label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                        className="erp-field-input"
                      >
                        <option value="email">Email</option>
                        <option value="sms">SMS</option>
                        <option value="social">Réseaux sociaux</option>
                      </select>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div className="erp-field">
                        <label className="erp-field-label">Date de début</label>
                        <input
                          type="date"
                          value={formData.date_start}
                          onChange={(e) => setFormData({ ...formData, date_start: e.target.value })}
                          className="erp-field-input"
                        />
                      </div>
                      <div className="erp-field">
                        <label className="erp-field-label">Date de fin</label>
                        <input
                          type="date"
                          value={formData.date_end}
                          onChange={(e) => setFormData({ ...formData, date_end: e.target.value })}
                          className="erp-field-input"
                        />
                      </div>
                    </div>
                    <div className="erp-field">
                      <label className="erp-field-label">Description</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="erp-field-input"
                        rows={4}
                      />
                    </div>
                  </div>
                )
              },
              {
                label: 'Participants',
                content: (
                  <div>
                    <div style={{ marginBottom: '16px' }}>
                      <h4 style={{ marginBottom: '8px' }}>Leads</h4>
                      <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                        {leads.map(lead => (
                          <label key={lead.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px' }}>
                            <input
                              type="checkbox"
                              checked={participants.some(p => p.id === lead.id && p.type === 'lead')}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setParticipants([...participants, { id: lead.id, type: 'lead', name: lead.name }]);
                                } else {
                                  setParticipants(participants.filter(p => !(p.id === lead.id && p.type === 'lead')));
                                }
                              }}
                            />
                            {lead.name}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 style={{ marginBottom: '8px' }}>Opportunités</h4>
                      <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                        {opportunities.map(opp => (
                          <label key={opp.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px' }}>
                            <input
                              type="checkbox"
                              checked={participants.some(p => p.id === opp.id && p.type === 'opportunity')}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setParticipants([...participants, { id: opp.id, type: 'opportunity', name: opp.name }]);
                                } else {
                                  setParticipants(participants.filter(p => !(p.id === opp.id && p.type === 'opportunity')));
                                }
                              }}
                            />
                            {opp.name}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div style={{ marginTop: '16px', padding: '12px', background: 'var(--erp-bg-secondary)', borderRadius: 'var(--erp-border-radius)' }}>
                      <strong>{participants.length} participant(s) sélectionné(s)</strong>
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

export default CRMCampaignsERP;
