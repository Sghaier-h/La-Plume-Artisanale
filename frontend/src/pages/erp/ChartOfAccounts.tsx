/**
 * ChartOfAccountsERP - Plan Comptable
 * Visualisation hiérarchique du plan comptable
 */

import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, Plus, Edit, Trash2, Search, FileText } from 'lucide-react';
import api from '../../services/api';
import { ERPHeader, ERPNotebook, ERPChatter } from '../../components/erp';

interface Account {
  id: number;
  code: string;
  name: string;
  parent_id?: number;
  parent_path?: string;
  type: string;
  reconcile: boolean;
  deprecated: boolean;
  children?: Account[];
  level?: number;
}

const ChartOfAccountsERP: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [filteredAccounts, setFilteredAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadAccounts();
  }, []);

  useEffect(() => {
    if (search) {
      const filtered = accounts.filter(acc =>
        acc.code.toLowerCase().includes(search.toLowerCase()) ||
        acc.name.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredAccounts(filtered);
    } else {
      setFilteredAccounts(buildTree(accounts));
    }
  }, [search, accounts]);

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const params: any = { loadRelations: true };
      const response = await api.get('/accounting-tunisia/chart-of-accounts', { params });
      const flatAccounts = response.data.data || [];
      setAccounts(flatAccounts);
      setFilteredAccounts(buildTree(flatAccounts));
    } catch (error) {
      console.error('Erreur chargement plan comptable:', error);
    } finally {
      setLoading(false);
    }
  };

  const buildTree = (flatAccounts: Account[]): Account[] => {
    const accountMap = new Map<number, Account>();
    const rootAccounts: Account[] = [];

    // Créer un map de tous les comptes
    flatAccounts.forEach(acc => {
      accountMap.set(acc.id, { ...acc, children: [] });
    });

    // Construire l'arbre
    flatAccounts.forEach(acc => {
      const account = accountMap.get(acc.id)!;
      if (acc.parent_id && accountMap.has(acc.parent_id)) {
        const parent = accountMap.get(acc.parent_id)!;
        if (!parent.children) parent.children = [];
        parent.children.push(account);
      } else {
        rootAccounts.push(account);
      }
    });

    // Calculer les niveaux
    const setLevels = (accs: Account[], level: number = 0) => {
      accs.forEach(acc => {
        acc.level = level;
        if (acc.children && acc.children.length > 0) {
          setLevels(acc.children, level + 1);
        }
      });
    };
    setLevels(rootAccounts);

    return rootAccounts;
  };

  const toggleNode = (accountId: number) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(accountId)) {
      newExpanded.delete(accountId);
    } else {
      newExpanded.add(accountId);
    }
    setExpandedNodes(newExpanded);
  };

  const renderAccount = (account: Account) => {
    const hasChildren = account.children && account.children.length > 0;
    const isExpanded = expandedNodes.has(account.id);
    const isSelected = selectedAccount?.id === account.id;

    return (
      <div key={account.id}>
        <div
          onClick={() => {
            setSelectedAccount(account);
            setShowForm(true);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '8px 12px',
            paddingLeft: `${(account.level || 0) * 24 + 12}px`,
            cursor: 'pointer',
            background: isSelected ? 'var(--erp-bg-hover)' : 'transparent',
            borderLeft: isSelected ? '3px solid var(--erp-primary)' : 'none'
          }}
          onMouseEnter={(e) => {
            if (!isSelected) e.currentTarget.style.background = 'var(--erp-bg-hover)';
          }}
          onMouseLeave={(e) => {
            if (!isSelected) e.currentTarget.style.background = 'transparent';
          }}
        >
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleNode(account.id);
              }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                marginRight: '8px'
              }}
            >
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          ) : (
            <div style={{ width: '24px', marginRight: '8px' }} />
          )}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontFamily: 'monospace', fontWeight: 600, minWidth: '80px' }}>
              {account.code}
            </span>
            <span style={{ flex: 1 }}>{account.name}</span>
            <span style={{
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '11px',
              background: account.type === 'asset' ? '#d1e7dd' :
                         account.type === 'liability' ? '#f8d7da' :
                         account.type === 'equity' ? '#cfe2ff' :
                         '#e9ecef',
              color: account.type === 'asset' ? '#0f5132' :
                     account.type === 'liability' ? '#842029' :
                     account.type === 'equity' ? '#084298' :
                     '#495057'
            }}>
              {account.type}
            </span>
            {account.reconcile && (
              <span style={{ fontSize: '11px', color: 'var(--erp-success)' }}>✓ Réconciliable</span>
            )}
          </div>
        </div>
        {hasChildren && isExpanded && account.children && (
          <div>
            {account.children.map(child => renderAccount(child))}
          </div>
        )}
      </div>
    );
  };

  if (showForm && selectedAccount) {
    return (
      <AccountForm
        account={selectedAccount}
        onClose={() => {
          setShowForm(false);
          setSelectedAccount(null);
          loadAccounts();
        }}
        onSave={loadAccounts}
      />
    );
  }

  return (
    <div className="erp-layout">
      <ERPHeader
        title="Plan Comptable"
        breadcrumb={[{ label: 'Comptabilité', path: '/account-moves' }, { label: 'Plan Comptable' }]}
        actions={
          <button
            onClick={() => {
              setSelectedAccount(null);
              setShowForm(true);
            }}
            className="erp-btn erp-btn-primary"
          >
            <Plus size={16} style={{ marginRight: '4px' }} />
            Nouveau Compte
          </button>
        }
      />

      <div className="erp-content">
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <div style={{ flex: 1, display: 'flex', gap: '8px' }}>
            <Search size={20} style={{ color: 'var(--erp-text-muted)' }} />
            <input
              type="text"
              placeholder="Rechercher un compte (code ou nom)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="erp-field-input"
              style={{ flex: 1 }}
            />
          </div>
        </div>

        <div style={{
          background: 'var(--erp-bg-primary)',
          border: '1px solid var(--erp-border-color)',
          borderRadius: 'var(--erp-border-radius)',
          overflow: 'auto',
          maxHeight: 'calc(100vh - 300px)'
        }}>
          {loading ? (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--erp-text-muted)' }}>
              Chargement...
            </div>
          ) : filteredAccounts.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--erp-text-muted)' }}>
              Aucun compte trouvé
            </div>
          ) : (
            filteredAccounts.map(account => renderAccount(account))
          )}
        </div>
      </div>
    </div>
  );
};

// Composant Formulaire
const AccountForm: React.FC<{
  account: Account | null;
  onClose: () => void;
  onSave: () => void;
}> = ({ account, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    code: account?.code || '',
    name: account?.name || '',
    type: account?.type || 'asset',
    parent_id: account?.parent_id || null,
    reconcile: account?.reconcile || false,
    deprecated: account?.deprecated || false
  });
  const [parentAccounts, setParentAccounts] = useState<Account[]>([]);

  useEffect(() => {
    loadParentAccounts();
  }, []);

  const loadParentAccounts = async () => {
    try {
      const response = await api.get('/accounting-tunisia/chart-of-accounts');
      setParentAccounts(response.data.data || []);
    } catch (error) {
      console.error('Erreur chargement comptes:', error);
    }
  };

  const handleSave = async () => {
    try {
      if (account?.id) {
        await api.put(`/accounting-tunisia/chart-of-accounts/${account.id}`, formData);
      } else {
        await api.post('/accounting-tunisia/chart-of-accounts', formData);
      }
      addNotification('Compte enregistré avec succès', 'success');
      onSave();
      onClose();
    } catch (error: any) {
      addNotification(error.response?.data?.error?.message || 'Erreur enregistrement', 'error');
    }
  };

  const addNotification = (message: string, type: 'success' | 'error' | 'info') => {
    console.log(`${type}: ${message}`);
  };

  return (
    <div className="erp-layout">
      <ERPHeader
        title={account ? `Compte ${account.code}` : 'Nouveau Compte'}
        breadcrumb={[
          { label: 'Comptabilité' },
          { label: 'Plan Comptable' },
          { label: account ? account.code : 'Nouveau' }
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
        <div className="erp-form-view">
          <ERPNotebook
            tabs={[
              {
                label: 'Informations',
                content: (
                  <div>
                    <div className="erp-field">
                      <label className="erp-field-label erp-field-required">Code</label>
                      <input
                        type="text"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                        className="erp-field-input"
                        placeholder="Ex: 411000"
                      />
                    </div>
                    <div className="erp-field">
                      <label className="erp-field-label erp-field-required">Nom</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="erp-field-input"
                        placeholder="Nom du compte"
                      />
                    </div>
                    <div className="erp-field">
                      <label className="erp-field-label erp-field-required">Type</label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="erp-field-input"
                      >
                        <option value="asset">Actif</option>
                        <option value="liability">Passif</option>
                        <option value="equity">Capitaux propres</option>
                        <option value="income">Produit</option>
                        <option value="expense">Charge</option>
                      </select>
                    </div>
                    <div className="erp-field">
                      <label className="erp-field-label">Compte parent</label>
                      <select
                        value={formData.parent_id || ''}
                        onChange={(e) => setFormData({ ...formData, parent_id: e.target.value ? parseInt(e.target.value) : null })}
                        className="erp-field-input"
                      >
                        <option value="">Aucun (compte racine)</option>
                        {parentAccounts
                          .filter(acc => !acc.deprecated && acc.id !== account?.id)
                          .map(acc => (
                            <option key={acc.id} value={acc.id}>
                              {acc.code} - {acc.name}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div className="erp-field">
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="checkbox"
                          checked={formData.reconcile}
                          onChange={(e) => setFormData({ ...formData, reconcile: e.target.checked })}
                        />
                        Réconciliable
                      </label>
                    </div>
                    <div className="erp-field">
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="checkbox"
                          checked={formData.deprecated}
                          onChange={(e) => setFormData({ ...formData, deprecated: e.target.checked })}
                        />
                        Déprécié
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

export default ChartOfAccountsERP;
