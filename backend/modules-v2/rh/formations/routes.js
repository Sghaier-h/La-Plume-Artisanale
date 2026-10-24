// routes.js — rh/formations (§11bis.10)
import { Router } from 'express';
import * as ctrl from './controller.js';

const router = Router();

// Dashboard / KPI (routes spécifiques AVANT /:id pour ne pas se faire capturer)
router.get('/kpi',          ctrl.kpi);
router.get('/par-mois',     ctrl.parMois);
router.get('/upcoming',     ctrl.upcoming);
router.get('/budget-tfp',   ctrl.budgetTFP);

// Participants d'une formation
router.get('/:id/participants',           ctrl.listParticipants);
router.post('/:id/participants',          ctrl.addParticipant);
router.delete('/:id/participants/:pid',   ctrl.removeParticipant);

// CRUD
router.get('/',        ctrl.list);
router.get('/:id',     ctrl.getOne);
router.post('/',       ctrl.create);
router.put('/:id',     ctrl.update);
router.delete('/:id',  ctrl.remove);

export default router;
