// routes.js — comptabilite/dossiers-import (§14quater.2)
import { Router } from 'express';
import * as ctrl from './controller.js';
import { authenticate, requirePermission } from '../../_shared/authMiddleware.js';

const router = Router();
router.use(authenticate);

router.get('/kpi',                  requirePermission('account.read'), ctrl.kpi);
router.get('/',                     requirePermission('account.read'), ctrl.list);
router.get('/:id',                  requirePermission('account.read'), ctrl.getOne);
router.post('/',                    requirePermission('account.move.write'), ctrl.create);
router.put('/:id',                  requirePermission('account.move.write'), ctrl.update);
router.post('/:id/lignes',          requirePermission('account.move.write'), ctrl.addLigne);
router.post('/:id/frais',           requirePermission('account.move.write'), ctrl.addFrais);
router.post('/:id/recalculer-cessions', requirePermission('account.move.write'), ctrl.recalculer);

export default router;
