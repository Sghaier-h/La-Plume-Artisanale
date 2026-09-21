/**
 * GlobalSearch - Barre de recherche globale
 */

import React, { useState, useEffect, useRef } from 'react';
import { Search, X, FileText, Package, Users, ShoppingCart, Factory, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

interface SearchResult {
  id: number;
  type: string;
  label: string;
  description?: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

const GlobalSearch: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length >= 2) {
      performSearch();
    } else {
      setResults([]);
    }
  }, [query]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isOpen]);

  const performSearch = async () => {
    setLoading(true);
    try {
      const response = await api.post('/search', { query });
      const searchResults: SearchResult[] = [];

      // Commandes
      if (response.data.sale_orders) {
        response.data.sale_orders.forEach((order: any) => {
          searchResults.push({
            id: order.id_commande,
            type: 'Commande',
            label: order.name || `Commande ${order.id_commande}`,
            description: order.partner_name,
            path: `/sale-orders/${order.id_commande}`,
            icon: ShoppingCart
          });
        });
      }

      // Produits
      if (response.data.products) {
        response.data.products.forEach((product: any) => {
          searchResults.push({
            id: product.id_article,
            type: 'Produit',
            label: product.name || product.nom,
            description: product.default_code,
            path: `/products/${product.id_article}`,
            icon: Package
          });
        });
      }

      // Clients
      if (response.data.partners) {
        response.data.partners.forEach((partner: any) => {
          searchResults.push({
            id: partner.id_client,
            type: 'Client',
            label: partner.name || `${partner.nom} ${partner.prenom}`,
            description: partner.email,
            path: `/clients/${partner.id_client}`,
            icon: Users
          });
        });
      }

      // OF
      if (response.data.productions) {
        response.data.productions.forEach((prod: any) => {
          searchResults.push({
            id: prod.id_of,
            type: 'Ordre de Fabrication',
            label: prod.name || `OF ${prod.id_of}`,
            description: prod.product_name,
            path: `/of/${prod.id_of}`,
            icon: Factory
          });
        });
      }

      setResults(searchResults);
    } catch (error) {
      console.error('Erreur recherche:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (result: SearchResult) => {
    navigate(result.path);
    setIsOpen(false);
    setQuery('');
  };

  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'Commande': 'bg-blue-100 text-blue-800',
      'Produit': 'bg-green-100 text-green-800',
      'Client': 'bg-purple-100 text-purple-800',
      'Ordre de Fabrication': 'bg-orange-100 text-orange-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <>
      {/* Search Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors"
      >
        <Search className="w-4 h-4" />
        <span className="hidden md:block text-sm">Rechercher...</span>
        <kbd className="hidden md:block px-2 py-0.5 text-xs bg-white border border-gray-300 rounded">Ctrl+K</kbd>
      </button>

      {/* Search Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20">
          <div ref={searchRef} className="w-full max-w-2xl bg-white rounded-lg shadow-xl">
            {/* Search Input */}
            <div className="flex items-center gap-3 p-4 border-b">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher des commandes, produits, clients, OF..."
                className="flex-1 text-lg focus:outline-none"
                autoFocus
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
              <kbd className="px-2 py-1 text-xs bg-gray-100 border border-gray-300 rounded">Esc</kbd>
            </div>

            {/* Results */}
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center text-gray-500">Recherche en cours...</div>
              ) : results.length === 0 && query.length >= 2 ? (
                <div className="p-8 text-center text-gray-500">Aucun résultat trouvé</div>
              ) : results.length === 0 ? (
                <div className="p-8 text-center text-gray-500">Tapez au moins 2 caractères pour rechercher</div>
              ) : (
                results.map((result) => {
                  const Icon = result.icon;
                  return (
                    <button
                      key={`${result.type}-${result.id}`}
                      onClick={() => handleSelect(result)}
                      className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors text-left"
                    >
                      <Icon className="w-5 h-5 text-gray-400" />
                      <div className="flex-1">
                        <div className="font-medium">{result.label}</div>
                        {result.description && (
                          <div className="text-sm text-gray-500">{result.description}</div>
                        )}
                      </div>
                      <span className={`px-2 py-1 text-xs rounded ${getTypeColor(result.type)}`}>
                        {result.type}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GlobalSearch;
