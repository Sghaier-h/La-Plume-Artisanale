/**
 * Script pour créer les tables manquantes pour les routes avec préfixes
 */

import { pool } from '../src/utils/db.js';

const tablesToCreate = [
  {
    name: 'stock_warehouses',
    sql: `
      CREATE TABLE IF NOT EXISTS stock_warehouses (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        code VARCHAR(50) UNIQUE,
        description TEXT,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER
      );
    `
  },
  {
    name: 'stock_locations',
    sql: `
      CREATE TABLE IF NOT EXISTS stock_locations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        code VARCHAR(50) UNIQUE,
        warehouse_id INTEGER,
        description TEXT,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER
      );
    `
  },
  {
    name: 'stock_moves',
    sql: `
      CREATE TABLE IF NOT EXISTS stock_moves (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        product_id INTEGER,
        location_id INTEGER,
        location_dest_id INTEGER,
        quantity NUMERIC(10,2),
        state VARCHAR(50) DEFAULT 'draft',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER
      );
    `
  },
  {
    name: 'stock_quants',
    sql: `
      CREATE TABLE IF NOT EXISTS stock_quants (
        id SERIAL PRIMARY KEY,
        product_id INTEGER,
        location_id INTEGER,
        quantity NUMERIC(10,2) DEFAULT 0,
        reserved_quantity NUMERIC(10,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER
      );
    `
  },
  {
    name: 'stock_lots',
    sql: `
      CREATE TABLE IF NOT EXISTS stock_lots (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE,
        product_id INTEGER,
        expiry_date DATE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER
      );
    `
  },
  {
    name: 'factures',
    sql: `
      CREATE TABLE IF NOT EXISTS factures (
        id_facture SERIAL PRIMARY KEY,
        numero_facture VARCHAR(50) UNIQUE,
        reference VARCHAR(100),
        id_client INTEGER,
        type_facture VARCHAR(50),
        date_facture DATE,
        date_facturation DATE,
        montant_ht NUMERIC(12,2) DEFAULT 0,
        montant_tva NUMERIC(12,2) DEFAULT 0,
        montant_ttc NUMERIC(12,2) DEFAULT 0,
        statut VARCHAR(50) DEFAULT 'draft',
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER
      );
    `
  },
  {
    name: 'lignes_facture',
    sql: `
      CREATE TABLE IF NOT EXISTS lignes_facture (
        id_ligne_facture SERIAL PRIMARY KEY,
        id_facture INTEGER,
        id_article INTEGER,
        description TEXT,
        quantite NUMERIC(10,2),
        prix_unitaire NUMERIC(10,2),
        montant_ht NUMERIC(12,2),
        montant_tva NUMERIC(12,2),
        montant_ttc NUMERIC(12,2),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER
      );
    `
  },
  {
    name: 'employes',
    sql: `
      CREATE TABLE IF NOT EXISTS employes (
        id_employe SERIAL PRIMARY KEY,
        nom VARCHAR(100),
        prenom VARCHAR(100),
        email VARCHAR(150),
        telephone VARCHAR(20),
        id_poste INTEGER,
        id_departement INTEGER,
        actif BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER
      );
    `
  },
  {
    name: 'departements',
    sql: `
      CREATE TABLE IF NOT EXISTS departements (
        id_departement SERIAL PRIMARY KEY,
        nom VARCHAR(100),
        description TEXT,
        actif BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER
      );
    `
  },
  {
    name: 'conges',
    sql: `
      CREATE TABLE IF NOT EXISTS conges (
        id_conge SERIAL PRIMARY KEY,
        id_employe INTEGER,
        date_debut DATE,
        date_fin DATE,
        type_conge VARCHAR(50),
        statut VARCHAR(50) DEFAULT 'draft',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER
      );
    `
  },
  {
    name: 'notes_frais',
    sql: `
      CREATE TABLE IF NOT EXISTS notes_frais (
        id_note_frais SERIAL PRIMARY KEY,
        id_employe INTEGER,
        date_note DATE,
        montant NUMERIC(10,2),
        description TEXT,
        statut VARCHAR(50) DEFAULT 'draft',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER
      );
    `
  },
  {
    name: 'pistes_crm',
    sql: `
      CREATE TABLE IF NOT EXISTS pistes_crm (
        id_piste SERIAL PRIMARY KEY,
        nom VARCHAR(200),
        email VARCHAR(150),
        telephone VARCHAR(20),
        id_client INTEGER,
        id_stage INTEGER,
        statut VARCHAR(50) DEFAULT 'new',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER
      );
    `
  },
  {
    name: 'opportunites_crm',
    sql: `
      CREATE TABLE IF NOT EXISTS opportunites_crm (
        id_opportunite SERIAL PRIMARY KEY,
        nom VARCHAR(200),
        id_client INTEGER,
        montant_prevue NUMERIC(12,2),
        probabilite INTEGER DEFAULT 0,
        date_fermeture_prevue DATE,
        statut VARCHAR(50) DEFAULT 'new',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER
      );
    `
  },
  {
    name: 'activites_crm',
    sql: `
      CREATE TABLE IF NOT EXISTS activites_crm (
        id_activite SERIAL PRIMARY KEY,
        nom VARCHAR(200),
        type_activite VARCHAR(50),
        date_activite TIMESTAMP,
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER
      );
    `
  },
  {
    name: 'campagnes_crm',
    sql: `
      CREATE TABLE IF NOT EXISTS campagnes_crm (
        id_campagne SERIAL PRIMARY KEY,
        nom VARCHAR(200),
        type_campagne VARCHAR(50),
        date_debut DATE,
        date_fin DATE,
        budget NUMERIC(12,2),
        statut VARCHAR(50) DEFAULT 'draft',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER
      );
    `
  },
  {
    name: 'projets',
    sql: `
      CREATE TABLE IF NOT EXISTS projets (
        id_projet SERIAL PRIMARY KEY,
        nom_projet VARCHAR(200),
        id_client INTEGER,
        date_debut DATE,
        date_fin DATE,
        statut VARCHAR(50) DEFAULT 'draft',
        id_responsable INTEGER,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER
      );
    `
  },
  {
    name: 'taches_projet',
    sql: `
      CREATE TABLE IF NOT EXISTS taches_projet (
        id_tache SERIAL PRIMARY KEY,
        nom_tache VARCHAR(200),
        id_projet INTEGER,
        id_assignee INTEGER,
        date_debut DATE,
        date_fin DATE,
        statut VARCHAR(50) DEFAULT 'todo',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER
      );
    `
  },
  {
    name: 'ajustements_inventaire',
    sql: `
      CREATE TABLE IF NOT EXISTS ajustements_inventaire (
        id_ajustement SERIAL PRIMARY KEY,
        nom VARCHAR(200),
        id_entrepot INTEGER,
        date_ajustement DATE,
        statut VARCHAR(50) DEFAULT 'draft',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER
      );
    `
  },
  {
    name: 'nomenclatures',
    sql: `
      CREATE TABLE IF NOT EXISTS nomenclatures (
        id_nomenclature SERIAL PRIMARY KEY,
        nom VARCHAR(200),
        id_article INTEGER,
        version VARCHAR(50),
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER
      );
    `
  },
  {
    name: 'centres_travail',
    sql: `
      CREATE TABLE IF NOT EXISTS centres_travail (
        id_centre SERIAL PRIMARY KEY,
        nom VARCHAR(200),
        code VARCHAR(50),
        capacite NUMERIC(10,2),
        actif BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER
      );
    `
  },
  {
    name: 'ordres_travail',
    sql: `
      CREATE TABLE IF NOT EXISTS ordres_travail (
        id_ordre_travail SERIAL PRIMARY KEY,
        nom VARCHAR(200),
        id_of INTEGER,
        id_centre INTEGER,
        date_debut TIMESTAMP,
        date_fin TIMESTAMP,
        statut VARCHAR(50) DEFAULT 'draft',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER
      );
    `
  },
  {
    name: 'gammes',
    sql: `
      CREATE TABLE IF NOT EXISTS gammes (
        id_gamme SERIAL PRIMARY KEY,
        nom VARCHAR(200),
        id_article INTEGER,
        version VARCHAR(50),
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER
      );
    `
  },
  {
    name: 'points_controle',
    sql: `
      CREATE TABLE IF NOT EXISTS points_controle (
        id_point SERIAL PRIMARY KEY,
        nom VARCHAR(200),
        id_article INTEGER,
        type_controle VARCHAR(50),
        actif BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER
      );
    `
  },
  {
    name: 'alertes_qualite',
    sql: `
      CREATE TABLE IF NOT EXISTS alertes_qualite (
        id_alerte SERIAL PRIMARY KEY,
        nom VARCHAR(200),
        id_article INTEGER,
        type_alerte VARCHAR(50),
        gravite VARCHAR(50),
        statut VARCHAR(50) DEFAULT 'open',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER
      );
    `
  },
  {
    name: 'entrepots',
    sql: `
      CREATE TABLE IF NOT EXISTS entrepots (
        id_entrepot SERIAL PRIMARY KEY,
        nom VARCHAR(200),
        code VARCHAR(50) UNIQUE,
        adresse TEXT,
        actif BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER
      );
    `
  },
  {
    name: 'emplacements_stock',
    sql: `
      CREATE TABLE IF NOT EXISTS emplacements_stock (
        id_emplacement SERIAL PRIMARY KEY,
        nom VARCHAR(200),
        code VARCHAR(50),
        id_entrepot INTEGER,
        type_emplacement VARCHAR(50),
        actif BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER
      );
    `
  },
  {
    name: 'mouvements_stock',
    sql: `
      CREATE TABLE IF NOT EXISTS mouvements_stock (
        id_mouvement SERIAL PRIMARY KEY,
        nom VARCHAR(200),
        id_article INTEGER,
        id_emplacement_source INTEGER,
        id_emplacement_dest INTEGER,
        quantite NUMERIC(10,2),
        statut VARCHAR(50) DEFAULT 'draft',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER
      );
    `
  },
  {
    name: 'quants_stock',
    sql: `
      CREATE TABLE IF NOT EXISTS quants_stock (
        id_quant SERIAL PRIMARY KEY,
        id_article INTEGER,
        id_emplacement INTEGER,
        quantite NUMERIC(10,2) DEFAULT 0,
        quantite_reservee NUMERIC(10,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER
      );
    `
  },
  {
    name: 'lots',
    sql: `
      CREATE TABLE IF NOT EXISTS lots (
        id_lot SERIAL PRIMARY KEY,
        nom VARCHAR(200) UNIQUE,
        id_article INTEGER,
        date_peremption DATE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER
      );
    `
  },
  {
    name: 'variantes_articles',
    sql: `
      CREATE TABLE IF NOT EXISTS variantes_articles (
        id_variante SERIAL PRIMARY KEY,
        id_article INTEGER,
        nom VARCHAR(200),
        reference VARCHAR(100),
        prix_vente NUMERIC(10,2),
        actif BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER
      );
    `
  },
  {
    name: 'unites_mesure',
    sql: `
      CREATE TABLE IF NOT EXISTS unites_mesure (
        id_uom SERIAL PRIMARY KEY,
        nom VARCHAR(100),
        code VARCHAR(50) UNIQUE,
        type_uom VARCHAR(50),
        facteur_conversion NUMERIC(10,2) DEFAULT 1,
        actif BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER
      );
    `
  },
  {
    name: 'lignes_commande_fournisseur',
    sql: `
      CREATE TABLE IF NOT EXISTS lignes_commande_fournisseur (
        id_ligne SERIAL PRIMARY KEY,
        id_commande_fournisseur INTEGER,
        id_article INTEGER,
        description TEXT,
        quantite NUMERIC(10,2),
        prix_unitaire NUMERIC(10,2),
        montant_ht NUMERIC(12,2),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER
      );
    `
  }
];

async function createTables() {
  console.log('🔧 Création des tables manquantes pour les routes avec préfixes\n');
  console.log('='.repeat(80));

  let created = 0;
  let errors = 0;

  for (const table of tablesToCreate) {
    try {
      await pool.query(table.sql);
      console.log(`✅ Table créée/vérifiée: ${table.name}`);
      created++;
    } catch (error) {
      console.log(`❌ Erreur création ${table.name}: ${error.message}`);
      errors++;
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log(`\n✅ Tables créées/vérifiées: ${created}`);
  if (errors > 0) {
    console.log(`❌ Erreurs: ${errors}`);
  }
  console.log('='.repeat(80));
  
  await pool.end();
}

createTables().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});
