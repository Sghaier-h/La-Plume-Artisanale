// model.js — personnalisation/commandes
// Data-access sur `commandes_personnalisations` (§5.8.3 domain.md).
// Une ligne = 1 personnalisation appliquée à 1 ligne de devis ou de commande.
import { buildCrud } from '../../_shared/crudFactory.js';
import { getPool } from '../../_shared/db.js';

const crud = buildCrud({
  table: 'commandes_personnalisations',
  pk: 'id_pers',
  columns: [
    'id_ligne_devis',
    'id_ligne_commande',
    'type_personnalisation',
    'parametres_json',
    'preview_image_url',
    'fichier_source_url',
    'supplement_ht',
    'moq_applique',
    'delai_ajoute_jours',
    'validee_par_client',
    'date_validation_client',
    'validee_par_commercial',
    'date_validation_com',
    'id_commercial',
    'specs_atelier_json',
    'fichier_dst_url',
    'fichier_films_urls',
  ],
  orderBy: 'id_pers DESC',
});

export const model = {
  ...crud.model,

  /**
   * Marque la personnalisation comme validée par le client (§5.8.4).
   * Renvoie la ligne mise à jour ou null si introuvable.
   */
  async validerClient(id) {
    const pool = getPool();
    const { rows } = await pool.query(
      `UPDATE commandes_personnalisations
          SET validee_par_client = TRUE,
              date_validation_client = NOW()
        WHERE id_pers = $1
        RETURNING *`,
      [id],
    );
    return rows[0] || null;
  },

  /**
   * Marque la personnalisation comme validée par le commercial (§5.8.4).
   * Injecte les specs atelier fournies (ou générées côté service) et
   * enregistre l'id du commercial responsable.
   */
  async validerCommercial(id, { id_commercial = null, specs_atelier_json = null } = {}) {
    const pool = getPool();
    const { rows } = await pool.query(
      `UPDATE commandes_personnalisations
          SET validee_par_commercial = TRUE,
              date_validation_com    = NOW(),
              id_commercial          = COALESCE($2, id_commercial),
              specs_atelier_json     = COALESCE($3::jsonb, specs_atelier_json)
        WHERE id_pers = $1
        RETURNING *`,
      [id, id_commercial, specs_atelier_json ? JSON.stringify(specs_atelier_json) : null],
    );
    return rows[0] || null;
  },
};

export const baseService    = crud.service;
export const baseController = crud.controller;
export const baseRoutes     = crud.routes;
