// routes.js — personnalisation/config
// Expose CRUD sur `personnalisations_config` (§5.8.2 domain.md).
// GET publics (lecture config produit) ; POST/PUT/DELETE protégés par authMiddleware.
import { Router } from 'express';
import { controller } from './controller.js';
import { authenticate } from '../../_shared/authMiddleware.js';

const router = Router();

router.get('/',        controller.list);
router.get('/:id',     controller.get);
router.post('/',       authenticate, controller.create);
router.put('/:id',     authenticate, controller.update);
router.delete('/:id',  authenticate, controller.remove);

export default router;
