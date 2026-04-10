/**
 * BonsLivraisonERP - Bons de Livraison
 * Version complète avec design ERP moderne
 */

import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { ERPHeader, ERPStatusbar, ERPNotebook, ERPChatter, ERPButtonBox, useNotifications } from '../../components/erp';
import { displayMany2One, formatDate, formatCurrency, formatState } from '../../utils/relations';
import { validateForm, commonRules } from '../../utils/validation';
import { Plus, Edit, Trash2, Eye, Truck, Search } from 'lucide-react';

interface BonLivraison {
  id: number;
  name: string;
  partner_id?: any;
  date: string;
  state: 'draft' | 'done' | 'cancel';
}

const BonsLivraisonERP: React.FC = () => {
  const { success, error: showError } = useNotifications();
  const [bons, setBons] = useState<BonLivraison[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState<'list' | 'form'>('list');
  const [search, setSearch] = useState('');
  const [selectedBon, setSelectedBon] = useState<BonLivraison | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadBons();
  }, [search]);

  const loadBons = async () => {
    setLoading(true);
    try {
      const params: any = { loadRelations: true };
      if (search) params.search = search;
      const response = await api.get('/bons-livraison', { params });
      const data = Array.isArray(response.data) ? response.data : response.data.data || [];
      setBons(data);
    } catch (error) {
      console.error('Erreur chargement bons de livraison:', error);
      showError('Erreur', 'Impossible de charger les bons de livraison');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedBon(null);
    setShowForm(true);
    setViewType('form');
  };

  const handleEdit = (bon: BonLivraison) => {
    setSelectedBon(bon);
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
      if (selectedBon?.id) {
        await api.put(`/bons-livraison/${selectedBon.id}`, formData);
        success('Bon de livraison modifié', 'Les modifications ont été enregistrées');
      } else {
        await api.post('/bons-livraison', formData);
        success('Bon de livraison créé', 'Le bon de livraison a été créé avec succès');
      }
      setShowForm(false);
      setSelectedBon(null);
      setViewType('list');
      loadBons();
    } catch (error: any) {
      showError('Erreur', error.response?.data?.error?.message || 'Erreur lors de l\'enregistrement');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce bon de livraison ?')) {
      try {
        await api.delete(`/bons-livraison/${id}`);
        success('Bon de livraison supprimé', 'Le bon de livraison a été supprimé avec succès');
        loadBons();
      } catch (error: any) {
        showError('Erreur', error.response?.data?.error?.message || 'Erreur lors de la suppression');
      }
    }
  };

  const getStatusColor = (state: string) => {
    const colors: Record<string, string> = {
      draft: 'draft',
      done: 'done',
      cancel: 'cancelled'
    };
    return colors[state] || 'draft';
  };

  const getStatusLabel = (state: string) => {
    const labels: Record<string, string> = {
      draft: 'Brouillon',
      done: 'Livré',
      cancel: 'Annulé'
    };
    return labels[state] || state;
  };

  if (showForm) {
    return (
      <BonLivraisonForm
        bon={selectedBon}
        onClose={() => {
          setShowForm(false);
          setSelectedBon(null);
          setViewType('list');
          loadBons();
        }}
        onSave={handleSave}
      />
    );
  }

  return (
    <div className="erp-layout">
      <ERPHeader
        title="Bons de Livraison"
        breadcrumb={[
          { label: 'Ventes' },
          { label: 'Bons de Livraison' }
        ]}
        actions={
          <button onClick={handleCreate} className="erp-btn erp-btn-primary">
            <Plus size={16} style={{ marginRight: '4px' }} />
            Nouveau Bon
          </button>
        }
      />

      <div className="erp-content">
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <div style={{ flex: 1, display: 'flex', gap: '8px' }}>
            <Search size={20} style={{ color: 'var(--erp-text-muted)' }} />
            <input
              type="text"
              placeholder="Rechercher un bon de livraison..."
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
                <th>État</th>
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
              ) : bons.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: 'var(--erp-text-muted)' }}>
                    Aucun bon de livraison
                  </td>
                </tr>
              ) : (
                bons.map(bon => (
                  <tr key={bon.id}>
                    <td>{bon.name}</td>
                    <td>{displayMany2One(bon.partner_id)}</td>
                    <td>{formatDate(bon.date)}</td>
                    <td>
                      <span className={`erp-status-badge ${getStatusColor(bon.state)}`}>
                        {getStatusLabel(bon.state)}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          onClick={() => handleEdit(bon)}
                          className="erp-btn erp-btn-outline"
                          style={{ padding: '4px 8px' }}
                          title="Voir/Modifier"
                        >
                          <Eye size={14} />
                        </button>
                        {bon.state === 'draft' && (
                          <button
                            onClick={() => handleDelete(bon.id)}
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
const BonLivraisonForm: React.FC<{
  bon: BonLivraison | null;
  onClose: () => void;
  onSave: (data: any) => void;
}> = ({ bon, onClose, onSave }) => {
  const { success, error: showError } = useNotifications();
  const [formData, setFormData] = useState({
    partner_id: bon?.partner_id?.[0] || null,
    date: bon?.date || new Date().toISOString().split('T')[0],
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
        title={bon ? `Bon de Livraison ${bon.name}` : 'Nouveau Bon de Livraison'}
        breadcrumb={[
          { label: 'Ventes' },
          { label: 'Bons de Livraison' },
          { label: bon ? bon.name : 'Nouveau' }
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
        {bon && (
          <ERPStatusbar
            status={{
              label: getStatusLabel(bon.state),
              value: bon.state,
              color: getStatusColor(bon.state) as any
            }}
            workflow={[
              { label: 'Brouillon', value: 'draft', color: 'draft' },
              { label: 'Livré', value: 'done', color: 'done' }
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
                            quantity: 0
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
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {lines.map((line, index) => (
                            <tr key={index}>
                              <td>{line.product_id?.[1] || 'Produit'}</td>
                              <td>{line.quantity || 0}</td>
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
                              <td colSpan={3} style={{ textAlign: 'center', padding: '32px', color: 'var(--erp-text-muted)' }}>
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
    done: 'done',
    cancel: 'cancelled'
  };
  return colors[state] || 'draft';
};

const getStatusLabel = (state: string) => {
  const labels: Record<string, string> = {
    draft: 'Brouillon',
    done: 'Livré',
    cancel: 'Annulé'
  };
  return labels[state] || state;
};

export default BonsLivraisonERP;
