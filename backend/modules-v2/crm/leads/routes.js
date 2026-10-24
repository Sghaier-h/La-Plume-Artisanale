import express from 'express';
import { authenticate, requirePermission } from '../../_shared/authMiddleware.js';
import * as C from './controller.js';

const router = express.Router();
router.use(authenticate);

router.get   ('/',                    requirePermission('client:consulter'), C.list);
router.post  ('/',                    requirePermission('client:creer'),     C.create);
router.get   ('/:id(\\d+)',           requirePermission('client:consulter'), C.get);
router.put   ('/:id(\\d+)',           requirePermission('client:modifier'),  C.update);
router.delete('/:id(\\d+)',           requirePermission('client:archiver'),  C.remove);
router.post  ('/:id(\\d+)/convertir', requirePermission('client:creer'),     C.convert);

export default router;
