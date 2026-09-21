/**
 * Script pour adapter les modèles Odoo aux tables SQL existantes
 * Liste les adaptations nécessaires
 */

console.log('📋 ADAPTATIONS NÉCESSAIRES POUR LES MODÈLES ODOO\n');
console.log('='.repeat(60));

const adaptations = [
  {
    module: 'Sale',
    modele: 'SaleOrder',
    fichier: 'modules/sale/models/SaleOrder.js',
    actuel: 'commandes',
    recommande: 'commandes_clients',
    raison: 'Table plus complète avec plus de champs',
    action: 'Changer FROM commandes vers FROM commandes_clients'
  },
  {
    module: 'Sale',
    modele: 'SaleOrderLine',
    fichier: 'modules/sale/models/SaleOrderLine.js',
    actuel: 'commandes_lignes',
    recommande: 'lignes_commande',
    raison: 'Table standardisée dans 11_modules_ventes.sql',
    action: 'Changer FROM commandes_lignes vers FROM lignes_commande'
  },
  {
    module: 'Stock',
    modele: 'StockPicking',
    fichier: 'modules/stock/models/StockPicking.js',
    actuel: 'receptions',
    recommande: 'livraisons',
    raison: 'Table livraisons existe dans 11_modules_ventes.sql',
    action: 'Changer FROM receptions vers FROM livraisons'
  },
  {
    module: 'Account',
    modele: 'AccountMove',
    fichier: 'modules/account/models/AccountMove.js',
    actuel: 'factures',
    recommande: 'factures_clients ou factures_fournisseurs',
    raison: 'Tables séparées selon le type',
    action: 'Adapter selon move_type (out_invoice → factures_clients, in_invoice → factures_fournisseurs)'
  }
];

console.log('\n📝 ADAPTATIONS RECOMMANDÉES:\n');

adaptations.forEach((adapt, index) => {
  console.log(`${index + 1}. ${adapt.module} - ${adapt.modele}`);
  console.log(`   Fichier: ${adapt.fichier}`);
  console.log(`   Actuel: ${adapt.actuel}`);
  console.log(`   Recommandé: ${adapt.recommande}`);
  console.log(`   Raison: ${adapt.raison}`);
  console.log(`   Action: ${adapt.action}`);
  console.log('');
});

console.log('='.repeat(60));
console.log('\n💡 Pour appliquer ces changements:');
console.log('   1. Modifier les fichiers listés ci-dessus');
console.log('   2. Tester avec le script: node verifier-tables-modules-odoo.js');
console.log('   3. Vérifier que les requêtes fonctionnent correctement\n');
