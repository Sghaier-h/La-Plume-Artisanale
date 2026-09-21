/**
 * Module Articles - Gestion des articles
 */

export default {
  name: 'articles',
  version: '1.0.0',
  category: 'Inventory',
  summary: 'Gestion des articles',
  description: 'Module de gestion des articles avec types, références, dimensions, couleurs et finitions',
  depends: ['base', 'product'],
  installable: true,
  auto_install: false,
  application: false,
  author: 'La Plume Artisanale',
  license: 'PROPRIETARY',
  models: [
    'models/Article.js'
  ],
  controllers: [
    'controllers/articles.controller.js'
  ],
  routes: [
    'routes/articles.routes.js'
  ],
  views: [
    'views/articles_views.json'
  ],
  security: [
    'security/ir.model.access.json'
  ]
};
