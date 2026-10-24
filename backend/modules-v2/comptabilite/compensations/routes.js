// routes.js — comptabilite/compensations (§14quater.4)
import { Router } from 'express';
import * as ctrl from './controller.js';
import { authenticate, requirePermission } from '../../_shared/authMiddleware.js';

const router = Router();
router.use(authenticate);

router.get('/',             requirePermission('account.read'),       ctrl.list);
router.get('/:id',          requirePermission('account.read'),       ctrl.getOne);
router.post('/',            requirePermission('account.move.write'), ctrl.create);
router.post('/:id/valider', requirePermission('account.move.write'), ctrl.valider);
router.post('/:id/annuler', requirePermission('account.move.write'), ctrl.annuler);

export default router;
