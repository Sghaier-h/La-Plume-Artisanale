/**
 * Script final pour corriger toutes les erreurs identifiées
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../src/utils/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendDir = path.join(__dirname, '..');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Corrections de contrôleurs
const controllerFixes = [
  {
    file: 'src/controllers/taches.controller.js',
    fixes: [
      // Retirer les références à t.id_of si la colonne n'existe pas
      // Le JOIN peut rester mais ne pas utiliser t.id_of dans WHERE
      { 
        pattern: /AND t\.id_of = \$\{paramIndex\}/g, 
        replacement: 'AND of.id_of = $${paramIndex}',
        condition: (content) => content.includes('LEFT JOIN ordres_fabrication of ON t.id_of')
      },
      // Pour les INSERT, retirer id_of si la colonne n'existe pas
      {
        pattern: /id_of/g,
        replacement: '', // À retirer des INSERT si la colonne n'existe pas
        files: ['src/controllers/taches.controller.js'],
        context: 'INSERT'
      }
    ]
  },
  {
    file: 'modules/utilisateurs/controllers/utilisateurs.controller.js',
    fixes: [
      { pattern: /name/g, replacement: 'nom_utilisateur', context: 'INSERT' },
      { pattern: /'name'/g, replacement: "'nom_utilisateur'" }
    ]
  },
  {
    file: 'modules/multisociete/controllers/companies.controller.js',
    fixes: [
      { pattern: /WHERE id =/g, replacement: 'WHERE id_societe =' },
      { pattern: /'name'/g, replacement: "'nom'" }
    ]
  },
  {
    file: 'modules/pointage/controllers/pointage.controller.js',
    fixes: [
      { pattern: /id_pointage/g, replacement: 'id' }
    ]
  }
];

// Ajouter colonnes manquantes aux tables
const columnAdditions = [
  {
    table: 'taches',
    columns: [
      { name: 'id_of', type: 'INTEGER', nullable: true }
    ]
  }
];

async function addColumns() {
  log('\n🔧 Ajout de colonnes manquantes...', 'cyan');
  log('='.repeat(80), 'cyan');
  
  for (const { table, columns } of columnAdditions) {
    for (const col of columns) {
      try {
        // Vérifier si la colonne existe
        const checkQuery = `
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = $1 AND column_name = $2
        `;
        const checkResult = await pool.query(checkQuery, [table, col.name]);
        
        if (checkResult.rows.length === 0) {
          const alterQuery = `
            ALTER TABLE ${table} 
            ADD COLUMN ${col.name} ${col.type}${col.nullable ? '' : ' NOT NULL'}
          `;
          await pool.query(alterQuery);
          log(`✅ Colonne ajoutée: ${table}.${col.name}`, 'green');
        } else {
          log(`⚠️  Colonne existe déjà: ${table}.${col.name}`, 'yellow');
        }
      } catch (error) {
        log(`❌ Erreur ajout ${table}.${col.name}: ${error.message}`, 'red');
      }
    }
  }
}

function fixControllers() {
  log('\n🔧 Correction des contrôleurs...', 'cyan');
  log('='.repeat(80), 'cyan');
  
  let fixed = 0;
  
  for (const fix of controllerFixes) {
    const filePath = path.join(backendDir, fix.file);
    
    if (!fs.existsSync(filePath)) {
      log(`⚠️  Fichier non trouvé: ${fix.file}`, 'yellow');
      continue;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    for (const fixItem of fix.fixes) {
      // Vérifier la condition si elle existe
      if (fixItem.condition && !fixItem.condition(content)) {
        continue;
      }
      
      // Appliquer seulement dans le contexte spécifié
      if (fixItem.context) {
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
  }
  
  log(`\n✅ Contrôleurs corrigés: ${fixed}`, 'green');
}

async function main() {
  log('\n' + '='.repeat(80), 'cyan');
  log('🔧 CORRECTION FINALE DE TOUTES LES ERREURS', 'cyan');
  log('='.repeat(80), 'cyan');
  
  try {
    // Ajouter colonnes manquantes
    await addColumns();
    
    // Corriger les contrôleurs
    fixControllers();
    
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
