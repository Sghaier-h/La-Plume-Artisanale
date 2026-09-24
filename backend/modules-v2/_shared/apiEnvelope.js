// Enveloppe API standard (§2.2 domain.md) : { success, data, error }
// ESM.

export function ok(data, extras = {}) {
  return { success: true, data, ...extras };
}

export function okPaginated(data, pagination, message) {
  const out = { success: true, data, pagination };
  if (message) out.message = message;
  return out;
}

export function fail(code, message, httpStatus = 400) {
  return {
    _httpStatus: httpStatus,
    body: { success: false, error: { code, message } },
  };
}

/**
 * Wrap une handler async : convertit erreurs & renvoie enveloppe uniforme.
 */
export function asyncHandler(handler) {
  return async (req, res, next) => {
    try {
      const result = await handler(req, res, next);
      if (result && typeof result === 'object' && 'success' in result) {
        return res.json(result);
      }
      if (result !== undefined) return res.json(ok(result));
    } catch (err) {
      const status = err.httpStatus || err.status || 500;
      const code = err.code || 'INTERNAL_ERROR';
      return res.status(status).json({
        success: false,
        error: { code, message: err.message || 'Erreur interne' },
      });
    }
  };
}

export function parsePagination(req, defaults = { page: 1, limit: 50 }) {
  const page = Math.max(1, parseInt(req.query.page, 10) || defaults.page);
  const limit = Math.min(500, Math.max(1, parseInt(req.query.limit, 10) || defaults.limit));
  return { page, limit, offset: (page - 1) * limit };
}
