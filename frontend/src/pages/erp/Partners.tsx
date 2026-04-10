/**
 * PartnersERP - Clients/Partenaires
 * Version complète avec design ERP moderne
 */

import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { ERPHeader, ERPStatusbar, ERPNotebook, ERPChatter, ERPButtonBox, useNotifications } from '../../components/erp';
import { displayMany2One, formatDate, formatCurrency, formatState } from '../../utils/relations';
import { validateForm, commonRules } from '../../utils/validation';
import { Plus, Edit, Trash2, Eye, User, Mail, Phone, Search } from 'lucide-react';

interface Partner {
  id_partner?: number;
  name: string;
  ref?: string;
  email?: string;
  phone?: string;
  customer: boolean;
  customer_rank?: number;
  credit_limit?: number;
  active?: boolean;
}

const PartnersERP: React.FC = () => {
  const { success, error: showError } = useNotifications();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState<'list' | 'form'>('list');
  const [search, setSearch] = useState('');
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadPartners();
  }, [search]);

  const loadPartners = async () => {
    setLoading(true);
    try {
      const params: any = { customer: 'true', loadRelations: true };
      if (search) params.search = search;
      const response = await api.get('/commercial/partners', { params });
      const data = Array.isArray(response.data) ? response.data : response.data.data || [];
      setPartners(data);
    } catch (error) {
      console.error('Erreur chargement partenaires:', error);
      showError('Erreur', 'Impossible de charger les clients');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedPartner(null);
    setShowForm(true);
    setViewType('form');
  };

  const handleEdit = (partner: Partner) => {
    setSelectedPartner(partner);
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
      if (selectedPartner?.id_partner) {
        await api.put(`/commercial/partners/${selectedPartner.id_partner}`, formData);
        success('Client modifié', 'Les modifications ont été enregistrées');
      } else {
        await api.post('/commercial/partners', { ...formData, customer: true });
        success('Client créé', 'Le client a été créé avec succès');
      }
      setShowForm(false);
      setSelectedPartner(null);
      setViewType('list');
      loadPartners();
    } catch (error: any) {
      showError('Erreur', error.response?.data?.error?.message || 'Erreur lors de l\'enregistrement');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
      try {
        await api.delete(`/commercial/partners/${id}`);
        success('Client supprimé', 'Le client a été supprimé avec succès');
        loadPartners();
      } catch (error: any) {
        showError('Erreur', error.response?.data?.error?.message || 'Erreur lors de la suppression');
      }
    }
  };

  if (showForm) {
    return (
      <PartnerForm
        partner={selectedPartner}
        onClose={() => {
          setShowForm(false);
          setSelectedPartner(null);
          setViewType('list');
          loadPartners();
        }}
        onSave={handleSave}
      />
    );
  }

  return (
    <div className="erp-layout">
      <ERPHeader
        title="Clients"
        breadcrumb={[
          { label: 'Ventes' },
          { label: 'Clients' }
        ]}
        actions={
          <button onClick={handleCreate} className="erp-btn erp-btn-primary">
            <Plus size={16} style={{ marginRight: '4px' }} />
            Nouveau Client
          </button>
        }
      />

      <div className="erp-content">
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <div style={{ flex: 1, display: 'flex', gap: '8px' }}>
            <Search size={20} style={{ color: 'var(--erp-text-muted)' }} />
            <input
              type="text"
              placeholder="Rechercher un client..."
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
                <th>Rang client</th>
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
              ) : partners.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--erp-text-muted)' }}>
                    Aucun client
                  </td>
                </tr>
              ) : (
                partners.map(partner => (
                  <tr key={partner.id_partner}>
                    <td>{partner.ref || '-'}</td>
                    <td>{partner.name}</td>
                    <td>{partner.email || '-'}</td>
                    <td>{partner.phone || '-'}</td>
                    <td>{formatCurrency(partner.customer_rank || 0)}</td>
                    <td>
                      {partner.active ? (
                        <span className="erp-status-badge done">Oui</span>
                      ) : (
                        <span className="erp-status-badge cancelled">Non</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          onClick={() => handleEdit(partner)}
                          className="erp-btn erp-btn-outline"
                          style={{ padding: '4px 8px' }}
                          title="Voir/Modifier"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(partner.id_partner!)}
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
const PartnerForm: React.FC<{
  partner: Partner | null;
  onClose: () => void;
  onSave: (data: any) => void;
}> = ({ partner, onClose, onSave }) => {
  const { success, error: showError } = useNotifications();
  const [formData, setFormData] = useState({
    name: partner?.name || '',
    ref: partner?.ref || '',
    email: partner?.email || '',
    phone: partner?.phone || '',
    customer_rank: partner?.customer_rank || 0,
    credit_limit: partner?.credit_limit || 0,
    active: partner?.active !== false
  });

  const handleSaveClick = () => {
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
    onSave(formData);
  };

  return (
    <div className="erp-layout">
      <ERPHeader
        title={partner ? `Client ${partner.name}` : 'Nouveau Client'}
        breadcrumb={[
          { label: 'Ventes' },
          { label: 'Clients' },
          { label: partner ? partner.name : 'Nouveau' }
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
          {partner && (
            <ERPStatusbar
              status={{
                label: partner.active ? 'Actif' : 'Inactif',
                value: partner.active ? 'active' : 'inactive',
                color: partner.active ? 'done' : 'cancelled'
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
                        placeholder="Nom du client..."
                      />
                    </div>
                    <div className="erp-field">
                      <label className="erp-field-label">Référence</label>
                      <input
                        type="text"
                        value={formData.ref}
                        onChange={(e) => setFormData({ ...formData, ref: e.target.value })}
                        className="erp-field-input"
                        placeholder="Référence client..."
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
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div className="erp-field">
                        <label className="erp-field-label">Rang client</label>
                        <input
                          type="number"
                          value={formData.customer_rank}
                          onChange={(e) => setFormData({ ...formData, customer_rank: parseInt(e.target.value) || 0 })}
                          className="erp-field-input"
                          min="0"
                        />
                      </div>
                      <div className="erp-field">
                        <label className="erp-field-label">Limite de crédit</label>
                        <input
                          type="number"
                          value={formData.credit_limit}
                          onChange={(e) => setFormData({ ...formData, credit_limit: parseFloat(e.target.value) || 0 })}
                          className="erp-field-input"
                          step="0.01"
                          min="0"
                        />
                      </div>
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

export default PartnersERP;
