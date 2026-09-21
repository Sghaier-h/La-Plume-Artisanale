/**
 * Routes Qualité Avancée (variante orthographique).
 *
 * Ajoute les endpoints attendus par le FE :
 *   POST /api/qualite-avancee/controle-premiere-piece
 *   POST /api/qualite-avancee/non-conformites/:id/actions-correctives
 *
 * Puis délègue tout le reste au router `qualite-avance` (retro-compat totale).
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import { pool } from '../../../src/utils/db.js';
import { sendError, sendSuccess, handleError } from '../../../src/utils/error.helper.js';
import { createControle } from '../../qualite-avance/controllers/qualite-avance.controller.js';
import qualiteAvanceRouter from '../../qualite-avance/routes/qualite-avance.routes.js';

const router = express.Router();

// Alias FE : POST /controle-premiere-piece -> createControle
router.post('/controle-premiere-piece', authenticate, createControle);

// FE : POST /non-conformites/:id/actions-correctives — ajoute une action corrective
router.post('/non-conformites/:id(\\d+)/actions-correctives', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { action, description, responsable, date_echeance } = req.body || {};
    const texte = action || description;
    if (!texte) return sendError(res, 'action/description requise', 400);

    // Concaténation dans la colonne actions_correctives (jsonb ou text)
    const cur = await pool.query(
      `SELECT actions_correctives FROM non_conformites WHERE id_non_conformite = $1`,
      [id]
    );
    if (!cur.rows[0]) return sendError(res, 'Non-conformité introuvable', 404);

    const existing = cur.rows[0].actions_correctives;
    const entry = {
      action: texte,
      responsable: responsable || null,
      date_echeance: date_echeance || null,
      date_ajout: new Date().toISOString(),
    };

    let updated;
    if (Array.isArray(existing)) {
      updated = [...existing, entry];
    } else if (existing && typeof existing === 'object') {
      updated = [existing, entry];
    } else if (typeof existing === 'string' && existing.trim()) {
      updated = `${existing}\n- ${texte}${responsable ? ` (${responsable})` : ''}`;
    } else {
      updated = [entry];
    }

    // Écriture jsonb si possible, sinon fallback texte
    let r;
    try {
      r = await pool.query(
        `UPDATE non_conformites
            SET actions_correctives = $1::jsonb, updated_at = NOW()
          WHERE id_non_conformite = $2
          RETURNING id_non_conformite AS id, actions_correctives`,
        [JSON.stringify(updated), id]
      );
    } catch {
      r = await pool.query(
        `UPDATE non_conformites
            SET actions_correctives = $1, updated_at = NOW()
          WHERE id_non_conformite = $2
          RETURNING id_non_conformite AS id, actions_correctives`,
        [typeof updated === 'string' ? updated : JSON.stringify(updated), id]
      );
    }

    return sendSuccess(res, r.rows[0], 'Action corrective ajoutée', 201);
  } catch (error) {
    return handleError(res, error, 'addActionCorrective');
  }
});

// Délègue le reste au router qualite-avance existant
router.use('/', qualiteAvanceRouter);

export default router;
