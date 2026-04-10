/**
 * Routes crm_opportunity - Module crm
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getCrmOpportunity,
  getCrmOpportunityById,
  createCrmOpportunity,
  updateCrmOpportunity,
  deleteCrmOpportunity
} from '../controllers/crm_opportunity.controller.js';

const router = express.Router();

router.get('/', authenticate, getCrmOpportunity);
router.get('/:id', authenticate, getCrmOpportunityById);
router.post('/', authenticate, createCrmOpportunity);
router.put('/:id', authenticate, updateCrmOpportunity);
router.delete('/:id', authenticate, deleteCrmOpportunity);

export default router;
