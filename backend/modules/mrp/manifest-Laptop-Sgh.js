/**
 * Module MRP - Gestion de la production (Manufacturing)
 * Inspiré du module mrp d'Odoo
 */

export default {
  name: 'mrp',
  version: '1.0.0',
  category: 'Manufacturing',
  summary: 'Gestion de la production - Ordres de fabrication, Nomenclatures',
  description: `
    Module de gestion de la production contenant :
    - Ordres de fabrication (Manufacturing Orders)
    - Nomenclatures (Bill of Materials - BOM)
    - Postes de travail (Work Centers)
    - Ordres de travail (Work Orders)
    - Routage de production
  `,
  depends: ['base', 'product', 'stock'],
  installable: true,
  auto_install: false,
  application: true,
  author: 'La Plume Artisanale',
  license: 'PROPRIETARY',
  data: [],
  models: [
    'models/MrpProduction.js',
    'models/MrpBOM.js'
  ],
  controllers: [
    'controllers/mrp_production.controller.js'
  ],
  routes: [
    'routes/mrp_production.routes.js'
  ],
  views: [],
  security: [
    'security/ir.model.access.json'
  ],
  postLoad: null
};
