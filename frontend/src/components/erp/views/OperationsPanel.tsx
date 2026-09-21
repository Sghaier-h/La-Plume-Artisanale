/**
 * OperationsPanel - Panneau d'opérations en bas à gauche (style ERP)
 * Affiche les actions possibles, l'historique et les documents liés
 */

import React, { useState, useEffect } from 'react';
import {
  RefreshCw, CheckCircle, XCircle, ArrowRight, Edit, Trash2, 
  Copy, Eye, Download, Upload, Printer, Mail, Calendar, 
  FileText, ShoppingBag, Receipt, Package, Users, Clock,
  History, Activity, Link as LinkIcon, ExternalLink, MoreVertical,
  Plus, ArrowLeftRight, Zap, Tag, DollarSign, Building2
} from 'lucide-react';
import { useApp } from '../../../store/AppContext';
import api from '../../../services/api';

export interface Operation {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  action: () => void | Promise<void>;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'default';
  disabled?: boolean;
  loading?: boolean;
  badge?: string | number;
  confirm?: string; // Message de confirmation
  condition?: boolean; // Condition pour afficher l'opération
}

export interface RelatedDocument {
  id: string;
  type: string;
  label: string;
  count: number;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
}

export interface ActivityLog {
  id: string;
  type: 'create' | 'update' | 'delete' | 'action' | 'state_change' | 'comment';
  label: string;
  user: string;
  date: Date;
  changes?: { field: string; old: any; new: any }[];
  comment?: string;
}

interface OperationsPanelProps {
  record?: any;
  recordType: string; // 'sale.order', 'purchase.order', 'account.move', etc.
  operations?: Operation[];
  relatedDocuments?: RelatedDocument[];
  activities?: ActivityLog[];
  onOperation?: (operationId: string) => void | Promise<void>;
  className?: string;
}

const OperationsPanel: React.FC<OperationsPanelProps> = ({
  record,
  recordType,
  operations = [],
  relatedDocuments = [],
  activities = [],
  onOperation,
  className = ''
}) => {
  const { addNotification } = useApp();
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<ActivityLog[]>(activities);

  useEffect(() => {
    if (record?.id && recordType) {
      loadHistory();
    }
  }, [record?.id, recordType]);

  const loadHistory = async () => {
    try {
      // Charger l'historique des modifications (essayer les deux formats de routes)
      let response: any = null;
      try {
        response = await api.get(`/api/audit/${recordType}/${record.id}`);
      } catch (e) {
        // Essayer l'autre format
        try {
          response = await api.get(`/api/audit/record/${recordType}/${record.id}`);
        } catch (e2) {
          // Si les deux échouent, continuer avec un historique vide
        }
      }
      
      if (response?.data?.data && Array.isArray(response.data.data)) {
        // Convertir les données d'audit en ActivityLog
        const auditLogs = response.data.data.map((log: any) => ({
          id: log.id_audit || log.id || String(Math.random()),
          type: log.action === 'INSERT' ? 'create' : log.action === 'UPDATE' ? 'update' : log.action === 'DELETE' ? 'delete' : 'action',
          label: log.action === 'INSERT' ? 'Création' : log.action === 'UPDATE' ? 'Modification' : log.action === 'DELETE' ? 'Suppression' : log.action,
          user: log.user_email || log.user_id || 'Système',
          date: new Date(log.created_at || log.date || Date.now()),
          changes: log.old_values && log.new_values ? Object.keys(log.new_values).map((key: string) => ({
            field: key,
            old: log.old_values[key],
            new: log.new_values[key]
          })) : undefined
        }));
        setHistory(auditLogs);
      } else if (activities.length > 0) {
        setHistory(activities);
      } else {
        // Créer un historique basique si aucun historique n'est disponible
        setHistory([
          {
            id: '1',
            type: 'create',
            label: 'Création du document',
            user: record.create_uid?.name || record.create_user?.name || 'Système',
            date: new Date(record.create_date || record.date || Date.now()),
          }
        ]);
      }
    } catch (error) {
      console.error('Erreur chargement historique:', error);
      // Historique de base en cas d'erreur
      setHistory(activities.length > 0 ? activities : [
        {
          id: '1',
          type: 'create',
          label: 'Création du document',
          user: record.create_uid?.name || record.create_user?.name || 'Système',
          date: new Date(record.create_date || record.date || Date.now()),
        }
      ]);
    }
  };

  const handleOperation = async (operation: Operation) => {
    try {
      setLoading(true);
      
      if (operation.confirm) {
        const confirmed = window.confirm(operation.confirm);
        if (!confirmed) return;
      }

      if (onOperation) {
        await onOperation(operation.id);
      } else {
        await operation.action();
      }

      addNotification({
        id: `operation-${operation.id}-${Date.now()}`,
        type: 'success',
        title: 'Opération réussie',
        message: operation.label,
        duration: 3000,
      });

      // Recharger l'historique après l'opération
      if (record?.id) {
        await loadHistory();
      }
    } catch (error: any) {
      addNotification({
        id: `operation-error-${Date.now()}`,
        type: 'error',
        title: 'Erreur',
        message: error.response?.data?.error?.message || 'Erreur lors de l\'opération',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Opérations par défaut selon le type de document
  const getDefaultOperations = (): Operation[] => {
    if (!record) return [];

    const defaultOps: Operation[] = [];

    // Opérations communes
    defaultOps.push(
      {
        id: 'edit',
        label: 'Modifier',
        icon: Edit,
        action: () => {
          // Action gérée par le parent
        },
        variant: 'default',
      }
    );

    // Opérations selon le type
    switch (recordType) {
      case 'sale.order':
        if (record.state === 'draft') {
          defaultOps.push(
            {
              id: 'confirm',
              label: 'Confirmer',
              icon: CheckCircle,
              action: async () => {
                await api.put(`/api/sale/orders/${record.id}/confirm`);
              },
              variant: 'primary',
              confirm: 'Confirmer cette commande ?',
            },
            {
              id: 'cancel',
              label: 'Annuler',
              icon: XCircle,
              action: async () => {
                await api.put(`/api/sale/orders/${record.id}/cancel`);
              },
              variant: 'danger',
              confirm: 'Annuler cette commande ?',
            }
          );
        }
        if (record.state === 'sale') {
          defaultOps.push(
            {
              id: 'create_invoice',
              label: 'Créer facture',
              icon: Receipt,
              action: async () => {
                await api.post(`/api/sale/orders/${record.id}/invoice`);
              },
              variant: 'success',
            },
            {
              id: 'create_delivery',
              label: 'Créer livraison',
              icon: Package,
              action: async () => {
                await api.post(`/api/sale/orders/${record.id}/delivery`);
              },
              variant: 'success',
            }
          );
        }
        defaultOps.push(
          {
            id: 'duplicate',
            label: 'Dupliquer',
            icon: Copy,
            action: async () => {
              const response = await api.post(`/api/sale/orders/${record.id}/duplicate`);
              window.location.href = `/sale-orders/${response.data.data.id}`;
            },
            variant: 'default',
          },
          {
            id: 'print',
            label: 'Imprimer',
            icon: Printer,
            action: async () => {
              window.open(`/api/sale/orders/${record.id}/print`, '_blank');
            },
            variant: 'default',
          },
          {
            id: 'send_email',
            label: 'Envoyer par email',
            icon: Mail,
            action: async () => {
              await api.post(`/api/sale/orders/${record.id}/send-email`);
            },
            variant: 'default',
          }
        );
        break;

      case 'account.move':
        if (record.state === 'draft') {
          defaultOps.push(
            {
              id: 'post',
              label: 'Comptabiliser',
              icon: CheckCircle,
              action: async () => {
                await api.put(`/api/account/moves/${record.id}/post`);
              },
              variant: 'primary',
              confirm: 'Comptabiliser cette écriture ?',
            }
          );
        }
        if (record.state === 'posted' && record.type === 'out_invoice' && record.amount_residual > 0) {
          defaultOps.push(
            {
              id: 'register_payment',
              label: 'Enregistrer paiement',
              icon: DollarSign,
              action: async () => {
                // Ouvrir modal de paiement
              },
              variant: 'success',
            }
          );
        }
        defaultOps.push(
          {
            id: 'duplicate',
            label: 'Dupliquer',
            icon: Copy,
            action: async () => {
              const response = await api.post(`/api/account/moves/${record.id}/duplicate`);
              window.location.href = `/account-moves/${response.data.data.id}`;
            },
            variant: 'default',
          },
          {
            id: 'print',
            label: 'Imprimer',
            icon: Printer,
            action: async () => {
              window.open(`/api/account/moves/${record.id}/print`, '_blank');
            },
            variant: 'default',
          }
        );
        break;

      case 'mrp.production':
        if (record.state === 'draft') {
          defaultOps.push(
            {
              id: 'confirm',
              label: 'Confirmer',
              icon: CheckCircle,
              action: async () => {
                await api.put(`/api/of/${record.id}/confirm`);
              },
              variant: 'primary',
            },
            {
              id: 'cancel',
              label: 'Annuler',
              icon: XCircle,
              action: async () => {
                await api.put(`/api/of/${record.id}/cancel`);
              },
              variant: 'danger',
            }
          );
        }
        if (record.state === 'confirmed') {
          defaultOps.push(
            {
              id: 'start',
              label: 'Démarrer',
              icon: Zap,
              action: async () => {
                await api.put(`/api/of/${record.id}/start`);
              },
              variant: 'success',
            }
          );
        }
        if (record.state === 'in_progress') {
          defaultOps.push(
            {
              id: 'finish',
              label: 'Terminer',
              icon: CheckCircle,
              action: async () => {
                await api.put(`/api/of/${record.id}/finish`);
              },
              variant: 'success',
            }
          );
        }
        break;

      case 'res.partner':
        // Opérations pour les partenaires/clients
        defaultOps.push(
          {
            id: 'create_order',
            label: 'Créer une commande',
            icon: ShoppingBag,
            action: async () => {
              window.location.href = `/sale-orders?partner_id=${record.id_partner || record.id}&mode=create`;
            },
            variant: 'primary',
          },
          {
            id: 'create_invoice',
            label: 'Créer une facture',
            icon: Receipt,
            action: async () => {
              window.location.href = `/account-moves?partner_id=${record.id_partner || record.id}&move_type=out_invoice&mode=create`;
            },
            variant: 'primary',
          },
          {
            id: 'view_account',
            label: 'Voir le compte',
            icon: DollarSign,
            action: async () => {
              window.location.href = `/commercial/partners/${record.id_partner || record.id}/account`;
            },
            variant: 'default',
          }
        );
        break;

      case 'res.company':
        // Opérations pour les sociétés
        defaultOps.push(
          {
            id: 'create_establishment',
            label: 'Créer un établissement',
            icon: Building2,
            action: async () => {
              window.location.href = `/multisociete?company_id=${record.id || record.id_societe}&mode=create_establishment`;
            },
            variant: 'primary',
          },
          {
            id: 'switch_company',
            label: 'Changer de société active',
            icon: RefreshCw,
            action: async () => {
              // Changer la société active
              const companyId = record.id || record.id_societe;
              localStorage.setItem('activeCompany', JSON.stringify({ id_societe: companyId, ...record }));
              window.location.reload();
            },
            variant: 'default',
          }
        );
        break;
    }

    // Filtrer les opérations selon la condition
    return defaultOps.filter(op => op.condition !== false);
  };

  const allOperations = operations.length > 0 ? operations : getDefaultOperations();
  const filteredOperations = allOperations.filter(op => op.condition !== false);

  const getVariantClass = (variant?: string) => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-500 hover:bg-blue-600 text-white';
      case 'success':
        return 'bg-green-500 hover:bg-green-600 text-white';
      case 'warning':
        return 'bg-yellow-500 hover:bg-yellow-600 text-white';
      case 'danger':
        return 'bg-red-500 hover:bg-red-600 text-white';
      default:
        return 'bg-gray-100 hover:bg-gray-200 text-gray-700';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'create':
        return Plus;
      case 'update':
        return Edit;
      case 'delete':
        return Trash2;
      case 'action':
        return Zap;
      case 'state_change':
        return ArrowLeftRight;
      case 'comment':
        return FileText;
      default:
        return Activity;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'create':
        return 'text-green-600 bg-green-50';
      case 'update':
        return 'text-blue-600 bg-blue-50';
      case 'delete':
        return 'text-red-600 bg-red-50';
      case 'action':
        return 'text-purple-600 bg-purple-50';
      case 'state_change':
        return 'text-orange-600 bg-orange-50';
      case 'comment':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (!record) return null;

  return (
    <div className={`fixed bottom-0 left-64 bg-white border-t border-r border-gray-200 shadow-2xl z-40 ${className}`} style={{ width: '320px', maxHeight: '50vh' }}>
      <div className="flex flex-col h-full">
        {/* En-tête */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200 p-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 text-sm">Opérations</h3>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="p-1 rounded hover:bg-white transition-colors"
              title="Afficher l'historique"
            >
              <History className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Contenu */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {!showHistory ? (
            <>
              {/* Opérations */}
              <div className="p-3 space-y-2">
                {filteredOperations.map((operation) => {
                  const Icon = operation.icon || MoreVertical;
                  return (
                    <button
                      key={operation.id}
                      onClick={() => handleOperation(operation)}
                      disabled={operation.disabled || loading}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${getVariantClass(operation.variant)} ${
                        operation.disabled || loading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="flex-1 text-left">{operation.label}</span>
                      {operation.badge && (
                        <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs font-bold">
                          {operation.badge}
                        </span>
                      )}
                      {operation.loading && (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Documents liés */}
              {relatedDocuments.length > 0 && (
                <div className="border-t border-gray-200 p-3">
                  <h4 className="text-xs font-semibold text-gray-700 mb-2 uppercase">Documents liés</h4>
                  <div className="space-y-1">
                    {relatedDocuments.map((doc) => {
                      const DocIcon = doc.icon;
                      return (
                        <button
                          key={doc.id}
                          onClick={doc.onClick}
                          className="w-full flex items-center justify-between px-2 py-1.5 rounded hover:bg-gray-50 transition-colors text-sm text-gray-700"
                        >
                          <div className="flex items-center gap-2">
                            <DocIcon className="w-4 h-4 text-gray-500" />
                            <span>{doc.label}</span>
                          </div>
                          <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium">
                            {doc.count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Historique */
            <div className="p-3">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-semibold text-gray-700 uppercase">Historique</h4>
                <button
                  onClick={() => setShowHistory(false)}
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  Retour
                </button>
              </div>
              <div className="space-y-2">
                {history.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">Aucun historique</p>
                ) : (
                  history.map((activity) => {
                    const ActivityIcon = getActivityIcon(activity.type);
                    return (
                      <div key={activity.id} className={`p-2 rounded-lg ${getActivityColor(activity.type)}`}>
                        <div className="flex items-start gap-2">
                          <ActivityIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium">{activity.label}</p>
                            <p className="text-xs text-gray-600 mt-0.5">
                              {activity.user} • {new Date(activity.date).toLocaleString('fr-FR')}
                            </p>
                            {activity.changes && activity.changes.length > 0 && (
                              <div className="mt-1 text-xs space-y-0.5">
                                {activity.changes.map((change, idx) => (
                                  <p key={idx} className="text-gray-600">
                                    <span className="font-medium">{change.field}:</span>{' '}
                                    <span className="line-through text-red-600">{String(change.old)}</span>{' '}
                                    → <span className="text-green-600">{String(change.new)}</span>
                                  </p>
                                ))}
                              </div>
                            )}
                            {activity.comment && (
                              <p className="text-xs text-gray-600 mt-1 italic">{activity.comment}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OperationsPanel;
