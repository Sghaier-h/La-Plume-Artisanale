/**
 * BankReconciliationERP - Rapprochements Bancaires
 * Module de rapprochement bancaire
 */

import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Search, Plus, FileText, Link as LinkIcon, Trash2, Eye } from 'lucide-react';
import api from '../../services/api';
import { bankReconciliationService } from '../../services/api';
import { ERPHeader, ERPStatusbar, ERPNotebook, ERPChatter, useNotifications } from '../../components/erp';
import { displayMany2One, formatDate, formatCurrency, formatState } from '../../utils/relations';
import { validateForm, commonRules } from '../../utils/validation';

interface Reconciliation {
  id: number;
  name: string;
  journal_id: number;
  journal_name: string;
  date: string;
  statut: 'draft' | 'validated';
  balance_start: number;
  balance_end: number;
  lines?: ReconciliationLine[];
}

interface ReconciliationLine {
  id: number;
  move_line_id: number;
  date: string;
  name: string;
  debit: number;
  credit: number;
  reconciled: boolean;
  matched: boolean;
}

const BankReconciliationERP: React.FC = () => {
  const { success, error: showError } = useNotifications();
  const [reconciliations, setReconciliations] = useState<Reconciliation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReconciliation, setSelectedReconciliation] = useState<Reconciliation | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [journals, setJournals] = useState<any[]>([]);

  useEffect(() => {
    loadReconciliations();
    loadJournals();
  }, []);

  const loadReconciliations = async () => {
    setLoading(true);
    try {
      const params: any = { loadRelations: true };
      const response = await bankReconciliationService.getReconciliations(params);
      setReconciliations(response.data.data || []);
    } catch (error) {
      console.error('Erreur chargement rapprochements:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadJournals = async () => {
    try {
      const response = await bankReconciliationService.getReconciliations({ type: 'bank' });
      setJournals(response.data.data || []);
    } catch (error) {
      console.error('Erreur chargement journaux:', error);
    }
  };

  const handleCreate = () => {
    setSelectedReconciliation(null);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce rapprochement bancaire ?')) {
      try {
        await bankReconciliationService.deleteReconciliation(id);
        success('Rapprochement supprimé');
        loadReconciliations();
      } catch (err: any) {
        showError('Erreur suppression', err.response?.data?.error?.message || 'Erreur lors de la suppression');
      }
    }
  };

  const handleValidate = async (id: number) => {
    try {
      await bankReconciliationService.validateReconciliation(id);
      success('Rapprochement validé');
      loadReconciliations();
      if (selectedReconciliation?.id === id) {
        loadReconciliationDetails(id);
      }
    } catch (err: any) {
      showError('Erreur validation', err.response?.data?.error?.message || 'Erreur lors de la validation');
    }
  };

  const loadReconciliationDetails = async (id: number) => {
    try {
      const response = await bankReconciliationService.getReconciliation(id);
      setSelectedReconciliation(response.data.data);
      setShowForm(true);
    } catch (error) {
      console.error('Erreur chargement détails:', error);
    }
  };

  const handleAutoMatch = async (id: number) => {
    try {
      await bankReconciliationService.autoMatch(id);
      success('Lettrage automatique effectué');
      loadReconciliationDetails(id);
    } catch (err: any) {
      showError('Erreur lettrage', err.response?.data?.error?.message || 'Erreur lors du lettrage');
    }
  };


  if (showForm && selectedReconciliation) {
    return (
      <ReconciliationForm
        reconciliation={selectedReconciliation}
        onClose={() => {
          setShowForm(false);
          setSelectedReconciliation(null);
          loadReconciliations();
        }}
        onSave={loadReconciliations}
        onValidate={handleValidate}
        onAutoMatch={handleAutoMatch}
      />
    );
  }

  return (
    <div className="erp-layout">
      <ERPHeader
        title="Rapprochements Bancaires"
        breadcrumb={[{ label: 'Comptabilité', path: '/account-moves' }, { label: 'Rapprochements' }]}
        actions={
          <button onClick={handleCreate} className="erp-btn erp-btn-primary">
            <Plus size={16} style={{ marginRight: '4px' }} />
            Nouveau Rapprochement
          </button>
        }
      />

      <div className="erp-content">
        <div className="erp-tree-view">
          <table className="erp-tree-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Journal</th>
                <th>Date</th>
                <th>Solde début</th>
                <th>Solde fin</th>
                <th>Statut</th>
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
              ) : reconciliations.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--erp-text-muted)' }}>
                    Aucun rapprochement
                  </td>
                </tr>
              ) : (
                reconciliations.map(reconciliation => (
                  <tr key={reconciliation.id}>
                    <td>{reconciliation.name}</td>
                    <td>{reconciliation.journal_name}</td>
                    <td>{formatDate(reconciliation.date)}</td>
                    <td>{formatCurrency(reconciliation.balance_start)}</td>
                    <td>{formatCurrency(reconciliation.balance_end)}</td>
                    <td>
                      <span className={`erp-status-badge ${reconciliation.statut === 'validated' ? 'done' : 'draft'}`}>
                        {formatState(reconciliation.statut).label}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          onClick={() => loadReconciliationDetails(reconciliation.id)}
                          className="erp-btn erp-btn-outline"
                          style={{ padding: '4px 8px' }}
                        >
                          <FileText size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(reconciliation.id)}
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
const ReconciliationForm: React.FC<{
  reconciliation: Reconciliation;
  onClose: () => void;
  onSave: () => void;
  onValidate: (id: number) => void;
  onAutoMatch: (id: number) => void;
}> = ({ reconciliation, onClose, onSave, onValidate, onAutoMatch }) => {
  const [lines, setLines] = useState<ReconciliationLine[]>(reconciliation.lines || []);
  const [unmatchedLines, setUnmatchedLines] = useState<ReconciliationLine[]>([]);

  useEffect(() => {
    loadUnmatchedLines();
  }, []);

  const loadUnmatchedLines = async () => {
    try {
      const response = await bankReconciliationService.getUnmatchedLines(reconciliation.id);
      setUnmatchedLines(response.data.data || []);
    } catch (error) {
      console.error('Erreur chargement lignes non rapprochées:', error);
    }
  };

  const handleMatch = (lineId: number, matchedLineId: number) => {
    // Logique de lettrage manuel
    console.log('Lettrage:', lineId, matchedLineId);
  };

  const totalDebit = lines.reduce((sum, line) => sum + (line.debit || 0), 0);
  const totalCredit = lines.reduce((sum, line) => sum + (line.credit || 0), 0);
  const balance = totalDebit - totalCredit;

  return (
    <div className="erp-layout">
      <ERPHeader
        title={`Rapprochement ${reconciliation.name}`}
        breadcrumb={[
          { label: 'Comptabilité' },
          { label: 'Rapprochements' },
          { label: reconciliation.name }
        ]}
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => onAutoMatch(reconciliation.id)}
              className="erp-btn erp-btn-outline"
            >
              <LinkIcon size={16} style={{ marginRight: '4px' }} />
              Lettrage Auto
            </button>
            <button onClick={onClose} className="erp-btn erp-btn-outline">
              Fermer
            </button>
            {reconciliation.statut !== 'validated' && (
              <button
                onClick={() => onValidate(reconciliation.id)}
                className="erp-btn erp-btn-success"
              >
                <CheckCircle size={16} style={{ marginRight: '4px' }} />
                Valider
              </button>
            )}
          </div>
        }
      />

      <div className="erp-content">
        <ERPStatusbar
          status={{
            label: reconciliation.statut === 'validated' ? 'Validé' : 'Brouillon',
            value: reconciliation.statut,
            color: reconciliation.statut === 'validated' ? 'done' : 'draft'
          }}
          info={
            <div style={{ display: 'flex', gap: '16px', fontSize: '14px' }}>
              <span>Solde début: <strong>{reconciliation.balance_start.toFixed(2)} TND</strong></span>
              <span>Solde calculé: <strong>{balance.toFixed(2)} TND</strong></span>
              <span>Solde fin: <strong>{reconciliation.balance_end.toFixed(2)} TND</strong></span>
            </div>
          }
        />

        <div className="erp-form-view">
          <ERPNotebook
            tabs={[
              {
                label: 'Lignes rapprochées',
                content: (
                  <div>
                    <div className="erp-tree-view">
                      <table className="erp-tree-table">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Libellé</th>
                            <th>Débit</th>
                            <th>Crédit</th>
                            <th>Lettrage</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {lines.map(line => (
                            <tr key={line.id}>
                              <td>{new Date(line.date).toLocaleDateString()}</td>
                              <td>{line.name}</td>
                              <td>{line.debit?.toFixed(2) || '0.00'} TND</td>
                              <td>{line.credit?.toFixed(2) || '0.00'} TND</td>
                              <td>
                                {line.reconciled ? (
                                  <CheckCircle size={16} style={{ color: 'var(--erp-success)' }} />
                                ) : (
                                  <XCircle size={16} style={{ color: 'var(--erp-text-muted)' }} />
                                )}
                              </td>
                              <td>
                                {!line.reconciled && (
                                  <button
                                    onClick={() => handleMatch(line.id, 0)}
                                    className="erp-btn erp-btn-outline"
                                    style={{ padding: '4px 8px' }}
                                  >
                                    <LinkIcon size={14} />
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )
              },
              {
                label: 'Lignes non rapprochées',
                content: (
                  <div>
                    <div className="erp-tree-view">
                      <table className="erp-tree-table">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Libellé</th>
                            <th>Débit</th>
                            <th>Crédit</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {unmatchedLines.map(line => (
                            <tr key={line.id}>
                              <td>{new Date(line.date).toLocaleDateString()}</td>
                              <td>{line.name}</td>
                              <td>{line.debit?.toFixed(2) || '0.00'} TND</td>
                              <td>{line.credit?.toFixed(2) || '0.00'} TND</td>
                              <td>
                                <button
                                  onClick={() => handleMatch(0, line.id)}
                                  className="erp-btn erp-btn-primary"
                                  style={{ padding: '4px 8px' }}
                                >
                                  <LinkIcon size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
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

export default BankReconciliationERP;
