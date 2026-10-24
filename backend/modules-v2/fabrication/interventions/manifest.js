export default {
  name: 'fabrication-interventions',
  version: '1.0.0',
  description: 'Liste des interventions de maintenance (vue agrégée demandes_intervention). T3c.',
  category: 'fabrication',
  depends: ['fabrication-maintenance'],
  routes: ['routes.js'],
  apiPaths: { 'routes.js': '/api/v2/fabrication/interventions' },
  active: true,
};
