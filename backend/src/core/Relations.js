/**
 * Relations - Gestion des relations entre modèles
 * Système ERP La Plume Artisanale
 * 
 * Définit toutes les relations entre les modèles (One2Many, Many2One, Many2Many)
 */

import { pool } from '../utils/db.js';
import { getTableName, getIdField, mapField } from './TableMapping.js';

export const MODEL_RELATIONS = {
  'sale.order': {
    // Relations Many2One (clés étrangères)
    many2one: {
      'partner_id': { model: 'res.partner', field: 'id_client' },
      'user_id': { model: 'res.users', field: 'id_utilisateur' },
      'team_id': { model: 'crm.team', field: 'id_equipe' },
      'company_id': { model: 'res.company', field: 'id_societe' },
      'currency_id': { model: 'res.currency', field: 'id_devise' }
    },
    // Relations One2Many (relations inverses)
    one2many: {
      'order_line': { model: 'sale.order.line', field: 'order_id' },
      'picking_ids': { model: 'stock.picking', field: 'sale_id' },
      'invoice_ids': { model: 'account.move', field: 'sale_id' }
    }
  },
  'sale.order.line': {
    many2one: {
      'order_id': { model: 'sale.order', field: 'id_commande' },
      'product_id': { model: 'product.product', field: 'id_article' },
      'tax_id': { model: 'account.tax', field: 'id_taxe' }
    }
  },
  'product.product': {
    many2one: {
      'categ_id': { model: 'product.category', field: 'id_categorie' },
      'uom_id': { model: 'uom.uom', field: 'id_unite' },
      'uom_po_id': { model: 'uom.uom', field: 'id_unite_achat' }
    },
    one2many: {
      'sale_order_line_ids': { model: 'sale.order.line', field: 'product_id' },
      'purchase_order_line_ids': { model: 'purchase.order.line', field: 'product_id' },
      'stock_move_ids': { model: 'stock.move', field: 'product_id' }
    }
  },
  'res.partner': {
    many2one: {
      'country_id': { model: 'res.country', field: 'id_pays' },
      'state_id': { model: 'res.country.state', field: 'id_region' },
      'parent_id': { model: 'res.partner', field: 'id_parent' }
    },
    one2many: {
      'sale_order_ids': { model: 'sale.order', field: 'partner_id' },
      'purchase_order_ids': { model: 'purchase.order', field: 'partner_id' },
      'invoice_ids': { model: 'account.move', field: 'partner_id' },
      'child_ids': { model: 'res.partner', field: 'parent_id' }
    }
  },
  'account.move': {
    many2one: {
      'partner_id': { model: 'res.partner', field: 'id_client' },
      'sale_id': { model: 'sale.order', field: 'id_commande' },
      'currency_id': { model: 'res.currency', field: 'id_devise' }
    },
    one2many: {
      'line_ids': { model: 'account.move.line', field: 'move_id' }
    }
  },
  'stock.picking': {
    many2one: {
      'partner_id': { model: 'res.partner', field: 'id_client' },
      'sale_id': { model: 'sale.order', field: 'id_commande' },
      'purchase_id': { model: 'purchase.order', field: 'id_commande_fournisseur' },
      'location_id': { model: 'stock.location', field: 'id_emplacement_source' },
      'location_dest_id': { model: 'stock.location', field: 'id_emplacement_dest' }
    },
    one2many: {
      'move_ids': { model: 'stock.move', field: 'picking_id' }
    }
  },
  'purchase.order': {
    many2one: {
      'partner_id': { model: 'res.partner', field: 'id_fournisseur' },
      'currency_id': { model: 'res.currency', field: 'id_devise' }
    },
    one2many: {
      'order_line': { model: 'purchase.order.line', field: 'order_id' },
      'picking_ids': { model: 'stock.picking', field: 'purchase_id' },
      'invoice_ids': { model: 'account.move', field: 'purchase_id' }
    }
  },
  'mrp.production': {
    many2one: {
      'product_id': { model: 'product.product', field: 'id_article' },
      'bom_id': { model: 'mrp.bom', field: 'id_nomenclature' }
    },
    one2many: {
      'move_raw_ids': { model: 'stock.move', field: 'raw_material_production_id' },
      'move_finished_ids': { model: 'stock.move', field: 'production_id' }
    }
  },
  'hr.employee': {
    many2one: {
      'job_id': { model: 'hr.job', field: 'id_poste' },
      'department_id': { model: 'hr.department', field: 'id_departement' },
      'parent_id': { model: 'hr.employee', field: 'id_superieur' }
    },
    one2many: {
      'child_ids': { model: 'hr.employee', field: 'parent_id' }
    }
  },
  'project.project': {
    many2one: {
      'partner_id': { model: 'res.partner', field: 'id_client' },
      'user_id': { model: 'res.users', field: 'id_responsable' }
    },
    one2many: {
      'task_ids': { model: 'project.task', field: 'project_id' }
    }
  },
  'crm.lead': {
    many2one: {
      'partner_id': { model: 'res.partner', field: 'id_client' },
      'stage_id': { model: 'crm.stage', field: 'id_etape' },
      'user_id': { model: 'res.users', field: 'id_utilisateur' }
    },
    one2many: {
      'activity_ids': { model: 'crm.activity', field: 'lead_id' }
    }
  }
};

/**
 * Charge les relations Many2One (clés étrangères)
 */
export async function loadMany2One(modelName, record, fields = null) {
  const relations = MODEL_RELATIONS[modelName]?.many2one;
  if (!relations) return record;

  const fieldsToLoad = fields || Object.keys(relations);
  const loaded = { ...record };

  for (const field of fieldsToLoad) {
    const relation = relations[field];
    if (!relation || !record[field]) continue;

    try {
      const relatedModel = relation.model;
      const relatedTable = getTableName(relatedModel);
      const relatedIdField = getIdField(relatedModel);
      const relatedNameField = MODEL_RELATIONS[relatedModel]?.nameField || 'name';

      const query = `
        SELECT ${relatedIdField} as id, ${relatedNameField} as name
        FROM ${relatedTable}
        WHERE ${relatedIdField} = $1
        LIMIT 1
      `;

      const result = await pool.query(query, [record[field]]);
      if (result.rows.length > 0) {
        loaded[field] = [result.rows[0].id, result.rows[0].name];
      }
    } catch (error) {
      console.error(`Erreur chargement relation ${field}:`, error);
    }
  }

  return loaded;
}

/**
 * Charge les relations One2Many (relations inverses)
 */
export async function loadOne2Many(modelName, recordId, relationName) {
  const relations = MODEL_RELATIONS[modelName]?.one2many;
  if (!relations || !relations[relationName]) return [];

  const relation = relations[relationName];
  const relatedModel = relation.model;
  const relatedTable = getTableName(relatedModel);
  const relatedIdField = getIdField(relatedModel);
  const foreignField = mapField(relatedModel, relation.field);

  try {
    const query = `
      SELECT *
      FROM ${relatedTable}
      WHERE ${foreignField} = $1
      ORDER BY ${relatedIdField} DESC
    `;

    const result = await pool.query(query, [recordId]);
    return result.rows;
  } catch (error) {
    console.error(`Erreur chargement relation One2Many ${relationName}:`, error);
    return [];
  }
}

/**
 * Charge toutes les relations d'un enregistrement
 */
export async function loadRelations(modelName, record, options = {}) {
  const {
    many2one = true,
    one2many = [],
    many2oneFields = null
  } = options;

  let loaded = { ...record };

  // Charger les relations Many2One
  if (many2one) {
    loaded = await loadMany2One(modelName, loaded, many2oneFields);
  }

  // Charger les relations One2Many
  if (one2many.length > 0) {
    for (const relationName of one2many) {
      loaded[relationName] = await loadOne2Many(modelName, record.id, relationName);
    }
  }

  return loaded;
}

/**
 * Charge plusieurs enregistrements avec leurs relations
 */
export async function loadRelationsBatch(modelName, records, options = {}) {
  const results = [];
  
  for (const record of records) {
    const loaded = await loadRelations(modelName, record, options);
    results.push(loaded);
  }

  return results;
}

export default {
  MODEL_RELATIONS,
  loadMany2One,
  loadOne2Many,
  loadRelations,
  loadRelationsBatch
};
