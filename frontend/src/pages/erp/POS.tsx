/**
 * POSERP - Point de Vente
 * Interface complète inspirée d'ERP
 */

import React, { useState, useEffect } from 'react';
import { ShoppingCart, Scan, CreditCard, DollarSign, X, Plus, Minus, Printer, CheckCircle } from 'lucide-react';
import { posService, productsService } from '../../services/api';
import { ERPHeader, ERPStatusbar, useNotifications } from '../../components/erp';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  barcode?: string;
}

interface Payment {
  type: 'cash' | 'card' | 'check';
  amount: number;
}

const POSERP: React.FC = () => {
  const { success, error } = useNotifications();
  const [caisses, setCaisses] = useState<any[]>([]);
  const [selectedCaisse, setSelectedCaisse] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchProduct, setSearchProduct] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [paymentMode, setPaymentMode] = useState<'cash' | 'card' | 'check'>('cash');
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCaisses();
  }, []);

  useEffect(() => {
    if (selectedCaisse) {
      loadSession();
      loadProducts();
    }
  }, [selectedCaisse]);

  const loadCaisses = async () => {
    try {
      const response = await posService.getCaisses({ active: true });
      setCaisses(response.data.data || []);
      if (response.data.data && response.data.data.length > 0) {
        setSelectedCaisse(response.data.data[0]);
      }
    } catch (error) {
      console.error('Erreur chargement caisses:', error);
    }
  };

  const loadSession = async () => {
    try {
      const response = await posService.getSession(selectedCaisse.id_caisse);
      if (response.data.data?.session_active) {
        setSession(response.data.data.session_active);
      }
    } catch (error) {
      console.error('Erreur chargement session:', error);
    }
  };

  const loadProducts = async () => {
    try {
      const params: any = { available_in_pos: true, loadRelations: true };
      const response = await productsService.getProducts(params);
      setProducts(response.data.data || []);
    } catch (error) {
      console.error('Erreur chargement produits:', error);
    }
  };

  const ouvrirSession = async () => {
    try {
      setLoading(true);
      const response = await posService.openSession({
        id_caisse: selectedCaisse.id_caisse,
        montant_ouverture: selectedCaisse.montant_fond_de_caisse || 0
      });
      setSession(response.data.data);
      success('Session ouverte avec succès');
    } catch (err: any) {
      error('Erreur ouverture session', err.response?.data?.error?.message || 'Erreur lors de l\'ouverture de la session');
    } finally {
      setLoading(false);
    }
  };

  const fermerSession = async () => {
    try {
      setLoading(true);
      await posService.closeSession(session.id_session);
      setSession(null);
      success('Session fermée avec succès');
    } catch (err: any) {
      error('Erreur fermeture session', err.response?.data?.error?.message || 'Erreur lors de la fermeture de la session');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: any) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, {
        id: product.id,
        name: product.name || product.display_name,
        price: product.list_price || 0,
        quantity: 1,
        barcode: product.barcode
      }]);
    }
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart(cart.map(item => {
      if (item.id === productId) {
        const newQuantity = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const getTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handlePayment = async () => {
    if (!session) {
      error('Veuillez ouvrir une session');
      return;
    }

    if (cart.length === 0) {
      error('Le panier est vide');
      return;
    }

    try {
      setLoading(true);
      const response = await posService.createSale({
        id_session: session.id_session,
        lignes: cart.map(item => ({
          id_product: item.id,
          quantity: item.quantity,
          price_unit: item.price
        })),
        paiements: [{
          type: paymentMode,
          amount: paymentAmount || getTotal()
        }]
      });

      success('Vente enregistrée avec succès');
      setCart([]);
      setShowPaymentModal(false);
      setPaymentAmount(0);
      loadSession(); // Recharger la session pour mettre à jour les totaux
    } catch (error: any) {
      error('Erreur enregistrement vente', error.response?.data?.error?.message || 'Erreur lors de l\'enregistrement de la vente');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p =>
    (p.name || p.display_name || '').toLowerCase().includes(searchProduct.toLowerCase()) ||
    (p.barcode || '').includes(searchProduct)
  );


  return (
    <div className="erp-layout" style={{ height: '100vh', overflow: 'hidden' }}>
      <ERPHeader
        title="Point de Vente"
        breadcrumb={[{ label: 'Ventes', path: '/sale-orders' }, { label: 'Point de Vente' }]}
        actions={
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {selectedCaisse && (
              <select
                value={selectedCaisse.id_caisse}
                onChange={(e) => {
                  const caisse = caisses.find(c => c.id_caisse === parseInt(e.target.value));
                  setSelectedCaisse(caisse);
                }}
                style={{
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: '1px solid rgba(255,255,255,0.3)',
                  background: 'rgba(255,255,255,0.1)',
                  color: 'white'
                }}
              >
                {caisses.map(c => (
                  <option key={c.id_caisse} value={c.id_caisse} style={{ color: '#000' }}>
                    {c.libelle} ({c.code_caisse})
                  </option>
                ))}
              </select>
            )}
            {!session ? (
              <button
                onClick={ouvrirSession}
                disabled={loading || !selectedCaisse}
                className="erp-btn erp-btn-success"
                style={{ color: 'white' }}
              >
                Ouvrir Session
              </button>
            ) : (
              <button
                onClick={fermerSession}
                disabled={loading}
                className="erp-btn erp-btn-danger"
                style={{ color: 'white' }}
              >
                Fermer Session
              </button>
            )}
          </div>
        }
      />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Zone Produits */}
        <div style={{ 
          width: '60%', 
          display: 'flex', 
          flexDirection: 'column',
          background: 'var(--erp-bg-primary)',
          borderRight: '1px solid var(--erp-border-color)'
        }}>
          {/* Barre de recherche */}
          <div style={{ padding: '16px', borderBottom: '1px solid var(--erp-border-color)' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Scan size={20} />
              <input
                type="text"
                placeholder="Rechercher un produit ou scanner un code-barres..."
                value={searchProduct}
                onChange={(e) => setSearchProduct(e.target.value)}
                className="erp-field-input"
                style={{ flex: 1 }}
                autoFocus
              />
            </div>
          </div>

          {/* Grille de produits */}
          <div style={{ 
            flex: 1, 
            overflowY: 'auto', 
            padding: '16px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: '12px'
          }}>
            {filteredProducts.map(product => (
              <div
                key={product.id}
                onClick={() => addToCart(product)}
                style={{
                  background: 'var(--erp-bg-secondary)',
                  border: '1px solid var(--erp-border-color)',
                  borderRadius: 'var(--erp-border-radius)',
                  padding: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textAlign: 'center'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--erp-bg-hover)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = 'var(--erp-shadow)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--erp-bg-secondary)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: '4px', fontSize: '14px' }}>
                  {product.name || product.display_name}
                </div>
                <div style={{ color: 'var(--erp-text-secondary)', fontSize: '12px' }}>
                  {product.barcode || 'Sans code-barres'}
                </div>
                <div style={{ 
                  marginTop: '8px', 
                  fontWeight: 600, 
                  color: 'var(--erp-primary)',
                  fontSize: '16px'
                }}>
                  {(product.list_price || 0).toFixed(2)} TND
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Zone Panier */}
        <div style={{ 
          width: '40%', 
          display: 'flex', 
          flexDirection: 'column',
          background: 'var(--erp-bg-secondary)'
        }}>
          {/* En-tête panier */}
          <div style={{ 
            padding: '16px', 
            borderBottom: '1px solid var(--erp-border-color)',
            background: 'var(--erp-bg-primary)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <ShoppingCart size={20} />
              <h3 style={{ margin: 0, fontSize: '18px' }}>Panier</h3>
            </div>
            {session && (
              <div style={{ fontSize: '12px', color: 'var(--erp-text-secondary)' }}>
                Session: {session.montant_total_ventes?.toFixed(2) || '0.00'} TND
              </div>
            )}
          </div>

          {/* Liste des articles */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
            {cart.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '32px', 
                color: 'var(--erp-text-muted)' 
              }}>
                <ShoppingCart size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                <p>Le panier est vide</p>
                <p style={{ fontSize: '12px' }}>Sélectionnez des produits pour commencer</p>
              </div>
            ) : (
              cart.map(item => (
                <div
                  key={item.id}
                  style={{
                    background: 'var(--erp-bg-primary)',
                    border: '1px solid var(--erp-border-color)',
                    borderRadius: 'var(--erp-border-radius)',
                    padding: '12px',
                    marginBottom: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, marginBottom: '4px' }}>{item.name}</div>
                    <div style={{ fontSize: '14px', color: 'var(--erp-text-secondary)' }}>
                      {item.price.toFixed(2)} TND × {item.quantity}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="erp-btn erp-btn-outline"
                      style={{ padding: '4px 8px', minWidth: '32px' }}
                    >
                      <Minus size={16} />
                    </button>
                    <span style={{ minWidth: '30px', textAlign: 'center' }}>{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="erp-btn erp-btn-outline"
                      style={{ padding: '4px 8px', minWidth: '32px' }}
                    >
                      <Plus size={16} />
                    </button>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="erp-btn erp-btn-danger"
                      style={{ padding: '4px 8px', marginLeft: '8px' }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Total et Paiement */}
          <div style={{ 
            padding: '16px', 
            borderTop: '2px solid var(--erp-border-color)',
            background: 'var(--erp-bg-primary)'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '16px',
              fontSize: '24px',
              fontWeight: 600
            }}>
              <span>Total:</span>
              <span style={{ color: 'var(--erp-primary)' }}>
                {getTotal().toFixed(2)} TND
              </span>
            </div>

            {cart.length > 0 && (
              <button
                onClick={() => {
                  setPaymentAmount(getTotal());
                  setShowPaymentModal(true);
                }}
                className="erp-btn erp-btn-primary"
                style={{ width: '100%', padding: '16px', fontSize: '18px' }}
                disabled={!session}
              >
                <CreditCard size={20} style={{ marginRight: '8px' }} />
                Payer
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modal de paiement */}
      {showPaymentModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'var(--erp-bg-primary)',
            borderRadius: 'var(--erp-border-radius)',
            padding: '24px',
            width: '400px',
            maxWidth: '90%'
          }}>
            <h3 style={{ marginBottom: '16px' }}>Paiement</h3>
            
            <div style={{ marginBottom: '16px' }}>
              <label className="erp-field-label">Mode de paiement</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setPaymentMode('cash')}
                  className={`erp-btn ${paymentMode === 'cash' ? 'erp-btn-primary' : 'erp-btn-outline'}`}
                  style={{ flex: 1 }}
                >
                  <DollarSign size={16} style={{ marginRight: '4px' }} />
                  Espèce
                </button>
                <button
                  onClick={() => setPaymentMode('card')}
                  className={`erp-btn ${paymentMode === 'card' ? 'erp-btn-primary' : 'erp-btn-outline'}`}
                  style={{ flex: 1 }}
                >
                  <CreditCard size={16} style={{ marginRight: '4px' }} />
                  Carte
                </button>
                <button
                  onClick={() => setPaymentMode('check')}
                  className={`erp-btn ${paymentMode === 'check' ? 'erp-btn-primary' : 'erp-btn-outline'}`}
                  style={{ flex: 1 }}
                >
                  Chèque
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label className="erp-field-label">Montant reçu</label>
              <input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                className="erp-field-input"
                step="0.01"
                min={getTotal()}
                autoFocus
              />
              {paymentAmount >= getTotal() && (
                <div style={{ marginTop: '8px', color: 'var(--erp-success)' }}>
                  Monnaie: {(paymentAmount - getTotal()).toFixed(2)} TND
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="erp-btn erp-btn-outline"
                style={{ flex: 1 }}
              >
                Annuler
              </button>
              <button
                onClick={handlePayment}
                disabled={paymentAmount < getTotal() || loading}
                className="erp-btn erp-btn-success"
                style={{ flex: 1 }}
              >
                <CheckCircle size={16} style={{ marginRight: '4px' }} />
                Valider
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default POSERP;
