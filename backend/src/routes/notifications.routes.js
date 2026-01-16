import express from 'express';
import {
  getNotifications,
  getNotificationsNonLues,
  marquerLue,
  lireToutes,
  deleteNotification
} from '../controllers/notifications.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', authenticate, getNotifications);
router.get('/non-lues', authenticate, getNotificationsNonLues);
router.put('/:id/lue', authenticate, marquerLue);
router.put('/lire-toutes', authenticate, lireToutes);
router.delete('/:id', authenticate, deleteNotification);

export default router;
