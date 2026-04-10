/**
 * AvoirsERP - Avoirs (Notes de Crédit)
 * Version complète avec design ERP moderne
 */

import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { ERPHeader, ERPStatusbar, ERPNotebook, ERPChatter, ERPButtonBox, useNotifications } from '../../components/erp';
import { displayMany2One, formatDate, formatCurrency, formatState } from '../../utils/relations';
import { validateForm, commonRules } from '../../utils/validation';
import { Plus, Edit, Trash2, Eye, FileText, Search } from 'lucide-react';

interface Avoir {
  id: number;
  name: string;
  partner_id?: any;
  date: string;
  amount_total: number;
  state: 'draft' | 'posted' | 'cancel';
}

const AvoirsERP: React.FC = () => {
  const { success, error: showError } = useNotifications();
  const [avoirs, setAvoirs] = useState<Avoir[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState<'list' | 'form'>('list');
  const [search, setSearch] = useState('');
  const [selectedAvoir, setSelectedAvoir] = useState<Avoir | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadAvoirs();
  }, [search]);

  const loadAvoirs = async () => {
    setLoading(true);
    try {
      const params: any = { loadRelations: true };
      if (search) params.search = search;
      const response = await api.get('/avoirs', { params });
      const data = Array.isArray(response.data) ? response.data : response.data.data || [];
      setAvoirs(data);
    } catch (error) {
      console.error('Erreur chargement avoirs:', error);
      showError('Erreur', 'Impossible de charger les avoirs');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedAvoir(null);
    setShowForm(true);
    setViewType('form');
  };

  const handleEdit = (avoir: Avoir) => {
    setSelectedAvoir(avoir);
    setShowForm(true);
    setViewType('form');
  };

  const handleSave = async (formData: any) => {
    // Validation
    const rules = {
      name: commonRules.required,
      partner_id: commonRules.required
    };
    const validation = validateForm(formData, rules);
    if (!validation.isValid) {
      showError('Erreur de validation', Object.values(validation.errors)[0]);
      return;
    }

    try {
      if (selectedAvoir?.id) {
        await api.put(`/avoirs/${selectedAvoir.id}`, formData);
        success('Avoir modifié', 'Les modifications ont été enregistrées');
      } else {
        await api.post('/avoirs', formData);
        success('Avoir créé', 'L\'avoir a été créé avec succès');
      }
      setShowForm(false);
      setSelectedAvoir(null);
      setViewType('list');
      loadAvoirs();
    } catch (error: any) {
      showError('Erreur', error.response?.data?.error?.message || 'Erreur lors de l\'enregistrement');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet avoir ?')) {
      try {
        await api.delete(`/avoirs/${id}`);
        success('Avoir supprimé', 'L\'avoir a été supprimé avec succès');
        loadAvoirs();
      } catch (error: any) {
        showError('Erreur', error.response?.data?.error?.message || 'Erreur lors de la suppression');
      }
    }
  };

  const getStatusColor = (state: string) => {
    const colors: Record<string, string> = {
      draft: 'draft',
      posted: 'done',
      cancel: 'cancelled'
    };
    return colors[state] || 'draft';
  };

  const getStatusLabel = (state: string) => {
    const labels: Record<string, string> = {
      draft: 'Brouillon',
      posted: 'Comptabilisé',
      cancel: 'Annulé'
    };
    return labels[state] || state;
  };

  if (showForm) {
    return (
      <AvoirForm
        avoir={selectedAvoir}
        onClose={() => {
          setShowForm(false);
          setSelectedAvoir(null);
          setViewType('list');
          loadAvoirs();
        }}
        onSave={handleSave}
      />
    );
  }

  return (
    <div className="erp-layout">
      <ERPHeader
        title="Avoirs"
        breadcrumb={[
          { label: 'Comptabilité' },
          { label: 'Avoirs' }
        ]}
        actions={
          <button onClick={handleCreate} className="erp-btn erp-btn-primary">
            <Plus size={16} style={{ marginRight: '4px' }} />
            Nouvel Avoir
          </button>
        }
      />

      <div className="erp-content">
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <div style={{ flex: 1, display: 'flex', gap: '8px' }}>
            <Search size={20} style={{ color: 'var(--erp-text-muted)' }} />
            <input
              type="text"
              placeholder="Rechercher un avoir..."
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
                <th>Client</th>
                <th>Date</th>
                <th>Montant</th>
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
              ) : avoirs.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--erp-text-muted)' }}>
                    Aucun avoir
                  </td>
                </tr>
              ) : (
                avoirs.map(avoir => (
                  <tr key={avoir.id}>
                    <td>{avoir.name}</td>
                    <td>{displayMany2One(avoir.partner_id)}</td>
                    <td>{formatDate(avoir.date)}</td>
                    <td>{formatCurrency(avoir.amount_total)}</td>
                    <td>
                      <span className={`erp-status-badge ${getStatusColor(avoir.state)}`}>
                        {getStatusLabel(avoir.state)}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          onClick={() => handleEdit(avoir)}
                          className="erp-btn erp-btn-outline"
                          style={{ padding: '4px 8px' }}
                          title="Voir/Modifier"
                        >
                          <Eye size={14} />
                        </button>
                        {avoir.state === 'draft' && (
                          <button
                            onClick={() => handleDelete(avoir.id)}
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
const AvoirForm: React.FC<{
  avoir: Avoir | null;
  onClose: () => void;
  onSave: (data: any) => void;
}> = ({ avoir, onClose, onSave }) => {
  const { success, error: showError } = useNotifications();
  const [formData, setFormData] = useState({
    partner_id: avoir?.partner_id?.[0] || null,
    date: avoir?.date || new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [lines, setLines] = useState<any[]>([]);

  const handleSaveClick = () => {
    // Validation
    const rules = {
      partner_id: commonRules.required
    };
    const validation = validateForm(formData, rules);
    if (!validation.isValid) {
      showError('Erreur de validation', Object.values(validation.errors)[0]);
      return;
    }
    onSave({ ...formData, line_ids: lines });
  };

  return (
    <div className="erp-layout">
      <ERPHeader
        title={avoir ? `Avoir ${avoir.name}` : 'Nouvel Avoir'}
        breadcrumb={[
          { label: 'Comptabilité' },
          { label: 'Avoirs' },
          { label: avoir ? avoir.name : 'Nouveau' }
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
        {avoir && (
          <ERPStatusbar
            status={{
              label: getStatusLabel(avoir.state),
              value: avoir.state,
              color: getStatusColor(avoir.state) as any
            }}
            workflow={[
              { label: 'Brouillon', value: 'draft', color: 'draft' },
              { label: 'Comptabilisé', value: 'posted', color: 'done' }
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
                      <label className="erp-field-label erp-field-required">Client</label>
                      <input
                        type="text"
                        value={formData.partner_id || ''}
                        onChange={(e) => setFormData({ ...formData, partner_id: e.target.value ? parseInt(e.target.value) : null })}
                        className="erp-field-input"
                        placeholder="Sélectionner un client..."
                      />
                    </div>
                    <div className="erp-field">
                      <label className="erp-field-label erp-field-required">Date</label>
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
                        placeholder="Notes internes..."
                      />
                    </div>
                  </div>
                )
              },
              {
                label: 'Lignes',
                content: (
                  <div>
                    <ERPButtonBox>
                      <button
                        onClick={() => {
                          setLines([...lines, {
                            product_id: null,
                            quantity: 0,
                            price_unit: 0
                          }]);
                        }}
                        className="erp-btn erp-btn-primary"
                      >
                        <Plus size={16} style={{ marginRight: '4px' }} />
                        Ajouter une ligne
                      </button>
                    </ERPButtonBox>

                    <div className="erp-tree-view" style={{ marginTop: '16px' }}>
                      <table className="erp-tree-table">
                        <thead>
                          <tr>
                            <th>Produit</th>
                            <th>Quantité</th>
                            <th>Prix unitaire</th>
                            <th>Total</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {lines.map((line, index) => (
                            <tr key={index}>
                              <td>{line.product_id?.[1] || 'Produit'}</td>
                              <td>{line.quantity || 0}</td>
                              <td>{line.price_unit?.toFixed(2) || '0.00'} TND</td>
                              <td>{(line.quantity * line.price_unit).toFixed(2)} TND</td>
                              <td>
                                <button
                                  onClick={() => setLines(lines.filter((_, i) => i !== index))}
                                  className="erp-btn erp-btn-danger"
                                  style={{ padding: '4px 8px' }}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                          {lines.length === 0 && (
                            <tr>
                              <td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: 'var(--erp-text-muted)' }}>
                                Aucune ligne. Cliquez sur "Ajouter une ligne" pour commencer.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
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
    posted: 'done',
    cancel: 'cancelled'
  };
  return colors[state] || 'draft';
};

const getStatusLabel = (state: string) => {
  const labels: Record<string, string> = {
    draft: 'Brouillon',
    posted: 'Comptabilisé',
    cancel: 'Annulé'
  };
  return labels[state] || state;
};

export default AvoirsERP;
