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
app.use('/api/of', ofRoutes);
app.use('/api/soustraitants', soustraitantsRoutes);
app.use('/api/dashboard', dashboardRoutes);
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

