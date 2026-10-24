/**
 * frontend/src/config/rolePermissions.ts
 *
 * Matrice de permissions par rôle, dérivée de docs/domain.md §2.4 (RBAC)
 * et §15 (Menu) qui annotent les visibilités par catégorie.
 *
 * Format : { role: { module: { action: bool } } }.
 * Action `read` = accès lecture / voir le menu correspondant.
 * Action `write` = créer/modifier/supprimer.
 *
 * L'ADMIN a un shortcut dans `hasPermission()` (retourne toujours true),
 * il n'a pas besoin d'être listé ici.
 *
 * Les rôles non listés → aucune permission (menu vide, ne verra que /accueil).
 */

type Permissions = Record<string, Record<string, boolean>>;

const READ = { read: true };
const RW = { read: true, write: true };

// Permissions de base pour tout utilisateur connecté
const BASE_PERMISSIONS: Permissions = {
  dashboard: READ,       // droit de base : voir son propre dashboard
  mail: READ,            // messagerie inter-postes
  base: {},              // pas de config par défaut
};

export const ROLE_PERMISSIONS: Record<string, Permissions> = {
  // ── Commercial (§14.2) ──────────────────────────────────────────────
  COMMERCIAL: {
    ...BASE_PERMISSIONS,
    crm: RW,
    'crm.lead': RW,
    'crm.opportunity': RW,
    'res.partner': RW,      // clients
    product: READ,
    'product.product': READ,
    'product.template': READ,
    'product.category': READ,
    'product.service': READ,
    stock: READ,
    'stock.inventory': READ,
    sale: RW,
    'sale.order': RW,
    'sale.quotation': RW,
    marketing: READ,        // vue campagnes
    dashboard: { read: true, commercial: true },
  },

  // ── Comptable (§14.14) ──────────────────────────────────────────────
  COMPTABLE: {
    ...BASE_PERMISSIONS,
    // Ventes & Achats en lecture
    sale: READ,
    'sale.order': READ,
    'sale.quotation': READ,
    purchase: READ,
    'purchase.order': READ,
    'purchase.contract': READ,
    'purchase.request': READ,
    // Comptabilité complète
    account: RW,
    'account.account': RW,
    'account.move': RW,
    'account.bank': RW,
    'account.cash': RW,
    'account.tax': RW,
    'account.payment': RW,
    'account.asset': RW,
    'account.report': READ,
    'account.period': { read: true, write: true },
    // RH lecture (voir bulletins pour comptabilisation)
    hr: READ,
    'hr.payslip': READ,
    'hr.contract': READ,
    dashboard: { read: true, comptable: true },
  },

  // ── RH Manager (§14.15) ─────────────────────────────────────────────
  RH_MANAGER: {
    ...BASE_PERMISSIONS,
    hr: RW,
    'hr.employee': RW,
    'hr.contract': RW,
    'hr.attendance': RW,
    'hr.payslip': RW,
    'hr.applicant': RW,
    'hr.training': RW,
    dashboard: { read: true, 'rh-manager': true },
  },
  RH_ASSISTANT: {
    ...BASE_PERMISSIONS,
    hr: READ,
    'hr.employee': READ,
    'hr.contract': READ,
    'hr.attendance': RW,      // pointage
    'hr.payslip': READ,
    'hr.applicant': READ,
  },

  // ── Chef de production (§14.7) ──────────────────────────────────────
  CHEF_PRODUCTION: {
    ...BASE_PERMISSIONS,
    // Fabrication complète
    mrp: RW,
    'mrp.production': RW,
    'mrp.bom': RW,
    'mrp.cost': READ,
    // Stock lecture
    stock: READ,
    'stock.inventory': READ,
    'stock.location': READ,
    // Qualité lecture
    quality: READ,
    // Maintenance lecture
    maintenance: READ,
    'maintenance.machine': READ,
    // Ventes lecture (voir commandes → OF)
    sale: READ,
    'sale.order': READ,
    // Produits lecture
    product: READ,
    'product.product': READ,
    dashboard: { read: true, 'chef-production': true },
  },

  // ── Chef d'atelier (§14.8) ──────────────────────────────────────────
  CHEF_ATELIER: {
    ...BASE_PERMISSIONS,
    mrp: READ,
    'mrp.production': RW,      // gère OF de son atelier
    quality: RW,               // saisit contrôles qualité
    maintenance: RW,           // demande interventions
    'maintenance.machine': READ,
    stock: READ,
    dashboard: { read: true, 'chef-atelier': true },
  },

  // ── Tablettes atelier (§14.9-11) ────────────────────────────────────
  TISSEUR: {
    ...BASE_PERMISSIONS,
    mrp: READ,
    'mrp.production': READ,
    quality: RW,               // saisit 1er/2e/déchet
    dashboard: { read: true, tisseur: true },
  },
  COUPEUR: {
    ...BASE_PERMISSIONS,
    mrp: READ,
    'mrp.production': READ,
    quality: RW,
    dashboard: { read: true, coupe: true },
  },
  OURDISSEUR: {
    ...BASE_PERMISSIONS,
    mrp: READ,
    'mrp.production': READ,
    dashboard: { read: true, ourdisseur: true },
  },

  // ── Contrôleur qualité (§14.12) ─────────────────────────────────────
  CONTROLEUR_QUALITE: {
    ...BASE_PERMISSIONS,
    quality: RW,
    mrp: READ,
    'mrp.production': READ,
    stock: READ,
    dashboard: { read: true, 'controle-central': true },
  },

  // ── Mécanicien (§14.13) ─────────────────────────────────────────────
  MECANICIEN: {
    ...BASE_PERMISSIONS,
    maintenance: RW,
    'maintenance.machine': RW,
    mrp: READ,
    'mrp.production': READ,
    stock: READ,
    dashboard: { read: true, mecanicien: true },
  },

  // ── Magasiniers (§14.3-6) ───────────────────────────────────────────
  MAGASINIER_PREPARATION: {
    ...BASE_PERMISSIONS,
    stock: RW,
    'stock.inventory': RW,
    'stock.location': RW,
    dashboard: { read: true, magasinier: true },
  },
  MAGASINIER_MP: {
    ...BASE_PERMISSIONS,
    stock: RW,
    'stock.inventory': RW,
    'stock.location': RW,
    'mrp.bom': READ,        // besoin de connaître nomenclatures
    dashboard: { read: true, 'magasinier-mp': true },
  },
  MAGASINIER_STOCK: {
    ...BASE_PERMISSIONS,
    stock: RW,
    'stock.inventory': RW,
    'stock.location': RW,
    dashboard: { read: true, 'magasin-pf': true },
  },
  MAGASINIER_SOUSTRAITANTS: {
    ...BASE_PERMISSIONS,
    stock: RW,
    'stock.inventory': RW,
    dashboard: { read: true, 'magasinier-soustraitants': true },
  },

  // ── Marketing (§11.3-4 + §11quinquies.9) ────────────────────────────
  MARKETING: {
    ...BASE_PERMISSIONS,
    marketing: RW,
    'marketing.campaign': RW,
    'marketing.account': RW,
    // E-commerce & publicité
    crm: READ,
    'res.partner': READ,
    product: READ,
    'product.product': READ,
    sale: READ,
    'sale.order': READ,
    // pas de compta ni RH
    dashboard: READ,
  },

  // ── Responsable Sécurité (§17bis.9) ─────────────────────────────────
  RESPONSABLE_SECURITE: {
    ...BASE_PERMISSIONS,
    // Audit tout (lecture seule)
    base: { config: false },   // pas de modification config
    hr: READ,
    'hr.employee': READ,
    dashboard: { read: true, securite: true },
  },
};

/**
 * Résout les permissions d'un rôle. Retourne `null` pour les rôles inconnus.
 */
export function getPermissionsForRole(role?: string | null): Permissions | null {
  if (!role) return null;
  const key = role.toUpperCase();
  return ROLE_PERMISSIONS[key] || null;
}
