/**
 * Module Base - Module de base (obligatoire)
 * Contient les fonctionnalités de base : utilisateurs, groupes, permissions, etc.
 */

export default {
  name: 'base',
  version: '1.0.0',
  category: 'Base',
  summary: 'Module de base - Fonctionnalités essentielles',
  description: `
    Module de base contenant :
    - Gestion des utilisateurs
    - Groupes et permissions
    - Sociétés
    - Partenaires (clients/fournisseurs)
    - Configuration de base
  `,
  depends: [],
  installable: true,
  auto_install: true,
  application: false,
  author: 'La Plume Artisanale',
  license: 'PROPRIETARY',
  data: [
    'data/users.json',
    'data/groups.json',
    'data/companies.json'
  ],
  models: [
    'models/User.js',
    'models/Company.js',
    'models/Partner.js'
  ],
  controllers: [
    'controllers/users.controller.js',
    'controllers/companies.controller.js',
    'controllers/partners.controller.js'
  ],
  routes: [
    'routes/users.routes.js',
    'routes/companies.routes.js',
    'routes/partners.routes.js'
  ],
  postLoad: 'hooks/postLoad.js'
};
