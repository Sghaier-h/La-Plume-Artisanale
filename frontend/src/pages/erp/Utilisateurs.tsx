/**
 * UtilisateursOdoo - Utilisateurs
 * Version complète avec design Odoo moderne
 */

import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { ERPHeader, ERPStatusbar, ERPNotebook, ERPChatter, ERPButtonBox, useNotifications } from '../../components/erp';
import { displayMany2One, formatDate, formatCurrency, formatState } from '../../utils/relations';
import { validateForm, commonRules } from '../../utils/validation';
import { Plus, Edit, Trash2, Eye, Users, Search } from 'lucide-react';

interface Utilisateur {
  id: number;
  name: string;
  email?: string;
  login?: string;
  active?: boolean;
  groups_id?: any[];
}

const UtilisateursOdoo: React.FC = () => {
  const { success, error: showError } = useNotifications();
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState<'list' | 'form'>('list');
  const [search, setSearch] = useState('');
  const [selectedUtilisateur, setSelectedUtilisateur] = useState<Utilisateur | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadUtilisateurs();
  }, [search]);

  const loadUtilisateurs = async () => {
    setLoading(true);
    try {
      const params: any = { loadRelations: true };
      if (search) params.search = search;
      const response = await api.get('/utilisateurs', { params });
      const data = Array.isArray(response.data) ? response.data : response.data.data || [];
      setUtilisateurs(data);
    } catch (error) {
      console.error('Erreur chargement utilisateurs:', error);
      showError('Erreur', 'Impossible de charger les utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedUtilisateur(null);
    setShowForm(true);
    setViewType('form');
  };

  const handleEdit = (utilisateur: Utilisateur) => {
    setSelectedUtilisateur(utilisateur);
    setShowForm(true);
    setViewType('form');
  };

  const handleSave = async (formData: any) => {
    // Validation
    const rules = {
      name: commonRules.required,
      email: { ...commonRules.required, ...commonRules.email },
      login: commonRules.required
    };
    const validation = validateForm(formData, rules);
    if (!validation.isValid) {
      showError('Erreur de validation', Object.values(validation.errors)[0]);
      return;
    }

    try {
      if (selectedUtilisateur?.id) {
        await api.put(`/utilisateurs/${selectedUtilisateur.id}`, formData);
        success('Utilisateur modifié', 'Les modifications ont été enregistrées');
      } else {
        await api.post('/utilisateurs', formData);
        success('Utilisateur créé', 'L\'utilisateur a été créé avec succès');
      }
      setShowForm(false);
      setSelectedUtilisateur(null);
      setViewType('list');
      loadUtilisateurs();
    } catch (error: any) {
      showError('Erreur', error.response?.data?.error?.message || 'Erreur lors de l\'enregistrement');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        await api.delete(`/utilisateurs/${id}`);
        success('Utilisateur supprimé', 'L\'utilisateur a été supprimé avec succès');
        loadUtilisateurs();
      } catch (error: any) {
        showError('Erreur', error.response?.data?.error?.message || 'Erreur lors de la suppression');
      }
    }
  };

  if (showForm) {
    return (
      <UtilisateurForm
        utilisateur={selectedUtilisateur}
        onClose={() => {
          setShowForm(false);
          setSelectedUtilisateur(null);
          setViewType('list');
          loadUtilisateurs();
        }}
        onSave={handleSave}
      />
    );
  }

  return (
    <div className="erp-layout">
      <ERPHeader
        title="Utilisateurs"
        breadcrumb={[
          { label: 'Paramètres' },
          { label: 'Utilisateurs' }
        ]}
        actions={
          <button onClick={handleCreate} className="erp-btn erp-btn-primary">
            <Plus size={16} style={{ marginRight: '4px' }} />
            Nouvel Utilisateur
          </button>
        }
      />

      <div className="erp-content">
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <div style={{ flex: 1, display: 'flex', gap: '8px' }}>
            <Search size={20} style={{ color: 'var(--erp-text-muted)' }} />
            <input
              type="text"
              placeholder="Rechercher un utilisateur..."
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
                <th>Login</th>
                <th>Email</th>
                <th>Groupes</th>
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
              ) : utilisateurs.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--erp-text-muted)' }}>
                    Aucun utilisateur
                  </td>
                </tr>
              ) : (
                utilisateurs.map(utilisateur => (
                  <tr key={utilisateur.id}>
                    <td>{utilisateur.name}</td>
                    <td>{utilisateur.login || '-'}</td>
                    <td>{utilisateur.email || '-'}</td>
                    <td>{utilisateur.groups_id?.length || 0} groupe(s)</td>
                    <td>
                      {utilisateur.active ? (
                        <span className="erp-status-badge done">Oui</span>
                      ) : (
                        <span className="erp-status-badge cancelled">Non</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          onClick={() => handleEdit(utilisateur)}
                          className="erp-btn erp-btn-outline"
                          style={{ padding: '4px 8px' }}
                          title="Voir/Modifier"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(utilisateur.id)}
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
const UtilisateurForm: React.FC<{
  utilisateur: Utilisateur | null;
  onClose: () => void;
  onSave: (data: any) => void;
}> = ({ utilisateur, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: utilisateur?.name || '',
    login: utilisateur?.login || '',
    email: utilisateur?.email || '',
    password: '',
    active: utilisateur?.active !== false
  });

  const handleSaveClick = () => {
    onSave(formData);
  };

  return (
    <div className="erp-layout">
      <ERPHeader
        title={utilisateur ? `Utilisateur ${utilisateur.name}` : 'Nouvel Utilisateur'}
        breadcrumb={[
          { label: 'Paramètres' },
          { label: 'Utilisateurs' },
          { label: utilisateur ? utilisateur.name : 'Nouveau' }
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
                        placeholder="Nom complet..."
                      />
                    </div>
                    <div className="erp-field">
                      <label className="erp-field-label erp-field-required">Login</label>
                      <input
                        type="text"
                        value={formData.login}
                        onChange={(e) => setFormData({ ...formData, login: e.target.value })}
                        className="erp-field-input"
                        placeholder="Nom d'utilisateur..."
                      />
                    </div>
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
                    {!utilisateur && (
                      <div className="erp-field">
                        <label className="erp-field-label erp-field-required">Mot de passe</label>
                        <input
                          type="password"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="erp-field-input"
                          placeholder="Mot de passe..."
                        />
                      </div>
                    )}
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

export default UtilisateursOdoo;
