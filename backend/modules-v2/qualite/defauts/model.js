import { getPool } from '../../../src/config/database.js';

export async function listTypes({ categorie, actif = true } = {}) {
  const p = []; const c = [];
  if (categorie)         { p.push(categorie);       c.push(`categorie = $${p.length}`); }
  if (actif !== undefined){ p.push(actif);          c.push(`actif = $${p.length}`); }
  const where = c.length ? `WHERE ${c.join(' AND ')}` : '';
  const { rows } = await getPool().query(`SELECT * FROM defauts_types ${where} ORDER BY categorie, libelle`, p);
  return rows;
}

export async function listSignales({ id_of, id_ctrl, id_machine, resolu, limit = 100, offset = 0 } = {}) {
  const p = []; const c = [];
  if (id_of)      { p.push(id_of);      c.push(`id_of = $${p.length}`); }
  if (id_ctrl)    { p.push(id_ctrl);    c.push(`id_ctrl = $${p.length}`); }
  if (id_machine) { p.push(id_machine); c.push(`id_machine = $${p.length}`); }
  if (resolu !== undefined) { p.push(!!resolu); c.push(`resolu = $${p.length}`); }
  const where = c.length ? `WHERE ${c.join(' AND ')}` : '';
  p.push(limit, offset);
  const { rows } = await getPool().query(
    `SELECT * FROM defauts_signales ${where} ORDER BY date_signalement DESC LIMIT $${p.length - 1} OFFSET $${p.length}`, p);
  return rows;
}

export async function insertSignale(s) {
  const cols = Object.keys(s), vals = cols.map((_, i) => `$${i + 1}`).join(', ');
  const { rows } = await getPool().query(
    `INSERT INTO defauts_signales (${cols.join(', ')}) VALUES (${vals}) RETURNING *`, cols.map(c => s[c]));
  return rows[0];
}

export async function resoudre(id) {
  const { rows } = await getPool().query(
    `UPDATE defauts_signales SET resolu = TRUE, date_resolution = NOW() WHERE id_defaut_signale = $1 RETURNING *`,
    [id]);
  return rows[0] ?? null;
}

export async function ajouterPhoto(photo) {
  const cols = Object.keys(photo), vals = cols.map((_, i) => `$${i + 1}`).join(', ');
  const { rows } = await getPool().query(
    `INSERT INTO photos_defauts (${cols.join(', ')}) VALUES (${vals}) RETURNING *`, cols.map(c => photo[c]));
  return rows[0];
}

export async function photosDe(id_defaut_signale) {
  const { rows } = await getPool().query(
    `SELECT * FROM photos_defauts WHERE id_defaut_signale = $1 ORDER BY ordre, id_photo`, [id_defaut_signale]);
  return rows;
}
