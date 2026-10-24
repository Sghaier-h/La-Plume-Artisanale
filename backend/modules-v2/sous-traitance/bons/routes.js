import { Router } from 'express';
import * as c from './controller.js';
import { getPool } from '../../_shared/db.js';
import { ok, fail, asyncHandler } from '../../_shared/api-envelope.js';

const r = Router();
r.get('/stats',          c.stats);
r.get('/',               c.list);
r.get('/:id',            c.detail);
r.post('/:id/signer',    c.signer);
r.post('/:id/controle',  c.controle);

// Phase T1 — fix workflow E2E : POST /api/v2/sous-traitance/bons
// Crée un bon de sortie sous-traitant dans `mouvements_sous_traitance`
// (table source des mouvements ST, enum type_mouvement = 'sortie'/'retour').
// Le module v2 historique s'appuie sur `of_sous_traitance` qui n'est pas
// aligné avec le schéma réel — on utilise donc directement la table métier.
r.post('/', asyncHandler(async (req, res) => {
  const pool = getPool();
  const b = req.body || {};
  if (!b.id_sous_traitant) {
    return res.status(400).json(fail('BAD_INPUT', 'id_sous_traitant requis'));
  }

  const userId = req.user?.id || req.user?.userId || null;

  // Vérifier le sous-traitant
  const st = await pool.query(
    `SELECT id_soustraitant, raison_sociale FROM sous_traitants
      WHERE id_soustraitant = $1 AND COALESCE(actif, true) = true`,
    [b.id_sous_traitant]
  );
  if (st.rows.length === 0) {
    return res.status(404).json(fail('NOT_FOUND', 'Sous-traitant introuvable ou inactif'));
  }

  // Vérifier l'OF si fourni
  if (b.id_of) {
    const of = await pool.query(
      `SELECT id_of FROM ordres_fabrication WHERE id_of = $1`,
      [b.id_of]
    );
    if (of.rows.length === 0) {
      return res.status(404).json(fail('NOT_FOUND', 'OF introuvable'));
    }
  }

  // Numéro mouvement BST-{YYYYMMDD}-{SEQ:4}
  const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const seqRes = await pool.query(
    `SELECT COUNT(*)::int + 1 AS n FROM mouvements_sous_traitance
      WHERE date_mouvement::date = CURRENT_DATE`
  );
  const numero = `BST-${today}-${String(seqRes.rows[0].n).padStart(4, '0')}`;

  const ins = await pool.query(
    `INSERT INTO mouvements_sous_traitance
       (numero_mouvement, id_sous_traitant, id_of, type_mouvement,
        date_retour_prevue, statut, observations, created_by)
     VALUES ($1, $2, $3, $4, $5, 'en_cours', $6, $7)
     RETURNING *`,
    [numero, b.id_sous_traitant, b.id_of || null,
     b.type_mouvement || 'sortie',
     b.date_retour_prevue || null,
     b.observations || b.motif || null,
     userId]
  );
  return res.status(201).json(ok(ins.rows[0]));
}));

export default r;
