/**
 * Module Articles-catalogue - Sales
 */

export default {
  name: 'articles-catalogue',
  version: '1.0.0',
  category: 'Sales',
  summary: 'Gestion articles-catalogue',
  description: 'Module de gestion articles-catalogue',
  depends: ["base","product"],
  installable: true,
  auto_install: false,
  application: false,
  author: 'La Plume Artisanale',
  license: 'PROPRIETARY',
  models: [
    'models/Articles-catalogue.js'
  ],
  controllers: [
    'controllers/articles-catalogue.controller.js'
  ],
  routes: [
    'routes/articles-catalogue.routes.js'
  ],
  security: [
    'security/ir.model.access.json'
  ]
};
