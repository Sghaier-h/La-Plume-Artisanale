// model.js — ecommerce/sites
// Table : sites_ecommerce (§11quinquies.2)
import { buildCrud } from '../../_shared/crudFactory.js';
import { getPool } from '../../_shared/db.js';

const crud = buildCrud({
  table: 'sites_ecommerce',
  pk: 'id_site',
  columns: [
    'code','nom','canal','plateforme','url_base',
    'api_endpoint','api_key_encrypted','api_secret_encrypted','webhook_secret_hmac',
    'devise','langue_defaut','langues_supportees','catalogue_ids_json',
    'id_entrepot_par_defaut','stripe_account_id','konnect_wallet_id','actif',
  ],
  searchColumns: ['code','nom','url_base'],
  orderBy: 'nom ASC',
});

export const model = {
  ...crud.model,
  async findByCode(code) {
    const { rows } = await getPool().query(
      'SELECT * FROM sites_ecommerce WHERE code = $1 LIMIT 1', [code],
    );
    return rows[0] || null;
  },
};

export const baseService    = crud.service;
export const baseController = crud.controller;
