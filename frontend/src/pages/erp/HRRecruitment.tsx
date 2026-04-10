/**
 * HRRecruitmentERP - Recrutement
 * Version complète avec design ERP moderne
 */

import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { ERPHeader, ERPStatusbar, ERPNotebook, ERPChatter, ERPButtonBox, useNotifications } from '../../components/erp';
import KanbanView from '../../components/erp/KanbanView';
import { displayMany2One, formatDate, formatCurrency, formatState } from '../../utils/relations';
import { Plus, Edit, Trash2, Eye, UserPlus, Search, List, Grid } from 'lucide-react';
import { validateForm, commonRules } from '../../utils/validation';

interface Applicant {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  job_id?: any;
  stage_id?: any;
  expected_salary?: number;
}

const HRRecruitmentERP: React.FC = () => {
  const { success, error } = useNotifications();
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState<'list' | 'kanban' | 'form'>('list');
  const [search, setSearch] = useState('');
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadApplicants();
  }, [search]);

  const loadApplicants = async () => {
    setLoading(true);
    try {
      const params: any = { loadRelations: true };
      if (search) params.search = search;
      const response = await api.get('/hr/applicants', { params });
      const data = Array.isArray(response.data) ? response.data : response.data.data || [];
      setApplicants(data);
    } catch (error) {
      console.error('Erreur chargement candidats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedApplicant(null);
    setShowForm(true);
    setViewType('form');
  };

  const handleEdit = (applicant: Applicant) => {
    setSelectedApplicant(applicant);
    setShowForm(true);
    setViewType('form');
  };

  const handleSave = async (formData: any) => {
    try {
      if (selectedApplicant?.id) {
        await api.put(`/hr/applicants/${selectedApplicant.id}`, formData);
      } else {
        await api.post('/hr/applicants', formData);
      }
      setShowForm(false);
      setSelectedApplicant(null);
      setViewType('list');
      loadApplicants();
    } catch (error: any) {
      error('Erreur', error.response?.data?.error?.message || 'Erreur lors de l\'enregistrement');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce candidat ?')) {
      try {
        await api.delete(`/hr/applicants/${id}`);
        success('Suppression réussie');
        loadApplicants();
      } catch (error: any) {
        error('Erreur', error.response?.data?.error?.message || 'Erreur lors de la suppression');
      }
    }
  };

  const kanbanColumns = [
    {
      id: 'new',
      title: 'Nouveau',
      items: applicants.filter(a => !a.stage_id || a.stage_id[1] === 'Nouveau')
    },
    {
      id: 'interview',
      title: 'Entretien',
      items: applicants.filter(a => a.stage_id?.[1] === 'Entretien')
    },
    {
      id: 'offer',
      title: 'Offre',
      items: applicants.filter(a => a.stage_id?.[1] === 'Offre')
    },
    {
      id: 'hired',
      title: 'Embauché',
      items: applicants.filter(a => a.stage_id?.[1] === 'Embauché')
    }
  ];

  if (showForm) {
    return (
      <ApplicantForm
        applicant={selectedApplicant}
        onClose={() => {
          setShowForm(false);
          setSelectedApplicant(null);
          setViewType('list');
          loadApplicants();
        }}
        onSave={handleSave}
      />
    );
  }

  return (
    <div className="erp-layout">
      <ERPHeader
        title="Recrutement"
        breadcrumb={[
          { label: 'Ressources Humaines' },
          { label: 'Recrutement' }
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
              Nouveau Candidat
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
              placeholder="Rechercher un candidat..."
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
                  {item.job_id?.[1] || 'Poste'}
                </div>
                {item.expected_salary && (
                  <div style={{ fontWeight: 600, color: 'var(--erp-primary)' }}>
                    {item.expected_salary.toFixed(2)} TND
                  </div>
                )}
              </div>
            )}
          />
        ) : (
          <div className="erp-tree-view">
            <table className="erp-tree-table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Email</th>
                  <th>Téléphone</th>
                  <th>Poste</th>
                  <th>Salaire attendu</th>
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
                ) : applicants.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--erp-text-muted)' }}>
                      Aucun candidat
                    </td>
                  </tr>
                ) : (
                  applicants.map(applicant => (
                    <tr key={applicant.id}>
                      <td>{applicant.name}</td>
                      <td>{applicant.email || '-'}</td>
                      <td>{applicant.phone || '-'}</td>
                      <td>{displayMany2One(applicant.job_id)}</td>
                      <td>{formatCurrency(applicant.expected_salary)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            onClick={() => handleEdit(applicant)}
                            className="erp-btn erp-btn-outline"
                            style={{ padding: '4px 8px' }}
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(applicant.id)}
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
const ApplicantForm: React.FC<{
  applicant: Applicant | null;
  onClose: () => void;
  onSave: (data: any) => void;
}> = ({ applicant, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: applicant?.name || '',
    email: applicant?.email || '',
    phone: applicant?.phone || '',
    job_id: applicant?.job_id?.[0] || null,
    expected_salary: applicant?.expected_salary || 0,
    notes: ''
  });

  const handleSaveClick = () => {
    onSave(formData);
  };

  return (
    <div className="erp-layout">
      <ERPHeader
        title={applicant ? `Candidat ${applicant.name}` : 'Nouveau Candidat'}
        breadcrumb={[
          { label: 'Ressources Humaines' },
          { label: 'Recrutement' },
          { label: applicant ? applicant.name : 'Nouveau' }
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
                        placeholder="Nom complet..."
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
                    <div className="erp-field">
                      <label className="erp-field-label">Poste</label>
                      <input
                        type="text"
                        value={formData.job_id || ''}
                        onChange={(e) => setFormData({ ...formData, job_id: e.target.value ? parseInt(e.target.value) : null })}
                        className="erp-field-input"
                        placeholder="Sélectionner un poste..."
                      />
                    </div>
                    <div className="erp-field">
                      <label className="erp-field-label">Salaire attendu</label>
                      <input
                        type="number"
                        value={formData.expected_salary}
                        onChange={(e) => setFormData({ ...formData, expected_salary: parseFloat(e.target.value) || 0 })}
                        className="erp-field-input"
                        step="0.01"
                        min="0"
                      />
                    </div>
                    <div className="erp-field">
                      <label className="erp-field-label">Notes</label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="erp-field-input"
                        rows={4}
                        placeholder="Notes sur le candidat..."
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

export default HRRecruitmentERP;
