/**
 * Composant Header ERP
 * Header avec breadcrumb et actions
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { getBreadcrumbPath } from '../../utils/breadcrumbPaths';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface ERPHeaderProps {
  title: string;
  breadcrumb?: BreadcrumbItem[];
  actions?: React.ReactNode;
}

const ERPHeader: React.FC<ERPHeaderProps> = ({ title, breadcrumb, actions }) => {
  const navigate = useNavigate();

  // Fonction pour obtenir le chemin d'un breadcrumb (depuis props ou mapping automatique)
  const getItemPath = (item: BreadcrumbItem): string | undefined => {
    if (item.path) return item.path;
    return getBreadcrumbPath(item.label);
  };

  return (
    <div className="erp-header">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {breadcrumb && breadcrumb.length > 0 && (
          <div className="erp-breadcrumb">
            <button
              onClick={() => navigate('/erp/home')}
              style={{
                background: 'none',
                border: 'none',
                color: 'inherit',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '4px',
                borderRadius: '4px',
                transition: 'opacity 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              title="Retour à l'accueil"
            >
              <Home size={16} />
            </button>
            {breadcrumb.map((item, index) => {
              const itemPath = getItemPath(item);
              return (
                <React.Fragment key={index}>
                  <ChevronRight size={16} className="erp-breadcrumb-separator" />
                  <span className="erp-breadcrumb-item">
                    {itemPath ? (
                      <button
                        onClick={() => navigate(itemPath)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'inherit',
                          cursor: 'pointer',
                          textDecoration: 'none',
                          padding: '2px 4px',
                          borderRadius: '4px',
                          transition: 'opacity 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                      >
                        {item.label}
                      </button>
                    ) : (
                      item.label
                    )}
                  </span>
                </React.Fragment>
              );
            })}
          </div>
        )}
        <h1 className="erp-form-title" style={{ color: 'white', margin: 0 }}>
          {title}
        </h1>
      </div>
      {actions && (
        <div style={{ display: 'flex', gap: '8px' }}>
          {actions}
        </div>
      )}
    </div>
  );
};

export default ERPHeader;
