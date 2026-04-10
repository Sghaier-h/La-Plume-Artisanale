/**
 * Routes Webhooks - Module modulaire
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getWebhooks,
  getWebhooksById,
  createWebhooks,
  updateWebhooks,
  deleteWebhooks
} from '../controllers/webhooks.controller.js';

const router = express.Router();

router.get('/', authenticate, getWebhooks);
router.get('/:id', authenticate, getWebhooksById);
router.post('/', authenticate, createWebhooks);
router.put('/:id', authenticate, updateWebhooks);
router.delete('/:id', authenticate, deleteWebhooks);

export default router;
