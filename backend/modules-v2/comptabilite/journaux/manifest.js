export default {
  name: 'comptabilite-journaux',
  version: '1.0.0',
  description: 'Référentiel des journaux comptables (VE, AC, BQ, CA, OD). T3c.',
  category: 'comptabilite',
  depends: [],
  routes: ['routes.js'],
  apiPaths: { 'routes.js': '/api/v2/comptabilite/journaux' },
  active: true,
};
