export default {
  name: 'sous-traitance-sous-traitants',
  version: '2.1.0',
  description: 'Phase B §14quater.3 — Sous-traitants étendus par type d\'activité (CRUD + compte + travaux + bons)',
  category: 'sous-traitance',
  depends: ['base'],
  routes: ['routes.js'],
  apiPaths: { 'routes.js': '/api/v2/sous-traitance/sous-traitants' },
  active: true
};
