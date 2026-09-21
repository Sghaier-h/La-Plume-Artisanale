/**
 * MachinesERP - Machines
 * Version complète avec design ERP moderne
 */

import React, { useEffect, useState } from 'react';
import { machinesService } from '../../services/api';
import { ERPHeader, ERPStatusbar, ERPNotebook, ERPChatter, ERPButtonBox, useNotifications } from '../../components/erp';
import { displayMany2One, formatDate, formatCurrency, formatState } from '../../utils/relations';
import { Plus, Edit, Trash2, Eye, Cog, Search } from 'lucide-react';
import { validateForm, commonRules } from '../../utils/validation';

interface Machine {
  id: number;
  name: string;
  code?: string;
  type?: string;
  active?: boolean;
}

const MachinesERP: React.FC = () => {
  const { success, error } = useNotifications();
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState<'list' | 'form'>('list');
  const [search, setSearch] = useState('');
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadMachines();
  }, [search]);

  const loadMachines = async () => {
    setLoading(true);
    try {
      const params: any = { loadRelations: true };
      if (search) params.search = search;
      const response = await machinesService.getMachines(params);
      const data = Array.isArray(response.data) ? response.data : response.data.data || [];
      setMachines(data);
    } catch (error) {
      console.error('Erreur chargement machines:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedMachine(null);
    setShowForm(true);
    setViewType('form');
  };

  const handleEdit = (machine: Machine) => {
    setSelectedMachine(machine);
    setShowForm(true);
    setViewType('form');
  };

  const handleSave = async (formData: any) => {
    try {
      if (selectedMachine?.id) {
        await machinesService.updateMachine(selectedMachine.id, formData);
        success('Machine mise à jour avec succès');
      } else {
        await machinesService.createMachine(formData);
        success('Machine créée avec succès');
      }
      setShowForm(false);
      setSelectedMachine(null);
      setViewType('list');
      loadMachines();
    } catch (err: any) {
      error('Erreur enregistrement', err.response?.data?.error?.message || 'Erreur lors de l\'enregistrement');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette machine ?')) {
      try {
        await machinesService.deleteMachine(id);
        success('Machine supprimée avec succès');
        loadMachines();
      } catch (err: any) {
        error('Erreur suppression', err.response?.data?.error?.message || 'Erreur lors de la suppression');
      }
    }
  };

  if (showForm) {
    return (
      <MachineForm
        machine={selectedMachine}
        onClose={() => {
          setShowForm(false);
          setSelectedMachine(null);
          setViewType('list');
          loadMachines();
        }}
        onSave={handleSave}
      />
    );
  }

  return (
    <div className="erp-layout">
      <ERPHeader
        title="Machines"
        breadcrumb={[
          { label: 'Production' },
          { label: 'Machines' }
        ]}
        actions={
          <button onClick={handleCreate} className="erp-btn erp-btn-primary">
            <Plus size={16} style={{ marginRight: '4px' }} />
            Nouvelle Machine
          </button>
        }
      />

      <div className="erp-content">
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <div style={{ flex: 1, display: 'flex', gap: '8px' }}>
            <Search size={20} style={{ color: 'var(--erp-text-muted)' }} />
            <input
              type="text"
              placeholder="Rechercher une machine..."
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
                <th>Type</th>
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
              ) : machines.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: 'var(--erp-text-muted)' }}>
                    Aucune machine
                  </td>
                </tr>
              ) : (
                machines.map(machine => (
                  <tr key={machine.id}>
                    <td>{machine.code || '-'}</td>
                    <td>{machine.name}</td>
                    <td>{machine.type || '-'}</td>
                    <td>
                      {machine.active ? (
                        <span className="erp-status-badge done">Oui</span>
                      ) : (
                        <span className="erp-status-badge cancelled">Non</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          onClick={() => handleEdit(machine)}
                          className="erp-btn erp-btn-outline"
                          style={{ padding: '4px 8px' }}
                          title="Voir/Modifier"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(machine.id)}
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
const MachineForm: React.FC<{
  machine: Machine | null;
  onClose: () => void;
  onSave: (data: any) => void;
}> = ({ machine, onClose, onSave }) => {
  const { error } = useNotifications();
  const [formData, setFormData] = useState({
    name: machine?.name || '',
    code: machine?.code || '',
    type: machine?.type || '',
    active: machine?.active !== false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSaveClick = () => {
    const validation = validateForm(formData, {
      name: { ...commonRules.required }
    });
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      error('Erreur de validation', 'Veuillez corriger les erreurs dans le formulaire');
      return;
    }
    
    setErrors({});
    onSave(formData);
  };

  return (
    <div className="erp-layout">
      <ERPHeader
        title={machine ? `Machine ${machine.name}` : 'Nouvelle Machine'}
        breadcrumb={[
          { label: 'Production' },
          { label: 'Machines' },
          { label: machine ? machine.name : 'Nouvelle' }
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
                        onChange={(e) => {
                          setFormData({ ...formData, name: e.target.value });
                          if (errors.name) setErrors({ ...errors, name: '' });
                        }}
                        className={`erp-field-input ${errors.name ? 'erp-field-error' : ''}`}
                        placeholder="Nom de la machine..."
                      />
                      {errors.name && <span className="erp-field-error-text">{errors.name}</span>}
                    </div>
                    <div className="erp-field">
                      <label className="erp-field-label">Code</label>
                      <input
                        type="text"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                        className="erp-field-input"
                        placeholder="Code machine..."
                      />
                    </div>
                    <div className="erp-field">
                      <label className="erp-field-label">Type</label>
                      <input
                        type="text"
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="erp-field-input"
                        placeholder="Type de machine..."
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

export default MachinesERP;
