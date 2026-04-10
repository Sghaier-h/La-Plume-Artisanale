/**
 * Module Clients - Gestion complète des clients
 * Architecture modulaire inspirée des meilleures pratiques
 */

export default {
  name: 'clients',
  version: '1.0.0',
  category: 'sales',
  summary: 'Gestion complète des clients',
  description: 'Module de gestion des clients avec adresses multiples, contacts multiples, catégories et attribution commerciale',
  depends: ['base'], // Dépend du module base (utilisateurs, partenaires)
  installable: true,
  auto_install: false,
  application: true,
  
  // Modèles de données
  models: [
    'models/Client.js',
    'models/AdresseClient.js',
    'models/ContactClient.js',
    'models/CategorieClient.js',
    'models/TypeCommercial.js'
  ],
  
  // Contrôleurs
  controllers: [
    'controllers/clients.controller.js',
    'controllers/adresses.controller.js',
    'controllers/contacts.controller.js'
  ],
  
  // Routes
  routes: [
    'routes/clients.routes.js'
  ],
  
  // Vues JSON pour le frontend
  views: [
    'views/clients_views.json'
  ],
  
  // Sécurité
  security: [
    'security/ir.model.access.json',
    'security/ir_rules.json'
  ],
  
  // Données initiales
  data: [
    'data/categories_clients.json',
    'data/types_commerciaux.json'
  ]
};
