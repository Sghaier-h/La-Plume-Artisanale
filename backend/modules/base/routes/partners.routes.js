/**
 * Routes Partners - Module base
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getPartners,
  getPartnerById,
  createPartner,
  updatePartner,
  deletePartner
} from '../controllers/partners.controller.js';

const router = express.Router();

router.get('/', authenticate, getPartners);
router.get('/:id', authenticate, getPartnerById);
router.post('/', authenticate, createPartner);
router.put('/:id', authenticate, updatePartner);
router.delete('/:id', authenticate, deletePartner);

export default router;
