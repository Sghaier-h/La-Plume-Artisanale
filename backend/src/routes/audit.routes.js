import express from 'express';
import {
  getAuditLogs,
  getAuditLogById,
  getAuditStatsByTable,
  getAuditStatsByUser,
  getRecordHistory,
  getAuditedTables
} from '../controllers/audit.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Toutes les routes d'audit nécessitent une authentification
// Seul un ADMIN peut consulter les logs d'audit
router.get('/', authenticate, authorize('ADMIN'), getAuditLogs);
router.get('/stats/by-table', authenticate, authorize('ADMIN'), getAuditStatsByTable);
router.get('/stats/by-user', authenticate, authorize('ADMIN'), getAuditStatsByUser);
router.get('/record/:table/:id', authenticate, authorize('ADMIN'), getRecordHistory);
router.get('/tables', authenticate, authorize('ADMIN'), getAuditedTables);
router.get('/:id', authenticate, authorize('ADMIN'), getAuditLogById);

export default router;
