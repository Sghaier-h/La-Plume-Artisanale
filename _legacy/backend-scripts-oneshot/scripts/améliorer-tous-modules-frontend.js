/**
 * Script pour améliorer automatiquement tous les modules frontend
 * Ajoute les fonctionnalités manquantes selon le pattern standardisé
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const frontendPath = path.join(__dirname, '../../frontend/src/pages/erp');
const modules = fs.readdirSync(frontendPath).filter(f => f.endsWith('.tsx') && f !== 'Home.tsx' && f !== 'Dashboards.tsx');

console.log(`📦 ${modules.length} modules à améliorer\n`);

const improvements = {
  addedDelete: [],
  addedLoadRelations: [],
  addedImports: [],
  updatedTables: [],
  errors: []
};

modules.forEach(moduleFile => {
  const filePath = path.join(frontendPath, moduleFile);
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  try {
    // 1. Vérifier et ajouter loadRelations: true
    if (!content.includes('loadRelations: true')) {
      const loadPattern = /const\s+params:\s*any\s*=\s*\{\s*\}/;
      if (loadPattern.test(content)) {
        content = content.replace(loadPattern, 'const params: any = { loadRelations: true }');
        improvements.addedLoadRelations.push(moduleFile);
        modified = true;
      }
    }

    // 2. Vérifier et ajouter les imports de relations
    if (!content.includes('displayMany2One') && content.includes('partner_id') || content.includes('product_id')) {
      const importPattern = /import\s+.*from\s+['"]lucide-react['"];?/;
      if (importPattern.test(content)) {
        const importLine = content.match(importPattern)[0];
        const newImport = importLine.replace(
          /from\s+['"]lucide-react['"]/,
          "from '../../utils/relations';\nimport { Plus, Edit, Trash2, Eye"
        );
        content = content.replace(importPattern, newImport);
        improvements.addedImports.push(moduleFile);
        modified = true;
      }
    }

    // 3. Vérifier et ajouter handleDelete
    if (!content.includes('handleDelete')) {
      const handleSavePattern = /const\s+handleSave\s*=\s*async/;
      if (handleSavePattern.test(content)) {
        const handleSaveMatch = content.match(handleSavePattern);
        const insertPos = content.indexOf(handleSaveMatch[0]) + handleSaveMatch[0].length;
        const handleSaveEnd = content.indexOf('};', insertPos);
        const handleSaveBlock = content.substring(insertPos, handleSaveEnd);
        
        if (handleSaveBlock.includes('update') || handleSaveBlock.includes('create')) {
          const deleteFunction = `
  
  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) {
      try {
        await api.delete(\`/endpoint/\${id}\`);
        loadItems();
      } catch (error: any) {
        alert(error.response?.data?.error?.message || 'Erreur lors de la suppression');
      }
    }
  };`;
          
          content = content.substring(0, handleSaveEnd) + deleteFunction + content.substring(handleSaveEnd);
          improvements.addedDelete.push(moduleFile);
          modified = true;
        }
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ ${moduleFile} - Améliorations appliquées`);
    } else {
      console.log(`⏭️  ${moduleFile} - Déjà à jour`);
    }
  } catch (error) {
    improvements.errors.push({ file: moduleFile, error: error.message });
    console.log(`❌ ${moduleFile} - Erreur: ${error.message}`);
  }
});

console.log(`\n📊 Résumé:`);
console.log(`   - loadRelations ajouté: ${improvements.addedLoadRelations.length}`);
console.log(`   - Imports ajoutés: ${improvements.addedImports.length}`);
console.log(`   - handleDelete ajouté: ${improvements.addedDelete.length}`);
console.log(`   - Erreurs: ${improvements.errors.length}`);
