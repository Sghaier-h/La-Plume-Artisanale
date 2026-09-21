/**
 * TableMapping - Mapping centralisé des tables de base de données
 * Système ERP La Plume Artisanale
 * 
 * Ce fichier centralise tous les noms de tables et leurs mappings
 * pour assurer la cohérence dans tout le système
 */

export const TABLE_MAPPING = {
  // Vente
  'sale.order': {
    table: 'commandes_clients',
    idField: 'id_commande',
    nameField: 'numero_commande',
    fields: {
      'id': 'id_commande',
      'name': 'numero_commande',
      'partner_id': 'id_client',
      'state': 'statut',
      'date_order': 'date_commande',
      'amount_total': 'montant_ttc',
      'amount_untaxed': 'montant_ht',
      'amount_tax': 'montant_tva',
      'date_livraison_prevue': 'date_livraison_prevue',
      'created_by': 'created_by',
      'updated_by': 'updated_by',
      'created_at': 'created_at',
      'updated_at': 'updated_at'
    }
  },
  'sale.order.line': {
    table: 'articles_commande',
    idField: 'id_article_commande',
    nameField: 'id_article_commande',
    fields: {
      'id': 'id_article_commande',
      'order_id': 'id_commande',
      'product_id': 'id_article',
      'name': 'description',
      'quantity': 'quantite',
      'price_unit': 'prix_unitaire',
      'price_subtotal': 'montant_ligne',
      'discount': 'remise',
      'tax_id': 'id_taxe'
    }
  },
  'product.product': {
    table: 'articles',
    idField: 'id_article',
    nameField: 'reference',
    fields: {
      'id': 'id_article',
      'name': 'nom_article',
      'default_code': 'reference',
      'list_price': 'prix_vente',
      'standard_price': 'prix_achat',
      'categ_id': 'id_categorie',
      'type': 'type_article',
      'active': 'actif',
      'description': 'description',
      'qty_available': 'stock_disponible',
      'created_at': 'created_at',
      'updated_at': 'updated_at'
    }
  },
  'product.category': {
    table: 'categories_articles',
    idField: 'id_categorie',
    nameField: 'nom_categorie',
    fields: {
      'id': 'id_categorie',
      'name': 'nom_categorie',
      'parent_id': 'id_categorie_parent',
      'complete_name': 'nom_complet'
    }
  },
  'res.partner': {
    table: 'clients',
    idField: 'id_client',
    nameField: 'raison_sociale',
    fields: {
      'id': 'id_client',
      'name': 'raison_sociale',
      'email': 'email',
      'phone': 'telephone',
      'mobile': 'mobile',
      'street': 'adresse',
      'city': 'ville',
      'zip': 'code_postal',
      'country_id': 'id_pays',
      'is_company': 'est_societe',
      'active': 'actif',
      'customer_rank': 'rang_client',
      'supplier_rank': 'rang_fournisseur',
      'created_at': 'created_at',
      'updated_at': 'updated_at'
    }
  },
  'account.move': {
    table: 'factures',
    idField: 'id_facture',
    nameField: 'numero_facture',
    fields: {
      'id': 'id_facture',
      'name': 'numero_facture',
      'partner_id': 'id_client',
      'move_type': 'type_facture',
      'date': 'date_facture',
      'invoice_date': 'date_facturation',
      'amount_total': 'montant_ttc',
      'amount_untaxed': 'montant_ht',
      'amount_tax': 'montant_tva',
      'state': 'statut',
      'ref': 'reference',
      'created_at': 'created_at',
      'updated_at': 'updated_at'
    }
  },
  'account.move.line': {
    table: 'lignes_facture',
    idField: 'id_ligne_facture',
    nameField: 'id_ligne_facture',
    fields: {
      'id': 'id_ligne_facture',
      'move_id': 'id_facture',
      'product_id': 'id_article',
      'name': 'description',
      'quantity': 'quantite',
      'price_unit': 'prix_unitaire',
      'price_subtotal': 'montant_ligne',
      'debit': 'debit',
      'credit': 'credit',
      'account_id': 'id_compte'
    }
  },
  'stock.picking': {
    table: 'livraisons',
    idField: 'id_livraison',
    nameField: 'numero_livraison',
    fields: {
      'id': 'id_livraison',
      'name': 'numero_livraison',
      'partner_id': 'id_client',
      'picking_type_id': 'id_type_livraison',
      'scheduled_date': 'date_prevue',
      'date_done': 'date_effectuee',
      'state': 'statut',
      'origin': 'origine',
      'location_id': 'id_emplacement_source',
      'location_dest_id': 'id_emplacement_dest',
      'created_at': 'created_at',
      'updated_at': 'updated_at'
    }
  },
  'stock.move': {
    table: 'mouvements_stock',
    idField: 'id_mouvement',
    nameField: 'id_mouvement',
    fields: {
      'id': 'id_mouvement',
      'picking_id': 'id_livraison',
      'product_id': 'id_article',
      'product_uom_qty': 'quantite',
      'location_id': 'id_emplacement_source',
      'location_dest_id': 'id_emplacement_dest',
      'state': 'statut',
      'date': 'date_mouvement',
      'created_at': 'created_at',
      'updated_at': 'updated_at'
    }
  },
  'purchase.order': {
    table: 'commandes_fournisseurs',
    idField: 'id_commande_fournisseur',
    nameField: 'numero_commande',
    fields: {
      'id': 'id_commande_fournisseur',
      'name': 'numero_commande',
      'partner_id': 'id_fournisseur',
      'date_order': 'date_commande',
      'state': 'statut',
      'amount_total': 'montant_ttc',
      'amount_untaxed': 'montant_ht',
      'amount_tax': 'montant_tva',
      'created_at': 'created_at',
      'updated_at': 'updated_at'
    }
  },
  'mrp.production': {
    table: 'ordres_fabrication',
    idField: 'id_of',
    nameField: 'numero_of',
    fields: {
      'id': 'id_of',
      'name': 'numero_of',
      'product_id': 'id_article',
      'product_qty': 'quantite_a_produire',
      'qty_producing': 'quantite_produite',
      'state': 'statut',
      'date_planned_start': 'date_debut_prevue',
      'date_planned_finished': 'date_fin_prevue',
      'date_start': 'date_debut',
      'date_finished': 'date_fin',
      'created_at': 'created_at',
      'updated_at': 'updated_at'
    }
  },
  'hr.employee': {
    table: 'employes',
    idField: 'id_employe',
    nameField: 'nom',
    fields: {
      'id': 'id_employe',
      'name': 'nom',
      'firstname': 'prenom',
      'email': 'email',
      'phone': 'telephone',
      'job_id': 'id_poste',
      'department_id': 'id_departement',
      'active': 'actif',
      'created_at': 'created_at',
      'updated_at': 'updated_at'
    }
  },
  'project.project': {
    table: 'projets',
    idField: 'id_projet',
    nameField: 'nom_projet',
    fields: {
      'id': 'id_projet',
      'name': 'nom_projet',
      'partner_id': 'id_client',
      'date_start': 'date_debut',
      'date_end': 'date_fin',
      'state': 'statut',
      'user_id': 'id_responsable',
      'created_at': 'created_at',
      'updated_at': 'updated_at'
    }
  },
  'crm.lead': {
    table: 'pistes_crm',
    idField: 'id_piste',
    nameField: 'nom',
    fields: {
      'id': 'id_piste',
      'name': 'nom',
      'partner_id': 'id_client',
      'email_from': 'email',
      'phone': 'telephone',
      'type': 'type',
      'stage_id': 'id_etape',
      'probability': 'probabilite',
      'expected_revenue': 'revenu_attendu',
      'created_at': 'created_at',
      'updated_at': 'updated_at'
    }
  }
};

/**
 * Obtient le mapping d'un modèle
 */
export function getTableMapping(modelName) {
  return TABLE_MAPPING[modelName] || null;
}

/**
 * Obtient le nom de la table SQL pour un modèle
 */
export function getTableName(modelName) {
  const mapping = getTableMapping(modelName);
  return mapping ? mapping.table : null;
}

/**
 * Obtient le nom du champ ID pour un modèle
 */
export function getIdField(modelName) {
  const mapping = getTableMapping(modelName);
  return mapping ? mapping.idField : 'id';
}

/**
 * Mappe un champ du modèle vers le champ SQL
 */
export function mapField(modelName, fieldName) {
  const mapping = getTableMapping(modelName);
  if (!mapping) return fieldName;
  
  return mapping.fields[fieldName] || fieldName;
}

/**
 * Mappe un enregistrement SQL vers le format du modèle
 */
export function mapRecord(modelName, sqlRecord) {
  const mapping = getTableMapping(modelName);
  if (!mapping) return sqlRecord;
  
  const mapped = { id: sqlRecord[mapping.idField] };
  
  // Mapper tous les champs
  for (const [modelField, sqlField] of Object.entries(mapping.fields)) {
    if (sqlRecord[sqlField] !== undefined) {
      mapped[modelField] = sqlRecord[sqlField];
    }
  }
  
  return mapped;
}

/**
 * Mappe les valeurs du modèle vers les champs SQL pour INSERT/UPDATE
 */
export function mapValues(modelName, modelValues) {
  const mapping = getTableMapping(modelName);
  if (!mapping) return modelValues;
  
  const sqlValues = {};
  
  for (const [modelField, value] of Object.entries(modelValues)) {
    const sqlField = mapping.fields[modelField];
    if (sqlField) {
      sqlValues[sqlField] = value;
    }
  }
  
  return sqlValues;
}

export default {
  TABLE_MAPPING,
  getTableMapping,
  getTableName,
  getIdField,
  mapField,
  mapRecord,
  mapValues
};
