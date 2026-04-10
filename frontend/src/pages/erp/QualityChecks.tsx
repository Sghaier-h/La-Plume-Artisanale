/**
 * QualityChecksERP - Contrôles Qualité
 * Version complète avec design ERP moderne
 */

import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { ERPHeader, ERPStatusbar, ERPNotebook, ERPChatter, ERPButtonBox, useNotifications } from '../../components/erp';
import { displayMany2One, formatDate, formatCurrency, formatState } from '../../utils/relations';
import { validateForm, commonRules } from '../../utils/validation';
import { Plus, Edit, Trash2, Eye, CheckCircle, XCircle, Search } from 'lucide-react';

interface QualityCheck {
  id: number;
  name: string;
  product_id?: any;
  picking_id?: any;
  point_id?: any;
  quality_state: 'none' | 'pass' | 'fail';
  date: string;
}

const QualityChecksERP: React.FC = () => {
  const { success, error: showError } = useNotifications();
  const [checks, setChecks] = useState<QualityCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState<'list' | 'form'>('list');
  const [search, setSearch] = useState('');
  const [selectedCheck, setSelectedCheck] = useState<QualityCheck | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadChecks();
  }, [search]);

  const loadChecks = async () => {
    setLoading(true);
    try {
      const params: any = { loadRelations: true };
      if (search) params.search = search;
      const response = await api.get('/quality/checks', { params });
      const data = Array.isArray(response.data) ? response.data : response.data.data || [];
      setChecks(data);
    } catch (error) {
      console.error('Erreur chargement contrôles:', error);
      showError('Erreur', 'Impossible de charger les contrôles qualité');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedCheck(null);
    setShowForm(true);
    setViewType('form');
  };

  const handleEdit = (check: QualityCheck) => {
    setSelectedCheck(check);
    setShowForm(true);
    setViewType('form');
  };

  const handlePass = async (id: number) => {
    try {
      await api.post(`/quality/checks/${id}/pass`);
      success('Contrôle validé', 'Le contrôle qualité a été validé avec succès');
      loadChecks();
    } catch (error: any) {
      showError('Erreur', error.response?.data?.error?.message || 'Erreur lors de la validation');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce contrôle qualité ?')) {
      try {
        await api.delete(`/quality/checks/${id}`);
        success('Contrôle supprimé', 'Le contrôle qualité a été supprimé avec succès');
        loadChecks();
      } catch (error: any) {
        showError('Erreur', error.response?.data?.error?.message || 'Erreur lors de la suppression');
      }
    }
  };

  const handleFail = async (id: number) => {
    try {
      await api.post(`/quality/checks/${id}/fail`);
      success('Contrôle rejeté', 'Le contrôle qualité a été rejeté');
      loadChecks();
    } catch (error: any) {
      showError('Erreur', error.response?.data?.error?.message || 'Erreur lors du rejet');
    }
  };

  const getStatusColor = (state: string) => {
    const colors: Record<string, string> = {
      none: 'draft',
      pass: 'done',
      fail: 'cancelled'
    };
    return colors[state] || 'draft';
  };

  const getStatusLabel = (state: string) => {
    const labels: Record<string, string> = {
      none: 'En attente',
      pass: 'Réussi',
      fail: 'Échoué'
    };
    return labels[state] || state;
  };

  if (showForm) {
    return (
      <QualityCheckForm
        check={selectedCheck}
        onClose={() => {
          setShowForm(false);
          setSelectedCheck(null);
          setViewType('list');
          loadChecks();
        }}
        onSave={loadChecks}
        onPass={selectedCheck?.id ? () => handlePass(selectedCheck.id) : undefined}
        onFail={selectedCheck?.id ? () => handleFail(selectedCheck.id) : undefined}
      />
    );
  }

  return (
    <div className="erp-layout">
      <ERPHeader
        title="Contrôles Qualité"
        breadcrumb={[
          { label: 'Qualité' },
          { label: 'Contrôles' }
        ]}
        actions={
          <button onClick={handleCreate} className="erp-btn erp-btn-primary">
            <Plus size={16} style={{ marginRight: '4px' }} />
            Nouveau Contrôle
          </button>
        }
      />

      <div className="erp-content">
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <div style={{ flex: 1, display: 'flex', gap: '8px' }}>
            <Search size={20} style={{ color: 'var(--erp-text-muted)' }} />
            <input
              type="text"
              placeholder="Rechercher un contrôle..."
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
                <th>Produit</th>
                <th>Point de contrôle</th>
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
              ) : checks.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--erp-text-muted)' }}>
                    Aucun contrôle
                  </td>
                </tr>
              ) : (
                checks.map(check => (
                  <tr key={check.id}>
                    <td>{check.name}</td>
                    <td>{displayMany2One(check.product_id)}</td>
                    <td>{displayMany2One(check.point_id)}</td>
                    <td>{formatDate(check.date)}</td>
                    <td>
                      <span className={`erp-status-badge ${getStatusColor(check.quality_state)}`}>
                        {getStatusLabel(check.quality_state)}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          onClick={() => handleEdit(check)}
                          className="erp-btn erp-btn-outline"
                          style={{ padding: '4px 8px' }}
                          title="Voir/Modifier"
                        >
                          <Eye size={14} />
                        </button>
                        {check.quality_state === 'none' && (
                          <>
                            <button
                              onClick={() => handleDelete(check.id)}
                              className="erp-btn erp-btn-danger"
                              style={{ padding: '4px 8px' }}
                              title="Supprimer"
                            >
                              <Trash2 size={14} />
                            </button>
                            <button
                              onClick={() => handlePass(check.id)}
                              className="erp-btn erp-btn-success"
                              style={{ padding: '4px 8px' }}
                              title="Valider"
                            >
                              <CheckCircle size={14} />
                            </button>
                            <button
                              onClick={() => handleFail(check.id)}
                              className="erp-btn erp-btn-danger"
                              style={{ padding: '4px 8px' }}
                              title="Rejeter"
                            >
                              <XCircle size={14} />
                            </button>
                          </>
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
const QualityCheckForm: React.FC<{
  check: QualityCheck | null;
  onClose: () => void;
  onSave: () => void;
  onPass?: () => void;
  onFail?: () => void;
}> = ({ check, onClose, onSave, onPass, onFail }) => {
  const [formData, setFormData] = useState({
    product_id: check?.product_id?.[0] || null,
    point_id: check?.point_id?.[0] || null,
    date: check?.date || new Date().toISOString().split('T')[0],
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
      if (check?.id) {
        await api.put(`/quality/checks/${check.id}`, formData);
        success('Contrôle modifié', 'Les modifications ont été enregistrées');
      } else {
        await api.post('/quality/checks', formData);
        success('Contrôle créé', 'Le contrôle qualité a été créé avec succès');
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
        title={check ? `Contrôle ${check.name}` : 'Nouveau Contrôle Qualité'}
        breadcrumb={[
          { label: 'Qualité' },
          { label: 'Contrôles' },
          { label: check ? check.name : 'Nouveau' }
        ]}
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={onClose} className="erp-btn erp-btn-outline">
              Annuler
            </button>
            <button onClick={handleSaveClick} className="erp-btn erp-btn-primary">
              Enregistrer
            </button>
            {onPass && check?.quality_state === 'none' && (
              <button onClick={onPass} className="erp-btn erp-btn-success">
                <CheckCircle size={16} style={{ marginRight: '4px' }} />
                Valider
              </button>
            )}
            {onFail && check?.quality_state === 'none' && (
              <button onClick={onFail} className="erp-btn erp-btn-danger">
                <XCircle size={16} style={{ marginRight: '4px' }} />
                Rejeter
              </button>
            )}
          </div>
        }
      />

      <div className="erp-content">
        {check && (
          <ERPStatusbar
            status={{
              label: getStatusLabel(check.quality_state),
              value: check.quality_state,
              color: getStatusColor(check.quality_state) as any
            }}
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
                      <label className="erp-field-label">Produit</label>
                      <input
                        type="text"
                        value={formData.product_id || ''}
                        onChange={(e) => setFormData({ ...formData, product_id: e.target.value ? parseInt(e.target.value) : null })}
                        className="erp-field-input"
                        placeholder="Sélectionner un produit..."
                      />
                    </div>
                    <div className="erp-field">
                      <label className="erp-field-label">Point de contrôle</label>
                      <input
                        type="text"
                        value={formData.point_id || ''}
                        onChange={(e) => setFormData({ ...formData, point_id: e.target.value ? parseInt(e.target.value) : null })}
                        className="erp-field-input"
                        placeholder="Sélectionner un point de contrôle..."
                      />
                    </div>
                    <div className="erp-field">
                      <label className="erp-field-label">Date</label>
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
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
                        placeholder="Notes du contrôle..."
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
    none: 'draft',
    pass: 'done',
    fail: 'cancelled'
  };
  return colors[state] || 'draft';
};

const getStatusLabel = (state: string) => {
  const labels: Record<string, string> = {
    none: 'En attente',
    pass: 'Réussi',
    fail: 'Échoué'
  };
  return labels[state] || state;
};

export default QualityChecksERP;
