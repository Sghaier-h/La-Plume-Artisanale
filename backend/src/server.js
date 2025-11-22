import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import rateLimit from 'express-rate-limit';

// Routes
import authRoutes from './routes/auth.routes.js';
import productionRoutes from './routes/production.routes.js';
import stockRoutes from './routes/stock.routes.js';
import planningRoutes from './routes/planning.routes.js';
import qualityRoutes from './routes/quality.routes.js';
import mobileRoutes from './routes/mobile.routes.js';

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

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limite chaque IP à 100 requêtes par windowMs
});
app.use('/api/', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/production', productionRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/planning', planningRoutes);
app.use('/api/quality', qualityRoutes);

// Routes Mobile (SaaS)
app.use('/api/v1/mobile', mobileRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Socket.IO pour temps réel
io.on('connection', (socket) => {
  console.log('Client connecté:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client déconnecté:', socket.id);
  });

  // Écouter les événements de production
  socket.on('production:update', (data) => {
    io.emit('production:updated', data);
  });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📡 Socket.IO actif`);
});

export { io };

