// CRUD générique table-centric. Retourne { model, service, controller, routes }.
// ESM.
import { Router } from 'express';
import { getPool } from './db.js';
const pool = { query: (t, p) => getPool().query(t, p) };
import { ok, okPaginated, asyncHandler, parsePagination } from './apiEnvelope.js';

/**
 * Construit un module CRUD standard.
 * @param {object} opts
 * @param {string} opts.table              nom de la table
 * @param {string} opts.pk                 nom de la PK (id_...)
 * @param {string[]} opts.columns          colonnes autorisées à écrire
 * @param {string[]} [opts.searchColumns]  colonnes filtrables par LIKE (?q=)
 * @param {string}   [opts.orderBy]        tri défaut
 * @param {(row:any)=>any} [opts.transform] transform sortie
 */
export function buildCrud(opts) {
  const {
    table, pk, columns,
    searchColumns = [],
    orderBy = null,
    transform = (r) => r,
  } = opts;

  const model = {
    async list({ where = {}, q = null, limit, offset }) {
      const clauses = [];
      const params = [];
      let i = 1;
      for (const [k, v] of Object.entries(where)) {
        if (v === undefined || v === null) continue;
        clauses.push(`${k} = $${i++}`);
        params.push(v);
      }
      if (q && searchColumns.length) {
        const or = searchColumns.map((c) => `${c} ILIKE $${i}`).join(' OR ');
        clauses.push(`(${or})`);
        params.push(`%${q}%`);
        i++;
      }
      const whereSql = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
      const orderSql = orderBy ? `ORDER BY ${orderBy}` : `ORDER BY ${pk} DESC`;
      const dataSql = `SELECT * FROM ${table} ${whereSql} ${orderSql} LIMIT $${i} OFFSET $${i + 1}`;
      const countSql = `SELECT COUNT(*)::int AS total FROM ${table} ${whereSql}`;
      const [data, count] = await Promise.all([
        pool.query(dataSql, [...params, limit, offset]),
        pool.query(countSql, params),
      ]);
      return { rows: data.rows.map(transform), total: count.rows[0].total };
    },
    async findById(id) {
      const { rows } = await pool.query(`SELECT * FROM ${table} WHERE ${pk} = $1 LIMIT 1`, [id]);
      return rows[0] ? transform(rows[0]) : null;
    },
    async create(payload, userId) {
      const cols = [];
      const vals = [];
      const params = [];
      let i = 1;
      for (const c of columns) {
        if (payload[c] !== undefined) {
          cols.push(c);
          vals.push(`$${i++}`);
          params.push(payload[c]);
        }
      }
      if (userId != null) {
        cols.push('cree_par'); vals.push(`$${i++}`); params.push(userId);
      }
      const sql = `INSERT INTO ${table} (${cols.join(',')}) VALUES (${vals.join(',')}) RETURNING *`;
      const { rows } = await pool.query(sql, params);
      return transform(rows[0]);
    },
    async update(id, payload, userId) {
      const sets = [];
      const params = [];
      let i = 1;
      for (const c of columns) {
        if (payload[c] !== undefined) {
          sets.push(`${c} = $${i++}`);
          params.push(payload[c]);
        }
      }
      if (!sets.length) {
        const existing = await this.findById(id);
        return existing;
      }
      sets.push(`date_modification = NOW()`);
      if (userId != null) { sets.push(`modifie_par = $${i++}`); params.push(userId); }
      params.push(id);
      const sql = `UPDATE ${table} SET ${sets.join(', ')} WHERE ${pk} = $${i} RETURNING *`;
      const { rows } = await pool.query(sql, params);
      return rows[0] ? transform(rows[0]) : null;
    },
    async softDelete(id, userId) {
      // Si colonne actif présente
      const sql = `UPDATE ${table} SET actif = FALSE, date_modification = NOW()
                    ${userId != null ? ', modifie_par = $2' : ''}
                   WHERE ${pk} = $1 RETURNING *`;
      const params = userId != null ? [id, userId] : [id];
      const { rows } = await pool.query(sql, params);
      return rows[0] ? transform(rows[0]) : null;
    },
  };

  const service = {
    list: (opts) => model.list(opts),
    get: (id) => model.findById(id),
    create: (p, u) => model.create(p, u),
    update: (id, p, u) => model.update(id, p, u),
    remove: (id, u) => model.softDelete(id, u),
  };

  const controller = {
    list: asyncHandler(async (req) => {
      const { page, limit, offset } = parsePagination(req);
      const { rows, total } = await service.list({
        limit, offset,
        q: req.query.q || null,
        where: {},
      });
      return okPaginated(rows, { page, limit, total, total_pages: Math.ceil(total / limit) });
    }),
    get: asyncHandler(async (req) => {
      const row = await service.get(parseInt(req.params.id, 10));
      if (!row) return { _httpStatus: 404, body: { success: false, error: { code: 'NOT_FOUND', message: 'Introuvable' } } };
      return ok(row);
    }),
    create: asyncHandler(async (req) => {
      const row = await service.create(req.body || {}, req.user?.id);
      return ok(row);
    }),
    update: asyncHandler(async (req) => {
      const row = await service.update(parseInt(req.params.id, 10), req.body || {}, req.user?.id);
      if (!row) return { _httpStatus: 404, body: { success: false, error: { code: 'NOT_FOUND', message: 'Introuvable' } } };
      return ok(row);
    }),
    remove: asyncHandler(async (req) => {
      const row = await service.remove(parseInt(req.params.id, 10), req.user?.id);
      if (!row) return { _httpStatus: 404, body: { success: false, error: { code: 'NOT_FOUND', message: 'Introuvable' } } };
      return ok(row);
    }),
  };

  const routes = Router();
  routes.get('/', controller.list);
  routes.get('/:id', controller.get);
  routes.post('/', controller.create);
  routes.put('/:id', controller.update);
  routes.delete('/:id', controller.remove);

  return { model, service, controller, routes };
}
