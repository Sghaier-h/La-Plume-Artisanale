/**
 * Module Relances Factures - Accounting
 */

export default {
  name: 'relances',
  version: '1.0.0',
  category: 'Accounting',
  summary: 'Relances automatiques factures impayées',
  description: 'Module de gestion des relances factures (amiable, ferme, mise en demeure)',
  depends: ['base', 'factures'],
  installable: true,
  auto_install: false,
  application: false,
  author: 'La Plume Artisanale',
  license: 'PROPRIETARY',
  controllers: [
    'controllers/relances.controller.js',
  ],
  routes: [
    'routes/relances.routes.js',
  ],
  security: [],
};
