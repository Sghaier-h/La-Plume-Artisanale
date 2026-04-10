/**
 * Script de test pour diagnostiquer le problème de remplacement
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const testFile = path.join(__dirname, '../modules/social-auth/controllers/social-auth.controller.js');
const content = fs.readFileSync(testFile, 'utf8');

console.log('=== TEST DE REMPLACEMENT ===\n');

// Test 1: Extraire table et idField
const selectMatch = content.match(/SELECT\s+\*\s+FROM\s+(\w+)/i);
const whereMatch = content.match(/WHERE\s+(\w+)\s*=\s*\$1/i);
console.log('Table:', selectMatch ? selectMatch[1] : 'NON TROUVÉ');
console.log('ID Field:', whereMatch ? whereMatch[1] : 'NON TROUVÉ');

// Test 2: Trouver les fonctions
const createMatch = content.match(/export\s+const\s+(\w*create\w*)\s*=/i);
const updateMatch = content.match(/export\s+const\s+(\w*update\w*)\s*=/i);
const deleteMatch = content.match(/export\s+const\s+(\w*delete\w*)\s*=/i);
console.log('\nFonctions trouvées:');
console.log('CREATE:', createMatch ? createMatch[1] : 'NON TROUVÉ');
console.log('UPDATE:', updateMatch ? updateMatch[1] : 'NON TROUVÉ');
console.log('DELETE:', deleteMatch ? deleteMatch[1] : 'NON TROUVÉ');

// Test 3: Vérifier "Non implémenté"
console.log('\nContient "Non implémenté":', content.includes('Non implémenté'));
console.log('Contient "501":', content.includes('501'));

// Test 4: Trouver les indices des fonctions
const lines = content.split('\n');
console.log('\n=== LIGNES DES FONCTIONS ===');
lines.forEach((line, i) => {
  if (line.includes('export const') && (line.includes('create') || line.includes('update') || line.includes('delete'))) {
    console.log(`Ligne ${i + 1}: ${line.trim()}`);
  }
});

// Test 5: Pattern de remplacement
const funcName = 'createSocialAuth';
const pattern = new RegExp(
  `export\\s+const\\s+${funcName}\\s*=\\s*async\\s*\\([^)]*\\)\\s*\\{[^}]*?return\\s+sendError\\(res,\\s*['"]Non implémenté['"],\\s*501\\);[^}]*?\\}`,
  's'
);
console.log('\n=== TEST PATTERN ===');
console.log('Pattern match:', pattern.test(content));
