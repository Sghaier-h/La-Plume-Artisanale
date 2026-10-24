import { buildCrud } from '../../_shared/crudFactory.js';
import { getPool } from '../../_shared/db.js';

const crud = buildCrud({
  table: 'articles_catalogue',
  pk: 'id_article',
  columns: [
    'id_modele','code_article','ref_fabrication','ref_commerciale',
    'designation','image_url_principale',
    'id_dimension','id_lettre_couleurs','code_couleur_base',
    'suffixe_nuance','codes_couleurs_add',
    'id_finition','id_tissage','id_personnalisation',
    'id_numero_metrique','id_composition',
    'type_stock','ean_13','ean_8','qr_code',
    'qualite','prix_reviens','prix_vente_ht','prix_moyen_pondere_kg',
    'unite_vente','poids_net_g','poids_brut_g',
    'longueur_cm','largeur_cm','hauteur_cm','volume_cm3','fragile',
    'id_fournisseur_defaut','actif',
  ],
  searchColumns: ['code_article','ref_commerciale','ref_fabrication','designation'],
  orderBy: 'ref_commerciale ASC',
});

export const model = {
  ...crud.model,

  /**
   * Lookup contextuel : modele + dimension + lettre couleurs.
   */
  async loadRefContext(payload) {
    const pool = getPool();
    const [modele, dim, lettre] = await Promise.all([
      pool.query('SELECT code_modele FROM modeles WHERE id_modele = $1', [payload.id_modele]),
      payload.id_dimension
        ? pool.query('SELECT code_ref FROM articles_dimensions WHERE id_dimension = $1', [payload.id_dimension])
        : Promise.resolve({ rows: [] }),
      payload.id_lettre_couleurs
        ? pool.query('SELECT lettre, absent_dans_ref FROM lettres_couleurs WHERE id_lettre = $1', [payload.id_lettre_couleurs])
        : Promise.resolve({ rows: [] }),
    ]);
    return {
      code_modele: modele.rows[0]?.code_modele || null,
      code_dim:    dim.rows[0]?.code_ref || null,
      lettre_nb:   lettre.rows[0]?.lettre || null,
      lettre_absent: lettre.rows[0]?.absent_dans_ref === true,
    };
  },
};

export const baseRoutes = crud.routes;
export const baseService = crud.service;
export const baseController = crud.controller;
