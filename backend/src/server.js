import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from './utils/logger.js';
import { errorHandler } from './utils/error.helper.js';
import { pool } from './utils/db.js';
import { loginRateLimit, apiRateLimit } from './middleware/rate-limit.middleware.js';
import { autoAuditAll } from './middleware/audit.middleware.js';

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
app.set('trust proxy', 1);

// ── Middleware de sécurité ──────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
// ── CORS : whitelist depuis CORS_ORIGIN (séparé par virgules), '*' en dev ──
const corsWhitelist = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const defaultOrigins = [
  'http://localhost:3000',
  'https://fabrication.laplume-artisanale.tn',
  process.env.FRONTEND_URL || 'http://localhost:3000'
];
const allowedOrigins = corsWhitelist.length ? corsWhitelist : defaultOrigins;
const isDev = process.env.NODE_ENV !== 'production';

app.use(cors({
  origin: (origin, cb) => {
    // Requêtes non-CORS (Postman, curl) : pas d'origin → autorisé
    if (!origin) return cb(null, true);
    if (isDev && (allowedOrigins.includes('*') || corsWhitelist.length === 0)) return cb(null, true);
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error(`CORS refusé pour l'origine ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Active-Company-Id']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers uploads
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ── Rate limiting (in-memory MVP) ──────────────────────────────────────
const isDevelopment = process.env.NODE_ENV !== 'production';

// Limite spécifique au login (5 / IP / 15 min)
app.use('/api/auth/login', loginRateLimit);
// Limite globale API (300 / IP / min)
app.use('/api/', apiRateLimit);

// ── Audit automatique (attache res.on('finish') AVANT les routes) ──────
// N'écrit dans `audit` que pour 2xx + POST/PUT/PATCH/DELETE et n'échoue
// jamais silencieusement la requête utilisateur.
app.use(autoAuditAll);

// ── Swagger (optionnel) ────────────────────────────────────────────────
(async function initSwagger() {
  try {
    const swaggerUi = (await import('swagger-ui-express')).default;
    const YAML = (await import('yamljs')).default;
    const fs = await import('fs');
    const swaggerPath = path.join(__dirname, 'docs', 'swagger.yaml');

    if (!fs.existsSync(swaggerPath)) {
      logger.warn('Fichier swagger.yaml non trouvé — documentation Swagger désactivée');
      return;
    }

    const swaggerDocument = YAML.load(swaggerPath);
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'API ERP La Plume Artisanale'
    }));
    logger.info('Documentation Swagger disponible sur /api-docs');
  } catch (error) {
    if (error.code !== 'ERR_MODULE_NOT_FOUND' && error.code !== 'ENOENT') {
      logger.warn('Swagger non configuré', { message: error.message });
    }
  }
})();

// ── Chargement des modules (seule source de routes API) ────────────────
import moduleManager from './core/ModuleManager.js';
import { securityManager } from './core/SecurityManager.js';

(async function loadModules() {
  try {
    logger.info('Chargement des modules...');

    const loadedModules = await moduleManager.loadAllModules();
    logger.info(`${loadedModules.length} modules chargés`, { modules: loadedModules });

    // Sécurité
    try {
      await securityManager.loadSecurity(moduleManager);
      logger.info('Sécurité des modules chargée');
    } catch (error) {
      logger.warn('Erreur chargement sécurité', { message: error.message });
    }

    // Collecter et trier les routes
    const routesToRegister = [];

    for (const moduleName of loadedModules) {
      const module = moduleManager.getModule(moduleName);
      if (!module?.manifest?.routes) continue;

      for (const routePath of module.manifest.routes) {
        try {
          const routeModule = await import(`../modules/${moduleName}/${routePath}`);
          if (!routeModule.default) continue;

          // Déterminer le chemin API
          const routeFileName = routePath.split('/').pop()?.replace('.routes.js', '').replace('.js', '') || '';
          let apiPath;

          // Priorité : manifest.apiPaths > convention de nommage
          if (module.manifest.apiPaths && module.manifest.apiPaths[routePath]) {
            apiPath = module.manifest.apiPaths[routePath];
          } else {
            if (routeFileName.includes('_')) {
              const parts = routeFileName.split('_');
              const modulePart = parts[0];
              const resourcePart = parts.slice(1).join('_');
              const plural = resourcePart.endsWith('e') ? resourcePart + 's' :
                            resourcePart.endsWith('y') ? resourcePart.slice(0, -1) + 'ies' :
                            resourcePart + 's';
              apiPath = `/api/${modulePart}/${plural}`;
            } else if (routeFileName === moduleName) {
              apiPath = `/api/${moduleName}`;
            } else if (moduleName === 'base' && routeFileName) {
              apiPath = `/api/${routeFileName}`;
            } else if (routeFileName) {
              apiPath = `/api/${moduleName}/${routeFileName}`;
            } else {
              apiPath = `/api/${moduleName}`;
            }
          }

          routesToRegister.push({
            path: apiPath,
            router: routeModule.default,
            hasParams: routeFileName === moduleName,
            pathDepth: apiPath.split('/').filter(s => s && s !== 'api').length,
          });
        } catch (error) {
          logger.warn(`Erreur chargement route ${moduleName}/${routePath}`, { message: error.message });
        }
      }
    }

    // Trier : routes spécifiques (longues, sans params) avant routes génériques
    routesToRegister.sort((a, b) => {
      if (a.hasParams !== b.hasParams) return a.hasParams ? 1 : -1;
      return b.pathDepth - a.pathDepth;
    });

    for (const route of routesToRegister) {
      app.use(route.path, route.router);
      logger.info(`Route: ${route.path}`);
    }

  } catch (error) {
    logger.error('Erreur chargement des modules', { error: error.message, stack: error.stack });
  }
})();

// ── Routes utilitaires ─────────────────────────────────────────────────

app.get('/', (req, res) => {
  res.json({
    message: 'API ERP La Plume Artisanale',
    version: '1.0.0',
    status: 'OK',
    info: '/api/info',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/info', (req, res) => {
  res.json({
    message: 'API ERP La Plume Artisanale',
    version: '1.0.0',
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    baseUrl: process.env.API_URL || 'https://fabrication.laplume-artisanale.tn',
    modules: Array.from(moduleManager.loadedModules || [])
  });
});

app.get('/health', async (req, res) => {
  let dbStatus = 'unknown';
  try {
    const result = await pool.query('SELECT 1');
    dbStatus = result ? 'connected' : 'error';
  } catch {
    dbStatus = 'disconnected';
  }
  res.json({
    status: 'OK',
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ── Socket.IO avec vérification JWT ────────────────────────────────────
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Token manquant'));
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      logger.error('JWT_SECRET non défini dans .env — Socket.IO non sécurisé');
      return next(new Error('Configuration serveur invalide'));
    }

    const decoded = jwt.verify(token, secret);
    socket.user = {
      id: decoded.userId || decoded.id,
      role: decoded.role,
      poste_travail: decoded.poste_travail
    };
    next();
  } catch (err) {
    logger.warn('Token Socket.IO invalide', { error: err.message });
    return next(new Error('Token invalide'));
  }
});

io.on('connection', (socket) => {
  const userId = socket.user?.id;
  const poste = socket.user?.poste_travail;

  logger.info('Client WebSocket connecté', { socketId: socket.id, userId, poste });

  // Rejoindre les canaux
  if (userId) socket.join(`user-${userId}`);
  if (poste) socket.join(`poste-${poste}`);

  socket.on('disconnect', () => {
    logger.info('Client WebSocket déconnecté', { socketId: socket.id });
  });

  // Événements production
  socket.on('production:update', (data) => {
    io.emit('production:updated', data);
  });

  socket.on('tache-statut-change', (data) => {
    io.emit('tache-mise-a-jour', data);
  });

  socket.on('accuse-reception', (notificationId) => {
    logger.info('Notification lue', { notificationId, userId });
  });
});

// ── Middleware d'erreur global (doit être le dernier) ──────────────────
app.use(errorHandler);

// ── Démarrage du serveur ───────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

httpServer.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    logger.error(`Le port ${PORT} est déjà utilisé`, {
      solutions: [
        'Exécutez: .\\LIBERER_PORT_5000.ps1',
        `Ou changez le port: PORT=5001 npm start`
      ]
    });
    process.exit(1);
  } else {
    throw err;
  }
});

httpServer.listen(PORT, async () => {
  logger.info(`Serveur démarré sur le port ${PORT}`);
  logger.info('Socket.IO actif');
  if (isDevelopment) {
    logger.info(`Documentation API: http://localhost:${PORT}/api-docs`);
  }

  // ── Relances factures — cron quotidien ─────────────────────────
  try {
    const { startRelancesScheduler } = await import('./services/relances-scheduler.service.js');
    await startRelancesScheduler();
  } catch (e) {
    logger.warn('Scheduler relances non démarré', { message: e.message });
  }
});

export { io };
