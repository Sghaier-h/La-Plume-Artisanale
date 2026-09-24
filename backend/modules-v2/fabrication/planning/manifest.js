export default {
  name: 'fabrication-planning',
  version: '2.0.0',
  description: 'Planning Gantt drag-drop machines × créneaux (§7.12)',
  category: 'fabrication',
  depends: ['fabrication-ordres', 'base'],
  routes: ['routes.js'],
  apiPaths: { 'routes.js': '/api/v2/fabrication/planning' },
  active: true
};
