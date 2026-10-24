export default {
  name: 'stock-reservations',
  version: '1.0.0',
  description: 'Réservations de stock (MP ou PF) pour un OF/commande. T3c.',
  category: 'stock',
  depends: [],
  routes: ['routes.js'],
  apiPaths: { 'routes.js': '/api/v2/stock/reservations' },
  active: true,
};
