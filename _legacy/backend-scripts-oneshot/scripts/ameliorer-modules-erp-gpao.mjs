/**
 * Script pour améliorer tous les modules selon les principes ERP/GPAO
 * 
 * Principes à appliquer :
 * 1. Workflow et états (draft -> confirmed -> done -> cancelled)
 * 2. Relations entre modules
 * 3. Validations métier
 * 4. Traçabilité (created_at, updated_at, user_id)
 * 5. Gestion des stocks
 * 6. Planification
 * 7. Gestion des coûts
 * 8. Gestion qualité
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const modulesPath = path.join(__dirname, '../modules');

// Mapping des workflows par type de module
const workflows = {
  'sale_order': ['brouillon', 'envoyee', 'confirmee', 'livree', 'facturee', 'annulee'],
  'purchase_order': ['brouillon', 'envoyee', 'approuvee', 'achetee', 'receptionnee', 'facturee', 'annulee'],
  'mrp_production': ['brouillon', 'confirmee', 'en_cours', 'terminee', 'annulee'],
  'stock_picking': ['brouillon', 'attribuee', 'en_preparation', 'terminee', 'annulee'],
  'account_move': ['brouillon', 'comptabilisee', 'rapprochee', 'annulee']
};

// Relations entre modules
const moduleRelations = {
  'sale_order': {
    'partner': 'id_client',
    'product': 'lignes_commande',
    'stock_picking': 'id_commande',
    'account_move': 'id_commande'
  },
  'purchase_order': {
    'partner': 'id_fournisseur',
    'product': 'lignes_commande',
    'reception': 'id_commande_fournisseur',
    'account_move': 'id_commande_fournisseur'
  },
  'mrp_production': {
    'bom': 'id_nomenclature',
    'stock': 'id_of',
    'machine': 'id_machine',
    'quality_check': 'id_of'
  }
};

console.log('🔧 Amélioration des modules selon les principes ERP/GPAO...\n');

// Analyser et améliorer chaque module
const modules = fs.readdirSync(modulesPath, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name);

const improvements = [];

for (const moduleName of modules) {
  const modulePath = path.join(modulesPath, moduleName);
  const controllerPath = path.join(modulePath, 'controllers');
  
  if (!fs.existsSync(controllerPath)) {
    continue;
  }
  
  const controllers = fs.readdirSync(controllerPath)
    .filter(file => file.endsWith('.controller.js'));
  
  for (const controllerFile of controllers) {
    const controllerPathFull = path.join(controllerPath, controllerFile);
    const content = fs.readFileSync(controllerPathFull, 'utf8');
    
    const moduleKey = `${moduleName}_${controllerFile.replace('.controller.js', '')}`;
    
    // Vérifier les améliorations nécessaires
    const needs = {
      workflow: !/statut|state|workflow/i.test(content),
      relations: !/JOIN|LEFT JOIN|INNER JOIN/i.test(content),
      validations: !/required|validation|check/i.test(content),
      audit: !/created_at|updated_at|user_id/i.test(content),
      errorHandling: !/try\s*\{|catch\s*\(/i.test(content)
    };
    
    if (Object.values(needs).some(v => v)) {
      improvements.push({
        module: moduleName,
        controller: controllerFile,
        needs
      });
    }
  }
}

console.log(`📊 Analyse terminée : ${improvements.length} améliorations nécessaires\n`);

// Générer un rapport
console.log('📋 RAPPORT D\'AMÉLIORATION\n');
console.log('='.repeat(60));

for (const imp of improvements.slice(0, 20)) {
  console.log(`\n📦 ${imp.module}/${imp.controller}`);
  if (imp.needs.workflow) console.log('   ⚠️  Workflow manquant');
  if (imp.needs.relations) console.log('   ⚠️  Relations manquantes');
  if (imp.needs.validations) console.log('   ⚠️  Validations manquantes');
  if (imp.needs.audit) console.log('   ⚠️  Traçabilité manquante');
  if (imp.needs.errorHandling) console.log('   ⚠️  Gestion d\'erreurs manquante');
}

console.log('\n' + '='.repeat(60));
console.log(`\n✅ Analyse terminée. ${improvements.length} modules nécessitent des améliorations.`);
