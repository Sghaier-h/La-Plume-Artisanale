/**
 * Script pour corriger tous les imports dans les fichiers de pages
 */

const fs = require('fs');
const path = require('path');

function fixImportsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Remplacer les imports components/odoo par components/erp
    const newContent = content
      .replace(/from ['"]\.\.\/\.\.\/components\/odoo\//g, "from '../../components/erp/")
      .replace(/from ['"]\.\.\/components\/odoo\//g, "from '../components/erp/")
      .replace(/from ['"]\.\/components\/odoo\//g, "from './components/erp/")
      .replace(/from ['"]\.\.\/\.\.\/components\/odoo['"]/g, "from '../../components/erp'")
      .replace(/from ['"]\.\.\/components\/odoo['"]/g, "from '../components/erp'")
      .replace(/from ['"]\.\/components\/odoo['"]/g, "from './components/erp'");

    if (newContent !== content) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`✓ Corrigé: ${filePath}`);
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
      if (!['node_modules', '.git', 'dist', 'build'].includes(file)) {
        processDirectory(filePath);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fixImportsInFile(filePath);
    }
  });
}

console.log('Correction des imports...\n');
processDirectory(path.join(__dirname, 'src', 'pages', 'erp'));
console.log('\nTerminé!');
