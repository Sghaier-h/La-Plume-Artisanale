/**
 * Routes crm_lead - Module crm
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getCrmLead,
  getCrmLeadById,
  createCrmLead,
  updateCrmLead,
  deleteCrmLead
} from '../controllers/crm_lead.controller.js';

const router = express.Router();

router.get('/', authenticate, getCrmLead);
router.get('/:id', authenticate, getCrmLeadById);
router.post('/', authenticate, createCrmLead);
router.put('/:id', authenticate, updateCrmLead);
router.delete('/:id', authenticate, deleteCrmLead);

export default router;
