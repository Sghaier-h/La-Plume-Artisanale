export default {
  name: 'fabrication-tissage',
  version: '2.0.0',
  description: 'Sessions tissage temps réel + trigger snapshots 5 min (§7.18)',
  category: 'fabrication',
  depends: ['fabrication-ordres', 'fabrication-snapshots', 'base'],
  routes: ['routes.js'],
  apiPaths: { 'routes.js': '/api/v2/fabrication/tissage' },
  active: true
};
