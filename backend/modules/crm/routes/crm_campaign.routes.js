/**
 * CRM Campaign Routes
 * Routes pour les campagnes CRM
 */

import express from 'express';
import {
  getCampaigns,
  getCampaign,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  startCampaign,
  pauseCampaign,
  stopCampaign,
  getCampaignStats
} from '../controllers/crm_campaign.controller.js';
import { authenticate } from '../../../src/middleware/auth.middleware.js';

const router = express.Router();

router.use(authenticate);

// Routes CRUD
router.get('/', getCampaigns);
router.get('/:id', getCampaign);
router.post('/', createCampaign);
router.put('/:id', updateCampaign);
router.delete('/:id', deleteCampaign);

// Routes d'action
router.post('/:id/start', startCampaign);
router.post('/:id/pause', pauseCampaign);
router.post('/:id/stop', stopCampaign);
router.get('/:id/stats', getCampaignStats);

export default router;
