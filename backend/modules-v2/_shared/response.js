/**
 * Enveloppe API standard v2 (contrat §2.2).
 *
 * Succès : { success: true, data, pagination?, message? }
 * Erreur : { success: false, error: { code, message } }
 */
export function ok(res, data, extras = {}) {
  return res.json({ success: true, data, ...extras });
}

export function okList(res, rows, pagination) {
  return res.json({ success: true, data: rows, pagination });
}

export function created(res, data, message) {
  return res.status(201).json({ success: true, data, message });
}

export function fail(res, status, code, message) {
  return res.status(status).json({ success: false, error: { code, message } });
}

/**
 * Wrap async controller pour renvoyer 500 propre + log serveur.
 */
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch((err) => {
    // eslint-disable-next-line no-console
    console.error('[modules-v2] uncaught controller error:', err);
    if (res.headersSent) return next(err);
    return fail(res, 500, 'internal_error', err.message || 'Erreur interne');
  });
