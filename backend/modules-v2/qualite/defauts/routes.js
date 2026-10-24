import { Router } from 'express';
import * as c from './controller.js';
const r = Router();
r.get('/types',              c.listTypes);
r.get('/signales',            c.listSignales);
r.post('/signales',           c.signaler);
r.post('/signales/:id/resoudre', c.resoudre);
r.get('/signales/:id/photos', c.photosDe);
r.post('/signales/:id/photos', c.uploadPhoto);

// T3c — alias simplifié : POST /api/v2/qualite/defauts
// Payload simplifié : { id_of, type_defaut, gravite, quantite, photo_url?, description? }
// Mappe vers defauts_signales + crée notification pour CONTROLEUR_QUALITE.
r.get('/',                    c.listSignalesSimple);
r.post('/',                   c.signalerSimple);
export default r;
