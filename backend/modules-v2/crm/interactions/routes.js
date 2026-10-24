import express from 'express';
import { authenticate, requirePermission } from '../../_shared/authMiddleware.js';
import * as C from './controller.js';

const router = express.Router();
router.use(authenticate);

router.get   ('/',           requirePermission('historique_commercial:consulter'), C.list);
router.post  ('/',           requirePermission('historique_commercial:ajouter'),   C.create);
router.get   ('/:id(\\d+)',  requirePermission('historique_commercial:consulter'), C.get);
router.put   ('/:id(\\d+)',  requirePermission('historique_commercial:ajouter'),   C.update);
router.delete('/:id(\\d+)',  requirePermission('historique_commercial:ajouter'),   C.remove);

export default router;
