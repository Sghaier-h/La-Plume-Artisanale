import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { detectMobile } from '../middleware/mobile.middleware.js';
import {
  mobileLogin,
  refreshToken,
  getMobileDashboard,
  syncData,
  uploadPhoto
} from '../controllers/mobile.controller.js';

const router = express.Router();

// Détection mobile
router.use(detectMobile);

// Routes publiques mobile
router.post('/auth/login', mobileLogin);
router.post('/auth/refresh', refreshToken);

// Routes protégées mobile
router.use(authenticateToken);

// Dashboard par rôle
router.get('/dashboard/:role', getMobileDashboard);

// Synchronisation données (mode hors ligne)
router.post('/sync', syncData);
router.get('/sync/status', (req, res) => {
  res.json({ status: 'ok', lastSync: new Date() });
});

// Upload photos
router.post('/upload/photo', uploadPhoto);

// Scan QR Code
router.post('/scan/qr', (req, res) => {
  const { qrCode } = req.body;
  // Traiter le scan QR
  res.json({ success: true, data: qrCode });
});

export default router;

