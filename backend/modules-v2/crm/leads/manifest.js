export default {
  name: 'crm-leads-v2', version: '2.0.0', category: 'CRM',
  summary: 'Funnel leads (§3.4) + conversion → compte',
  depends: ['auth-v2', 'crm-comptes-v2'],
  routes: ['routes.js'],
};
