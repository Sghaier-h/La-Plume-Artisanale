/**
 * Script pour corriger les noms de contrôleurs dans les routes
 * Enlève le "_controller" en double
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const modulesPath = path.join(__dirname, '../modules');

function fixControllerNames() {
  console.log('🔧 Correction des noms de contrôleurs dans les routes\n');
  console.log('='.repeat(80));

  const modules = fs.readdirSync(modulesPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  let fixed = 0;

  for (const moduleName of modules) {
    const modulePath = path.join(modulesPath, moduleName);
    
    // Chercher les routes dans routes/ et à la racine
    const routeFiles = [];
    
    const routesPath = path.join(modulePath, 'routes');
    if (fs.existsSync(routesPath)) {
      const files = fs.readdirSync(routesPath, { recursive: true })
        .filter(f => f.endsWith('.routes.js'))
        .map(f => path.join(routesPath, f));
      routeFiles.push(...files);
    }
    
    // Routes à la racine (crm, inventory, quality)
    const rootRoutes = fs.readdirSync(modulePath)
      .filter(f => f.endsWith('.routes.js'))
      .map(f => path.join(modulePath, f));
    routeFiles.push(...rootRoutes);
    
    for (const routeFile of routeFiles) {
      let content = fs.readFileSync(routeFile, 'utf8');
      let changed = false;
      
      // Remplacer _controller.controller.js par .controller.js
      const regex = /([a-z_]+)_controller\.controller\.js/g;
      if (regex.test(content)) {
        content = content.replace(regex, '$1.controller.js');
        changed = true;
      }
      
      if (changed) {
        fs.writeFileSync(routeFile, content, 'utf8');
        console.log(`✅ Corrigé: ${path.relative(modulesPath, routeFile)}`);
        fixed++;
      }
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log(`\n✅ Routes corrigées: ${fixed}`);
  console.log('='.repeat(80));
}

fixControllerNames();
