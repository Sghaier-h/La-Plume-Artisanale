/**
 * InventoryERP - Inventaires
 * Version complète avec design ERP moderne
 */

import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { ERPHeader, ERPStatusbar, ERPNotebook, ERPChatter, ERPButtonBox, useNotifications } from '../../components/erp';
import { displayMany2One, formatDate, formatCurrency, formatState } from '../../utils/relations';
import { validateForm, commonRules } from '../../utils/validation';
import { Plus, Edit, Trash2, Eye, CheckCircle, Package, Search } from 'lucide-react';

interface Inventory {
  id: number;
  name: string;
  location_id?: any;
  state: 'draft' | 'confirm' | 'done' | 'cancel';
  date: string;
}

const InventoryERP: React.FC = () => {
  const { success, error: showError } = useNotifications();
  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState<'list' | 'form'>('list');
  const [search, setSearch] = useState('');
  const [selectedInventory, setSelectedInventory] = useState<Inventory | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadInventories();
  }, [search]);

  const loadInventories = async () => {
    setLoading(true);
    try {
      const params: any = { loadRelations: true };
      if (search) params.search = search;
      const response = await api.get('/inventory', { params });
      const data = Array.isArray(response.data) ? response.data : response.data.data || [];
      setInventories(data);
    } catch (error) {
      console.error('Erreur chargement inventaires:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedInventory(null);
    setShowForm(true);
    setViewType('form');
  };

  const handleEdit = (inventory: Inventory) => {
    setSelectedInventory(inventory);
    setShowForm(true);
    setViewType('form');
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet inventaire ?')) {
      try {
        await api.delete(`/inventory/${id}`);
        success('Inventaire supprimé', 'L\'inventaire a été supprimé avec succès');
        loadInventories();
      } catch (error: any) {
        showError('Erreur', error.response?.data?.error?.message || 'Erreur lors de la suppression');
      }
    }
  };

  const handleValidate = async (id: number) => {
    try {
      await api.post(`/inventory/${id}/validate`);
      success('Inventaire validé', 'L\'inventaire a été validé avec succès');
      loadInventories();
    } catch (error: any) {
      showError('Erreur', error.response?.data?.error?.message || 'Erreur lors de la validation');
    }
  };

  const getStatusColor = (state: string) => {
    const colors: Record<string, string> = {
      draft: 'draft',
      confirm: 'confirmed',
      done: 'done',
      cancel: 'cancelled'
    };
    return colors[state] || 'draft';
  };

  const getStatusLabel = (state: string) => {
    const labels: Record<string, string> = {
      draft: 'Brouillon',
      confirm: 'Confirmé',
      done: 'Terminé',
      cancel: 'Annulé'
    };
    return labels[state] || state;
  };

  if (showForm) {
    return (
      <InventoryForm
        inventory={selectedInventory}
        onClose={() => {
          setShowForm(false);
          setSelectedInventory(null);
          setViewType('list');
          loadInventories();
        }}
        onSave={loadInventories}
        onValidate={selectedInventory?.id ? () => handleValidate(selectedInventory.id) : undefined}
      />
    );
  }

  return (
    <div className="erp-layout">
      <ERPHeader
        title="Inventaires"
        breadcrumb={[
          { label: 'Stock' },
          { label: 'Inventaires' }
        ]}
        actions={
          <button onClick={handleCreate} className="erp-btn erp-btn-primary">
            <Plus size={16} style={{ marginRight: '4px' }} />
            Nouvel Inventaire
          </button>
        }
      />

      <div className="erp-content">
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <div style={{ flex: 1, display: 'flex', gap: '8px' }}>
            <Search size={20} style={{ color: 'var(--erp-text-muted)' }} />
            <input
              type="text"
              placeholder="Rechercher un inventaire..."
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
                <th>Emplacement</th>
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
              ) : inventories.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: 'var(--erp-text-muted)' }}>
                    Aucun inventaire
                  </td>
                </tr>
              ) : (
                inventories.map(inventory => (
                  <tr key={inventory.id}>
                    <td>{inventory.name}</td>
                    <td>{displayMany2One(inventory.location_id)}</td>
                    <td>{formatDate(inventory.date)}</td>
                    <td>
                      <span className={`erp-status-badge ${getStatusColor(inventory.state)}`}>
                        {getStatusLabel(inventory.state)}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          onClick={() => handleEdit(inventory)}
                          className="erp-btn erp-btn-outline"
                          style={{ padding: '4px 8px' }}
                          title="Voir/Modifier"
                        >
                          <Eye size={14} />
                        </button>
                        {inventory.state === 'draft' && (
                          <button
                            onClick={() => handleDelete(inventory.id)}
                            className="erp-btn erp-btn-danger"
                            style={{ padding: '4px 8px' }}
                            title="Supprimer"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                        {inventory.state === 'confirm' && (
                          <button
                            onClick={() => handleValidate(inventory.id)}
                            className="erp-btn erp-btn-success"
                            style={{ padding: '4px 8px' }}
                            title="Valider"
                          >
                            <CheckCircle size={14} />
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
const InventoryForm: React.FC<{
  inventory: Inventory | null;
  onClose: () => void;
  onSave: () => void;
  onValidate?: () => void;
}> = ({ inventory, onClose, onSave, onValidate }) => {
  const { success, error: showError } = useNotifications();
  const [formData, setFormData] = useState({
    name: inventory?.name || '',
    location_id: inventory?.location_id?.[0] || null,
    date: inventory?.date || new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [lines, setLines] = useState<any[]>([]);

  const handleSaveClick = async () => {
    // Validation
    const rules = {
      name: commonRules.required,
      location_id: commonRules.required
    };
    const validation = validateForm(formData, rules);
    if (!validation.isValid) {
      showError('Erreur de validation', Object.values(validation.errors)[0]);
      return;
    }

    try {
      if (inventory?.id) {
        await api.put(`/inventory/${inventory.id}`, { ...formData, lines });
        success('Inventaire modifié', 'Les modifications ont été enregistrées');
      } else {
        await api.post('/inventory', { ...formData, lines });
        success('Inventaire créé', 'L\'inventaire a été créé avec succès');
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
        title={inventory ? `Inventaire ${inventory.name}` : 'Nouvel Inventaire'}
        breadcrumb={[
          { label: 'Stock' },
          { label: 'Inventaires' },
          { label: inventory ? inventory.name : 'Nouveau' }
        ]}
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={onClose} className="erp-btn erp-btn-outline">
              Annuler
            </button>
            <button onClick={handleSaveClick} className="erp-btn erp-btn-primary">
              Enregistrer
            </button>
            {onValidate && inventory?.state === 'confirm' && (
              <button onClick={onValidate} className="erp-btn erp-btn-success">
                <CheckCircle size={16} style={{ marginRight: '4px' }} />
                Valider
              </button>
            )}
          </div>
        }
      />

      <div className="erp-content">
        {inventory && (
          <ERPStatusbar
            status={{
              label: getStatusLabel(inventory.state),
              value: inventory.state,
              color: getStatusColor(inventory.state) as any
            }}
            workflow={[
              { label: 'Brouillon', value: 'draft', color: 'draft' },
              { label: 'Confirmé', value: 'confirm', color: 'confirmed' },
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
                            theoretical_qty: 0,
                            product_qty: 0
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
                            <th>Quantité théorique</th>
                            <th>Quantité réelle</th>
                            <th>Écart</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {lines.map((line, index) => (
                            <tr key={index}>
                              <td>{line.product_id?.[1] || 'Produit'}</td>
                              <td>{line.theoretical_qty || 0}</td>
                              <td>{line.product_qty || 0}</td>
                              <td>{(line.product_qty - line.theoretical_qty) || 0}</td>
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
    confirm: 'confirmed',
    done: 'done',
    cancel: 'cancelled'
  };
  return colors[state] || 'draft';
};

const getStatusLabel = (state: string) => {
  const labels: Record<string, string> = {
    draft: 'Brouillon',
    confirm: 'Confirmé',
    done: 'Terminé',
    cancel: 'Annulé'
  };
  return labels[state] || state;
};

export default InventoryERP;
