/**
 * StockPickingsOdoo - Livraisons/Réceptions
 * Version complète avec design Odoo moderne
 */

import React, { useEffect, useState } from 'react';
import { stockPickingsService } from '../../services/api';
import { ERPHeader, ERPStatusbar, ERPNotebook, ERPChatter, ERPButtonBox } from '../../components/erp';
import KanbanView from '../../components/erp/KanbanView';
import { displayMany2One, formatDate, formatCurrency, formatState } from '../../utils/relations';
import { Plus, Edit, Trash2, Eye, CheckCircle, Truck, Package, Search, List, Grid } from 'lucide-react';

interface StockPicking {
  id: number;
  name: string;
  picking_type_id?: any;
  partner_id?: any;
  date: string;
  state: 'draft' | 'assigned' | 'done' | 'cancel';
  move_ids?: any[];
}

const StockPickingsOdoo: React.FC = () => {
  const [pickings, setPickings] = useState<StockPicking[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState<'list' | 'kanban' | 'form'>('list');
  const [search, setSearch] = useState('');
  const [selectedPicking, setSelectedPicking] = useState<StockPicking | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadPickings();
  }, [search]);

  const loadPickings = async () => {
    setLoading(true);
    try {
      const params: any = { loadRelations: true };
      if (search) params.search = search;
      const response = await stockPickingsService.getPickings(params);
      const data = Array.isArray(response.data) ? response.data : response.data.data || [];
      setPickings(data);
    } catch (error) {
      console.error('Erreur chargement livraisons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedPicking(null);
    setShowForm(true);
    setViewType('form');
  };

  const handleEdit = (picking: StockPicking) => {
    setSelectedPicking(picking);
    setShowForm(true);
    setViewType('form');
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette livraison/réception ?')) {
      try {
        await stockPickingsService.deletePicking(id);
        loadPickings();
      } catch (error: any) {
        alert(error.response?.data?.error?.message || 'Erreur lors de la suppression');
      }
    }
  };

  const handleValidate = async (id: number) => {
    try {
      await stockPickingsService.validatePicking(id);
      loadPickings();
      if (selectedPicking?.id === id) {
        loadPickingDetails(id);
      }
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'Erreur lors de la validation');
    }
  };

  const loadPickingDetails = async (id: number) => {
    try {
      const response = await stockPickingsService.getPicking(id);
      setSelectedPicking(response.data);
    } catch (error) {
      console.error('Erreur chargement détails:', error);
    }
  };

  const getStatusColor = (state: string) => {
    const colors: Record<string, string> = {
      draft: 'draft',
      assigned: 'confirmed',
      done: 'done',
      cancel: 'cancelled'
    };
    return colors[state] || 'draft';
  };

  const getStatusLabel = (state: string) => {
    const labels: Record<string, string> = {
      draft: 'Brouillon',
      assigned: 'Disponible',
      done: 'Terminé',
      cancel: 'Annulé'
    };
    return labels[state] || state;
  };

  const kanbanColumns = [
    {
      id: 'draft',
      title: 'Brouillon',
      items: pickings.filter(p => p.state === 'draft')
    },
    {
      id: 'assigned',
      title: 'Disponible',
      items: pickings.filter(p => p.state === 'assigned')
    },
    {
      id: 'done',
      title: 'Terminé',
      items: pickings.filter(p => p.state === 'done')
    }
  ];

  if (showForm) {
    return (
      <StockPickingForm
        picking={selectedPicking}
        onClose={() => {
          setShowForm(false);
          setSelectedPicking(null);
          setViewType('list');
          loadPickings();
        }}
        onSave={loadPickings}
        onValidate={selectedPicking?.id ? () => handleValidate(selectedPicking.id) : undefined}
      />
    );
  }

  return (
    <div className="erp-layout">
      <ERPHeader
        title="Livraisons/Réceptions"
        breadcrumb={[
          { label: 'Stock' },
          { label: 'Livraisons' }
        ]}
        actions={
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                onClick={() => setViewType('list')}
                className={`erp-btn ${viewType === 'list' ? 'erp-btn-primary' : 'erp-btn-outline'}`}
                style={{ padding: '8px 12px' }}
              >
                <List size={16} />
              </button>
              <button
                onClick={() => setViewType('kanban')}
                className={`erp-btn ${viewType === 'kanban' ? 'erp-btn-primary' : 'erp-btn-outline'}`}
                style={{ padding: '8px 12px' }}
              >
                <Grid size={16} />
              </button>
            </div>
            <button onClick={handleCreate} className="erp-btn erp-btn-primary">
              <Plus size={16} style={{ marginRight: '4px' }} />
              Nouvelle Livraison
            </button>
          </div>
        }
      />

      <div className="erp-content">
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <div style={{ flex: 1, display: 'flex', gap: '8px' }}>
            <Search size={20} style={{ color: 'var(--erp-text-muted)' }} />
            <input
              type="text"
              placeholder="Rechercher une livraison..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="erp-field-input"
              style={{ flex: 1 }}
            />
          </div>
        </div>

        {viewType === 'kanban' ? (
          <KanbanView
            columns={kanbanColumns}
            onItemClick={(item) => handleEdit(item)}
            renderItem={(item) => (
              <div>
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                  {item.name}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--erp-text-secondary)', marginBottom: '8px' }}>
                  {item.partner_id?.[1] || 'Partenaire'}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--erp-text-muted)', marginTop: '4px' }}>
                  {new Date(item.date).toLocaleDateString()}
                </div>
              </div>
            )}
          />
        ) : (
          <div className="erp-tree-view">
            <table className="erp-tree-table">
              <thead>
                <tr>
                  <th>Référence</th>
                  <th>Type</th>
                  <th>Partenaire</th>
                  <th>Date</th>
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
                ) : pickings.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--erp-text-muted)' }}>
                      Aucune livraison
                    </td>
                  </tr>
                ) : (
                  pickings.map(picking => (
                    <tr key={picking.id}>
                      <td>{picking.name}</td>
                      <td>{displayMany2One(picking.picking_type_id)}</td>
                      <td>{displayMany2One(picking.partner_id)}</td>
                      <td>{formatDate(picking.date)}</td>
                      <td>
                        <span className={`erp-status-badge ${getStatusColor(picking.state)}`}>
                          {getStatusLabel(picking.state)}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            onClick={() => handleEdit(picking)}
                            className="erp-btn erp-btn-outline"
                            style={{ padding: '4px 8px' }}
                          >
                            <Eye size={14} />
                          </button>
                          {picking.state === 'draft' && (
                            <button
                              onClick={() => handleDelete(picking.id)}
                              className="erp-btn erp-btn-danger"
                              style={{ padding: '4px 8px' }}
                              title="Supprimer"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                          {picking.state === 'assigned' && (
                            <button
                              onClick={() => handleValidate(picking.id)}
                              className="erp-btn erp-btn-success"
                              style={{ padding: '4px 8px' }}
                              title="Valider"
                            >
                              <CheckCircle size={14} />
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
        )}
      </div>
    </div>
  );
};

// Composant Formulaire
const StockPickingForm: React.FC<{
  picking: StockPicking | null;
  onClose: () => void;
  onSave: () => void;
  onValidate?: () => void;
}> = ({ picking, onClose, onSave, onValidate }) => {
  const [formData, setFormData] = useState({
    picking_type_id: picking?.picking_type_id?.[0] || null,
    partner_id: picking?.partner_id?.[0] || null,
    date: picking?.date || new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [moves, setMoves] = useState<any[]>(picking?.move_ids || []);

  const handleSaveClick = async () => {
    try {
      if (picking?.id) {
        await stockPickingsService.updatePicking(picking.id, { ...formData, move_ids: moves });
      } else {
        await stockPickingsService.createPicking({ ...formData, move_ids: moves });
      }
      onSave();
      onClose();
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'Erreur lors de l\'enregistrement');
    }
  };

  return (
    <div className="erp-layout">
      <ERPHeader
        title={picking ? `Livraison ${picking.name}` : 'Nouvelle Livraison'}
        breadcrumb={[
          { label: 'Stock' },
          { label: 'Livraisons' },
          { label: picking ? picking.name : 'Nouvelle' }
        ]}
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={onClose} className="erp-btn erp-btn-outline">
              Annuler
            </button>
            <button onClick={handleSaveClick} className="erp-btn erp-btn-primary">
              Enregistrer
            </button>
            {onValidate && picking?.state === 'assigned' && (
              <button onClick={onValidate} className="erp-btn erp-btn-success">
                <CheckCircle size={16} style={{ marginRight: '4px' }} />
                Valider
              </button>
            )}
          </div>
        }
      />

      <div className="erp-content">
        {picking && (
          <ERPStatusbar
            status={{
              label: getStatusLabel(picking.state),
              value: picking.state,
              color: getStatusColor(picking.state) as any
            }}
            workflow={[
              { label: 'Brouillon', value: 'draft', color: 'draft' },
              { label: 'Disponible', value: 'assigned', color: 'confirmed' },
              { label: 'Terminé', value: 'done', color: 'done' }
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
                      <label className="erp-field-label">Date</label>
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="erp-field-input"
                      />
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
                label: 'Mouvements',
                content: (
                  <div>
                    <ERPButtonBox>
                      <button
                        onClick={() => {
                          setMoves([...moves, {
                            product_id: null,
                            quantity: 0,
                            location_id: null,
                            location_dest_id: null
                          }]);
                        }}
                        className="erp-btn erp-btn-primary"
                      >
                        <Plus size={16} style={{ marginRight: '4px' }} />
                        Ajouter un mouvement
                      </button>
                    </ERPButtonBox>

                    <div className="erp-tree-view" style={{ marginTop: '16px' }}>
                      <table className="erp-tree-table">
                        <thead>
                          <tr>
                            <th>Produit</th>
                            <th>Quantité</th>
                            <th>Emplacement source</th>
                            <th>Emplacement destination</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {moves.map((move, index) => (
                            <tr key={index}>
                              <td>{move.product_id?.[1] || '-'}</td>
                              <td>{move.quantity || 0}</td>
                              <td>{move.location_id?.[1] || '-'}</td>
                              <td>{move.location_dest_id?.[1] || '-'}</td>
                              <td>
                                <button
                                  onClick={() => setMoves(moves.filter((_, i) => i !== index))}
                                  className="erp-btn erp-btn-danger"
                                  style={{ padding: '4px 8px' }}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                          {moves.length === 0 && (
                            <tr>
                              <td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: 'var(--erp-text-muted)' }}>
                                Aucun mouvement. Cliquez sur "Ajouter un mouvement" pour commencer.
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
    assigned: 'confirmed',
    done: 'done',
    cancel: 'cancelled'
  };
  return colors[state] || 'draft';
};

const getStatusLabel = (state: string) => {
  const labels: Record<string, string> = {
    draft: 'Brouillon',
    assigned: 'Disponible',
    done: 'Terminé',
    cancel: 'Annulé'
  };
  return labels[state] || state;
};

export default StockPickingsOdoo;
