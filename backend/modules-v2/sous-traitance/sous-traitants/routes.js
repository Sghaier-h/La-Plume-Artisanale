import { Router } from 'express';
import * as c from './controller.js';

const r = Router();
// Stats + anomalies — ordre important : placer les sous-routes nommées AVANT /:id
r.get('/stats',           c.stats);
r.get('/anomalies',       c.anomaliesList);
r.post('/anomalies',      c.anomalieCreate);
r.post('/anomalies/:id/resolve', c.anomalieResolve);
// CRUD
r.get('/',                c.list);
r.get('/:id',             c.detail);
r.post('/',               c.create);
r.put('/:id',             c.update);
r.delete('/:id',          c.remove);
// Sous-ressources
r.get('/:id/compte',      c.getCompte);
r.get('/:id/travaux',     c.listTravaux);
r.get('/:id/bons',        c.listBons);
export default r;
