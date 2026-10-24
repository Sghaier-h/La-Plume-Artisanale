import { asyncHandler, ok, okPaginated, parsePagination } from '../../_shared/apiEnvelope.js';
import { service } from './service.js';

export const controller = {
  list: asyncHandler(async (req) => {
    const { page, limit, offset } = parsePagination(req);
    const where = {
      id_article: req.query.id_article ? parseInt(req.query.id_article, 10) : null,
      id_entrepot_source: req.query.id_entrepot_source ? parseInt(req.query.id_entrepot_source, 10) : null,
      id_entrepot_destination: req.query.id_entrepot_destination ? parseInt(req.query.id_entrepot_destination, 10) : null,
      type_mouvement: req.query.type_mouvement || null,
      statut: req.query.statut || null,
      date_min: req.query.date_min || null,
      date_max: req.query.date_max || null,
    };
    const { rows, total } = await service.list({ where, limit, offset });
    return okPaginated(rows, { page, limit, total, total_pages: Math.ceil(total / limit) });
  }),

  get: asyncHandler(async (req) => {
    const row = await service.get(parseInt(req.params.id, 10));
    if (!row) return { _httpStatus: 404, body: { success: false, error: { code: 'NOT_FOUND', message: 'Mouvement introuvable' } } };
    return ok(row);
  }),

  create: asyncHandler(async (req) => {
    try {
      const result = await service.enregistrer(req.body || {}, req.user?.id);
      return ok(result);
    } catch (err) {
      if (err.code === 'VALIDATION') {
        return { _httpStatus: 400, body: { success: false, error: { code: 'VALIDATION', message: err.message } } };
      }
      throw err;
    }
  }),

  annuler: asyncHandler(async (req) => {
    const row = await service.annuler(parseInt(req.params.id, 10), req.user?.id);
    if (!row) return { _httpStatus: 404, body: { success: false, error: { code: 'NOT_FOUND', message: 'Mouvement introuvable' } } };
    return ok(row);
  }),

  valider: asyncHandler(async (req) => {
    const row = await service.valider(parseInt(req.params.id, 10), req.user?.id);
    if (!row) return { _httpStatus: 404, body: { success: false, error: { code: 'NOT_FOUND', message: 'Mouvement introuvable' } } };
    return ok(row);
  }),
};
export default controller;
