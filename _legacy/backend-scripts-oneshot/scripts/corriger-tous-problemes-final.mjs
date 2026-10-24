/**
 * Script final pour corriger tous les problèmes restants
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const modulesPath = path.join(__dirname, '../modules');

// Corrections spécifiques par fichier
const specificFixes = {
  'utilisateurs/controllers/utilisateurs.controller.js': {
    fixes: [
      {
        pattern: /WHERE id_utilisateurs/g,
        replacement: 'WHERE id_utilisateur'
      },
      {
        pattern: /id_utilisateurs =/g,
        replacement: 'id_utilisateur ='
      }
    ]
  },
  'suivi-fabrication/controllers/suivi-fabrication.controller.js': {
    fixes: [
      {
        pattern: /WHERE id_suivi =/g,
        replacement: 'WHERE id ='
      },
      {
        pattern: /id_suivi/g,
        replacement: 'id'
      }
    ]
  },
  'taches/controllers/taches.controller.js': {
    fixes: [
      {
        pattern: /WHERE id_taches =/g,
        replacement: 'WHERE id ='
      },
      {
        pattern: /id_taches/g,
        replacement: 'id'
      }
    ]
  }
};

function applyFixes(filePath, relativePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  // Appliquer les corrections spécifiques
  if (specificFixes[relativePath]) {
    for (const fix of specificFixes[relativePath].fixes) {
      if (fix.pattern.test(content)) {
        content = content.replace(fix.pattern, fix.replacement);
        changed = true;
      }
    }
  }
  
  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  
  return false;
}

function findAndFixFiles() {
  console.log('🔧 Correction finale de tous les problèmes\n');
  console.log('='.repeat(80));
  
  let fixed = 0;
  
  for (const [relativePath, config] of Object.entries(specificFixes)) {
    const fullPath = path.join(modulesPath, relativePath);
    
    if (fs.existsSync(fullPath)) {
      if (applyFixes(fullPath, relativePath)) {
        console.log(`✅ Corrigé: ${relativePath}`);
        fixed++;
      }
    } else {
      console.log(`⚠️  Fichier non trouvé: ${relativePath}`);
    }
  }
  
  console.log('\n' + '='.repeat(80));
  console.log(`\n✅ Fichiers corrigés: ${fixed}`);
  console.log('='.repeat(80));
}

findAndFixFiles();
