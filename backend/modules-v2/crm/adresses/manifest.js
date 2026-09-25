export default {
  name: 'crm-adresses-v2', version: '2.0.0', category: 'CRM',
  summary: 'Adresses multi-comptes (§3.3) avec règle 1 défaut fac/liv par compte',
  depends: ['auth-v2', 'crm-comptes-v2'],
  routes: ['routes.js'],
};
