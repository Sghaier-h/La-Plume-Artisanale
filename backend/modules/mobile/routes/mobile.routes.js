/**
 * Routes Mobile — montées sur /api/v1/mobile (voir manifest.apiPaths)
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  registerDevice,
  heartbeat,
  getDevices,
  getConfig,
  getUserTasks,
  getDeviceById,
  deactivateDevice,
  pushNotification,
} from '../controllers/mobile.controller.js';

const router = express.Router();
router.use(authenticate);

router.post('/register', registerDevice);
router.post('/heartbeat', heartbeat);
router.get('/config', getConfig);
router.get('/user/:id_user(\\d+)/tasks', getUserTasks);
router.post('/notifications/push', pushNotification);
router.get('/devices', getDevices);
router.get('/devices/:id(\\d+)', getDeviceById);
router.put('/devices/:id(\\d+)/deactivate', deactivateDevice);

export default router;
