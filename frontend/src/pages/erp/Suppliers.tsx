/**
 * SuppliersOdoo - Fournisseurs
 * Version complète avec design Odoo moderne
 */

import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { ERPHeader, ERPStatusbar, ERPNotebook, ERPChatter, ERPButtonBox, useNotifications } from '../../components/erp';
import { displayMany2One, formatDate, formatCurrency, formatState } from '../../utils/relations';
import { validateForm, commonRules } from '../../utils/validation';
import { Plus, Edit, Trash2, Eye, Truck, Search } from 'lucide-react';

interface Supplier {
  id_partner?: number;
  name: string;
  ref?: string;
  email?: string;
  phone?: string;
  supplier: boolean;
  supplier_rank?: number;
  active?: boolean;
}

const SuppliersOdoo: React.FC = () => {
  const { success, error: showError } = useNotifications();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState<'list' | 'form'>('list');
  const [search, setSearch] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadSuppliers();
  }, [search]);

  const loadSuppliers = async () => {
    setLoading(true);
    try {
      const params: any = { supplier: 'true', loadRelations: true };
      if (search) params.search = search;
      const response = await api.get('/commercial/partners', { params });
      const data = Array.isArray(response.data) ? response.data : response.data.data || [];
      setSuppliers(data);
    } catch (error) {
      console.error('Erreur chargement fournisseurs:', error);
      showError('Erreur', 'Impossible de charger les fournisseurs');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedSupplier(null);
    setShowForm(true);
    setViewType('form');
  };

  const handleEdit = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setShowForm(true);
    setViewType('form');
  };

  const handleSave = async (formData: any) => {
    // Validation
    const rules = {
      name: commonRules.required,
      email: { email: true }
    };
    const validation = validateForm(formData, rules);
    if (!validation.isValid) {
      showError('Erreur de validation', Object.values(validation.errors)[0]);
      return;
    }

    try {
      if (selectedSupplier?.id_partner) {
        await api.put(`/commercial/partners/${selectedSupplier.id_partner}`, formData);
        success('Fournisseur modifié', 'Les modifications ont été enregistrées');
      } else {
        await api.post('/commercial/partners', { ...formData, supplier: true });
        success('Fournisseur créé', 'Le fournisseur a été créé avec succès');
      }
      setShowForm(false);
      setSelectedSupplier(null);
      setViewType('list');
      loadSuppliers();
    } catch (error: any) {
      showError('Erreur', error.response?.data?.error?.message || 'Erreur lors de l\'enregistrement');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce fournisseur ?')) {
      try {
        await api.delete(`/commercial/partners/${id}`);
        success('Fournisseur supprimé', 'Le fournisseur a été supprimé avec succès');
        loadSuppliers();
      } catch (error: any) {
        showError('Erreur', error.response?.data?.error?.message || 'Erreur lors de la suppression');
      }
    }
  };

  if (showForm) {
    return (
      <SupplierForm
        supplier={selectedSupplier}
        onClose={() => {
          setShowForm(false);
          setSelectedSupplier(null);
          setViewType('list');
          loadSuppliers();
        }}
        onSave={handleSave}
      />
    );
  }

  return (
    <div className="erp-layout">
      <ERPHeader
        title="Fournisseurs"
        breadcrumb={[
          { label: 'Achats' },
          { label: 'Fournisseurs' }
        ]}
        actions={
          <button onClick={handleCreate} className="erp-btn erp-btn-primary">
            <Plus size={16} style={{ marginRight: '4px' }} />
            Nouveau Fournisseur
          </button>
        }
      />

      <div className="erp-content">
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <div style={{ flex: 1, display: 'flex', gap: '8px' }}>
            <Search size={20} style={{ color: 'var(--erp-text-muted)' }} />
            <input
              type="text"
              placeholder="Rechercher un fournisseur..."
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
                <th>Nom</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Rang fournisseur</th>
                <th>Actif</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '32px' }}>
                    Chargement...
                  </td>
                </tr>
              ) : suppliers.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--erp-text-muted)' }}>
                    Aucun fournisseur
                  </td>
                </tr>
              ) : (
                suppliers.map(supplier => (
                  <tr key={supplier.id_partner}>
                    <td>{supplier.ref || '-'}</td>
                    <td>{supplier.name}</td>
                    <td>{supplier.email || '-'}</td>
                    <td>{supplier.phone || '-'}</td>
                    <td>{supplier.supplier_rank || 0}</td>
                    <td>
                      {supplier.active ? (
                        <span className="erp-status-badge done">Oui</span>
                      ) : (
                        <span className="erp-status-badge cancelled">Non</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          onClick={() => handleEdit(supplier)}
                          className="erp-btn erp-btn-outline"
                          style={{ padding: '4px 8px' }}
                          title="Voir/Modifier"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(supplier.id_partner!)}
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
const SupplierForm: React.FC<{
  supplier: Supplier | null;
  onClose: () => void;
  onSave: (data: any) => void;
}> = ({ supplier, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: supplier?.name || '',
    ref: supplier?.ref || '',
    email: supplier?.email || '',
    phone: supplier?.phone || '',
    supplier_rank: supplier?.supplier_rank || 0,
    active: supplier?.active !== false
  });

  const handleSaveClick = () => {
    onSave(formData);
  };

  return (
    <div className="erp-layout">
      <ERPHeader
        title={supplier ? `Fournisseur ${supplier.name}` : 'Nouveau Fournisseur'}
        breadcrumb={[
          { label: 'Achats' },
          { label: 'Fournisseurs' },
          { label: supplier ? supplier.name : 'Nouveau' }
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
          {supplier && (
            <ERPStatusbar
              status={{
                label: supplier.active ? 'Actif' : 'Inactif',
                value: supplier.active ? 'active' : 'inactive',
                color: supplier.active ? 'done' : 'cancelled'
              }}
            />
          )}
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
                        placeholder="Nom du fournisseur..."
                      />
                    </div>
                    <div className="erp-field">
                      <label className="erp-field-label">Référence</label>
                      <input
                        type="text"
                        value={formData.ref}
                        onChange={(e) => setFormData({ ...formData, ref: e.target.value })}
                        className="erp-field-input"
                        placeholder="Référence fournisseur..."
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div className="erp-field">
                        <label className="erp-field-label">Email</label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="erp-field-input"
                          placeholder="email@example.com"
                        />
                      </div>
                      <div className="erp-field">
                        <label className="erp-field-label">Téléphone</label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="erp-field-input"
                          placeholder="+216 XX XXX XXX"
                        />
                      </div>
                    </div>
                    <div className="erp-field">
                      <label className="erp-field-label">Rang fournisseur</label>
                      <input
                        type="number"
                        value={formData.supplier_rank}
                        onChange={(e) => setFormData({ ...formData, supplier_rank: parseInt(e.target.value) || 0 })}
                        className="erp-field-input"
                        min="0"
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

export default SuppliersOdoo;
