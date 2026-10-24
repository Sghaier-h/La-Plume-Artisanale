export default {
  name: 'multi-societes-v2',
  version: '2.0.0',
  category: 'Core',
  summary: 'Multi-sociétés étendues (§14quater.1) — 5 entités du groupe',
  description:
    'Gestion des 5 sociétés (LP / CAPSCOR / AT / PMG / HS), bascule société courante, ' +
    'vue consolidée pour admin et ACL users↔societes.',
  depends: ['auth-v2'],
  author: 'La Plume Artisanale',
  license: 'PROPRIETARY',
  routes: ['routes.js'],
};
