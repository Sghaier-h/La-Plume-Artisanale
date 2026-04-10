/**
 * Script de vérification des endpoints API
 * Usage: node scripts/verifier_endpoints.js
 */

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_URL = process.env.API_URL || 'http://localhost:5000/api';
let authToken = '';

// Couleurs pour la console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
};

// Fonction pour tester un endpoint
async function testEndpoint(method, url, data = null, requiresAuth = true) {
  try {
    const config = {
      method,
      url: `${API_URL}${url}`,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (requiresAuth && authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return { success: true, status: response.status, data: response.data };
  } catch (error) {
    return {
      success: false,
      status: error.response?.status,
      message: error.response?.data?.error?.message || error.message,
    };
  }
}

// Fonction principale
async function main() {
  console.log('\n🔍 Vérification des endpoints API\n');
  console.log(`URL de base: ${API_URL}\n`);

  // 1. Test de connexion
  log.info('Test de connexion au serveur...');
  const connectionTest = await testEndpoint('GET', '/health', null, false);
  if (!connectionTest.success) {
    log.warning('Endpoint /health non disponible, test avec /articles...');
  }

  // 2. Authentification
  log.info('Test d\'authentification...');
  const loginResult = await testEndpoint(
    'POST',
    '/auth/login',
    {
      email: 'admin@laplume.tn',
      mot_de_passe: 'admin123', // À adapter selon vos données
    },
    false
  );

  if (loginResult.success && loginResult.data?.token) {
    authToken = loginResult.data.token;
    log.success('Authentification réussie');
  } else {
    log.warning('Authentification échouée - certains tests nécessitent une authentification');
    log.warning('Veuillez créer un utilisateur de test ou modifier les credentials');
  }

  // Liste des endpoints à tester
  const endpoints = [
    // Articles
    { method: 'GET', url: '/articles', name: 'Liste des articles' },
    { method: 'GET', url: '/articles/types', name: 'Types d\'articles' },
    { method: 'GET', url: '/articles/1', name: 'Détails article (ID: 1)' },
    
    // Clients
    { method: 'GET', url: '/clients', name: 'Liste des clients' },
    { method: 'GET', url: '/clients/1', name: 'Détails client (ID: 1)' },
    
    // Commandes
    { method: 'GET', url: '/commandes', name: 'Liste des commandes' },
    
    // OF
    { method: 'GET', url: '/of', name: 'Liste des OF' },
    
    // Stock
    { method: 'GET', url: '/stock/mouvements', name: 'Mouvements de stock' },
    { method: 'GET', url: '/stock/inventaires', name: 'Inventaires' },
    
    // Machines
    { method: 'GET', url: '/machines', name: 'Liste des machines' },
    
    // Matières premières
    { method: 'GET', url: '/matieres-premieres', name: 'Liste des matières premières' },
    
    // Suivi fabrication
    { method: 'GET', url: '/suivi-fabrication', name: 'Suivis de fabrication' },
    
    // Qualité
    { method: 'GET', url: '/qualite-avancee/controles', name: 'Contrôles qualité' },
  ];

  // Tester chaque endpoint
  const results = {
    success: 0,
    failed: 0,
    warnings: 0,
  };

  console.log('\n📋 Test des endpoints:\n');

  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint.method, endpoint.url, null, true);
    
    if (result.success) {
      log.success(`${endpoint.name}: ${result.status}`);
      results.success++;
    } else if (result.status === 401) {
      log.warning(`${endpoint.name}: Non authentifié (401)`);
      results.warnings++;
    } else if (result.status === 404) {
      log.warning(`${endpoint.name}: Non trouvé (404) - peut être normal si aucune donnée`);
      results.warnings++;
    } else {
      log.error(`${endpoint.name}: ${result.status} - ${result.message}`);
      results.failed++;
    }
    
    // Petite pause pour ne pas surcharger le serveur
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Résumé
  console.log('\n📊 Résumé des tests:\n');
  log.success(`Succès: ${results.success}`);
  log.warning(`Avertissements: ${results.warnings}`);
  if (results.failed > 0) {
    log.error(`Échecs: ${results.failed}`);
  }

  console.log('\n✅ Vérification terminée\n');
}

// Exécuter
main().catch(error => {
  console.error('Erreur lors de la vérification:', error);
  process.exit(1);
});
