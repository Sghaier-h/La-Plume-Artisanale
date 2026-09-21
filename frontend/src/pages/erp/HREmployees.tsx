/**
 * HREmployeesERP - Employés
 * Version complète avec design ERP moderne
 */

import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { ERPHeader, ERPStatusbar, ERPNotebook, ERPChatter, ERPButtonBox, useNotifications } from '../../components/erp';
import { displayMany2One, formatDate, formatCurrency, formatState } from '../../utils/relations';
import { validateForm, commonRules } from '../../utils/validation';
import { Plus, Edit, Trash2, Eye, UserCircle, Search } from 'lucide-react';

interface Employee {
  id: number;
  name: string;
  work_email?: string;
  work_phone?: string;
  department_id?: any;
  job_id?: any;
  manager_id?: any;
  active?: boolean;
}

const HREmployeesERP: React.FC = () => {
  const { success, error: showError } = useNotifications();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState<'list' | 'form'>('list');
  const [search, setSearch] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadEmployees();
  }, [search]);

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const params: any = { loadRelations: true };
      if (search) params.search = search;
      const response = await api.get('/hr/employees', { params });
      const data = Array.isArray(response.data) ? response.data : response.data.data || [];
      setEmployees(data);
    } catch (error) {
      console.error('Erreur chargement employés:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedEmployee(null);
    setShowForm(true);
    setViewType('form');
  };

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowForm(true);
    setViewType('form');
  };

  const handleSave = async (formData: any) => {
    // Validation
    const rules = {
      name: commonRules.required,
      work_email: { email: true }
    };
    const validation = validateForm(formData, rules);
    if (!validation.isValid) {
      showError('Erreur de validation', Object.values(validation.errors)[0]);
      return;
    }

    try {
      if (selectedEmployee?.id) {
        await api.put(`/hr/employees/${selectedEmployee.id}`, formData);
        success('Employé modifié', 'Les modifications ont été enregistrées');
      } else {
        await api.post('/hr/employees', formData);
        success('Employé créé', 'L\'employé a été créé avec succès');
      }
      setShowForm(false);
      setSelectedEmployee(null);
      setViewType('list');
      loadEmployees();
    } catch (error: any) {
      showError('Erreur', error.response?.data?.error?.message || 'Erreur lors de l\'enregistrement');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet employé ?')) {
      try {
        await api.delete(`/hr/employees/${id}`);
        success('Employé supprimé', 'L\'employé a été supprimé avec succès');
        loadEmployees();
      } catch (error: any) {
        showError('Erreur', error.response?.data?.error?.message || 'Erreur lors de la suppression');
      }
    }
  };

  if (showForm) {
    return (
      <EmployeeForm
        employee={selectedEmployee}
        onClose={() => {
          setShowForm(false);
          setSelectedEmployee(null);
          setViewType('list');
          loadEmployees();
        }}
        onSave={handleSave}
      />
    );
  }

  return (
    <div className="erp-layout">
      <ERPHeader
        title="Employés"
        breadcrumb={[
          { label: 'Ressources Humaines' },
          { label: 'Employés' }
        ]}
        actions={
          <button onClick={handleCreate} className="erp-btn erp-btn-primary">
            <Plus size={16} style={{ marginRight: '4px' }} />
            Nouvel Employé
          </button>
        }
      />

      <div className="erp-content">
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <div style={{ flex: 1, display: 'flex', gap: '8px' }}>
            <Search size={20} style={{ color: 'var(--erp-text-muted)' }} />
            <input
              type="text"
              placeholder="Rechercher un employé..."
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
                <th>Email</th>
                <th>Téléphone</th>
                <th>Département</th>
                <th>Poste</th>
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
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--erp-text-muted)' }}>
                    Aucun employé
                  </td>
                </tr>
              ) : (
                employees.map(employee => (
                  <tr key={employee.id}>
                    <td>{employee.name}</td>
                    <td>{employee.work_email || '-'}</td>
                    <td>{employee.work_phone || '-'}</td>
                    <td>{employee.department_id?.[1] || '-'}</td>
                    <td>{employee.job_id?.[1] || '-'}</td>
                    <td>
                      {employee.active ? (
                        <span className="erp-status-badge done">Oui</span>
                      ) : (
                        <span className="erp-status-badge cancelled">Non</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          onClick={() => handleEdit(employee)}
                          className="erp-btn erp-btn-outline"
                          style={{ padding: '4px 8px' }}
                          title="Voir/Modifier"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(employee.id)}
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
const EmployeeForm: React.FC<{
  employee: Employee | null;
  onClose: () => void;
  onSave: (data: any) => void;
}> = ({ employee, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: employee?.name || '',
    work_email: employee?.work_email || '',
    work_phone: employee?.work_phone || '',
    department_id: employee?.department_id?.[0] || null,
    job_id: employee?.job_id?.[0] || null,
    manager_id: employee?.manager_id?.[0] || null,
    active: employee?.active !== false
  });

  const handleSaveClick = () => {
    onSave(formData);
  };

  return (
    <div className="erp-layout">
      <ERPHeader
        title={employee ? `Employé ${employee.name}` : 'Nouvel Employé'}
        breadcrumb={[
          { label: 'Ressources Humaines' },
          { label: 'Employés' },
          { label: employee ? employee.name : 'Nouveau' }
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
                label: 'Informations personnelles',
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
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div className="erp-field">
                        <label className="erp-field-label">Email professionnel</label>
                        <input
                          type="email"
                          value={formData.work_email}
                          onChange={(e) => setFormData({ ...formData, work_email: e.target.value })}
                          className="erp-field-input"
                          placeholder="email@company.com"
                        />
                      </div>
                      <div className="erp-field">
                        <label className="erp-field-label">Téléphone professionnel</label>
                        <input
                          type="tel"
                          value={formData.work_phone}
                          onChange={(e) => setFormData({ ...formData, work_phone: e.target.value })}
                          className="erp-field-input"
                          placeholder="+216 XX XXX XXX"
                        />
                      </div>
                    </div>
                    <div className="erp-field">
                      <label className="erp-field-label">Département</label>
                      <input
                        type="text"
                        value={formData.department_id || ''}
                        onChange={(e) => setFormData({ ...formData, department_id: e.target.value ? parseInt(e.target.value) : null })}
                        className="erp-field-input"
                        placeholder="Sélectionner un département..."
                      />
                    </div>
                    <div className="erp-field">
                      <label className="erp-field-label">Poste</label>
                      <input
                        type="text"
                        value={formData.job_id || ''}
                        onChange={(e) => setFormData({ ...formData, job_id: e.target.value ? parseInt(e.target.value) : null })}
                        className="erp-field-input"
                        placeholder="Sélectionner un poste..."
                      />
                    </div>
                    <div className="erp-field">
                      <label className="erp-field-label">Superviseur</label>
                      <input
                        type="text"
                        value={formData.manager_id || ''}
                        onChange={(e) => setFormData({ ...formData, manager_id: e.target.value ? parseInt(e.target.value) : null })}
                        className="erp-field-input"
                        placeholder="Sélectionner un superviseur..."
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

export default HREmployeesERP;
