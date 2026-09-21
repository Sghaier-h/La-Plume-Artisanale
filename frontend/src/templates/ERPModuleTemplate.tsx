/**
 * Template standardisé pour les modules ERP
 * Utilisez ce template comme référence pour créer de nouveaux modules
 */

import React, { useEffect, useState } from 'react';
import { ERPHeader, ERPStatusbar, ERPNotebook, ERPChatter, ERPButtonBox } from '../components/erp';
import KanbanView from '../components/erp/KanbanView';
import { displayMany2One, formatDate, formatCurrency, formatState } from '../utils/relations';
import { Plus, Edit, Trash2, Eye, Search, List, Grid } from 'lucide-react';

/**
 * Interface standard pour un module ERP
 */
interface ERPModuleProps<T> {
  // Service API
  service: {
    getItems: (params?: any) => Promise<any>;
    getItem: (id: number, params?: any) => Promise<any>;
    createItem: (data: any) => Promise<any>;
    updateItem: (id: number, data: any) => Promise<any>;
    deleteItem: (id: number) => Promise<any>;
  };
  
  // Configuration
  config: {
    title: string;
    breadcrumb: Array<{ label: string; path?: string }>;
    tableColumns: Array<{
      key: string;
      label: string;
      render?: (value: any, record: T) => React.ReactNode;
    }>;
    kanbanColumns?: Array<{
      id: string;
      title: string;
      filter: (item: T) => boolean;
    }>;
    formFields: Array<{
      key: string;
      label: string;
      type: 'text' | 'number' | 'email' | 'tel' | 'select' | 'textarea' | 'checkbox' | 'date' | 'many2one';
      required?: boolean;
      options?: Array<{ value: any; label: string }>;
      relation?: string;
    }>;
    notebookTabs?: Array<{
      label: string;
      content: (record: T | null, formData: any, setFormData: any) => React.ReactNode;
    }>;
  };
}

/**
 * Template de module ERP standardisé
 */
export function createERPModule<T extends { id: number; [key: string]: any }>(
  props: ERPModuleProps<T>
) {
  const { service, config } = props;

  return function ERPModule() {
    const [items, setItems] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewType, setViewType] = useState<'list' | 'kanban' | 'form'>('list');
    const [search, setSearch] = useState('');
    const [selectedItem, setSelectedItem] = useState<T | null>(null);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
      loadItems();
    }, [search]);

    const loadItems = async () => {
      setLoading(true);
      try {
        const params: any = { loadRelations: true };
        if (search) params.search = search;
        const response = await service.getItems(params);
        const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
        setItems(data);
      } catch (error) {
        console.error(`Erreur chargement ${config.title}:`, error);
      } finally {
        setLoading(false);
      }
    };

    const handleCreate = () => {
      setSelectedItem(null);
      setShowForm(true);
      setViewType('form');
    };

    const handleEdit = (item: T) => {
      setSelectedItem(item);
      setShowForm(true);
      setViewType('form');
    };

    const handleDelete = async (id: number) => {
      if (window.confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) {
        try {
          await service.deleteItem(id);
          loadItems();
        } catch (error: any) {
          alert(error.response?.data?.error?.message || 'Erreur lors de la suppression');
        }
      }
    };

    const handleSave = async (formData: any) => {
      try {
        if (selectedItem?.id) {
          await service.updateItem(selectedItem.id, formData);
        } else {
          await service.createItem(formData);
        }
        setShowForm(false);
        setSelectedItem(null);
        setViewType('list');
        loadItems();
      } catch (error: any) {
        alert(error.response?.data?.error?.message || 'Erreur lors de l\'enregistrement');
      }
    };

    if (showForm) {
      return (
        <ItemForm
          item={selectedItem}
          config={config}
          service={service}
          onClose={() => {
            setShowForm(false);
            setSelectedItem(null);
            setViewType('list');
            loadItems();
          }}
          onSave={handleSave}
        />
      );
    }

    return (
      <div className="erp-layout">
        <ERPHeader
          title={config.title}
          breadcrumb={config.breadcrumb}
          actions={
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {config.kanbanColumns && (
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
              )}
              <button onClick={handleCreate} className="erp-btn erp-btn-primary">
                <Plus size={16} style={{ marginRight: '4px' }} />
                Nouveau
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
                placeholder={`Rechercher...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="erp-field-input"
                style={{ flex: 1 }}
              />
            </div>
          </div>

          {viewType === 'kanban' && config.kanbanColumns ? (
            <KanbanView
              columns={config.kanbanColumns.map(col => ({
                id: col.id,
                title: col.title,
                items: items.filter(col.filter)
              }))}
              onItemClick={handleEdit}
            />
          ) : (
            <div className="erp-tree-view">
              <table className="erp-tree-table">
                <thead>
                  <tr>
                    {config.tableColumns.map(col => (
                      <th key={col.key}>{col.label}</th>
                    ))}
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={config.tableColumns.length + 1} style={{ textAlign: 'center', padding: '32px' }}>
                        Chargement...
                      </td>
                    </tr>
                  ) : items.length === 0 ? (
                    <tr>
                      <td colSpan={config.tableColumns.length + 1} style={{ textAlign: 'center', padding: '32px', color: 'var(--erp-text-muted)' }}>
                        Aucun élément
                      </td>
                    </tr>
                  ) : (
                    items.map(item => (
                      <tr key={item.id}>
                        {config.tableColumns.map(col => (
                          <td key={col.key}>
                            {col.render ? col.render(item[col.key], item) : String(item[col.key] || '-')}
                          </td>
                        ))}
                        <td>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                              onClick={() => handleEdit(item)}
                              className="erp-btn erp-btn-outline"
                              style={{ padding: '4px 8px' }}
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
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
          )}
        </div>
      </div>
    );
  };
}

// Composant Formulaire standardisé
function ItemForm<T extends { id: number; [key: string]: any }>({
  item,
  config,
  service,
  onClose,
  onSave
}: {
  item: T | null;
  config: ERPModuleProps<T>['config'];
  service: ERPModuleProps<T>['service'];
  onClose: () => void;
  onSave: (data: any) => void;
}) {
  const initialFormData = config.formFields.reduce((acc, field) => {
    acc[field.key] = item?.[field.key] || (field.type === 'checkbox' ? false : field.type === 'number' ? 0 : '');
    return acc;
  }, {} as any);

  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (item?.id) {
      loadItemDetails();
    }
  }, [item?.id]);

  const loadItemDetails = async () => {
    if (!item?.id) return;
    setLoading(true);
    try {
      const response = await service.getItem(item.id, { loadRelations: true });
      const data = response.data?.data || response.data;
      const newFormData = { ...formData };
      config.formFields.forEach(field => {
        if (data[field.key] !== undefined) {
          newFormData[field.key] = data[field.key];
        }
      });
      setFormData(newFormData);
    } catch (error) {
      console.error('Erreur chargement détails:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveClick = () => {
    onSave(formData);
  };

  const defaultTabs = [
    {
      label: 'Informations',
      content: (
        <div>
          {config.formFields.map(field => (
            <div key={field.key} className="erp-field">
              <label className={`erp-field-label ${field.required ? 'erp-field-required' : ''}`}>
                {field.label}
              </label>
              {field.type === 'text' || field.type === 'email' || field.type === 'tel' ? (
                <input
                  type={field.type}
                  value={formData[field.key] || ''}
                  onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                  className="erp-field-input"
                  placeholder={`${field.label}...`}
                />
              ) : field.type === 'number' ? (
                <input
                  type="number"
                  value={formData[field.key] || 0}
                  onChange={(e) => setFormData({ ...formData, [field.key]: parseFloat(e.target.value) || 0 })}
                  className="erp-field-input"
                  step="0.01"
                />
              ) : field.type === 'select' ? (
                <select
                  value={formData[field.key] || ''}
                  onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                  className="erp-field-input"
                >
                  <option value="">Sélectionner...</option>
                  {field.options?.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : field.type === 'textarea' ? (
                <textarea
                  value={formData[field.key] || ''}
                  onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                  className="erp-field-input"
                  rows={5}
                />
              ) : field.type === 'checkbox' ? (
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={formData[field.key] || false}
                    onChange={(e) => setFormData({ ...formData, [field.key]: e.target.checked })}
                  />
                  {field.label}
                </label>
              ) : null}
            </div>
          ))}
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
  ];

  const tabs = config.notebookTabs || defaultTabs;

  return (
    <div className="erp-layout">
      <ERPHeader
        title={item ? `${config.title} ${item.id}` : `Nouveau ${config.title}`}
        breadcrumb={[...config.breadcrumb, { label: item ? String(item.id) : 'Nouveau' }]}
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
          {item && (
            <ERPStatusbar
              status={{
                label: 'Brouillon',
                value: 'draft',
                color: 'draft'
              }}
            />
          )}
          <ERPNotebook
            tabs={tabs.map(tab => ({
              label: tab.label,
              content: typeof tab.content === 'function' ? tab.content(item, formData, setFormData) : tab.content
            }))}
          />
        </div>
      </div>
    </div>
  );
}
