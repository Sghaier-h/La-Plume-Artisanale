export default {
  name: 'fabrication-ordres',
  version: '2.0.0',
  description: 'Ordres de Fabrication (OF) — CRUD, numérotation OF{6}, auto-création depuis commande validée (§7.5, §7.14)',
  category: 'fabrication',
  depends: ['base', 'commandes', 'catalogue'],
  routes: ['routes.js'],
  apiPaths: { 'routes.js': '/api/v2/fabrication/ordres' },
  active: true
};
