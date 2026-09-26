/**
 * Script pour améliorer les modules restants
 * Ajoute useNotifications et validateForm aux modules qui en ont besoin
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const frontendPath = path.join(__dirname, '../../frontend/src/pages/erp');
const modulesToImprove = [
  'HRRecruitment.tsx',
  'Opportunities.tsx',
  'CRMCampaigns.tsx',
  'BankReconciliation.tsx',
  'Companies.tsx',
  'ProductCategories.tsx',
  'PayrollTunisia.tsx'
];

function improveModule(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // 1. Ajouter useNotifications à l'import si absent
  if (!content.includes('useNotifications') && content.includes("from '../../components/erp'")) {
    content = content.replace(
      /import \{ ([^}]+) \} from '\.\.\/\.\.\/components\/erp';/,
      (match, imports) => {
        if (!imports.includes('useNotifications')) {
          return `import { ${imports}, useNotifications } from '../../components/erp';`;
        }
        return match;
      }
    );
    modified = true;
  }

  // 2. Ajouter validateForm à l'import si absent
  if (!content.includes('validateForm') && !content.includes("from '../../utils/validation'")) {
    const lastImport = content.match(/^import .+ from .+;$/gm);
    if (lastImport) {
      const lastImportLine = lastImport[lastImport.length - 1];
      const insertPos = content.indexOf(lastImportLine) + lastImportLine.length;
      content = content.slice(0, insertPos) + 
        "\nimport { validateForm, commonRules } from '../../utils/validation';" + 
        content.slice(insertPos);
      modified = true;
    }
  }

  // 3. Ajouter useNotifications au composant principal
  if (content.includes('const ') && content.includes('React.FC') && !content.includes('const { success, error } = useNotifications();')) {
    const componentMatch = content.match(/(const \w+ERP: React\.FC = \(\) => \{)/);
    if (componentMatch) {
      const insertPos = componentMatch.index + componentMatch[0].length;
      content = content.slice(0, insertPos) + 
        "\n  const { success, error } = useNotifications();" + 
        content.slice(insertPos);
      modified = true;
    }
  }

  // 4. Remplacer alert() par error()
  if (content.includes('alert(')) {
    content = content.replace(
      /alert\(([^)]+)\)/g,
      (match, arg) => {
        if (arg.includes('error.response')) {
          return `error('Erreur', ${arg})`;
        } else {
          return `error('Erreur', ${arg})`;
        }
      }
    );
    modified = true;
  }

  // 5. Améliorer handleSave avec validation
  if (content.includes('handleSave = async') && !content.includes('validateForm')) {
    const handleSaveMatch = content.match(/(const handleSave = async \(formData: any\) => \{[\s\S]*?)(\n  \};)/);
    if (handleSaveMatch) {
      const beforeTry = handleSaveMatch[1];
      const afterTry = handleSaveMatch[2];
      
      const newHandleSave = beforeTry.replace(
        /(\s+)(try \{)/,
        `$1const validation = validateForm(formData, {\n$1  name: { ...commonRules.required }\n$1});\n$1\n$1if (!validation.isValid) {\n$1  setErrors(validation.errors);\n$1  error('Erreur de validation', 'Veuillez corriger les erreurs');\n$1  return;\n$1}\n$1\n$1setErrors({});\n$1$2`
      );
      
      content = content.replace(handleSaveMatch[0], newHandleSave + afterTry);
      modified = true;
    }
  }

  // 6. Améliorer handleDelete avec notifications
  if (content.includes('handleDelete = async') && !content.includes('success(')) {
    content = content.replace(
      /(await api\.delete\([^)]+\);)\s+(load\w+\(\);)/g,
      "$1\n        success('Suppression réussie');\n        $2"
    );
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Amélioré: ${path.basename(filePath)}`);
    return true;
  } else {
    console.log(`⏭️  Déjà à jour: ${path.basename(filePath)}`);
    return false;
  }
}

console.log('🚀 Amélioration des modules restants...\n');

let improved = 0;
for (const moduleFile of modulesToImprove) {
  const filePath = path.join(frontendPath, moduleFile);
  if (fs.existsSync(filePath)) {
    if (improveModule(filePath)) {
      improved++;
    }
  } else {
    console.log(`❌ Fichier non trouvé: ${moduleFile}`);
  }
}

console.log(`\n✨ ${improved} module(s) amélioré(s) sur ${modulesToImprove.length}`);
