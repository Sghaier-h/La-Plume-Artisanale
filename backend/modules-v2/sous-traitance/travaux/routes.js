import { Router } from 'express';
import * as c from './controller.js';

const r = Router();
r.get('/stats',       c.stats);
r.get('/par-mois',    c.parMois);
r.get('/',            c.list);
r.get('/:id',         c.detail);
r.post('/',           c.create);
r.put('/:id',         c.update);
r.post('/:id/valider', c.valider);
r.post('/:id/refuser', c.refuser);
r.post('/:id/payer',   c.payer);
export default r;
