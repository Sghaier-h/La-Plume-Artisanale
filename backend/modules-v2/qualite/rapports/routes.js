import { Router } from 'express';
import * as c from './controller.js';
const r = Router();
r.get('/taux-2e-choix-machines-7j', c.taux2eChoix);
r.get('/defauts-par-type',           c.defautsParType);
export default r;
