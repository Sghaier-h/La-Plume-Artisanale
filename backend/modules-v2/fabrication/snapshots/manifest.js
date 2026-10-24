export default {
  name: 'fabrication-snapshots',
  version: '2.0.0',
  description: 'Service background : régénère snapshots_ofs_tissage toutes les 5 min (§7.18)',
  category: 'fabrication',
  depends: ['fabrication-ordres', 'fabrication-tissage', 'base'],
  routes: ['routes.js'],
  apiPaths: { 'routes.js': '/api/v2/fabrication/snapshots' },
  scheduler: { intervalle_min: 5, tache: 'rafraichirSnapshotOFsTissage' },
  active: true
};
