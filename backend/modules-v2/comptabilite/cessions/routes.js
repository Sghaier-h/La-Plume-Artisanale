// routes.js — comptabilite/cessions (§14quater.3)
import { Router } from 'express';
import * as ctrl from './controller.js';
import { authenticate, requirePermission } from '../../_shared/authMiddleware.js';

const router = Router();
router.use(authenticate);

router.get('/',             requirePermission('account.read'),       ctrl.list);
router.get('/:id',          requirePermission('account.read'),       ctrl.getOne);
router.post('/:id/annuler', requirePermission('account.move.write'), ctrl.annuler);

export default router;
