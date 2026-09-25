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

  // Paramètres
  ['params',       ['numerotation', 'societe']],

  // CRM & Produits
  ['crm',          ['comptes', 'tarification']],
  ['produits',     ['familles', 'modeles', 'articles']],
  ['bom',          ['master', 'composants']],

  // Stock
  ['stock',        ['entrepots', 'inventaires', 'matieres-premieres',
                    'mouvements', 'pieces-rechange', 'produits-finis']],

  // Fabrication
  ['fabrication',  ['ordres', 'ourdissage', 'tissage', 'coupe',
                    'finition', 'planning', 'snapshots']],
  ['qualite',      ['controles', 'defauts', 'rapports']],
  ['sous-traitance', ['envois', 'retours']],

  // Ventes / Achats / Compta
  ['ventes',       ['devis', 'commandes', 'bl', 'factures', 'avoirs',
                    'paiements', 'colisage', 'palettes']],
  ['achats',       ['fournisseurs', 'bc', 'receptions', 'factures-ff']],
  ['comptabilite', ['ecritures', 'tva', 'caisse', 'cloture']],

  // RH (dont primes de rendement §11bis.7bis + TV atelier)
  ['rh',           ['employes', 'contrats', 'paie', 'pointage', 'conges',
                    'recrutement', 'cnss', 'irpp',
                    'primes-cagnottes', 'primes-scores', 'primes-bordereaux',
                    'tv-atelier']],

  // IA agents (§11ter + §14bis.6bis)
  ['ia-agents',    ['config', 'runs', 'findings', 'scheduler']],

  // Communication
  ['comms',        ['messagerie', 'notifications', 'whatsapp', 'email']],

  // Personnalisation & e-commerce & publicité (amendements design 2026-09-24)
  ['personnalisation', ['config', 'commandes', 'referentiels', 'partages']],
  ['ecommerce',    ['sites', 'comptes-b2b', 'commandes-web', 'sync', 'promo']],
  ['publicite',    ['comptes', 'campagnes', 'metriques', 'conversions']],
];

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
      const slug = isRoot ? '' : (routeSlug[name] || name);
      const mountPath = isRoot ? `/api/v2/${group}` : `/api/v2/${group}/${slug}`;

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
