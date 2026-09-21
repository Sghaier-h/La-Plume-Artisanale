/**
 * Module Product - Gestion des produits
 * Inspiré du module product d'Odoo
 */

export default {
  name: 'product',
  version: '1.0.0',
  category: 'Inventory',
  summary: 'Gestion des produits et variantes',
  description: `
    Module de gestion des produits contenant :
    - Produits (Product Template)
    - Variantes de produits (Product Variant)
    - Catégories de produits
    - Unités de mesure (UOM)
    - Tarifs et listes de prix
  `,
  depends: ['base'],
  installable: true,
  auto_install: false,
  application: false,
  author: 'La Plume Artisanale',
  license: 'PROPRIETARY',
  data: [],
  models: [
    'models/ProductTemplate.js',
    'models/ProductCategory.js'
  ],
  controllers: [
    'controllers/product_template.controller.js'
  ],
  routes: [
    'routes/product_template.routes.js'
  ],
  views: [
    'views/product_template_views.json'
  ],
  security: [
    'security/ir.model.access.json'
  ],
  postLoad: null
};
