import { Router } from 'express';
import * as c from './controller.js';
import * as svc from './service.js';
import { ok, fail, asyncHandler } from '../../_shared/api-envelope.js';

const r = Router();
// Stats + anomalies — ordre important : placer les sous-routes nommées AVANT /:id
r.get('/stats',           c.stats);
// T3c — alias public `/stats/global` (consommé par certains dashboards)
r.get('/stats/global',    c.stats);
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

// T3c — POST /api/v2/sous-traitance/sous-traitants/:id/anomalies
// Signaler une anomalie liée à un sous-traitant spécifique (alias court).
r.post('/:id/anomalies', asyncHandler(async (req, res) => {
  const b = req.body || {};
  if (!b.type_anomalie) {
    return res.status(400).json(fail('BAD_INPUT', 'type_anomalie requis'));
  }
  try {
    const a = await svc.anomalieCreate({
      ...b,
      id_soustraitant: Number(req.params.id),
    });
    return res.status(201).json(ok(a));
  } catch (e) {
    return res.status(e.status || 400).json(fail('DB_ERROR', e.message));
  }
}));

export default r;
