import express from 'express';
import { authenticate, requirePermission } from '../../_shared/authMiddleware.js';
import * as C from './controller.js';

const router = express.Router();
router.use(authenticate);

router.get   ('/stats',              requirePermission('client:consulter'), C.stats);
router.get   ('/',                   requirePermission('client:consulter'), C.list);
router.post  ('/',                   requirePermission('client:creer'),     C.create);
router.get   ('/:id(\\d+)',          requirePermission('client:consulter'), C.get);
router.put   ('/:id(\\d+)',          requirePermission('client:modifier'),  C.update);
router.delete('/:id(\\d+)',          requirePermission('client:archiver'),  C.remove);

export default router;
