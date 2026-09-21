/**
 * Script Node.js pour créer la base de données locale et les tables
 * Utilise la connexion PostgreSQL via Node.js
 */

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration pour se connecter à PostgreSQL (base postgres par défaut)
const configPostgres = {
    host: 'localhost',
    port: 5432,
    database: 'postgres', // Base par défaut
    user: 'postgres',
    password: process.env.DB_PASSWORD || 'postgres', // Mot de passe par défaut ou depuis .env
};

const dbName = 'ERP_La_Plume_Local';

async function creerBaseEtTables() {
    const poolPostgres = new Pool(configPostgres);
    
    try {
        console.log('============================================================');
        console.log('CREATION BASE DE DONNEES LOCALE');
        console.log('============================================================\n');

        // 1. Créer la base de données
        console.log('1. Création de la base de données...');
        try {
            await poolPostgres.query(`CREATE DATABASE "${dbName}"`);
            console.log(`   ✅ Base "${dbName}" créée`);
        } catch (error) {
            if (error.code === '42P04') {
                console.log(`   ℹ️  Base "${dbName}" existe déjà`);
            } else {
                throw error;
            }
        }

        // 2. Se connecter à la nouvelle base
        console.log('\n2. Connexion à la nouvelle base...');
        const configNewDb = {
            ...configPostgres,
            database: dbName,
        };
        const pool = new Pool(configNewDb);
        
        // 3. Créer les extensions
        console.log('3. Création des extensions...');
        await pool.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
        console.log('   ✅ Extension uuid-ossp créée');

        // 4. Lire et exécuter le script SQL
        console.log('\n4. Création des tables...');
        const sqlFile = path.join(__dirname, 'creer-base-locale.sql');
        
        if (!fs.existsSync(sqlFile)) {
            console.log('   ⚠️  Fichier SQL non trouvé, création des tables manuellement...');
            await creerTablesManuellement(pool);
        } else {
            const sqlContent = fs.readFileSync(sqlFile, 'utf8');
            // Extraire uniquement les commandes CREATE TABLE (ignorer CREATE DATABASE)
            const createTableStatements = sqlContent
                .split(';')
                .map(s => s.trim())
                .filter(s => s && !s.startsWith('CREATE DATABASE') && !s.startsWith('\\c') && !s.startsWith('\\echo') && !s.startsWith('--'));
            
            for (const statement of createTableStatements) {
                if (statement) {
                    try {
                        await pool.query(statement);
                    } catch (error) {
                        if (!error.message.includes('already exists')) {
                            console.log(`   ⚠️  Erreur: ${error.message}`);
                        }
                    }
                }
            }
        }

        // 5. Insérer les données de test
        console.log('\n5. Insertion des données de test...');
        await insererDonneesTest(pool);

        // 6. Vérifier les tables créées
        console.log('\n6. Vérification des tables...');
        const result = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name
        `);
        
        console.log(`   ✅ ${result.rows.length} tables créées:`);
        result.rows.forEach(row => {
            console.log(`      - ${row.table_name}`);
        });

        await pool.end();
        await poolPostgres.end();

        console.log('\n============================================================');
        console.log('✅ BASE DE DONNÉES LOCALE CRÉÉE AVEC SUCCÈS !');
        console.log('============================================================\n');
        
        console.log('Prochaines étapes:');
        console.log('  1. Basculer vers local: powershell -ExecutionPolicy Bypass -File basculer-env-local.ps1');
        console.log('  2. Tester: node test-modules-odoo.js\n');

    } catch (error) {
        console.error('\n❌ ERREUR:', error.message);
        console.error('\nVérifiez:');
        console.error('  1. PostgreSQL est démarré');
        console.error('  2. Le mot de passe est correct (définissez DB_PASSWORD dans .env)');
        console.error('  3. L\'utilisateur postgres a les droits nécessaires\n');
        process.exit(1);
    }
}

async function creerTablesManuellement(pool) {
    const tables = [
        // Utilisateurs
        `CREATE TABLE IF NOT EXISTS utilisateurs (
            id_utilisateur SERIAL PRIMARY KEY,
            email VARCHAR(150) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            nom VARCHAR(100),
            prenom VARCHAR(100),
            role VARCHAR(50) DEFAULT 'USER',
            actif BOOLEAN DEFAULT true,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
        
        // Clients
        `CREATE TABLE IF NOT EXISTS clients (
            id_client SERIAL PRIMARY KEY,
            code_client VARCHAR(50) UNIQUE NOT NULL,
            raison_sociale VARCHAR(200) NOT NULL,
            adresse TEXT,
            code_postal VARCHAR(20),
            ville VARCHAR(100),
            pays VARCHAR(100) DEFAULT 'Tunisie',
            telephone VARCHAR(20),
            email VARCHAR(150),
            contact_principal VARCHAR(200),
            actif BOOLEAN DEFAULT true,
            date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
        
        // Commandes clients
        `CREATE TABLE IF NOT EXISTS commandes_clients (
            id_commande SERIAL PRIMARY KEY,
            numero_commande VARCHAR(50) UNIQUE NOT NULL,
            id_client INTEGER NOT NULL REFERENCES clients(id_client),
            date_commande DATE NOT NULL DEFAULT CURRENT_DATE,
            date_livraison_prevue DATE,
            statut VARCHAR(30) DEFAULT 'EN_ATTENTE',
            montant_ht NUMERIC(12,2) DEFAULT 0,
            montant_tva NUMERIC(12,2) DEFAULT 0,
            montant_ttc NUMERIC(12,2) DEFAULT 0,
            remise_globale NUMERIC(5,2) DEFAULT 0,
            created_by INTEGER REFERENCES utilisateurs(id_utilisateur),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
        
        // Lignes commande
        `CREATE TABLE IF NOT EXISTS lignes_commande (
            id_ligne SERIAL PRIMARY KEY,
            id_commande INTEGER NOT NULL REFERENCES commandes_clients(id_commande) ON DELETE CASCADE,
            id_article INTEGER,
            designation VARCHAR(200) NOT NULL,
            quantite_commandee NUMERIC(10,3) NOT NULL,
            prix_unitaire_ht NUMERIC(10,2) NOT NULL,
            taux_tva NUMERIC(5,2) DEFAULT 20,
            remise NUMERIC(5,2) DEFAULT 0,
            montant_ht NUMERIC(12,2) NOT NULL,
            montant_tva NUMERIC(12,2) NOT NULL,
            montant_ttc NUMERIC(12,2) NOT NULL,
            ordre INTEGER DEFAULT 0
        )`,
        
        // Articles catalogue
        `CREATE TABLE IF NOT EXISTS articles_catalogue (
            id_article SERIAL PRIMARY KEY,
            nom VARCHAR(200) NOT NULL,
            reference VARCHAR(100),
            id_categorie INTEGER,
            type_article VARCHAR(50),
            prix_vente NUMERIC(10,2) DEFAULT 0,
            prix_achat NUMERIC(10,2) DEFAULT 0,
            actif BOOLEAN DEFAULT true,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
        
        // Catégories articles
        `CREATE TABLE IF NOT EXISTS categories_articles (
            id_categorie SERIAL PRIMARY KEY,
            nom VARCHAR(200) NOT NULL,
            id_categorie_parent INTEGER REFERENCES categories_articles(id_categorie),
            actif BOOLEAN DEFAULT true
        )`,
        
        // Entrepôts
        `CREATE TABLE IF NOT EXISTS entrepots (
            id_entrepot SERIAL PRIMARY KEY,
            code VARCHAR(20) UNIQUE NOT NULL,
            libelle VARCHAR(100) NOT NULL,
            type VARCHAR(50) DEFAULT 'stockage',
            adresse TEXT,
            responsable VARCHAR(200),
            actif BOOLEAN DEFAULT true,
            date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
        
        // Livraisons
        `CREATE TABLE IF NOT EXISTS livraisons (
            id_livraison SERIAL PRIMARY KEY,
            numero_livraison VARCHAR(50) UNIQUE NOT NULL,
            id_commande INTEGER REFERENCES commandes_clients(id_commande),
            date_livraison DATE NOT NULL DEFAULT CURRENT_DATE,
            statut VARCHAR(30) DEFAULT 'PREVUE',
            transporteur VARCHAR(100),
            numero_suivi VARCHAR(100),
            created_by INTEGER REFERENCES utilisateurs(id_utilisateur),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
        
        // Ordres fabrication
        `CREATE TABLE IF NOT EXISTS ordres_fabrication (
            id_of SERIAL PRIMARY KEY,
            numero_of VARCHAR(50) UNIQUE NOT NULL,
            id_article INTEGER REFERENCES articles_catalogue(id_article),
            quantite_a_produire DECIMAL(10,2) NOT NULL,
            quantite_produite DECIMAL(10,2) DEFAULT 0,
            date_creation_of DATE NOT NULL DEFAULT CURRENT_DATE,
            date_debut_prevue DATE,
            date_fin_prevue DATE,
            date_debut_reelle TIMESTAMP,
            date_fin_reelle TIMESTAMP,
            statut VARCHAR(50) DEFAULT 'planifie',
            id_utilisateur INTEGER REFERENCES utilisateurs(id_utilisateur),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
        
        // Factures clients
        `CREATE TABLE IF NOT EXISTS factures_clients (
            id_facture SERIAL PRIMARY KEY,
            numero_facture VARCHAR(50) UNIQUE NOT NULL,
            id_client INTEGER NOT NULL REFERENCES clients(id_client),
            id_commande INTEGER REFERENCES commandes_clients(id_commande),
            date_facture DATE NOT NULL DEFAULT CURRENT_DATE,
            date_echeance DATE,
            statut VARCHAR(30) DEFAULT 'BROUILLON',
            montant_ht NUMERIC(12,2) DEFAULT 0,
            montant_tva NUMERIC(12,2) DEFAULT 0,
            montant_ttc NUMERIC(12,2) DEFAULT 0,
            created_by INTEGER REFERENCES utilisateurs(id_utilisateur),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
        
        // Commandes fournisseurs
        `CREATE TABLE IF NOT EXISTS commandes_fournisseurs (
            id_commande SERIAL PRIMARY KEY,
            numero_commande VARCHAR(50) UNIQUE NOT NULL,
            id_fournisseur INTEGER,
            date_commande DATE NOT NULL DEFAULT CURRENT_DATE,
            date_livraison_prevue DATE,
            statut VARCHAR(30) DEFAULT 'EN_ATTENTE',
            montant_ht NUMERIC(12,2) DEFAULT 0,
            montant_tva NUMERIC(12,2) DEFAULT 0,
            montant_ttc NUMERIC(12,2) DEFAULT 0,
            created_by INTEGER REFERENCES utilisateurs(id_utilisateur),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
    ];

    for (const tableSQL of tables) {
        try {
            await pool.query(tableSQL);
        } catch (error) {
            if (!error.message.includes('already exists')) {
                console.log(`   ⚠️  Erreur création table: ${error.message}`);
            }
        }
    }
}

async function insererDonneesTest(pool) {
    const inserts = [
        // Client
        `INSERT INTO clients (code_client, raison_sociale, email, telephone) 
         VALUES ('CLI001', 'Client Test 1', 'client1@test.com', '123456789')
         ON CONFLICT (code_client) DO NOTHING`,
        
        // Catégorie
        `INSERT INTO categories_articles (nom) 
         VALUES ('Categorie Test')
         ON CONFLICT DO NOTHING`,
        
        // Articles
        `INSERT INTO articles_catalogue (nom, reference, prix_vente, prix_achat) 
         VALUES 
            ('Article Test 1', 'ART001', 100.00, 50.00),
            ('Article Test 2', 'ART002', 200.00, 100.00)
         ON CONFLICT DO NOTHING`,
        
        // Entrepôt
        `INSERT INTO entrepots (code, libelle, type) 
         VALUES ('E1', 'Entrepot Principal', 'stockage')
         ON CONFLICT (code) DO NOTHING`,
    ];

    for (const insertSQL of inserts) {
        try {
            await pool.query(insertSQL);
        } catch (error) {
            // Ignorer les erreurs de conflit
        }
    }
    
    console.log('   ✅ Données de test insérées');
}

// Exécuter
creerBaseEtTables();
