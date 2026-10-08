// model.js — ecommerce/promo
// Table : codes_promo_web (§11quinquies.8)
import { buildCrud } from '../../_shared/crudFactory.js';
import { getPool } from '../../_shared/db.js';

const crud = buildCrud({
  table: 'codes_promo_web',
  pk: 'id_promo',
  columns: [
    'id_site','code','type_remise','valeur','montant_min_commande',
    'canal_cible','usage_max_total','usage_max_client','usage_courant',
    'date_debut','date_fin','actif',
  ],
  searchColumns: ['code'],
  orderBy: 'date_debut DESC',
});

export const model = {
  ...crud.model,

  async findActifParCode(idSite, code) {
    const sql = `
      SELECT * FROM codes_promo_web
       WHERE code = $1
         AND (id_site = $2 OR id_site IS NULL)
         AND actif = TRUE
         AND date_debut <= NOW()
         AND (date_fin IS NULL OR date_fin >= NOW())
       ORDER BY id_site NULLS LAST
       LIMIT 1`;
    const { rows } = await getPool().query(sql, [code, idSite]);
    return rows[0] || null;
  },

  async incrementUsage(id) {
    const { rows } = await getPool().query(
      'UPDATE codes_promo_web SET usage_courant = usage_courant + 1 WHERE id_promo = $1 RETURNING *',
      [id],
    );
    return rows[0] || null;
  },
};

export const baseService    = crud.service;
export const baseController = crud.controller;
