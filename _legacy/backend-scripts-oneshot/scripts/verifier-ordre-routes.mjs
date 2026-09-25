/**
 * Script pour vérifier l'ordre d'enregistrement des routes
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendDir = path.join(__dirname, '..');

// Simuler la logique de tri
const routes = [
  { path: '/api/ecommerce', hasParams: true, pathDepth: 1 },
  { path: '/api/ecommerce/products', hasParams: false, pathDepth: 2 },
  { path: '/api/ecommerce/orders', hasParams: false, pathDepth: 2 },
  { path: '/api/pos', hasParams: true, pathDepth: 1 },
  { path: '/api/pos/caisses', hasParams: false, pathDepth: 2 },
  { path: '/api/pos/sessions', hasParams: false, pathDepth: 2 },
  { path: '/api/pos/ventes', hasParams: false, pathDepth: 2 },
  { path: '/api/multisociete', hasParams: true, pathDepth: 1 },
  { path: '/api/multisociete/companies', hasParams: false, pathDepth: 2 },
];

console.log('\n📋 Routes AVANT tri:');
routes.forEach(r => console.log(`  ${r.path} (params: ${r.hasParams}, depth: ${r.pathDepth})`));

routes.sort((a, b) => {
  // 1. Routes sans paramètres AVANT routes avec paramètres
  if (a.hasParams && !b.hasParams) return 1;
  if (!a.hasParams && b.hasParams) return -1;
  
  // 2. Parmi les routes sans paramètres, les plus longues (plus spécifiques) en premier
  if (!a.hasParams && !b.hasParams) {
    return b.pathDepth - a.pathDepth;
  }
  
  // 3. Parmi les routes avec paramètres, les plus courtes en premier
  if (a.hasParams && b.hasParams) {
    return a.pathDepth - b.pathDepth;
  }
  
  return 0;
});

console.log('\n✅ Routes APRÈS tri:');
routes.forEach(r => console.log(`  ${r.path} (params: ${r.hasParams}, depth: ${r.pathDepth})`));

console.log('\n🎯 Vérification:');
const specificRoutes = routes.filter(r => !r.hasParams);
const paramRoutes = routes.filter(r => r.hasParams);

console.log(`\n  Routes spécifiques (${specificRoutes.length}):`);
specificRoutes.forEach(r => console.log(`    ✅ ${r.path}`));

console.log(`\n  Routes avec paramètres (${paramRoutes.length}):`);
paramRoutes.forEach(r => console.log(`    ✅ ${r.path}`));

// Vérifier que les routes spécifiques sont bien avant les routes avec paramètres
const firstParamIndex = routes.findIndex(r => r.hasParams);
const lastSpecificIndex = routes.length - 1 - routes.slice().reverse().findIndex(r => !r.hasParams);

if (firstParamIndex === -1 || lastSpecificIndex === -1 || firstParamIndex > lastSpecificIndex) {
  console.log('\n✅ Ordre correct: routes spécifiques avant routes avec paramètres');
} else {
  console.log('\n❌ Ordre incorrect!');
}
