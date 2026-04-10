/**
 * BOMsERP - Nomenclatures
 * Version complète avec design ERP moderne
 */

import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { ERPHeader, ERPStatusbar, ERPNotebook, ERPChatter, ERPButtonBox, useNotifications } from '../../components/erp';
import { displayMany2One, formatDate, formatCurrency, formatState } from '../../utils/relations';
import { validateForm, commonRules } from '../../utils/validation';
import { Plus, Edit, Trash2, Eye, Package, Search } from 'lucide-react';

interface BOM {
  id: number;
  name: string;
  product_id: any;
  product_tmpl_id?: any;
  type: 'normal' | 'phantom' | 'subcontract';
  active: boolean;
  bom_line_ids?: any[];
}

const BOMsERP: React.FC = () => {
  const { success, error: showError } = useNotifications();
  const [boms, setBoms] = useState<BOM[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState<'list' | 'form'>('list');
  const [search, setSearch] = useState('');
  const [selectedBOM, setSelectedBOM] = useState<BOM | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadBOMs();
  }, [search]);

  const loadBOMs = async () => {
    setLoading(true);
    try {
      const params: any = { loadRelations: true };
      if (search) params.search = search;
      const response = await api.get('/mrp/boms', { params });
      const data = Array.isArray(response.data) ? response.data : response.data.data || [];
      setBoms(data);
    } catch (error) {
      console.error('Erreur chargement nomenclatures:', error);
      showError('Erreur', 'Impossible de charger les nomenclatures');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedBOM(null);
    setShowForm(true);
    setViewType('form');
  };

  const handleEdit = (bom: BOM) => {
    setSelectedBOM(bom);
    setShowForm(true);
    setViewType('form');
  };

  const handleSave = async (formData: any) => {
    // Validation
    const rules = {
      name: commonRules.required,
      product_id: commonRules.required
    };
    const validation = validateForm(formData, rules);
    if (!validation.isValid) {
      showError('Erreur de validation', Object.values(validation.errors)[0]);
      return;
    }

    try {
      if (selectedBOM?.id) {
        await api.put(`/mrp/boms/${selectedBOM.id}`, formData);
        success('Nomenclature modifiée', 'Les modifications ont été enregistrées');
      } else {
        await api.post('/mrp/boms', formData);
        success('Nomenclature créée', 'La nomenclature a été créée avec succès');
      }
      setShowForm(false);
      setSelectedBOM(null);
      setViewType('list');
      loadBOMs();
    } catch (error: any) {
      showError('Erreur', error.response?.data?.error?.message || 'Erreur lors de l\'enregistrement');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette nomenclature ?')) {
      try {
        await api.delete(`/mrp/boms/${id}`);
        success('Nomenclature supprimée', 'La nomenclature a été supprimée avec succès');
        loadBOMs();
      } catch (error: any) {
        showError('Erreur', error.response?.data?.error?.message || 'Erreur lors de la suppression');
      }
    }
  };

  if (showForm) {
    return (
      <BOMForm
        bom={selectedBOM}
        onClose={() => {
          setShowForm(false);
          setSelectedBOM(null);
          setViewType('list');
          loadBOMs();
        }}
        onSave={handleSave}
      />
    );
  }

  return (
    <div className="erp-layout">
      <ERPHeader
        title="Nomenclatures"
        breadcrumb={[
          { label: 'Production' },
          { label: 'Nomenclatures' }
        ]}
        actions={
          <button onClick={handleCreate} className="erp-btn erp-btn-primary">
            <Plus size={16} style={{ marginRight: '4px' }} />
            Nouvelle Nomenclature
          </button>
        }
      />

      <div className="erp-content">
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <div style={{ flex: 1, display: 'flex', gap: '8px' }}>
            <Search size={20} style={{ color: 'var(--erp-text-muted)' }} />
            <input
              type="text"
              placeholder="Rechercher une nomenclature..."
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
                <th>Produit</th>
                <th>Type</th>
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
              ) : boms.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--erp-text-muted)' }}>
                    Aucune nomenclature
                  </td>
                </tr>
              ) : (
                boms.map(bom => (
                  <tr key={bom.id}>
                    <td>{bom.name}</td>
                    <td>{displayMany2One(bom.product_id) || displayMany2One(bom.product_tmpl_id)}</td>
                    <td>
                      {bom.type === 'normal' ? 'Normale' :
                       bom.type === 'phantom' ? 'Phantom' :
                       bom.type === 'subcontract' ? 'Sous-traitance' : '-'}
                    </td>
                    <td>{bom.bom_line_ids?.length || 0}</td>
                    <td>
                      {bom.active ? (
                        <span className="erp-status-badge done">Oui</span>
                      ) : (
                        <span className="erp-status-badge cancelled">Non</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          onClick={() => handleEdit(bom)}
                          className="erp-btn erp-btn-outline"
                          style={{ padding: '4px 8px' }}
                          title="Voir/Modifier"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(bom.id)}
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
const BOMForm: React.FC<{
  bom: BOM | null;
  onClose: () => void;
  onSave: (data: any) => void;
}> = ({ bom, onClose, onSave }) => {
  const { success, error: showError } = useNotifications();
  const [formData, setFormData] = useState({
    name: bom?.name || '',
    product_id: bom?.product_id?.[0] || bom?.product_tmpl_id?.[0] || null,
    type: bom?.type || 'normal',
    active: bom?.active !== false
  });
  const [bomLines, setBomLines] = useState<any[]>(bom?.bom_line_ids || []);

  const handleSaveClick = () => {
    // Validation
    const rules = {
      name: commonRules.required,
      product_id: commonRules.required
    };
    const validation = validateForm(formData, rules);
    if (!validation.isValid) {
      showError('Erreur de validation', Object.values(validation.errors)[0]);
      return;
    }
    onSave({ ...formData, bom_line_ids: bomLines });
  };

  return (
    <div className="erp-layout">
      <ERPHeader
        title={bom ? `Nomenclature ${bom.name}` : 'Nouvelle Nomenclature'}
        breadcrumb={[
          { label: 'Production' },
          { label: 'Nomenclatures' },
          { label: bom ? bom.name : 'Nouvelle' }
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
                      <label className="erp-field-label erp-field-required">Produit</label>
                      <input
                        type="text"
                        value={formData.product_id || ''}
                        onChange={(e) => setFormData({ ...formData, product_id: e.target.value ? parseInt(e.target.value) : null })}
                        className="erp-field-input"
                        placeholder="Sélectionner un produit..."
                      />
                    </div>
                    <div className="erp-field">
                      <label className="erp-field-label">Type</label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                        className="erp-field-input"
                      >
                        <option value="normal">Normale</option>
                        <option value="phantom">Phantom</option>
                        <option value="subcontract">Sous-traitance</option>
                      </select>
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
                label: 'Lignes de nomenclature',
                content: (
                  <div>
                    <ERPButtonBox>
                      <button
                        onClick={() => {
                          setBomLines([...bomLines, {
                            product_id: null,
                            product_qty: 1
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
                          {bomLines.map((line, index) => (
                            <tr key={index}>
                              <td>{line.product_id?.[1] || 'Produit'}</td>
                              <td>{line.product_qty || 1}</td>
                              <td>
                                <button
                                  onClick={() => setBomLines(bomLines.filter((_, i) => i !== index))}
                                  className="erp-btn erp-btn-danger"
                                  style={{ padding: '4px 8px' }}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                          {bomLines.length === 0 && (
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

export default BOMsERP;
