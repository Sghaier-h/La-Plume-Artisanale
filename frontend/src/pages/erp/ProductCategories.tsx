/**
 * ProductCategoriesERP - Catégories de Produits
 * Version complète avec design ERP moderne
 */

import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { ERPHeader, ERPStatusbar, ERPNotebook, ERPChatter, ERPButtonBox, useNotifications } from '../../components/erp';
import { displayMany2One, formatDate, formatCurrency, formatState } from '../../utils/relations';
import { Plus, Edit, Trash2, Eye, FolderTree, Search } from 'lucide-react';
import { validateForm, commonRules } from '../../utils/validation';

interface Category {
  id: number;
  name: string;
  parent_id?: number;
  parent_path?: string;
  product_count?: number;
  children?: Category[];
  level?: number;
}

const ProductCategoriesERP: React.FC = () => {
  const { success, error: showError } = useNotifications();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState<'list' | 'form'>('list');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadCategories();
  }, [search]);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const params: any = { loadRelations: true };
      if (search) params.search = search;
      const response = await api.get('/product/categories', { params });
      const data = Array.isArray(response.data) ? response.data : response.data.data || [];
      setCategories(data);
    } catch (error) {
      console.error('Erreur chargement catégories:', error);
    } finally {
      setLoading(false);
    }
  };

  const buildTree = (flatCategories: Category[]): Category[] => {
    const categoryMap = new Map<number, Category>();
    const rootCategories: Category[] = [];

    flatCategories.forEach(cat => {
      categoryMap.set(cat.id, { ...cat, children: [] });
    });

    flatCategories.forEach(cat => {
      const category = categoryMap.get(cat.id)!;
      if (cat.parent_id && categoryMap.has(cat.parent_id)) {
        const parent = categoryMap.get(cat.parent_id)!;
        if (!parent.children) parent.children = [];
        parent.children.push(category);
      } else {
        rootCategories.push(category);
      }
    });

    const setLevels = (cats: Category[], level: number = 0) => {
      cats.forEach(cat => {
        cat.level = level;
        if (cat.children && cat.children.length > 0) {
          setLevels(cat.children, level + 1);
        }
      });
    };
    setLevels(rootCategories);

    return rootCategories;
  };

  const handleCreate = () => {
    setSelectedCategory(null);
    setShowForm(true);
    setViewType('form');
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setShowForm(true);
    setViewType('form');
  };

  const handleSave = async (formData: any) => {
    try {
      if (selectedCategory?.id) {
        await api.put(`/product/categories/${selectedCategory.id}`, formData);
      } else {
        await api.post('/product/categories', formData);
      }
      setShowForm(false);
      setSelectedCategory(null);
      setViewType('list');
      loadCategories();
    } catch (err: any) {
      showError('Erreur', err.response?.data?.error?.message || 'Erreur lors de l\'enregistrement');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
      try {
        await api.delete(`/product/categories/${id}`);
        success('Suppression réussie');
        loadCategories();
      } catch (err: any) {
        showError('Erreur', err.response?.data?.error?.message || 'Erreur lors de la suppression');
      }
    }
  };

  const toggleNode = (categoryId: number) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedNodes(newExpanded);
  };

  if (showForm) {
    return (
      <CategoryForm
        category={selectedCategory}
        categories={categories}
        onClose={() => {
          setShowForm(false);
          setSelectedCategory(null);
          setViewType('list');
          loadCategories();
        }}
        onSave={handleSave}
      />
    );
  }

  const treeCategories = buildTree(categories);

  const renderCategory = (category: Category & { children?: Category[], level?: number }) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedNodes.has(category.id);

    return (
      <div key={category.id}>
        <div
          onClick={() => handleEdit(category)}
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '8px 12px',
            paddingLeft: `${(category.level || 0) * 24 + 12}px`,
            cursor: 'pointer',
            borderLeft: '3px solid transparent',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--erp-bg-hover)';
            e.currentTarget.style.borderLeftColor = 'var(--erp-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.borderLeftColor = 'transparent';
          }}
        >
          <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleNode(category.id);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  marginRight: '8px'
                }}
              >
                {isExpanded ? '▼' : '▶'}
              </button>
            )}
            {!hasChildren && <div style={{ width: '24px', marginRight: '8px' }} />}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{category.name}</div>
              {category.product_count !== undefined && (
                <div style={{ fontSize: '12px', color: 'var(--erp-text-muted)' }}>
                  {category.product_count} produit(s)
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(category.id);
                }}
                className="erp-btn erp-btn-danger"
                style={{ padding: '4px 8px' }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
          {hasChildren && isExpanded && category.children && (
            <div>
              {category.children.map(child => renderCategory(child))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="erp-layout">
      <ERPHeader
        title="Catégories de Produits"
        breadcrumb={[
          { label: 'Inventaire' },
          { label: 'Catégories' }
        ]}
        actions={
          <button onClick={handleCreate} className="erp-btn erp-btn-primary">
            <Plus size={16} style={{ marginRight: '4px' }} />
            Nouvelle Catégorie
          </button>
        }
      />

      <div className="erp-content">
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <div style={{ flex: 1, display: 'flex', gap: '8px' }}>
            <Search size={20} style={{ color: 'var(--erp-text-muted)' }} />
            <input
              type="text"
              placeholder="Rechercher une catégorie..."
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
          borderRadius: 'var(--erp-border-radius-lg)',
          overflow: 'auto',
          maxHeight: 'calc(100vh - 300px)',
          boxShadow: 'var(--erp-shadow-md)'
        }}>
          {loading ? (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--erp-text-muted)' }}>
              Chargement...
            </div>
          ) : treeCategories.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--erp-text-muted)' }}>
              Aucune catégorie
            </div>
          ) : (
            treeCategories.map(category => renderCategory(category))
          )}
        </div>
      </div>
    </div>
  );
};

// Composant Formulaire
const CategoryForm: React.FC<{
  category: Category | null;
  categories: Category[];
  onClose: () => void;
  onSave: (data: any) => void;
}> = ({ category, categories, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    parent_id: category?.parent_id || null
  });

  const handleSaveClick = () => {
    onSave(formData);
  };

  return (
    <div className="erp-layout">
      <ERPHeader
        title={category ? `Catégorie ${category.name}` : 'Nouvelle Catégorie'}
        breadcrumb={[
          { label: 'Inventaire' },
          { label: 'Catégories' },
          { label: category ? category.name : 'Nouvelle' }
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
        <div className="erp-form-view">
          <ERPNotebook
            tabs={[
              {
                label: 'Informations',
                content: (
                  <div>
                    <div className="erp-field">
                      <label className="erp-field-label erp-field-required">Nom</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="erp-field-input"
                        placeholder="Nom de la catégorie..."
                      />
                    </div>
                    <div className="erp-field">
                      <label className="erp-field-label">Catégorie parente</label>
                      <select
                        value={formData.parent_id || ''}
                        onChange={(e) => setFormData({ ...formData, parent_id: e.target.value ? parseInt(e.target.value) : null })}
                        className="erp-field-input"
                      >
                        <option value="">Aucune (catégorie racine)</option>
                        {categories
                          .filter(cat => cat.id !== category?.id)
                          .map(cat => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))}
                      </select>
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

export default ProductCategoriesERP;
