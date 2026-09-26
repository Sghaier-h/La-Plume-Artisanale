// routes.js — personnalisation/commandes
// CRUD sur `commandes_personnalisations` + endpoints de validation
// client / commercial (§5.8.4 domain.md).
import { Router } from 'express';
import { controller } from './controller.js';
import { authenticate } from '../../_shared/authMiddleware.js';

const router = Router();

router.get('/',        controller.list);
router.get('/:id',     controller.get);
router.post('/',       authenticate, controller.create);
router.put('/:id',     authenticate, controller.update);
router.delete('/:id',  authenticate, controller.remove);

// Validation métier
router.post('/:id/valider-client',     authenticate, controller.validerClient);
router.post('/:id/valider-commercial', authenticate, controller.validerCommercial);

export default router;
