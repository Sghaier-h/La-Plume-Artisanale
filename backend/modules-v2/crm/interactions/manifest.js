export default {
  name: 'crm-interactions-v2', version: '2.0.0', category: 'CRM',
  summary: 'Journal CRM interactions (§3.5) — appels, emails, WhatsApp, RDV, notes',
  depends: ['auth-v2', 'crm-comptes-v2'],
  routes: ['routes.js'],
};
