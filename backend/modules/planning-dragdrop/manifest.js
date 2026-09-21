/**
 * Module Planning-dragdrop - Manufacturing
 */

export default {
  name: 'planning-dragdrop',
  version: '1.0.0',
  category: 'Manufacturing',
  summary: 'Gestion planning-dragdrop',
  description: 'Module de gestion planning-dragdrop',
  depends: ["base","planning"],
  installable: true,
  auto_install: false,
  application: false,
  author: 'La Plume Artisanale',
  license: 'PROPRIETARY',
  models: [
    'models/Planning-dragdrop.js'
  ],
  controllers: [
    'controllers/planning-dragdrop.controller.js'
  ],
  routes: [
    'routes/planning-dragdrop.routes.js'
  ],
  security: [
    'security/ir.model.access.json'
  ]
};
