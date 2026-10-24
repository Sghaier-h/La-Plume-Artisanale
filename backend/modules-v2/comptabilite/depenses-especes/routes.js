// routes.js — comptabilite/depenses-especes (§9.9 + §14quater)
import { Router } from 'express';
import * as ctrl from './controller.js';
import { authenticate, requirePermission } from '../../_shared/authMiddleware.js';

const router = Router();
router.use(authenticate);

router.get('/totaux',             requirePermission('account.read'),       ctrl.totaux);
router.post('/cloturer-mois/:periode', requirePermission('account.move.write'), ctrl.cloturer);

router.get('/',        requirePermission('account.read'),       ctrl.list);
router.get('/:id',     requirePermission('account.read'),       ctrl.getOne);
router.post('/',       requirePermission('account.move.write'), ctrl.create);
router.put('/:id',     requirePermission('account.move.write'), ctrl.update);
router.delete('/:id',  requirePermission('account.move.write'), ctrl.remove);

export default router;
