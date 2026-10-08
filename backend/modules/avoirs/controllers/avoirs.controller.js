/**
 * Contrôleur Avoirs — Credit notes management
 *
 * Endpoints:
 *   GET    /api/avoirs                    — List (filters)
 *   GET    /api/avoirs/stats/global       — Statistics
 *   GET    /api/avoirs/:id                — Detail with client + facture + lignes
 *   POST   /api/avoirs                    — Create (auto numero_avoir + lignes)
 *   PUT    /api/avoirs/:id                — Update (header + optional lignes)
 *   PUT    /api/avoirs/:id/valider        — statut='valide'
 *   PUT    /api/avoirs/:id/appliquer      — Apply amount to invoice
 *   PUT    /api/avoirs/:id/annuler        — statut='annule'
 *   DELETE /api/avoirs/:id                — Delete (brouillon only)
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

const generateNumeroAvoir = async (client) => {
  const r = await client.query(
    `SELECT COUNT(*)::int + 1 AS n FROM avoirs
     WHERE date_trunc('month', COALESCE(created_at, CURRENT_TIMESTAMP)) = date_trunc('month', CURRENT_TIMESTAMP)`
  );
  const now = new Date();
  const yyyymm = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
  return `AV-${yyyymm}-${String(r.rows[0].n).padStart(4, '0')}`;
};

const computeMontants = (lignes = []) => {
  let ht = 0, tva = 0;
  for (const l of lignes) {
    const q = Number(l.quantite) || 0;
    const pu = Number(l.prix_unitaire_ht) || 0;
    const t = Number(l.taux_tva) || 0;
    const mht = q * pu;
    ht += mht;
    tva += mht * (t / 100);
  }
  return { montant_ht: +ht.toFixed(3), montant_tva: +tva.toFixed(3), montant_ttc: +(ht + tva).toFixed(3) };
};

// ─── GET /api/avoirs ──────────────────────────────────────────────
export const getAvoirs = async (req, res) => {
  try {
    const { id_client, statut, type_avoir, date_debut, date_fin, search } = req.query;
    const params = [];
    const where = [];

    if (id_client)  { params.push(id_client);  where.push(`a.id_client = $${params.length}`); }
    if (statut)     { params.push(statut);     where.push(`a.statut = $${params.length}`); }
    if (type_avoir) { params.push(type_avoir); where.push(`a.type_avoir = $${params.length}`); }
    if (date_debut) { params.push(date_debut); where.push(`a.date_avoir >= $${params.length}`); }
    if (date_fin)   { params.push(date_fin);   where.push(`a.date_avoir <= $${params.length}`); }
    if (search) {
      params.push(`%${search}%`);
      where.push(`(a.numero_avoir ILIKE $${params.length} OR a.reference_facture ILIKE $${params.length} OR c.raison_sociale ILIKE $${params.length})`);
    }

    const sql = `
      SELECT a.*,
             c.raison_sociale AS client_raison_sociale,
             c.ville          AS client_ville,
             c.adresse        AS client_adresse
      FROM avoirs a
      LEFT JOIN clients c ON a.id_client = c.id_client
      ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
      ORDER BY a.date_avoir DESC NULLS LAST, a.id_avoir DESC
    `;
    const r = await pool.query(sql, params);
    return sendSuccess(res, { avoirs: r.rows, total: r.rows.length });
  } catch (error) {
    return handleError(res, error, 'getAvoirs');
  }
};

// ─── GET /api/avoirs/stats/global ─────────────────────────────────
export const getStatsGlobal = async (req, res) => {
  try {
    const r = await pool.query(`
      SELECT
        COUNT(*)::int                                                     AS total,
        COUNT(*) FILTER (WHERE statut = 'brouillon')::int                 AS brouillons,
        COUNT(*) FILTER (WHERE statut = 'valide')::int                    AS valides,
        COUNT(*) FILTER (WHERE statut = 'applique')::int                  AS appliques,
        COALESCE(SUM(montant_ttc)     FILTER (WHERE statut <> 'annule'), 0)::numeric AS montant_total,
        COALESCE(SUM(montant_restant) FILTER (WHERE statut <> 'annule'), 0)::numeric AS montant_restant_total
      FROM avoirs
    `);
    return sendSuccess(res, r.rows[0]);
  } catch (error) {
    return handleError(res, error, 'getStatsGlobal');
  }
};

// ─── GET /api/avoirs/:id ──────────────────────────────────────────
export const getAvoirById = async (req, res) => {
  try {
    const { id } = req.params;
    const head = await pool.query(`
      SELECT a.*,
             c.raison_sociale AS client_raison_sociale,
             c.adresse        AS client_adresse,
             c.ville          AS client_ville,
             f.numero_facture AS facture_numero,
             f.date_facture   AS facture_date
      FROM avoirs a
      LEFT JOIN clients  c ON a.id_client  = c.id_client
      LEFT JOIN factures f ON a.id_facture = f.id_facture
      WHERE a.id_avoir = $1
    `, [id]);
    if (!head.rows[0]) return sendError(res, 'Avoir introuvable', 404);

    const lignes = await pool.query(
      `SELECT la.*, ar.designation AS article_designation
       FROM lignes_avoir la
       LEFT JOIN articles ar ON la.id_article = ar.id_article
       WHERE la.id_avoir = $1
       ORDER BY la.ordre NULLS LAST, la.id_ligne`,
      [id]
    );
    return sendSuccess(res, { ...head.rows[0], lignes: lignes.rows });
  } catch (error) {
    return handleError(res, error, 'getAvoirById');
  }
};

// ─── POST /api/avoirs ─────────────────────────────────────────────
export const createAvoir = async (req, res) => {
  const client = await pool.connect();
  try {
    const userId = authorId(req);
    const {
      id_client, id_facture = null, motif = null, type_avoir = 'commercial',
      date_avoir = null, reference_facture = null, notes = null, lignes = [],
    } = req.body || {};

    if (!id_client) return sendError(res, 'id_client requis', 400);

    await client.query('BEGIN');
    const numero_avoir = await generateNumeroAvoir(client);
    const { montant_ht, montant_tva, montant_ttc } = computeMontants(lignes);

    const ins = await client.query(
      `INSERT INTO avoirs
         (numero_avoir, id_facture, id_client, date_avoir, statut, motif, type_avoir,
          montant_ht, montant_tva, montant_ttc, montant_applique, montant_restant,
          reference_facture, notes, created_by)
       VALUES ($1,$2,$3,COALESCE($4, CURRENT_DATE),'brouillon',$5,$6,$7,$8,$9,0,$9,$10,$11,$12)
       RETURNING *`,
      [numero_avoir, id_facture, id_client, date_avoir, motif, type_avoir,
       montant_ht, montant_tva, montant_ttc, reference_facture, notes, userId]
    );
    const avoir = ins.rows[0];

    for (let i = 0; i < lignes.length; i++) {
      const l = lignes[i];
      const q = Number(l.quantite) || 0;
      const pu = Number(l.prix_unitaire_ht) || 0;
      const tv = Number(l.taux_tva) || 0;
      const mht = q * pu;
      const mtva = mht * (tv / 100);
      await client.query(
        `INSERT INTO lignes_avoir
           (id_avoir, id_ligne_facture, id_article, designation, quantite,
            prix_unitaire_ht, taux_tva, montant_ht, montant_tva, montant_ttc, ordre, created_by)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
        [avoir.id_avoir, l.id_ligne_facture || null, l.id_article || null,
         l.designation || '', q, pu, tv, mht, mtva, mht + mtva, i + 1, userId]
      );
    }

    await client.query('COMMIT');
    emit('avoir:updated', { id_avoir: avoir.id_avoir });
    return sendSuccess(res, avoir, 'Avoir créé', 201);
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    return handleError(res, error, 'createAvoir');
  } finally {
    client.release();
  }
};

// ─── PUT /api/avoirs/:id ──────────────────────────────────────────
export const updateAvoir = async (req, res) => {
  const client = await pool.connect();
  try {
    const userId = authorId(req);
    const { id } = req.params;
    const {
      id_client, id_facture, date_avoir, motif, type_avoir,
      reference_facture, notes, statut, lignes,
    } = req.body || {};

    await client.query('BEGIN');

    let montants = null;
    if (Array.isArray(lignes)) {
      montants = computeMontants(lignes);
      await client.query(`DELETE FROM lignes_avoir WHERE id_avoir = $1`, [id]);
      for (let i = 0; i < lignes.length; i++) {
        const l = lignes[i];
        const q = Number(l.quantite) || 0;
        const pu = Number(l.prix_unitaire_ht) || 0;
        const tv = Number(l.taux_tva) || 0;
        const mht = q * pu;
        const mtva = mht * (tv / 100);
        await client.query(
          `INSERT INTO lignes_avoir
             (id_avoir, id_ligne_facture, id_article, designation, quantite,
              prix_unitaire_ht, taux_tva, montant_ht, montant_tva, montant_ttc, ordre, created_by)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
          [id, l.id_ligne_facture || null, l.id_article || null, l.designation || '',
           q, pu, tv, mht, mtva, mht + mtva, i + 1, userId]
        );
      }
    }

    const r = await client.query(
      `UPDATE avoirs SET
         id_client         = COALESCE($2, id_client),
         id_facture        = COALESCE($3, id_facture),
         date_avoir        = COALESCE($4, date_avoir),
         motif             = COALESCE($5, motif),
         type_avoir        = COALESCE($6, type_avoir),
         reference_facture = COALESCE($7, reference_facture),
         notes             = COALESCE($8, notes),
         statut            = COALESCE($9, statut),
         montant_ht        = COALESCE($10, montant_ht),
         montant_tva       = COALESCE($11, montant_tva),
         montant_ttc       = COALESCE($12, montant_ttc),
         montant_restant   = CASE WHEN $12::numeric IS NOT NULL
                                  THEN $12::numeric - COALESCE(montant_applique, 0)
                                  ELSE montant_restant END,
         updated_at = CURRENT_TIMESTAMP, updated_by = $13
       WHERE id_avoir = $1
       RETURNING *`,
      [id, id_client ?? null, id_facture ?? null, date_avoir ?? null,
       motif ?? null, type_avoir ?? null, reference_facture ?? null,
       notes ?? null, statut ?? null,
       montants?.montant_ht ?? null, montants?.montant_tva ?? null, montants?.montant_ttc ?? null,
       userId]
    );

    if (!r.rows[0]) {
      await client.query('ROLLBACK');
      return sendError(res, 'Avoir introuvable', 404);
    }
    await client.query('COMMIT');
    emit('avoir:updated', { id_avoir: r.rows[0].id_avoir });
    return sendSuccess(res, r.rows[0], 'Avoir mis à jour');
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    return handleError(res, error, 'updateAvoir');
  } finally {
    client.release();
  }
};

// ─── PUT /api/avoirs/:id/valider ──────────────────────────────────
export const validerAvoir = async (req, res) => {
  try {
    const userId = authorId(req);
    const r = await pool.query(
      `UPDATE avoirs
          SET statut = 'valide', updated_at = CURRENT_TIMESTAMP, updated_by = $2
        WHERE id_avoir = $1 AND statut = 'brouillon'
        RETURNING *`,
      [req.params.id, userId]
    );
    if (!r.rows[0]) return sendError(res, 'Transition vers "valide" refusée', 400);
    emit('avoir:updated', { id_avoir: r.rows[0].id_avoir });
    return sendSuccess(res, r.rows[0], 'Avoir validé');
  } catch (error) {
    return handleError(res, error, 'validerAvoir');
  }
};

// ─── PUT /api/avoirs/:id/appliquer ────────────────────────────────
export const appliquerAvoir = async (req, res) => {
  const client = await pool.connect();
  try {
    const userId = authorId(req);
    const { id } = req.params;
    const { montant, id_facture_destination = null } = req.body || {};
    const amount = Number(montant);
    if (!amount || amount <= 0) return sendError(res, 'Montant invalide', 400);

    await client.query('BEGIN');
    const cur = await client.query(
      `SELECT id_avoir, statut, montant_ttc, COALESCE(montant_applique, 0) AS montant_applique,
              COALESCE(montant_restant, montant_ttc) AS montant_restant
         FROM avoirs WHERE id_avoir = $1 FOR UPDATE`,
      [id]
    );
    if (!cur.rows[0]) {
      await client.query('ROLLBACK');
      return sendError(res, 'Avoir introuvable', 404);
    }
    const a = cur.rows[0];
    if (a.statut !== 'valide' && a.statut !== 'applique') {
      await client.query('ROLLBACK');
      return sendError(res, `Avoir non applicable (statut=${a.statut})`, 400);
    }
    if (amount > Number(a.montant_restant)) {
      await client.query('ROLLBACK');
      return sendError(res, `Montant supérieur au restant (${a.montant_restant})`, 400);
    }

    const newApplique = Number(a.montant_applique) + amount;
    const newRestant  = Number(a.montant_restant) - amount;
    const newStatut   = newRestant <= 0.0001 ? 'applique' : a.statut;

    const upd = await client.query(
      `UPDATE avoirs SET
         montant_applique = $2,
         montant_restant  = $3,
         statut           = $4,
         reference_facture = COALESCE($5, reference_facture),
         updated_at = CURRENT_TIMESTAMP, updated_by = $6
       WHERE id_avoir = $1
       RETURNING *`,
      [id, newApplique, newRestant, newStatut, id_facture_destination, userId]
    );

    await client.query('COMMIT');
    emit('avoir:updated', { id_avoir: upd.rows[0].id_avoir });
    return sendSuccess(res, upd.rows[0], `Avoir appliqué (${amount})`);
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    return handleError(res, error, 'appliquerAvoir');
  } finally {
    client.release();
  }
};

// ─── PUT /api/avoirs/:id/annuler ──────────────────────────────────
export const annulerAvoir = async (req, res) => {
  try {
    const userId = authorId(req);
    const r = await pool.query(
      `UPDATE avoirs
          SET statut = 'annule', updated_at = CURRENT_TIMESTAMP, updated_by = $2
        WHERE id_avoir = $1
        RETURNING *`,
      [req.params.id, userId]
    );
    if (!r.rows[0]) return sendError(res, 'Avoir introuvable', 404);
    emit('avoir:updated', { id_avoir: r.rows[0].id_avoir });
    return sendSuccess(res, r.rows[0], 'Avoir annulé');
  } catch (error) {
    return handleError(res, error, 'annulerAvoir');
  }
};

// ─── DELETE /api/avoirs/:id ───────────────────────────────────────
export const deleteAvoir = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    await client.query('BEGIN');
    await client.query(`DELETE FROM lignes_avoir WHERE id_avoir = $1`, [id]);
    const r = await client.query(
      `DELETE FROM avoirs WHERE id_avoir = $1 AND statut = 'brouillon' RETURNING id_avoir`,
      [id]
    );
    if (!r.rows[0]) {
      await client.query('ROLLBACK');
      return sendError(res, 'Avoir non supprimable (statut ≠ brouillon)', 400);
    }
    await client.query('COMMIT');
    emit('avoir:updated', { id_avoir: parseInt(id, 10) });
    return sendSuccess(res, { id: r.rows[0].id_avoir }, 'Avoir supprimé');
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    return handleError(res, error, 'deleteAvoir');
  } finally {
    client.release();
  }
};
