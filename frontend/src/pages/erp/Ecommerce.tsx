/**
 * EcommerceERP - E-commerce (Style ERP)
 * Interface complète de gestion e-commerce inspirée d'ERP
 */

import React, { useEffect, useState } from 'react';
import { ecommerceProductsService, ecommerceOrdersService, ecommerceSettingsService } from '../../services/api';
import { ERPHeader, ERPStatusbar, ERPNotebook, ERPChatter, ERPButtonBox, useNotifications } from '../../components/erp';
import KanbanView from '../../components/erp/KanbanView';
import { displayMany2One, formatDate, formatCurrency, formatState } from '../../utils/relations';
import { Plus, Edit, Trash2, Eye, ShoppingBag, Search, Globe, Image, Tag, BarChart3, Settings, List, Grid, CheckCircle, XCircle } from 'lucide-react';
import { validateForm, commonRules } from '../../utils/validation';

interface EcommerceProduct {
  id: number;
  name: string;
  list_price: number;
  website_published: boolean;
  image?: string;
  description?: string;
  category_id?: any;
  website_sequence?: number;
  qty_available?: number;
}

interface EcommerceOrder {
  id: number;
  name: string;
  partner_id?: any;
  date_order: string;
  amount_total: number;
  state: 'draft' | 'confirmed' | 'done' | 'cancel';
}

const EcommerceERP: React.FC = () => {
  const { success, error } = useNotifications();
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'categories' | 'settings'>('products');
  const [products, setProducts] = useState<EcommerceProduct[]>([]);
  const [orders, setOrders] = useState<EcommerceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState<'list' | 'grid' | 'form'>('grid');
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<EcommerceProduct | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (activeTab === 'products') {
      loadProducts();
    } else if (activeTab === 'orders') {
      loadOrders();
    }
  }, [activeTab, search]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params: any = { ecommerce: true, loadRelations: true };
      if (search) params.search = search;
      const response = await ecommerceProductsService.getProducts(params);
      const data = Array.isArray(response.data) ? response.data : response.data.data || [];
      setProducts(data);
    } catch (error) {
      console.error('Erreur chargement produits e-commerce:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    setLoading(true);
    try {
      const params: any = { ecommerce: true, loadRelations: true };
      if (search) params.search = search;
      const response = await ecommerceOrdersService.getOrders(params);
      const data = Array.isArray(response.data) ? response.data : response.data.data || [];
      setOrders(data);
    } catch (error) {
      console.error('Erreur chargement commandes e-commerce:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedProduct(null);
    setShowForm(true);
    setViewType('form');
  };

  const handleEdit = (product: EcommerceProduct) => {
    setSelectedProduct(product);
    setShowForm(true);
    setViewType('form');
  };

  const handleSave = async (formData: any) => {
    try {
      if (selectedProduct?.id) {
        await ecommerceProductsService.updateProduct(selectedProduct.id, formData);
        success('Produit mis à jour avec succès');
      } else {
        await ecommerceProductsService.createProduct(formData);
        success('Produit créé avec succès');
      }
      setShowForm(false);
      setSelectedProduct(null);
      setViewType('grid');
      loadProducts();
    } catch (err: any) {
      error('Erreur enregistrement', err.response?.data?.error?.message || 'Erreur lors de l\'enregistrement');
    }
  };

  const handlePublish = async (id: number, published: boolean) => {
    try {
      if (published) {
        await ecommerceProductsService.publishProduct(id);
      } else {
        await ecommerceProductsService.unpublishProduct(id);
      }
      success(published ? 'Produit publié avec succès' : 'Produit dépublié avec succès');
      loadProducts();
    } catch (err: any) {
      error('Erreur publication', err.response?.data?.error?.message || 'Erreur lors de la publication');
    }
  };

  const getStatusColor = (state: string) => {
    const colors: Record<string, string> = {
      draft: 'draft',
      confirmed: 'confirmed',
      done: 'done',
      cancel: 'cancelled'
    };
    return colors[state] || 'draft';
  };

  const getStatusLabel = (state: string) => {
    const labels: Record<string, string> = {
      draft: 'Brouillon',
      confirmed: 'Confirmé',
      done: 'Terminé',
      cancel: 'Annulé'
    };
    return labels[state] || state;
  };

  if (showForm) {
    return (
      <EcommerceProductForm
        product={selectedProduct}
        onClose={() => {
          setShowForm(false);
          setSelectedProduct(null);
          setViewType('grid');
          loadProducts();
        }}
        onSave={handleSave}
      />
    );
  }

  return (
    <div className="erp-layout">
      <ERPHeader
        title="E-commerce"
        breadcrumb={[
          { label: 'E-commerce' }
        ]}
        actions={
          activeTab === 'products' && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  onClick={() => setViewType('grid')}
                  className={`erp-btn ${viewType === 'grid' ? 'erp-btn-primary' : 'erp-btn-outline'}`}
                  style={{ padding: '8px 12px' }}
                >
                  <Grid size={16} />
                </button>
                <button
                  onClick={() => setViewType('list')}
                  className={`erp-btn ${viewType === 'list' ? 'erp-btn-primary' : 'erp-btn-outline'}`}
                  style={{ padding: '8px 12px' }}
                >
                  <List size={16} />
                </button>
              </div>
              <button onClick={handleCreate} className="erp-btn erp-btn-primary">
                <Plus size={16} style={{ marginRight: '4px' }} />
                Nouveau Produit
              </button>
            </div>
          )
        }
      />

      <div className="erp-content">
        {/* Onglets de navigation */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '24px',
          borderBottom: '2px solid var(--erp-border-color)',
          paddingBottom: '8px'
        }}>
          <button
            onClick={() => setActiveTab('products')}
            style={{
              padding: '12px 24px',
              background: activeTab === 'products' ? 'var(--erp-primary-gradient)' : 'transparent',
              color: activeTab === 'products' ? 'white' : 'var(--erp-text-primary)',
              border: 'none',
              borderRadius: 'var(--erp-border-radius-lg) var(--erp-border-radius-lg) 0 0',
              cursor: 'pointer',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'var(--erp-transition)'
            }}
          >
            <ShoppingBag size={18} />
            Produits
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            style={{
              padding: '12px 24px',
              background: activeTab === 'orders' ? 'var(--erp-primary-gradient)' : 'transparent',
              color: activeTab === 'orders' ? 'white' : 'var(--erp-text-primary)',
              border: 'none',
              borderRadius: 'var(--erp-border-radius-lg) var(--erp-border-radius-lg) 0 0',
              cursor: 'pointer',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'var(--erp-transition)'
            }}
          >
            <BarChart3 size={18} />
            Commandes
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            style={{
              padding: '12px 24px',
              background: activeTab === 'categories' ? 'var(--erp-primary-gradient)' : 'transparent',
              color: activeTab === 'categories' ? 'white' : 'var(--erp-text-primary)',
              border: 'none',
              borderRadius: 'var(--erp-border-radius-lg) var(--erp-border-radius-lg) 0 0',
              cursor: 'pointer',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'var(--erp-transition)'
            }}
          >
            <Tag size={18} />
            Catégories
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            style={{
              padding: '12px 24px',
              background: activeTab === 'settings' ? 'var(--erp-primary-gradient)' : 'transparent',
              color: activeTab === 'settings' ? 'white' : 'var(--erp-text-primary)',
              border: 'none',
              borderRadius: 'var(--erp-border-radius-lg) var(--erp-border-radius-lg) 0 0',
              cursor: 'pointer',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'var(--erp-transition)'
            }}
          >
            <Settings size={18} />
            Configuration
          </button>
        </div>

        {/* Barre de recherche */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <div style={{ flex: 1, display: 'flex', gap: '8px' }}>
            <Search size={20} style={{ color: 'var(--erp-text-muted)' }} />
            <input
              type="text"
              placeholder={activeTab === 'products' ? 'Rechercher un produit...' : activeTab === 'orders' ? 'Rechercher une commande...' : 'Rechercher...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="erp-field-input"
              style={{ flex: 1 }}
            />
          </div>
        </div>

        {/* Contenu selon l'onglet actif */}
        {activeTab === 'products' && (
          viewType === 'list' ? (
            <div className="erp-tree-view">
              <table className="erp-tree-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Nom</th>
                    <th>Catégorie</th>
                    <th>Prix</th>
                    <th>Stock</th>
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
                  ) : products.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--erp-text-muted)' }}>
                        Aucun produit e-commerce
                      </td>
                    </tr>
                  ) : (
                    products.map(product => (
                      <tr key={product.id}>
                        <td>
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              style={{
                                width: '50px',
                                height: '50px',
                                objectFit: 'cover',
                                borderRadius: 'var(--erp-border-radius)'
                              }}
                            />
                          ) : (
                            <div style={{
                              width: '50px',
                              height: '50px',
                              background: 'var(--erp-bg-secondary)',
                              borderRadius: 'var(--erp-border-radius)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <Image size={20} style={{ color: 'var(--erp-text-muted)' }} />
                            </div>
                          )}
                        </td>
                        <td>{product.name}</td>
                        <td>{product.category_id?.[1] || '-'}</td>
                        <td>{product.list_price?.toFixed(2) || '0.00'} TND</td>
                        <td>{product.qty_available?.toFixed(2) || '0.00'}</td>
                        <td>
                          {product.website_published ? (
                            <span className="erp-status-badge done">Publié</span>
                          ) : (
                            <span className="erp-status-badge draft">Non publié</span>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                              onClick={() => handleEdit(product)}
                              className="erp-btn erp-btn-outline"
                              style={{ padding: '4px 8px' }}
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              onClick={() => handlePublish(product.id, !product.website_published)}
                              className={`erp-btn ${product.website_published ? 'erp-btn-warning' : 'erp-btn-success'}`}
                              style={{ padding: '4px 8px' }}
                            >
                              {product.website_published ? <XCircle size={14} /> : <CheckCircle size={14} />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {loading ? (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '32px' }}>
                  Chargement...
                </div>
              ) : products.length === 0 ? (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '32px', color: 'var(--erp-text-muted)' }}>
                  Aucun produit e-commerce
                </div>
              ) : (
                products.map(product => (
                  <div
                    key={product.id}
                    className="erp-kanban-card"
                    onClick={() => handleEdit(product)}
                    style={{ cursor: 'pointer', position: 'relative' }}
                  >
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        style={{
                          width: '100%',
                          height: '200px',
                          objectFit: 'cover',
                          borderRadius: 'var(--erp-border-radius)',
                          marginBottom: '12px'
                        }}
                      />
                    ) : (
                      <div style={{
                        width: '100%',
                        height: '200px',
                        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                        borderRadius: 'var(--erp-border-radius)',
                        marginBottom: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Image size={48} style={{ color: 'var(--erp-text-muted)' }} />
                      </div>
                    )}
                    <div className="erp-kanban-card-title" style={{ marginBottom: '8px' }}>{product.name}</div>
                    {product.category_id && (
                      <div style={{ fontSize: '12px', color: 'var(--erp-text-secondary)', marginBottom: '8px' }}>
                        {product.category_id[1]}
                      </div>
                    )}
                    <div style={{ 
                      fontWeight: 700, 
                      fontSize: '20px', 
                      color: 'var(--erp-primary)',
                      marginBottom: '8px'
                    }}>
                      {product.list_price?.toFixed(2) || '0.00'} TND
                    </div>
                    {product.qty_available !== undefined && (
                      <div style={{ fontSize: '12px', color: 'var(--erp-text-muted)', marginBottom: '8px' }}>
                        Stock: {product.qty_available.toFixed(2)}
                      </div>
                    )}
                    <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      {product.website_published ? (
                        <span className="erp-status-badge done">Publié</span>
                      ) : (
                        <span className="erp-status-badge draft">Non publié</span>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePublish(product.id, !product.website_published);
                        }}
                        className={`erp-btn ${product.website_published ? 'erp-btn-warning' : 'erp-btn-success'}`}
                        style={{ padding: '4px 12px', fontSize: '12px' }}
                      >
                        {product.website_published ? 'Dépublier' : 'Publier'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )
        )}

        {activeTab === 'orders' && (
          <div className="erp-tree-view">
            <table className="erp-tree-table">
              <thead>
                <tr>
                  <th>Référence</th>
                  <th>Client</th>
                  <th>Date</th>
                  <th>Montant</th>
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
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--erp-text-muted)' }}>
                      Aucune commande e-commerce
                    </td>
                  </tr>
                ) : (
                  orders.map(order => (
                    <tr key={order.id}>
                      <td>{order.name}</td>
                      <td>{order.partner_id?.[1] || '-'}</td>
                      <td>{new Date(order.date_order).toLocaleDateString()}</td>
                      <td>{order.amount_total?.toFixed(2) || '0.00'} TND</td>
                      <td>
                        <span className={`erp-status-badge ${getStatusColor(order.state)}`}>
                          {getStatusLabel(order.state)}
                        </span>
                      </td>
                      <td>
                        <button
                          className="erp-btn erp-btn-outline"
                          style={{ padding: '4px 8px' }}
                        >
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="erp-form-view">
            <p style={{ color: 'var(--erp-text-muted)', textAlign: 'center', padding: '32px' }}>
              Gestion des catégories e-commerce (à venir)
            </p>
          </div>
        )}

        {activeTab === 'settings' && (
          <EcommerceSettings />
        )}
      </div>
    </div>
  );
};

// Composant Formulaire Produit
const EcommerceProductForm: React.FC<{
  product: EcommerceProduct | null;
  onClose: () => void;
  onSave: (data: any) => void;
}> = ({ product, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    list_price: product?.list_price || 0,
    website_published: product?.website_published || false,
    description: product?.description || '',
    image: product?.image || '',
    category_id: product?.category_id?.[0] || null,
    website_sequence: product?.website_sequence || 0,
    seo_title: '',
    seo_description: '',
    seo_keywords: ''
  });

  const handleSaveClick = () => {
    onSave(formData);
  };

  return (
    <div className="erp-layout">
      <ERPHeader
        title={product ? `Produit ${product.name}` : 'Nouveau Produit E-commerce'}
        breadcrumb={[
          { label: 'E-commerce' },
          { label: 'Produits' },
          { label: product ? product.name : 'Nouveau' }
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
                label: 'Informations générales',
                content: (
                  <div>
                    <div className="erp-field">
                      <label className="erp-field-label erp-field-required">Nom</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="erp-field-input"
                        placeholder="Nom du produit..."
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div className="erp-field">
                        <label className="erp-field-label erp-field-required">Prix de vente</label>
                        <input
                          type="number"
                          value={formData.list_price}
                          onChange={(e) => setFormData({ ...formData, list_price: parseFloat(e.target.value) || 0 })}
                          className="erp-field-input"
                          step="0.01"
                          min="0"
                        />
                      </div>
                      <div className="erp-field">
                        <label className="erp-field-label">Catégorie</label>
                        <input
                          type="text"
                          value={formData.category_id || ''}
                          onChange={(e) => setFormData({ ...formData, category_id: e.target.value ? parseInt(e.target.value) : null })}
                          className="erp-field-input"
                          placeholder="Sélectionner une catégorie..."
                        />
                      </div>
                    </div>
                    <div className="erp-field">
                      <label className="erp-field-label">Image URL</label>
                      <input
                        type="url"
                        value={formData.image}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        className="erp-field-input"
                        placeholder="https://..."
                      />
                      {formData.image && (
                        <img
                          src={formData.image}
                          alt="Preview"
                          style={{
                            width: '200px',
                            height: '200px',
                            objectFit: 'cover',
                            borderRadius: 'var(--erp-border-radius)',
                            marginTop: '8px'
                          }}
                        />
                      )}
                    </div>
                    <div className="erp-field">
                      <label className="erp-field-label">Description</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="erp-field-input"
                        rows={6}
                        placeholder="Description du produit..."
                      />
                    </div>
                    <div className="erp-field">
                      <label className="erp-field-label">Ordre d'affichage</label>
                      <input
                        type="number"
                        value={formData.website_sequence}
                        onChange={(e) => setFormData({ ...formData, website_sequence: parseInt(e.target.value) || 0 })}
                        className="erp-field-input"
                        min="0"
                      />
                    </div>
                    <div className="erp-field">
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="checkbox"
                          checked={formData.website_published}
                          onChange={(e) => setFormData({ ...formData, website_published: e.target.checked })}
                        />
                        Publié sur le site web
                      </label>
                    </div>
                  </div>
                )
              },
              {
                label: 'SEO',
                content: (
                  <div>
                    <div className="erp-field">
                      <label className="erp-field-label">Titre SEO</label>
                      <input
                        type="text"
                        value={formData.seo_title}
                        onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
                        className="erp-field-input"
                        placeholder="Titre pour les moteurs de recherche..."
                      />
                    </div>
                    <div className="erp-field">
                      <label className="erp-field-label">Description SEO</label>
                      <textarea
                        value={formData.seo_description}
                        onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
                        className="erp-field-input"
                        rows={3}
                        placeholder="Description pour les moteurs de recherche..."
                      />
                    </div>
                    <div className="erp-field">
                      <label className="erp-field-label">Mots-clés SEO</label>
                      <input
                        type="text"
                        value={formData.seo_keywords}
                        onChange={(e) => setFormData({ ...formData, seo_keywords: e.target.value })}
                        className="erp-field-input"
                        placeholder="mots-clés, séparés, par, des, virgules"
                      />
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

// Composant Configuration E-commerce
const EcommerceSettings: React.FC = () => {
  const { success, error } = useNotifications();
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const response = await ecommerceSettingsService.getSettings();
      setSettings(response.data || {});
    } catch (error) {
      console.error('Erreur chargement paramètres e-commerce:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await ecommerceSettingsService.updateSettings(settings);
      success('Paramètres enregistrés avec succès');
    } catch (err: any) {
      error('Erreur enregistrement', err.response?.data?.error?.message || 'Erreur lors de l\'enregistrement');
    }
  };

  return (
    <div className="erp-form-view">
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ 
          fontSize: '24px', 
          fontWeight: 700,
          background: 'var(--erp-primary-gradient)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Configuration E-commerce
        </h2>
        <button onClick={handleSave} className="erp-btn erp-btn-primary">
          <Plus size={16} style={{ marginRight: '4px' }} />
          Enregistrer
        </button>
      </div>

      <ERPNotebook
        tabs={[
          {
            label: 'Site web',
            content: (
              <div>
                <div className="erp-field">
                  <label className="erp-field-label">Nom du site</label>
                  <input
                    type="text"
                    value={settings.site_name || ''}
                    onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                    className="erp-field-input"
                  />
                </div>
                <div className="erp-field">
                  <label className="erp-field-label">URL du site</label>
                  <input
                    type="url"
                    value={settings.site_url || ''}
                    onChange={(e) => setSettings({ ...settings, site_url: e.target.value })}
                    className="erp-field-input"
                    placeholder="https://..."
                  />
                </div>
                <div className="erp-field">
                  <label className="erp-field-label">Logo</label>
                  <input
                    type="url"
                    value={settings.site_logo || ''}
                    onChange={(e) => setSettings({ ...settings, site_logo: e.target.value })}
                    className="erp-field-input"
                    placeholder="https://..."
                  />
                </div>
                <div className="erp-field">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="checkbox"
                      checked={settings.site_active || false}
                      onChange={(e) => setSettings({ ...settings, site_active: e.target.checked })}
                    />
                    Site actif
                  </label>
                </div>
              </div>
            )
          },
          {
            label: 'Paiement',
            content: (
              <div>
                <div className="erp-field">
                  <label className="erp-field-label">Méthodes de paiement</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="checkbox"
                        checked={settings.payment_cash || false}
                        onChange={(e) => setSettings({ ...settings, payment_cash: e.target.checked })}
                      />
                      Espèces
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="checkbox"
                        checked={settings.payment_card || false}
                        onChange={(e) => setSettings({ ...settings, payment_card: e.target.checked })}
                      />
                      Carte bancaire
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="checkbox"
                        checked={settings.payment_online || false}
                        onChange={(e) => setSettings({ ...settings, payment_online: e.target.checked })}
                      />
                      Paiement en ligne
                    </label>
                  </div>
                </div>
              </div>
            )
          },
          {
            label: 'Livraison',
            content: (
              <div>
                <div className="erp-field">
                  <label className="erp-field-label">Frais de livraison</label>
                  <input
                    type="number"
                    value={settings.delivery_cost || 0}
                    onChange={(e) => setSettings({ ...settings, delivery_cost: parseFloat(e.target.value) || 0 })}
                    className="erp-field-input"
                    step="0.01"
                    min="0"
                  />
                </div>
                <div className="erp-field">
                  <label className="erp-field-label">Seuil de livraison gratuite</label>
                  <input
                    type="number"
                    value={settings.free_delivery_threshold || 0}
                    onChange={(e) => setSettings({ ...settings, free_delivery_threshold: parseFloat(e.target.value) || 0 })}
                    className="erp-field-input"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>
            )
          }
        ]}
      />
    </div>
  );
};

export default EcommerceERP;
