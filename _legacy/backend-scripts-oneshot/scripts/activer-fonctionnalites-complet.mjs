/**
 * Script pour activer toutes les fonctionnalités de tous les modules
 * Version ES Module
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const frontendPagesPath = path.join(__dirname, '../../frontend/src/pages/erp');
const modules = fs.readdirSync(frontendPagesPath)
  .filter(f => f.endsWith('.tsx') && 
    !['Home.tsx', 'Dashboards.tsx', 'AI.tsx', 'AISettings.tsx', 'Settings.tsx', 
      'SocialAuth.tsx', 'ParametrageComplet.tsx', 'Reports.tsx', 'CommercialDashboard.tsx'].includes(f));

console.log(`🚀 Analyse de ${modules.length} modules...\n`);

const checks = {
  loadRelations: { found: 0, missing: [] },
  handleDelete: { found: 0, missing: [] },
  displayMany2One: { found: 0, missing: [] },
  formatDate: { found: 0, missing: [] },
  formatCurrency: { found: 0, missing: [] },
  ERPStatusbar: { found: 0, missing: [] },
  ERPNotebook: { found: 0, missing: [] },
  ERPChatter: { found: 0, missing: [] },
  useNotifications: { found: 0, missing: [] },
  validateForm: { found: 0, missing: [] }
};

modules.forEach(moduleFile => {
  const filePath = path.join(frontendPagesPath, moduleFile);
  const content = fs.readFileSync(filePath, 'utf8');
  const moduleName = moduleFile.replace('.tsx', '');

  // Vérifier loadRelations
  if (content.includes('loadRelations: true') || content.includes('loadRelations')) {
    checks.loadRelations.found++;
  } else {
    checks.loadRelations.missing.push(moduleName);
  }

  // Vérifier handleDelete
  if (content.includes('handleDelete')) {
    checks.handleDelete.found++;
  } else {
    checks.handleDelete.missing.push(moduleName);
  }

  // Vérifier formatage
  if (content.includes('displayMany2One')) checks.displayMany2One.found++;
  else checks.displayMany2One.missing.push(moduleName);

  if (content.includes('formatDate')) checks.formatDate.found++;
  else checks.formatDate.missing.push(moduleName);

  if (content.includes('formatCurrency')) checks.formatCurrency.found++;
  else checks.formatCurrency.missing.push(moduleName);

  // Vérifier composants ERP
  if (content.includes('ERPStatusbar')) checks.ERPStatusbar.found++;
  else checks.ERPStatusbar.missing.push(moduleName);

  if (content.includes('ERPNotebook')) checks.ERPNotebook.found++;
  else checks.ERPNotebook.missing.push(moduleName);

  if (content.includes('ERPChatter')) checks.ERPChatter.found++;
  else checks.ERPChatter.missing.push(moduleName);

  // Vérifier notifications
  if (content.includes('useNotifications')) checks.useNotifications.found++;
  else checks.useNotifications.missing.push(moduleName);

  // Vérifier validation
  if (content.includes('validateForm')) checks.validateForm.found++;
  else checks.validateForm.missing.push(moduleName);
});

console.log('📊 RÉSULTATS DE L\'ANALYSE\n');
console.log('═'.repeat(60));

Object.entries(checks).forEach(([feature, data]) => {
  const percentage = ((data.found / modules.length) * 100).toFixed(1);
  const status = data.found === modules.length ? '✅' : '⚠️';
  console.log(`${status} ${feature.padEnd(20)} : ${data.found}/${modules.length} (${percentage}%)`);
  if (data.missing.length > 0 && data.missing.length <= 10) {
    console.log(`   Manquants: ${data.missing.join(', ')}`);
  } else if (data.missing.length > 10) {
    console.log(`   Manquants: ${data.missing.length} modules`);
  }
});

console.log('\n' + '═'.repeat(60));
const uniqueMissing = new Set(Object.values(checks).flatMap(c => c.missing));
console.log(`\n📝 Modules à améliorer: ${uniqueMissing.size} modules uniques\n`);

// Générer un rapport
const reportPath = path.join(__dirname, '../../RAPPORT_FONCTIONNALITES.md');
const report = `# Rapport d'Activation des Fonctionnalités

Généré le: ${new Date().toLocaleString('fr-FR')}

## 📊 Statistiques Globales

- **Total modules analysés**: ${modules.length}
- **Modules avec toutes les fonctionnalités**: ${modules.length - uniqueMissing.size}
- **Modules à améliorer**: ${uniqueMissing.size}

## 🔍 Détail par Fonctionnalité

${Object.entries(checks).map(([feature, data]) => {
  const percentage = ((data.found / modules.length) * 100).toFixed(1);
  return `### ${feature}
- **Couverture**: ${data.found}/${modules.length} (${percentage}%)
- **Manquants**: ${data.missing.length > 0 ? data.missing.join(', ') : 'Aucun'}
`;
}).join('\n')}

## 📋 Modules Nécessitant des Améliorations

${Array.from(uniqueMissing).map(m => `- ${m}`).join('\n')}

## ✅ Prochaines Étapes

1. Ajouter \`loadRelations: true\` dans toutes les requêtes API
2. Implémenter \`handleDelete\` pour tous les modules
3. Utiliser les fonctions de formatage (\`displayMany2One\`, \`formatDate\`, \`formatCurrency\`)
4. Ajouter \`ERPStatusbar\`, \`ERPNotebook\`, \`ERPChatter\` dans les formulaires
5. Intégrer \`useNotifications\` pour remplacer les \`alert()\`
6. Ajouter la validation avec \`validateForm\`
`;

fs.writeFileSync(reportPath, report);
console.log(`✅ Rapport généré: ${reportPath}\n`);
