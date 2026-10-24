// routes.js — rh/comptes-employes
import { Router } from 'express';
import * as ctrl from './controller.js';

const router = Router();

router.get('/kpi',                  ctrl.kpi);
router.get('/',                     ctrl.list);
router.get('/:id/solde',            ctrl.getSolde);
router.get('/:id/mouvements',       ctrl.getMouvements);
router.put('/:id',                  ctrl.update);
router.post('/:id/mouvement',       ctrl.creerMouvement);

export default router;
