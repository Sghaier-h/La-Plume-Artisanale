export default {
  name: 'bom',
  version: '1.0.0',
  description: 'Module BOM (Bill of Materials) — Nomenclatures produits',
  category: 'production',
  depends: ['base'],
  routes: [
    'routes/bom.routes.js'
  ],
  apiPaths: {
    'routes/bom.routes.js': '/api/bom'
  },
  active: true
};
