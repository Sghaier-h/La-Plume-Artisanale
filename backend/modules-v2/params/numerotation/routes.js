import express from 'express';
import { authenticate, requirePermission } from '../../_shared/authMiddleware.js';
import * as C from './controller.js';

const router = express.Router();
router.use(authenticate);

router.get ('/',                    requirePermission('numerotation:consulter'), C.list);
router.get ('/:code',               requirePermission('numerotation:consulter'), C.get);
router.put ('/:code',               requirePermission('numerotation:modifier'),  C.update);
router.post('/:code/reset',         requirePermission('numerotation:reset'),      C.reset);
router.post('/:code/apercu',        requirePermission('numerotation:consulter'), C.apercu);
router.post('/next',                requirePermission('numerotation:generer'),   C.next);

export default router;
