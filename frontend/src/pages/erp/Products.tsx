/**
 * ProductsERP - Produits
 * Version complète avec design ERP et langue française
 * AVEC SUPPORT DES IMAGES
 */

import React, { useEffect, useState } from 'react';
import { productTemplatesService, productCategoryService } from '../../services/api';
import { ERPHeader, ERPStatusbar, ERPNotebook, ERPChatter, ERPButtonBox } from '../../components/erp';
import { displayMany2One, formatDate, formatCurrency } from '../../utils/relations';
import { Plus, Edit, Trash2, Eye, Package, Search, List, Grid, Warehouse, TrendingUp, Image, Upload, X } from 'lucide-react';

interface Product {
  id_article: number;
  nom: string;
  reference?: string;
  designation?: string;
  id_categorie?: any;
  id_type_article?: any;
  prix_vente?: number;
  prix_unitaire_base?: number;
  actif?: boolean;
  description?: string;
  specification?: string;
  unite_vente?: string;
  temps_production_standard?: number;
  image_url?: string;
  image_url_full?: string;
  created_at?: string;
  updated_at?: string;
  // Alias pour compatibilité
  id?: number;
  name?: string;
  default_code?: string;
  categ_id?: any;
  type?: 'product' | 'service' | 'consu';
  list_price?: number;
  active?: boolean;
}

const ProductsERP: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState<'list' | 'form'>('list');
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, [search]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params: any = { loadRelations: true };
      if (search) params.search = search;
      const response = await productTemplatesService.getTemplates(params);
      const data = Array.isArray(response.data) ? response.data : response.data.data || [];
      setProducts(data);
    } catch (error) {
      console.error('Erreur chargement produits:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await productCategoryService.getCategories({ limit: 1000 });
      const data = response.data?.data || response.data || [];
      setCategories(data.map((cat: any) => [cat.id, cat.name || cat.nom_categorie]));
    } catch (error) {
      console.error('Erreur chargement catégories:', error);
      // Fallback : extraire depuis les produits
      try {
        const response = await productTemplatesService.getTemplates({ limit: 1000 });
        const catsMap = new Map();
        (response.data?.data || []).forEach((p: any) => {
          if (p.categ_id && !catsMap.has(p.categ_id[0] || p.categ_id?.id)) {
            catsMap.set(p.categ_id[0] || p.categ_id?.id, p.categ_id);
          }
        });
        setCategories(Array.from(catsMap.values()));
      } catch (e) {
        console.error('Erreur fallback catégories:', e);
      }
    }
  };

  const handleCreate = () => {
    setSelectedProduct(null);
    setShowForm(true);
    setViewType('form');
  };

  const handleEdit = async (product: Product) => {
    setSelectedProduct(product);
    setShowForm(true);
    setViewType('form');
    
    // Charger les images si elles existent
    const productId = product.id_article || product.id;
    if (productId) {
      try {
        const imagesResponse = await productTemplatesService.getImages(productId);
        const images = imagesResponse.data?.data?.images || [];
        if (images.length > 0 && images[0].url_full) {
          product.image_url_full = images[0].url_full;
        }
      } catch (error) {
        console.error('Erreur chargement images:', error);
      }
    }
  };

  const handleSave = async (formData: any) => {
    try {
      let savedProduct;
      const productId = selectedProduct?.id_article || selectedProduct?.id;
      if (productId) {
        const response = await productTemplatesService.updateTemplate(productId, formData);
        savedProduct = response.data?.data || response.data;
      } else {
        const response = await productTemplatesService.createTemplate(formData);
        savedProduct = response.data?.data || response.data;
      }
      setShowForm(false);
      setSelectedProduct(null);
      setViewType('list');
      loadProducts();
      return savedProduct;
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'Erreur lors de l\'enregistrement');
      throw error;
    }
  };

  const handleDelete = async (product: Product) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      try {
        const productId = product.id_article || product.id;
        if (productId) {
          await productTemplatesService.deleteTemplate(productId);
          loadProducts();
        }
      } catch (error: any) {
        alert(error.response?.data?.error?.message || 'Erreur lors de la suppression');
      }
    }
  };

  if (showForm) {
    return (
      <ProductForm
        product={selectedProduct}
        categories={categories}
        onClose={() => {
          setShowForm(false);
          setSelectedProduct(null);
          setViewType('list');
          loadProducts();
        }}
        onSave={handleSave}
      />
    );
  }

  return (
    <div className="erp-layout">
      <ERPHeader
        title="Produits"
        breadcrumb={[
          { label: 'Inventaire', path: '/inventory' },
          { label: 'Produits' }
        ]}
        actions={
          <button onClick={handleCreate} className="erp-btn erp-btn-primary">
            <Plus size={16} style={{ marginRight: '4px' }} />
            Nouveau Produit
          </button>
        }
      />

      <div className="erp-content">
        <div style={{ marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--erp-text-muted)' }} />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px 10px 40px',
                border: '1px solid var(--erp-border-color)',
                borderRadius: 'var(--erp-border-radius)',
                fontSize: '14px'
              }}
            />
          </div>
        </div>

        <div className="erp-tree-view">
          <table className="erp-tree-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>Image</th>
                <th>Référence</th>
                <th>Nom</th>
                <th>Catégorie</th>
                <th>Type</th>
                <th>Prix de vente</th>
                <th>Actif</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '32px' }}>
                    Chargement...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '32px', color: 'var(--erp-text-muted)' }}>
                    Aucun produit
                  </td>
                </tr>
              ) : (
                products.map(product => {
                  const productId = product.id_article || product.id || 0;
                  const productName = product.nom || product.name || product.designation || '-';
                  const productRef = product.reference || product.default_code || '-';
                  const productCateg = product.id_categorie || product.categ_id;
                  const productPrice = product.prix_vente || product.prix_unitaire_base || product.list_price || 0;
                  const productActive = product.actif !== false && product.active !== false;
                  const productImage = product.image_url_full || product.image_url;
                  const apiBaseUrl = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';
                  
                  return (
                    <tr key={productId}>
                      <td>
                        {productImage ? (
                          <img
                            src={productImage.startsWith('http') ? productImage : `${apiBaseUrl}${productImage}`}
                            alt={productName}
                            style={{
                              width: '48px',
                              height: '48px',
                              objectFit: 'cover',
                              borderRadius: '8px',
                              border: '1px solid var(--erp-border-color)'
                            }}
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                              const parent = (e.target as HTMLImageElement).parentElement;
                              if (parent) {
                                parent.innerHTML = '<div style="width: 48px; height: 48px; background: var(--erp-bg-secondary); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: var(--erp-text-muted);"><Package size={20} /></div>';
                              }
                            }}
                          />
                        ) : (
                          <div style={{
                            width: '48px',
                            height: '48px',
                            background: 'var(--erp-bg-secondary)',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--erp-text-muted)'
                          }}>
                            <Package size={20} />
                          </div>
                        )}
                      </td>
                      <td>{productRef}</td>
                      <td>{productName}</td>
                      <td>{displayMany2One(productCateg) || '-'}</td>
                      <td>
                        {product.type === 'product' ? 'Stockable' :
                         product.type === 'service' ? 'Service' :
                         product.type === 'consu' ? 'Consommable' : '-'}
                      </td>
                      <td>{formatCurrency(productPrice)}</td>
                      <td>
                        {productActive ? (
                          <span className="erp-status-badge done">Oui</span>
                        ) : (
                          <span className="erp-status-badge cancelled">Non</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            onClick={() => handleEdit(product)}
                            className="erp-btn erp-btn-outline"
                            style={{ padding: '4px 8px' }}
                            title="Voir/Modifier"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(product)}
                            className="erp-btn erp-btn-danger"
                            style={{ padding: '4px 8px' }}
                            title="Supprimer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Composant Formulaire
const ProductForm: React.FC<{
  product: Product | null;
  categories: any[];
  onClose: () => void;
  onSave: (data: any) => Promise<any>;
}> = ({ product, categories, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: product?.name || product?.nom || '',
    default_code: product?.default_code || product?.reference || '',
    categ_id: product?.categ_id?.[0] || product?.categ_id?.id || product?.id_categorie || null,
    type: product?.type || 'product',
    list_price: product?.list_price || product?.prix_vente || 0,
    active: product?.active !== false && product?.actif !== false,
    description: product?.description || '',
    nom: product?.nom || product?.name || '',
    reference: product?.reference || product?.default_code || '',
    designation: product?.designation || product?.nom || product?.name || '',
    id_categorie: product?.id_categorie || product?.categ_id?.[0] || product?.categ_id?.id || null,
    prix_vente: product?.prix_vente || product?.list_price || 0,
    actif: product?.actif !== false && product?.active !== false,
    specification: product?.specification || '',
    unite_vente: product?.unite_vente || ''
  });
  const [stock, setStock] = useState<any>(null);
  const [movements, setMovements] = useState<any[]>([]);
  const [loadingStock, setLoadingStock] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    product?.image_url_full || product?.image_url || null
  );
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    const productId = product?.id_article || product?.id;
    if (productId) {
      loadStock();
      loadMovements();
    }
    // Mettre à jour l'aperçu de l'image quand le produit change
    if (product) {
      setImagePreview(product.image_url_full || product.image_url || null);
      setImageFile(null);
    }
  }, [product?.id_article, product?.id, product?.image_url, product?.image_url_full]);

  const loadStock = async () => {
    const productId = product?.id_article || product?.id;
    if (!productId) return;
    setLoadingStock(true);
    try {
      const response = await productTemplatesService.getProductStock(productId);
      setStock(response.data?.data || null);
    } catch (error) {
      console.error('Erreur chargement stock:', error);
    } finally {
      setLoadingStock(false);
    }
  };

  const loadMovements = async () => {
    const productId = product?.id_article || product?.id;
    if (!productId) return;
    try {
      const response = await productTemplatesService.getProductMovements(productId);
      setMovements(response.data?.data || []);
    } catch (error) {
      console.error('Erreur chargement mouvements:', error);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Créer un aperçu
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = async () => {
    const productId = product?.id_article || product?.id;
    if (productId && product?.image_url) {
      try {
        await productTemplatesService.deleteImage(productId);
        setImagePreview(null);
        setImageFile(null);
      } catch (error) {
        console.error('Erreur suppression image:', error);
      }
    } else {
      setImagePreview(null);
      setImageFile(null);
    }
  };

  const handleSaveClick = async () => {
    // Validation
    if (!formData.nom && !formData.name) {
      alert('Le nom du produit est obligatoire');
      return;
    }
    
    // Préparer les données pour l'API (utiliser les noms de champs de la base de données)
    const apiData = {
      nom: formData.nom || formData.name,
      reference: formData.reference || formData.default_code,
      designation: formData.designation || formData.nom || formData.name,
      id_categorie: formData.id_categorie || formData.categ_id,
      prix_vente: formData.prix_vente || formData.list_price || 0,
      actif: formData.actif !== false && formData.active !== false,
      description: formData.description,
      specification: formData.specification,
      unite_vente: formData.unite_vente,
      type: formData.type || 'product'
    };
    
    // Sauvegarder d'abord le produit
    setUploadingImage(true);
    try {
      const savedProduct = await onSave(apiData);
      
      // Ensuite uploader l'image si elle existe
      if (imageFile) {
        const productId = savedProduct?.id_article || savedProduct?.id || product?.id_article || product?.id;
        if (productId) {
          try {
            await productTemplatesService.uploadImage(productId, imageFile);
            // Recharger le produit pour obtenir l'image mise à jour
            const updated = await productTemplatesService.getTemplate(productId);
            if (updated.data?.data?.image_url_full) {
              setImagePreview(updated.data.data.image_url_full);
            }
          } catch (error) {
            console.error('Erreur upload image:', error);
            alert('Produit enregistré mais erreur lors de l\'upload de l\'image');
          }
        }
      }
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <div className="erp-layout">
      <ERPHeader
        title={product ? `Produit ${product.nom || product.name || product.designation || ''}` : 'Nouveau Produit'}
        breadcrumb={[
          { label: 'Inventaire' },
          { label: 'Produits' },
          { label: product ? (product.nom || product.name || product.designation || 'Nouveau') : 'Nouveau' }
        ]}
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={onClose} className="erp-btn erp-btn-outline">
              Annuler
            </button>
            <button 
              onClick={handleSaveClick} 
              className="erp-btn erp-btn-primary"
              disabled={uploadingImage}
            >
              {uploadingImage ? 'Enregistrement...' : 'Enregistrer'}
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
                    {/* Section Image */}
                    <div className="erp-field" style={{ marginBottom: '24px' }}>
                      <label className="erp-field-label">Photo du produit</label>
                      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                        {imagePreview ? (
                          <div style={{ position: 'relative' }}>
                            <img
                              src={imagePreview.startsWith('http') ? imagePreview : `${process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000'}${imagePreview}`}
                              alt="Aperçu"
                              style={{
                                width: '200px',
                                height: '200px',
                                objectFit: 'cover',
                                borderRadius: '12px',
                                border: '2px solid var(--erp-border-color)',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                              }}
                            />
                            <button
                              onClick={handleRemoveImage}
                              style={{
                                position: 'absolute',
                                top: '8px',
                                right: '8px',
                                background: 'rgba(239, 68, 68, 0.9)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '50%',
                                width: '32px',
                                height: '32px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                              }}
                              title="Supprimer l'image"
                            >
                              <X size={18} />
                            </button>
                          </div>
                        ) : (
                          <div
                            style={{
                              width: '200px',
                              height: '200px',
                              border: '2px dashed var(--erp-border-color)',
                              borderRadius: '12px',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: 'var(--erp-bg-secondary)',
                              cursor: 'pointer',
                              transition: 'all 0.3s'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = 'var(--erp-primary)';
                              e.currentTarget.style.background = 'var(--erp-primary)05';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = 'var(--erp-border-color)';
                              e.currentTarget.style.background = 'var(--erp-bg-secondary)';
                            }}
                            onClick={() => document.getElementById('product-image-input')?.click()}
                          >
                            <Image size={48} style={{ color: 'var(--erp-text-muted)', marginBottom: '8px' }} />
                            <span style={{ fontSize: '14px', color: 'var(--erp-text-secondary)' }}>
                              Cliquer pour ajouter une image
                            </span>
                          </div>
                        )}
                        <div style={{ flex: 1 }}>
                          <input
                            id="product-image-input"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            style={{ display: 'none' }}
                          />
                          <button
                            type="button"
                            onClick={() => document.getElementById('product-image-input')?.click()}
                            className="erp-btn erp-btn-outline"
                            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                          >
                            <Upload size={16} />
                            {imagePreview ? 'Changer l\'image' : 'Ajouter une image'}
                          </button>
                          <p style={{ fontSize: '12px', color: 'var(--erp-text-secondary)', marginTop: '8px' }}>
                            Formats acceptés : JPG, PNG, GIF, WEBP (max 10MB)
                          </p>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div className="erp-field">
                        <label className="erp-field-label erp-field-required">Nom</label>
                        <input
                          type="text"
                          value={formData.nom || formData.name || ''}
                          onChange={(e) => setFormData({ ...formData, nom: e.target.value, name: e.target.value })}
                          className="erp-field-input"
                          placeholder="Nom du produit..."
                          required
                        />
                      </div>
                      <div className="erp-field">
                        <label className="erp-field-label">Référence</label>
                        <input
                          type="text"
                          value={formData.reference || formData.default_code || ''}
                          onChange={(e) => setFormData({ ...formData, reference: e.target.value, default_code: e.target.value })}
                          className="erp-field-input"
                          placeholder="Code produit..."
                        />
                      </div>
                    </div>
                    <div className="erp-field">
                      <label className="erp-field-label">Désignation</label>
                      <input
                        type="text"
                        value={formData.designation || formData.nom || formData.name || ''}
                        onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                        className="erp-field-input"
                        placeholder="Désignation complète..."
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div className="erp-field">
                        <label className="erp-field-label">Catégorie</label>
                        <select
                          value={formData.id_categorie || formData.categ_id || ''}
                          onChange={(e) => {
                            const value = e.target.value ? parseInt(e.target.value) : null;
                            setFormData({ ...formData, id_categorie: value, categ_id: value });
                          }}
                          className="erp-field-input"
                        >
                          <option value="">Aucune catégorie</option>
                          {categories.map(cat => (
                            <option key={cat[0]} value={cat[0]}>
                              {cat[1]}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="erp-field">
                        <label className="erp-field-label erp-field-required">Type</label>
                        <select
                          value={formData.type || 'product'}
                          onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                          className="erp-field-input"
                        >
                          <option value="product">Stockable</option>
                          <option value="consu">Consommable</option>
                          <option value="service">Service</option>
                        </select>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div className="erp-field">
                        <label className="erp-field-label">Prix de vente</label>
                        <input
                          type="number"
                          value={formData.prix_vente || formData.list_price || 0}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value) || 0;
                            setFormData({ ...formData, prix_vente: value, list_price: value });
                          }}
                          className="erp-field-input"
                          step="0.01"
                          min="0"
                        />
                      </div>
                      <div className="erp-field">
                        <label className="erp-field-label">Unité de vente</label>
                        <input
                          type="text"
                          value={formData.unite_vente || ''}
                          onChange={(e) => setFormData({ ...formData, unite_vente: e.target.value })}
                          className="erp-field-input"
                          placeholder="Unité (ex: pièce, m², kg...)"
                        />
                      </div>
                    </div>
                    <div className="erp-field">
                      <label className="erp-field-label">Spécification</label>
                      <textarea
                        value={formData.specification || ''}
                        onChange={(e) => setFormData({ ...formData, specification: e.target.value })}
                        className="erp-field-input"
                        rows={3}
                        placeholder="Spécifications techniques..."
                      />
                    </div>
                    <div className="erp-field">
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="checkbox"
                          checked={formData.actif !== false && formData.active !== false}
                          onChange={(e) => setFormData({ ...formData, actif: e.target.checked, active: e.target.checked })}
                        />
                        Actif
                      </label>
                    </div>
                  </div>
                )
              },
              {
                label: 'Description',
                content: (
                  <div>
                    <div className="erp-field">
                      <label className="erp-field-label">Description</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="erp-field-input"
                        rows={10}
                        placeholder="Description du produit..."
                      />
                    </div>
                  </div>
                )
              },
              {
                label: 'Stock',
                content: (
                  <div>
                    {loadingStock ? (
                      <div style={{ textAlign: 'center', padding: '32px', color: 'var(--erp-text-muted)' }}>
                        Chargement...
                      </div>
                    ) : stock ? (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                        <div style={{ padding: '16px', background: 'var(--erp-bg-secondary)', borderRadius: 'var(--erp-border-radius-lg)' }}>
                          <div style={{ fontSize: '12px', color: 'var(--erp-text-secondary)', marginBottom: '4px' }}>Disponible</div>
                          <div style={{ fontSize: '24px', fontWeight: 600, color: 'var(--erp-primary)' }}>
                            {stock.qty_available || 0}
                          </div>
                        </div>
                        <div style={{ padding: '16px', background: 'var(--erp-bg-secondary)', borderRadius: 'var(--erp-border-radius-lg)' }}>
                          <div style={{ fontSize: '12px', color: 'var(--erp-text-secondary)', marginBottom: '4px' }}>Réservé</div>
                          <div style={{ fontSize: '24px', fontWeight: 600, color: 'var(--erp-warning)' }}>
                            {stock.qty_reserved || 0}
                          </div>
                        </div>
                        <div style={{ padding: '16px', background: 'var(--erp-bg-secondary)', borderRadius: 'var(--erp-border-radius-lg)' }}>
                          <div style={{ fontSize: '12px', color: 'var(--erp-text-secondary)', marginBottom: '4px' }}>Total</div>
                          <div style={{ fontSize: '24px', fontWeight: 600, color: 'var(--erp-text-primary)' }}>
                            {(stock.qty_available || 0) + (stock.qty_reserved || 0)}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '32px', color: 'var(--erp-text-muted)' }}>
                        Aucune information de stock disponible
                      </div>
                    )}
                  </div>
                )
              },
              {
                label: 'Mouvements',
                content: (
                  <div>
                    {movements.length > 0 ? (
                      <table className="erp-tree-table">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Type</th>
                            <th>Quantité</th>
                            <th>Emplacement</th>
                          </tr>
                        </thead>
                        <tbody>
                          {movements.map((move: any, index: number) => (
                            <tr key={index}>
                              <td>{formatDate(move.date_mouvement)}</td>
                              <td>{move.type_mouvement}</td>
                              <td>{move.quantite}</td>
                              <td>{move.location_name || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '32px', color: 'var(--erp-text-muted)' }}>
                        Aucun mouvement
                      </div>
                    )}
                  </div>
                )
              }
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductsERP;
export {};