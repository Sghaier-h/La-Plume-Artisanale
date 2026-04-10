/**
 * Script pour renommer tous les fichiers *Odoo.tsx et le dossier odoo
 */

const fs = require('fs');
const path = require('path');

function renameFilesInDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.log(`Dossier non trouvé: ${dirPath}`);
    return;
  }

  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      renameFilesInDirectory(filePath);
    } else if (file.includes('Odoo') && (file.endsWith('.tsx') || file.endsWith('.ts'))) {
      const newName = file.replace(/Odoo/g, '');
      const newPath = path.join(dirPath, newName);
      
      if (file !== newName) {
        try {
          fs.renameSync(filePath, newPath);
          console.log(`✓ Renommé: ${file} -> ${newName}`);
        } catch (error) {
          console.error(`✗ Erreur lors du renommage de ${file}:`, error.message);
        }
      }
    }
  });
}

// Renommer le dossier pages/odoo en pages/erp
const pagesOdooDir = path.join(__dirname, 'src', 'pages', 'odoo');
const pagesErpDir = path.join(__dirname, 'src', 'pages', 'erp');

if (fs.existsSync(pagesOdooDir)) {
  try {
    if (fs.existsSync(pagesErpDir)) {
      console.log('Le dossier erp existe déjà, suppression...');
      fs.rmSync(pagesErpDir, { recursive: true, force: true });
    }
    fs.renameSync(pagesOdooDir, pagesErpDir);
    console.log('✓ Dossier pages/odoo renommé en pages/erp');
  } catch (error) {
    console.error('✗ Erreur lors du renommage du dossier:', error.message);
  }
}

// Renommer le dossier components/odoo en components/erp (si pas déjà fait)
const componentsOdooDir = path.join(__dirname, 'src', 'components', 'odoo');
const componentsErpDir = path.join(__dirname, 'src', 'components', 'erp');

if (fs.existsSync(componentsOdooDir) && !fs.existsSync(componentsErpDir)) {
  try {
    fs.renameSync(componentsOdooDir, componentsErpDir);
    console.log('✓ Dossier components/odoo renommé en components/erp');
  } catch (error) {
    console.error('✗ Erreur lors du renommage du dossier components:', error.message);
  }
}

// Renommer tous les fichiers *Odoo.tsx dans pages/erp
console.log('\nRenommage des fichiers dans pages/erp...');
renameFilesInDirectory(pagesErpDir);

// Renommer tous les fichiers *Odoo.tsx dans components/erp
console.log('\nRenommage des fichiers dans components/erp...');
if (fs.existsSync(componentsErpDir)) {
  renameFilesInDirectory(componentsErpDir);
}

console.log('\nTerminé!');
