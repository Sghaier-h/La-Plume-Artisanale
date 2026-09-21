/**
 * Script pour mettre à jour toutes les références de tables
 * pour utiliser le système de mapping centralisé
 */

const fs = require('fs');
const path = require('path');

const tableReplacements = [
  // Tables principales
  { from: /FROM commandes_clients/g, to: 'FROM commandes_clients', note: 'Utiliser getTableName(\'sale.order\')' },
  { from: /FROM articles_commande/g, to: 'FROM articles_commande', note: 'Utiliser getTableName(\'sale.order.line\')' },
  { from: /FROM clients/g, to: 'FROM clients', note: 'Utiliser getTableName(\'res.partner\')' },
  { from: /FROM articles/g, to: 'FROM articles', note: 'Utiliser getTableName(\'product.product\')' },
  { from: /FROM factures/g, to: 'FROM factures', note: 'Utiliser getTableName(\'account.move\')' },
  { from: /FROM livraisons/g, to: 'FROM livraisons', note: 'Utiliser getTableName(\'stock.picking\')' },
  { from: /FROM commandes_fournisseurs/g, to: 'FROM commandes_fournisseurs', note: 'Utiliser getTableName(\'purchase.order\')' },
  { from: /FROM ordres_fabrication/g, to: 'FROM ordres_fabrication', note: 'Utiliser getTableName(\'mrp.production\')' },
  
  // Champs ID
  { from: /id_commande/g, to: 'id_commande', note: 'Utiliser getIdField(\'sale.order\')' },
  { from: /id_client/g, to: 'id_client', note: 'Utiliser getIdField(\'res.partner\')' },
  { from: /id_article/g, to: 'id_article', note: 'Utiliser getIdField(\'product.product\')' },
];

function updateFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let hasTableReferences = false;
    
    // Vérifier si le fichier contient des références de tables
    for (const replacement of tableReplacements) {
      if (replacement.from.test(content)) {
        hasTableReferences = true;
        break;
      }
    }
    
    if (!hasTableReferences) {
      return false;
    }
    
    // Ajouter l'import si nécessaire
    if (content.includes('FROM ') && !content.includes('TableMapping')) {
      const importLine = "import { getTableName, getIdField, mapField, mapRecord, mapValues } from '../../../src/core/TableMapping.js';";
      
      // Trouver où insérer l'import (après les autres imports)
      const importMatch = content.match(/(import.*from.*['"];?\s*\n)+/);
      if (importMatch) {
        content = content.replace(importMatch[0], importMatch[0] + importLine + '\n');
        modified = true;
      }
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✓ Mis à jour: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`✗ Erreur sur ${filePath}:`, error.message);
    return false;
  }
}

function processDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return;
  }

  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (!['node_modules', '.git', 'dist', 'build', 'scripts'].includes(file)) {
        processDirectory(filePath);
      }
    } else if (file.endsWith('.js') && (file.includes('model') || file.includes('controller'))) {
      updateFile(filePath);
    }
  });
}

console.log('Mise à jour des références de tables...\n');
processDirectory(path.join(__dirname, '..', 'modules'));
console.log('\n✓ Terminé!');
console.log('\n⚠️  Note: Ce script a ajouté les imports nécessaires.');
console.log('    Vous devez maintenant remplacer manuellement les références de tables');
console.log('    par les appels aux fonctions de TableMapping.js');
