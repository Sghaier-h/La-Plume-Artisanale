// routes.js — comptabilite/caisses (Phase A §14quater.1)
import { Router } from 'express';
import * as ctrl from './controller.js';
import { authenticate, requirePermission } from '../../_shared/authMiddleware.js';

const router = Router();

router.use(authenticate);

router.get('/routage',             requirePermission('account.cash.read'),  ctrl.routage);
router.post('/transfert',          requirePermission('account.cash.write'), ctrl.transfert);
router.get('/:id/mouvements',      requirePermission('account.cash.read'),  ctrl.mouvements);

router.get('/',        requirePermission('account.cash.read'),  ctrl.list);
router.get('/:id',     requirePermission('account.cash.read'),  ctrl.getOne);
router.post('/',       requirePermission('account.cash.write'), ctrl.create);
router.put('/:id',     requirePermission('account.cash.write'), ctrl.update);
router.delete('/:id',  requirePermission('account.cash.write'), ctrl.remove);

export default router;
