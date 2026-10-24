// model.js — publicite/comptes
// Table : comptes_pub_externes (§11quinquies.9)
import { buildCrud } from '../../_shared/crudFactory.js';
import { getPool } from '../../_shared/db.js';

const crud = buildCrud({
  table: 'comptes_pub_externes',
  pk: 'id_compte_pub',
  columns: [
    'plateforme','account_id_externe','account_name','devise',
    'access_token_encrypted','refresh_token_encrypted','date_expiration_token',
    'fuseau_horaire','id_site','actif',
  ],
  searchColumns: ['account_id_externe','account_name'],
  orderBy: 'plateforme, account_name',
});

export const model = {
  ...crud.model,
  async findByPlatformAndAccount(plateforme, accountIdExterne) {
    const { rows } = await getPool().query(
      'SELECT * FROM comptes_pub_externes WHERE plateforme = $1 AND account_id_externe = $2 LIMIT 1',
      [plateforme, accountIdExterne],
    );
    return rows[0] || null;
  },
};

export const baseService    = crud.service;
export const baseController = crud.controller;
