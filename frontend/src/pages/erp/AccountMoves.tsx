/**
 * AccountMovesERP - Écritures Comptables
 * Version complète avec design ERP et langue française
 */

import React, { useEffect, useState } from 'react';
import { accountMovesService } from '../../services/api';
import { ERPHeader, ERPStatusbar, ERPNotebook, ERPChatter, ERPButtonBox, useNotifications } from '../../components/erp';
import { displayMany2One, formatDate, formatCurrency, formatState } from '../../utils/relations';
import { validateForm, commonRules } from '../../utils/validation';
import { Plus, Edit, Trash2, Eye, CheckCircle, Receipt, Search } from 'lucide-react';

interface AccountMove {
  id: number;
  name: string;
  date: string;
  partner_id?: any;
  move_type: 'out_invoice' | 'out_refund' | 'in_invoice' | 'in_refund' | 'entry';
  amount_total: number;
  state: 'draft' | 'posted' | 'cancel';
  line_ids?: any[];
}

const AccountMovesERP: React.FC = () => {
  const { success, error: showError } = useNotifications();
  const [moves, setMoves] = useState<AccountMove[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState<'list' | 'form'>('list');
  const [search, setSearch] = useState('');
  const [selectedMove, setSelectedMove] = useState<AccountMove | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadMoves();
  }, [search]);

  const loadMoves = async () => {
    setLoading(true);
    try {
      const params: any = { loadRelations: true };
      if (search) params.search = search;
      const response = await accountMovesService.getMoves(params);
      const data = Array.isArray(response.data) ? response.data : response.data.data || [];
      setMoves(data);
    } catch (error) {
      console.error('Erreur chargement écritures:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedMove(null);
    setShowForm(true);
    setViewType('form');
  };

  const handleEdit = (move: AccountMove) => {
    setSelectedMove(move);
    setShowForm(true);
    setViewType('form');
  };

  const handleSave = async (formData: any) => {
    // Validation
    const rules = {
      name: commonRules.required,
      date: commonRules.required
    };
    const validation = validateForm(formData, rules);
    if (!validation.isValid) {
      showError('Erreur de validation', Object.values(validation.errors)[0]);
      return;
    }

    try {
      if (selectedMove?.id) {
        await accountMovesService.updateMove(selectedMove.id, formData);
        success('Écriture modifiée', 'Les modifications ont été enregistrées');
      } else {
        await accountMovesService.createMove(formData);
        success('Écriture créée', 'L\'écriture comptable a été créée avec succès');
      }
      setShowForm(false);
      setSelectedMove(null);
      setViewType('list');
      loadMoves();
    } catch (error: any) {
      showError('Erreur', error.response?.data?.error?.message || 'Erreur lors de l\'enregistrement');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette écriture comptable ?')) {
      try {
        await accountMovesService.deleteAccountMove(id);
        success('Écriture supprimée', 'L\'écriture comptable a été supprimée avec succès');
        loadMoves();
      } catch (error: any) {
        showError('Erreur', error.response?.data?.error?.message || 'Erreur lors de la suppression');
      }
    }
  };

  const handlePost = async (id: number) => {
    try {
      await accountMovesService.postMove(id);
      success('Écriture comptabilisée', 'L\'écriture a été comptabilisée avec succès');
      loadMoves();
      if (selectedMove?.id === id) {
        loadMoveDetails(id);
      }
    } catch (error: any) {
      showError('Erreur', error.response?.data?.error?.message || 'Erreur lors de la comptabilisation');
    }
  };

  const loadMoveDetails = async (id: number) => {
    try {
      const response = await accountMovesService.getMove(id);
      setSelectedMove(response.data);
    } catch (error) {
      console.error('Erreur chargement détails:', error);
    }
  };

  const getMoveTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      out_invoice: 'Facture Client',
      out_refund: 'Avoir Client',
      in_invoice: 'Facture Fournisseur',
      in_refund: 'Avoir Fournisseur',
      entry: 'Écriture'
    };
    return labels[type] || type;
  };

  const getStatusColor = (state: string) => {
    const colors: Record<string, string> = {
      draft: 'draft',
      posted: 'done',
      cancel: 'cancelled'
    };
    return colors[state] || 'draft';
  };

  const getStatusLabel = (state: string) => {
    const labels: Record<string, string> = {
      draft: 'Brouillon',
      posted: 'Comptabilisé',
      cancel: 'Annulé'
    };
    return labels[state] || state;
  };

  if (showForm) {
    return (
      <AccountMoveForm
        move={selectedMove}
        onClose={() => {
          setShowForm(false);
          setSelectedMove(null);
          setViewType('list');
          loadMoves();
        }}
        onSave={handleSave}
        onPost={selectedMove?.id ? () => handlePost(selectedMove.id) : undefined}
      />
    );
  }

  return (
    <div className="erp-layout">
      <ERPHeader
        title="Écritures Comptables"
        breadcrumb={[
          { label: 'Comptabilité' },
          { label: 'Écritures' }
        ]}
        actions={
          <button onClick={handleCreate} className="erp-btn erp-btn-primary">
            <Plus size={16} style={{ marginRight: '4px' }} />
            Nouvelle Écriture
          </button>
        }
      />

      <div className="erp-content">
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <div style={{ flex: 1, display: 'flex', gap: '8px' }}>
            <Search size={20} style={{ color: 'var(--erp-text-muted)' }} />
            <input
              type="text"
              placeholder="Rechercher une écriture..."
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
                <th>Date</th>
                <th>Partenaire</th>
                <th>Type</th>
                <th>Montant</th>
                <th>État</th>
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
              ) : moves.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--erp-text-muted)' }}>
                    Aucune écriture
                  </td>
                </tr>
              ) : (
                moves.map(move => (
                  <tr key={move.id}>
                    <td>{move.name}</td>
                    <td>{formatDate(move.date)}</td>
                    <td>{displayMany2One(move.partner_id)}</td>
                    <td>{getMoveTypeLabel(move.move_type)}</td>
                    <td>{formatCurrency(move.amount_total)}</td>
                    <td>
                      <span className={`erp-status-badge ${getStatusColor(move.state)}`}>
                        {getStatusLabel(move.state)}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          onClick={() => handleEdit(move)}
                          className="erp-btn erp-btn-outline"
                          style={{ padding: '4px 8px' }}
                          title="Voir/Modifier"
                        >
                          <Eye size={14} />
                        </button>
                        {move.state === 'draft' && (
                          <button
                            onClick={() => handleDelete(move.id)}
                            className="erp-btn erp-btn-danger"
                            style={{ padding: '4px 8px' }}
                            title="Supprimer"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
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
const AccountMoveForm: React.FC<{
  move: AccountMove | null;
  onClose: () => void;
  onSave: (data: any) => void;
  onPost?: () => void;
}> = ({ move, onClose, onSave, onPost }) => {
  const [formData, setFormData] = useState({
    name: move?.name || '',
    date: move?.date || new Date().toISOString().split('T')[0],
    partner_id: move?.partner_id || null,
    move_type: move?.move_type || 'out_invoice',
    notes: ''
  });
  const [lines, setLines] = useState<any[]>(move?.line_ids || []);

  useEffect(() => {
    if (move?.id) {
      loadMoveLines();
    }
  }, [move?.id]);

  const loadMoveLines = async () => {
    if (!move?.id) return;
    try {
      const response = await accountMovesService.getMove(move.id);
      setLines(response.data?.line_ids || []);
    } catch (error) {
      console.error('Erreur chargement lignes:', error);
    }
  };

  const handleSaveClick = () => {
    onSave({ ...formData, line_ids: lines });
  };

  return (
    <div className="erp-layout">
      <ERPHeader
        title={move ? `Écriture ${move.name}` : 'Nouvelle Écriture Comptable'}
        breadcrumb={[
          { label: 'Comptabilité' },
          { label: 'Écritures' },
          { label: move ? move.name : 'Nouvelle' }
        ]}
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={onClose} className="erp-btn erp-btn-outline">
              Annuler
            </button>
            <button onClick={handleSaveClick} className="erp-btn erp-btn-primary">
              Enregistrer
            </button>
            {onPost && move?.state === 'draft' && (
              <button onClick={onPost} className="erp-btn erp-btn-success">
                <CheckCircle size={16} style={{ marginRight: '4px' }} />
                Comptabiliser
              </button>
            )}
          </div>
        }
      />

      <div className="erp-content">
        {move && (
          <ERPStatusbar
            status={{
              label: getStatusLabel(move.state),
              value: move.state,
              color: getStatusColor(move.state) as any
            }}
            workflow={[
              { label: 'Brouillon', value: 'draft', color: 'draft' },
              { label: 'Comptabilisé', value: 'posted', color: 'done' }
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
                      <label className="erp-field-label">Référence</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="erp-field-input"
                        placeholder="Référence automatique..."
                        readOnly={!!move}
                      />
                    </div>
                    <div className="erp-field">
                      <label className="erp-field-label erp-field-required">Date</label>
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="erp-field-input"
                      />
                    </div>
                    <div className="erp-field">
                      <label className="erp-field-label">Type</label>
                      <select
                        value={formData.move_type}
                        onChange={(e) => setFormData({ ...formData, move_type: e.target.value as any })}
                        className="erp-field-input"
                        disabled={!!move}
                      >
                        <option value="out_invoice">Facture Client</option>
                        <option value="out_refund">Avoir Client</option>
                        <option value="in_invoice">Facture Fournisseur</option>
                        <option value="in_refund">Avoir Fournisseur</option>
                        <option value="entry">Écriture</option>
                      </select>
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
                label: 'Lignes comptables',
                content: (
                  <div>
                    <ERPButtonBox>
                      <button
                        onClick={() => {
                          setLines([...lines, {
                            account_id: null,
                            debit: 0,
                            credit: 0,
                            name: ''
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
                            <th>Compte</th>
                            <th>Libellé</th>
                            <th>Débit</th>
                            <th>Crédit</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {lines.map((line, index) => (
                            <tr key={index}>
                              <td>{line.account_id?.[1] || '-'}</td>
                              <td>{line.name || '-'}</td>
                              <td>{line.debit?.toFixed(2) || '0.00'} TND</td>
                              <td>{line.credit?.toFixed(2) || '0.00'} TND</td>
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

                    <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 600 }}>
                      <span>Total Débit: {lines.reduce((sum, l) => sum + (l.debit || 0), 0).toFixed(2)} TND</span>
                      <span>Total Crédit: {lines.reduce((sum, l) => sum + (l.credit || 0), 0).toFixed(2)} TND</span>
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
    posted: 'done',
    cancel: 'cancelled'
  };
  return colors[state] || 'draft';
};

const getStatusLabel = (state: string) => {
  const labels: Record<string, string> = {
    draft: 'Brouillon',
    posted: 'Comptabilisé',
    cancel: 'Annulé'
  };
  return labels[state] || state;
};

export default AccountMovesERP;
