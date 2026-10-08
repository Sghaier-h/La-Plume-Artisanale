/**
 * Script pour exécuter un fichier SQL d'import
 * Utilisation: 
 *   node scripts/executer-import.js database/imports/01_utilisateurs.sql
 *   node scripts/executer-import.js --all
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pg from 'pg';
import { config } from 'dotenv';

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Charger le .env
config({ path: join(__dirname, '..', '.env') });

async function executerScriptSQL(filePath) {
  const poolConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'la_plume_artisanale',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  };

  const pool = new Pool(poolConfig);

  try {
    console.log(`\n📖 Lecture du fichier: ${filePath}`);
    
    // Résoudre le chemin (peut être relatif ou absolu)
    let fullPath;
    if (filePath.startsWith('/') || filePath.match(/^[A-Z]:/)) {
      fullPath = filePath; // Chemin absolu
    } else {
      // Chemin relatif depuis la racine du projet
      fullPath = join(__dirname, '..', '..', filePath);
    }
    
    if (!existsSync(fullPath)) {
      console.error(`❌ Fichier non trouvé: ${fullPath}`);
      process.exit(1);
    }
    
    const sqlContent = readFileSync(fullPath, 'utf-8');
    
    console.log('🔌 Connexion à la base de données...');
    console.log(`   Database: ${poolConfig.database}`);
    console.log(`   User: ${poolConfig.user}\n`);
    
    const client = await pool.connect();
    
    try {
      console.log('⚙️  Exécution du script SQL...');
      console.log('⏳ Cela peut prendre quelques instants...\n');
      
      await client.query(sqlContent);
      
      console.log(`✅ Script exécuté avec succès !`);
      console.log(`📊 Données importées depuis: ${filePath}\n`);
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'exécution du script SQL:');
      console.error('Message:', error.message);
      console.error('Code:', error.code);
      console.error('Détail:', error.detail);
      console.error('Position:', error.position);
      
      if (error.position) {
        const lines = sqlContent.split('\n');
        const errorLine = sqlContent.substring(0, error.position).split('\n').length;
        console.error('\n📝 Contexte de l\'erreur (ligne ' + errorLine + '):');
        const start = Math.max(0, errorLine - 3);
        const end = Math.min(lines.length, errorLine + 2);
        for (let i = start; i < end; i++) {
          const marker = i === errorLine - 1 ? '>>> ' : '    ';
          console.error(marker + (i + 1) + ': ' + lines[i]);
        }
      }
      
      process.exit(1);
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('❌ Erreur de connexion à la base de données:');
    console.error('Message:', error.message);
    console.error('Code:', error.code);
    console.error('Stack:', error.stack);
    console.error('\n💡 Vérifiez que:');
    console.error('   1. Le fichier .env existe dans backend/.env');
    console.error('   2. Les variables DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD sont définies');
    console.error('   3. PostgreSQL est démarré et accessible');
    process.exit(1);
  } finally {
    await pool.end();
  }
}

async function executerTousLesImports() {
  const importsDir = join(__dirname, '..', '..', 'database', 'imports');
  
  if (!existsSync(importsDir)) {
    console.error(`❌ Dossier non trouvé: ${importsDir}`);
    process.exit(1);
  }
  
  // Lister tous les fichiers SQL triés par nom
  const files = readdirSync(importsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();
  
  if (files.length === 0) {
    console.log('ℹ️  Aucun fichier SQL trouvé dans database/imports/');
    return;
  }
  
  console.log(`📋 ${files.length} fichier(s) SQL trouvé(s):\n`);
  files.forEach((f, i) => console.log(`   ${i + 1}. ${f}`));
  console.log('');
  
  for (const file of files) {
    const filePath = join(importsDir, file);
    await executerScriptSQL(filePath);
  }
  
  console.log('\n✅ Tous les imports sont terminés !');
}

// Point d'entrée
const args = process.argv.slice(2);

if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
  console.log(`
📥 Script d'Import de Données

Utilisation:
  node scripts/executer-import.js <fichier.sql>
  node scripts/executer-import.js --all

Exemples:
  node scripts/executer-import.js database/imports/01_utilisateurs.sql
  node scripts/executer-import.js --all

Options:
  --all     Exécute tous les fichiers SQL dans database/imports/
  --help    Affiche cette aide
  `);
  process.exit(0);
}

if (args[0] === '--all') {
  executerTousLesImports();
} else {
  executerScriptSQL(args[0]);
}
