export default {
  name: 'dashboard',
  version: '1.0.0',
  description: 'Dashboards agrégés par rôle (JSON ; remplace les 404 HTML). T3c.',
  category: 'base',
  depends: [],
  routes: ['routes.js'],
  apiPaths: { 'routes.js': '/api/v2/dashboard' },
  active: true,
};
