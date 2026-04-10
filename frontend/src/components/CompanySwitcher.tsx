/**
 * CompanySwitcher - Composant pour sélectionner et changer de société active
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Building2, ChevronDown, Check, Loader2, AlertCircle } from 'lucide-react';
import { useApp } from '../store/AppContext';
import api from '../services/api';

interface Company {
  id_societe: number;
  code_societe: string;
  raison_sociale: string;
  nom_commercial?: string;
  logo_url?: string;
}

// Utilitaire pour construire l'URL complète d'une image
const getImageUrl = (url?: string): string | null => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  // URL relative - ajouter le préfixe de l'API
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  return `${apiUrl}${url.startsWith('/') ? url : '/' + url}`;
};

const CompanySwitcher: React.FC = () => {
  const { state, setActiveCompany, addNotification } = useApp();
  const activeCompany = state.activeCompany;
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const initializedRef = useRef(false);

  // Utiliser useCallback pour stabiliser la fonction
  const handleSetActiveCompany = useCallback((company: Company | null) => {
    setActiveCompany(company);
  }, [setActiveCompany]);

  useEffect(() => {
    if (!initializedRef.current) {
      loadCompanies();
      initializedRef.current = true;
    }
  }, []);

  useEffect(() => {
    // Si des sociétés sont chargées et qu'on n'a pas encore initialisé la société active
    if (companies.length > 0 && initializedRef.current) {
      // Si une société active est sauvegardée, vérifier qu'elle existe toujours
      if (activeCompany?.id_societe) {
        const companyExists = companies.some(c => c.id_societe === activeCompany.id_societe);
        if (!companyExists) {
          // La société sauvegardée n'existe plus, prendre la première
          handleSetActiveCompany(companies[0]);
          addNotification({
            id: `company-invalid-${Date.now()}`,
            type: 'warning',
            title: 'Société introuvable',
            message: `La société précédemment active n'existe plus. ${companies[0]?.raison_sociale || 'Première société'} sélectionnée.`,
            duration: 3000,
          });
        }
      } else {
        // Aucune société active, sélectionner la première
        handleSetActiveCompany(companies[0]);
      }
    }
  }, [companies, activeCompany, handleSetActiveCompany, addNotification]);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/multisociete/societes');
      if (response.data.success && response.data.data?.societes) {
        const loadedCompanies = response.data.data.societes;
        setCompanies(loadedCompanies);
        
        // Si aucune société n'est trouvée
        if (loadedCompanies.length === 0) {
          setError('Aucune société disponible');
          addNotification({
            id: `company-empty-${Date.now()}`,
            type: 'warning',
            title: 'Aucune société',
            message: 'Aucune société active n\'a été trouvée. Veuillez créer une société dans le paramétrage.',
            duration: 5000,
          });
        }
      } else {
        throw new Error('Format de réponse invalide');
      }
    } catch (error: any) {
      console.error('Erreur chargement sociétés:', error);
      const errorMessage = error.response?.data?.error?.message || error.message || 'Impossible de charger les sociétés';
      setError(errorMessage);
      addNotification({
        id: `company-load-error-${Date.now()}`,
        type: 'error',
        title: 'Erreur de chargement',
        message: errorMessage,
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCompany = (company: Company) => {
    handleSetActiveCompany(company);
    setIsOpen(false);
    addNotification({
      id: `company-switched-${Date.now()}`,
      type: 'success',
      title: 'Société changée',
      message: `Société active: ${company.nom_commercial || company.raison_sociale}`,
      duration: 2000,
    });
  };

  if (loading && companies.length === 0) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-gray-600 text-sm">
        <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
        <span>Chargement...</span>
      </div>
    );
  }

  if (error && companies.length === 0) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-red-600 bg-red-50 rounded-lg border border-red-200 text-xs">
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
        <span className="truncate">{error}</span>
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <div className="px-3 py-2 text-gray-500 text-sm text-center">
        Aucune société disponible
      </div>
    );
  }

  const displayName = activeCompany?.nom_commercial || activeCompany?.raison_sociale || 'Aucune société';
  const activeCompanyLogoUrl = getImageUrl(activeCompany?.logo_url);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        {activeCompanyLogoUrl ? (
          <img
            src={activeCompanyLogoUrl}
            alt={displayName}
            className="w-5 h-5 object-contain rounded"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              if (e.currentTarget.nextElementSibling) {
                (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
              }
            }}
          />
        ) : null}
        <Building2 className={`w-5 h-5 text-gray-600 ${activeCompanyLogoUrl ? 'hidden' : ''}`} />
        <span className="text-sm font-medium text-gray-700 max-w-[200px] truncate">
          {displayName}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-96 overflow-y-auto">
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                Sélectionner une société
              </div>
              {companies.map((company) => {
                const isActive = activeCompany?.id_societe === company.id_societe;
                const companyLogoUrl = getImageUrl(company.logo_url);
                return (
                  <button
                    key={company.id_societe}
                    onClick={() => handleSelectCompany(company)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    {companyLogoUrl ? (
                      <img
                        src={companyLogoUrl}
                        alt={company.raison_sociale}
                        className="w-8 h-8 object-contain rounded border border-gray-200"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                          if (fallback) {
                            fallback.style.display = 'flex';
                          }
                        }}
                      />
                    ) : null}
                    <div className={`w-8 h-8 flex items-center justify-center bg-gray-100 rounded ${companyLogoUrl ? 'hidden' : ''}`}>
                      <Building2 className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <div className="font-medium truncate">
                        {company.nom_commercial || company.raison_sociale}
                      </div>
                      {company.nom_commercial && (
                        <div className="text-xs text-gray-500 truncate">
                          {company.raison_sociale}
                        </div>
                      )}
                      <div className="text-xs text-gray-400">
                        {company.code_societe}
                      </div>
                    </div>
                    {isActive && (
                      <Check className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CompanySwitcher;
