/**
 * Contrôleur BonsRetour — Return notes management
 *
 * Endpoints:
 *   GET    /api/bons-retour                 — List (filters)
 *   GET    /api/bons-retour/stats/global    — Statistics
 *   GET    /api/bons-retour/:id             — Detail with client + BL origine
 *   POST   /api/bons-retour                 — Create (auto numero_retour)
 *   PUT    /api/bons-retour/:id             — Update
 *   PUT    /api/bons-retour/:id/valider     — statut='valide'
 *   PUT    /api/bons-retour/:id/traiter     — statut='traite'
 *   PUT    /api/bons-retour/:id/annuler     — statut='annule'
 *   DELETE /api/bons-retour/:id             — Delete
 */

import { pool } from '../../../src/utils/db.js';
import { sendSuccess, sendError, handleError } from '../../../src/utils/error.helper.js';

let _io = null;
const getIo = async () => {
  if (_io) return _io;
  try { const m = await import('../../../src/server.js'); _io = m.io; } catch {}
  return _io;
};
const emit = async (event, payload) => {
  try { const io = await getIo(); if (io) io.emit(event, payload); } catch {}
};

const authorId = (req) => req.user?.id || req.user?.userId || null;

const generateNumeroRetour = async (client) => {
  const r = await client.query(
    `SELECT COUNT(*)::int + 1 AS n FROM bons_retour
     WHERE date_trunc('month', COALESCE(created_at, CURRENT_TIMESTAMP)) = date_trunc('month', CURRENT_TIMESTAMP)`
  );
  const now = new Date();
  const yyyymm = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
  return `BR-${yyyymm}-${String(r.rows[0].n).padStart(4, '0')}`;
};

// ─── GET /api/bons-retour ─────────────────────────────────────────
export const getBonsRetour = async (req, res) => {
  try {
    const { id_client, statut, type_retour, date_debut, date_fin, search } = req.query;
    const params = [];
    const where = [];

    if (id_client)  { params.push(id_client);  where.push(`br.id_client = $${params.length}`); }
    if (statut)     { params.push(statut);     where.push(`br.statut = $${params.length}`); }
    if (type_retour){ params.push(type_retour);where.push(`br.type_retour = $${params.length}`); }
    if (date_debut) { params.push(date_debut); where.push(`br.date_retour >= $${params.length}`); }
    if (date_fin)   { params.push(date_fin);   where.push(`br.date_retour <= $${params.length}`); }
    if (search) {
      params.push(`%${search}%`);
      where.push(`(br.numero_retour ILIKE $${params.length} OR c.raison_sociale ILIKE $${params.length})`);
    }

    const sql = `
      SELECT br.*,
             c.raison_sociale AS client_raison_sociale,
             c.ville          AS client_ville,
             c.adresse        AS client_adresse,
             bl.numero_bl     AS bl_numero
      FROM bons_retour br
      LEFT JOIN clients c        ON br.id_client = c.id_client
      LEFT JOIN bons_livraison bl ON br.id_bl    = bl.id_bl
      ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
      ORDER BY br.date_retour DESC NULLS LAST, br.id_retour DESC
    `;
    const r = await pool.query(sql, params);
    return sendSuccess(res, { bons_retour: r.rows, total: r.rows.length });
  } catch (error) {
    return handleError(res, error, 'getBonsRetour');
  }
};

// ─── GET /api/bons-retour/stats/global ────────────────────────────
export const getStatsGlobal = async (req, res) => {
  try {
    const r = await pool.query(`
      SELECT
        COUNT(*)::int                                                   AS total,
        COUNT(*) FILTER (WHERE statut = 'brouillon')::int               AS brouillons,
        COUNT(*) FILTER (WHERE statut = 'valide')::int                  AS valides,
        COUNT(*) FILTER (WHERE statut = 'traite')::int                  AS traites,
        COALESCE(SUM(montant_ttc) FILTER (WHERE statut <> 'annule'), 0)::numeric AS montant_total
      FROM bons_retour
    `);
    return sendSuccess(res, r.rows[0]);
  } catch (error) {
    return handleError(res, error, 'getStatsGlobal');
  }
};

// ─── GET /api/bons-retour/:id ─────────────────────────────────────
export const getBonsRetourById = async (req, res) => {
  try {
    const { id } = req.params;
    const r = await pool.query(`
      SELECT br.*,
             c.raison_sociale AS client_raison_sociale,
             c.adresse        AS client_adresse,
             c.ville          AS client_ville,
             bl.numero_bl     AS bl_numero,
             bl.date_livraison AS bl_date_livraison
      FROM bons_retour br
      LEFT JOIN clients c         ON br.id_client = c.id_client
      LEFT JOIN bons_livraison bl ON br.id_bl     = bl.id_bl
      WHERE br.id_retour = $1
    `, [id]);
    if (!r.rows[0]) return sendError(res, 'Bon de retour introuvable', 404);

    // Best-effort load of lines
    const br = r.rows[0];
    let lignes = [];
    try {
      const lr = await pool.query(`SELECT * FROM lignes_retour WHERE id_retour = $1 ORDER BY ordre NULLS LAST, id_ligne`, [id]);
      lignes = lr.rows;
    } catch {}
    if (lignes.length === 0 && br.id_bl) {
      try {
        const lf = await pool.query(`SELECT * FROM lignes_facture WHERE id_ligne_bl = $1 ORDER BY ordre NULLS LAST, id_ligne`, [br.id_bl]);
        lignes = lf.rows;
      } catch {}
    }
    return sendSuccess(res, { ...br, lignes });
  } catch (error) {
    return handleError(res, error, 'getBonsRetourById');
  }
};

// ─── POST /api/bons-retour ────────────────────────────────────────
export const createBonsRetour = async (req, res) => {
  const client = await pool.connect();
  try {
    const userId = authorId(req);
    const {
      id_client, id_bl = null, id_facture = null, motif = null,
      type_retour = 'partiel', date_retour = null, adresse_retour = null,
      transporteur = null, notes = null,
      montant_ht = 0, montant_tva = 0, montant_ttc = 0,
    } = req.body || {};

    if (!id_client) return sendError(res, 'id_client requis', 400);

    await client.query('BEGIN');
    const numero_retour = await generateNumeroRetour(client);

    const ins = await client.query(
      `INSERT INTO bons_retour
         (numero_retour, id_bl, id_facture, id_client, date_retour, statut, motif,
          type_retour, adresse_retour, transporteur, notes,
          montant_ht, montant_tva, montant_ttc, created_by)
       VALUES ($1,$2,$3,$4,COALESCE($5, CURRENT_DATE),'brouillon',$6,$7,$8,$9,$10,$11,$12,$13,$14)
       RETURNING *`,
      [numero_retour, id_bl, id_facture, id_client, date_retour, motif, type_retour,
       adresse_retour, transporteur, notes, montant_ht, montant_tva, montant_ttc, userId]
    );

    await client.query('COMMIT');
    emit('br:updated', { id_retour: ins.rows[0].id_retour });
    return sendSuccess(res, ins.rows[0], 'Bon de retour créé', 201);
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    return handleError(res, error, 'createBonsRetour');
  } finally {
    client.release();
  }
};

// ─── PUT /api/bons-retour/:id ─────────────────────────────────────
export const updateBonsRetour = async (req, res) => {
  try {
    const userId = authorId(req);
    const { id } = req.params;
    const {
      id_client, id_bl, id_facture, date_retour, motif, type_retour,
      adresse_retour, transporteur, numero_suivi, notes,
      montant_ht, montant_tva, montant_ttc, statut,
    } = req.body || {};

    const r = await pool.query(
      `UPDATE bons_retour SET
         id_client       = COALESCE($2, id_client),
         id_bl           = COALESCE($3, id_bl),
         id_facture      = COALESCE($4, id_facture),
         date_retour     = COALESCE($5, date_retour),
         motif           = COALESCE($6, motif),
         type_retour     = COALESCE($7, type_retour),
         adresse_retour  = COALESCE($8, adresse_retour),
         transporteur    = COALESCE($9, transporteur),
         numero_suivi    = COALESCE($10, numero_suivi),
         notes           = COALESCE($11, notes),
         montant_ht      = COALESCE($12, montant_ht),
         montant_tva     = COALESCE($13, montant_tva),
         montant_ttc     = COALESCE($14, montant_ttc),
         statut          = COALESCE($15, statut),
         updated_at = CURRENT_TIMESTAMP, updated_by = $16
       WHERE id_retour = $1
       RETURNING *`,
      [id, id_client ?? null, id_bl ?? null, id_facture ?? null, date_retour ?? null,
       motif ?? null, type_retour ?? null, adresse_retour ?? null, transporteur ?? null,
       numero_suivi ?? null, notes ?? null, montant_ht ?? null, montant_tva ?? null,
       montant_ttc ?? null, statut ?? null, userId]
    );
    if (!r.rows[0]) return sendError(res, 'Bon de retour introuvable', 404);
    emit('br:updated', { id_retour: r.rows[0].id_retour });
    return sendSuccess(res, r.rows[0], 'Bon de retour mis à jour');
  } catch (error) {
    return handleError(res, error, 'updateBonsRetour');
  }
};

const changeStatut = async (req, res, newStatut, label, allowedFrom) => {
  try {
    const userId = authorId(req);
    const { id } = req.params;
    const where = allowedFrom ? `id_retour = $1 AND statut = ANY($3::text[])` : `id_retour = $1`;
    const params = allowedFrom ? [id, newStatut, allowedFrom, userId] : [id, newStatut, userId];
    const sql = `
      UPDATE bons_retour SET statut = $2, updated_at = CURRENT_TIMESTAMP, updated_by = $${params.length}
       WHERE ${where}
       RETURNING *`;
    const r = await pool.query(sql, params);
    if (!r.rows[0]) return sendError(res, `Transition vers "${newStatut}" refusée`, 400);
    emit('br:updated', { id_retour: r.rows[0].id_retour });
    return sendSuccess(res, r.rows[0], label);
  } catch (error) {
    return handleError(res, error, `changeStatut:${newStatut}`);
  }
};

export const validerBR = (req, res) => changeStatut(req, res, 'valide', 'Retour validé', ['brouillon']);
export const traiterBR = (req, res) => changeStatut(req, res, 'traite', 'Retour traité', ['valide']);
export const annulerBR = (req, res) => changeStatut(req, res, 'annule', 'Retour annulé', null);

// ─── DELETE /api/bons-retour/:id ──────────────────────────────────
export const deleteBonsRetour = async (req, res) => {
  try {
    const { id } = req.params;
    const r = await pool.query(
      `DELETE FROM bons_retour WHERE id_retour = $1 AND statut = 'brouillon' RETURNING id_retour`,
      [id]
    );
    if (!r.rows[0]) return sendError(res, 'Bon de retour non supprimable (statut ≠ brouillon)', 400);
    emit('br:updated', { id_retour: parseInt(id, 10) });
    return sendSuccess(res, { id: r.rows[0].id_retour }, 'Bon de retour supprimé');
  } catch (error) {
    return handleError(res, error, 'deleteBonsRetour');
  }
};
