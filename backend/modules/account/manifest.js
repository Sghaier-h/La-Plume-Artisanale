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
  depends: ['base'], // 'partner' est inclus dans 'base'
  installable: true,
  auto_install: false,
  application: true,
  author: 'La Plume Artisanale',
  license: 'PROPRIETARY',
  data: [
    'data/account_chart.json',
    'data/account_taxes.json',
    'data/account_journals.json'
  ],
  models: [
    'models/AccountMove.js',
    'models/AccountMoveLine.js',
    'models/AccountTax.js',
    'models/AccountAccount.js',
    'models/AccountJournal.js'
  ],
  controllers: [
    'controllers/account_move.controller.js',
    'controllers/account_move_line.controller.js',
    'controllers/account_tax.controller.js',
    'controllers/account_account.controller.js',
    'controllers/account_journal.controller.js',
    'controllers/account_reconciliation.controller.js'
  ],
  routes: [
    'routes/account_move.routes.js',
    'routes/account_move_line.routes.js',
    'routes/account_tax.routes.js',
    'routes/account_account.routes.js',
    'routes/account_journal.routes.js',
    'routes/account_reconciliation.routes.js'
  ],
  views: [
    'views/account_move_views.json',
    'views/account_move_line_views.json'
  ],
  security: [
    'security/ir.model.access.json',
    'security/ir_rules.json'
  ],
  postLoad: 'hooks/postLoad.js'
};
