/**
 * Configuration centralisée des dashboards opérateurs.
 * - Barre du haut : dashboards accessibles par catégorie
 * - Menu gauche : sections / catégories du dashboard courant
 */

export type DashboardId =
  | 'admin'
  | 'tisseur'
  | 'chef-production'
  | 'magasinier-mp'
  | 'post-coupe'
  | 'controle-central'
  | 'chef-atelier'
  | 'magasinier-soustraitants';

export interface DashboardItem {
  id: DashboardId;
  path: string;
  label: string;
  category: string;
  icon: string; // nom d'icône Lucide
}

export interface DashboardSection {
  id: string;
  label: string;
  icon: string;
}

/** Liste des dashboards avec catégorie pour la barre du haut (par catégorie) */
export const DASHBOARD_LIST: DashboardItem[] = [
  { id: 'admin', path: '/dashboard-admin', label: 'Admin', category: 'Pilotage', icon: 'LayoutDashboard' },
  { id: 'chef-production', path: '/dashboard-chef-production', label: 'Chef Production', category: 'Pilotage', icon: 'Factory' },
  { id: 'tisseur', path: '/dashboard-tisseur', label: 'Tisseur', category: 'Production', icon: 'Activity' },
  { id: 'magasinier-mp', path: '/dashboard-magasinier-mp', label: 'Mag. MP', category: 'Production', icon: 'Package' },
  { id: 'post-coupe', path: '/dashboard-post-coupe', label: 'Post Coupe', category: 'Production', icon: 'Scissors' },
  { id: 'controle-central', path: '/dashboard-controle-central', label: 'Contrôle', category: 'Qualité', icon: 'CheckCircle' },
  { id: 'chef-atelier', path: '/chef-atelier-dashboard', label: 'Chef Atelier', category: 'Atelier', icon: 'Briefcase' },
  { id: 'magasinier-soustraitants', path: '/dashboard-magasinier-soustraitants', label: 'Mag. Sous-traitants', category: 'Logistique', icon: 'Truck' },
];

/** Sections (menu gauche) par dashboard */
export const DASHBOARD_SECTIONS: Record<DashboardId, DashboardSection[]> = {
  admin: [
    { id: 'vue-generale', label: 'Vue Générale', icon: 'LayoutDashboard' },
    { id: 'fabrication-gpao', label: 'Fabrication & GPAO', icon: 'Factory' },
    { id: 'taches', label: 'Tâches', icon: 'CheckCircle' },
    { id: 'avancements', label: 'Avancements', icon: 'TrendingUp' },
    { id: 'financier', label: 'Coûts & CA', icon: 'DollarSign' },
    { id: 'interventions', label: 'Interventions', icon: 'Wrench' },
  ],
  tisseur: [
    { id: 'machines', label: 'Mes Machines', icon: 'Box' },
    { id: 'incidents', label: 'Incidents', icon: 'AlertTriangle' },
    { id: 'rendement', label: 'Mon Rendement', icon: 'Activity' },
  ],
  'chef-production': [
    { id: 'vue-generale', label: 'Vue Générale', icon: 'Activity' },
    { id: 'planification', label: 'Planification', icon: 'Calendar' },
    { id: 'fabrication', label: 'Fabrication', icon: 'Activity' },
    { id: 'coupe', label: 'Coupe', icon: 'Scissors' },
    { id: 'atelier', label: 'Atelier', icon: 'Users' },
    { id: 'mecanique', label: 'Mécanique', icon: 'Wrench' },
    { id: 'matieres', label: 'Matières 1ères', icon: 'Box' },
    { id: 'sous-traitance', label: 'Sous-traitance', icon: 'Truck' },
    { id: 'magasin', label: 'Magasin PF', icon: 'Warehouse' },
  ],
  'magasinier-mp': [
    { id: 'machines', label: 'Vue Machines', icon: 'Box' },
    { id: 'preparation', label: 'Liste OF', icon: 'Package' },
    { id: 'stock', label: 'Stock MP', icon: 'Box' },
    { id: 'transferts', label: 'Transferts', icon: 'ArrowRightLeft' },
    { id: 'retours', label: 'Retours & Consommations', icon: 'TrendingDown' },
  ],
  'post-coupe': [
    { id: 'saisie', label: 'Saisie', icon: 'Edit' },
    { id: 'planning', label: 'Planning', icon: 'Calendar' },
    { id: 'impression', label: 'Impression', icon: 'Printer' },
    { id: 'analyse', label: 'Analyse', icon: 'BarChart3' },
    { id: 'correction', label: 'Correction', icon: 'Wrench' },
  ],
  'controle-central': [
    { id: 'dashboard', label: "Vue d'ensemble", icon: 'LayoutDashboard' },
    { id: 'fabrication', label: 'Fabrication', icon: 'Factory' },
    { id: 'qualite', label: 'Contrôle Qualité', icon: 'CheckCircle' },
    { id: 'atelier', label: 'Atelier', icon: 'Package' },
    { id: 'matieres', label: 'Matières Premières', icon: 'FlaskConical' },
    { id: 'mecanique', label: 'Mécanique', icon: 'Wrench' },
    { id: 'soustraitance', label: 'Sous-traitance', icon: 'Users2' },
    { id: 'personnel', label: 'Personnel & Discipline', icon: 'Users' },
    { id: 'securite', label: 'Environnement & Sécurité', icon: 'Shield' },
    { id: 'performance', label: 'Performance', icon: 'TrendingUp' },
  ],
  'chef-atelier': [
    { id: 'operations', label: 'Par Opération', icon: 'Activity' },
    { id: 'commandes', label: 'Par Commande', icon: 'Package' },
    { id: 'alertes', label: 'Alertes', icon: 'Bell' },
    { id: 'maintenance', label: 'Maintenance', icon: 'Settings' },
    { id: 'analyse', label: 'Analyse 2ème', icon: 'BarChart3' },
  ],
  'magasinier-soustraitants': [
    { id: 'vue-ensemble', label: 'Vue d\'ensemble', icon: 'LayoutDashboard' },
    { id: 'soustraitants', label: 'Soustraitants', icon: 'Truck' },
    { id: 'sorties', label: 'Sorties', icon: 'ArrowRightLeft' },
    { id: 'retours', label: 'Retours', icon: 'RotateCcw' },
    { id: 'messages', label: 'Messages', icon: 'MessageSquare' },
  ],
};

/** Mapping rôle / dashboardsAttribues (backend) vers id dashboard */
export const DASHBOARD_ID_BY_ROLE_OR_ATTRIBUTION: Record<string, DashboardId> = {
  dashboard: 'admin',
  admin: 'admin',
  gpao: 'admin',
  tisseur: 'tisseur',
  'chef-production': 'chef-production',
  'magasinier-mp': 'magasinier-mp',
  'post-coupe': 'post-coupe',
  'controle-central': 'controle-central',
  'chef-atelier': 'chef-atelier',
  'magasinier-soustraitants': 'magasinier-soustraitants',
};

export function getAllowedDashboardIds(userRole: string | undefined, dashboardsAttribues: string[] | undefined): DashboardId[] {
  const role = (userRole || '').toUpperCase();
  if (role === 'ADMIN') {
    return DASHBOARD_LIST.map((d) => d.id);
  }
  if (dashboardsAttribues && dashboardsAttribues.length > 0) {
    const ids = dashboardsAttribues
      .map((a) => DASHBOARD_ID_BY_ROLE_OR_ATTRIBUTION[a] || DASHBOARD_ID_BY_ROLE_OR_ATTRIBUTION[a.toLowerCase()])
      .filter(Boolean) as DashboardId[];
    if (ids.length > 0) return [...new Set(ids)];
  }
  const byRole: Record<string, DashboardId> = {
    TISSEUR: 'tisseur',
    CHEF_PRODUCTION: 'chef-production',
    CHEF_PRODUCT: 'chef-production',
    MAGASINIER: 'magasinier-mp',
    COUPEUR: 'post-coupe',
    CONTROLEUR: 'controle-central',
    CONTROLEUR_QUALITE: 'controle-central',
    QUALITE: 'controle-central',
    CHEF_ATELIER: 'chef-atelier',
    MAGASINIER_SOUSTRAITANTS: 'magasinier-soustraitants',
    GPAO: 'admin',
  };
  const single = byRole[role];
  if (single) return [single];
  return ['admin'];
}

export function getDashboardIdByPath(path: string): DashboardId | null {
  const item = DASHBOARD_LIST.find((d) => d.path === path || path.startsWith(d.path + '/'));
  return item ? item.id : null;
}

export function getDashboardByPath(path: string): DashboardItem | null {
  return DASHBOARD_LIST.find((d) => d.path === path || path.startsWith(d.path + '/')) || null;
}
