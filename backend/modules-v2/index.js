// backend/modules-v2/index.js
// Point d'entrée unifié : monte tous les modules v2 du domaine.
// Utilisation : import buildV2Router from '../modules-v2/index.js'; app.use(await buildV2Router());
//
// Convention : chaque groupe a une entrée dans `groups[]` avec la liste
// de ses sous-modules. Si un sous-module vaut `.`, le fichier `routes.js`
// est chargé depuis la racine du groupe (pattern utilisé par auth/users).
import { Router } from 'express';

const groups = [
  // Base (routes.js à la racine du groupe)
  ['auth',         ['.']],
  ['users',        ['.']],

  // Multi-sociétés étendues (§14quater.1 · 5 entités du groupe)
  ['multi-societes', ['.']],

  // Paramètres
  ['params',       ['numerotation', 'societe']],

  // CRM & Produits
  ['crm',          ['comptes', 'tarification', 'contacts', 'adresses',
                    'leads', 'interactions', 'opportunites', 'parametres']],
  // Produits (Phase G3 : + catalogue, attributs, articles-generes)
  ['produits',     ['familles', 'modeles', 'articles',
                    'catalogue', 'attributs', 'articles-generes']],
  ['bom',          ['master', 'composants']],

  // Stock (Phase E4 : + tracabilite-lots, fournitures)
  ['stock',        ['entrepots', 'inventaires', 'matieres-premieres',
                    'mouvements', 'pieces-rechange', 'produits-finis',
                    'tracabilite-lots', 'fournitures']],

  // Fabrication (Phase E4 : + of, machines, suivi)
  // Phase G3 : + mrp, taches, maintenance, planning-gantt
  ['fabrication',  ['ordres', 'ourdissage', 'tissage', 'coupe',
                    'finition', 'planning', 'snapshots',
                    'of', 'machines', 'suivi',
                    'mrp', 'taches', 'maintenance', 'planning-gantt']],
  // Qualité (Phase G3 : + avance — fusion qualite-avance + qualite-avancee + quality)
  ['qualite',      ['controles', 'defauts', 'rapports', 'avance']],
  ['sous-traitance', ['envois', 'retours', 'sous-traitants', 'travaux', 'bons', 'comptes']],

  // Ventes / Achats / Compta
  ['ventes',       ['devis', 'commandes', 'bl', 'factures', 'avoirs',
                    'paiements', 'colisage', 'palettes',
                    // Phase G2 — courbe CA 12 mois (DashboardCommercial)
                    'stats']],
  ['achats',       ['fournisseurs', 'bc', 'receptions', 'factures-ff']],
  ['comptabilite', ['ecritures', 'tva', 'caisse', 'cloture',
                    'caisses', 'dossiers-import', 'cessions',
                    'depenses-especes', 'compensations', 'rapprochement',
                    // §14quater.6 — Apport gérant (ADMIN seul)
                    'apport-gerant']],

  // Archive centrale de documents (§14quater · Phase A)
  // + Boîte à trier des photos justificatives (§14quater.4 · Phase E3)
  ['documents',    ['archive', 'photos-boite-tri']],

  // RH (dont primes de rendement §11bis.7bis + TV atelier + RH étendu Phase C)
  ['rh',           ['employes', 'contrats', 'paie', 'pointage', 'conges',
                    'recrutement', 'cnss', 'irpp',
                    'primes-cagnottes', 'primes-scores', 'primes-bordereaux',
                    'tv-atelier',
                    // Phase C — RH étendu + tablettes (§11bis + §14quater.5-7)
                    'comptes-employes', 'avances', 'ajustements',
                    'compensations-rh', 'pin-tablette', 'demandes-rh',
                    'planning-employes',
                    // Phase G2 — formations (§11bis.10) + entretiens annuels (§11bis.11)
                    'formations', 'entretiens',
                    // Phase H — avertissements auto (§11bis + §14ter.17c)
                    // + recrutement candidat tablette public (§11bis.recrutement)
                    'avertissements', 'recrutement-tablette']],

  // IA agents (§11ter + §14bis.6bis)
  ['ia-agents',    ['config', 'runs', 'findings', 'scheduler']],

  // Communication
  ['comms',        ['messagerie', 'notifications', 'whatsapp', 'email']],

  // Personnalisation & e-commerce & publicité (amendements design 2026-09-24)
  ['personnalisation', ['config', 'commandes', 'referentiels', 'partages']],
  ['ecommerce',    ['sites', 'comptes-b2b', 'commandes-web', 'sync', 'promo']],
  ['publicite',    ['comptes', 'campagnes', 'metriques', 'conversions']],
];

// Alias par GROUPE → segment URL racine (les autres suivent le nom du groupe).
// Utile quand le dossier et l'URL publique ne doivent pas coïncider.
const groupSlug = {
  'multi-societes': 'societes',    // §14quater.1 — URL contrat = /api/v2/societes
};

// Alias par module → segment URL (les autres suivent le nom du module).
const routeSlug = {
  bl: 'bl',
  'factures-ff': 'factures-fournisseur',
  paie: 'paies',
  pointage: 'pointages',
  conges: 'conges',
  recrutement: 'candidatures',
  config: 'agents',
  runs: 'runs',
  findings: 'findings',
  scheduler: 'scheduler',
  messagerie: 'messages',
  notifications: 'notifications',
  colisage: 'colis',
  parametres: 'parametres',
  'dossiers-import': 'dossiers-import',
  'depenses-especes': 'depenses-especes',
  archive: 'archive',
  'photos-boite-tri': 'photos-boite-tri',
};

export default async function buildV2Router() {
  const router = Router();
  let mounted = 0;
  let failed = 0;

  for (const [group, mods] of groups) {
    for (const name of mods) {
      const isRoot = name === '.';
      const importPath = isRoot
        ? `./${group}/routes.js`
        : `./${group}/${name}/routes.js`;
      const groupSegment = groupSlug[group] || group;
      const slug = isRoot ? '' : (routeSlug[name] || name);
      const mountPath = isRoot
        ? `/api/v2/${groupSegment}`
        : `/api/v2/${groupSegment}/${slug}`;

      try {
        const mod = await import(importPath);
        router.use(mountPath, mod.default);
        mounted++;
      } catch (e) {
        failed++;
        console.warn(`[modules-v2] ${group}/${name} non monté (${mountPath}):`, e.message);
      }
    }
  }

  console.info(`[modules-v2] ${mounted} routes montées, ${failed} échouées`);
  return router;
}
