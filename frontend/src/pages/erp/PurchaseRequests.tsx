/**
 * PurchaseRequestsERP - Demandes d'Achat
 * Module complet avec workflow d'approbation
 */

import React, { useState, useEffect } from 'react';
import { FileText, Plus, Edit, Trash2, CheckCircle, XCircle, Eye, Search, Filter } from 'lucide-react';
import api from '../../services/api';
import { purchaseRequestsService } from '../../services/api';
import { ERPHeader, ERPStatusbar, ERPNotebook, ERPChatter, ERPButtonBox, useNotifications } from '../../components/erp';
import KanbanView from '../../components/erp/KanbanView';
import { displayMany2One, formatDate, formatCurrency, formatState } from '../../utils/relations';
import { validateForm, commonRules } from '../../utils/validation';

interface PurchaseRequest {
  id_demande: number;
  numero_demande: string;
  date_demande: string;
  statut: 'brouillon' | 'en_attente' | 'approuve' | 'rejete' | 'commande' | 'recu';
  motif: string;
  montant_total: number;
  demandeur_nom: string;
  validateur_nom?: string;
  date_besoin?: string;
  notes?: string;
  lignes?: any[];
}

const PurchaseRequestsERP: React.FC = () => {
  const { success, error } = useNotifications();
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState<'list' | 'kanban' | 'form'>('list');
  const [selectedRequest, setSelectedRequest] = useState<PurchaseRequest | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  useEffect(() => {
    loadRequests();
  }, [search, filterStatus]);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const params: any = { loadRelations: true };
      if (search) params.search = search;
      if (filterStatus) params.statut = filterStatus;

      const response = await purchaseRequestsService.getRequests(params);
      setRequests(response.data.data || []);
    } catch (error) {
      console.error('Erreur chargement demandes:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRequestDetails = async (id: number) => {
    try {
      const response = await purchaseRequestsService.getRequest(id, { loadRelations: true });
      setSelectedRequest(response.data.data);
      setShowForm(true);
      setViewType('form');
    } catch (error) {
      console.error('Erreur chargement détails:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette demande d\'achat ?')) {
      try {
        await purchaseRequestsService.deleteRequest(id);
        success('Demande supprimée avec succès');
        loadRequests();
      } catch (err: any) {
        error('Erreur suppression', err.response?.data?.error?.message || 'Erreur lors de la suppression');
      }
    }
  };

  const handleValidate = async (id: number) => {
    try {
      await purchaseRequestsService.validateRequest(id);
      success('Demande approuvée avec succès');
      loadRequests();
      if (selectedRequest?.id_demande === id) {
        loadRequestDetails(id);
      }
    } catch (err: any) {
      error('Erreur validation', err.response?.data?.error?.message || 'Erreur lors de la validation');
    }
  };

  const handleCreate = () => {
    setSelectedRequest(null);
    setShowForm(true);
    setViewType('form');
  };

  const getStatusColor = (statut: string) => {
    const colors: Record<string, string> = {
      brouillon: 'draft',
      en_attente: 'confirmed',
      approuve: 'done',
      rejete: 'cancelled',
      commande: 'done',
      recu: 'done'
    };
    return colors[statut] || 'draft';
  };

  const getStatusLabel = (statut: string) => {
    const labels: Record<string, string> = {
      brouillon: 'Brouillon',
      en_attente: 'En attente',
      approuve: 'Approuvé',
      rejete: 'Rejeté',
      commande: 'Commandé',
      recu: 'Reçu'
    };
    return labels[statut] || statut;
  };

  const kanbanColumns = [
    {
      id: 'brouillon',
      title: 'Brouillon',
      items: requests.filter(r => r.statut === 'brouillon')
    },
    {
      id: 'en_attente',
      title: 'En attente',
      items: requests.filter(r => r.statut === 'en_attente')
    },
    {
      id: 'approuve',
      title: 'Approuvé',
      items: requests.filter(r => r.statut === 'approuve')
    },
    {
      id: 'commande',
      title: 'Commandé',
      items: requests.filter(r => r.statut === 'commande')
    }
  ];

  const addNotification = (message: string, type: 'success' | 'error' | 'info') => {
    console.log(`${type}: ${message}`);
  };

  if (viewType === 'form' && showForm) {
    return (
      <PurchaseRequestForm
        request={selectedRequest}
        onClose={() => {
          setShowForm(false);
          setViewType('list');
          loadRequests();
        }}
        onSave={loadRequests}
      />
    );
  }

  return (
    <div className="erp-layout">
      <ERPHeader
        title="Demandes d'Achat"
        breadcrumb={[{ label: 'Achats', path: '/purchase-orders' }, { label: 'Demandes d\'Achat' }]}
        actions={
          <button onClick={handleCreate} className="erp-btn erp-btn-primary">
            <Plus size={16} style={{ marginRight: '4px' }} />
            Nouvelle Demande
          </button>
        }
      />

      <div className="erp-content">
        {/* Barre de recherche et filtres */}
        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          marginBottom: '16px',
          alignItems: 'center'
        }}>
          <div style={{ flex: 1, display: 'flex', gap: '8px' }}>
            <Search size={20} style={{ color: 'var(--erp-text-muted)' }} />
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="erp-field-input"
              style={{ flex: 1 }}
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="erp-field-input"
            style={{ width: '200px' }}
          >
            <option value="">Tous les statuts</option>
            <option value="brouillon">Brouillon</option>
            <option value="en_attente">En attente</option>
            <option value="approuve">Approuvé</option>
            <option value="rejete">Rejeté</option>
            <option value="commande">Commandé</option>
            <option value="recu">Reçu</option>
          </select>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              onClick={() => setViewType('list')}
              className={`erp-btn ${viewType === 'list' ? 'erp-btn-primary' : 'erp-btn-outline'}`}
            >
              Liste
            </button>
            <button
              onClick={() => setViewType('kanban')}
              className={`erp-btn ${viewType === 'kanban' ? 'erp-btn-primary' : 'erp-btn-outline'}`}
            >
              Kanban
            </button>
          </div>
        </div>

        {viewType === 'kanban' ? (
          <KanbanView
            columns={kanbanColumns}
            onItemClick={(item) => loadRequestDetails(item.id_demande)}
            onItemMove={async (itemId, fromColumn, toColumn) => {
              // Mettre à jour le statut
              const newStatus = toColumn;
              try {
                // itemId est une string (draggableId), on doit trouver l'item correspondant
                const request = requests.find(r => r.id_demande.toString() === itemId.toString());
                if (request) {
                  await purchaseRequestsService.updateRequest(request.id_demande, { statut: newStatus });
                }
                loadRequests();
              } catch (error) {
                console.error('Erreur mise à jour statut:', error);
              }
            }}
            renderItem={(item) => (
              <div>
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                  {item.numero_demande}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--erp-text-secondary)', marginBottom: '8px' }}>
                  {item.motif}
                </div>
                <div style={{ fontWeight: 600, color: 'var(--erp-primary)' }}>
                  {item.montant_total?.toFixed(2) || '0.00'} TND
                </div>
                <div style={{ fontSize: '11px', color: 'var(--erp-text-muted)', marginTop: '4px' }}>
                  {item.demandeur_nom}
                </div>
              </div>
            )}
          />
        ) : (
          <div className="erp-tree-view">
            <table className="erp-tree-table">
              <thead>
                <tr>
                  <th>Numéro</th>
                  <th>Date</th>
                  <th>Motif</th>
                  <th>Demandeur</th>
                  <th>Montant</th>
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
                ) : requests.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--erp-text-muted)' }}>
                      Aucune demande d'achat
                    </td>
                  </tr>
                ) : (
                  requests.map(request => (
                    <tr key={request.id_demande}>
                      <td>{request.numero_demande}</td>
                      <td>{formatDate(request.date_demande)}</td>
                      <td>{request.motif}</td>
                      <td>{request.demandeur_nom}</td>
                      <td>{formatCurrency(request.montant_total)}</td>
                      <td>
                        <span className={`erp-status-badge ${getStatusColor(request.statut)}`}>
                          {getStatusLabel(request.statut)}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            onClick={() => loadRequestDetails(request.id_demande)}
                            className="erp-btn erp-btn-outline"
                            style={{ padding: '4px 8px' }}
                            title="Voir/Modifier"
                          >
                            <Eye size={14} />
                          </button>
                          {request.statut === 'brouillon' && (
                            <button
                              onClick={() => handleDelete(request.id_demande)}
                              className="erp-btn erp-btn-danger"
                              style={{ padding: '4px 8px' }}
                              title="Supprimer"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                          {request.statut === 'en_attente' && (
                            <button
                              onClick={() => handleValidate(request.id_demande)}
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
const PurchaseRequestForm: React.FC<{
  request: PurchaseRequest | null;
  onClose: () => void;
  onSave: () => void;
}> = ({ request, onClose, onSave }) => {
  const { success, error } = useNotifications();
  const [formData, setFormData] = useState({
    motif: request?.motif || '',
    date_besoin: request?.date_besoin || '',
    notes: request?.notes || ''
  });
  const [lignes, setLignes] = useState<any[]>(request?.lignes || []);
  const [products, setProducts] = useState<any[]>([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadProducts();
    if (request?.id_demande) {
      loadLignes();
    }
  }, [request]);

  const loadProducts = async () => {
    try {
      const response = await api.get('/product/templates');
      setProducts(Array.isArray(response.data) ? response.data : (response.data?.data || []));
    } catch (error) {
      console.error('Erreur chargement produits:', error);
    }
  };

  const loadLignes = async () => {
    try {
      const response = await purchaseRequestsService.getRequestLines(request?.id_demande || 0);
      setLignes(response.data.data || []);
    } catch (error) {
      console.error('Erreur chargement lignes:', error);
    }
  };

  const handleSave = async () => {
    const validation = validateForm(formData, {
      motif: { ...commonRules.required }
    });
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      error('Erreur de validation', 'Veuillez corriger les erreurs dans le formulaire');
      return;
    }
    
    setErrors({});
    
    try {
      if (request?.id_demande) {
        await purchaseRequestsService.updateRequest(request.id_demande || 0, {
          ...formData,
          lignes
        });
      } else {
        await purchaseRequestsService.createRequest({
          ...formData,
          lignes
        });
      }
      success('Demande enregistrée avec succès');
      onSave();
      onClose();
    } catch (err: any) {
      error('Erreur enregistrement', err.response?.data?.error?.message || 'Erreur lors de l\'enregistrement');
    }
  };

  const total = lignes.reduce((sum, ligne) => sum + (ligne.prix_unitaire * ligne.quantite), 0);

  return (
    <div className="erp-layout">
      <ERPHeader
        title={request ? `Demande ${request.numero_demande}` : 'Nouvelle Demande d\'Achat'}
        breadcrumb={[
          { label: 'Achats' },
          { label: 'Demandes d\'Achat' },
          { label: request ? request.numero_demande : 'Nouvelle' }
        ]}
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={onClose} className="erp-btn erp-btn-outline">
              Annuler
            </button>
            <button onClick={handleSave} className="erp-btn erp-btn-primary">
              Enregistrer
            </button>
          </div>
        }
      />

      <div className="erp-content">
        {request && (
          <ERPStatusbar
            status={{
              label: getStatusLabel(request.statut),
              value: request.statut,
              color: getStatusColor(request.statut) as any
            }}
            workflow={[
              { label: 'Brouillon', value: 'brouillon', color: 'draft' },
              { label: 'En attente', value: 'en_attente', color: 'confirmed' },
              { label: 'Approuvé', value: 'approuve', color: 'done' },
              { label: 'Commandé', value: 'commande', color: 'done' }
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
                      <label className="erp-field-label erp-field-required">Motif</label>
                      <input
                        type="text"
                        value={formData.motif}
                        onChange={(e) => {
                          setFormData({ ...formData, motif: e.target.value });
                          if (errors.motif) setErrors({ ...errors, motif: '' });
                        }}
                        className={`erp-field-input ${errors.motif ? 'erp-field-error' : ''}`}
                        placeholder="Motif de la demande..."
                      />
                      {errors.motif && <span className="erp-field-error-text">{errors.motif}</span>}
                    </div>
                    <div className="erp-field">
                      <label className="erp-field-label">Date de besoin</label>
                      <input
                        type="date"
                        value={formData.date_besoin}
                        onChange={(e) => setFormData({ ...formData, date_besoin: e.target.value })}
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
                label: 'Lignes',
                content: (
                  <div>
                    <ERPButtonBox>
                      <button
                        onClick={() => setShowProductModal(true)}
                        className="erp-btn erp-btn-primary"
                      >
                        <Plus size={16} style={{ marginRight: '4px' }} />
                        Ajouter un produit
                      </button>
                    </ERPButtonBox>

                    <div className="erp-tree-view" style={{ marginTop: '16px' }}>
                      <table className="erp-tree-table">
                        <thead>
                          <tr>
                            <th>Produit</th>
                            <th>Quantité</th>
                            <th>Prix unitaire</th>
                            <th>Total</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {lignes.map((ligne, index) => (
                            <tr key={index}>
                              <td>{ligne.product_name || 'Produit'}</td>
                              <td>{ligne.quantite}</td>
                              <td>{ligne.prix_unitaire?.toFixed(2)} TND</td>
                              <td>{(ligne.prix_unitaire * ligne.quantite).toFixed(2)} TND</td>
                              <td>
                                <button
                                  onClick={() => setLignes(lignes.filter((_, i) => i !== index))}
                                  className="erp-btn erp-btn-danger"
                                  style={{ padding: '4px 8px' }}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                          {lignes.length === 0 && (
                            <tr>
                              <td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: 'var(--erp-text-muted)' }}>
                                Aucune ligne. Cliquez sur "Ajouter un produit" pour commencer.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    <div style={{ marginTop: '16px', textAlign: 'right', fontSize: '18px', fontWeight: 600 }}>
                      Total: {total.toFixed(2)} TND
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

const getStatusColor = (statut: string) => {
  const colors: Record<string, string> = {
    brouillon: 'draft',
    en_attente: 'confirmed',
    approuve: 'done',
    rejete: 'cancelled',
    commande: 'done',
    recu: 'done'
  };
  return colors[statut] || 'draft';
};

const getStatusLabel = (statut: string) => {
  const labels: Record<string, string> = {
    brouillon: 'Brouillon',
    en_attente: 'En attente',
    approuve: 'Approuvé',
    rejete: 'Rejeté',
    commande: 'Commandé',
    recu: 'Reçu'
  };
  return labels[statut] || statut;
};

export default PurchaseRequestsERP;
