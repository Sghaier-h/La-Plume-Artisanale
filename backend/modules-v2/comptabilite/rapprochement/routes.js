// routes.js — comptabilite/rapprochement (Phase A §14quater)
import { Router } from 'express';
import * as ctrl from './controller.js';
import { authenticate, requirePermission } from '../../_shared/authMiddleware.js';

const router = Router();
router.use(authenticate);

router.get('/imports',                  requirePermission('account.bank.read'),  ctrl.listImports);
router.post('/imports',                 requirePermission('account.bank.write'), ctrl.createImport);
router.get('/lignes',                   requirePermission('account.bank.read'),  ctrl.listLignes);
router.post('/:id_import_bq/matching-auto', requirePermission('account.bank.write'), ctrl.matchingAuto);
router.post('/:id_ligne/rapprocher',    requirePermission('account.bank.write'), ctrl.rapprocher);
router.post('/:id_ligne/ignorer',       requirePermission('account.bank.write'), ctrl.ignorer);

export default router;
