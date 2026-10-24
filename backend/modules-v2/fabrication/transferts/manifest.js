export default {
  name: 'fabrication-transferts',
  version: '1.0.0',
  description: 'Transferts d\'OF entre étapes (coupe → frange, interne/sous-traitance). T3c.',
  category: 'fabrication',
  depends: ['fabrication-of'],
  routes: ['routes.js'],
  apiPaths: { 'routes.js': '/api/v2/fabrication/transferts' },
  active: true,
};
