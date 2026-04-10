/**
 * SaleOrderForm - Composant React généré depuis la vue JSON
 * Système de vues professionnel
 */

import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Many2OneField from './fields/Many2OneField';
import One2ManyField from './fields/One2ManyField';
import MonetaryField from './fields/MonetaryField';

interface SaleOrderFormProps {
  recordId?: string;
  onSave?: () => void;
  onCancel?: () => void;
}

export const SaleOrderForm: React.FC<SaleOrderFormProps> = ({ 
  recordId, 
  onSave, 
  onCancel 
}) => {
  const [record, setRecord] = useState<any>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (recordId) {
      loadRecord();
    }
  }, [recordId]);

  const loadRecord = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/sale/orders/${recordId}`);
      setRecord(response.data.data);
    } catch (error) {
      console.error('Error loading record:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (fieldName: string, value: any) => {
    setRecord((prev: any) => ({ ...prev, [fieldName]: value }));
  };

  const handleAction = async (actionName: string) => {
    try {
      const response = await api.post(`/api/sale/orders/${record.id}/${actionName}`);
      setRecord(response.data.data);
    } catch (error) {
      console.error('Error executing action:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (record.id) {
        await api.put(`/api/sale/orders/${record.id}`, record);
      } else {
        await api.post(`/api/sale/orders`, record);
      }
      onSave?.();
    } catch (error) {
      console.error('Error saving record:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !record.id) {
    return <div>Loading...</div>;
  }

  return (
    <div className="sale-order-form">
      {/* Header */}
      <div className="view-header">
        <div className="header-buttons">
          {record.state === 'draft' && (
            <button
              onClick={() => handleAction('confirm')}
              className="btn btn-primary"
            >
              Confirmer
            </button>
          )}
          {!['cancel', 'done'].includes(record.state) && (
            <button
              onClick={() => handleAction('cancel')}
              className="btn btn-secondary"
            >
              Annuler
            </button>
          )}
        </div>
        {record.state && (
          <div className="statusbar">
            {['draft', 'sent', 'sale'].map((state) => (
              <span
                key={state}
                className={record.state === state ? 'active' : ''}
              >
                {state === 'draft' ? 'Brouillon' : state === 'sent' ? 'Envoyé' : state === 'sale' ? 'Confirmé' : state}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Sheet */}
      <div className="view-sheet">
        {/* Order Information */}
        <div className="form-group" data-group="main">
          <h3>Informations de la commande</h3>
          <div className="form-fields">
            <div className="form-field" data-field="name">
              <label>Référence commande</label>
              <input
                type="text"
                name="name"
                value={record.name || ''}
                readOnly
              />
            </div>
            <div className="form-field" data-field="partner_id">
              <label>Client</label>
              <Many2OneField
                model="res.partner"
                value={record.partner_id}
                onChange={(value) => handleFieldChange('partner_id', value)}
                label="Client"
                required
              />
            </div>
            <div className="form-field" data-field="date_order">
              <label>Date de commande</label>
              <input
                type="datetime-local"
                name="date_order"
                value={record.date_order || ''}
                onChange={(e) => handleFieldChange('date_order', e.target.value)}
                required
              />
            </div>
            <div className="form-field" data-field="state">
              <label>État</label>
              <input
                type="text"
                name="state"
                value={record.state || ''}
                readOnly
              />
            </div>
          </div>
        </div>

        {/* Amounts */}
        <div className="form-group" data-group="amounts">
          <h3>Montants</h3>
          <div className="form-fields">
            <div className="form-field" data-field="amount_untaxed">
              <label>Montant HT</label>
              <MonetaryField
                name="amount_untaxed"
                value={record.amount_untaxed || 0}
                currency={record.currency_id}
                readOnly
              />
            </div>
            <div className="form-field" data-field="amount_tax">
              <label>Taxes</label>
              <MonetaryField
                name="amount_tax"
                value={record.amount_tax || 0}
                currency={record.currency_id}
                readOnly
              />
            </div>
            <div className="form-field" data-field="amount_total">
              <label>Total</label>
              <MonetaryField
                name="amount_total"
                value={record.amount_total || 0}
                currency={record.currency_id}
                readOnly
              />
            </div>
          </div>
        </div>

        {/* Order Lines */}
        <div className="view-notebook">
          <div className="tabs">
            <div className="tab">
              <h4>Lignes de commande</h4>
              <div className="form-field" data-field="order_line">
                <One2ManyField
                  name="order_line"
                  model="sale.order.line"
                  value={record.order_line || []}
                  fields={[
                    { name: 'product_id', string: 'Product', type: 'many2one', required: true },
                    { name: 'quantity', string: 'Quantity', type: 'float', required: true },
                    { name: 'price_unit', string: 'Unit Price', type: 'monetary', required: true },
                    { name: 'discount', string: 'Discount (%)', type: 'float' },
                    { name: 'price_subtotal', string: 'Subtotal', type: 'monetary', readonly: true }
                  ]}
                  onChange={(value) => handleFieldChange('order_line', value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="form-actions">
        <button onClick={handleSave} className="btn btn-primary">
          Enregistrer
        </button>
        <button onClick={onCancel} className="btn btn-secondary">
          Annuler
        </button>
      </div>
    </div>
  );
};

export default SaleOrderForm;
