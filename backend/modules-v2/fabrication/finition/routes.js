import { Router } from 'express';
import * as c from './controller.js';
const r = Router();
r.get('/postes',            c.list);
r.get('/postes/:id',        c.detail);
r.post('/postes/:id/demarrer', c.demarrer);
r.post('/postes/:id/terminer', c.terminer);
export default r;
