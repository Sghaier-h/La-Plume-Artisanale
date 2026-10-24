/**
 * Script pour corriger automatiquement tous les modules partiellement et non fonctionnels
 */

import { pool } from '../src/utils/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { globSync } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendDir = path.join(__dirname, '..');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Corrections de colonnes à appliquer
const columnFixes = {
  // Colonnes "actif" → "active"
  'actif': 'active',
  // Colonnes "name" → selon la table
  'name': {
    'utilisateurs': 'nom_utilisateur',
    'societes': 'nom',
    'articles_catalogue': 'designation',
    'clients': 'raison_sociale',
    'fournisseurs': 'raison_sociale',
    'default': 'nom'
  },
  // Colonnes "description" → peut être manquante
  'description': null, // À retirer si la colonne n'existe pas
  // Colonnes "id" → selon la table
  'id': {
    'societes': 'id_societe',
    'utilisateurs': 'id_utilisateur',
    'taches': 'id_taches',
    'pointage': 'id',
    'default': 'id'
  }
};

// Tables à vérifier/créer avec colonnes
const tablesToCheck = [
  {
    name: 'societes',
    columns: ['id_societe', 'nom', 'raison_sociale', 'actif', 'date_creation', 'date_modification']
  },
  {
    name: 'utilisateurs',
    columns: ['id_utilisateur', 'nom_utilisateur', 'actif', 'date_creation', 'date_modification']
  },
  {
    name: 'caisses',
    columns: ['id', 'nom', 'active', 'created_at', 'updated_at']
  },
  {
    name: 'sessions_caisse',
    columns: ['id', 'id_caisse', 'date_ouverture', 'date_fermeture', 'active', 'created_at', 'updated_at']
  },
  {
    name: 'ventes_caisse',
    columns: ['id', 'id_session', 'id_caisse', 'montant_total', 'active', 'created_at', 'updated_at']
  }
];

// Corrections spécifiques par contrôleur
const controllerFixes = [
  {
    file: 'modules/multisociete/controllers/companies.controller.js',
    fixes: [
      { pattern: /WHERE id =/g, replacement: 'WHERE id_societe =' },
      { pattern: /'name'/g, replacement: "'nom'" },
      { pattern: /"name"/g, replacement: '"nom"' },
      { pattern: /\bname\b/g, replacement: 'nom', context: 'INSERT' }
    ]
  },
  {
    file: 'modules/utilisateurs/controllers/utilisateurs.controller.js',
    fixes: [
      { pattern: /\bname\b/g, replacement: 'nom_utilisateur', context: 'INSERT' }
    ]
  },
  {
    file: 'modules/ecommerce/controllers/ecommerce_product.controller.js',
    fixes: [
      { pattern: /a\.name/g, replacement: 'a.designation' },
      { pattern: /a\.id_categorie/g, replacement: 'pc.id_categorie' },
      { pattern: /column "name"/g, replacement: 'column "designation"' }
    ]
  },
  {
    file: 'modules/ecommerce/controllers/ecommerce_order.controller.js',
    fixes: [
      { pattern: /c\.nom/g, replacement: 'c.raison_sociale' }
    ]
  }
];

// Ajouter colonnes "active" aux tables qui utilisent "actif"
async function addActiveColumns() {
  log('\n🔧 Ajout de colonnes "active" aux tables...', 'cyan');
  log('='.repeat(80), 'cyan');
  
  const tablesWithActif = [
    'mobile', 'email', 'whatsapp', 'communication', 'qualite_avancee', 'qualite_avance',
    'warehouse', 'stock_multi_entrepots', 'production', 'couts',
    'accounting_tunisia', 'payroll_tunisia', 'planning', 'planification_gantt',
    'planning_dragdrop', 'maintenance', 'stock_warehouses', 'stock_locations',
    'stock_moves', 'stock_quants', 'stock_lots', 'mrp_work_centers',
    'mrp_work_orders', 'mrp_routings', 'crm_campaigns', 'project_tasks'
  ];
  
  let added = 0;
  let errors = 0;
  
  for (const table of tablesWithActif) {
    try {
      // Vérifier si la colonne existe
      const checkQuery = `
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = $1 AND column_name = 'active'
      `;
      const checkResult = await pool.query(checkQuery, [table]);
      
      if (checkResult.rows.length === 0) {
        // Vérifier si "actif" existe
        const checkActifQuery = `
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = $1 AND column_name = 'actif'
        `;
        const checkActifResult = await pool.query(checkActifQuery, [table]);
        
        if (checkActifResult.rows.length > 0) {
          // Renommer actif en active
          const alterQuery = `ALTER TABLE ${table} RENAME COLUMN actif TO active`;
          await pool.query(alterQuery);
          log(`✅ Colonne renommée: ${table}.actif → ${table}.active`, 'green');
        } else {
          // Ajouter active
          const alterQuery = `ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true`;
          await pool.query(alterQuery);
          log(`✅ Colonne ajoutée: ${table}.active`, 'green');
        }
        added++;
      } else {
        log(`⚠️  Colonne existe déjà: ${table}.active`, 'yellow');
      }
    } catch (error) {
      log(`❌ Erreur ${table}: ${error.message}`, 'red');
      errors++;
    }
  }
  
  log(`\n✅ Colonnes traitées: ${added}`, 'green');
  if (errors > 0) {
    log(`❌ Erreurs: ${errors}`, 'red');
  }
}

// Corriger les contrôleurs
async function fixControllers() {
  log('\n🔧 Correction des contrôleurs...', 'cyan');
  log('='.repeat(80), 'cyan');
  
  let fixed = 0;
  let errors = 0;
  
  for (const fix of controllerFixes) {
    const filePath = path.join(backendDir, fix.file);
    
    if (!fs.existsSync(filePath)) {
      log(`⚠️  Fichier non trouvé: ${fix.file}`, 'yellow');
      continue;
    }
    
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      let changed = false;
      
      for (const fixItem of fix.fixes) {
        if (fixItem.context === 'INSERT') {
          // Remplacer seulement dans les INSERT
          const insertPattern = /INSERT INTO[^;]+;/g;
          const matches = content.match(insertPattern);
          if (matches) {
            for (const match of matches) {
              if (fixItem.pattern.test(match)) {
                const newMatch = match.replace(fixItem.pattern, fixItem.replacement);
                content = content.replace(match, newMatch);
                changed = true;
              }
            }
          }
        } else {
          // Remplacer partout
          if (fixItem.pattern.test(content)) {
            content = content.replace(fixItem.pattern, fixItem.replacement);
            changed = true;
          }
        }
      }
      
      if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        log(`✅ Corrigé: ${fix.file}`, 'green');
        fixed++;
      }
    } catch (error) {
      log(`❌ Erreur ${fix.file}: ${error.message}`, 'red');
      errors++;
    }
  }
  
  log(`\n✅ Contrôleurs corrigés: ${fixed}`, 'green');
  if (errors > 0) {
    log(`❌ Erreurs: ${errors}`, 'red');
  }
}

// Corriger toutes les références "actif" → "active" dans les contrôleurs
async function fixActifToActive() {
  log('\n🔧 Correction "actif" → "active" dans tous les contrôleurs...', 'cyan');
  log('='.repeat(80), 'cyan');
  
  const controllersPath = path.join(backendDir, '**/*.controller.js');
  const files = globSync(controllersPath, { ignore: ['**/node_modules/**'] });
  
  let fixed = 0;
  
  for (const file of files) {
    try {
      let content = fs.readFileSync(file, 'utf8');
      let changed = false;
      
      // Remplacer dans les INSERT/UPDATE
      const patterns = [
        { pattern: /INSERT INTO \w+[^;]*\bactif\b/g, replacement: (match) => match.replace(/\bactif\b/g, 'active') },
        { pattern: /UPDATE \w+[^;]*\bactif\b/g, replacement: (match) => match.replace(/\bactif\b/g, 'active') },
        { pattern: /SET \w+\.actif/g, replacement: (match) => match.replace(/\.actif/g, '.active') },
        { pattern: /WHERE \w+\.actif/g, replacement: (match) => match.replace(/\.actif/g, '.active') },
        { pattern: /SELECT[^;]*\bactif\b/g, replacement: (match) => match.replace(/\bactif\b/g, 'active') }
      ];
      
      for (const { pattern, replacement } of patterns) {
        if (pattern.test(content)) {
          content = content.replace(pattern, replacement);
          changed = true;
        }
      }
      
      if (changed) {
        fs.writeFileSync(file, content, 'utf8');
        fixed++;
      }
    } catch (error) {
      // Ignorer les erreurs de lecture
    }
  }
  
  log(`✅ Fichiers corrigés: ${fixed}`, 'green');
}

// Vérifier et créer les tables manquantes
async function verifyTables() {
  log('\n🔧 Vérification des tables...', 'cyan');
  log('='.repeat(80), 'cyan');
  
  for (const table of tablesToCheck) {
    try {
      // Vérifier si la table existe
      const checkTableQuery = `
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = $1
        )
      `;
      const tableExists = await pool.query(checkTableQuery, [table.name]);
      
      if (!tableExists.rows[0].exists) {
        log(`⚠️  Table n'existe pas: ${table.name}`, 'yellow');
        // La table devrait être créée par un autre script
      } else {
        // Vérifier les colonnes
        const checkColumnsQuery = `
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = $1
        `;
        const columns = await pool.query(checkColumnsQuery, [table.name]);
        const existingColumns = columns.rows.map(r => r.column_name);
        
        const missingColumns = table.columns.filter(col => !existingColumns.includes(col));
        if (missingColumns.length > 0) {
          log(`⚠️  Colonnes manquantes dans ${table.name}: ${missingColumns.join(', ')}`, 'yellow');
        } else {
          log(`✅ Table ${table.name}: OK`, 'green');
        }
      }
    } catch (error) {
      log(`❌ Erreur vérification ${table.name}: ${error.message}`, 'red');
    }
  }
}

// Fonction principale
async function main() {
  log('\n' + '='.repeat(80), 'cyan');
  log('🔧 CORRECTION AUTOMATIQUE DE TOUS LES MODULES', 'cyan');
  log('='.repeat(80), 'cyan');
  
  try {
    // 1. Ajouter/renommer colonnes "active"
    await addActiveColumns();
    
    // 2. Vérifier les tables
    await verifyTables();
    
    // 3. Corriger les contrôleurs spécifiques
    await fixControllers();
    
    // 4. Corriger "actif" → "active" partout
    await fixActifToActive();
    
    log('\n' + '='.repeat(80), 'cyan');
    log('✅ Corrections terminées', 'green');
    log('='.repeat(80), 'cyan');
    log('\n⚠️  ACTION REQUISE:', 'yellow');
    log('   1. Redémarrer le serveur (Ctrl+C puis npm start)', 'white');
    log('   2. Réexécuter les tests: node scripts/test-automatique.mjs', 'white');
    log('\n');
    
  } catch (error) {
    log(`\n❌ Erreur fatale: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
