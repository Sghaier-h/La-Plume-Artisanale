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

// Routes Mobile (SaaS)
app.use('/api/v1/mobile', mobileRoutes);

// Route racine
app.get('/', (req, res) => {
  // Si le client demande du JSON explicitement
  if (req.headers.accept && req.headers.accept.includes('application/json')) {
    return res.json({
      message: 'API ERP La Plume Artisanale',
      version: '1.0.0',
      status: 'OK',
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
        mobile: '/api/v1/mobile'
      },
      timestamp: new Date().toISOString()
    });
  }

  // Sinon, retourner une page HTML pour les navigateurs
  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>API ERP - La Plume Artisanale</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      color: #333;
    }
    .container {
      background: white;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      padding: 40px;
      max-width: 600px;
      width: 100%;
    }
    h1 {
      color: #667eea;
      margin-bottom: 10px;
      font-size: 2em;
    }
    .subtitle {
      color: #666;
      margin-bottom: 30px;
      font-size: 1.1em;
    }
    .status {
      display: inline-block;
      background: #10b981;
      color: white;
      padding: 5px 15px;
      border-radius: 20px;
      font-size: 0.9em;
      margin-bottom: 30px;
    }
    .endpoints {
      background: #f7fafc;
      border-radius: 10px;
      padding: 20px;
      margin-top: 20px;
    }
    .endpoints h2 {
      color: #667eea;
      margin-bottom: 15px;
      font-size: 1.3em;
    }
    .endpoint-list {
      list-style: none;
    }
    .endpoint-list li {
      padding: 10px;
      margin: 5px 0;
      background: white;
      border-radius: 5px;
      border-left: 3px solid #667eea;
      font-family: 'Courier New', monospace;
      font-size: 0.9em;
    }
    .footer {
      margin-top: 30px;
      text-align: center;
      color: #999;
      font-size: 0.9em;
    }
    .version {
      color: #999;
      font-size: 0.9em;
      margin-top: 10px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🚀 API ERP</h1>
    <p class="subtitle">La Plume Artisanale</p>
    <span class="status">✓ En ligne</span>
    <p class="version">Version 1.0.0</p>
    
    <div class="endpoints">
      <h2>📡 Endpoints disponibles</h2>
      <ul class="endpoint-list">
        <li><strong>GET</strong> /health - Health check</li>
        <li><strong>POST</strong> /api/auth - Authentification</li>
        <li><strong>GET/POST</strong> /api/articles - Articles</li>
        <li><strong>GET/POST</strong> /api/clients - Clients</li>
        <li><strong>GET/POST</strong> /api/commandes - Commandes</li>
        <li><strong>GET/POST</strong> /api/machines - Machines</li>
        <li><strong>GET/POST</strong> /api/of - Ordres de Fabrication</li>
        <li><strong>GET/POST</strong> /api/soustraitants - Sous-traitants</li>
        <li><strong>GET</strong> /api/dashboard - Dashboard</li>
        <li><strong>GET/POST</strong> /api/production - Production</li>
        <li><strong>GET/POST</strong> /api/stock - Stock</li>
        <li><strong>GET/POST</strong> /api/planning - Planning</li>
        <li><strong>GET/POST</strong> /api/quality - Qualité</li>
        <li><strong>GET/POST</strong> /api/v1/mobile - Mobile (SaaS)</li>
      </ul>
    </div>
    
    <div class="footer">
      <p>API REST - Système de gestion ERP</p>
      <p style="margin-top: 5px;">${new Date().toLocaleString('fr-FR')}</p>
    </div>
  </div>
</body>
</html>
  `;
  
  res.send(html);
});

// Health check
app.get('/health', (req, res) => {
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

