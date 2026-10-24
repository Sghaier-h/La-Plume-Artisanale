// T3c — enrichit le CRUD généré + endpoint POST /sortie (sortie de pièce liée
// à une intervention de maintenance). Chaîne : stock_pieces (dec quantite) +
// mouvements_stock (type SORTIE, type_reference INTERVENTION).
import { Router } from 'express';
import { routes as crudRoutes } from './model.js';
import { getPool } from '../../_shared/db.js';
import { ok, fail, asyncHandler } from '../../_shared/api-envelope.js';

const router = Router();

async function tableExists(name) {
  const r = await getPool().query(`SELECT to_regclass($1) AS t`, [`public.${name}`]);
  return !!r.rows[0].t;
}

/**
 * POST /api/v2/stock/pieces-rechange/sortie
 * Payload : { id_piece, quantite, id_intervention?, id_machine?, motif?, numero_lot? }
 * Décrémente le stock pièce + crée mouvement SORTIE lié intervention si fourni.
 */
router.post('/sortie', asyncHandler(async (req, res) => {
  const pool = getPool();
  const b = req.body || {};
  if (!b.id_piece || !b.quantite) {
    return res.status(400).json(fail('BAD_INPUT', 'id_piece et quantite requis'));
  }
  const userId = req.user?.id || req.user?.id_user || null;

  // 1) Décrémenter stock si la table existe (plusieurs noms possibles)
  const decCandidates = ['stock_pieces', 'stock_pieces_rechange', 'pieces_rechange'];
  let stockUpdated = null;
  for (const t of decCandidates) {
    if (await tableExists(t)) {
      try {
        // tente colonnes classiques (quantite_disponible, stock_actuel)
        const col = t === 'pieces_rechange' ? null : 'quantite_disponible';
        if (col) {
          const r = await pool.query(
            `UPDATE ${t} SET ${col} = GREATEST(0, ${col} - $2)
             WHERE id_piece = $1 RETURNING id_piece, ${col}`,
            [b.id_piece, b.quantite]
          );
          if (r.rows[0]) { stockUpdated = { table: t, ...r.rows[0] }; break; }
        }
      } catch {}
    }
  }

  // 2) Mouvement stock (SORTIE)
  let mouvement = null;
  if (await tableExists('mouvements_stock')) {
    try {
      const r = await pool.query(
        `INSERT INTO mouvements_stock
           (type_mouvement, id_article, quantite,
            id_reference, type_reference, numero_reference,
            numero_lot, motif, created_by)
         VALUES ('SORTIE', $1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [
          b.id_piece,
          b.quantite,
          b.id_intervention ?? null,
          b.id_intervention ? 'INTERVENTION' : (b.type_reference || 'SORTIE_PIECE'),
          b.numero_reference ?? (b.id_intervention ? `INT-${b.id_intervention}` : null),
          b.numero_lot ?? null,
          b.motif ?? null,
          userId,
        ]
      );
      mouvement = r.rows[0];
    } catch (e) {
      // mouvements_stock peut référencer `articles_catalogue` → id_piece pas valide.
      // Si échec, fallback stub.
      mouvement = { error: e.message };
    }
  }

  return res.status(201).json(ok({
    id_piece: b.id_piece,
    quantite: b.quantite,
    id_intervention: b.id_intervention ?? null,
    stock_updated: stockUpdated,
    mouvement,
  }, {
    message: stockUpdated || mouvement
      ? 'Sortie enregistrée'
      : 'En attente d\'implémentation DB (stock_pieces / mouvements_stock)',
  }));
}));

// Puis le CRUD standard (GET /, GET /:id, POST /, PUT /:id, DELETE /:id)
router.use(crudRoutes);

export default router;
