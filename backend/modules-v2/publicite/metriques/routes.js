// routes.js — publicite/metriques
import { Router } from 'express';
import { controller } from './controller.js';

const router = Router();
router.get('/',                                controller.list);
router.post('/ingest',                         controller.ingest);      // POST { entries:[...] }
router.post('/',                               controller.upsertOne);   // upsert d'une seule ligne
router.get('/aggregat/par-campagne',           controller.aggregateByCampagne);
router.get('/campagne/:id_campagne/summary',   controller.summaryCampagne);

export default router;
