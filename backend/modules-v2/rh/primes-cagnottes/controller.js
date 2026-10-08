// controller.js — rh/primes-cagnottes
import * as service from './service.js';

const ok   = (res, data)          => res.json({ success: true, data, error: null });
const fail = (res, err, code=500) => res.status(code).json({
  success: false, data: null,
  error: { message: err?.message || String(err), code: err?.code || 'ERR' },
});

function codeToHttp(err) {
  switch (err?.code) {
    case 'VALIDATION': return 400;
    case 'NOT_FOUND':  return 404;
    case 'CONFLICT':   return 409;
    default:           return 500;
  }
}

export async function list(req, res) {
  try   { ok(res, await service.list(req.query)); }
  catch (e) { fail(res, e, codeToHttp(e)); }
}
export async function getOne(req, res) {
  try {
    const item = await service.getOne(req.params.id);
    if (!item) return fail(res, { message: 'Not found', code: 'NOT_FOUND' }, 404);
    ok(res, item);
  } catch (e) { fail(res, e, codeToHttp(e)); }
}
export async function create(req, res) {
  try   { ok(res, await service.create(req.body, req.user)); }
  catch (e) { fail(res, e, codeToHttp(e) || 400); }
}
export async function update(req, res) {
  try   { ok(res, await service.update(req.params.id, req.body)); }
  catch (e) { fail(res, e, codeToHttp(e) || 400); }
}
export async function remove(req, res) {
  try   { ok(res, await service.remove(req.params.id)); }
  catch (e) { fail(res, e, codeToHttp(e) || 400); }
}

export async function calculer(req, res) {
  try   { ok(res, await service.calculer(req.params.id)); }
  catch (e) { fail(res, e, 400); }
}
export async function valider(req, res) {
  try   { ok(res, await service.valider(req.params.id, req.user)); }
  catch (e) { fail(res, e, 400); }
}
export async function marquerPayee(req, res) {
  try   { ok(res, await service.marquerPayee(req.params.id, req.user)); }
  catch (e) { fail(res, e, 400); }
}
