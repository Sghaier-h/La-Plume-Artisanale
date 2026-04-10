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
  data: [
    'data/product_categories.json',
    'data/uom.json',
    'data/product_types.json'
  ],
  models: [
    'models/ProductTemplate.js',
    'models/ProductVariant.js',
    'models/ProductCategory.js',
    'models/UOM.js'
  ],
  controllers: [
    'controllers/product_template.controller.js',
    'controllers/product_variant.controller.js',
    'controllers/product_category.controller.js',
    'controllers/uom.controller.js',
    'controllers/product_pricelist.controller.js'
  ],
  routes: [
    'routes/product_template.routes.js',
    'routes/product_variant.routes.js',
    'routes/product_category.routes.js',
    'routes/uom.routes.js',
    'routes/product_pricelist.routes.js'
  ],
  views: [
    'views/product_template_views.json',
    'views/product_variant_views.json'
  ],
  security: [
    'security/ir.model.access.json'
  ],
  postLoad: 'hooks/postLoad.js'
};
