/**
 * Module Portail Client — accès B2B pour les clients (commandes, factures, BL, devis, demandes)
 */
export default {
  name: 'portail-client',
  version: '1.0.0',
  category: 'Sales',
  summary: 'Portail client',
  description: 'Espace client sécurisé : commandes, factures, BL, devis, demandes',
  depends: ['base'],
  installable: true,
  auto_install: false,
  application: false,
  author: 'La Plume Artisanale',
  license: 'PROPRIETARY',
  controllers: [
    'controllers/portail-client.controller.js'
  ],
  routes: [
    'routes/portail-client.routes.js'
  ],
  apiPaths: {
    'routes/portail-client.routes.js': '/api/portail'
  }
};
