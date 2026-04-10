/**
 * MaintenanceERP - Maintenance
 * Version complète avec design ERP moderne
 */

import React, { useEffect, useState } from 'react';
import { maintenanceService } from '../../services/api';
import { ERPHeader, ERPStatusbar, ERPNotebook, ERPChatter, ERPButtonBox, useNotifications } from '../../components/erp';
import { displayMany2One, formatDate, formatCurrency, formatState } from '../../utils/relations';
import { Plus, Edit, Trash2, Eye, Wrench, Search } from 'lucide-react';
import { validateForm, commonRules } from '../../utils/validation';

interface Maintenance {
  id: number;
  name: string;
  machine_id?: any;
  date: string;
  state: 'draft' | 'in_progress' | 'done' | 'cancel';
  type?: string;
}

const MaintenanceERP: React.FC = () => {
  const { success, error } = useNotifications();
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState<'list' | 'form'>('list');
  const [search, setSearch] = useState('');
  const [selectedMaintenance, setSelectedMaintenance] = useState<Maintenance | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadMaintenances();
  }, [search]);

  const loadMaintenances = async () => {
    setLoading(true);
    try {
      const params: any = { loadRelations: true };
      if (search) params.search = search;
      const response = await maintenanceService.getMaintenances(params);
      const data = Array.isArray(response.data) ? response.data : response.data.data || [];
      setMaintenances(data);
    } catch (error) {
      console.error('Erreur chargement maintenances:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedMaintenance(null);
    setShowForm(true);
    setViewType('form');
  };

  const handleEdit = (maintenance: Maintenance) => {
    setSelectedMaintenance(maintenance);
    setShowForm(true);
    setViewType('form');
  };

  const handleSave = async (formData: any) => {
    try {
      if (selectedMaintenance?.id) {
        await maintenanceService.updateMaintenance(selectedMaintenance.id, formData);
        success('Maintenance mise à jour avec succès');
      } else {
        await maintenanceService.createMaintenance(formData);
        success('Maintenance créée avec succès');
      }
      setShowForm(false);
      setSelectedMaintenance(null);
      setViewType('list');
      loadMaintenances();
    } catch (err: any) {
      error('Erreur enregistrement', err.response?.data?.error?.message || 'Erreur lors de l\'enregistrement');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette maintenance ?')) {
      try {
        await maintenanceService.deleteMaintenance(id);
        success('Maintenance supprimée avec succès');
        loadMaintenances();
      } catch (err: any) {
        error('Erreur suppression', err.response?.data?.error?.message || 'Erreur lors de la suppression');
      }
    }
  };

  const getStatusColor = (state: string) => {
    const colors: Record<string, string> = {
      draft: 'draft',
      in_progress: 'confirmed',
      done: 'done',
      cancel: 'cancelled'
    };
    return colors[state] || 'draft';
  };

  const getStatusLabel = (state: string) => {
    const labels: Record<string, string> = {
      draft: 'Brouillon',
      in_progress: 'En cours',
      done: 'Terminé',
      cancel: 'Annulé'
    };
    return labels[state] || state;
  };

  if (showForm) {
    return (
      <MaintenanceForm
        maintenance={selectedMaintenance}
        onClose={() => {
          setShowForm(false);
          setSelectedMaintenance(null);
          setViewType('list');
          loadMaintenances();
        }}
        onSave={handleSave}
      />
    );
  }

  return (
    <div className="erp-layout">
      <ERPHeader
        title="Maintenance"
        breadcrumb={[
          { label: 'Production' },
          { label: 'Maintenance' }
        ]}
        actions={
          <button onClick={handleCreate} className="erp-btn erp-btn-primary">
            <Plus size={16} style={{ marginRight: '4px' }} />
            Nouvelle Maintenance
          </button>
        }
      />

      <div className="erp-content">
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <div style={{ flex: 1, display: 'flex', gap: '8px' }}>
            <Search size={20} style={{ color: 'var(--erp-text-muted)' }} />
            <input
              type="text"
              placeholder="Rechercher une maintenance..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="erp-field-input"
              style={{ flex: 1 }}
            />
          </div>
        </div>

        <div className="erp-tree-view">
          <table className="erp-tree-table">
            <thead>
              <tr>
                <th>Référence</th>
                <th>Machine</th>
                <th>Type</th>
                <th>Date</th>
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
              ) : maintenances.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--erp-text-muted)' }}>
                    Aucune maintenance
                  </td>
                </tr>
              ) : (
                maintenances.map(maintenance => (
                  <tr key={maintenance.id}>
                    <td>{maintenance.name}</td>
                    <td>{displayMany2One(maintenance.machine_id)}</td>
                    <td>{maintenance.type || '-'}</td>
                    <td>{formatDate(maintenance.date)}</td>
                    <td>
                      <span className={`erp-status-badge ${getStatusColor(maintenance.state)}`}>
                        {getStatusLabel(maintenance.state)}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          onClick={() => handleEdit(maintenance)}
                          className="erp-btn erp-btn-outline"
                          style={{ padding: '4px 8px' }}
                          title="Voir/Modifier"
                        >
                          <Eye size={14} />
                        </button>
                        {maintenance.state === 'draft' && (
                          <button
                            onClick={() => handleDelete(maintenance.id)}
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
      </div>
    </div>
  );
};

// Composant Formulaire
const MaintenanceForm: React.FC<{
  maintenance: Maintenance | null;
  onClose: () => void;
  onSave: (data: any) => void;
}> = ({ maintenance, onClose, onSave }) => {
  const { error } = useNotifications();
  const [formData, setFormData] = useState({
    machine_id: maintenance?.machine_id?.[0] || null,
    date: maintenance?.date || new Date().toISOString().split('T')[0],
    type: maintenance?.type || '',
    description: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSaveClick = () => {
    const validation = validateForm(formData, {
      machine_id: { ...commonRules.required },
      date: { ...commonRules.required }
    });
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      error('Erreur de validation', 'Veuillez corriger les erreurs dans le formulaire');
      return;
    }
    
    setErrors({});
    onSave(formData);
  };

  return (
    <div className="erp-layout">
      <ERPHeader
        title={maintenance ? `Maintenance ${maintenance.name}` : 'Nouvelle Maintenance'}
        breadcrumb={[
          { label: 'Production' },
          { label: 'Maintenance' },
          { label: maintenance ? maintenance.name : 'Nouvelle' }
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
        {maintenance && (
          <ERPStatusbar
            status={{
              label: getStatusLabel(maintenance.state),
              value: maintenance.state,
              color: getStatusColor(maintenance.state) as any
            }}
            workflow={[
              { label: 'Brouillon', value: 'draft', color: 'draft' },
              { label: 'En cours', value: 'in_progress', color: 'confirmed' },
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
                      <label className="erp-field-label erp-field-required">Machine</label>
                      <input
                        type="text"
                        value={formData.machine_id || ''}
                        onChange={(e) => {
                          setFormData({ ...formData, machine_id: e.target.value ? parseInt(e.target.value) : null });
                          if (errors.machine_id) setErrors({ ...errors, machine_id: '' });
                        }}
                        className={`erp-field-input ${errors.machine_id ? 'erp-field-error' : ''}`}
                        placeholder="Sélectionner une machine..."
                      />
                      {errors.machine_id && <span className="erp-field-error-text">{errors.machine_id}</span>}
                    </div>
                    <div className="erp-field">
                      <label className="erp-field-label">Type</label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="erp-field-input"
                      >
                        <option value="">Sélectionner un type...</option>
                        <option value="preventive">Préventive</option>
                        <option value="corrective">Corrective</option>
                        <option value="predictive">Prédictive</option>
                      </select>
                    </div>
                    <div className="erp-field">
                      <label className="erp-field-label erp-field-required">Date</label>
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => {
                          setFormData({ ...formData, date: e.target.value });
                          if (errors.date) setErrors({ ...errors, date: '' });
                        }}
                        className={`erp-field-input ${errors.date ? 'erp-field-error' : ''}`}
                      />
                      {errors.date && <span className="erp-field-error-text">{errors.date}</span>}
                    </div>
                    <div className="erp-field">
                      <label className="erp-field-label">Description</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="erp-field-input"
                        rows={6}
                        placeholder="Description de la maintenance..."
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
    in_progress: 'confirmed',
    done: 'done',
    cancel: 'cancelled'
  };
  return colors[state] || 'draft';
};

const getStatusLabel = (state: string) => {
  const labels: Record<string, string> = {
    draft: 'Brouillon',
    in_progress: 'En cours',
    done: 'Terminé',
    cancel: 'Annulé'
  };
  return labels[state] || state;
};

export default MaintenanceERP;
