import express from 'express';
import { authenticate, requirePermission } from '../../_shared/authMiddleware.js';
import * as C from './controller.js';

const router = express.Router();
router.use(authenticate);

// -- Numérotation configurable (avant :kind pour éviter la collision de routes)
router.get ('/numerotation',                     requirePermission('client:consulter'), C.numListe);
router.get ('/numerotation/:entite',             requirePermission('client:consulter'), C.numGet);
router.put ('/numerotation/:entite',             requirePermission('client:modifier'),  C.numUpdate);
router.post('/numerotation/:entite/preview',     requirePermission('client:consulter'), C.numPreview);

// kind ∈ { sources-leads | motifs-perte | categories-clients | devises }
router.get   ('/:kind',                requirePermission('client:consulter'), C.list);
router.post  ('/:kind',                requirePermission('client:modifier'),  C.upsert);
router.put   ('/:kind/:id',            requirePermission('client:modifier'),  C.upsert);
router.delete('/:kind/:id',            requirePermission('client:modifier'),  C.remove);

export default router;
