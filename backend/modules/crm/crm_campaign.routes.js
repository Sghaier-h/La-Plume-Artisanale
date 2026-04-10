/**
 * Routes crm_campaign - Module crm
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getCrmCampaign,
  getCrmCampaignById,
  createCrmCampaign,
  updateCrmCampaign,
  deleteCrmCampaign
} from '../controllers/crm_campaign.controller.js';

const router = express.Router();

router.get('/', authenticate, getCrmCampaign);
router.get('/:id', authenticate, getCrmCampaignById);
router.post('/', authenticate, createCrmCampaign);
router.put('/:id', authenticate, updateCrmCampaign);
router.delete('/:id', authenticate, deleteCrmCampaign);

export default router;
