/**
 * Module Excel-import - Tools
 */

export default {
  name: 'excel-import',
  version: '1.0.0',
  category: 'Tools',
  summary: 'Gestion excel-import',
  description: 'Module de gestion excel-import',
  depends: ["base"],
  installable: true,
  auto_install: false,
  application: false,
  author: 'La Plume Artisanale',
  license: 'PROPRIETARY',
  models: [
    'models/Excel-import.js'
  ],
  controllers: [
    'controllers/excel-import.controller.js'
  ],
  routes: [
    'routes/excel-import.routes.js'
  ],
  security: [
    'security/ir.model.access.json'
  ]
};
