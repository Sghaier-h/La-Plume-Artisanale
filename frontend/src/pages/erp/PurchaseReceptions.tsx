/**
 * PurchaseReceptionsERP - Réceptions Fournisseurs
 * Module complet avec contrôle qualité
 */

import React, { useState, useEffect } from 'react';
import { Package, CheckCircle, XCircle, Truck, Search, Plus, Trash2, Eye } from 'lucide-react';
import { purchaseReceptionsService, purchaseOrdersService } from '../../services/api';
import { ERPHeader, ERPStatusbar, ERPNotebook, ERPChatter, useNotifications } from '../../components/erp';
import { displayMany2One, formatDate, formatCurrency, formatState } from '../../utils/relations';
import { validateForm, commonRules } from '../../utils/validation';

interface Reception {
  id_reception: number;
  numero_reception: string;
  id_commande_fournisseur: number;
  date_reception: string;
  statut: 'brouillon' | 'en_cours' | 'validee' | 'annulee';
  fournisseur_nom: string;
  lignes?: ReceptionLine[];
}

interface ReceptionLine {
  id_ligne: number;
  id_product: number;
  product_name: string;
  quantite_commandee: number;
  quantite_recue: number;
  quantite_acceptee: number;
  quantite_rejetee: number;
  controle_qualite: 'en_attente' | 'accepte' | 'rejete';
}

const PurchaseReceptionsERP: React.FC = () => {
  const { success, error: showError } = useNotifications();
  const [receptions, setReceptions] = useState<Reception[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReception, setSelectedReception] = useState<Reception | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);

  useEffect(() => {
    loadReceptions();
    loadPurchaseOrders();
  }, [search]);

  const loadReceptions = async () => {
    setLoading(true);
    try {
      const params: any = { loadRelations: true };
      if (search) params.search = search;

      const response = await purchaseReceptionsService.getReceptions(params);
      setReceptions(response.data.data || []);
    } catch (error) {
      console.error('Erreur chargement réceptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPurchaseOrders = async () => {
    try {
      const response = await purchaseOrdersService.getOrders({ statut: 'confirmed' });
      setPurchaseOrders(response.data.data || []);
    } catch (error) {
      console.error('Erreur chargement commandes:', error);
    }
  };

  const createFromOrder = async (orderId: number) => {
    try {
      const response = await purchaseReceptionsService.createFromOrder(orderId);
      setSelectedReception(response.data.data);
      setShowForm(true);
      loadReceptions();
      success('Réception créée avec succès');
    } catch (err: any) {
      showError('Erreur création réception', err.response?.data?.error?.message || 'Erreur lors de la création');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette réception ?')) {
      try {
        await purchaseReceptionsService.deleteReception(id);
        success('Réception supprimée avec succès');
        loadReceptions();
      } catch (err: any) {
        showError('Erreur suppression', err.response?.data?.error?.message || 'Erreur lors de la suppression');
      }
    }
  };

  const handleValidate = async (id: number) => {
    try {
      await purchaseReceptionsService.validateReception(id);
      success('Réception validée avec succès');
      loadReceptions();
      if (selectedReception?.id_reception === id) {
        loadReceptionDetails(id);
      }
    } catch (err: any) {
      showError('Erreur validation', err.response?.data?.error?.message || 'Erreur lors de la validation');
    }
  };

  const loadReceptionDetails = async (id: number) => {
    try {
      const response = await purchaseReceptionsService.getReception(id);
      setSelectedReception(response.data.data);
      setShowForm(true);
    } catch (error) {
      console.error('Erreur chargement détails:', error);
    }
  };

  const getStatusColor = (statut: string) => {
    const colors: Record<string, string> = {
      brouillon: 'draft',
      en_cours: 'confirmed',
      validee: 'done',
      annulee: 'cancelled'
    };
    return colors[statut] || 'draft';
  };

  const getStatusLabel = (statut: string) => {
    const labels: Record<string, string> = {
      brouillon: 'Brouillon',
      en_cours: 'En cours',
      validee: 'Validée',
      annulee: 'Annulée'
    };
    return labels[statut] || statut;
  };

  const addNotification = (message: string, type: 'success' | 'error' | 'info') => {
    console.log(`${type}: ${message}`);
  };

  if (showForm && selectedReception) {
    return (
      <ReceptionForm
        reception={selectedReception}
        onClose={() => {
          setShowForm(false);
          setSelectedReception(null);
          loadReceptions();
        }}
        onSave={loadReceptions}
        onValidate={handleValidate}
      />
    );
  }

  return (
    <div className="erp-layout">
      <ERPHeader
        title="Réceptions Fournisseurs"
        breadcrumb={[{ label: 'Achats', path: '/purchase-orders' }, { label: 'Réceptions' }]}
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            {purchaseOrders.length > 0 && (
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    createFromOrder(parseInt(e.target.value));
                  }
                }}
                className="erp-btn erp-btn-outline"
                style={{ padding: '8px 16px' }}
                defaultValue=""
              >
                <option value="">Créer depuis commande...</option>
                {purchaseOrders.map(order => (
                  <option key={order.id} value={order.id}>
                    {order.name} - {order.partner_id?.[1] || 'Fournisseur'}
                  </option>
                ))}
              </select>
            )}
          </div>
        }
      />

      <div className="erp-content">
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
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
        </div>

        <div className="erp-tree-view">
          <table className="erp-tree-table">
            <thead>
              <tr>
                <th>Numéro</th>
                <th>Date</th>
                <th>Fournisseur</th>
                <th>Commande</th>
                <th>Statut</th>
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
              ) : receptions.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--erp-text-muted)' }}>
                    Aucune réception
                  </td>
                </tr>
              ) : (
                receptions.map(reception => (
                  <tr key={reception.id_reception}>
                    <td>{reception.numero_reception}</td>
                    <td>{new Date(reception.date_reception).toLocaleDateString()}</td>
                    <td>{reception.fournisseur_nom}</td>
                    <td>CMD-{reception.id_commande_fournisseur}</td>
                    <td>
                      <span className={`erp-status-badge ${getStatusColor(reception.statut)}`}>
                        {getStatusLabel(reception.statut)}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          onClick={() => loadReceptionDetails(reception.id_reception)}
                          className="erp-btn erp-btn-outline"
                          style={{ padding: '4px 8px' }}
                          title="Voir/Modifier"
                        >
                          <Eye size={14} />
                        </button>
                        {reception.statut === 'brouillon' && (
                          <button
                            onClick={() => handleDelete(reception.id_reception)}
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
const ReceptionForm: React.FC<{
  reception: Reception;
  onClose: () => void;
  onSave: () => void;
  onValidate: (id: number) => void;
}> = ({ reception, onClose, onSave, onValidate }) => {
  const { success, error: showError } = useNotifications();
  const [lignes, setLignes] = useState<ReceptionLine[]>(reception.lignes || []);

  const updateLine = (index: number, field: string, value: any) => {
    const updated = [...lignes];
    updated[index] = { ...updated[index], [field]: value };
    
    // Calculer automatiquement les quantités
    if (field === 'quantite_recue') {
      const recue = parseFloat(value) || 0;
      const commandee = updated[index].quantite_commandee;
      updated[index].quantite_acceptee = Math.min(recue, commandee);
      updated[index].quantite_rejetee = Math.max(0, recue - commandee);
    }
    
    setLignes(updated);
  };

  const handleQualityControl = (index: number, decision: 'accepte' | 'rejete') => {
    const updated = [...lignes];
    updated[index].controle_qualite = decision;
    if (decision === 'accepte') {
      updated[index].quantite_acceptee = updated[index].quantite_recue;
      updated[index].quantite_rejetee = 0;
    } else {
      updated[index].quantite_acceptee = 0;
      updated[index].quantite_rejetee = updated[index].quantite_recue;
    }
    setLignes(updated);
  };

  const handleSave = async () => {
    try {
      await purchaseReceptionsService.updateReception(reception.id_reception, { lignes });
      success('Réception mise à jour');
      onSave();
    } catch (err: any) {
      showError('Erreur sauvegarde', err.response?.data?.error?.message || 'Erreur lors de la sauvegarde');
    }
  };

  return (
    <div className="erp-layout">
      <ERPHeader
        title={`Réception ${reception.numero_reception}`}
        breadcrumb={[
          { label: 'Achats' },
          { label: 'Réceptions' },
          { label: reception.numero_reception }
        ]}
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={onClose} className="erp-btn erp-btn-outline">
              Fermer
            </button>
            <button onClick={handleSave} className="erp-btn erp-btn-primary">
              Enregistrer
            </button>
            {reception.statut !== 'validee' && (
              <button
                onClick={() => onValidate(reception.id_reception)}
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
            label: getStatusLabel(reception.statut),
            value: reception.statut,
            color: getStatusColor(reception.statut) as any
          }}
          workflow={[
            { label: 'Brouillon', value: 'brouillon', color: 'draft' },
            { label: 'En cours', value: 'en_cours', color: 'confirmed' },
            { label: 'Validée', value: 'validee', color: 'done' }
          ]}
        />

        <div className="erp-form-view">
          <ERPNotebook
            tabs={[
              {
                label: 'Lignes de réception',
                content: (
                  <div>
                    <div className="erp-tree-view">
                      <table className="erp-tree-table">
                        <thead>
                          <tr>
                            <th>Produit</th>
                            <th>Quantité commandée</th>
                            <th>Quantité reçue</th>
                            <th>Quantité acceptée</th>
                            <th>Quantité rejetée</th>
                            <th>Contrôle qualité</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {lignes.map((ligne, index) => (
                            <tr key={ligne.id_ligne || index}>
                              <td>{ligne.product_name}</td>
                              <td>{ligne.quantite_commandee}</td>
                              <td>
                                <input
                                  type="number"
                                  value={ligne.quantite_recue}
                                  onChange={(e) => updateLine(index, 'quantite_recue', e.target.value)}
                                  className="erp-field-input"
                                  style={{ width: '100px' }}
                                  min={0}
                                />
                              </td>
                              <td>{ligne.quantite_acceptee}</td>
                              <td>{ligne.quantite_rejetee}</td>
                              <td>
                                {ligne.controle_qualite === 'en_attente' ? (
                                  <div style={{ display: 'flex', gap: '4px' }}>
                                    <button
                                      onClick={() => handleQualityControl(index, 'accepte')}
                                      className="erp-btn erp-btn-success"
                                      style={{ padding: '4px 8px' }}
                                    >
                                      <CheckCircle size={14} />
                                    </button>
                                    <button
                                      onClick={() => handleQualityControl(index, 'rejete')}
                                      className="erp-btn erp-btn-danger"
                                      style={{ padding: '4px 8px' }}
                                    >
                                      <XCircle size={14} />
                                    </button>
                                  </div>
                                ) : (
                                  <span className={`erp-status-badge ${ligne.controle_qualite === 'accepte' ? 'done' : 'cancelled'}`}>
                                    {ligne.controle_qualite === 'accepte' ? 'Accepté' : 'Rejeté'}
                                  </span>
                                )}
                              </td>
                              <td>
                                {ligne.controle_qualite === 'en_attente' && (
                                  <span style={{ color: 'var(--erp-warning)', fontSize: '12px' }}>
                                    En attente
                                  </span>
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
    en_cours: 'confirmed',
    validee: 'done',
    annulee: 'cancelled'
  };
  return colors[statut] || 'draft';
};

const getStatusLabel = (statut: string) => {
  const labels: Record<string, string> = {
    brouillon: 'Brouillon',
    en_cours: 'En cours',
    validee: 'Validée',
    annulee: 'Annulée'
  };
  return labels[statut] || statut;
};

export default PurchaseReceptionsERP;
