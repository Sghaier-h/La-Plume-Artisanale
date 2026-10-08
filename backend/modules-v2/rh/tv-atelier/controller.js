// controller.js — rh/tv-atelier
import * as service from './service.js';

const ok   = (res, data)          => res.json({ success: true, data, error: null });
const fail = (res, err, code=500) => res.status(code).json({
  success: false, data: null,
  error: { message: err?.message || String(err), code: err?.code || 'ERR' },
});

export async function list(req, res) {
  try   { ok(res, await service.list(req.query)); }
  catch (e) { fail(res, e); }
}
export async function getOne(req, res) {
  try {
    const item = await service.getOne(req.params.id);
    if (!item) return fail(res, { message: 'Not found', code: 'NOT_FOUND' }, 404);
    ok(res, item);
  } catch (e) { fail(res, e); }
}
export async function create(req, res) {
  try   { ok(res, await service.create(req.body)); }
  catch (e) { fail(res, e, 400); }
}
export async function update(req, res) {
  try   { ok(res, await service.update(req.params.id, req.body)); }
  catch (e) { fail(res, e, 400); }
}
export async function remove(req, res) {
  try   { ok(res, await service.remove(req.params.id)); }
  catch (e) { fail(res, e, 400); }
}

/** Endpoint PUBLIC — pas d'auth (TV murales sans login). */
export async function publicByToken(req, res) {
  try {
    const data = await service.publicByToken(req.params.url_token, req.ip);
    if (!data) return fail(res, { message: 'Écran inconnu ou inactif', code: 'NOT_FOUND' }, 404);
    ok(res, data);
  } catch (e) { fail(res, e); }
}

export async function snapshot(req, res) {
  try   { ok(res, await service.snapshot(req.params.id)); }
  catch (e) { fail(res, e, 400); }
}
