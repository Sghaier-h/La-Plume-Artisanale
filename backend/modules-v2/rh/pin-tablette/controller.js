// controller.js — rh/pin-tablette
import * as service from './service.js';

const ok   = (res, data)         => res.json({ success: true, data, error: null });
const fail = (res, err, code=500)=> res.status(code).json({
  success: false, data: null,
  error: { message: err?.message || String(err), code: err?.code || 'ERR' },
});

export async function list(req, res) {
  try { ok(res, await service.list(req.query)); } catch (e) { fail(res, e); }
}
export async function getOne(req, res) {
  try {
    const row = await service.getOne(req.params.idEmploye);
    if (!row) return fail(res, { message: 'Not found', code: 'NOT_FOUND' }, 404);
    ok(res, row);
  } catch (e) { fail(res, e); }
}
export async function setPin(req, res) {
  try {
    const { pin } = req.body || {};
    ok(res, await service.setPin(req.params.idEmploye, pin, req.user));
  } catch (e) { fail(res, e, 400); }
}
export async function debloquer(req, res) {
  try { ok(res, await service.debloquer(req.params.idEmploye, req.user)); }
  catch (e) { fail(res, e, 400); }
}

// Point d'entrée public (hors JWT) : POST /auth/pin-tablette
export async function authenticate(req, res) {
  try {
    const { id_employe, pin } = req.body || {};
    if (!id_employe || !pin) return fail(res, { message: 'id_employe et pin requis', code: 'BAD_REQUEST' }, 400);
    ok(res, await service.authenticate({ id_employe, pin }));
  } catch (e) { fail(res, e, 401); }
}
