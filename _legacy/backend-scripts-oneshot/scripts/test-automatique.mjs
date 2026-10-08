/**
 * Script de test automatique
 * Démarre le serveur si nécessaire et exécute tous les tests
 */

import { spawn } from 'child_process';
import axios from 'axios';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const backendDir = join(__dirname, '..');

const API_URL = 'http://localhost:5000';
const API_URL_FULL = `${API_URL}/api`;

// Couleurs pour la console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Vérifier si le serveur est accessible
async function checkServer() {
  try {
    const response = await axios.get(`${API_URL}/api-docs`, { timeout: 2000 });
    return response.status === 200;
  } catch (error) {
    return false;
  }
}

// Attendre que le serveur soit prêt
async function waitForServer(maxAttempts = 30, delay = 1000) {
  log('\n⏳ Vérification du serveur...', 'blue');
  
  for (let i = 0; i < maxAttempts; i++) {
    if (await checkServer()) {
      log('✅ Serveur accessible', 'green');
      return true;
    }
    
    if (i < maxAttempts - 1) {
      process.stdout.write(`\r   Tentative ${i + 1}/${maxAttempts}...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  return false;
}

// Démarrer le serveur
function startServer() {
  log('\n🚀 Démarrage du serveur backend...', 'cyan');
  
  const serverProcess = spawn('npm', ['start'], {
    cwd: backendDir,
    shell: true,
    stdio: ['ignore', 'pipe', 'pipe']
  });
  
  let serverReady = false;
  
  serverProcess.stdout.on('data', (data) => {
    const output = data.toString();
    // Vérifier si le serveur est prêt
    if (output.includes('Serveur démarré sur le port') || 
        output.includes('🚀 Serveur démarré')) {
      serverReady = true;
    }
  });
  
  serverProcess.stderr.on('data', (data) => {
    const error = data.toString();
    // Ignorer les warnings normaux
    if (!error.includes('⚠️') && !error.includes('deprecated')) {
      process.stderr.write(data);
    }
  });
  
  serverProcess.on('error', (error) => {
    log(`\n❌ Erreur lors du démarrage du serveur: ${error.message}`, 'red');
    process.exit(1);
  });
  
  return { process: serverProcess, ready: () => serverReady };
}

// Exécuter un script de test
async function runTestScript(scriptName) {
  return new Promise((resolve, reject) => {
    log(`\n📋 Exécution de ${scriptName}...`, 'magenta');
    log('-'.repeat(80), 'magenta');
    
    const testProcess = spawn('node', [scriptName], {
      cwd: join(backendDir, 'scripts'),
      shell: true,
      stdio: 'inherit'
    });
    
    testProcess.on('close', (code) => {
      if (code === 0) {
        log(`\n✅ ${scriptName} terminé avec succès`, 'green');
        resolve(true);
      } else {
        log(`\n⚠️  ${scriptName} terminé avec le code ${code}`, 'yellow');
        resolve(false);
      }
    });
    
    testProcess.on('error', (error) => {
      log(`\n❌ Erreur lors de l'exécution de ${scriptName}: ${error.message}`, 'red');
      reject(error);
    });
  });
}

// Fonction principale
async function main() {
  log('\n' + '='.repeat(80), 'cyan');
  log('🧪 TEST AUTOMATIQUE COMPLET', 'cyan');
  log('='.repeat(80), 'cyan');
  
  // Vérifier si le serveur est déjà démarré
  const serverRunning = await checkServer();
  let serverProcess = null;
  let serverStarted = false;
  
  if (!serverRunning) {
    log('\n⚠️  Le serveur n\'est pas accessible', 'yellow');
    log('   Démarrage du serveur...', 'yellow');
    
    const server = startServer();
    serverProcess = server.process;
    serverStarted = true;
    
    // Attendre que le serveur soit prêt
    const ready = await waitForServer(60, 2000); // 2 minutes max
    
    if (!ready) {
      log('\n❌ Le serveur n\'a pas démarré dans les temps', 'red');
      if (serverProcess) {
        serverProcess.kill();
      }
      process.exit(1);
    }
    
    // Attendre un peu plus pour que tout soit initialisé
    log('\n⏳ Attente de l\'initialisation complète...', 'blue');
    await new Promise(resolve => setTimeout(resolve, 5000));
  } else {
    log('\n✅ Le serveur est déjà démarré', 'green');
  }
  
  // Exécuter les tests
  const results = {
    total: 0,
    success: 0,
    failed: 0
  };
  
  const tests = [
    {
      name: 'test-complet-frontend-backend.mjs',
      description: 'Test complet frontend-backend (toutes les routes API)'
    },
    {
      name: 'test-tous-modules.mjs',
      description: 'Test tous les modules (CRUD complet)'
    }
  ];
  
  for (const test of tests) {
    results.total++;
    try {
      const success = await runTestScript(test.name);
      if (success) {
        results.success++;
      } else {
        results.failed++;
      }
    } catch (error) {
      log(`\n❌ Erreur lors du test ${test.name}: ${error.message}`, 'red');
      results.failed++;
    }
    
    // Pause entre les tests
    if (test !== tests[tests.length - 1]) {
      log('\n⏸️  Pause de 3 secondes avant le prochain test...', 'blue');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  
  // Résumé final
  log('\n' + '='.repeat(80), 'cyan');
  log('📊 RÉSUMÉ FINAL', 'cyan');
  log('='.repeat(80), 'cyan');
  log(`\nTotal de tests: ${results.total}`, 'blue');
  log(`✅ Réussis: ${results.success}`, 'green');
  log(`❌ Échoués: ${results.failed}`, results.failed > 0 ? 'red' : 'green');
  
  if (results.success === results.total) {
    log('\n🎉 Tous les tests sont réussis !', 'green');
  } else if (results.success / results.total >= 0.7) {
    log('\n⚠️  La plupart des tests sont réussis. Vérifiez les erreurs ci-dessus.', 'yellow');
  } else {
    log('\n❌ Nombreux échecs. Vérifiez la configuration du serveur.', 'red');
  }
  
  // Arrêter le serveur si on l'a démarré
  if (serverStarted && serverProcess) {
    log('\n🛑 Arrêt du serveur...', 'yellow');
    serverProcess.kill();
    await new Promise(resolve => setTimeout(resolve, 2000));
    log('✅ Serveur arrêté', 'green');
  }
  
  log('\n');
  
  // Code de sortie
  process.exit(results.failed === 0 ? 0 : 1);
}

// Gérer l'interruption
process.on('SIGINT', () => {
  log('\n\n⚠️  Interruption détectée. Arrêt...', 'yellow');
  process.exit(1);
});

process.on('SIGTERM', () => {
  log('\n\n⚠️  Arrêt demandé. Nettoyage...', 'yellow');
  process.exit(1);
});

// Exécuter
main().catch(error => {
  log(`\n❌ Erreur fatale: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
