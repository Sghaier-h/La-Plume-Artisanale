import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

// Routes
import authRoutes from './routes/auth.routes.js';
import articlesRoutes from './routes/articles.routes.js';
import clientsRoutes from './routes/clients.routes.js';
import commandesRoutes from './routes/commandes.routes.js';
import devisRoutes from './routes/devis.routes.js';
import bonsLivraisonRoutes from './routes/bons-livraison.routes.js';
import facturesRoutes from './routes/factures.routes.js';
import avoirsRoutes from './routes/avoirs.routes.js';
import bonsRetourRoutes from './routes/bons-retour.routes.js';
import machinesRoutes from './routes/machines.routes.js';
import ofRoutes from './routes/of.routes.js';
import soustraitantsRoutes from './routes/soustraitants.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import productionRoutes from './routes/production.routes.js';
import stockRoutes from './routes/stock.routes.js';
import planningRoutes from './routes/planning.routes.js';
import qualityRoutes from './routes/quality.routes.js';
import mobileRoutes from './routes/mobile.routes.js';
import parametrageRoutes from './routes/parametrage.routes.js';
import matieresPremieresRoutes from './routes/matieres-premieres.routes.js';
import suiviFabricationRoutes from './routes/suivi-fabrication.routes.js';
import fournisseursRoutes from './routes/fournisseurs.routes.js';
import parametresCatalogueRoutes from './routes/parametres-catalogue.routes.js';
import articlesCatalogueRoutes from './routes/articles-catalogue.routes.js';
import selecteursMachinesRoutes from './routes/selecteurs-machines.routes.js';
import planningDragDropRoutes from './routes/planning-dragdrop.routes.js';
import stockMultiEntrepotsRoutes from './routes/stock-multi-entrepots.routes.js';
import tracabiliteLotsRoutes from './routes/tracabilite-lots.routes.js';
import qualiteAvanceeRoutes from './routes/qualite-avancee.routes.js';
import documentsRoutes from './routes/documents.routes.js';
import tachesRoutes from './routes/taches.routes.js';
import notificationsRoutes from './routes/notifications.routes.js';
import messagesRoutes from './routes/messages.routes.js';
import produitsRoutes from './routes/produits.routes.js';
import maintenanceRoutes from './routes/maintenance.routes.js';
import planificationGanttRoutes from './routes/planification-gantt.routes.js';
import qualiteAvanceRoutes from './routes/qualite-avance.routes.js';
import coutsRoutes from './routes/couts.routes.js';
import multisocieteRoutes from './routes/multisociete.routes.js';
import communicationRoutes from './routes/communication.routes.js';
import ecommerceRoutes from './routes/ecommerce.routes.js';
import webhooksRoutes from './routes/webhooks.routes.js';
import migrationRoutes from './routes/migration.routes.js';
import databaseRoutes from './routes/database.routes.js';
import pointageRoutes from './routes/pointage.routes.js';
import utilisateursRoutes from './routes/utilisateurs.routes.js';
import auditRoutes from './routes/audit.routes.js';
import excelImportRoutes from './routes/excel-import.routes.js';
import { auditMiddleware } from './middleware/audit.middleware.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: [
      process.env.FRONTEND_URL || "http://localhost:3000",
      "capacitor://localhost",
      "ionic://localhost",
      "https://app.fouta-erp.com"
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Trust proxy (nécessaire derrière Nginx)
// Utiliser 1 au lieu de true pour la sécurité avec express-rate-limit
app.set('trust proxy', 1);

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://fabrication.laplume-artisanale.tn',
    process.env.FRONTEND_URL || 'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers uploads
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limite chaque IP à 100 requêtes par windowMs
});
app.use('/api/', limiter);

// Middleware d'audit - doit être après l'authentification
// Il sera appliqué automatiquement aux routes qui modifient des données

// Configuration Swagger/OpenAPI - Documentation disponible sur /api-docs
// Installer : npm install swagger-ui-express yamljs
// Note : Swagger est optionnel, le serveur fonctionne même si non installé
(async function initSwagger() {
  try {
    const swaggerUiModule = await import('swagger-ui-express');
    const yamljsModule = await import('yamljs');
    const swaggerUi = swaggerUiModule.default;
    const YAML = yamljsModule.default;
    
    const swaggerDocument = YAML.load(path.join(__dirname, 'docs', 'swagger.yaml'));
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'API ERP La Plume Artisanale'
    }));
    console.log('✅ Documentation Swagger disponible sur /api-docs');
  } catch (error) {
    // Swagger optionnel - continue même si non installé
    if (error.code !== 'ERR_MODULE_NOT_FOUND') {
      console.warn('⚠️ Swagger non configuré :', error.message);
    }
  }
})();

// Charger les modules Odoo (optionnel - chargement asynchrone)
(async () => {
  try {
    const { default: moduleManager } = await import('./core/ModuleManager.js');
    const { securityManager } = await import('./core/SecurityManager.js');
    const { registerAllModels } = await import('./core/ModelRegistry.js');
    
    // Enregistrer tous les modèles
    registerAllModels();
    
    // Charger tous les modules
    await moduleManager.loadAllModules();
    
    // Charger la sécurité pour chaque module
    for (const module of moduleManager.listModules()) {
      await securityManager.loadModuleSecurity(module.name);
    }
    
    console.log('✅ Modules Odoo chargés');
  } catch (error) {
    console.warn('⚠️ Modules Odoo non disponibles:', error.message);
  }
})();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/articles', articlesRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/commandes', commandesRoutes);
app.use('/api/devis', devisRoutes);
app.use('/api/bons-livraison', bonsLivraisonRoutes);
app.use('/api/factures', facturesRoutes);
app.use('/api/avoirs', avoirsRoutes);
app.use('/api/bons-retour', bonsRetourRoutes);
app.use('/api/machines', machinesRoutes);

// Routes de gestion avancée - Intégration native
(async () => {
  try {
    // Module Ventes
    const saleOrderRoutes = await import('../modules/sale/routes/sale_order.routes.js');
    app.use('/api/sale/orders', saleOrderRoutes.default);
    console.log('✅ Route /api/sale/orders chargée');
    
    // Module Produits
    const productTemplateRoutes = await import('../modules/product/routes/product_template.routes.js');
    app.use('/api/products', productTemplateRoutes.default);
    console.log('✅ Route /api/products chargée');
    
    // Module Stock
    const stockPickingRoutes = await import('../modules/stock/routes/stock_picking.routes.js');
    app.use('/api/stock/pickings', stockPickingRoutes.default);
    console.log('✅ Route /api/stock/pickings chargée');
    
    // Module Production
    const mrpProductionRoutes = await import('../modules/mrp/routes/mrp_production.routes.js');
    app.use('/api/productions', mrpProductionRoutes.default);
    console.log('✅ Route /api/productions chargée');
    
    // Module BOM (Bill of Materials)
    const mrpBOMRoutes = await import('../modules/mrp/routes/mrp_bom.routes.js');
    app.use('/api/mrp/boms', mrpBOMRoutes.default);
    console.log('✅ Route /api/mrp/boms chargée');
    
    // Module Comptabilité
    const accountMoveRoutes = await import('../modules/account/routes/account_move.routes.js');
    app.use('/api/account/moves', accountMoveRoutes.default);
    console.log('✅ Route /api/account/moves chargée');
    
    // Module Achats
    const purchaseOrderRoutes = await import('../modules/purchase/routes/purchase_order.routes.js');
    app.use('/api/purchase/orders', purchaseOrderRoutes.default);
    console.log('✅ Route /api/purchase/orders chargée');

    // Module CRM
    const crmLeadRoutes = await import('../modules/crm/routes/crm_lead.routes.js');
    const crmOpportunityRoutes = await import('../modules/crm/routes/crm_opportunity.routes.js');
    const crmStageRoutes = await import('../modules/crm/routes/crm_stage.routes.js');
    const crmActivityRoutes = await import('../modules/crm/routes/crm_activity.routes.js');
    
    app.use('/api/crm/leads', crmLeadRoutes.default);
    app.use('/api', crmOpportunityRoutes.default);
    app.use('/api', crmStageRoutes.default);
    app.use('/api', crmActivityRoutes.default);
    console.log('✅ Routes CRM chargées');

    // Module HR
    const hrEmployeeController = await import('../modules/hr/controllers/hr_employee.controller.js');
    await hrEmployeeController.default(app);
    const hrRecruitmentRoutes = await import('../modules/hr/routes/hr_recruitment.routes.js');
    const hrPayslipRoutes = await import('../modules/hr/routes/hr_payslip.routes.js');
    app.use('/api', hrRecruitmentRoutes.default);
    app.use('/api', hrPayslipRoutes.default);
    console.log('✅ Routes HR chargées (Employés, Recrutement, Salaires)');

    // Module Project
    const projectController = await import('../modules/project/controllers/project_project.controller.js');
    await projectController.default(app);
    console.log('✅ Routes Project chargées');

    // Module Inventory
    const inventoryController = await import('../modules/inventory/controllers/inventory.controller.js');
    await inventoryController.default(app);
    console.log('✅ Routes Inventory chargées');

    // Module Quality
    const qualityCheckController = await import('../modules/quality/controllers/quality_check.controller.js');
    await qualityCheckController.default(app);
    console.log('✅ Routes Quality chargées');
  } catch (error) {
    console.warn('⚠️ Certaines routes avancées ne sont pas disponibles:', error.message);
  }
})();
app.use('/api/of', ofRoutes);
app.use('/api/soustraitants', soustraitantsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api', await import('./routes/search.routes.js').then(m => m.default));
app.use('/api', await import('./routes/email.routes.js').then(m => m.default));
app.use('/api', await import('./routes/whatsapp.routes.js').then(m => m.default));
app.use('/api', await import('./routes/settings.routes.js').then(m => m.default));
app.use('/api', await import('./routes/ai.routes.js').then(m => m.default));
app.use('/api', await import('./routes/social-auth.routes.js').then(m => m.default));
app.use('/api/production', productionRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/planning', planningRoutes);
app.use('/api/quality', qualityRoutes);
app.use('/api/parametrage', parametrageRoutes);
app.use('/api/matieres-premieres', matieresPremieresRoutes);
app.use('/api/suivi-fabrication', suiviFabricationRoutes);
app.use('/api/fournisseurs', fournisseursRoutes);
app.use('/api/parametres-catalogue', parametresCatalogueRoutes);
app.use('/api/articles-catalogue', articlesCatalogueRoutes);
app.use('/api/selecteurs', selecteursMachinesRoutes);
app.use('/api/planning-dragdrop', planningDragDropRoutes);
app.use('/api/stock-multi-entrepots', stockMultiEntrepotsRoutes);
app.use('/api/tracabilite-lots', tracabiliteLotsRoutes);
app.use('/api/qualite-avancee', qualiteAvanceeRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/taches', tachesRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/produits', produitsRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/planification-gantt', planificationGanttRoutes);
app.use('/api/qualite-avance', qualiteAvanceRoutes);
app.use('/api/couts', coutsRoutes);
app.use('/api/multisociete', multisocieteRoutes);
app.use('/api/communication', communicationRoutes);
app.use('/api/ecommerce', ecommerceRoutes);
app.use('/api/webhooks', webhooksRoutes);
app.use('/api/migration', migrationRoutes);
app.use('/api/database', databaseRoutes);
app.use('/api/pointage', pointageRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/excel-import', excelImportRoutes);

// Routes Mobile (SaaS)
app.use('/api/v1/mobile', mobileRoutes);

// Route racine - Ne jamais rediriger (Nginx sert le frontend en production)
// Cette route ne devrait jamais être appelée en production car Nginx intercepte /
app.get('/', (req, res) => {
  // Toujours retourner du JSON (pas de redirection pour éviter les boucles)
  res.json({
    message: 'API ERP La Plume Artisanale',
    version: '1.0.0',
    status: 'OK',
    info: '/api/info',
    note: 'Le frontend est servi par Nginx. Utilisez /api/info pour plus d\'informations.',
    timestamp: new Date().toISOString()
  });
});

// Route d'information API (accessible depuis les paramètres)
app.get('/api/info', (req, res) => {
  res.json({
    message: 'API ERP La Plume Artisanale',
    version: '1.0.0',
    status: 'OK',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      articles: '/api/articles',
      articlesCatalogue: '/api/articles-catalogue',
      clients: '/api/clients',
      fournisseurs: '/api/fournisseurs',
      commandes: '/api/commandes',
      machines: '/api/machines',
      of: '/api/of',
      planning: '/api/planning-dragdrop',
      suiviFabrication: '/api/suivi-fabrication',
      soustraitants: '/api/soustraitants',
      dashboard: '/api/dashboard',
      production: '/api/production',
      stock: '/api/stock',
      stockMultiEntrepots: '/api/stock-multi-entrepots',
      matieresPremieres: '/api/matieres-premieres',
      parametrage: '/api/parametrage',
      parametresCatalogue: '/api/parametres-catalogue',
      selecteurs: '/api/selecteurs',
      tracabiliteLots: '/api/tracabilite-lots',
      qualiteAvancee: '/api/qualite-avancee',
      documents: '/api/documents',
      planningOld: '/api/planning',
      quality: '/api/quality',
      mobile: '/api/v1/mobile',
      webhooks: '/api/webhooks/timemoto',
      info: '/api/info'
    },
    baseUrl: process.env.API_URL || 'https://fabrication.laplume-artisanale.tn',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Health check API (accessible via /api/health)
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Socket.IO pour temps réel avec authentification
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Token manquant'));
  }
  // TODO: Vérifier JWT token
  // Pour l'instant, on accepte tous les tokens en mode dev
  socket.user = { id: '1', poste_travail: 'RESPONSABLE_FABRICATION' };
  next();
});

io.on('connection', (socket) => {
  const userId = socket.user?.id;
  const poste = socket.user?.poste_travail;
  
  console.log('Client connecté:', socket.id, 'User:', userId, 'Poste:', poste);

  // Rejoindre les canaux
  if (userId) {
    socket.join(`user-${userId}`);
  }
  if (poste) {
    socket.join(`poste-${poste}`);
  }
  if (socket.user?.machine_assignee) {
    socket.join(`machine-${socket.user.machine_assignee}`);
  }

  socket.on('disconnect', () => {
    console.log('Client déconnecté:', socket.id);
  });

  // Écouter les événements de production
  socket.on('production:update', (data) => {
    io.emit('production:updated', data);
  });

  // Écouter les changements de statut de tâche
  socket.on('tache-statut-change', (data) => {
    io.emit('tache-mise-a-jour', data);
  });

  // Accusé de réception notification
  socket.on('accuse-reception', (notificationId) => {
    // Marquer notification comme lue
    console.log('Notification lue:', notificationId);
  });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📡 Socket.IO actif`);
});

export { io };

