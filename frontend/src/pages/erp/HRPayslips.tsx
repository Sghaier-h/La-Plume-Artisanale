/**
 * HRPayslipsERP - Bulletins de Paie
 * Version complète avec design ERP moderne
 */

import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { ERPHeader, ERPStatusbar, ERPNotebook, ERPChatter, ERPButtonBox, useNotifications } from '../../components/erp';
import { displayMany2One, formatDate, formatCurrency, formatState } from '../../utils/relations';
import { Plus, Edit, Trash2, Eye, FileText, Search } from 'lucide-react';
import { validateForm, commonRules } from '../../utils/validation';

interface Payslip {
  id: number;
  name: string;
  employee_id: any;
  date_from: string;
  date_to: string;
  state: 'draft' | 'verify' | 'done' | 'cancel';
  net_wage: number;
}

const HRPayslipsERP: React.FC = () => {
  const { success, error } = useNotifications();
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState<'list' | 'form'>('list');
  const [search, setSearch] = useState('');
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadPayslips();
  }, [search]);

  const loadPayslips = async () => {
    setLoading(true);
    try {
      const params: any = { loadRelations: true };
      if (search) params.search = search;
      const response = await api.get('/hr/payslips', { params });
      const data = Array.isArray(response.data) ? response.data : response.data.data || [];
      setPayslips(data);
    } catch (error) {
      console.error('Erreur chargement bulletins:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedPayslip(null);
    setShowForm(true);
    setViewType('form');
  };

  const handleEdit = (payslip: Payslip) => {
    setSelectedPayslip(payslip);
    setShowForm(true);
    setViewType('form');
  };

  const handleSave = async (formData: any) => {
    try {
      if (selectedPayslip?.id) {
        await api.put(`/hr/payslips/${selectedPayslip.id}`, formData);
        success('Bulletin de paie mis à jour avec succès');
      } else {
        await api.post('/hr/payslips', formData);
        success('Bulletin de paie créé avec succès');
      }
      setShowForm(false);
      setSelectedPayslip(null);
      setViewType('list');
      loadPayslips();
    } catch (err: any) {
      error('Erreur enregistrement', err.response?.data?.error?.message || 'Erreur lors de l\'enregistrement');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce bulletin de paie ?')) {
      try {
        await api.delete(`/hr/payslips/${id}`);
        success('Bulletin de paie supprimé avec succès');
        loadPayslips();
      } catch (err: any) {
        error('Erreur suppression', err.response?.data?.error?.message || 'Erreur lors de la suppression');
      }
    }
  };

  const getStatusColor = (state: string) => {
    const colors: Record<string, string> = {
      draft: 'draft',
      verify: 'confirmed',
      done: 'done',
      cancel: 'cancelled'
    };
    return colors[state] || 'draft';
  };

  const getStatusLabel = (state: string) => {
    const labels: Record<string, string> = {
      draft: 'Brouillon',
      verify: 'À vérifier',
      done: 'Validé',
      cancel: 'Annulé'
    };
    return labels[state] || state;
  };

  if (showForm) {
    return (
      <PayslipForm
        payslip={selectedPayslip}
        onClose={() => {
          setShowForm(false);
          setSelectedPayslip(null);
          setViewType('list');
          loadPayslips();
        }}
        onSave={handleSave}
      />
    );
  }

  return (
    <div className="erp-layout">
      <ERPHeader
        title="Bulletins de Paie"
        breadcrumb={[
          { label: 'Ressources Humaines' },
          { label: 'Bulletins de Paie' }
        ]}
        actions={
          <button onClick={handleCreate} className="erp-btn erp-btn-primary">
            <Plus size={16} style={{ marginRight: '4px' }} />
            Nouveau Bulletin
          </button>
        }
      />

      <div className="erp-content">
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <div style={{ flex: 1, display: 'flex', gap: '8px' }}>
            <Search size={20} style={{ color: 'var(--erp-text-muted)' }} />
            <input
              type="text"
              placeholder="Rechercher un bulletin..."
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
                <th>Employé</th>
                <th>Période</th>
                <th>Net à payer</th>
                <th>État</th>
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
              ) : payslips.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--erp-text-muted)' }}>
                    Aucun bulletin
                  </td>
                </tr>
              ) : (
                payslips.map(payslip => (
                  <tr key={payslip.id}>
                    <td>{payslip.name}</td>
                    <td>{displayMany2One(payslip.employee_id)}</td>
                    <td>
                      {formatDate(payslip.date_from)} - {formatDate(payslip.date_to)}
                    </td>
                    <td>{formatCurrency(payslip.net_wage)}</td>
                    <td>
                      <span className={`erp-status-badge ${getStatusColor(payslip.state)}`}>
                        {formatState(payslip.state).label}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          onClick={() => handleEdit(payslip)}
                          className="erp-btn erp-btn-outline"
                          style={{ padding: '4px 8px' }}
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(payslip.id)}
                          className="erp-btn erp-btn-danger"
                          style={{ padding: '4px 8px' }}
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
const PayslipForm: React.FC<{
  payslip: Payslip | null;
  onClose: () => void;
  onSave: (data: any) => void;
}> = ({ payslip, onClose, onSave }) => {
  const { error } = useNotifications();
  const [formData, setFormData] = useState({
    employee_id: payslip?.employee_id?.[0] || null,
    date_from: payslip?.date_from || new Date().toISOString().split('T')[0],
    date_to: payslip?.date_to || new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [lines, setLines] = useState<any[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSaveClick = () => {
    const validation = validateForm(formData, {
      employee_id: { ...commonRules.required },
      date_from: { ...commonRules.required },
      date_to: { ...commonRules.required }
    });
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      error('Erreur de validation', 'Veuillez corriger les erreurs dans le formulaire');
      return;
    }
    
    setErrors({});
    onSave({ ...formData, line_ids: lines });
  };

  return (
    <div className="erp-layout">
      <ERPHeader
        title={payslip ? `Bulletin ${payslip.name}` : 'Nouveau Bulletin de Paie'}
        breadcrumb={[
          { label: 'Ressources Humaines' },
          { label: 'Bulletins de Paie' },
          { label: payslip ? payslip.name : 'Nouveau' }
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
        {payslip && (
          <ERPStatusbar
            status={{
              label: getStatusLabel(payslip.state),
              value: payslip.state,
              color: getStatusColor(payslip.state) as any
            }}
            workflow={[
              { label: 'Brouillon', value: 'draft', color: 'draft' },
              { label: 'À vérifier', value: 'verify', color: 'confirmed' },
              { label: 'Validé', value: 'done', color: 'done' }
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
                      <label className="erp-field-label erp-field-required">Employé</label>
                      <input
                        type="text"
                        value={formData.employee_id || ''}
                        onChange={(e) => {
                          setFormData({ ...formData, employee_id: e.target.value ? parseInt(e.target.value) : null });
                          if (errors.employee_id) setErrors({ ...errors, employee_id: '' });
                        }}
                        className={`erp-field-input ${errors.employee_id ? 'erp-field-error' : ''}`}
                        placeholder="Sélectionner un employé..."
                      />
                      {errors.employee_id && <span className="erp-field-error-text">{errors.employee_id}</span>}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div className="erp-field">
                        <label className="erp-field-label erp-field-required">Date de début</label>
                        <input
                          type="date"
                          value={formData.date_from}
                          onChange={(e) => {
                            setFormData({ ...formData, date_from: e.target.value });
                            if (errors.date_from) setErrors({ ...errors, date_from: '' });
                          }}
                          className={`erp-field-input ${errors.date_from ? 'erp-field-error' : ''}`}
                        />
                        {errors.date_from && <span className="erp-field-error-text">{errors.date_from}</span>}
                      </div>
                      <div className="erp-field">
                        <label className="erp-field-label erp-field-required">Date de fin</label>
                        <input
                          type="date"
                          value={formData.date_to}
                          onChange={(e) => {
                            setFormData({ ...formData, date_to: e.target.value });
                            if (errors.date_to) setErrors({ ...errors, date_to: '' });
                          }}
                          className={`erp-field-input ${errors.date_to ? 'erp-field-error' : ''}`}
                        />
                        {errors.date_to && <span className="erp-field-error-text">{errors.date_to}</span>}
                      </div>
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
                label: 'Lignes de paie',
                content: (
                  <div>
                    <ERPButtonBox>
                      <button
                        onClick={() => {
                          setLines([...lines, {
                            code: '',
                            name: '',
                            amount: 0
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
                            <th>Code</th>
                            <th>Libellé</th>
                            <th>Montant</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {lines.map((line, index) => (
                            <tr key={index}>
                              <td>{line.code || '-'}</td>
                              <td>{line.name || '-'}</td>
                              <td>{line.amount?.toFixed(2) || '0.00'} TND</td>
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

const getStatusColor = (state: string) => {
  const colors: Record<string, string> = {
    draft: 'draft',
    verify: 'confirmed',
    done: 'done',
    cancel: 'cancelled'
  };
  return colors[state] || 'draft';
};

const getStatusLabel = (state: string) => {
  const labels: Record<string, string> = {
    draft: 'Brouillon',
    verify: 'À vérifier',
    done: 'Validé',
    cancel: 'Annulé'
  };
  return labels[state] || state;
};

export default HRPayslipsERP;
