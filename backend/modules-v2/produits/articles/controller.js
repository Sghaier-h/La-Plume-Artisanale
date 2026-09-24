import { asyncHandler, ok } from '../../_shared/apiEnvelope.js';
import { baseController } from './model.js';
import { service } from './service.js';

export const controller = {
  ...baseController,
  create: asyncHandler(async (req) => {
    try {
      const row = await service.create(req.body || {}, req.user?.id);
      return ok(row);
    } catch (err) {
      // Contrainte unique combinaison (§5.5)
      if (err.code === '23505') {
        return {
          _httpStatus: 409,
          body: {
            success: false,
            error: {
              code: 'VARIANTE_DEJA_EXISTANTE',
              message: 'Cette combinaison d\'attributs existe déjà pour ce modèle.',
            },
          },
        };
      }
      throw err;
    }
  }),
};

export default controller;
