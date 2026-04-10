/**
 * WarehouseManagement - Gestion des Entrepôts
 * Version complète avec design Odoo moderne
 */

import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { ERPHeader, ERPStatusbar, ERPNotebook, ERPChatter, ERPButtonBox, useNotifications } from '../../components/erp';
import { displayMany2One, formatDate, formatCurrency, formatState } from '../../utils/relations';
import { validateForm, commonRules } from '../../utils/validation';
import { Plus, Edit, Trash2, Eye, Warehouse, Search } from 'lucide-react';

interface Warehouse {
  id: number;
  name: string;
  code?: string;
  active?: boolean;
  location_ids?: any[];
}

const WarehouseManagement: React.FC = () => {
  const { success, error: showError } = useNotifications();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState<'list' | 'form'>('list');
  const [search, setSearch] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadWarehouses();
  }, [search]);

  const loadWarehouses = async () => {
    setLoading(true);
    try {
      const params: any = { loadRelations: true };
      if (search) params.search = search;
      const response = await api.get('/warehouse/warehouses', { params });
      const data = Array.isArray(response.data) ? response.data : response.data.data || [];
      setWarehouses(data);
    } catch (error) {
      console.error('Erreur chargement entrepôts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedWarehouse(null);
    setShowForm(true);
    setViewType('form');
  };

  const handleEdit = (warehouse: Warehouse) => {
    setSelectedWarehouse(warehouse);
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
      if (selectedWarehouse?.id) {
        await api.put(`/warehouse/warehouses/${selectedWarehouse.id}`, formData);
        success('Entrepôt modifié', 'Les modifications ont été enregistrées');
      } else {
        await api.post('/warehouse/warehouses', formData);
        success('Entrepôt créé', 'L\'entrepôt a été créé avec succès');
      }
      setShowForm(false);
      setSelectedWarehouse(null);
      setViewType('list');
      loadWarehouses();
    } catch (error: any) {
      showError('Erreur', error.response?.data?.error?.message || 'Erreur lors de l\'enregistrement');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet entrepôt ?')) {
      try {
        await api.delete(`/warehouse/warehouses/${id}`);
        success('Entrepôt supprimé', 'L\'entrepôt a été supprimé avec succès');
        loadWarehouses();
      } catch (error: any) {
        showError('Erreur', error.response?.data?.error?.message || 'Erreur lors de la suppression');
      }
    }
  };

  if (showForm) {
    return (
      <WarehouseForm
        warehouse={selectedWarehouse}
        onClose={() => {
          setShowForm(false);
          setSelectedWarehouse(null);
          setViewType('list');
          loadWarehouses();
        }}
        onSave={handleSave}
      />
    );
  }

  return (
    <div className="erp-layout">
      <ERPHeader
        title="Gestion des Entrepôts"
        breadcrumb={[
          { label: 'Stock' },
          { label: 'Entrepôts' }
        ]}
        actions={
          <button onClick={handleCreate} className="erp-btn erp-btn-primary">
            <Plus size={16} style={{ marginRight: '4px' }} />
            Nouvel Entrepôt
          </button>
        }
      />

      <div className="erp-content">
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <div style={{ flex: 1, display: 'flex', gap: '8px' }}>
            <Search size={20} style={{ color: 'var(--erp-text-muted)' }} />
            <input
              type="text"
              placeholder="Rechercher un entrepôt..."
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
                <th>Emplacements</th>
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
              ) : warehouses.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: 'var(--erp-text-muted)' }}>
                    Aucun entrepôt
                  </td>
                </tr>
              ) : (
                warehouses.map(warehouse => (
                  <tr key={warehouse.id}>
                    <td>{warehouse.code || '-'}</td>
                    <td>{warehouse.name}</td>
                    <td>{warehouse.location_ids?.length || 0}</td>
                    <td>
                      {warehouse.active ? (
                        <span className="erp-status-badge done">Oui</span>
                      ) : (
                        <span className="erp-status-badge cancelled">Non</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          onClick={() => handleEdit(warehouse)}
                          className="erp-btn erp-btn-outline"
                          style={{ padding: '4px 8px' }}
                          title="Voir/Modifier"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(warehouse.id)}
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
const WarehouseForm: React.FC<{
  warehouse: Warehouse | null;
  onClose: () => void;
  onSave: (data: any) => void;
}> = ({ warehouse, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: warehouse?.name || '',
    code: warehouse?.code || '',
    active: warehouse?.active !== false
  });

  const handleSaveClick = () => {
    onSave(formData);
  };

  return (
    <div className="erp-layout">
      <ERPHeader
        title={warehouse ? `Entrepôt ${warehouse.name}` : 'Nouvel Entrepôt'}
        breadcrumb={[
          { label: 'Stock' },
          { label: 'Entrepôts' },
          { label: warehouse ? warehouse.name : 'Nouveau' }
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
                        placeholder="Nom de l'entrepôt..."
                      />
                    </div>
                    <div className="erp-field">
                      <label className="erp-field-label">Code</label>
                      <input
                        type="text"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                        className="erp-field-input"
                        placeholder="Code entrepôt..."
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

export default WarehouseManagement;
