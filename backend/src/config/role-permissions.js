/**
 * role-permissions.js
 * ────────────────────────────────────────────────────────────────
 * Mapping rôle → permissions injectées dans le JWT au login.
 *
 * Doit rester synchronisé avec `frontend/src/config/rolePermissions.ts`
 * (voir §2.4 et §15 du contrat domain.md).
 *
 * Convention : les permissions suivent le format `ressource:action`
 * (ex: `client:consulter`, `facture:emettre`, `stock:modifier`).
 *
 * ADMIN est bypassé automatiquement dans le middleware ; aucune
 * permission n'a besoin d'être listée pour lui ici.
 */

// Permissions de base pour tout utilisateur authentifié (hors ADMIN)
const BASE = [
  'dashboard:consulter',   // son propre dashboard
  'messagerie:consulter',  // inter-postes
];

// ── Permissions globales par domaine ────────────────────────────
const CRM_READ = [
  'client:consulter', 'contact:consulter', 'lead:consulter',
  'opportunite:consulter', 'interaction:consulter', 'adresse_client:consulter',
];
const CRM_WRITE = [
  ...CRM_READ,
  'client:creer', 'client:modifier', 'client:archiver',
  'contact:gerer', 'lead:creer', 'lead:modifier', 'lead:convertir',
  'opportunite:creer', 'opportunite:modifier',
  'interaction:ajouter', 'adresse_client:gerer',
  'historique_commercial:consulter', 'historique_commercial:ajouter',
];
const PRODUIT_READ = [
  'produit:consulter', 'article:consulter', 'modele:consulter',
  'matiere_premiere:consulter', 'catalogue:consulter',
];
const STOCK_READ = [
  'stock:consulter', 'entrepot:consulter', 'mouvement:consulter',
  'inventaire:consulter', 'tracabilite:consulter',
];
const STOCK_WRITE = [
  ...STOCK_READ, 'stock:modifier', 'mouvement:creer',
  'inventaire:modifier', 'reservation:gerer',
];
const FABRICATION_READ = [
  'of:consulter', 'planning:consulter', 'gamme:consulter',
  'machine:consulter', 'tache:consulter', 'suivi_fabrication:consulter',
  'ourdissage:consulter', 'preparation_mp:consulter',
];
const FABRICATION_WRITE = [
  ...FABRICATION_READ, 'of:creer', 'of:modifier',
  'planning:modifier', 'tache:ajouter', 'tache:modifier',
];
const QUALITE = [
  'qualite:consulter', 'controle:ajouter', 'defaut:signaler',
];
const MAINTENANCE = [
  'machine:consulter', 'maintenance:ajouter', 'maintenance:planifier',
];
const VENTE_READ = [
  'devis:consulter', 'commande:consulter', 'bl:consulter',
  'facture:consulter', 'avoir:consulter', 'colisage:consulter',
];
const VENTE_WRITE = [
  ...VENTE_READ, 'devis:creer', 'devis:emettre',
  'commande:creer', 'bl:emettre', 'facture:emettre', 'avoir:emettre',
  'colisage:gerer',
];
const COMPTA_READ = [
  'compta:consulter', 'journal:consulter', 'tva:consulter',
  'rapport_compta:consulter',
];
const COMPTA_WRITE = [
  ...COMPTA_READ, 'journal:ecrire', 'tva:declarer',
  'rapprochement:effectuer', 'cloture:executer',
];
const RH_READ = [
  'rh:consulter', 'collaborateur:consulter', 'pointage:consulter',
  'conge:consulter',
];
const RH_WRITE = [
  ...RH_READ, 'collaborateur:gerer', 'pointage:valider',
  'conge:valider', 'bulletin:emettre', 'formation:gerer',
  'contrat:gerer', 'sanction_prime:gerer', 'recrutement:gerer',
];

// ── Mapping rôle → permissions ──────────────────────────────────
export const ROLE_TO_PERMISSIONS = {
  COMMERCIAL: [
    ...BASE, ...CRM_WRITE, ...PRODUIT_READ, ...STOCK_READ,
    ...VENTE_WRITE, 'commission:consulter',
  ],

  CHEF_PRODUCTION: [
    ...BASE, ...FABRICATION_WRITE, ...STOCK_READ, ...QUALITE,
    'machine:consulter', 'equipe:consulter', 'rapport_fabrication:consulter',
  ],

  CHEF_ATELIER: [
    ...BASE, ...FABRICATION_READ, ...STOCK_READ, ...QUALITE,
    'of:modifier', 'tache:ajouter', 'tache:modifier',
    'equipe:consulter', 'messagerie:gerer',
  ],

  TISSEUR: [
    ...BASE, 'of:consulter', 'suivi_fabrication:consulter',
    'tache:modifier', 'machine:consulter', 'defaut:signaler',
  ],

  COUPEUR: [
    ...BASE, 'of:consulter', 'suivi_fabrication:consulter',
    'tache:modifier', 'defaut:signaler',
  ],

  OURDISSEUR: [
    ...BASE, 'of:consulter', 'ourdissage:consulter',
    'suivi_fabrication:consulter', 'tache:modifier',
  ],

  CONTROLEUR_QUALITE: [
    ...BASE, ...QUALITE, 'controle:consulter', 'defaut:gerer',
    'of:consulter', 'rapport_qualite:consulter',
  ],

  MAGASINIER: [...BASE, ...STOCK_WRITE, 'preparation_mp:consulter'],
  MAGASINIER_PREPARATION: [...BASE, ...STOCK_WRITE, 'preparation_mp:consulter'],
  MAGASINIER_STOCK: [...BASE, ...STOCK_WRITE, ...VENTE_READ, 'colisage:gerer'],
  MAGASINIER_SOUSTRAITANTS: [
    ...BASE, ...STOCK_READ, 'sous_traitant:consulter', 'bon_soustraitant:gerer',
  ],

  MECANICIEN: [
    ...BASE, ...MAINTENANCE, 'piece_rechange:consulter',
    'intervention:ajouter',
  ],

  COMPTABLE: [
    ...BASE, ...COMPTA_WRITE, ...VENTE_READ,
    'facture_fournisseur:consulter', 'paiement:gerer',
    'immobilisation:gerer', 'caisse:consulter',
    'relance:gerer', 'tva:declarer',
  ],

  RH_MANAGER: [...BASE, ...RH_WRITE, 'formation:gerer', 'recrutement:gerer'],
  RH_ASSISTANT: [...BASE, ...RH_READ, 'pointage:valider', 'conge:valider'],

  MARKETING: [
    ...BASE, 'campagne:gerer', 'segment:gerer', 'ecommerce:consulter',
    'seo:gerer', 'rapport_marketing:consulter', 'client:consulter',
  ],

  RESPONSABLE_SECURITE: [
    ...BASE, 'audit:consulter', 'incident:gerer', 'log:consulter',
    'utilisateur:consulter',
  ],
};

/**
 * Retourne la liste des permissions d'un rôle.
 * Si le rôle est inconnu : liste vide (= menu limité au /accueil).
 */
export function getPermissionsForRole(role) {
  if (!role) return [];
  const r = String(role).toUpperCase();
  return ROLE_TO_PERMISSIONS[r] || [];
}
