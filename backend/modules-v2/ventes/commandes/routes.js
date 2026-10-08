// routes.js — commandes
import { Router } from 'express';
import * as ctrl from './controller.js';

const router = Router();

router.get('/',                    ctrl.list);
router.get('/:id',                 ctrl.getOne);
router.post('/',                   ctrl.create);
router.put('/:id',                 ctrl.update);
router.delete('/:id',              ctrl.remove);
router.post('/:id/valider',        ctrl.valider);
router.post('/:id/generer-ofs',    ctrl.genererOFs);   // auto-génération OF depuis commande validée
router.get('/:id/of-liens',        ctrl.listOfLiens);  // traçabilité ligne → OF

export default router;
