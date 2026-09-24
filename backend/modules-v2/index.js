// backend/modules-v2/index.js
// Point d'entrée unifié : monte tous les modules v2 du domaine D.
// À importer depuis src/app.js :   import v2 from '../modules-v2/index.js'; app.use(v2);
import { Router } from 'express';

const groups = [
  ['ventes',       ['devis', 'commandes', 'bl', 'factures', 'avoirs', 'paiements', 'colisage', 'palettes']],
  ['achats',       ['fournisseurs', 'bc', 'receptions', 'factures-ff']],
  ['comptabilite', ['ecritures', 'tva', 'caisse', 'cloture']],
  ['rh',           ['employes', 'contrats', 'paie', 'pointage', 'conges', 'recrutement', 'cnss', 'irpp']],
  ['ia-agents',    ['config', 'runs', 'findings', 'scheduler']],
  ['comms',        ['messagerie', 'notifications', 'whatsapp', 'email']],
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
  for (const [group, mods] of groups) {
    for (const name of mods) {
      const slug = routeSlug[name] || name;
      try {
        const mod = await import(`./${group}/${name}/routes.js`);
        router.use(`/api/v2/${group}/${slug}`, mod.default);
      } catch (e) {
        console.warn(`[modules-v2] ${group}/${name} non monté:`, e.message);
      }
    }
  }
  return router;
}
