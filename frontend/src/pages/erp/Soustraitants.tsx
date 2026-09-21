/**
 * SoustraitantsOdoo - Sous-traitants
 * Version complète avec design Odoo moderne
 */

import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { ERPHeader, ERPStatusbar, ERPNotebook, ERPChatter, ERPButtonBox, useNotifications } from '../../components/erp';
import { displayMany2One, formatDate, formatCurrency, formatState } from '../../utils/relations';
import { validateForm, commonRules } from '../../utils/validation';
import { Plus, Edit, Trash2, Eye, Users, Search } from 'lucide-react';

interface Soustraitant {
  id_partner?: number;
  name: string;
  ref?: string;
  email?: string;
  phone?: string;
  active?: boolean;
}

const SoustraitantsOdoo: React.FC = () => {
  const { success, error: showError } = useNotifications();
  const [soustraitants, setSoustraitants] = useState<Soustraitant[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState<'list' | 'form'>('list');
  const [search, setSearch] = useState('');
  const [selectedSoustraitant, setSelectedSoustraitant] = useState<Soustraitant | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadSoustraitants();
  }, [search]);

  const loadSoustraitants = async () => {
    setLoading(true);
    try {
      const params: any = { soustraitant: 'true', loadRelations: true };
      if (search) params.search = search;
      const response = await api.get('/commercial/partners', { params });
      const data = Array.isArray(response.data) ? response.data : response.data.data || [];
      setSoustraitants(data);
    } catch (error) {
      console.error('Erreur chargement sous-traitants:', error);
      showError('Erreur', 'Impossible de charger les sous-traitants');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedSoustraitant(null);
    setShowForm(true);
    setViewType('form');
  };

  const handleEdit = (soustraitant: Soustraitant) => {
    setSelectedSoustraitant(soustraitant);
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
      if (selectedSoustraitant?.id_partner) {
        await api.put(`/commercial/partners/${selectedSoustraitant.id_partner}`, formData);
        success('Sous-traitant modifié', 'Les modifications ont été enregistrées');
      } else {
        await api.post('/commercial/partners', { ...formData, soustraitant: true });
        success('Sous-traitant créé', 'Le sous-traitant a été créé avec succès');
      }
      setShowForm(false);
      setSelectedSoustraitant(null);
      setViewType('list');
      loadSoustraitants();
    } catch (error: any) {
      showError('Erreur', error.response?.data?.error?.message || 'Erreur lors de l\'enregistrement');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce sous-traitant ?')) {
      try {
        await api.delete(`/commercial/partners/${id}`);
        success('Sous-traitant supprimé', 'Le sous-traitant a été supprimé avec succès');
        loadSoustraitants();
      } catch (error: any) {
        showError('Erreur', error.response?.data?.error?.message || 'Erreur lors de la suppression');
      }
    }
  };

  if (showForm) {
    return (
      <SoustraitantForm
        soustraitant={selectedSoustraitant}
        onClose={() => {
          setShowForm(false);
          setSelectedSoustraitant(null);
          setViewType('list');
          loadSoustraitants();
        }}
        onSave={handleSave}
      />
    );
  }

  return (
    <div className="erp-layout">
      <ERPHeader
        title="Sous-traitants"
        breadcrumb={[
          { label: 'Production', path: '/productions' },
          { label: 'Sous-traitants' }
        ]}
        actions={
          <button onClick={handleCreate} className="erp-btn erp-btn-primary">
            <Plus size={16} style={{ marginRight: '4px' }} />
            Nouveau Sous-traitant
          </button>
        }
      />

      <div className="erp-content">
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <div style={{ flex: 1, display: 'flex', gap: '8px' }}>
            <Search size={20} style={{ color: 'var(--erp-text-muted)' }} />
            <input
              type="text"
              placeholder="Rechercher un sous-traitant..."
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
              ) : soustraitants.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--erp-text-muted)' }}>
                    Aucun sous-traitant
                  </td>
                </tr>
              ) : (
                soustraitants.map(soustraitant => (
                  <tr key={soustraitant.id_partner}>
                    <td>{soustraitant.ref || '-'}</td>
                    <td>{soustraitant.name}</td>
                    <td>{soustraitant.email || '-'}</td>
                    <td>{soustraitant.phone || '-'}</td>
                    <td>
                      {soustraitant.active ? (
                        <span className="erp-status-badge done">Oui</span>
                      ) : (
                        <span className="erp-status-badge cancelled">Non</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          onClick={() => handleEdit(soustraitant)}
                          className="erp-btn erp-btn-outline"
                          style={{ padding: '4px 8px' }}
                          title="Voir/Modifier"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(soustraitant.id_partner!)}
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
const SoustraitantForm: React.FC<{
  soustraitant: Soustraitant | null;
  onClose: () => void;
  onSave: (data: any) => void;
}> = ({ soustraitant, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: soustraitant?.name || '',
    ref: soustraitant?.ref || '',
    email: soustraitant?.email || '',
    phone: soustraitant?.phone || '',
    active: soustraitant?.active !== false
  });

  const handleSaveClick = () => {
    onSave(formData);
  };

  return (
    <div className="erp-layout">
      <ERPHeader
        title={soustraitant ? `Sous-traitant ${soustraitant.name}` : 'Nouveau Sous-traitant'}
        breadcrumb={[
          { label: 'Production' },
          { label: 'Sous-traitants' },
          { label: soustraitant ? soustraitant.name : 'Nouveau' }
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
          {soustraitant && (
            <ERPStatusbar
              status={{
                label: soustraitant.active ? 'Actif' : 'Inactif',
                value: soustraitant.active ? 'active' : 'inactive',
                color: soustraitant.active ? 'done' : 'cancelled'
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
                        placeholder="Nom du sous-traitant..."
                      />
                    </div>
                    <div className="erp-field">
                      <label className="erp-field-label">Référence</label>
                      <input
                        type="text"
                        value={formData.ref}
                        onChange={(e) => setFormData({ ...formData, ref: e.target.value })}
                        className="erp-field-input"
                        placeholder="Référence sous-traitant..."
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

export default SoustraitantsOdoo;
