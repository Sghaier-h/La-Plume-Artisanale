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
  },
  {
    email: 'chef.atelier@entreprise.local',
    password: DEV_PASSWORD,
    user: {
      id: '8',
      email: 'chef.atelier@entreprise.local',
      nom: 'Chef',
      prenom: 'Atelier',
      role: 'CHEF_ATELIER',
      dashboardsAttribues: ['chef-atelier']
    }
  },
  {
    email: 'ourdisseur@entreprise.local',
    password: DEV_PASSWORD,
    user: {
      id: '9',
      email: 'ourdisseur@entreprise.local',
      nom: 'Ourdisseur',
      prenom: 'Test',
      role: 'OURDISSEUR',
      dashboardsAttribues: ['ourdisseur']
    }
  },
  {
    email: 'mecanicien@entreprise.local',
    password: DEV_PASSWORD,
    user: {
      id: '10',
      email: 'mecanicien@entreprise.local',
      nom: 'Mécanicien',
      prenom: 'Test',
      role: 'MECANICIEN',
      dashboardsAttribues: ['mecanicien']
    }
  },
  {
    email: 'magasinier.stock@entreprise.local',
    password: DEV_PASSWORD,
    user: {
      id: '11',
      email: 'magasinier.stock@entreprise.local',
      nom: 'Magasinier',
      prenom: 'Stock',
      role: 'MAGASINIER_STOCK',
      dashboardsAttribues: ['magasin-pf']
    }
  },
  {
    email: 'magasinier.st@entreprise.local',
    password: DEV_PASSWORD,
    user: {
      id: '12',
      email: 'magasinier.st@entreprise.local',
      nom: 'Magasinier',
      prenom: 'Sous-Traitants',
      role: 'MAGASINIER_SOUSTRAITANTS',
      dashboardsAttribues: ['magasinier-soustraitants']
    }
  },
  {
    email: 'magasinier.preparation@entreprise.local',
    password: DEV_PASSWORD,
    user: {
      id: '13',
      email: 'magasinier.preparation@entreprise.local',
      nom: 'Magasinier',
      prenom: 'Préparation',
      role: 'MAGASINIER_PREPARATION',
      dashboardsAttribues: ['magasinier-preparation']
    }
  },
  {
    email: 'comptable@entreprise.local',
    password: DEV_PASSWORD,
    user: {
      id: '14',
      email: 'comptable@entreprise.local',
      nom: 'Comptable',
      prenom: 'Test',
      role: 'COMPTABLE',
      dashboardsAttribues: ['comptable']
    }
  },
  {
    email: 'rh.manager@entreprise.local',
    password: DEV_PASSWORD,
    user: {
      id: '15',
      email: 'rh.manager@entreprise.local',
      nom: 'RH',
      prenom: 'Manager',
      role: 'RH_MANAGER',
      dashboardsAttribues: ['rh-manager', 'primes-rendement']
    }
  },
  {
    email: 'rh.assistant@entreprise.local',
    password: DEV_PASSWORD,
    user: {
      id: '16',
      email: 'rh.assistant@entreprise.local',
      nom: 'RH',
      prenom: 'Assistant',
      role: 'RH_ASSISTANT'
    }
  },
  {
    email: 'marketing@entreprise.local',
    password: DEV_PASSWORD,
    user: {
      id: '17',
      email: 'marketing@entreprise.local',
      nom: 'Marketing',
      prenom: 'Test',
      role: 'MARKETING',
      dashboardsAttribues: ['ecommerce-b2b', 'publicite']
    }
  },
  {
    email: 'securite@entreprise.local',
    password: DEV_PASSWORD,
    user: {
      id: '18',
      email: 'securite@entreprise.local',
      nom: 'Responsable',
      prenom: 'Sécurité',
      role: 'RESPONSABLE_SECURITE',
      dashboardsAttribues: ['securite']
    }
  }
];

export default mockUsers;
