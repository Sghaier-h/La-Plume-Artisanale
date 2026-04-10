/**
 * Routes crm_activity - Module crm
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getCrmActivity,
  getCrmActivityById,
  createCrmActivity,
  updateCrmActivity,
  deleteCrmActivity
} from '../controllers/crm_activity.controller.js';

const router = express.Router();

router.get('/', authenticate, getCrmActivity);
router.get('/:id', authenticate, getCrmActivityById);
router.post('/', authenticate, createCrmActivity);
router.put('/:id', authenticate, updateCrmActivity);
router.delete('/:id', authenticate, deleteCrmActivity);

export default router;
