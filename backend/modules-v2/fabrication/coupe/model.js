import { getPool } from '../../../src/config/database.js';

export async function listSessions({ id_of, id_operateur, statut, limit = 50, offset = 0 } = {}) {
  const p = []; const c = [];
  if (id_of)        { p.push(id_of);        c.push(`id_of = $${p.length}`); }
  if (id_operateur) { p.push(id_operateur); c.push(`id_operateur = $${p.length}`); }
  if (statut)       { p.push(statut);       c.push(`statut = $${p.length}`); }
  const where = c.length ? `WHERE ${c.join(' AND ')}` : '';
  p.push(limit, offset);
  const { rows } = await getPool().query(
    `SELECT * FROM sessions_coupe ${where} ORDER BY date_debut DESC LIMIT $${p.length - 1} OFFSET $${p.length}`, p);
  return rows;
}
export async function findSession(id) {
  const { rows } = await getPool().query(`SELECT * FROM sessions_coupe WHERE id_session_coupe = $1`, [id]);
  return rows[0] ?? null;
}
export async function insertSession(s) {
  const cols = Object.keys(s), vals = cols.map((_, i) => `$${i + 1}`).join(', ');
  const { rows } = await getPool().query(
    `INSERT INTO sessions_coupe (${cols.join(', ')}) VALUES (${vals}) RETURNING *`, cols.map(k => s[k]));
  return rows[0];
}
export async function updateSession(id, patch) {
  const cols = Object.keys(patch); if (!cols.length) return findSession(id);
  const sets = cols.map((c, i) => `${c} = $${i + 1}`).join(', ');
  const { rows } = await getPool().query(
    `UPDATE sessions_coupe SET ${sets}, updated_at = NOW() WHERE id_session_coupe = $${cols.length + 1} RETURNING *`,
    [...cols.map(c => patch[c]), id]);
  return rows[0] ?? null;
}

// Journal de pièces
export async function insertPiece(p) {
  const cols = Object.keys(p), vals = cols.map((_, i) => `$${i + 1}`).join(', ');
  const { rows } = await getPool().query(
    `INSERT INTO journal_pieces (${cols.join(', ')}) VALUES (${vals}) RETURNING *`, cols.map(k => p[k]));
  return rows[0];
}
export async function listPieces({ id_of, id_session_coupe, categorie } = {}) {
  const p = []; const c = [];
  if (id_of)            { p.push(id_of);            c.push(`id_of = $${p.length}`); }
  if (id_session_coupe) { p.push(id_session_coupe); c.push(`id_session_coupe = $${p.length}`); }
  if (categorie)        { p.push(categorie);        c.push(`categorie = $${p.length}`); }
  const where = c.length ? `WHERE ${c.join(' AND ')}` : '';
  const { rows } = await getPool().query(
    `SELECT * FROM journal_pieces ${where} ORDER BY date_saisie DESC`, p);
  return rows;
}

export async function sommesParCategorie(id_of) {
  const { rows } = await getPool().query(`
    SELECT categorie, SUM(quantite) AS total
    FROM journal_pieces WHERE id_of = $1 GROUP BY categorie`, [id_of]);
  return rows;
}

// Décompte auto stock PF : on lance une entrée fabrication pour qte_1er_choix + approuve
export async function decompteStockPF({ id_of, id_article, quantite, id_lot, id_utilisateur }) {
  const { rows } = await getPool().query(`
    INSERT INTO mouvements_stock (
      type_mouvement, id_of, id_article, id_lot, quantite, sens, id_utilisateur, horodatage
    ) VALUES ('entree_fabrication', $1, $2, $3, $4, 'entree', $5, NOW())
    RETURNING *`,
    [id_of, id_article, id_lot ?? null, quantite, id_utilisateur ?? null]);
  return rows[0] ?? null;
}
