/**
 * Module Matieres-premieres - Inventory
 */

export default {
  name: 'matieres-premieres',
  version: '1.0.0',
  category: 'Inventory',
  summary: 'Gestion matieres-premieres',
  description: 'Module de gestion matieres-premieres',
  depends: ["base","product"],
  installable: true,
  auto_install: false,
  application: false,
  author: 'La Plume Artisanale',
  license: 'PROPRIETARY',
  models: [
    'models/Matieres-premieres.js'
  ],
  controllers: [
    'controllers/matieres-premieres.controller.js'
  ],
  routes: [
    'routes/matieres-premieres.routes.js'
  ],
  security: [
    'security/ir.model.access.json'
  ]
};
