/**
 * Quality Module - Contrôle Qualité
 * Module pour gérer les contrôles qualité, points de contrôle
 */

export default {
  name: 'quality',
  version: '1.0.0',
  category: 'Quality',
  depends: ['base', 'mrp'],
  summary: 'Contrôle Qualité',
  description: 'Module complet de contrôle qualité',
  data: [
    'security/ir.model.access.json',
  ],
  models: [
    'models/QualityCheck.js',
    'models/QualityPoint.js',
    'models/QualityAlert.js'
  ],
  controllers: [
    'controllers/quality_check.controller.js',
    'controllers/quality_point.controller.js',
    'controllers/quality_alert.controller.js'
  ],
  routes: [
    'routes/quality_check.routes.js',
    'routes/quality_point.routes.js',
    'routes/quality_alert.routes.js'
  ]
};
