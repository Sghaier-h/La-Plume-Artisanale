import express from 'express';
import { authenticate, requirePermission } from '../../_shared/authMiddleware.js';
import * as C from './controller.js';

const router = express.Router();
router.use(authenticate);

router.get   ('/',           requirePermission('client:consulter'), C.list);
router.post  ('/',           requirePermission('contact:gerer'),    C.create);
router.get   ('/:id(\\d+)',  requirePermission('client:consulter'), C.get);
router.put   ('/:id(\\d+)',  requirePermission('contact:gerer'),    C.update);
router.delete('/:id(\\d+)',  requirePermission('contact:gerer'),    C.remove);

export default router;
