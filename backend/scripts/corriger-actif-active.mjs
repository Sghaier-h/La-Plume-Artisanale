/**
 * Script pour corriger "actif" → "active" dans tous les contrôleurs
 */

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
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Trouver tous les contrôleurs
const controllersPath = path.join(backendDir, '**/*.controller.js');
const files = globSync(controllersPath, { ignore: ['**/node_modules/**'] });

log(`\n🔧 Correction "actif" → "active" dans ${files.length} fichiers...`, 'cyan');
log('='.repeat(80), 'cyan');

let fixed = 0;

for (const file of files) {
  try {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;
    const originalContent = content;
    
    // Patterns à remplacer
    const patterns = [
      // Dans les INSERT
      { pattern: /INSERT INTO\s+(\w+)\s*\([^)]*\bactif\b[^)]*\)/gi, 
        replacement: (match) => match.replace(/\bactif\b/g, 'active') },
      // Dans les UPDATE SET
      { pattern: /SET\s+[^=]*\bactif\s*=/gi,
        replacement: (match) => match.replace(/\bactif\s*=/g, 'active =') },
      // Dans les WHERE
      { pattern: /WHERE\s+[^=]*\bactif\s*=/gi,
        replacement: (match) => match.replace(/\bactif\s*=/g, 'active =') },
      // Dans les SELECT (alias)
      { pattern: /SELECT\s+[^,]*\bactif\s+as\s+\w+/gi,
        replacement: (match) => match.replace(/\bactif\s+as/g, 'active as') },
      // Dans les valeurs (VALUES)
      { pattern: /VALUES\s*\([^)]*\bactif\b[^)]*\)/gi,
        replacement: (match) => match.replace(/\bactif\b/g, 'active') },
      // Dans les objets JavaScript (plus simple)
      { pattern: /\bactif\s*:/g,
        replacement: 'active:' },
      { pattern: /:\s*actif\b/g,
        replacement: ': active' },
    ];
    
    for (const { pattern, replacement } of patterns) {
      if (pattern.test(content)) {
        if (typeof replacement === 'function') {
          content = content.replace(pattern, replacement);
        } else {
          content = content.replace(pattern, replacement);
        }
        changed = true;
      }
    }
    
    // Remplacer aussi les occurrences simples dans les chaînes SQL
    // Mais seulement si elles sont dans un contexte SQL
    const sqlContextPattern = /(`[^`]*\bactif\b[^`]*`|'[^']*\bactif\b[^']*')/g;
    const sqlMatches = content.match(sqlContextPattern);
    if (sqlMatches) {
      for (const match of sqlMatches) {
        if (match.includes('actif') && !match.includes('active')) {
          const newMatch = match.replace(/\bactif\b/g, 'active');
          content = content.replace(match, newMatch);
          changed = true;
        }
      }
    }
    
    if (changed && content !== originalContent) {
      fs.writeFileSync(file, content, 'utf8');
      const relativePath = path.relative(backendDir, file);
      log(`✅ Corrigé: ${relativePath}`, 'green');
      fixed++;
    }
  } catch (error) {
    // Ignorer les erreurs de lecture
  }
}

log(`\n✅ Fichiers corrigés: ${fixed}`, 'green');
log('\n');
