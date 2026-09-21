/**
 * Script pour vérifier le chargement des modules et des routes
 * Aide à diagnostiquer pourquoi les routes ne sont pas enregistrées
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const modulesPath = path.join(__dirname, '../modules');

// Modules à vérifier
const modulesToCheck = [
  'base',
  'mobile',
  'email',
  'settings',
  'qualite-avancee'
];

console.log('🔍 Vérification du chargement des modules\n');
console.log('='.repeat(80));

for (const moduleName of modulesToCheck) {
  const moduleDir = path.join(modulesPath, moduleName);
  const manifestPath = path.join(moduleDir, 'manifest.js');
  
  console.log(`\n📦 Module: ${moduleName}`);
  console.log('-'.repeat(60));
  
  // Vérifier que le module existe
  if (!fs.existsSync(moduleDir)) {
    console.log(`❌ Dossier module n'existe pas: ${moduleDir}`);
    continue;
  }
  
  // Vérifier le manifest
  if (!fs.existsSync(manifestPath)) {
    console.log(`❌ Manifest n'existe pas: ${manifestPath}`);
    continue;
  }
  
  try {
    const manifest = await import(`../modules/${moduleName}/manifest.js`);
    const manifestData = manifest.default || manifest;
    
    console.log(`✅ Manifest trouvé`);
    console.log(`   Name: ${manifestData.name}`);
    console.log(`   Depends: ${manifestData.depends?.join(', ') || 'Aucune'}`);
    
    // Vérifier les routes
    if (manifestData.routes && manifestData.routes.length > 0) {
      console.log(`✅ Routes définies: ${manifestData.routes.length}`);
      manifestData.routes.forEach(routePath => {
        const fullPath = path.join(moduleDir, routePath);
        const exists = fs.existsSync(fullPath);
        const status = exists ? '✅' : '❌';
        console.log(`   ${status} ${routePath} ${exists ? '' : '(MANQUANT)'}`);
        
        if (exists) {
          // Vérifier que le fichier exporte un router
          try {
            const content = fs.readFileSync(fullPath, 'utf8');
            const hasExport = content.includes('export default') || content.includes('module.exports');
            const hasRouter = content.includes('Router') || content.includes('router');
            console.log(`      ${hasExport ? '✅' : '❌'} Export: ${hasExport ? 'Oui' : 'Non'}`);
            console.log(`      ${hasRouter ? '✅' : '❌'} Router: ${hasRouter ? 'Oui' : 'Non'}`);
          } catch (e) {
            console.log(`      ❌ Erreur lecture: ${e.message}`);
          }
        }
      });
    } else {
      console.log(`⚠️  Aucune route définie dans le manifest`);
    }
    
    // Vérifier les modèles
    if (manifestData.models && manifestData.models.length > 0) {
      console.log(`✅ Modèles définis: ${manifestData.models.length}`);
      manifestData.models.forEach(modelPath => {
        const fullPath = path.join(moduleDir, modelPath);
        const exists = fs.existsSync(fullPath);
        const status = exists ? '✅' : '❌';
        console.log(`   ${status} ${modelPath} ${exists ? '' : '(MANQUANT)'}`);
      });
    }
    
    // Vérifier les contrôleurs
    if (manifestData.controllers && manifestData.controllers.length > 0) {
      console.log(`✅ Contrôleurs définis: ${manifestData.controllers.length}`);
      manifestData.controllers.forEach(controllerPath => {
        const fullPath = path.join(moduleDir, controllerPath);
        const exists = fs.existsSync(fullPath);
        const status = exists ? '✅' : '❌';
        console.log(`   ${status} ${controllerPath} ${exists ? '' : '(MANQUANT)'}`);
      });
    }
    
  } catch (error) {
    console.log(`❌ Erreur lors du chargement du manifest: ${error.message}`);
  }
}

console.log('\n' + '='.repeat(80));
console.log('💡 Analyse:');
console.log('   - Si tous les fichiers existent, le problème est dans le chargement');
console.log('   - Vérifiez les logs du serveur pour voir les erreurs de chargement');
console.log('   - Assurez-vous que le serveur a été redémarré après les corrections');
console.log('\n');
