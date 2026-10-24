// routes.js — rh/ajustements
import { Router } from 'express';
import * as ctrl from './controller.js';

const router = Router();

router.get('/',                 ctrl.list);
router.get('/:id',              ctrl.getOne);
router.post('/',                ctrl.create);
router.delete('/:id',           ctrl.remove);

// Double validation
router.post('/:id/valider',     ctrl.valider);
router.post('/:id/rejeter',     ctrl.rejeter);

export default router;
