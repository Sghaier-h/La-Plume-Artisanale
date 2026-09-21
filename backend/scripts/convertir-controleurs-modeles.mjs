/**
 * Script pour convertir les contrôleurs qui utilisent le système de modèles
 * vers des contrôleurs qui utilisent directement SQL avec TableMapping
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const modulesPath = path.join(__dirname, '../modules');

// Mapping des modèles vers les tables
const modelToTable = {
  'account.move': { table: 'factures', idField: 'id_facture' },
  'account.move.line': { table: 'lignes_facture', idField: 'id_ligne_facture' },
  'account.tax': { table: 'taxes', idField: 'id_taxe' },
  'account.account': { table: 'comptes_comptables', idField: 'id_compte' },
  'account.journal': { table: 'journaux_comptables', idField: 'id_journal' },
  'hr.employee': { table: 'employes', idField: 'id_employe' },
  'hr.department': { table: 'departements', idField: 'id_departement' },
  'hr.leave': { table: 'conges', idField: 'id_conge' },
  'hr.expense': { table: 'notes_frais', idField: 'id_note_frais' },
  'product.template': { table: 'articles_catalogue', idField: 'id_article' },
  'product.variant': { table: 'variantes_articles', idField: 'id_variante' },
  'product.category': { table: 'categories_articles', idField: 'id_categorie' },
  'product.uom': { table: 'unites_mesure', idField: 'id_uom' },
  'sale.order': { table: 'commandes_clients', idField: 'id_commande' },
  'sale.order.line': { table: 'articles_commande', idField: 'id_article_commande' },
  'purchase.order': { table: 'commandes_fournisseurs', idField: 'id_commande_fournisseur' },
  'purchase.order.line': { table: 'lignes_commande_fournisseur', idField: 'id_ligne' },
  'stock.warehouse': { table: 'entrepots', idField: 'id_entrepot' },
  'stock.location': { table: 'emplacements_stock', idField: 'id_emplacement' },
  'stock.move': { table: 'mouvements_stock', idField: 'id_mouvement' },
  'stock.picking': { table: 'livraisons', idField: 'id_livraison' },
  'stock.quant': { table: 'quants_stock', idField: 'id_quant' },
  'stock.lot': { table: 'lots', idField: 'id_lot' },
  'crm.lead': { table: 'pistes_crm', idField: 'id_piste' },
  'crm.opportunity': { table: 'opportunites_crm', idField: 'id_opportunite' },
  'crm.activity': { table: 'activites_crm', idField: 'id_activite' },
  'crm.campaign': { table: 'campagnes_crm', idField: 'id_campagne' },
  'project.project': { table: 'projets', idField: 'id_projet' },
  'project.task': { table: 'taches_projet', idField: 'id_tache' },
  'inventory.adjustment': { table: 'ajustements_inventaire', idField: 'id_ajustement' },
  'mrp.production': { table: 'ordres_fabrication', idField: 'id_of' },
  'mrp.bom': { table: 'nomenclatures', idField: 'id_nomenclature' },
  'mrp.work.center': { table: 'centres_travail', idField: 'id_centre' },
  'mrp.work.order': { table: 'ordres_travail', idField: 'id_ordre_travail' },
  'mrp.routing': { table: 'gammes', idField: 'id_gamme' },
  'quality.point': { table: 'points_controle', idField: 'id_point' },
  'quality.alert': { table: 'alertes_qualite', idField: 'id_alerte' }
};

function needsConversion(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Vérifier si le fichier utilise le système de modèles
  return content.includes('registry.createEnvironment') || 
         content.includes('env.model(') ||
         content.includes('registry') && content.includes('Environment');
}

function getModelNameFromController(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Chercher env.model('model.name')
  const modelMatch = content.match(/env\.model\(['"]([^'"]+)['"]\)/);
  if (modelMatch) {
    return modelMatch[1];
  }
  
  // Chercher dans les imports ou commentaires
  const commentMatch = content.match(/Model[:\s]+([a-z]+\.[a-z_]+)/i);
  if (commentMatch) {
    return commentMatch[1];
  }
  
  return null;
}

function findControllersUsingModels() {
  const controllers = [];
  
  function walkDir(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const file of files) {
      const fullPath = path.join(dir, file.name);
      
      if (file.isDirectory()) {
        walkDir(fullPath);
      } else if (file.name.endsWith('.controller.js')) {
        if (needsConversion(fullPath)) {
          const modelName = getModelNameFromController(fullPath);
          controllers.push({
            path: fullPath,
            modelName: modelName
          });
        }
      }
    }
  }
  
  walkDir(modulesPath);
  
  return controllers;
}

function main() {
  console.log('🔍 Recherche des contrôleurs utilisant le système de modèles\n');
  console.log('='.repeat(80));
  
  const controllers = findControllersUsingModels();
  
  console.log(`\n📋 Contrôleurs trouvés: ${controllers.length}\n`);
  
  for (const controller of controllers) {
    const relativePath = path.relative(modulesPath, controller.path);
    console.log(`  - ${relativePath}`);
    if (controller.modelName) {
      console.log(`    Modèle: ${controller.modelName}`);
      if (modelToTable[controller.modelName]) {
        console.log(`    Table: ${modelToTable[controller.modelName].table}`);
      } else {
        console.log(`    ⚠️  Table non mappée`);
      }
    }
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('\n💡 Ces contrôleurs doivent être convertis pour utiliser directement SQL');
  console.log('   avec TableMapping au lieu du système de modèles Odoo.\n');
}

main();
