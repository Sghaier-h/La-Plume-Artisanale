// routes.js — documents/archive (schéma 37)
import { Router } from 'express';
import * as ctrl from './controller.js';
import { authenticate, requirePermission } from '../../_shared/authMiddleware.js';

const router = Router();
router.use(authenticate);

router.get('/for-entity',    requirePermission('account.read'),       ctrl.forEntity);
router.get('/',              requirePermission('account.read'),       ctrl.search);
router.get('/:id',           requirePermission('account.read'),       ctrl.getOne);
router.post('/',             requirePermission('account.move.write'), ctrl.create);
router.post('/attach',       requirePermission('account.move.write'), ctrl.attach);
router.post('/detach',       requirePermission('account.move.write'), ctrl.detach);
router.delete('/:id',        requirePermission('account.move.write'), ctrl.remove);

export default router;
