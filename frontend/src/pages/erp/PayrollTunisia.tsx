/**
 * PayrollTunisia - Paie Tunisie
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
  cnss?: number;
  irpp?: number;
}

const PayrollTunisia: React.FC = () => {
  const { success, error: showError } = useNotifications();
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
      const response = await api.get('/payroll-tunisia/payslips', { params });
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
        await api.put(`/payroll-tunisia/payslips/${selectedPayslip.id}`, formData);
      } else {
        await api.post('/payroll-tunisia/payslips', formData);
      }
      setShowForm(false);
      setSelectedPayslip(null);
      setViewType('list');
      loadPayslips();
    } catch (error: any) {
      error('Erreur', error.response?.data?.error?.message || 'Erreur lors de l\'enregistrement');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce bulletin de paie ?')) {
      try {
        await api.delete(`/payroll-tunisia/payslips/${id}`);
        success('Suppression réussie');
        loadPayslips();
      } catch (err: any) {
        showError('Erreur', err.response?.data?.error?.message || 'Erreur lors de la suppression');
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
        title="Paie Tunisie"
        breadcrumb={[
          { label: 'Ressources Humaines' },
          { label: 'Paie Tunisie' }
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
                <th>CNSS</th>
                <th>IRPP</th>
                <th>État</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '32px' }}>
                    Chargement...
                  </td>
                </tr>
              ) : payslips.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '32px', color: 'var(--erp-text-muted)' }}>
                    Aucun bulletin
                  </td>
                </tr>
              ) : (
                payslips.map(payslip => (
                  <tr key={payslip.id}>
                    <td>{payslip.name}</td>
                    <td>{payslip.employee_id?.[1] || '-'}</td>
                    <td>
                      {new Date(payslip.date_from).toLocaleDateString()} - {new Date(payslip.date_to).toLocaleDateString()}
                    </td>
                    <td>{payslip.net_wage?.toFixed(2) || '0.00'} TND</td>
                    <td>{payslip.cnss?.toFixed(2) || '0.00'} TND</td>
                    <td>{payslip.irpp?.toFixed(2) || '0.00'} TND</td>
                    <td>
                      <span className={`erp-status-badge ${getStatusColor(payslip.state)}`}>
                        {getStatusLabel(payslip.state)}
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
  const [formData, setFormData] = useState({
    employee_id: payslip?.employee_id?.[0] || null,
    date_from: payslip?.date_from || new Date().toISOString().split('T')[0],
    date_to: payslip?.date_to || new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [lines, setLines] = useState<any[]>([]);

  const handleSaveClick = () => {
    onSave({ ...formData, line_ids: lines });
  };

  return (
    <div className="erp-layout">
      <ERPHeader
        title={payslip ? `Bulletin ${payslip.name}` : 'Nouveau Bulletin de Paie'}
        breadcrumb={[
          { label: 'Ressources Humaines' },
          { label: 'Paie Tunisie' },
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
                        onChange={(e) => setFormData({ ...formData, employee_id: e.target.value ? parseInt(e.target.value) : null })}
                        className="erp-field-input"
                        placeholder="Sélectionner un employé..."
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div className="erp-field">
                        <label className="erp-field-label erp-field-required">Date de début</label>
                        <input
                          type="date"
                          value={formData.date_from}
                          onChange={(e) => setFormData({ ...formData, date_from: e.target.value })}
                          className="erp-field-input"
                        />
                      </div>
                      <div className="erp-field">
                        <label className="erp-field-label erp-field-required">Date de fin</label>
                        <input
                          type="date"
                          value={formData.date_to}
                          onChange={(e) => setFormData({ ...formData, date_to: e.target.value })}
                          className="erp-field-input"
                        />
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
                            amount: 0,
                            category: 'gross'
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
                            <th>Catégorie</th>
                            <th>Montant</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {lines.map((line, index) => (
                            <tr key={index}>
                              <td>{line.code || '-'}</td>
                              <td>{line.name || '-'}</td>
                              <td>
                                {line.category === 'gross' ? 'Brut' :
                                 line.category === 'deduction' ? 'Déduction' :
                                 line.category === 'net' ? 'Net' : '-'}
                              </td>
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
                              <td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: 'var(--erp-text-muted)' }}>
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

export default PayrollTunisia;
