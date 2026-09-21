/**
 * MonetaryField - Champ monétaire
 */

import React from 'react';

interface MonetaryFieldProps {
  name?: string;
  value: number;
  currency?: string;
  readOnly?: boolean;
  readonly?: boolean; // Alias pour readOnly
  onChange?: (value: number) => void;
}

export const MonetaryField: React.FC<MonetaryFieldProps> = ({
  name = '',
  value,
  currency = 'TND',
  readOnly = false,
  readonly,
  onChange
}) => {
  const actualReadOnly = readOnly || readonly || false;
  const formatValue = (val: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency
    }).format(val || 0);
  };

  if (actualReadOnly) {
    return <span>{formatValue(value)}</span>;
  }

  return (
    <div className="monetary-field">
      <input
        type="number"
        name={name}
        value={value || 0}
        onChange={(e) => onChange?.(parseFloat(e.target.value) || 0)}
        step="0.01"
        className="form-control"
      />
      <span className="currency">{currency}</span>
    </div>
  );
};

export default MonetaryField;
