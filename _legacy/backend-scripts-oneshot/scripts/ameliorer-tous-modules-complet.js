/**
 * Script complet pour améliorer TOUS les modules
 * Ajoute automatiquement toutes les fonctionnalités manquantes
 */

const fs = require('fs');
const path = require('path');

const frontendPagesPath = path.join(__dirname, '../../frontend/src/pages/erp');
const modules = fs.readdirSync(frontendPagesPath)
  .filter(f => f.endsWith('.tsx') && f !== 'Home.tsx' && f !== 'Dashboards.tsx' && f !== 'AI.tsx' && f !== 'AISettings.tsx' && f !== 'Settings.tsx' && f !== 'SocialAuth.tsx' && f !== 'ParametrageComplet.tsx' && f !== 'Reports.tsx' && f !== 'CommercialDashboard.tsx');

console.log(`🚀 Amélioration de ${modules.length} modules...\n`);

const improvements = {
  added: [],
  skipped: [],
  errors: []
};

modules.forEach(moduleFile => {
  try {
    const filePath = path.join(frontendPagesPath, moduleFile);
    let content = fs.readFileSync(filePath, 'utf8');
    const moduleName = moduleFile.replace('.tsx', '');
    let modified = false;

    // 1. Ajouter import relations si manquant
    if (!content.includes("from '../../utils/relations'")) {
      const importIndex = content.indexOf("import {");
      if (importIndex !== -1) {
        const nextLine = content.indexOf('\n', importIndex);
        const imports = content.substring(importIndex, nextLine);
        if (!imports.includes('relations')) {
          content = content.replace(
            /import.*from.*['"]\.\.\/\.\.\/components\/erp['"];?/,
            match => match + "\nimport { displayMany2One, formatDate, formatCurrency, formatState } from '../../utils/relations';"
          );
          modified = true;
        }
      }
    }

    // 2. Ajouter useNotifications si manquant
    if (!content.includes('useNotifications')) {
      if (content.includes("from '../../components/erp'")) {
        content = content.replace(
          /import \{ ([^}]+) \} from ['"]\.\.\/\.\.\/components\/erp['"];?/,
          (match, imports) => {
            if (!imports.includes('useNotifications')) {
              return `import { ${imports}, useNotifications } from '../../components/erp';`;
            }
            return match;
          }
        );
        modified = true;
      }
    }

    // 3. Ajouter loadRelations dans les requêtes API
    if (!content.includes('loadRelations: true') && !content.includes('loadRelations')) {
      // Chercher les appels API
      content = content.replace(
        /const params: any = \{\};/g,
        "const params: any = { loadRelations: true };"
      );
      content = content.replace(
        /const params: any = \{([^}]*)\};/g,
        (match, params) => {
          if (!params.includes('loadRelations')) {
            return `const params: any = { loadRelations: true, ${params.trim() ? params + ',' : ''} };`;
          }
          return match;
        }
      );
      modified = true;
    }

    // 4. Ajouter handleDelete si manquant
    if (!content.includes('const handleDelete')) {
      // Chercher handleSave pour ajouter handleDelete après
      const handleSaveMatch = content.match(/const handleSave = async \(([^)]+)\) => \{[\s\S]*?\n  \};/);
      if (handleSaveMatch) {
        const handleDeleteCode = `
  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) {
      try {
        await api.delete(\`/${moduleName}/\${id}\`);
        ${content.includes('load') && content.match(/const load\w+ = async/)?.[0]?.replace('const ', '').replace(' = async', '') || 'loadData'}();
      } catch (error: any) {
        alert(error.response?.data?.error?.message || 'Erreur lors de la suppression');
      }
    }
  };`;
        content = content.replace(/(const handleSave[^}]+}\n  \};)/, `$1${handleDeleteCode}`);
        modified = true;
      }
    }

    // 5. Remplacer alert() par useNotifications
    if (content.includes('alert(') && !content.includes('const { success, error } = useNotifications()')) {
      // Ajouter la déclaration useNotifications
      const componentMatch = content.match(/(const \w+ERP: React\.FC = \(\) => \{)/);
      if (componentMatch) {
        content = content.replace(
          componentMatch[0],
          `${componentMatch[0]}\n  const { success, error: showError } = useNotifications();`
        );
        modified = true;
      }

      // Remplacer les alert par notifications
      content = content.replace(
        /alert\(([^)]+)\);?/g,
        (match, message) => {
          if (message.includes('succès') || message.includes('enregistré') || message.includes('créé')) {
            return `success(${message});`;
          } else {
            return `showError(${message});`;
          }
        }
      );
      modified = true;
    }

    // 6. Ajouter formatage dans les tableaux
    if (content.includes('<td>') && !content.includes('displayMany2One') && content.includes('partner_id') || content.includes('product_id')) {
      // Chercher les colonnes avec relations
      content = content.replace(
        /<td>\{([^}]+)\.(partner_id|product_id|user_id|category_id|categ_id)(\?\.\[1\]|\?\[1\]|\[1\])/g,
        (match, varName, field) => {
          return `<td>{displayMany2One(${varName}.${field})}`;
        }
      );
      modified = true;
    }

    // 7. Ajouter formatDate pour les dates
    if (content.includes('toLocaleDateString()') && !content.includes('formatDate')) {
      content = content.replace(
        /new Date\(([^)]+)\)\.toLocaleDateString\(\)/g,
        'formatDate($1)'
      );
      modified = true;
    }

    // 8. Ajouter formatCurrency pour les montants
    if (content.includes('.toFixed(2)') && !content.includes('formatCurrency')) {
      content = content.replace(
        /(\w+)\.toFixed\(2\)(\s*\|\|\s*['"]0\.00['"])?\s*\+\s*['"]\s*TND['"]/g,
        'formatCurrency($1)'
      );
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      improvements.added.push(moduleName);
      console.log(`✅ ${moduleName} amélioré`);
    } else {
      improvements.skipped.push(moduleName);
      console.log(`⏭️  ${moduleName} déjà complet`);
    }
  } catch (error) {
    improvements.errors.push({ module: moduleFile, error: error.message });
    console.log(`❌ Erreur ${moduleFile}: ${error.message}`);
  }
});

console.log(`\n${'='.repeat(60)}`);
console.log(`✅ Modules améliorés: ${improvements.added.length}`);
console.log(`⏭️  Modules déjà complets: ${improvements.skipped.length}`);
console.log(`❌ Erreurs: ${improvements.errors.length}`);
console.log(`${'='.repeat(60)}\n`);

if (improvements.added.length > 0) {
  console.log('📝 Modules améliorés:');
  improvements.added.forEach(m => console.log(`   - ${m}`));
}

if (improvements.errors.length > 0) {
  console.log('\n❌ Erreurs:');
  improvements.errors.forEach(e => console.log(`   - ${e.module}: ${e.error}`));
}
