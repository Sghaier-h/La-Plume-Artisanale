/**
 * CompanySwitcher (§14quater.1 · Phase E1)
 *
 * Sélecteur de société dans la UserBar.
 * - Liste les 5 sociétés visibles via SocieteContext (données backend v2).
 * - Affiche "Vue consolidée (admin)" en bas pour l'ADMIN uniquement.
 * - Au changement, SocieteContext :
 *     1. met à jour localStorage (laplume_societe_active)
 *     2. appelle POST /api/v2/societes/:id/basculer
 *     3. remplace le JWT local par le token raf renvoyé
 * - L'intercepteur axios de SocieteContext ajoute `x-societe-id`
 *   automatiquement sur toutes les requêtes.
 */

import React, { useState } from 'react';
import { Building2, ChevronDown, Check, Loader2, AlertCircle, Globe2 } from 'lucide-react';
import { useSociete, Societe } from '../contexts/SocieteContext';
import { useAuth } from '../hooks/useAuth';

// Utilitaire : URL d'image gérée (absolue ou relative API)
const getImageUrl = (url?: string): string | null => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  return `${apiUrl}${url.startsWith('/') ? url : '/' + url}`;
};

const CompanySwitcher: React.FC = () => {
  const { societe, societes, isConsolide, loading, error, setSociete, setConsolide } =
    useSociete();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const roleUp = String(user?.role || '').toUpperCase();
  const isAdmin = roleUp === 'ADMIN' || roleUp === 'SUPER_ADMIN';

  const selectableSocietes = societes.filter((s) => !s.est_consolidation);

  if (loading && selectableSocietes.length === 0) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-gray-600 text-sm">
        <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
        <span>Chargement sociétés...</span>
      </div>
    );
  }

  if (error && selectableSocietes.length === 0) {
    return (
      <div
        className="flex items-center gap-2 px-3 py-2 text-red-600 bg-red-50 rounded-lg border border-red-200 text-xs"
        title={error}
      >
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
        <span className="truncate">Erreur sociétés</span>
      </div>
    );
  }

  if (selectableSocietes.length === 0) {
    return (
      <div className="px-3 py-2 text-gray-500 text-sm text-center">
        Aucune société disponible
      </div>
    );
  }

  const displayName = isConsolide
    ? 'Vue consolidée'
    : societe?.nom_commercial || societe?.raison_sociale || 'Aucune société';
  const activeLogoUrl = isConsolide ? null : getImageUrl(societe?.logo_url);

  const handleSelect = (next: Societe) => {
    setSociete(next);
    setIsOpen(false);
  };

  const handleConsolide = () => {
    setConsolide(true);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        aria-label="Sélecteur de société"
      >
        {isConsolide ? (
          <Globe2 className="w-5 h-5 text-indigo-600" />
        ) : activeLogoUrl ? (
          <img
            src={activeLogoUrl}
            alt={displayName}
            className="w-5 h-5 object-contain rounded"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const sib = e.currentTarget.nextElementSibling as HTMLElement | null;
              if (sib) sib.style.display = 'flex';
            }}
          />
        ) : null}
        {!isConsolide && (
          <Building2
            className={`w-5 h-5 text-gray-600 ${activeLogoUrl ? 'hidden' : ''}`}
          />
        )}
        <span className="text-sm font-medium text-gray-700 max-w-[200px] truncate">
          {displayName}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-[28rem] overflow-y-auto">
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                Sélectionner une société
              </div>
              {selectableSocietes.map((company) => {
                const isActive =
                  !isConsolide && societe?.id_societe === company.id_societe;
                const companyLogoUrl = getImageUrl(company.logo_url);
                return (
                  <button
                    key={company.id_societe}
                    onClick={() => handleSelect(company)}
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
                          const fallback = e.currentTarget
                            .nextElementSibling as HTMLElement | null;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div
                      className={`w-8 h-8 flex items-center justify-center bg-gray-100 rounded ${
                        companyLogoUrl ? 'hidden' : ''
                      }`}
                    >
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
                      <div className="text-xs text-gray-400">{company.code_societe}</div>
                    </div>
                    {isActive && (
                      <Check className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    )}
                  </button>
                );
              })}

              {isAdmin && (
                <>
                  <div className="my-2 border-t border-gray-200" />
                  <button
                    onClick={handleConsolide}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      isConsolide
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="w-8 h-8 flex items-center justify-center bg-indigo-100 rounded">
                      <Globe2 className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <div className="font-medium">Vue consolidée (admin)</div>
                      <div className="text-xs text-gray-500 truncate">
                        Agrégation des 5 sociétés — reporting groupe
                      </div>
                    </div>
                    {isConsolide && (
                      <Check className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CompanySwitcher;
