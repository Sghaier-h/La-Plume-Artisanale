/**
 * Module Account - Comptabilité
 * Inspiré du module account d'Odoo
 */

export default {
  name: 'account',
  version: '1.0.0',
  category: 'Accounting',
  summary: 'Gestion comptable - Factures, Écritures, Taxes',
  description: `
    Module de gestion comptable contenant :
    - Factures (Invoices)
    - Écritures comptables (Account Moves)
    - Lignes d'écriture (Account Move Lines)
    - Taxes
    - Comptes comptables
    - Journaux comptables
  `,
  depends: ['base'],
  installable: true,
  auto_install: false,
  application: true,
  author: 'La Plume Artisanale',
  license: 'PROPRIETARY',
  data: [],
  models: [
    'models/AccountMove.js'
  ],
  controllers: [
    'controllers/account_move.controller.js'
  ],
  routes: [
    'routes/account_move.routes.js'
  ],
  views: [],
  security: [
    'security/ir.model.access.json'
  ],
  postLoad: null
};
