import { Router } from 'express';
import * as ctrl from './controller.js';

const router = Router();

router.get('/',        ctrl.list);
router.get('/:id',     ctrl.detail);
router.post('/',       ctrl.creer);
router.post('/auto-depuis-commande/:id_commande', ctrl.autoDepuisCommande);
router.post('/:id/statut',    ctrl.changerStatut);
router.put('/:id',     ctrl.maj);
router.delete('/:id',  ctrl.supprimer);

export default router;
