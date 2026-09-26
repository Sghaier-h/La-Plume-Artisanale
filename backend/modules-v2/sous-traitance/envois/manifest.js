export default {
  name: 'sous-traitance-envois',
  version: '2.0.0',
  description: 'Envois sous-traitance : bons sortie ST avec numéro auto, signatures, expédition (§7.11)',
  category: 'sous-traitance',
  depends: ['fabrication-ordres', 'base'],
  routes: ['routes.js'],
  apiPaths: { 'routes.js': '/api/v2/sous-traitance/envois' },
  active: true
};
