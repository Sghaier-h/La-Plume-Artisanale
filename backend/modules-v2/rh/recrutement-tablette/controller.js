// controller.js — rh/recrutement-tablette
import * as service from './service.js';

const ok   = (res, data)          => res.json({ success: true, data, error: null });
const fail = (res, err, code=500) => res.status(code).json({
  success: false, data: null,
  error: { message: err?.message || String(err), code: err?.code || 'ERR' },
});

export async function questionsActives(req, res) {
  try { ok(res, await service.questionsActives(req.query?.poste)); }
  catch (e) { fail(res, e); }
}
export async function postuler(req, res) {
  try { ok(res, await service.postuler(req.body, req)); }
  catch (e) { fail(res, e, e?.code === 'BAD_REQUEST' ? 400 : 500); }
}
export async function listCandidatures(req, res) {
  try { ok(res, await service.listCandidatures(req.query)); }
  catch (e) { fail(res, e); }
}
export async function getCandidatureDetail(req, res) {
  try {
    const row = await service.getCandidatureDetail(req.params.id);
    if (!row) return fail(res, { message: 'Not found', code: 'NOT_FOUND' }, 404);
    ok(res, row);
  } catch (e) { fail(res, e); }
}
