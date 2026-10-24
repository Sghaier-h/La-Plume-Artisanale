export default {
  name: 'sous-traitance-travaux',
  version: '2.0.0',
  description: 'Phase B §14quater.3 — Travaux sous-traitants : CRUD, validation, refus, paiement',
  category: 'sous-traitance',
  depends: ['base'],
  routes: ['routes.js'],
  apiPaths: { 'routes.js': '/api/v2/sous-traitance/travaux' },
  active: true
};
