/**
 * Routes Audit - Module modulaire
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getAudit,
  getAuditById,
  createAudit,
  updateAudit,
  deleteAudit
} from '../controllers/audit.controller.js';

const router = express.Router();

router.get('/', authenticate, getAudit);
router.get('/:id', authenticate, getAuditById);
router.post('/', authenticate, createAudit);
router.put('/:id', authenticate, updateAudit);
router.delete('/:id', authenticate, deleteAudit);

export default router;
