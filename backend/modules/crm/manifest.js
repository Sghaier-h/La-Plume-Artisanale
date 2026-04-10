/**
 * CRM Module - Gestion de la Relation Client
 * Module pour gérer les opportunités, leads, activités commerciales
 */

export default {
  name: 'crm',
  version: '1.0.0',
  category: 'CRM',
  depends: ['base', 'sale'],
  summary: 'Gestion de la Relation Client',
  description: 'Module complet de CRM avec opportunités, leads, activités et pipeline commercial',
  data: [
    'security/ir.model.access.json',
  ],
  models: [
    'models/Lead.js',
    'models/Opportunity.js',
    'models/Activity.js'
  ],
  controllers: [
    'controllers/crm_lead.controller.js',
    'controllers/crm_opportunity.controller.js',
    'controllers/crm_activity.controller.js',
    'controllers/crm_campaign.controller.js'
  ],
  routes: [
    'routes/crm_lead.routes.js',
    'routes/crm_opportunity.routes.js',
    'routes/crm_activity.routes.js',
    'routes/crm_campaign.routes.js'
  ]
};
