/**
 * TachesOdoo - Tâches
 * Version complète avec design Odoo moderne
 */

import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { ERPHeader, ERPStatusbar, ERPNotebook, ERPChatter, ERPButtonBox, useNotifications } from '../../components/erp';
import KanbanView from '../../components/erp/KanbanView';
import { displayMany2One, formatDate, formatCurrency, formatState } from '../../utils/relations';
import { validateForm, commonRules } from '../../utils/validation';
import { Plus, Edit, Trash2, Eye, CheckSquare, Search, List, Grid } from 'lucide-react';

interface Tache {
  id: number;
  name: string;
  project_id?: any;
  user_id?: any;
  date_deadline?: string;
  state: 'todo' | 'in_progress' | 'done' | 'cancel';
}

const TachesOdoo: React.FC = () => {
  const { success, error: showError } = useNotifications();
  const [taches, setTaches] = useState<Tache[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState<'list' | 'kanban' | 'form'>('list');
  const [search, setSearch] = useState('');
  const [selectedTache, setSelectedTache] = useState<Tache | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadTaches();
  }, [search]);

  const loadTaches = async () => {
    setLoading(true);
    try {
      const params: any = { loadRelations: true };
      if (search) params.search = search;
      const response = await api.get('/taches', { params });
      const data = Array.isArray(response.data) ? response.data : response.data.data || [];
      setTaches(data);
    } catch (error) {
      console.error('Erreur chargement tâches:', error);
      showError('Erreur', 'Impossible de charger les tâches');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedTache(null);
    setShowForm(true);
    setViewType('form');
  };

  const handleEdit = (tache: Tache) => {
    setSelectedTache(tache);
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
      if (selectedTache?.id) {
        await api.put(`/taches/${selectedTache.id}`, formData);
        success('Tâche modifiée', 'Les modifications ont été enregistrées');
      } else {
        await api.post('/taches', formData);
        success('Tâche créée', 'La tâche a été créée avec succès');
      }
      setShowForm(false);
      setSelectedTache(null);
      setViewType('list');
      loadTaches();
    } catch (error: any) {
      showError('Erreur', error.response?.data?.error?.message || 'Erreur lors de l\'enregistrement');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      try {
        await api.delete(`/taches/${id}`);
        success('Tâche supprimée', 'La tâche a été supprimée avec succès');
        loadTaches();
      } catch (error: any) {
        showError('Erreur', error.response?.data?.error?.message || 'Erreur lors de la suppression');
      }
    }
  };

  const getStatusColor = (state: string) => {
    const colors: Record<string, string> = {
      todo: 'draft',
      in_progress: 'confirmed',
      done: 'done',
      cancel: 'cancelled'
    };
    return colors[state] || 'draft';
  };

  const getStatusLabel = (state: string) => {
    const labels: Record<string, string> = {
      todo: 'À faire',
      in_progress: 'En cours',
      done: 'Terminé',
      cancel: 'Annulé'
    };
    return labels[state] || state;
  };

  const kanbanColumns = [
    {
      id: 'todo',
      title: 'À faire',
      items: taches.filter(t => t.state === 'todo')
    },
    {
      id: 'in_progress',
      title: 'En cours',
      items: taches.filter(t => t.state === 'in_progress')
    },
    {
      id: 'done',
      title: 'Terminé',
      items: taches.filter(t => t.state === 'done')
    }
  ];

  if (showForm) {
    return (
      <TacheForm
        tache={selectedTache}
        onClose={() => {
          setShowForm(false);
          setSelectedTache(null);
          setViewType('list');
          loadTaches();
        }}
        onSave={handleSave}
      />
    );
  }

  return (
    <div className="erp-layout">
      <ERPHeader
        title="Tâches"
        breadcrumb={[
          { label: 'Projets' },
          { label: 'Tâches' }
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
              Nouvelle Tâche
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
              placeholder="Rechercher une tâche..."
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
                  {item.project_id?.[1] || 'Projet'}
                </div>
                {item.date_deadline && (
                  <div style={{ fontSize: '11px', color: 'var(--erp-text-muted)', marginTop: '4px' }}>
                    Échéance: {new Date(item.date_deadline).toLocaleDateString()}
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
                  <th>Projet</th>
                  <th>Assigné à</th>
                  <th>Échéance</th>
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
                ) : taches.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--erp-text-muted)' }}>
                      Aucune tâche
                    </td>
                  </tr>
                ) : (
                  taches.map(tache => (
                    <tr key={tache.id}>
                      <td>{tache.name}</td>
                      <td>{displayMany2One(tache.project_id)}</td>
                      <td>{displayMany2One(tache.user_id)}</td>
                      <td>{formatDate(tache.date_deadline)}</td>
                      <td>
                        <span className={`erp-status-badge ${getStatusColor(tache.state)}`}>
                          {getStatusLabel(tache.state)}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            onClick={() => handleEdit(tache)}
                            className="erp-btn erp-btn-outline"
                            style={{ padding: '4px 8px' }}
                          >
                            <Eye size={14} />
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
const TacheForm: React.FC<{
  tache: Tache | null;
  onClose: () => void;
  onSave: (data: any) => void;
}> = ({ tache, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: tache?.name || '',
    project_id: tache?.project_id?.[0] || null,
    user_id: tache?.user_id?.[0] || null,
    date_deadline: tache?.date_deadline || '',
    description: ''
  });

  const handleSaveClick = () => {
    onSave(formData);
  };

  return (
    <div className="erp-layout">
      <ERPHeader
        title={tache ? `Tâche ${tache.name}` : 'Nouvelle Tâche'}
        breadcrumb={[
          { label: 'Projets' },
          { label: 'Tâches' },
          { label: tache ? tache.name : 'Nouvelle' }
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
        {tache && (
          <ERPStatusbar
            status={{
              label: getStatusLabel(tache.state),
              value: tache.state,
              color: getStatusColor(tache.state) as any
            }}
            workflow={[
              { label: 'À faire', value: 'todo', color: 'draft' },
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
                      <label className="erp-field-label erp-field-required">Nom</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="erp-field-input"
                        placeholder="Nom de la tâche..."
                      />
                    </div>
                    <div className="erp-field">
                      <label className="erp-field-label">Projet</label>
                      <input
                        type="text"
                        value={formData.project_id || ''}
                        onChange={(e) => setFormData({ ...formData, project_id: e.target.value ? parseInt(e.target.value) : null })}
                        className="erp-field-input"
                        placeholder="Sélectionner un projet..."
                      />
                    </div>
                    <div className="erp-field">
                      <label className="erp-field-label">Assigné à</label>
                      <input
                        type="text"
                        value={formData.user_id || ''}
                        onChange={(e) => setFormData({ ...formData, user_id: e.target.value ? parseInt(e.target.value) : null })}
                        className="erp-field-input"
                        placeholder="Sélectionner un utilisateur..."
                      />
                    </div>
                    <div className="erp-field">
                      <label className="erp-field-label">Date d'échéance</label>
                      <input
                        type="date"
                        value={formData.date_deadline}
                        onChange={(e) => setFormData({ ...formData, date_deadline: e.target.value })}
                        className="erp-field-input"
                      />
                    </div>
                    <div className="erp-field">
                      <label className="erp-field-label">Description</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="erp-field-input"
                        rows={6}
                        placeholder="Description de la tâche..."
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
    todo: 'draft',
    in_progress: 'confirmed',
    done: 'done',
    cancel: 'cancelled'
  };
  return colors[state] || 'draft';
};

const getStatusLabel = (state: string) => {
  const labels: Record<string, string> = {
    todo: 'À faire',
    in_progress: 'En cours',
    done: 'Terminé',
    cancel: 'Annulé'
  };
  return labels[state] || state;
};

export default TachesOdoo;
