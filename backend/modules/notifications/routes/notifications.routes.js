/**
 * Routes Notifications
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getNotifications,
  getNotificationById,
  getUnreadCount,
  getStatsGlobal,
  createNotification,
  broadcast,
  marquerLu,
  marquerToutesLues,
  deleteNotification,
} from '../controllers/notifications.controller.js';

const router = express.Router();
router.use(authenticate);

// Chemins spécifiques avant /:id
router.get('/non-lues/count', getUnreadCount);
router.get('/non-lues', getUnreadCount);
router.get('/stats/global', getStatsGlobal);
router.put('/toutes-lues', marquerToutesLues);
router.put('/tous-lus', marquerToutesLues);
router.put('/lire-toutes', marquerToutesLues);
router.post('/broadcast', broadcast);

router.get('/', getNotifications);
router.post('/', createNotification);
router.get('/:id(\\d+)', getNotificationById);
router.put('/:id(\\d+)/lu', marquerLu);
router.put('/:id(\\d+)/lue', marquerLu);
router.delete('/:id(\\d+)', deleteNotification);

export default router;
