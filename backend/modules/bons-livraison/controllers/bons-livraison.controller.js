/**
 * Contrôleur BonsLivraison — Delivery notes management
 *
 * Endpoints:
 *   GET    /api/bons-livraison                 — List (filters)
 *   GET    /api/bons-livraison/stats/global    — Statistics
 *   GET    /api/bons-livraison/:id             — Detail with client + lignes
 *   POST   /api/bons-livraison                 — Create (auto numero_bl)
 *   PUT    /api/bons-livraison/:id             — Update
 *   PUT    /api/bons-livraison/:id/valider     — statut='valide'
 *   PUT    /api/bons-livraison/:id/livrer      — statut='livre'
 *   PUT    /api/bons-livraison/:id/annuler     — statut='annule'
 *   DELETE /api/bons-livraison/:id             — Delete (brouillon only)
 */

import { pool } from '../../../src/utils/db.js';
import { sendSuccess, sendError, handleError } from '../../../src/utils/error.helper.js';

// Lazy import io to avoid cycles
let _io = null;
const getIo = async () => {
  if (_io) return _io;
  try {
    const m = await import('../../../src/server.js');
    _io = m.io;
  } catch {}
  return _io;
};
const emit = async (event, payload) => {
  try {
    const io = await getIo();
    if (io) io.emit(event, payload);
  } catch {}
};

const authorId = (req) => req.user?.id || req.user?.userId || null;

// Generate BL-YYYYMM-XXXX
const generateNumeroBL = async (client) => {
  const r = await client.query(
    `SELECT COUNT(*)::int + 1 AS n FROM bons_livraison
     WHERE date_trunc('month', COALESCE(created_at, CURRENT_TIMESTAMP)) = date_trunc('month', CURRENT_TIMESTAMP)`
  );
  const now = new Date();
  const yyyymm = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
  return `BL-${yyyymm}-${String(r.rows[0].n).padStart(4, '0')}`;
};

// Compute totals from lignes
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

// ─── GET /api/bons-livraison ──────────────────────────────────────
export const getBonsLivraison = async (req, res) => {
  try {
    const { id_client, statut, date_debut, date_fin, search } = req.query;
    const params = [];
    const where = [];

    if (id_client) { params.push(id_client); where.push(`bl.id_client = $${params.length}`); }
    if (statut)    { params.push(statut);    where.push(`bl.statut = $${params.length}`); }
    if (date_debut){ params.push(date_debut);where.push(`bl.date_livraison >= $${params.length}`); }
    if (date_fin)  { params.push(date_fin);  where.push(`bl.date_livraison <= $${params.length}`); }
    if (search) {
      params.push(`%${search}%`);
      where.push(`(bl.numero_bl ILIKE $${params.length} OR bl.numero_suivi ILIKE $${params.length} OR c.raison_sociale ILIKE $${params.length})`);
    }

    const sql = `
      SELECT bl.*,
             c.raison_sociale AS client_raison_sociale,
             c.ville          AS client_ville,
             c.adresse        AS client_adresse
      FROM bons_livraison bl
      LEFT JOIN clients c ON bl.id_client = c.id_client
      ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
      ORDER BY bl.date_livraison DESC NULLS LAST, bl.id_bl DESC
    `;
    const r = await pool.query(sql, params);
    return sendSuccess(res, { bons_livraison: r.rows, total: r.rows.length });
  } catch (error) {
    return handleError(res, error, 'getBonsLivraison');
  }
};

// ─── GET /api/bons-livraison/stats/global ─────────────────────────
export const getStatsGlobal = async (req, res) => {
  try {
    const r = await pool.query(`
      SELECT
        COUNT(*)::int                                                    AS total,
        COUNT(*) FILTER (WHERE statut = 'brouillon')::int                AS brouillons,
        COUNT(*) FILTER (WHERE statut = 'valide')::int                   AS valides,
        COUNT(*) FILTER (WHERE statut = 'livre')::int                    AS livres,
        COALESCE(SUM(montant_ht) FILTER (WHERE statut <> 'annule'), 0)::numeric AS ca_total_ht
      FROM bons_livraison
    `);
    return sendSuccess(res, r.rows[0]);
  } catch (error) {
    return handleError(res, error, 'getStatsGlobal');
  }
};

// ─── GET /api/bons-livraison/:id ──────────────────────────────────
export const getBonsLivraisonById = async (req, res) => {
  try {
    const { id } = req.params;
    const head = await pool.query(`
      SELECT bl.*,
             c.raison_sociale AS client_raison_sociale,
             c.adresse        AS client_adresse,
             c.ville          AS client_ville
      FROM bons_livraison bl
      LEFT JOIN clients c ON bl.id_client = c.id_client
      WHERE bl.id_bl = $1
    `, [id]);
    if (!head.rows[0]) return sendError(res, 'Bon de livraison introuvable', 404);

    const bl = head.rows[0];

    // Lignes: prefer lignes_facture via id_ligne_bl, else fallback to lignes_commande
    let lignes = [];
    try {
      const lf = await pool.query(
        `SELECT * FROM lignes_facture WHERE id_ligne_bl IN (SELECT id_ligne FROM lignes_facture WHERE id_ligne_bl IS NOT NULL) AND id_ligne_bl = $1 ORDER BY ordre NULLS LAST, id_ligne`,
        [id]
      );
      lignes = lf.rows;
    } catch {}
    if (lignes.length === 0 && bl.id_commande) {
      try {
        const lc = await pool.query(
          `SELECT * FROM lignes_commande WHERE id_commande = $1 ORDER BY ordre NULLS LAST, id_ligne`,
          [bl.id_commande]
        );
        lignes = lc.rows;
      } catch {}
    }

    return sendSuccess(res, { ...bl, lignes });
  } catch (error) {
    return handleError(res, error, 'getBonsLivraisonById');
  }
};

// ─── POST /api/bons-livraison ─────────────────────────────────────
export const createBonsLivraison = async (req, res) => {
  const client = await pool.connect();
  try {
    const userId = authorId(req);
    const {
      id_client, id_commande = null, date_livraison, transporteur = null,
      adresse_livraison = null, notes = null, lignes = [],
    } = req.body || {};

    if (!id_client) return sendError(res, 'id_client requis', 400);

    await client.query('BEGIN');
    const numero_bl = await generateNumeroBL(client);
    const { montant_ht, montant_tva, montant_ttc } = computeMontants(lignes);

    const ins = await client.query(
      `INSERT INTO bons_livraison
         (numero_bl, id_commande, id_client, date_livraison, statut, transporteur,
          adresse_livraison, notes, montant_ht, montant_tva, montant_ttc, created_by)
       VALUES ($1,$2,$3,COALESCE($4, CURRENT_DATE),'brouillon',$5,$6,$7,$8,$9,$10,$11)
       RETURNING *`,
      [numero_bl, id_commande, id_client, date_livraison || null, transporteur,
       adresse_livraison, notes, montant_ht, montant_tva, montant_ttc, userId]
    );
    const bl = ins.rows[0];

    // Insert lignes into lignes_facture linked via id_ligne_bl
    for (let i = 0; i < lignes.length; i++) {
      const l = lignes[i];
      const q = Number(l.quantite) || 0;
      const pu = Number(l.prix_unitaire_ht) || 0;
      const tv = Number(l.taux_tva) || 0;
      const mht = q * pu;
      const mtva = mht * (tv / 100);
      try {
        await client.query(
          `INSERT INTO lignes_facture
             (id_article, designation, quantite, prix_unitaire_ht, taux_tva,
              montant_ht, montant_tva, montant_ttc, ordre, id_ligne_bl, created_by)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
          [l.id_article || null, l.designation || '', q, pu, tv,
           mht, mtva, mht + mtva, i + 1, bl.id_bl, userId]
        );
      } catch (e) {
        // If lignes_facture insert fails (schema mismatch), continue — non-fatal
      }
    }

    await client.query('COMMIT');
    emit('bl:updated', { id_bl: bl.id_bl });
    return sendSuccess(res, bl, 'Bon de livraison créé', 201);
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    return handleError(res, error, 'createBonsLivraison');
  } finally {
    client.release();
  }
};

// ─── PUT /api/bons-livraison/:id ──────────────────────────────────
export const updateBonsLivraison = async (req, res) => {
  try {
    const userId = authorId(req);
    const { id } = req.params;
    const {
      id_client, id_commande, date_livraison, transporteur, numero_suivi,
      adresse_livraison, notes, montant_ht, montant_tva, montant_ttc, statut,
    } = req.body || {};

    const r = await pool.query(
      `UPDATE bons_livraison SET
         id_client         = COALESCE($2, id_client),
         id_commande       = COALESCE($3, id_commande),
         date_livraison    = COALESCE($4, date_livraison),
         transporteur      = COALESCE($5, transporteur),
         numero_suivi      = COALESCE($6, numero_suivi),
         adresse_livraison = COALESCE($7, adresse_livraison),
         notes             = COALESCE($8, notes),
         montant_ht        = COALESCE($9, montant_ht),
         montant_tva       = COALESCE($10, montant_tva),
         montant_ttc       = COALESCE($11, montant_ttc),
         statut            = COALESCE($12, statut),
         updated_at = CURRENT_TIMESTAMP, updated_by = $13
       WHERE id_bl = $1
       RETURNING *`,
      [id, id_client ?? null, id_commande ?? null, date_livraison ?? null,
       transporteur ?? null, numero_suivi ?? null, adresse_livraison ?? null,
       notes ?? null, montant_ht ?? null, montant_tva ?? null, montant_ttc ?? null,
       statut ?? null, userId]
    );
    if (!r.rows[0]) return sendError(res, 'Bon de livraison introuvable', 404);
    emit('bl:updated', { id_bl: r.rows[0].id_bl });
    return sendSuccess(res, r.rows[0], 'Bon de livraison mis à jour');
  } catch (error) {
    return handleError(res, error, 'updateBonsLivraison');
  }
};

// Generic status transition
const changeStatut = async (req, res, newStatut, label, allowedFrom) => {
  try {
    const userId = authorId(req);
    const { id } = req.params;
    const where = allowedFrom
      ? `id_bl = $1 AND statut = ANY($3::text[])`
      : `id_bl = $1`;
    const params = allowedFrom ? [id, newStatut, allowedFrom, userId] : [id, newStatut, userId];
    const sql = `
      UPDATE bons_livraison
         SET statut = $2, updated_at = CURRENT_TIMESTAMP, updated_by = $${params.length}
       WHERE ${where}
       RETURNING *`;
    const r = await pool.query(sql, params);
    if (!r.rows[0]) return sendError(res, `Transition vers "${newStatut}" refusée`, 400);
    emit('bl:updated', { id_bl: r.rows[0].id_bl });
    return sendSuccess(res, r.rows[0], label);
  } catch (error) {
    return handleError(res, error, `changeStatut:${newStatut}`);
  }
};

export const validerBL = (req, res) => changeStatut(req, res, 'valide', 'BL validé', ['brouillon']);
export const livrerBL  = (req, res) => changeStatut(req, res, 'livre',  'BL livré',  ['valide']);
export const annulerBL = (req, res) => changeStatut(req, res, 'annule', 'BL annulé', null);

// ─── DELETE /api/bons-livraison/:id ───────────────────────────────
export const deleteBonsLivraison = async (req, res) => {
  try {
    const { id } = req.params;
    const r = await pool.query(
      `DELETE FROM bons_livraison WHERE id_bl = $1 AND statut = 'brouillon' RETURNING id_bl`,
      [id]
    );
    if (!r.rows[0]) return sendError(res, 'Bon de livraison non supprimable (statut ≠ brouillon)', 400);
    emit('bl:updated', { id_bl: parseInt(id, 10) });
    return sendSuccess(res, { id: r.rows[0].id_bl }, 'Bon de livraison supprimé');
  } catch (error) {
    return handleError(res, error, 'deleteBonsLivraison');
  }
};
