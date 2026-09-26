/**
 * Fournitures (alias) — filtrage de articles_catalogue par type 'fourniture'.
 * Rétro-compatibilité pour le FE ancien qui appelle /api/fournitures.
 */
export default {
  name: 'fournitures',
  version: '1.0.0',
  category: 'Catalogue',
  depends: ['articles-catalogue'],
  summary: 'Alias Fournitures',
  description: 'Filtre articles_catalogue.id_type_article = fourniture',
  routes: [
    'routes/fournitures.routes.js'
  ]
};
