/**
 * backend/modules-v2/_shared/societe-context.js
 *
 * Middleware multi-sociétés (§14quater.1 · Phase E1).
 *
 * Résout l'identifiant de société courante pour la requête HTTP depuis,
 * dans l'ordre :
 *   1. header `x-societe-id`         (sélecteur UserBar)
 *   2. `req.user.societe_courante`   (préférence stockée en base)
 *   3. `req.user.societe_id`         (claim JWT raf)
 *
 * Valeurs spéciales :
 *   - `ALL`  → vue consolidée (admin). `req.societeId = null`, `req.societeConsolide = true`.
 *   - absente → fallback LP (id=1) pour la back-compat historique.
 *
 * Expose :
 *   req.societeId          : number | null (null si consolidé)
 *   req.societeConsolide   : boolean
 *
 * Fournit également une fonction utilitaire `withSociete(sql, params, idSociete, column)`
 * pour injecter `AND <column> = $N` quand `idSociete` est défini.
 */

const DEFAULT_SOCIETE_ID = 1; // LP, cf. §14quater.1 et seed.

function parseHeaderValue(raw) {
  if (!raw) return null;
  const v = String(raw).trim();
  if (!v) return null;
  if (v.toUpperCase() === 'ALL') return 'ALL';
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/**
 * Middleware Express. À monter APRÈS `authenticate` dans les groupes
 * qui exigent un contexte société.
 */
export function societeContext(req, _res, next) {
  const headerVal = parseHeaderValue(req.headers['x-societe-id']);

  if (headerVal === 'ALL') {
    req.societeId = null;
    req.societeConsolide = true;
    return next();
  }

  if (typeof headerVal === 'number') {
    req.societeId = headerVal;
    req.societeConsolide = false;
    return next();
  }

  const fromUser =
    (req.user && (req.user.societe_courante || req.user.societe_id)) || null;
  const fromUserNum = Number.parseInt(fromUser, 10);

  req.societeId = Number.isFinite(fromUserNum) && fromUserNum > 0
    ? fromUserNum
    : DEFAULT_SOCIETE_ID;
  req.societeConsolide = false;
  return next();
}

/**
 * Variante non bloquante : rattache le contexte s'il existe sans
 * jamais échouer. Utile pour les routes publiques / mock-auth.
 */
export function optionalSocieteContext(req, _res, next) {
  try {
    return societeContext(req, _res, next);
  } catch {
    req.societeId = DEFAULT_SOCIETE_ID;
    req.societeConsolide = false;
    return next();
  }
}

/**
 * Helper SQL : ajoute `AND <column> = $N` à une requête quand
 * `idSociete` est défini (hors mode consolidé).
 *
 * Usage :
 *   const { where, params } = withSociete('WHERE 1=1', [], req.societeId);
 *   await pool.query(`SELECT * FROM factures ${where}`, params);
 */
export function withSociete(whereClause, params, idSociete, column = 'id_societe') {
  if (idSociete === null || idSociete === undefined) {
    return { where: whereClause, params };
  }
  const idx = params.length + 1;
  const sep = /where/i.test(whereClause) ? ' AND' : ' WHERE';
  return {
    where: `${whereClause}${sep} ${column} = $${idx}`,
    params: [...params, idSociete],
  };
}

export const SOCIETE_HEADER = 'x-societe-id';
export const SOCIETE_DEFAULT_ID = DEFAULT_SOCIETE_ID;
