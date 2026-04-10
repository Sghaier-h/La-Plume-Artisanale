/**
 * CRM Lead Routes
 */

import express from 'express';
import {
  getLeads,
  getLead,
  createLead,
  updateLead,
  deleteLead,
  convertToOpportunity
} from '../controllers/crm_lead.controller.js';
import { authenticate } from '../../../src/middleware/auth.middleware.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getLeads);
router.get('/:id', getLead);
router.post('/', createLead);
router.put('/:id', updateLead);
router.delete('/:id', deleteLead);
router.post('/:id/convert', convertToOpportunity);

export default router;
