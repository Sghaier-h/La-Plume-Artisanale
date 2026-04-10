/**
 * MatieresPremieresERP - Matières Premières
 * Version complète avec design ERP moderne
 */

import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { matieresPremieresService } from '../../services/api';
import { ERPHeader, ERPStatusbar, ERPNotebook, ERPChatter, ERPButtonBox, useNotifications } from '../../components/erp';
import { displayMany2One, formatDate, formatCurrency, formatState } from '../../utils/relations';
import { Plus, Edit, Trash2, Eye, Package, Search } from 'lucide-react';
import { validateForm, commonRules } from '../../utils/validation';

interface MatierePremiere {
  id: number;
  name: string;
  code?: string;
  category_id?: any;
  qty_available?: number;
  active?: boolean;
}

const MatieresPremieresERP: React.FC = () => {
  const { success, error } = useNotifications();
  const [matieres, setMatieres] = useState<MatierePremiere[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState<'list' | 'form'>('list');
  const [search, setSearch] = useState('');
  const [selectedMatiere, setSelectedMatiere] = useState<MatierePremiere | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadMatieres();
  }, [search]);

  const loadMatieres = async () => {
    setLoading(true);
    try {
      const params: any = { loadRelations: true };
      if (search) params.search = search;
      const response = await matieresPremieresService.getMatieresPremieres(params);
      const data = Array.isArray(response.data) ? response.data : response.data.data || [];
      setMatieres(data);
    } catch (error) {
      console.error('Erreur chargement matières premières:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedMatiere(null);
    setShowForm(true);
    setViewType('form');
  };

  const handleEdit = (matiere: MatierePremiere) => {
    setSelectedMatiere(matiere);
    setShowForm(true);
    setViewType('form');
  };

  const handleSave = async (formData: any) => {
    try {
      if (selectedMatiere?.id) {
        await matieresPremieresService.updateMatierePremiere(selectedMatiere.id, formData);
        success('Matière première mise à jour avec succès');
      } else {
        await matieresPremieresService.createMatierePremiere(formData);
        success('Matière première créée avec succès');
      }
      setShowForm(false);
      setSelectedMatiere(null);
      setViewType('list');
      loadMatieres();
    } catch (err: any) {
      error('Erreur enregistrement', err.response?.data?.error?.message || 'Erreur lors de l\'enregistrement');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette matière première ?')) {
      try {
        await matieresPremieresService.deleteMatierePremiere(id);
        success('Matière première supprimée avec succès');
        loadMatieres();
      } catch (err: any) {
        error('Erreur suppression', err.response?.data?.error?.message || 'Erreur lors de la suppression');
      }
    }
  };

  if (showForm) {
    return (
      <MatierePremiereForm
        matiere={selectedMatiere}
        onClose={() => {
          setShowForm(false);
          setSelectedMatiere(null);
          setViewType('list');
          loadMatieres();
        }}
        onSave={handleSave}
      />
    );
  }

  return (
    <div className="erp-layout">
      <ERPHeader
        title="Matières Premières"
        breadcrumb={[
          { label: 'Stock' },
          { label: 'Matières Premières' }
        ]}
        actions={
          <button onClick={handleCreate} className="erp-btn erp-btn-primary">
            <Plus size={16} style={{ marginRight: '4px' }} />
            Nouvelle Matière
          </button>
        }
      />

      <div className="erp-content">
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <div style={{ flex: 1, display: 'flex', gap: '8px' }}>
            <Search size={20} style={{ color: 'var(--erp-text-muted)' }} />
            <input
              type="text"
              placeholder="Rechercher une matière première..."
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
                <th>Stock disponible</th>
                <th>Actif</th>
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
              ) : matieres.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--erp-text-muted)' }}>
                    Aucune matière première
                  </td>
                </tr>
              ) : (
                matieres.map(matiere => (
                  <tr key={matiere.id}>
                    <td>{matiere.code || '-'}</td>
                    <td>{matiere.name}</td>
                    <td>{displayMany2One(matiere.category_id)}</td>
                    <td>{matiere.qty_available?.toFixed(2) || '0.00'}</td>
                    <td>
                      {matiere.active ? (
                        <span className="erp-status-badge done">Oui</span>
                      ) : (
                        <span className="erp-status-badge cancelled">Non</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          onClick={() => handleEdit(matiere)}
                          className="erp-btn erp-btn-outline"
                          style={{ padding: '4px 8px' }}
                          title="Voir/Modifier"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(matiere.id)}
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
const MatierePremiereForm: React.FC<{
  matiere: MatierePremiere | null;
  onClose: () => void;
  onSave: (data: any) => void;
}> = ({ matiere, onClose, onSave }) => {
  const { error } = useNotifications();
  const [formData, setFormData] = useState({
    name: matiere?.name || '',
    code: matiere?.code || '',
    category_id: matiere?.category_id?.[0] || null,
    active: matiere?.active !== false
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
        title={matiere ? `Matière ${matiere.name}` : 'Nouvelle Matière Première'}
        breadcrumb={[
          { label: 'Stock' },
          { label: 'Matières Premières' },
          { label: matiere ? matiere.name : 'Nouvelle' }
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
                        placeholder="Nom de la matière première..."
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
                        placeholder="Code matière..."
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

export default MatieresPremieresERP;
