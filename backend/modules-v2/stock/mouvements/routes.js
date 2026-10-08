import { Router } from 'express';
import { controller } from './controller.js';

const router = Router();
router.get('/', controller.list);
router.get('/:id', controller.get);
router.post('/', controller.create);
router.post('/:id/annuler', controller.annuler);
router.post('/:id/valider', controller.valider);

export default router;
