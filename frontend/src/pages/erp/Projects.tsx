/**
 * ProjectsERP - Projets
 * Version complète avec design ERP moderne
 */

import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { ERPHeader, ERPStatusbar, ERPNotebook, ERPChatter, ERPButtonBox, useNotifications } from '../../components/erp';
import { displayMany2One, formatDate, formatCurrency, formatState } from '../../utils/relations';
import { validateForm, commonRules } from '../../utils/validation';
import { Plus, Edit, Trash2, Eye, FolderKanban, Search } from 'lucide-react';

interface Project {
  id: number;
  name: string;
  partner_id?: any;
  date_start?: string;
  date_end?: string;
  state: 'draft' | 'open' | 'done' | 'cancel';
}

const ProjectsERP: React.FC = () => {
  const { success, error: showError } = useNotifications();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState<'list' | 'form'>('list');
  const [search, setSearch] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadProjects();
  }, [search]);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const params: any = { loadRelations: true };
      if (search) params.search = search;
      const response = await api.get('/project/projects', { params });
      const data = Array.isArray(response.data) ? response.data : response.data.data || [];
      setProjects(data);
    } catch (error) {
      console.error('Erreur chargement projets:', error);
      showError('Erreur', 'Impossible de charger les projets');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedProject(null);
    setShowForm(true);
    setViewType('form');
  };

  const handleEdit = (project: Project) => {
    setSelectedProject(project);
    setShowForm(true);
    setViewType('form');
  };

  const handleSave = async (formData: any) => {
    // Validation
    const rules = {
      name: commonRules.required
    };
    const validation = validateForm(formData, rules);
    if (!validation.isValid) {
      showError('Erreur de validation', Object.values(validation.errors)[0]);
      return;
    }

    try {
      if (selectedProject?.id) {
        await api.put(`/project/projects/${selectedProject.id}`, formData);
        success('Projet modifié', 'Les modifications ont été enregistrées');
      } else {
        await api.post('/project/projects', formData);
        success('Projet créé', 'Le projet a été créé avec succès');
      }
      setShowForm(false);
      setSelectedProject(null);
      setViewType('list');
      loadProjects();
    } catch (error: any) {
      showError('Erreur', error.response?.data?.error?.message || 'Erreur lors de l\'enregistrement');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
      try {
        await api.delete(`/project/projects/${id}`);
        success('Projet supprimé', 'Le projet a été supprimé avec succès');
        loadProjects();
      } catch (error: any) {
        showError('Erreur', error.response?.data?.error?.message || 'Erreur lors de la suppression');
      }
    }
  };

  const getStatusColor = (state: string) => {
    const colors: Record<string, string> = {
      draft: 'draft',
      open: 'confirmed',
      done: 'done',
      cancel: 'cancelled'
    };
    return colors[state] || 'draft';
  };

  const getStatusLabel = (state: string) => {
    const labels: Record<string, string> = {
      draft: 'Brouillon',
      open: 'Ouvert',
      done: 'Terminé',
      cancel: 'Annulé'
    };
    return labels[state] || state;
  };

  if (showForm) {
    return (
      <ProjectForm
        project={selectedProject}
        onClose={() => {
          setShowForm(false);
          setSelectedProject(null);
          setViewType('list');
          loadProjects();
        }}
        onSave={handleSave}
      />
    );
  }

  return (
    <div className="erp-layout">
      <ERPHeader
        title="Projets"
        breadcrumb={[
          { label: 'Projets' },
          { label: 'Projets' }
        ]}
        actions={
          <button onClick={handleCreate} className="erp-btn erp-btn-primary">
            <Plus size={16} style={{ marginRight: '4px' }} />
            Nouveau Projet
          </button>
        }
      />

      <div className="erp-content">
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <div style={{ flex: 1, display: 'flex', gap: '8px' }}>
            <Search size={20} style={{ color: 'var(--erp-text-muted)' }} />
            <input
              type="text"
              placeholder="Rechercher un projet..."
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
                <th>Nom</th>
                <th>Client</th>
                <th>Date début</th>
                <th>Date fin</th>
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
              ) : projects.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--erp-text-muted)' }}>
                    Aucun projet
                  </td>
                </tr>
              ) : (
                projects.map(project => (
                  <tr key={project.id}>
                    <td>{project.name}</td>
                    <td>{displayMany2One(project.partner_id)}</td>
                    <td>{formatDate(project.date_start)}</td>
                    <td>{formatDate(project.date_end)}</td>
                    <td>
                      <span className={`erp-status-badge ${getStatusColor(project.state)}`}>
                        {getStatusLabel(project.state)}
                      </span>
                    </td>
                    <td>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            onClick={() => handleEdit(project)}
                            className="erp-btn erp-btn-outline"
                            style={{ padding: '4px 8px' }}
                            title="Voir/Modifier"
                          >
                            <Eye size={14} />
                          </button>
                          {project.state === 'draft' && (
                            <button
                              onClick={() => handleDelete(project.id)}
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
const ProjectForm: React.FC<{
  project: Project | null;
  onClose: () => void;
  onSave: (data: any) => void;
}> = ({ project, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: project?.name || '',
    partner_id: project?.partner_id?.[0] || null,
    date_start: project?.date_start || new Date().toISOString().split('T')[0],
    date_end: project?.date_end || '',
    notes: ''
  });

  const handleSaveClick = () => {
    onSave(formData);
  };

  return (
    <div className="erp-layout">
      <ERPHeader
        title={project ? `Projet ${project.name}` : 'Nouveau Projet'}
        breadcrumb={[
          { label: 'Projets' },
          { label: 'Projets' },
          { label: project ? project.name : 'Nouveau' }
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
        {project && (
          <ERPStatusbar
            status={{
              label: getStatusLabel(project.state),
              value: project.state,
              color: getStatusColor(project.state) as any
            }}
            workflow={[
              { label: 'Brouillon', value: 'draft', color: 'draft' },
              { label: 'Ouvert', value: 'open', color: 'confirmed' },
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
                      <label className="erp-field-label erp-field-required">Nom</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="erp-field-input"
                        placeholder="Nom du projet..."
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
                      <label className="erp-field-label">Notes</label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="erp-field-input"
                        rows={4}
                        placeholder="Description du projet..."
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
    open: 'confirmed',
    done: 'done',
    cancel: 'cancelled'
  };
  return colors[state] || 'draft';
};

const getStatusLabel = (state: string) => {
  const labels: Record<string, string> = {
    draft: 'Brouillon',
    open: 'Ouvert',
    done: 'Terminé',
    cancel: 'Annulé'
  };
  return labels[state] || state;
};

export default ProjectsERP;
