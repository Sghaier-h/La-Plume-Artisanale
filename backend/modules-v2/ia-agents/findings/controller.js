// controller.js — findings
import * as service from './service.js';

const ok    = (res, data)         => res.json({ success: true, data, error: null });
const fail  = (res, err, code=500)=> res.status(code).json({ success: false, data: null, error: { message: err?.message || String(err), code: err?.code || 'ERR' }});

function codeToHttp(code) {
  switch (code) {
    case 'NOT_FOUND':       return 404;
    case 'UNAUTHORIZED':    return 401;
    case 'FORBIDDEN':       return 403;
    case 'BAD_REQUEST':
    case 'NO_PROPOSAL':
    case 'DESTRUCTIVE_SQL': return 400;
    default:                return 500;
  }
}

function ensureAdmin(req) {
  const role = req.user?.role || req.user?.roles?.[0];
  if (role !== 'ADMIN') {
    const e = new Error('Rôle ADMIN requis'); e.code = 'FORBIDDEN'; throw e;
  }
}

export async function list(req, res){
  try   { ok(res, await service.list(req.query)); }
  catch (e) { fail(res, e); }
}
export async function getOne(req, res){
  try {
    const item = await service.getOne(req.params.id);
    if (!item) return fail(res, { message: 'Not found', code: 'NOT_FOUND' }, 404);
    ok(res, item);
  } catch (e) { fail(res, e); }
}
export async function create(req, res){
  try   { ok(res, await service.create(req.body, req.user)); }
  catch (e) { fail(res, e, 400); }
}
export async function update(req, res){
  try   { ok(res, await service.update(req.params.id, req.body, req.user)); }
  catch (e) { fail(res, e, 400); }
}
export async function remove(req, res){
  try   { ok(res, await service.remove(req.params.id, req.user)); }
  catch (e) { fail(res, e, 400); }
}

// ---------------------------------------------------------------------------
// Workflow correction validée (§14bis.6bis)
// ---------------------------------------------------------------------------

export async function proposerCorrection(req, res) {
  try {
    const out = await service.proposerCorrection(req.params.id, req.body || {}, req.user);
    ok(res, out);
  } catch (e) { fail(res, e, codeToHttp(e.code)); }
}

export async function validerCorrection(req, res) {
  try {
    ensureAdmin(req);
    const out = await service.validerCorrection(req.params.id, req.body || {}, req.user);
    ok(res, out);
  } catch (e) { fail(res, e, codeToHttp(e.code)); }
}

export async function rollbackCorrection(req, res) {
  try {
    ensureAdmin(req);
    const out = await service.annulerCorrection(req.params.id, req.body || {}, req.user);
    ok(res, out);
  } catch (e) { fail(res, e, codeToHttp(e.code)); }
}
