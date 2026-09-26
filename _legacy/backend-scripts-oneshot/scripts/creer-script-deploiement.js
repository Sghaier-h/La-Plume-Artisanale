/**
 * Script pour créer un fichier SQL unique pour le déploiement sur le serveur
 * Combine tous les fichiers d'import en un seul script
 * 
 * Utilisation: node scripts/creer-script-deploiement.js
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const importsDir = join(__dirname, '..', '..', 'database', 'imports');
const outputFile = join(__dirname, '..', '..', 'database', 'DEPLOIEMENT_DONNEES_REELLES.sql');

function creerScriptDeploiement() {
  if (!existsSync(importsDir)) {
    console.error(`❌ Dossier non trouvé: ${importsDir}`);
    process.exit(1);
  }
  
  // Lister tous les fichiers SQL triés par nom
  const files = readdirSync(importsDir)
    .filter(f => f.endsWith('.sql') && !f.startsWith('_'))
    .sort();
  
  if (files.length === 0) {
    console.log('ℹ️  Aucun fichier SQL trouvé dans database/imports/');
    return;
  }
  
  console.log(`📋 ${files.length} fichier(s) SQL trouvé(s)\n`);
  
  let scriptContent = `-- ============================================================================
-- SCRIPT DE DÉPLOIEMENT - DONNÉES RÉELLES
-- ============================================================================
-- Ce script combine tous les imports de données réelles
-- Généré automatiquement le: ${new Date().toLocaleString('fr-FR')}
-- ============================================================================
--
-- ⚠️  ATTENTION: Ce script va insérer/modifier des données dans la base
-- Assurez-vous d'avoir fait une sauvegarde avant l'exécution
--
-- ============================================================================

BEGIN;

`;

  // Ajouter le contenu de chaque fichier
  files.forEach((file, index) => {
    const filePath = join(importsDir, file);
    console.log(`   ${index + 1}. Lecture de ${file}...`);
    
    const content = readFileSync(filePath, 'utf-8');
    
    scriptContent += `\n-- ============================================================================
-- ${index + 1}. ${file}
-- ============================================================================

${content}

`;
  });
  
  scriptContent += `-- ============================================================================
-- FIN DU SCRIPT DE DÉPLOIEMENT
-- ============================================================================

COMMIT;

-- Vérification rapide
SELECT 
  'Utilisateurs' as table_name, COUNT(*) as count FROM utilisateurs
UNION ALL
SELECT 'Clients', COUNT(*) FROM clients
UNION ALL
SELECT 'Articles', COUNT(*) FROM articles_catalogue
UNION ALL
SELECT 'Commandes', COUNT(*) FROM commandes
UNION ALL
SELECT 'OF', COUNT(*) FROM ordres_fabrication
UNION ALL
SELECT 'Machines', COUNT(*) FROM machines;

-- ✅ Déploiement terminé avec succès !
`;

  // Écrire le fichier
  writeFileSync(outputFile, scriptContent, 'utf-8');
  
  console.log(`\n✅ Script de déploiement créé: ${outputFile}`);
  console.log(`📊 Taille: ${(scriptContent.length / 1024).toFixed(2)} KB`);
  console.log(`\n🚀 Vous pouvez maintenant déployer ce fichier sur le serveur !\n`);
}

creerScriptDeploiement();
