// controller.js — comptabilite/rapprochement
import * as service from './service.js';
const ok   = (res, d)       => res.json({ success: true, data: d, error: null });
const fail = (res, e, c=500)=> res.status(c).json({ success: false, data: null, error: { message: e?.message || String(e), code: e?.code || 'ERR' }});

export async function listImports(req, res)  { try { ok(res, await service.listImports()); } catch (e) { fail(res, e); } }
export async function listLignes(req, res)   { try { ok(res, await service.listLignes(req.query)); } catch (e) { fail(res, e); } }
export async function createImport(req, res) { try { ok(res, await service.createImport(req.body, req.user)); } catch (e) { fail(res, e, 400); } }
export async function matchingAuto(req, res) { try { ok(res, await service.matchingAuto(req.params.id_import_bq)); } catch (e) { fail(res, e, 400); } }
export async function rapprocher(req, res)   {
  try {
    const r = await service.rapprocher(req.params.id_ligne, req.body, req.user);
    if (!r) return fail(res, { message: 'Ligne introuvable', code: 'NOT_FOUND' }, 404);
    ok(res, r);
  } catch (e) { fail(res, e, 400); }
}
export async function ignorer(req, res)      {
  try {
    const r = await service.ignorer(req.params.id_ligne);
    if (!r) return fail(res, { message: 'Ligne introuvable', code: 'NOT_FOUND' }, 404);
    ok(res, r);
  } catch (e) { fail(res, e, 400); }
}
