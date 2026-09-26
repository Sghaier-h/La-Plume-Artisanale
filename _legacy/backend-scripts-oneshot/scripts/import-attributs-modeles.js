import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../src/utils/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function executeSqlFile(filePath) {
  try {
    const sql = fs.readFileSync(filePath, 'utf-8');
    console.log(`\n📄 Exécution du script: ${path.basename(filePath)}`);
    
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('COMMIT');
      console.log(`✅ Script exécuté avec succès`);
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(`❌ Erreur lors de l'exécution du script: ${error.message}`);
    if (error.code) {
      console.error(`   Code: ${error.code}`);
    }
    if (error.detail) {
      console.error(`   Détail: ${error.detail}`);
    }
    if (error.position) {
      console.error(`   Position: ${error.position}`);
    }
    if (error.query) {
      console.error(`   Requête: ${error.query.substring(0, 200)}...`);
    }
    return false;
  }
}

async function main() {
  console.log('🚀 Import des attributs et modèles dans la base de données\n');
  
  // Chemins des scripts SQL
  const rootDir = path.resolve(__dirname, '../../');
  const scripts = [
    path.join(rootDir, 'database/insert_attributs_catalogue.sql'),
    path.join(rootDir, 'database/insert_modeles_articles_parents.sql')
  ];
  
  let successCount = 0;
  
  for (const scriptPath of scripts) {
    if (!fs.existsSync(scriptPath)) {
      console.error(`❌ Fichier non trouvé: ${scriptPath}`);
      continue;
    }
    
    const success = await executeSqlFile(scriptPath);
    if (success) {
      successCount++;
    }
  }
  
  console.log(`\n${'='.repeat(50)}`);
  if (successCount === scripts.length) {
    console.log('✅ Tous les scripts ont été exécutés avec succès !');
    console.log('   - Attributs du catalogue importés');
    console.log('   - Modèles et fonctions SQL créés');
  } else {
    console.log(`⚠️  ${successCount}/${scripts.length} scripts exécutés avec succès`);
  }
  
  await pool.end();
  process.exit(successCount === scripts.length ? 0 : 1);
}

main().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});
