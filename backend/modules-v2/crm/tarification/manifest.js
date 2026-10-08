export default {
  name: 'crm-tarification-v2', version: '2.0.0', category: 'CRM',
  summary: 'Grilles tarifaires + lignes + remises client + simulateur prix (§4)',
  depends: ['auth-v2', 'crm-comptes-v2'],
  routes: ['routes.js'],
};
