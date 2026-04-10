/**
 * Composant de recherche avancée réutilisable
 * Système ERP La Plume Artisanale
 */

import React, { useState } from 'react';
import { Search, X, Filter, ChevronDown, ChevronUp } from 'lucide-react';

export interface SearchFilter {
  field: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'boolean';
  options?: { value: any; label: string }[];
}

interface AdvancedSearchProps {
  onSearch: (searchTerm: string, filters: Record<string, any>) => void;
  filters?: SearchFilter[];
  placeholder?: string;
  showAdvanced?: boolean;
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  onSearch,
  filters = [],
  placeholder = 'Rechercher...',
  showAdvanced = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const [showFilters, setShowFilters] = useState(showAdvanced);

  const handleSearch = () => {
    onSearch(searchTerm, activeFilters);
  };

  const handleFilterChange = (field: string, value: any) => {
    setActiveFilters(prev => {
      const newFilters = { ...prev };
      if (value === null || value === '' || value === undefined) {
        delete newFilters[field];
      } else {
        newFilters[field] = value;
      }
      return newFilters;
    });
  };

  const clearFilters = () => {
    setActiveFilters({});
    setSearchTerm('');
    onSearch('', {});
  };

  const activeFilterCount = Object.keys(activeFilters).length;

  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <div style={{ flex: 1, display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Search size={20} style={{ color: 'var(--erp-text-muted)' }} />
          <input
            type="text"
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="erp-field-input"
            style={{ flex: 1 }}
          />
          {searchTerm && (
            <button
              onClick={() => { setSearchTerm(''); onSearch('', activeFilters); }}
              className="erp-btn erp-btn-outline"
              style={{ padding: '8px' }}
            >
              <X size={16} />
            </button>
          )}
        </div>
        <button
          onClick={handleSearch}
          className="erp-btn erp-btn-primary"
          style={{ padding: '8px 16px' }}
        >
          Rechercher
        </button>
        {filters.length > 0 && (
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="erp-btn erp-btn-outline"
            style={{ 
              padding: '8px 16px',
              position: 'relative'
            }}
          >
            <Filter size={16} style={{ marginRight: '4px' }} />
            Filtres
            {activeFilterCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  background: 'var(--erp-danger)',
                  color: 'white',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 600
                }}
              >
                {activeFilterCount}
              </span>
            )}
            {showFilters ? <ChevronUp size={16} style={{ marginLeft: '4px' }} /> : <ChevronDown size={16} style={{ marginLeft: '4px' }} />}
          </button>
        )}
        {(searchTerm || activeFilterCount > 0) && (
          <button
            onClick={clearFilters}
            className="erp-btn erp-btn-outline"
            style={{ padding: '8px 16px' }}
          >
            Réinitialiser
          </button>
        )}
      </div>

      {showFilters && filters.length > 0 && (
        <div
          style={{
            marginTop: '16px',
            padding: '16px',
            background: 'var(--erp-bg-secondary)',
            borderRadius: 'var(--erp-border-radius-lg)',
            border: '1px solid var(--erp-border-color)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px'
          }}
        >
          {filters.map(filter => (
            <div key={filter.field} className="erp-field">
              <label className="erp-field-label">{filter.label}</label>
              {filter.type === 'text' && (
                <input
                  type="text"
                  value={activeFilters[filter.field] || ''}
                  onChange={(e) => handleFilterChange(filter.field, e.target.value)}
                  className="erp-field-input"
                  placeholder={filter.label}
                />
              )}
              {filter.type === 'number' && (
                <input
                  type="number"
                  value={activeFilters[filter.field] || ''}
                  onChange={(e) => handleFilterChange(filter.field, e.target.value ? parseFloat(e.target.value) : null)}
                  className="erp-field-input"
                  placeholder={filter.label}
                />
              )}
              {filter.type === 'date' && (
                <input
                  type="date"
                  value={activeFilters[filter.field] || ''}
                  onChange={(e) => handleFilterChange(filter.field, e.target.value)}
                  className="erp-field-input"
                />
              )}
              {filter.type === 'select' && filter.options && (
                <select
                  value={activeFilters[filter.field] || ''}
                  onChange={(e) => handleFilterChange(filter.field, e.target.value || null)}
                  className="erp-field-input"
                >
                  <option value="">Tous</option>
                  {filter.options.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}
              {filter.type === 'boolean' && (
                <select
                  value={activeFilters[filter.field] === undefined ? '' : activeFilters[filter.field] ? 'true' : 'false'}
                  onChange={(e) => handleFilterChange(filter.field, e.target.value === '' ? null : e.target.value === 'true')}
                  className="erp-field-input"
                >
                  <option value="">Tous</option>
                  <option value="true">Oui</option>
                  <option value="false">Non</option>
                </select>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch;
