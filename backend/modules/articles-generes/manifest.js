/**
 * Articles Générés (alias) — filtre articles_catalogue.dans_catalogue_produit = true.
 */
export default {
  name: 'articles-generes',
  version: '1.0.0',
  category: 'Catalogue',
  depends: ['articles-catalogue'],
  summary: 'Alias Articles Générés',
  description: 'Filtre articles_catalogue par dans_catalogue_produit = true',
  routes: [
    'routes/articles-generes.routes.js'
  ]
};
