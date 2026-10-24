export default {
  name: 'sous-traitance-comptes',
  version: '2.0.0',
  description: 'Phase B §14quater.3 — Comptes courants sous-traitants + mouvements (créance/paiement/compensation/ajustement)',
  category: 'sous-traitance',
  depends: ['base'],
  routes: ['routes.js'],
  apiPaths: { 'routes.js': '/api/v2/sous-traitance/comptes' },
  active: true
};
