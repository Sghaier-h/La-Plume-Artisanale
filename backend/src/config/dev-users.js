/**
 * Utilisateurs de développement pour le mode mock
 *
 * ⚠️  Ce fichier ne doit JAMAIS être utilisé en production.
 *     Le mode mock est strictement limité à NODE_ENV=development + USE_MOCK_AUTH=true
 *
 * Les mots de passe sont lus depuis les variables d'environnement.
 * Fallback sur des valeurs par défaut uniquement en développement.
 */

const DEV_PASSWORD = process.env.DEV_MOCK_PASSWORD || 'DevLocal2024!';

export const mockUsers = [
  {
    email: 'admin@system.local',
    password: DEV_PASSWORD,
    user: {
      id: '1',
      email: 'admin@system.local',
      nom: 'Admin',
      prenom: 'Système',
      role: 'ADMIN',
      dashboardsAttribues: ['dashboard']
    }
  },
  {
    email: 'chef.production@entreprise.local',
    password: DEV_PASSWORD,
    user: {
      id: '2',
      email: 'chef.production@entreprise.local',
      nom: 'Chef',
      prenom: 'Production',
      role: 'CHEF_PRODUCTION',
      dashboardsAttribues: ['chef-production']
    }
  },
  {
    email: 'tisseur@entreprise.local',
    password: DEV_PASSWORD,
    user: {
      id: '3',
      email: 'tisseur@entreprise.local',
      nom: 'Tisseur',
      prenom: 'Test',
      role: 'TISSEUR',
      dashboardsAttribues: ['tisseur']
    }
  },
  {
    email: 'magasinier.mp@entreprise.local',
    password: DEV_PASSWORD,
    user: {
      id: '4',
      email: 'magasinier.mp@entreprise.local',
      nom: 'Magasinier',
      prenom: 'MP',
      role: 'MAGASINIER',
      dashboardsAttribues: ['magasinier-mp']
    }
  },
  {
    email: 'coupeur@entreprise.local',
    password: DEV_PASSWORD,
    user: {
      id: '5',
      email: 'coupeur@entreprise.local',
      nom: 'Coupeur',
      prenom: 'Test',
      role: 'COUPEUR',
      dashboardsAttribues: ['post-coupe']
    }
  },
  {
    email: 'controleur.qualite@entreprise.local',
    password: DEV_PASSWORD,
    user: {
      id: '6',
      email: 'controleur.qualite@entreprise.local',
      nom: 'Contrôleur',
      prenom: 'Qualité',
      role: 'CONTROLEUR_QUALITE',
      dashboardsAttribues: ['controle-central']
    }
  },
  {
    email: 'commercial@entreprise.local',
    password: DEV_PASSWORD,
    user: {
      id: '7',
      email: 'commercial@entreprise.local',
      nom: 'Commercial',
      prenom: 'Test',
      role: 'COMMERCIAL'
    }
  }
];

export default mockUsers;
