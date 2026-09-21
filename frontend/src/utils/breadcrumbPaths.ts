/**
 * Mapping des catégories de breadcrumbs vers leurs routes
 * Utilisé pour rendre les breadcrumbs cliquables
 */

export const BREADCRUMB_PATHS: Record<string, string> = {
  'Inventaire': '/inventory',
  'Production': '/productions',
  'Vente': '/sale-orders',
  'Ventes': '/sale-orders',
  'Achat': '/purchase-orders',
  'Achats': '/purchase-orders',
  'Stock': '/stock-pickings',
  'CRM': '/crm/leads',
  'Comptabilité': '/account-moves',
  'RH': '/hr/employees',
  'Ressources Humaines': '/hr/employees',
  'Projets': '/projects',
  'E-commerce': '/ecommerce-odoo',
  'Paramètres': '/settings',
  'Qualité': '/quality/checks',
  'Maintenance': '/maintenance',
  'Point de Vente': '/pos',
  'Rapports': '/reports'
};

/**
 * Obtient le chemin pour une catégorie de breadcrumb
 */
export function getBreadcrumbPath(label: string): string | undefined {
  return BREADCRUMB_PATHS[label];
}
