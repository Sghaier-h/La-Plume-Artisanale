/**
 * Project Module - Gestion de Projets
 * Module pour gérer les projets, tâches, jalons
 */

export default {
  name: 'project',
  version: '1.0.0',
  category: 'Project',
  depends: ['base', 'hr'],
  summary: 'Gestion de Projets',
  description: 'Module complet de gestion de projets et tâches',
  data: [
    'security/ir.model.access.json',
  ],
  models: [
    'models/Project.js',
    'models/Task.js',
    'models/Milestone.js'
  ],
  controllers: [
    'controllers/project_project_new.controller.js',
    'controllers/project_task.controller.js'
  ],
  routes: [
    'routes/project_project.routes.js',
    'routes/project_task.routes.js'
  ]
};
