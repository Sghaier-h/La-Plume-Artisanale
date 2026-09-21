/**
 * Script pour remplacer toutes les classes odoo- par erp- dans tous les fichiers frontend
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
  { from: /odoo-tree-view/g, to: 'erp-tree-view' },
  { from: /odoo-tree-table/g, to: 'erp-tree-table' },
  { from: /odoo-kanban/g, to: 'erp-kanban' },
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
];

function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    replacements.forEach(({ from, to }) => {
      const newContent = content.replace(from, to);
      if (newContent !== content) {
        content = newContent;
        modified = true;
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
      processFile(filePath);
    }
  });
}

console.log('Remplacement des classes odoo- par erp-...\n');
processDirectory(path.join(__dirname, 'src', 'pages', 'erp'));
console.log('\nTerminé!');
