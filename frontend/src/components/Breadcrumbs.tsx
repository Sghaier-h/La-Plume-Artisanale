/**
 * Breadcrumbs - Fil d'Ariane pour la navigation
 * Permet de naviguer entre les pages et de voir la hiérarchie
 */

import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  path?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  customItems?: BreadcrumbItem[];
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, customItems }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Mapping des routes vers des labels
  const routeLabels: Record<string, string> = {
    '/dashboard-admin': 'Dashboard',
    '/sale-orders': 'Commandes de Vente',
    '/products': 'Produits',
    '/stock-pickings': 'Livraisons / Réceptions',
    '/productions': 'Ordres de Production',
    '/account-moves': 'Écritures Comptables',
    '/purchase-orders': 'Commandes d\'Achat',
    '/crm/leads': 'Leads CRM',
    '/commandes': 'Commandes',
    '/clients': 'Clients',
    '/fournisseurs': 'Fournisseurs',
    '/of': 'Ordres de Fabrication',
    '/machines': 'Machines',
    '/stock': 'Stock',
    '/parametrage': 'Paramétrage',
    '/modeles': 'Modèles',
    '/articles': 'Articles',
  };

  // Générer les breadcrumbs automatiquement depuis l'URL
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    // Ne pas afficher le breadcrumb automatique pour les pages ERP (elles ont leur propre breadcrumb dans ERPHeader)
    const erpPaths = ['/erp', '/products', '/sale-orders', '/stock-pickings', '/purchase-orders', 
                     '/productions', '/account-moves', '/crm', '/hr', '/project', '/inventory', 
                     '/warehouse', '/suppliers', '/bom', '/ecommerce', '/settings', '/quality', 
                     '/soustraitants', '/warehouse-management'];
    const isErpPage = erpPaths.some(path => location.pathname.startsWith(path));
    if (isErpPage) {
      return [];
    }

    const paths = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    let currentPath = '';
    paths.forEach((path, index) => {
      currentPath += `/${path}`;
      const label = routeLabels[currentPath] || 
                    path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ');
      
      // Ne pas ajouter de lien pour le dernier élément
      if (index === paths.length - 1) {
        breadcrumbs.push({ label });
      } else {
        breadcrumbs.push({ label, path: currentPath });
      }
    });

    return breadcrumbs;
  };

  const breadcrumbItems = customItems || items || generateBreadcrumbs();

  if (breadcrumbItems.length <= 1) {
    return null;
  }

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4 px-4 py-2 bg-gray-50 rounded-lg">
      {breadcrumbItems.map((item, index) => {
        const isLast = index === breadcrumbItems.length - 1;
        
        return (
          <React.Fragment key={index}>
            {item.path && !isLast ? (
              <Link
                to={item.path}
                className="flex items-center gap-1 hover:text-blue-600 transition-colors"
              >
                {item.icon && <span className="flex items-center">{item.icon}</span>}
                <span>{item.label}</span>
              </Link>
            ) : (
              <span className={`flex items-center gap-1 ${isLast ? 'text-gray-900 font-medium' : ''}`}>
                {item.icon && <span className="flex items-center">{item.icon}</span>}
                <span>{item.label}</span>
              </span>
            )}
            {!isLast && (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;
