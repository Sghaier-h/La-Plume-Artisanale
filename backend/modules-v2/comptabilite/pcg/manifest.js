export default {
  name: 'comptabilite-pcg',
  version: '1.0.0',
  description: 'Plan Comptable Général Tunisien (classes 1-7). T3c.',
  category: 'comptabilite',
  depends: [],
  routes: ['routes.js'],
  apiPaths: { 'routes.js': '/api/v2/comptabilite/pcg' },
  active: true,
};
