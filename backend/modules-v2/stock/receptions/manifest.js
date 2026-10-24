export default {
  name: 'stock-receptions',
  version: '1.0.0',
  description: 'Réception de BL fournisseur → entrée en stock. T3c.',
  category: 'stock',
  depends: [],
  routes: ['routes.js'],
  apiPaths: { 'routes.js': '/api/v2/stock/receptions' },
  active: true,
};
