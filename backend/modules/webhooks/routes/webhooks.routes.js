/**
 * Routes Webhooks
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getWebhooks,
  getWebhookById,
  createWebhook,
  updateWebhook,
  deleteWebhook,
  toggleWebhook,
  testWebhook,
  getAvailableEvents,
} from '../controllers/webhooks.controller.js';

const router = express.Router();

router.use(authenticate);

// Routes spécifiques avant /:id
router.get('/events/available', getAvailableEvents);
router.put('/:id(\\d+)/toggle', toggleWebhook);
router.post('/:id(\\d+)/test', testWebhook);

// CRUD
router.get('/', getWebhooks);
router.post('/', createWebhook);
router.get('/:id(\\d+)', getWebhookById);
router.put('/:id(\\d+)', updateWebhook);
router.delete('/:id(\\d+)', deleteWebhook);

export default router;
