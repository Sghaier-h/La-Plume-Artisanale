/**
 * Routes Notifications - Module modulaire
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getNotifications,
  getNotificationsById,
  createNotifications,
  updateNotifications,
  deleteNotifications
} from '../controllers/notifications.controller.js';

const router = express.Router();

router.get('/', authenticate, getNotifications);
router.get('/:id', authenticate, getNotificationsById);
router.post('/', authenticate, createNotifications);
router.put('/:id', authenticate, updateNotifications);
router.delete('/:id', authenticate, deleteNotifications);

export default router;
