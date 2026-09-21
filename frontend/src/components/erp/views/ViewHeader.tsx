/**
 * ViewHeader - En-tête de vue
 * Inclut breadcrumbs, titre, boutons d'action, switch de vues
 */

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ChevronRight, Plus, Edit, Trash2, Save, X, Search, Filter, 
  List, Grid, BarChart3, FileText, MoreVertical, Download, Upload, Printer
} from 'lucide-react';

interface ViewHeaderProps {
  title: string;
  breadcrumbs?: Array<{ label: string; path?: string }>;
  actions?: Array<{
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    action: () => void;
    className?: string;
    variant?: 'primary' | 'secondary' | 'danger';
  }>;
  views?: Array<{
    type: 'list' | 'form' | 'kanban' | 'graph' | 'calendar' | 'tree';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    active?: boolean;
    onClick: () => void;
  }>;
  onSearch?: (search: string) => void;
  onFilter?: () => void;
  showCreateButton?: boolean;
  onCreate?: () => void;
}

const ViewHeader: React.FC<ViewHeaderProps> = ({
  title,
  breadcrumbs = [],
  actions = [],
  views = [],
  onSearch,
  onFilter,
  showCreateButton = true,
  onCreate
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const defaultBreadcrumbs = breadcrumbs.length > 0 
    ? breadcrumbs 
    : [{ label: 'Accueil', path: '/dashboard' }, { label: title }];

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      {/* Breadcrumbs */}
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-2 text-sm">
          {defaultBreadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              {index > 0 && <ChevronRight className="w-4 h-4 text-gray-400" />}
              {crumb.path ? (
                <button
                  onClick={() => navigate(crumb.path!)}
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {crumb.label}
                </button>
              ) : (
                <span className={index === defaultBreadcrumbs.length - 1 ? 'text-gray-900 font-medium' : 'text-gray-600'}>
                  {crumb.label}
                </span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Header principal */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Titre et recherche */}
          <div className="flex items-center gap-4 flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            
            {onSearch && (
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  onChange={(e) => onSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}
          </div>

          {/* Actions et vues */}
          <div className="flex items-center gap-2">
            {/* Filtres */}
            {onFilter && (
              <button
                onClick={onFilter}
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
              >
                <Filter className="w-4 h-4" />
                <span className="text-sm">Filtres</span>
              </button>
            )}

            {/* Switch de vues */}
            {views.length > 0 && (
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                {views.map((view, index) => {
                  const Icon = view.icon;
                  return (
                    <button
                      key={index}
                      onClick={view.onClick}
                      className={`p-2 border-r border-gray-300 last:border-r-0 ${
                        view.active
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                      title={view.label}
                    >
                      <Icon className="w-4 h-4" />
                    </button>
                  );
                })}
              </div>
            )}

            {/* Actions personnalisées */}
            {actions.map((action, index) => {
              const Icon = action.icon || FileText;
              const variantClass = {
                primary: 'bg-blue-600 text-white hover:bg-blue-700',
                secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
                danger: 'bg-red-600 text-white hover:bg-red-700'
              }[action.variant || 'primary'];

              return (
                <button
                  key={index}
                  onClick={action.action}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${variantClass} ${action.className || ''}`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{action.label}</span>
                </button>
              );
            })}

            {/* Bouton Créer */}
            {showCreateButton && onCreate && (
              <button
                onClick={onCreate}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                <Plus className="w-5 h-5" />
                <span>Créer</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewHeader;
