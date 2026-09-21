/**
 * Contrôleur Traçabilité Lots — La Plume Artisanale
 *
 * Agrège les vraies tables métier :
 *   - lots_coupe (coupe : id_suivi → suivi_fabrication → id_of)
 *   - lots        (générique : id_article, date_peremption)
 *   - lots_mp     (matières premières)
 *   - suivi_fabrication (id_suivi → id_of + id_machine + id_operateur)
 *   - ordres_fabrication (id_of → id_article)
 *
 * Endpoints :
 *   GET  /api/tracabilite-lots                          — Liste tous les lots (coupe + génériques)
 *   GET  /api/tracabilite-lots/stats/global             — Stats
 *   GET  /api/tracabilite-lots/qr/:qr_code              — Recherche par QR
 *   GET  /api/tracabilite-lots/coupe                    — Lots de coupe uniquement
 *   GET  /api/tracabilite-lots/coupe/:id                — Détail lot coupe + chaîne amont
 *   POST /api/tracabilite-lots/coupe                    — Créer un lot de coupe
 *   PUT  /api/tracabilite-lots/coupe/:id                — MAJ lot coupe
 *   PUT  /api/tracabilite-lots/coupe/:id/statut         — Change statut
 *   DELETE /api/tracabilite-lots/coupe/:id
 *   GET  /api/tracabilite-lots/of/:id_of                — Tous les lots d'un OF (traçabilité aval)
 *   GET  /api/tracabilite-lots/:id_lot/chaine           — Chaîne complète amont/aval (générique)
 */

import { pool } from '../../../src/utils/db.js';
import { sendSuccess, sendError, handleError } from '../../../src/utils/error.helper.js';

let _io = null;
const getIo = async () => {
  if (_io) return _io;
  try { _io = (await import('../../../src/server.js')).io; } catch {}
  return _io;
};

const authorId = (req) => req.user?.id || req.user?.userId || null;

// ─── GET /api/tracabilite-lots ────────────────────────────────────
export const getTracabiliteLots = async (req, res) => {
  try {
    const { search, statut, id_of, qualite, date_debut, date_fin, limit = 200 } = req.query;
    const params = [];
    const where = [];

    if (search)     { params.push(`%${search}%`); where.push(`(lc.numero_lot ILIKE $${params.length} OR lc.qr_code_lot ILIKE $${params.length} OR lc.emplacement ILIKE $${params.length})`); }
    if (statut)     { params.push(statut);        where.push(`lc.statut = $${params.length}`); }
    if (qualite)    { params.push(qualite);       where.push(`lc.qualite = $${params.length}`); }
    if (date_debut) { params.push(date_debut);    where.push(`lc.date_coupe >= $${params.length}`); }
    if (date_fin)   { params.push(date_fin);      where.push(`lc.date_coupe <= $${params.length}`); }
    if (id_of)      { params.push(id_of);         where.push(`sf.id_of = $${params.length}`); }

    params.push(parseInt(limit, 10) || 200);

    const sql = `
      SELECT
        lc.id_lot_coupe                                                  AS id,
        'coupe'                                                          AS type_lot,
        lc.numero_lot, lc.qr_code_lot, lc.date_coupe,
        lc.nombre_pieces, lc.metrage_total, lc.qualite, lc.statut,
        lc.emplacement, lc.observations, lc.coupe_par,
        sf.id_of, sf.id_machine, sf.id_operateur,
        of_.numero_of, of_.id_article,
        a.designation                                                    AS article_designation,
        a.code_article,
        e.prenom || ' ' || e.nom                                         AS operateur_nom,
        m.numero_machine
      FROM lots_coupe lc
      LEFT JOIN suivi_fabrication sf   ON lc.id_suivi = sf.id_suivi
      LEFT JOIN ordres_fabrication of_ ON sf.id_of = of_.id_of
      LEFT JOIN articles_catalogue a   ON of_.id_article = a.id_article
      LEFT JOIN equipe_fabrication e   ON lc.coupe_par = e.id_operateur
      LEFT JOIN machines m             ON sf.id_machine = m.id_machine
      ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
      ORDER BY lc.date_coupe DESC NULLS LAST, lc.id_lot_coupe DESC
      LIMIT $${params.length}
    `;
    const r = await pool.query(sql, params);
    return sendSuccess(res, { items: r.rows, total: r.rows.length });
  } catch (error) {
    return handleError(res, error, 'getTracabiliteLots');
  }
};

// ─── GET /api/tracabilite-lots/stats/global ───────────────────────
export const getStats = async (req, res) => {
  try {
    const r = await pool.query(`
      SELECT
        COUNT(*)::int                                                             AS total_lots_coupe,
        COUNT(*) FILTER (WHERE statut = 'disponible')::int                        AS disponibles,
        COUNT(*) FILTER (WHERE statut = 'reserve')::int                           AS reserves,
        COUNT(*) FILTER (WHERE statut = 'expedié' OR statut = 'expedie')::int    AS expedies,
        COUNT(*) FILTER (WHERE qualite = '1er_choix' OR qualite = '1er choix')::int AS premier_choix,
        COUNT(*) FILTER (WHERE qualite = '2eme_choix' OR qualite = '2eme choix')::int AS deuxieme_choix,
        COALESCE(SUM(nombre_pieces), 0)::int                                      AS total_pieces,
        COALESCE(SUM(metrage_total), 0)::numeric                                  AS total_metrage
      FROM lots_coupe
    `);

    // Lots génériques (non-coupe) — best effort
    let lotsGeneriques = 0;
    try {
      const r2 = await pool.query(`SELECT COUNT(*)::int AS c FROM lots`);
      lotsGeneriques = r2.rows[0].c;
    } catch {}

    return sendSuccess(res, { ...r.rows[0], lots_generiques: lotsGeneriques });
  } catch (error) {
    return handleError(res, error, 'getStats');
  }
};

// ─── GET /api/tracabilite-lots/qr/:qr_code ────────────────────────
export const getByQrCode = async (req, res) => {
  try {
    const { qr_code } = req.params;
    const r = await pool.query(`
      SELECT
        lc.id_lot_coupe AS id, 'coupe' AS type_lot,
        lc.numero_lot, lc.qr_code_lot, lc.date_coupe,
        lc.nombre_pieces, lc.metrage_total, lc.qualite, lc.statut,
        lc.emplacement, lc.observations, lc.coupe_par,
        sf.id_of, of_.numero_of, of_.id_article,
        a.designation AS article_designation, a.code_article
      FROM lots_coupe lc
      LEFT JOIN suivi_fabrication sf   ON lc.id_suivi = sf.id_suivi
      LEFT JOIN ordres_fabrication of_ ON sf.id_of = of_.id_of
      LEFT JOIN articles_catalogue a   ON of_.id_article = a.id_article
      WHERE lc.qr_code_lot = $1
      LIMIT 1
    `, [qr_code]);
    if (!r.rows[0]) return sendError(res, 'QR code introuvable', 404);
    return sendSuccess(res, r.rows[0]);
  } catch (error) {
    return handleError(res, error, 'getByQrCode');
  }
};

// ─── GET /api/tracabilite-lots/coupe ──────────────────────────────
export const getLotsCoupe = getTracabiliteLots;

// ─── GET /api/tracabilite-lots/coupe/:id ──────────────────────────
export const getLotCoupe = async (req, res) => {
  try {
    const r = await pool.query(`
      SELECT
        lc.*,
        sf.numero_suivi, sf.id_of, sf.id_machine, sf.id_operateur AS operateur_suivi,
        sf.date_debut AS suivi_date_debut, sf.date_fin AS suivi_date_fin,
        of_.numero_of, of_.id_article, of_.quantite_a_produire,
        a.designation AS article_designation, a.code_article,
        m.numero_machine, m.marque AS machine_marque,
        e.prenom || ' ' || e.nom AS operateur_coupe_nom
      FROM lots_coupe lc
      LEFT JOIN suivi_fabrication sf   ON lc.id_suivi = sf.id_suivi
      LEFT JOIN ordres_fabrication of_ ON sf.id_of = of_.id_of
      LEFT JOIN articles_catalogue a   ON of_.id_article = a.id_article
      LEFT JOIN machines m             ON sf.id_machine = m.id_machine
      LEFT JOIN equipe_fabrication e   ON lc.coupe_par = e.id_operateur
      WHERE lc.id_lot_coupe = $1
      LIMIT 1
    `, [req.params.id]);
    if (!r.rows[0]) return sendError(res, 'Lot introuvable', 404);
    return sendSuccess(res, r.rows[0]);
  } catch (error) {
    return handleError(res, error, 'getLotCoupe');
  }
};

// ─── POST /api/tracabilite-lots/coupe ─────────────────────────────
export const createLotCoupe = async (req, res) => {
  try {
    const userId = authorId(req);
    const { id_suivi, numero_lot, date_coupe, nombre_pieces, metrage_total, qualite, coupe_par, emplacement, observations } = req.body || {};

    if (!id_suivi) return sendError(res, 'id_suivi requis', 400);

    // Auto-generate numero_lot if not provided
    let finalNumero = numero_lot;
    if (!finalNumero) {
      const c = await pool.query(`SELECT COUNT(*) + 1 AS n FROM lots_coupe WHERE DATE(date_coupe) = CURRENT_DATE`);
      const seq = String(c.rows[0].n).padStart(3, '0');
      const ymd = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      finalNumero = `LC-${ymd}-${seq}`;
    }

    // Generate QR code (numero_lot + timestamp hash)
    const qrCode = `${finalNumero}-${Date.now().toString(36)}`;

    const r = await pool.query(`
      INSERT INTO lots_coupe
        (numero_lot, id_suivi, date_coupe, nombre_pieces, metrage_total, qualite,
         coupe_par, qr_code_lot, emplacement, statut, observations, created_by)
      VALUES
        ($1, $2, COALESCE($3, CURRENT_TIMESTAMP), $4, $5, $6, $7, $8, $9, 'disponible', $10, $11)
      RETURNING *
    `, [finalNumero, id_suivi, date_coupe || null, nombre_pieces || 0, metrage_total || 0,
        qualite || '1er_choix', coupe_par || userId, qrCode, emplacement || null,
        observations || null, userId]);

    try {
      const io = await getIo();
      if (io) io.emit('lot:created', r.rows[0]);
    } catch {}

    return sendSuccess(res, r.rows[0], 'Lot créé', 201);
  } catch (error) {
    return handleError(res, error, 'createLotCoupe');
  }
};

// ─── PUT /api/tracabilite-lots/coupe/:id ──────────────────────────
export const updateLotCoupe = async (req, res) => {
  try {
    const userId = authorId(req);
    const { nombre_pieces, metrage_total, qualite, emplacement, observations, statut } = req.body || {};
    const r = await pool.query(`
      UPDATE lots_coupe
      SET nombre_pieces = COALESCE($2, nombre_pieces),
          metrage_total = COALESCE($3, metrage_total),
          qualite       = COALESCE($4, qualite),
          emplacement   = COALESCE($5, emplacement),
          observations  = COALESCE($6, observations),
          statut        = COALESCE($7, statut),
          updated_by    = $8
      WHERE id_lot_coupe = $1
      RETURNING *
    `, [req.params.id, nombre_pieces ?? null, metrage_total ?? null, qualite ?? null,
        emplacement ?? null, observations ?? null, statut ?? null, userId]);
    if (!r.rows[0]) return sendError(res, 'Lot introuvable', 404);

    try {
      const io = await getIo();
      if (io) io.emit('lot:updated', r.rows[0]);
    } catch {}

    return sendSuccess(res, r.rows[0], 'Lot mis à jour');
  } catch (error) {
    return handleError(res, error, 'updateLotCoupe');
  }
};

// ─── PUT /api/tracabilite-lots/coupe/:id/statut ───────────────────
export const changeStatutLot = async (req, res) => {
  try {
    const userId = authorId(req);
    const { statut } = req.body || {};
    if (!statut) return sendError(res, 'statut requis', 400);
    const allowed = ['disponible', 'reserve', 'expedie', 'expedié', 'consomme', 'consommé', 'rebut'];
    if (!allowed.includes(String(statut).toLowerCase())) {
      return sendError(res, `Statut invalide. Autorisés: ${allowed.join(', ')}`, 400);
    }

    const r = await pool.query(`
      UPDATE lots_coupe SET statut = $2, updated_by = $3
      WHERE id_lot_coupe = $1 RETURNING id_lot_coupe AS id, numero_lot, statut
    `, [req.params.id, statut, userId]);
    if (!r.rows[0]) return sendError(res, 'Lot introuvable', 404);

    try {
      const io = await getIo();
      if (io) io.emit('lot:status', r.rows[0]);
    } catch {}

    return sendSuccess(res, r.rows[0], 'Statut modifié');
  } catch (error) {
    return handleError(res, error, 'changeStatutLot');
  }
};

// ─── DELETE /api/tracabilite-lots/coupe/:id ───────────────────────
export const deleteLotCoupe = async (req, res) => {
  try {
    const r = await pool.query(
      `DELETE FROM lots_coupe WHERE id_lot_coupe = $1 RETURNING id_lot_coupe`,
      [req.params.id]
    );
    if (!r.rows[0]) return sendError(res, 'Lot introuvable', 404);
    return sendSuccess(res, { id: r.rows[0].id_lot_coupe }, 'Lot supprimé');
  } catch (error) {
    return handleError(res, error, 'deleteLotCoupe');
  }
};

// ─── GET /api/tracabilite-lots/of/:id_of ──────────────────────────
export const getLotsForOf = async (req, res) => {
  try {
    const { id_of } = req.params;
    const r = await pool.query(`
      SELECT
        lc.id_lot_coupe AS id, lc.numero_lot, lc.qr_code_lot, lc.date_coupe,
        lc.nombre_pieces, lc.metrage_total, lc.qualite, lc.statut, lc.emplacement,
        sf.numero_suivi, sf.id_machine, sf.id_operateur,
        m.numero_machine,
        e.prenom || ' ' || e.nom AS operateur_nom
      FROM lots_coupe lc
      JOIN suivi_fabrication sf ON lc.id_suivi = sf.id_suivi
      LEFT JOIN machines m ON sf.id_machine = m.id_machine
      LEFT JOIN equipe_fabrication e ON lc.coupe_par = e.id_operateur
      WHERE sf.id_of = $1
      ORDER BY lc.date_coupe DESC
    `, [id_of]);
    return sendSuccess(res, { items: r.rows, total: r.rows.length });
  } catch (error) {
    return handleError(res, error, 'getLotsForOf');
  }
};

// ─── GET /api/tracabilite-lots/:id_lot/chaine ─────────────────────
// Chaîne complète : lot → suivi → OF → article → commande (aval) et
//                          → machine + opérateur + MP consommées (amont)
export const getChaineTracabilite = async (req, res) => {
  try {
    const { id_lot } = req.params;

    // 1) Le lot lui-même
    const lotR = await pool.query(`
      SELECT lc.*, sf.id_of, sf.id_machine, sf.id_operateur AS suivi_operateur
      FROM lots_coupe lc
      LEFT JOIN suivi_fabrication sf ON lc.id_suivi = sf.id_suivi
      WHERE lc.id_lot_coupe = $1 LIMIT 1
    `, [id_lot]);
    if (!lotR.rows[0]) return sendError(res, 'Lot introuvable', 404);
    const lot = lotR.rows[0];

    // 2) OF associé + article
    let of_ = null;
    if (lot.id_of) {
      const ofR = await pool.query(`
        SELECT of_.*, a.designation AS article_designation, a.code_article
        FROM ordres_fabrication of_
        LEFT JOIN articles_catalogue a ON of_.id_article = a.id_article
        WHERE of_.id_of = $1
      `, [lot.id_of]);
      of_ = ofR.rows[0] || null;
    }

    // 3) Suivi + machine + opérateur
    let suivi = null;
    if (lot.id_suivi) {
      const sR = await pool.query(`
        SELECT sf.*, m.numero_machine, m.marque AS machine_marque,
               e.prenom || ' ' || e.nom AS operateur_nom, e.matricule
        FROM suivi_fabrication sf
        LEFT JOIN machines m           ON sf.id_machine = m.id_machine
        LEFT JOIN equipe_fabrication e ON sf.id_operateur = e.id_operateur
        WHERE sf.id_suivi = $1
      `, [lot.id_suivi]);
      suivi = sR.rows[0] || null;
    }

    // 4) MP consommées pour cet OF (best-effort)
    let mp_consommees = [];
    try {
      const mR = await pool.query(`
        SELECT mv.id_mouvement, mv.quantite, mv.date_mouvement, mv.reference_document, mv.type_mouvement,
               mp.code_mp, mp.designation, mp.couleur
        FROM mouvements_mp mv
        LEFT JOIN stock_matieres_premieres s ON mv.id_stock_mp = s.id_stock_mp
        LEFT JOIN matieres_premieres mp ON s.id_mp = mp.id_mp
        WHERE mv.reference_document LIKE '%' || $1::text || '%'
           OR mv.reference_document = $2
        ORDER BY mv.date_mouvement DESC
        LIMIT 100
      `, [of_?.numero_of || '', of_?.id_of || null]);
      mp_consommees = mR.rows;
    } catch {}

    return sendSuccess(res, {
      lot,
      of: of_,
      suivi,
      mp_consommees,
    });
  } catch (error) {
    return handleError(res, error, 'getChaineTracabilite');
  }
};
