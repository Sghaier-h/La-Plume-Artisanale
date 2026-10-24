import express from 'express';
import { authenticate, requirePermission } from '../_shared/authMiddleware.js';
import * as C from './controller.js';

const router = express.Router();
router.use(authenticate);

router.get   ('/roles',            requirePermission('role:consulter'), C.listRoles);
router.get   ('/permissions',      requirePermission('role:consulter'), C.listPermissions);

router.get   ('/',                 requirePermission('user:consulter'), C.list);
router.post  ('/',                 requirePermission('user:creer'),      C.create);
router.get   ('/:id(\\d+)',        requirePermission('user:consulter'), C.get);
router.put   ('/:id(\\d+)',        requirePermission('user:modifier'),  C.update);
router.delete('/:id(\\d+)',        requirePermission('user:supprimer'), C.deactivate);

export default router;
