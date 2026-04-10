/**
 * PartialDeliveryModal - Modal pour créer une livraison partielle
 * Permet de sélectionner les quantités à livrer pour chaque ligne de commande
 */

import React, { useState, useEffect } from 'react';
import { X, Truck, Package, CheckCircle, AlertTriangle } from 'lucide-react';

interface PartialDeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderLines: Array<{
    product_id: number;
    product: any;
    product_uom_qty: number;
    qty_delivered?: number;
    qty_remaining?: number;
    price_unit: number;
  }>;
  onSubmit: (deliveryLines: Array<{ product_id: number; quantity: number }>) => void;
  orderId?: number;
  partnerId?: number;
}

const PartialDeliveryModal: React.FC<PartialDeliveryModalProps> = ({
  isOpen,
  onClose,
  orderLines,
  onSubmit,
  orderId,
  partnerId
}) => {
  const [deliveryQuantities, setDeliveryQuantities] = useState<{ [key: number]: number }>({});
  const [errors, setErrors] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    if (isOpen) {
      // Initialiser les quantités à livrer avec les quantités restantes ou commandées
      const initialQuantities: { [key: number]: number } = {};
      orderLines.forEach((line) => {
        const productId = line.product_id || line.product?.id || line.product?.id_produit;
        if (productId) {
          const remaining = line.qty_remaining || line.product_uom_qty || 0;
          initialQuantities[productId] = Math.max(0, remaining);
        }
      });
      setDeliveryQuantities(initialQuantities);
      setErrors({});
    }
  }, [isOpen, orderLines]);

  const handleQuantityChange = (productId: number, value: string) => {
    const quantity = parseFloat(value) || 0;
    const line = orderLines.find(l => (l.product_id || l.product?.id || l.product?.id_produit) === productId);
    
    if (!line) return;

    const maxQty = line.qty_remaining || line.product_uom_qty || 0;
    
    if (quantity < 0) {
      setErrors(prev => ({ ...prev, [productId]: 'La quantité ne peut pas être négative' }));
    } else if (quantity > maxQty) {
      setErrors(prev => ({ ...prev, [productId]: `Quantité max: ${maxQty.toFixed(2)}` }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[productId];
        return newErrors;
      });
      setDeliveryQuantities(prev => ({ ...prev, [productId]: quantity }));
    }
  };

  const handleSubmit = () => {
    // Vérifier qu'au moins une ligne a une quantité > 0
    const hasQuantity = Object.values(deliveryQuantities).some(qty => qty > 0);
    
    if (!hasQuantity) {
      alert('Veuillez saisir au moins une quantité à livrer');
      return;
    }

    // Vérifier les erreurs
    if (Object.keys(errors).length > 0) {
      alert('Veuillez corriger les erreurs avant de continuer');
      return;
    }

    // Préparer les lignes de livraison
    const deliveryLines = orderLines
      .filter(line => {
        const productId = line.product_id || line.product?.id || line.product?.id_produit;
        return productId && deliveryQuantities[productId] > 0;
      })
      .map(line => {
        const productId = line.product_id || line.product?.id || line.product?.id_produit;
        return {
          product_id: productId!,
          quantity: deliveryQuantities[productId!] || 0,
        };
      });

    onSubmit(deliveryLines);
    onClose();
  };

  if (!isOpen) return null;

  const linesWithRemaining = orderLines.filter(line => {
    const remaining = line.qty_remaining || 0;
    return remaining > 0;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <Truck className="w-6 h-6 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900">Livraison Partielle</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Contenu */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">Instructions :</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Saisissez les quantités à livrer pour chaque article</li>
                    <li>Les quantités restantes sont préremplies</li>
                    <li>Vous pouvez modifier les quantités selon le stock disponible</li>
                    <li>Un bon de livraison sera créé avec les quantités saisies</li>
                    <li>Les reliquats resteront disponibles pour une future livraison</li>
                  </ul>
                </div>
              </div>
            </div>

            {linesWithRemaining.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <p className="text-lg font-semibold text-gray-900 mb-2">Commande complètement livrée</p>
                <p className="text-sm text-gray-600">Tous les articles ont été livrés.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {linesWithRemaining.map((line) => {
                  const productId = line.product_id || line.product?.id || line.product?.id_produit;
                  const product = line.product || {};
                  const orderedQty = line.product_uom_qty || 0;
                  const deliveredQty = line.qty_delivered || 0;
                  const remainingQty = line.qty_remaining || (orderedQty - deliveredQty);
                  const deliveryQty = deliveryQuantities[productId!] || 0;
                  const error = errors[productId!];

                  return (
                    <div key={productId} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">
                            {product.name || product.designation_article || product.libelle || `Produit #${productId}`}
                          </h4>
                          <div className="text-sm text-gray-600 space-y-1">
                            {(product.default_code || product.code_article || product.ref_commercial) && (
                              <div className="font-mono">
                                Ref: {product.default_code || product.code_article || product.ref_commercial}
                              </div>
                            )}
                            <div className="flex gap-4">
                              <span>Commandé: <strong>{orderedQty.toFixed(2)}</strong></span>
                              <span className="text-green-600">Livré: <strong>{deliveredQty.toFixed(2)}</strong></span>
                              <span className="text-orange-600">Restant: <strong>{remainingQty.toFixed(2)}</strong></span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <label className="text-sm font-medium text-gray-700 min-w-[100px]">
                          Quantité à livrer:
                        </label>
                        <input
                          type="number"
                          min="0"
                          max={remainingQty}
                          step="0.01"
                          value={deliveryQty}
                          onChange={(e) => handleQuantityChange(productId!, e.target.value)}
                          className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                            error ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                        />
                        <span className="text-sm text-gray-600 min-w-[60px]">
                          / {remainingQty.toFixed(2)}
                        </span>
                        {error && (
                          <span className="text-xs text-red-600">{error}</span>
                        )}
                      </div>

                      {deliveryQty > 0 && (
                        <div className="mt-2 text-sm text-gray-600">
                          Nouveau reliquat: <strong className="text-orange-600">
                            {(remainingQty - deliveryQty).toFixed(2)}
                          </strong>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Annuler
            </button>
            {linesWithRemaining.length > 0 && (
              <button
                onClick={handleSubmit}
                disabled={Object.keys(errors).length > 0 || Object.values(deliveryQuantities).every(qty => qty === 0)}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Truck className="w-4 h-4" />
                Créer le bon de livraison
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartialDeliveryModal;
