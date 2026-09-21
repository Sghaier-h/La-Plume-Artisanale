/**
 * Script pour migrer complètement le dossier odoo vers erp
 */

const fs = require('fs');
const path = require('path');

function copyDirectory(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const files = fs.readdirSync(src);

  files.forEach(file => {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);
    const stat = fs.statSync(srcPath);

    if (stat.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      let content = fs.readFileSync(srcPath, 'utf8');
      
      // Remplacer les références Odoo par ERP
      content = content
        .replace(/Odoo/g, 'ERP')
        .replace(/odoo/g, 'erp')
        .replace(/from ['"]\.\.\/components\/odoo\//g, "from '../components/erp/")
        .replace(/from ['"]\.\.\/\.\.\/components\/odoo\//g, "from '../../components/erp/")
        .replace(/from ['"]\.\/components\/odoo\//g, "from './components/erp/")
        .replace(/from ['"]\.\.\/fields\//g, "from '../fields/")
        .replace(/from ['"]\.\.\/views\//g, "from '../views/");
      
      // Renommer les fichiers Odoo* en ERP*
      const newFileName = file.replace(/Odoo/g, 'ERP');
      const newDestPath = path.join(dest, newFileName);
      
      fs.writeFileSync(newDestPath, content, 'utf8');
      console.log(`✓ Copié et renommé: ${file} → ${newFileName}`);
    }
  });
}

function updateImportsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    content = content
      .replace(/from ['"]\.\.\/\.\.\/components\/odoo\//g, "from '../../components/erp/")
      .replace(/from ['"]\.\.\/components\/odoo\//g, "from '../components/erp/")
      .replace(/from ['"]\.\/components\/odoo\//g, "from './components/erp/")
      .replace(/from ['"]\.\.\/\.\.\/\.\.\/components\/odoo\//g, "from '../../../components/erp/");
    
    if (content !== originalContent) {
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
      if (!['node_modules', '.git', 'dist', 'build', 'odoo'].includes(file)) {
        processDirectory(filePath);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      updateImportsInFile(filePath);
    }
  });
}

const srcDir = path.join(__dirname, 'src', 'components', 'odoo');
const destDir = path.join(__dirname, 'src', 'components', 'erp');

console.log('Migration du dossier odoo vers erp...\n');

if (fs.existsSync(srcDir)) {
  // Copier tous les fichiers en les renommant
  copyDirectory(srcDir, destDir);
  console.log('\n✓ Migration terminée!\n');
  
  // Mettre à jour les imports dans tous les fichiers
  console.log('Mise à jour des imports...\n');
  processDirectory(path.join(__dirname, 'src'));
  
  console.log('\n✓ Tous les imports mis à jour!');
  console.log('\n⚠️  Vous pouvez maintenant supprimer manuellement le dossier src/components/odoo');
} else {
  console.log('Le dossier odoo n\'existe pas ou a déjà été supprimé.');
}
