/**
 * Script pour vérifier et corriger tous les chemins de navigation
 * Compare les chemins dans NavigationEnhanced avec les routes dans App.tsx
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Chemins à corriger (ancien -> nouveau)
const pathCorrections = {
  '/magasinier-mp': '/dashboard-magasinier-mp',
  '/tisseur': '/dashboard-tisseur',
  '/coupe': '/dashboard-post-coupe',
  '/controle-central': '/dashboard-controle-central',
  '/chef-atelier': '/chef-atelier-dashboard',
  '/magasinier-soustraitants': '/dashboard-magasinier-soustraitants',
  '/chef-production': '/dashboard-chef-production',
};

const navigationFile = path.join(__dirname, '../src/components/NavigationEnhanced.tsx');

console.log('🔍 Vérification des chemins de navigation...\n');

let content = fs.readFileSync(navigationFile, 'utf8');
let corrections = 0;

// Appliquer les corrections
for (const [oldPath, newPath] of Object.entries(pathCorrections)) {
  const regex = new RegExp(`path: ['"]${oldPath.replace('/', '\\/')}['"]`, 'g');
  const matches = content.match(regex);
  if (matches) {
    content = content.replace(regex, `path: '${newPath}'`);
    corrections += matches.length;
    console.log(`✅ Corrigé: ${oldPath} -> ${newPath} (${matches.length} occurrence(s))`);
  }
}

if (corrections > 0) {
  fs.writeFileSync(navigationFile, content, 'utf8');
  console.log(`\n✅ ${corrections} correction(s) appliquée(s)`);
} else {
  console.log('✅ Aucune correction nécessaire');
}

console.log('\n✅ Vérification terminée');
