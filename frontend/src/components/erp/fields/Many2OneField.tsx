/**
 * Many2OneField - Champ Many2One réutilisable
 * Système ERP La Plume Artisanale
 */

import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import api from '../../../services/api';
import { displayMany2One, formatMany2One } from '../../../utils/relations';

interface Many2OneFieldProps {
  value: any;
  onChange: (value: any) => void;
  model: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  searchFields?: string[];
  disabled?: boolean;
}

const Many2OneField: React.FC<Many2OneFieldProps> = ({
  value,
  onChange,
  model,
  label,
  required = false,
  placeholder,
  searchFields = ['name'],
  disabled = false
}) => {
  const [options, setOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState<any[]>([]);

  useEffect(() => {
    loadOptions();
  }, [model]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = options.filter(opt => {
        const name = displayMany2One(opt);
        return name.toLowerCase().includes(searchTerm.toLowerCase());
      });
      setFilteredOptions(filtered);
    } else {
      setFilteredOptions(options);
    }
  }, [searchTerm, options]);

  const loadOptions = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/${model}`, {
        params: { limit: 1000 }
      });
      const data = response.data?.data || response.data || [];
      setOptions(data.map((item: any) => [item.id, item.name || item.raison_sociale || item.nom_article || item.reference]));
      setFilteredOptions(data.map((item: any) => [item.id, item.name || item.raison_sociale || item.nom_article || item.reference]));
    } catch (error) {
      console.error(`Erreur chargement ${model}:`, error);
      setOptions([]);
      setFilteredOptions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (option: any) => {
    onChange(option);
    setShowDropdown(false);
    setSearchTerm('');
  };

  const handleClear = () => {
    onChange(null);
    setSearchTerm('');
  };

  const selectedValue = formatMany2One(value);
  const displayValue = selectedValue ? selectedValue.name : '';

  return (
    <div className="erp-field" style={{ position: 'relative' }}>
      <label className={`erp-field-label ${required ? 'erp-field-required' : ''}`}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', gap: '4px' }}>
          <input
            type="text"
            value={showDropdown ? searchTerm : displayValue}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            placeholder={placeholder || `Rechercher ${label.toLowerCase()}...`}
            className="erp-field-input"
            disabled={disabled}
            style={{ flex: 1 }}
          />
          {selectedValue && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="erp-btn erp-btn-outline"
              style={{ padding: '8px 12px' }}
            >
              <X size={16} />
            </button>
          )}
        </div>
        
        {showDropdown && !disabled && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              background: 'white',
              border: '1px solid var(--erp-border-color)',
              borderRadius: 'var(--erp-border-radius-lg)',
              boxShadow: 'var(--erp-shadow-lg)',
              zIndex: 1000,
              maxHeight: '300px',
              overflowY: 'auto',
              marginTop: '4px'
            }}
          >
            {loading ? (
              <div style={{ padding: '16px', textAlign: 'center', color: 'var(--erp-text-muted)' }}>
                Chargement...
              </div>
            ) : filteredOptions.length === 0 ? (
              <div style={{ padding: '16px', textAlign: 'center', color: 'var(--erp-text-muted)' }}>
                Aucun résultat
              </div>
            ) : (
              filteredOptions.map((option, index) => (
                <div
                  key={option[0] || index}
                  onClick={() => handleSelect(option)}
                  style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    borderBottom: '1px solid var(--erp-border-color)',
                    transition: 'var(--erp-transition-fast)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--erp-bg-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'white';
                  }}
                >
                  {option[1] || `ID ${option[0]}`}
                </div>
              ))
            )}
          </div>
        )}
      </div>
      {selectedValue && (
        <div style={{ marginTop: '4px', fontSize: '12px', color: 'var(--erp-text-secondary)' }}>
          ID: {selectedValue.id}
        </div>
      )}
    </div>
  );
};

export default Many2OneField;
