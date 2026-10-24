// controller.js — ventes/stats (Phase G2)
import * as service from './service.js';

const ok   = (res, data)          => res.json({ success: true, data, error: null });
const fail = (res, err, code=500) => res.status(code).json({ success: false, data: null, error: { message: err?.message || String(err), code: err?.code || 'ERR' } });

export async function ca12Mois(req, res) {
  try {
    const id_commercial = req.query.id_commercial ? Number(req.query.id_commercial) : null;
    ok(res, await service.ca12Mois({ id_commercial }));
  } catch (e) { fail(res, e); }
}
