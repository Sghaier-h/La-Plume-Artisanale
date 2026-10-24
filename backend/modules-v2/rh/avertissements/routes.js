// routes.js — rh/avertissements
import { Router } from 'express';
import * as ctrl from './controller.js';

const router = Router();

// Self-service tablette (requiert x-tablette-token issu de pin-tablette/authenticate)
router.get('/mes',                     ctrl.mes);

// Admin RH / RH_MANAGER
router.get('/kpi',                     ctrl.kpi);
router.get('/',                        ctrl.list);
router.get('/:id',                     ctrl.getOne);
router.post('/',                       ctrl.create);
router.post('/scan',                   ctrl.scan);
router.post('/:id/accuser-reception',  ctrl.accuserReception);
router.post('/:id/contester',          ctrl.contester);

export default router;
