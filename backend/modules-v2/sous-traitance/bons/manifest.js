export default {
  name: 'sous-traitance-bons',
  version: '2.0.0',
  description: 'Phase B §14quater.3 — Bons sortie/retour ST avec signature tactile SVG + contrôle qualité express',
  category: 'sous-traitance',
  depends: ['base'],
  routes: ['routes.js'],
  apiPaths: { 'routes.js': '/api/v2/sous-traitance/bons' },
  active: true
};
