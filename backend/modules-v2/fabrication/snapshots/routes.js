import { Router } from 'express';
import * as c from './controller.js';
const r = Router();
r.post('/rafraichir',        c.rafraichir);
r.get('/machines/:id_machine', c.parMachine);
r.post('/service/demarrer',  c.demarrer);
r.post('/service/arreter',   c.arreter);
export default r;
