// Enveloppe API standard v2
// Toutes les réponses HTTP suivent ce format : { success, data, meta, error }

export function ok(data, meta = {}) {
  return { success: true, data, meta, error: null };
}

export function fail(code, message, details = null, httpStatus = 400) {
  return {
    success: false,
    data: null,
    meta: {},
    error: { code, message, details, httpStatus }
  };
}

export function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

export function paginateFromReq(req, defaults = { limit: 50, offset: 0 }) {
  const limit  = Math.min(parseInt(req.query.limit,  10) || defaults.limit, 500);
  const offset = Math.max(parseInt(req.query.offset, 10) || defaults.offset, 0);
  return { limit, offset };
}
