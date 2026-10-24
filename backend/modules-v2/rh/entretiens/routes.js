// routes.js — rh/entretiens (§11bis.11)
import { Router } from 'express';
import * as ctrl from './controller.js';

const router = Router();

// Dashboard / KPI (AVANT /:id)
router.get('/kpi',       ctrl.kpi);
router.get('/par-mois',  ctrl.parMois);
router.get('/upcoming',  ctrl.upcoming);
router.get('/en-retard', ctrl.enRetard);

// CRUD
router.get('/',        ctrl.list);
router.get('/:id',     ctrl.getOne);
router.post('/',       ctrl.create);
router.put('/:id',     ctrl.update);
router.delete('/:id',  ctrl.remove);

export default router;
