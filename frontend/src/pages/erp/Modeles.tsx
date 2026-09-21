/**
 * ModelesERP - Modèles
 * Version complète avec design ERP moderne
 */

import React, { useEffect, useState } from 'react';
import { modelesService } from '../../services/api';
import { ERPHeader, ERPStatusbar, ERPNotebook, ERPChatter, ERPButtonBox, useNotifications } from '../../components/erp';
import { displayMany2One, formatDate, formatCurrency, formatState } from '../../utils/relations';
import { Plus, Edit, Trash2, Eye, FileImage, Search } from 'lucide-react';
import { validateForm, commonRules } from '../../utils/validation';

interface Modele {
  id: number;
  name: string;
  code?: string;
  category_id?: any;
  active?: boolean;
}

const ModelesERP: React.FC = () => {
  const { success, error } = useNotifications();
  const [modeles, setModeles] = useState<Modele[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState<'list' | 'form'>('list');
  const [search, setSearch] = useState('');
  const [selectedModele, setSelectedModele] = useState<Modele | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadModeles();
  }, [search]);

  const loadModeles = async () => {
    setLoading(true);
    try {
      const params: any = { loadRelations: true };
      if (search) params.search = search;
      const response = await modelesService.getModeles(params);
      const data = Array.isArray(response.data) ? response.data : response.data.data || [];
      setModeles(data);
    } catch (error) {
      console.error('Erreur chargement modèles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedModele(null);
    setShowForm(true);
    setViewType('form');
  };

  const handleEdit = (modele: Modele) => {
    setSelectedModele(modele);
    setShowForm(true);
    setViewType('form');
  };

  const handleSave = async (formData: any) => {
    try {
      if (selectedModele?.id) {
        await modelesService.updateModele(selectedModele.id, formData);
        success('Modèle mis à jour avec succès');
      } else {
        await modelesService.createModele(formData);
        success('Modèle créé avec succès');
      }
      setShowForm(false);
      setSelectedModele(null);
      setViewType('list');
      loadModeles();
    } catch (err: any) {
      error('Erreur enregistrement', err.response?.data?.error?.message || 'Erreur lors de l\'enregistrement');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce modèle ?')) {
      try {
        await modelesService.deleteModele(id);
        success('Modèle supprimé avec succès');
        loadModeles();
      } catch (err: any) {
        error('Erreur suppression', err.response?.data?.error?.message || 'Erreur lors de la suppression');
      }
    }
  };

  if (showForm) {
    return (
      <ModeleForm
        modele={selectedModele}
        onClose={() => {
          setShowForm(false);
          setSelectedModele(null);
          setViewType('list');
          loadModeles();
        }}
        onSave={handleSave}
      />
    );
  }

  return (
    <div className="erp-layout">
      <ERPHeader
        title="Modèles"
        breadcrumb={[
          { label: 'Production' },
          { label: 'Modèles' }
        ]}
        actions={
          <button onClick={handleCreate} className="erp-btn erp-btn-primary">
            <Plus size={16} style={{ marginRight: '4px' }} />
            Nouveau Modèle
          </button>
        }
      />

      <div className="erp-content">
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <div style={{ flex: 1, display: 'flex', gap: '8px' }}>
            <Search size={20} style={{ color: 'var(--erp-text-muted)' }} />
            <input
              type="text"
              placeholder="Rechercher un modèle..."
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
                <th>Code</th>
                <th>Nom</th>
                <th>Catégorie</th>
                <th>Actif</th>
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
              ) : modeles.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: 'var(--erp-text-muted)' }}>
                    Aucun modèle
                  </td>
                </tr>
              ) : (
                modeles.map(modele => (
                  <tr key={modele.id}>
                    <td>{modele.code || '-'}</td>
                    <td>{modele.name}</td>
                    <td>{displayMany2One(modele.category_id)}</td>
                    <td>
                      {modele.active ? (
                        <span className="erp-status-badge done">Oui</span>
                      ) : (
                        <span className="erp-status-badge cancelled">Non</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          onClick={() => handleEdit(modele)}
                          className="erp-btn erp-btn-outline"
                          style={{ padding: '4px 8px' }}
                          title="Voir/Modifier"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(modele.id)}
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
      </div>
    </div>
  );
};

// Composant Formulaire
const ModeleForm: React.FC<{
  modele: Modele | null;
  onClose: () => void;
  onSave: (data: any) => void;
}> = ({ modele, onClose, onSave }) => {
  const { error } = useNotifications();
  const [formData, setFormData] = useState({
    name: modele?.name || '',
    code: modele?.code || '',
    category_id: modele?.category_id?.[0] || null,
    active: modele?.active !== false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSaveClick = () => {
    const validation = validateForm(formData, {
      name: { ...commonRules.required }
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
        title={modele ? `Modèle ${modele.name}` : 'Nouveau Modèle'}
        breadcrumb={[
          { label: 'Production' },
          { label: 'Modèles' },
          { label: modele ? modele.name : 'Nouveau' }
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
                        onChange={(e) => {
                          setFormData({ ...formData, name: e.target.value });
                          if (errors.name) setErrors({ ...errors, name: '' });
                        }}
                        className={`erp-field-input ${errors.name ? 'erp-field-error' : ''}`}
                        placeholder="Nom du modèle..."
                      />
                      {errors.name && <span className="erp-field-error-text">{errors.name}</span>}
                    </div>
                    <div className="erp-field">
                      <label className="erp-field-label">Code</label>
                      <input
                        type="text"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                        className="erp-field-input"
                        placeholder="Code modèle..."
                      />
                    </div>
                    <div className="erp-field">
                      <label className="erp-field-label">Catégorie</label>
                      <input
                        type="text"
                        value={formData.category_id || ''}
                        onChange={(e) => setFormData({ ...formData, category_id: e.target.value ? parseInt(e.target.value) : null })}
                        className="erp-field-input"
                        placeholder="Sélectionner une catégorie..."
                      />
                    </div>
                    <div className="erp-field">
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="checkbox"
                          checked={formData.active}
                          onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                        />
                        Actif
                      </label>
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

export default ModelesERP;
