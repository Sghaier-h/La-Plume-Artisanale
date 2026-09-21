/**
 * PricelistsERP - Listes de Prix
 * Version complète avec design ERP moderne
 */

import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { ERPHeader, ERPStatusbar, ERPNotebook, ERPChatter, ERPButtonBox, useNotifications } from '../../components/erp';
import { displayMany2One, formatDate, formatCurrency, formatState } from '../../utils/relations';
import { validateForm, commonRules } from '../../utils/validation';
import { Plus, Edit, Trash2, Eye, Tag, Search } from 'lucide-react';

interface Pricelist {
  id: number;
  name: string;
  type: 'sale' | 'purchase';
  active: boolean;
  currency_id?: any;
  item_ids?: any[];
}

const PricelistsERP: React.FC = () => {
  const { success, error: showError } = useNotifications();
  const [pricelists, setPricelists] = useState<Pricelist[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState<'list' | 'form'>('list');
  const [search, setSearch] = useState('');
  const [selectedPricelist, setSelectedPricelist] = useState<Pricelist | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadPricelists();
  }, [search]);

  const loadPricelists = async () => {
    setLoading(true);
    try {
      const params: any = { loadRelations: true };
      if (search) params.search = search;
      const response = await api.get('/product/pricelists', { params });
      const data = Array.isArray(response.data) ? response.data : response.data.data || [];
      setPricelists(data);
    } catch (error) {
      console.error('Erreur chargement listes de prix:', error);
      showError('Erreur', 'Impossible de charger les listes de prix');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedPricelist(null);
    setShowForm(true);
    setViewType('form');
  };

  const handleEdit = (pricelist: Pricelist) => {
    setSelectedPricelist(pricelist);
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
      if (selectedPricelist?.id) {
        await api.put(`/product/pricelists/${selectedPricelist.id}`, formData);
        success('Liste de prix modifiée', 'Les modifications ont été enregistrées');
      } else {
        await api.post('/product/pricelists', formData);
        success('Liste de prix créée', 'La liste de prix a été créée avec succès');
      }
      setShowForm(false);
      setSelectedPricelist(null);
      setViewType('list');
      loadPricelists();
    } catch (error: any) {
      showError('Erreur', error.response?.data?.error?.message || 'Erreur lors de l\'enregistrement');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette liste de prix ?')) {
      try {
        await api.delete(`/product/pricelists/${id}`);
        success('Liste de prix supprimée', 'La liste de prix a été supprimée avec succès');
        loadPricelists();
      } catch (error: any) {
        showError('Erreur', error.response?.data?.error?.message || 'Erreur lors de la suppression');
      }
    }
  };

  if (showForm) {
    return (
      <PricelistForm
        pricelist={selectedPricelist}
        onClose={() => {
          setShowForm(false);
          setSelectedPricelist(null);
          setViewType('list');
          loadPricelists();
        }}
        onSave={handleSave}
      />
    );
  }

  return (
    <div className="erp-layout">
      <ERPHeader
        title="Listes de Prix"
        breadcrumb={[
          { label: 'Ventes' },
          { label: 'Listes de Prix' }
        ]}
        actions={
          <button onClick={handleCreate} className="erp-btn erp-btn-primary">
            <Plus size={16} style={{ marginRight: '4px' }} />
            Nouvelle Liste
          </button>
        }
      />

      <div className="erp-content">
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <div style={{ flex: 1, display: 'flex', gap: '8px' }}>
            <Search size={20} style={{ color: 'var(--erp-text-muted)' }} />
            <input
              type="text"
              placeholder="Rechercher une liste de prix..."
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
                <th>Type</th>
                <th>Devise</th>
                <th>Lignes</th>
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
              ) : pricelists.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--erp-text-muted)' }}>
                    Aucune liste de prix
                  </td>
                </tr>
              ) : (
                pricelists.map(pricelist => (
                  <tr key={pricelist.id}>
                    <td>{pricelist.name}</td>
                    <td>
                      {pricelist.type === 'sale' ? 'Vente' :
                       pricelist.type === 'purchase' ? 'Achat' : '-'}
                    </td>
                    <td>{displayMany2One(pricelist.currency_id)}</td>
                    <td>{pricelist.item_ids?.length || 0}</td>
                    <td>
                      {pricelist.active ? (
                        <span className="erp-status-badge done">Oui</span>
                      ) : (
                        <span className="erp-status-badge cancelled">Non</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          onClick={() => handleEdit(pricelist)}
                          className="erp-btn erp-btn-outline"
                          style={{ padding: '4px 8px' }}
                          title="Voir/Modifier"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(pricelist.id)}
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
const PricelistForm: React.FC<{
  pricelist: Pricelist | null;
  onClose: () => void;
  onSave: (data: any) => void;
}> = ({ pricelist, onClose, onSave }) => {
  const { success, error: showError } = useNotifications();
  const [formData, setFormData] = useState({
    name: pricelist?.name || '',
    type: pricelist?.type || 'sale',
    currency_id: pricelist?.currency_id?.[0] || null,
    active: pricelist?.active !== false
  });
  const [items, setItems] = useState<any[]>(pricelist?.item_ids || []);

  const handleSaveClick = () => {
    // Validation
    const rules = {
      name: commonRules.required
    };
    const validation = validateForm(formData, rules);
    if (!validation.isValid) {
      showError('Erreur de validation', Object.values(validation.errors)[0]);
      return;
    }
    onSave({ ...formData, item_ids: items });
  };

  return (
    <div className="erp-layout">
      <ERPHeader
        title={pricelist ? `Liste ${pricelist.name}` : 'Nouvelle Liste de Prix'}
        breadcrumb={[
          { label: 'Ventes' },
          { label: 'Listes de Prix' },
          { label: pricelist ? pricelist.name : 'Nouvelle' }
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
                        placeholder="Nom de la liste de prix..."
                      />
                    </div>
                    <div className="erp-field">
                      <label className="erp-field-label erp-field-required">Type</label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                        className="erp-field-input"
                      >
                        <option value="sale">Vente</option>
                        <option value="purchase">Achat</option>
                      </select>
                    </div>
                    <div className="erp-field">
                      <label className="erp-field-label">Devise</label>
                      <input
                        type="text"
                        value={formData.currency_id || ''}
                        onChange={(e) => setFormData({ ...formData, currency_id: e.target.value ? parseInt(e.target.value) : null })}
                        className="erp-field-input"
                        placeholder="Sélectionner une devise..."
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
                label: 'Lignes de prix',
                content: (
                  <div>
                    <ERPButtonBox>
                      <button
                        onClick={() => {
                          setItems([...items, {
                            product_id: null,
                            min_quantity: 1,
                            price: 0
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
                            <th>Quantité min</th>
                            <th>Prix</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((item, index) => (
                            <tr key={index}>
                              <td>{item.product_id?.[1] || 'Produit'}</td>
                              <td>{item.min_quantity || 1}</td>
                              <td>{item.price?.toFixed(2) || '0.00'} TND</td>
                              <td>
                                <button
                                  onClick={() => setItems(items.filter((_, i) => i !== index))}
                                  className="erp-btn erp-btn-danger"
                                  style={{ padding: '4px 8px' }}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                          {items.length === 0 && (
                            <tr>
                              <td colSpan={4} style={{ textAlign: 'center', padding: '32px', color: 'var(--erp-text-muted)' }}>
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

export default PricelistsERP;
