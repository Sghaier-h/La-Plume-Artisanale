// controller.js — comptabilite/apport-gerant (§14quater.6)
import * as service from './service.js';

const ok   = (res, data)          => res.json({ success: true, data, error: null });
const fail = (res, err, code=500) => res.status(code).json({
  success: false, data: null,
  error: { message: err?.message || String(err), code: err?.code || 'ERR' },
});

export async function saisir(req, res) {
  try   { ok(res, await service.saisir(req.body, req.user)); }
  catch (e) { fail(res, e, 400); }
}

export async function historique(req, res) {
  try   { ok(res, await service.historique(req.query, req.user)); }
  catch (e) { fail(res, e); }
}

export async function solde(req, res) {
  try   { ok(res, await service.soldeCca(req.query, req.user)); }
  catch (e) { fail(res, e); }
}
