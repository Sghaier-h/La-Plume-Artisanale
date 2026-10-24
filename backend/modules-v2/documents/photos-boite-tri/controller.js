// controller.js — documents/photos-boite-tri (§14quater.4)
//
// 2 types de handlers :
//   - Utilisateur (auth JWT) : list / detail / rattacher / ignorer / count
//   - Webhooks (sans auth, protégés par HMAC) : Teams / WhatsApp / Email
//
// Les webhooks :
//   1. Vérifient la signature HMAC-SHA256 contre un secret .env
//   2. Décodent / téléchargent la photo
//   3. La poussent dans documents_archive + photos_boite_tri (dédup SHA-256)

import crypto from 'crypto';
import { Buffer } from 'buffer';
import * as service from './service.js';
import { ok, created, fail, asyncHandler } from '../../_shared/response.js';

// ---------------------------------------------------------------------
// Handlers utilisateur (auth)
// ---------------------------------------------------------------------
export const list = asyncHandler(async (req, res) => {
  const rows = await service.list({
    statut:     req.query.statut || undefined,
    source:     req.query.source || undefined,
    expediteur: req.query.expediteur || undefined,
    date_from:  req.query.date_from || undefined,
    date_to:    req.query.date_to || undefined,
    limit:      Number(req.query.limit) || 100,
    offset:     Number(req.query.offset) || 0,
  });
  return ok(res, rows);
});

export const count = asyncHandler(async (req, res) => {
  const n = await service.count({
    statut: req.query.statut || 'non_traite',
    source: req.query.source || undefined,
  });
  return ok(res, { count: n });
});

export const getOne = asyncHandler(async (req, res) => {
  const row = await service.getOne(req.params.id);
  if (!row) return fail(res, 404, 'not_found', 'Photo introuvable');
  return ok(res, row);
});

export const rattacher = asyncHandler(async (req, res) => {
  const { type, id, notes } = req.body || {};
  if (!type || !id) return fail(res, 400, 'bad_request', '`type` et `id` requis');
  try {
    const row = await service.rattacher(
      { id_photo: Number(req.params.id), type, id: Number(id), notes },
      req.user,
    );
    return ok(res, row);
  } catch (e) {
    if (e.code === 'NOT_FOUND')     return fail(res, 404, 'not_found', e.message);
    if (e.code === 'INVALID_TYPE')  return fail(res, 400, 'invalid_type', e.message);
    throw e;
  }
});

export const ignorer = asyncHandler(async (req, res) => {
  try {
    const row = await service.ignorer(
      { id_photo: Number(req.params.id), notes: req.body?.notes },
      req.user,
    );
    return ok(res, row);
  } catch (e) {
    if (e.code === 'NOT_FOUND') return fail(res, 404, 'not_found', e.message);
    throw e;
  }
});

export const marquerEnCours = asyncHandler(async (req, res) => {
  const row = await service.marquerEnCours({ id_photo: Number(req.params.id) }, req.user);
  if (!row) return fail(res, 409, 'conflict', 'Photo non trouvée ou déjà en traitement');
  return ok(res, row);
});

// ---------------------------------------------------------------------
// Webhooks (sans auth, HMAC-signés)
// ---------------------------------------------------------------------
/**
 * Vérifie une signature HMAC-SHA256. Retourne true si valide.
 * - signature attendue en header `x-webhook-signature` (hex)
 *   ou `x-hub-signature-256` (format `sha256=<hex>` à la WhatsApp/GitHub).
 * - secret lu dans l'env variable passée.
 * - comparaison timing-safe.
 */
function verifyHmac(req, secret, rawBody) {
  if (!secret) return false; // pas de secret configuré → refuser
  const raw = rawBody || JSON.stringify(req.body || {});
  const expected = crypto.createHmac('sha256', secret).update(raw).digest('hex');

  const headerSig =
    req.headers['x-webhook-signature']
    || req.headers['x-hub-signature-256']
    || '';

  // Normalise `sha256=<hex>` → `<hex>`
  const provided = String(headerSig).replace(/^sha256=/i, '').trim();
  if (!provided || provided.length !== expected.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(provided, 'hex'));
  } catch {
    return false;
  }
}

/**
 * Webhook Teams — payload attendu :
 *   {
 *     "image_base64": "<base64 pure sans prefix>",
 *     "mimetype": "image/jpeg",
 *     "filename": "receipt.jpg",
 *     "from": { "upn": "user@tenant.onmicrosoft.com", "name": "Jean Doe" },
 *     "message": "Facture essence du 15/10",
 *     "channel": "La Plume · Compta"
 *   }
 */
export const webhookTeams = asyncHandler(async (req, res) => {
  const secret = process.env.TEAMS_WEBHOOK_SECRET;
  if (!verifyHmac(req, secret, req.rawBody)) {
    return fail(res, 401, 'bad_signature', 'Signature HMAC invalide');
  }
  const b = req.body || {};
  if (!b.image_base64) return fail(res, 400, 'bad_request', '`image_base64` requis');

  const buffer = Buffer.from(String(b.image_base64).replace(/^data:[^;]+;base64,/, ''), 'base64');
  if (!buffer.length) return fail(res, 400, 'bad_request', 'Image base64 vide');

  const row = await service.ingestPhoto({
    buffer,
    filename_original: b.filename || `teams-${Date.now()}.jpg`,
    mimetype: b.mimetype || 'image/jpeg',
    source: 'teams',
    expediteur_identifiant: b.from?.upn || b.from?.id || null,
    expediteur_nom: b.from?.name || null,
    expediteur_message: b.message || null,
    metadata: { channel: b.channel || null, raw: b.metadata || null },
    titre: `Photo Teams · ${b.from?.name || b.from?.upn || 'inconnu'}`,
  });
  return created(res, { id_photo: row.id_photo, id_document_archive: row.id_document_archive });
});

/**
 * Webhook WhatsApp Business — payload attendu :
 *   {
 *     "media_url": "https://media.whatsapp/xxx",
 *     "mimetype": "image/jpeg",
 *     "from": "+21624123456",
 *     "profile_name": "Jean Doe",
 *     "caption": "Reçu caisse"
 *   }
 * Note : si `media_url` fourni, on tente de télécharger via fetch (nécessite
 * `WHATSAPP_TOKEN` si l'URL est protégée). Si `image_base64` fourni, on l'utilise.
 */
export const webhookWhatsapp = asyncHandler(async (req, res) => {
  const secret = process.env.WHATSAPP_WEBHOOK_SECRET;
  if (!verifyHmac(req, secret, req.rawBody)) {
    return fail(res, 401, 'bad_signature', 'Signature HMAC invalide');
  }
  const b = req.body || {};

  let buffer;
  if (b.image_base64) {
    buffer = Buffer.from(String(b.image_base64).replace(/^data:[^;]+;base64,/, ''), 'base64');
  } else if (b.media_url) {
    const headers = {};
    if (process.env.WHATSAPP_TOKEN) headers.Authorization = `Bearer ${process.env.WHATSAPP_TOKEN}`;
    const resp = await fetch(b.media_url, { headers });
    if (!resp.ok) return fail(res, 502, 'media_fetch_failed', `Téléchargement media_url: HTTP ${resp.status}`);
    buffer = Buffer.from(await resp.arrayBuffer());
  } else {
    return fail(res, 400, 'bad_request', '`media_url` ou `image_base64` requis');
  }

  const row = await service.ingestPhoto({
    buffer,
    filename_original: b.filename || `whatsapp-${Date.now()}.jpg`,
    mimetype: b.mimetype || 'image/jpeg',
    source: 'whatsapp',
    expediteur_identifiant: b.from || null,
    expediteur_nom: b.profile_name || null,
    expediteur_message: b.caption || null,
    metadata: { wa_message_id: b.message_id || null, raw: b.metadata || null },
    titre: `Photo WhatsApp · ${b.profile_name || b.from || 'inconnu'}`,
  });
  return created(res, { id_photo: row.id_photo, id_document_archive: row.id_document_archive });
});

/**
 * Webhook Email (ex: Mailgun / SendGrid Inbound Parse) — payload attendu :
 *   {
 *     "from": "jean@example.com",
 *     "from_name": "Jean Doe",
 *     "subject": "Facture carburant",
 *     "text": "Ci-joint le ticket",
 *     "attachments": [
 *       { "filename": "ticket.jpg", "content_base64": "...", "content_type": "image/jpeg" }
 *     ]
 *   }
 * On ingère chaque pièce jointe comme une photo distincte.
 */
export const webhookEmail = asyncHandler(async (req, res) => {
  const secret = process.env.EMAIL_WEBHOOK_SECRET;
  if (!verifyHmac(req, secret, req.rawBody)) {
    return fail(res, 401, 'bad_signature', 'Signature HMAC invalide');
  }
  const b = req.body || {};
  const atts = Array.isArray(b.attachments) ? b.attachments : [];
  if (!atts.length) return fail(res, 400, 'bad_request', 'Aucune pièce jointe');

  const results = [];
  for (const att of atts) {
    if (!att.content_base64) continue;
    const buffer = Buffer.from(
      String(att.content_base64).replace(/^data:[^;]+;base64,/, ''),
      'base64',
    );
    if (!buffer.length) continue;
    const row = await service.ingestPhoto({
      buffer,
      filename_original: att.filename || `email-${Date.now()}.jpg`,
      mimetype: att.content_type || 'image/jpeg',
      source: 'email',
      expediteur_identifiant: b.from || null,
      expediteur_nom: b.from_name || null,
      expediteur_message: b.subject ? `${b.subject}\n\n${b.text || ''}`.trim() : (b.text || null),
      metadata: { email_message_id: b.message_id || null, raw: b.metadata || null },
      titre: `Pièce jointe email · ${b.from || 'inconnu'}`,
    });
    results.push({ id_photo: row.id_photo, id_document_archive: row.id_document_archive });
  }
  if (!results.length) return fail(res, 400, 'bad_request', 'Pièces jointes vides');
  return created(res, { photos: results });
});

/**
 * Upload direct (depuis l'app, authentifié) — body JSON :
 *   { filename, mimetype, image_base64, message? }
 * Pour les cas où un comptable prend une photo depuis l'ERP mobile sans
 * passer par Teams/WhatsApp/email.
 */
export const uploadDirect = asyncHandler(async (req, res) => {
  const b = req.body || {};
  if (!b.image_base64) return fail(res, 400, 'bad_request', '`image_base64` requis');

  const buffer = Buffer.from(String(b.image_base64).replace(/^data:[^;]+;base64,/, ''), 'base64');
  if (!buffer.length) return fail(res, 400, 'bad_request', 'Image base64 vide');

  const row = await service.ingestPhoto({
    buffer,
    filename_original: b.filename || `upload-${Date.now()}.jpg`,
    mimetype: b.mimetype || 'image/jpeg',
    source: 'upload_direct',
    expediteur_identifiant: req.user?.email || `user:${req.user?.id_user || 'anonyme'}`,
    expediteur_nom: req.user?.nom || req.user?.email || null,
    expediteur_message: b.message || null,
    metadata: { user_id: req.user?.id_user || null },
    titre: `Photo app · ${req.user?.email || 'utilisateur'}`,
  });
  return created(res, { id_photo: row.id_photo, id_document_archive: row.id_document_archive });
});
