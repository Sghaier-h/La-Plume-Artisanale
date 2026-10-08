// controller.js — rh/primes-bordereaux
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

export async function verser(req, res) {
  try   { ok(res, await service.verser(req.params.id, req.user)); }
  catch (e) { fail(res, e, 400); }
}

export async function genererEcriture(req, res) {
  try   { ok(res, await service.genererEcriture(req.params.id)); }
  catch (e) { fail(res, e, 400); }
}

export async function recuSigne(req, res) {
  try {
    // Multer/multipart n'est pas câblé ici : on lit les URLs déjà uploadées
    // (via un endpoint upload à part) + le meta. Pour éviter de coupler ce
    // module à multer, on accepte JSON { signature_url, photo_remise_url, ... }
    // OU du multipart traité en amont (req.body.signature_url, req.files...).
    const body = req.body || {};
    if (!body.signature_url && req.files?.signature) {
      body.signature_url = req.files.signature.path || req.files.signature.location;
    }
    if (!body.photo_remise_url && req.files?.photo) {
      body.photo_remise_url = req.files.photo.path || req.files.photo.location;
    }
    if (!body.ip_capture) body.ip_capture = req.ip;
    ok(res, await service.enregistrerRecu(req.params.id, body, req.user));
  } catch (e) { fail(res, e, 400); }
}

export async function pdf(req, res) {
  try   { ok(res, await service.pdfPayload(req.params.id)); }
  catch (e) { fail(res, e, e?.code === 'NOT_FOUND' ? 404 : 400); }
}
