/**
 * Script pour remplacer toutes les références Odoo par ERP dans tous les fichiers
 */

const fs = require('fs');
const path = require('path');

const replacements = [
  // Classes CSS
  { from: /odoo-layout/g, to: 'erp-layout' },
  { from: /odoo-header/g, to: 'erp-header' },
  { from: /odoo-content/g, to: 'erp-content' },
  { from: /odoo-breadcrumb/g, to: 'erp-breadcrumb' },
  { from: /odoo-statusbar/g, to: 'erp-statusbar' },
  { from: /odoo-status-badge/g, to: 'erp-status-badge' },
  { from: /odoo-form-view/g, to: 'erp-form-view' },
  { from: /odoo-form-title/g, to: 'erp-form-title' },
  { from: /odoo-notebook/g, to: 'erp-notebook' },
  { from: /odoo-notebook-tabs/g, to: 'erp-notebook-tabs' },
  { from: /odoo-notebook-tab/g, to: 'erp-notebook-tab' },
  { from: /odoo-notebook-content/g, to: 'erp-notebook-content' },
  { from: /odoo-buttonbox/g, to: 'erp-buttonbox' },
  { from: /odoo-chatter/g, to: 'erp-chatter' },
  { from: /odoo-chatter-header/g, to: 'erp-chatter-header' },
  { from: /odoo-chatter-title/g, to: 'erp-chatter-title' },
  { from: /odoo-chatter-messages/g, to: 'erp-chatter-messages' },
  { from: /odoo-chatter-message/g, to: 'erp-chatter-message' },
  { from: /odoo-tree-view/g, to: 'erp-tree-view' },
  { from: /odoo-tree-table/g, to: 'erp-tree-table' },
  { from: /odoo-kanban/g, to: 'erp-kanban' },
  { from: /odoo-kanban-column/g, to: 'erp-kanban-column' },
  { from: /odoo-kanban-card/g, to: 'erp-kanban-card' },
  { from: /odoo-kanban-card-title/g, to: 'erp-kanban-card-title' },
  { from: /odoo-btn/g, to: 'erp-btn' },
  { from: /odoo-btn-primary/g, to: 'erp-btn-primary' },
  { from: /odoo-btn-secondary/g, to: 'erp-btn-secondary' },
  { from: /odoo-btn-success/g, to: 'erp-btn-success' },
  { from: /odoo-btn-warning/g, to: 'erp-btn-warning' },
  { from: /odoo-btn-danger/g, to: 'erp-btn-danger' },
  { from: /odoo-btn-outline/g, to: 'erp-btn-outline' },
  { from: /odoo-field/g, to: 'erp-field' },
  { from: /odoo-field-label/g, to: 'erp-field-label' },
  { from: /odoo-field-input/g, to: 'erp-field-input' },
  { from: /odoo-field-required/g, to: 'erp-field-required' },
  // Variables CSS
  { from: /--odoo-/g, to: '--erp-' },
  // Imports et composants
  { from: /from ['"]\.\.\/\.\.\/components\/odoo['"]/g, to: "from '../../components/erp'" },
  { from: /from ['"]\.\.\/components\/odoo['"]/g, to: "from '../components/erp'" },
  { from: /from ['"]\.\/components\/odoo['"]/g, to: "from './components/erp'" },
  { from: /OdooHeader/g, to: 'ERPHeader' },
  { from: /OdooStatusbar/g, to: 'ERPStatusbar' },
  { from: /OdooNotebook/g, to: 'ERPNotebook' },
  { from: /OdooChatter/g, to: 'ERPChatter' },
  { from: /OdooButtonBox/g, to: 'ERPButtonBox' },
  { from: /OdooHeaderProps/g, to: 'ERPHeaderProps' },
  { from: /OdooStatusbarProps/g, to: 'ERPStatusbarProps' },
  { from: /OdooNotebookProps/g, to: 'ERPNotebookProps' },
  { from: /OdooChatterProps/g, to: 'ERPChatterProps' },
  { from: /OdooButtonBoxProps/g, to: 'ERPButtonBoxProps' },
  // Commentaires
  { from: /Odoo/g, to: 'ERP' },
  // Noms de fichiers dans les imports (pages)
  { from: /from ['"]\.\.\/\.\.\/pages\/odoo\/([^'"]+)Odoo['"]/g, to: "from '../../pages/erp/$1'" },
  { from: /from ['"]\.\.\/pages\/odoo\/([^'"]+)Odoo['"]/g, to: "from '../pages/erp/$1'" },
  { from: /from ['"]\.\/pages\/odoo\/([^'"]+)Odoo['"]/g, to: "from './pages/erp/$1'" },
];

function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    replacements.forEach(({ from, to }) => {
      if (typeof to === 'function') {
        const newContent = content.replace(from, to);
        if (newContent !== content) {
          content = newContent;
          modified = true;
        }
      } else {
        const newContent = content.replace(from, to);
        if (newContent !== content) {
          content = newContent;
          modified = true;
        }
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✓ Modifié: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`✗ Erreur sur ${filePath}:`, error.message);
    return false;
  }
}

function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Ignorer node_modules et autres dossiers
      if (!['node_modules', '.git', 'dist', 'build'].includes(file)) {
        processDirectory(filePath);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.css') || file.endsWith('.js')) {
      processFile(filePath);
    }
  });
}

console.log('Début du remplacement des références Odoo par ERP...\n');
processDirectory(path.join(__dirname, 'src'));
console.log('\nTerminé!');
