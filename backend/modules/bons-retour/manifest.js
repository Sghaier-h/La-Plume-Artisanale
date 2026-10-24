/**
 * Module Bons-retour - Sales
 */

export default {
  name: 'bons-retour',
  version: '1.0.0',
  category: 'Sales',
  summary: 'Gestion bons-retour',
  description: 'Module de gestion bons-retour',
  // "commandes" legacy a été consolidé dans modules-v2/ventes/commandes ;
  // bons-retour n'est pas (encore) porté en v2 (Option B §consolidation
  // ventes 2026-10-24) et reste donc un module legacy. Il ne dépend plus
  // d'aucun module legacy supprimé.
  depends: ["base"],
  installable: true,
  auto_install: false,
  application: false,
  author: 'La Plume Artisanale',
  license: 'PROPRIETARY',
  models: [
    'models/Bons-retour.js'
  ],
  controllers: [
    'controllers/bons-retour.controller.js'
  ],
  routes: [
    'routes/bons-retour.routes.js'
  ],
  security: [
    'security/ir.model.access.json'
  ]
};
