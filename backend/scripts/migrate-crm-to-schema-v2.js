#!/usr/bin/env node
/**
 * migrate-crm-to-schema-v2.js
 *
 * Migration CRITIQUE de la base de données legacy vers le schéma v2 §3.
 *
 * Legacy                    →  Cible schema-v2
 * ─────────────────────────────────────────────────────────────
 * utilisateurs              →  users (id_utilisateur→id_user)
 * clients                   →  comptes (type_client → statut_crm, ...)
 * contacts_client           →  contacts
 * adresses_client (colonnes ancien schéma)  →  adresses_client (colonnes v2)
 * opportunites_crm (vide)   →  opportunites
 *
 * Sécurité :
 *  - Transaction unique BEGIN/COMMIT/ROLLBACK
 *  - Les tables legacy sont RENOMMÉES en `_legacy_*` (pas droppées)
 *  - En cas de mismatch de counts : ROLLBACK automatique
 *  - --dry : affiche le plan sans rien exécuter
 *
 * Rollback manuel (si besoin après COMMIT) :
 *   BEGIN;
 *     DROP TABLE contacts, comptes, opportunites, users CASCADE;
 *     DROP TABLE adresses_client CASCADE;
 *     ALTER TABLE _legacy_clients RENAME TO clients;
 *     ALTER TABLE _legacy_contacts_client RENAME TO contacts_client;
 *     ALTER TABLE _legacy_adresses_client RENAME TO adresses_client;
 *     ALTER TABLE _legacy_opportunites_crm RENAME TO opportunites_crm;
 *     ALTER TABLE _legacy_utilisateurs RENAME TO utilisateurs;
 *   COMMIT;
 *
 * Usage :
 *   node scripts/migrate-crm-to-schema-v2.js --dry
 *   node scripts/migrate-crm-to-schema-v2.js
 */

import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dry = process.argv.includes('--dry');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

const log = (...a) => console.log('[migrate-crm-v2]', ...a);

async function tableExists(client, name) {
  const r = await client.query("SELECT to_regclass('public.' || $1) AS x", [name]);
  return r.rows[0].x !== null;
}

async function count(client, name) {
  try {
    const r = await client.query(`SELECT COUNT(*)::int AS c FROM ${name}`);
    return r.rows[0].c;
  } catch (e) { return null; }
}

async function main() {
  const client = await pool.connect();

  // Pré-check
  log('Pré-check…');
  const preLegacy = {
    clients:            await count(client, 'clients'),
    contacts_client:    await count(client, 'contacts_client'),
    adresses_client:    await count(client, 'adresses_client'),
    opportunites_crm:   await count(client, 'opportunites_crm'),
    utilisateurs:       await count(client, 'utilisateurs'),
  };
  const preNew = {
    users:        await tableExists(client, 'users'),
    comptes:      await tableExists(client, 'comptes'),
    contacts:     await tableExists(client, 'contacts'),
    opportunites: await tableExists(client, 'opportunites'),
    leads:        await tableExists(client, 'leads'),
  };
  log('  Legacy rows:', preLegacy);
  log('  Target tables present:', preNew);

  if (preLegacy.clients === null) {
    log('  ⚠ Table `clients` absente — migration déjà faite ou base invalide. STOP.');
    process.exit(0);
  }
  if (preNew.comptes && preNew.users) {
    log('  ⚠ Tables cibles `comptes` + `users` existent déjà — probablement déjà migré. STOP (utilise rollback puis relance si voulu).');
    process.exit(0);
  }

  if (dry) {
    log('DRY-RUN — arrêt avant BEGIN.');
    log('Plan :');
    log('  1. CREATE users (id_utilisateur→id_user) + copie 28 lignes');
    log('  2. Apply 03_crm.sql, 03b_crm_leads_interactions.sql, 03c_config_numerotation_devises.sql');
    log('  3. Copy clients → comptes (23), contacts_client → contacts (10), adresses_client → new (3)');
    log('  4. Rename legacy → _legacy_*');
    log('  5. COMMIT si counts OK, sinon ROLLBACK');
    await pool.end();
    return;
  }

  log('BEGIN transaction…');
  await client.query('BEGIN');
  try {
    // ─── 1. Créer users depuis utilisateurs (id_utilisateur → id_user) ───────
    log('1/6 CREATE users…');
    await client.query(`
      CREATE TABLE IF NOT EXISTS users AS
      SELECT
        id_utilisateur AS id_user,
        nom_utilisateur, email, mot_de_passe_hash, salt,
        id_operateur, derniere_connexion, tentatives_connexion,
        compte_verrouille, date_verrouillage, date_expiration_mdp,
        force_changement_mdp, token_reinitialisation, date_token_reinitialisation,
        preferences_json, actif, date_creation, date_modification,
        created_by, updated_by, photo_emoji, photo_url,
        id_groupe, prenom, nom, numero_employe
      FROM utilisateurs
    `);
    // Contraintes PK + séquence
    await client.query(`ALTER TABLE users ADD CONSTRAINT users_pkey PRIMARY KEY (id_user)`);
    await client.query(`
      CREATE SEQUENCE IF NOT EXISTS users_id_user_seq OWNED BY users.id_user
    `);
    await client.query(`ALTER TABLE users ALTER COLUMN id_user SET DEFAULT nextval('users_id_user_seq')`);
    await client.query(`SELECT setval('users_id_user_seq', COALESCE((SELECT MAX(id_user) FROM users), 1))`);

    // ─── 2. Renommer adresses_client legacy AVANT d'appliquer schema-v2 ──────
    log('2/6 Rename legacy adresses_client + contacts_client…');
    await client.query(`ALTER TABLE adresses_client RENAME TO _legacy_adresses_client`);
    await client.query(`ALTER TABLE contacts_client RENAME TO _legacy_contacts_client`);
    await client.query(`ALTER TABLE opportunites_crm RENAME TO _legacy_opportunites_crm`);
    await client.query(`ALTER TABLE clients RENAME TO _legacy_clients`);

    // ─── 3. Appliquer les schémas v2 ─────────────────────────────────────────
    log('3/6 Apply 03_crm.sql + 03b + 03c …');
    for (const f of ['03_crm.sql', '03b_crm_leads_interactions.sql', '03c_config_numerotation_devises.sql']) {
      const sqlPath = path.resolve(__dirname, '..', '..', 'database', 'schema-v2', f);
      const sql = fs.readFileSync(sqlPath, 'utf-8');
      await client.query(sql);
      log(`   ✓ ${f}`);
    }

    // ─── 4. Copier _legacy_clients → comptes ─────────────────────────────────
    log('4/6 Migrate data legacy → v2 …');
    await client.query(`
      INSERT INTO comptes (
        id_client, code_client, type_compte, statut_crm,
        raison_sociale, pays,
        matricule_fiscal, numero_tva_intracom, siret,
        id_commercial, notes, actif,
        created_at, cree_par, updated_at, modifie_par
      )
      SELECT
        id_client,
        code_client,
        'societe' AS type_compte,
        CASE WHEN UPPER(type_client) = 'PROSPECT' THEN 'prospect' ELSE 'client' END AS statut_crm,
        raison_sociale,
        COALESCE(LEFT(pays, 2), 'TN'),
        NULL, numero_tva,
        CASE WHEN LENGTH(COALESCE(siren_siret, '')) = 14 THEN siren_siret ELSE NULL END AS siret,
        id_commercial,
        raison_desactivation,
        actif,
        date_creation, created_by, date_creation, updated_by
      FROM _legacy_clients
      ON CONFLICT (id_client) DO NOTHING
    `);
    await client.query(`SELECT setval('comptes_id_client_seq', COALESCE((SELECT MAX(id_client) FROM comptes), 1))`);

    // Contacts
    await client.query(`
      INSERT INTO contacts (
        id_contact, id_client, role, civilite,
        nom, prenom, fonction, email, telephone, whatsapp,
        est_principal, actif, created_at, updated_at
      )
      SELECT
        id_contact, id_client, 'autre',
        CASE WHEN civilite IN ('M','Mme') THEN civilite ELSE NULL END,
        nom, prenom, fonction, email,
        COALESCE(telephone_portable, telephone_fixe),
        telephone_portable,
        COALESCE(contact_principal, FALSE),
        COALESCE(actif, TRUE),
        COALESCE(date_creation, NOW()),
        COALESCE(date_modification, date_creation, NOW())
      FROM _legacy_contacts_client
      ON CONFLICT (id_contact) DO NOTHING
    `);
    await client.query(`SELECT setval('contacts_id_contact_seq', COALESCE((SELECT MAX(id_contact) FROM contacts), 1))`);

    // Adresses (transformation type_adresse → 3 booléens)
    await client.query(`
      INSERT INTO adresses_client (
        id_adresse, id_client, libelle,
        type_facturation, type_livraison, type_siege,
        rue, complement, code_postal, ville, region, pays,
        est_defaut_facturation, est_defaut_livraison,
        created_at, updated_at
      )
      SELECT
        id_adresse, id_client, nom_adresse,
        (UPPER(type_adresse) = 'FACTURATION'),
        (UPPER(type_adresse) = 'LIVRAISON'),
        (UPPER(type_adresse) = 'SIEGE'),
        COALESCE(NULLIF(adresse_ligne1, ''), NULLIF(adresse_ligne2, '')),
        NULLIF(adresse_ligne3, ''),
        code_postal, ville, departement,
        COALESCE(LEFT(pays, 2), 'TN'),
        (COALESCE(principale, FALSE) AND UPPER(type_adresse) = 'FACTURATION'),
        (COALESCE(principale, FALSE) AND UPPER(type_adresse) = 'LIVRAISON'),
        COALESCE(date_creation, NOW()),
        COALESCE(date_modification, date_creation, NOW())
      FROM _legacy_adresses_client
      ON CONFLICT (id_adresse) DO NOTHING
    `);
    await client.query(`SELECT setval('adresses_client_id_adresse_seq', COALESCE((SELECT MAX(id_adresse) FROM adresses_client), 1))`);

    // Renommer utilisateurs en dernier (car users a été créé depuis)
    await client.query(`ALTER TABLE utilisateurs RENAME TO _legacy_utilisateurs`);

    // ─── 5. Vérifier les counts ──────────────────────────────────────────────
    log('5/6 Verify counts…');
    const post = {
      comptes:  await count(client, 'comptes'),
      contacts: await count(client, 'contacts'),
      adresses: await count(client, 'adresses_client'),
      users:    await count(client, 'users'),
    };
    log('  Post counts:', post);
    if (post.comptes  !== preLegacy.clients)         throw new Error(`comptes count mismatch: ${post.comptes} vs ${preLegacy.clients}`);
    if (post.contacts !== preLegacy.contacts_client) throw new Error(`contacts count mismatch: ${post.contacts} vs ${preLegacy.contacts_client}`);
    if (post.adresses !== preLegacy.adresses_client) throw new Error(`adresses count mismatch: ${post.adresses} vs ${preLegacy.adresses_client}`);
    if (post.users    !== preLegacy.utilisateurs)    throw new Error(`users count mismatch: ${post.users} vs ${preLegacy.utilisateurs}`);

    // ─── 6. COMMIT ───────────────────────────────────────────────────────────
    log('6/6 COMMIT');
    await client.query('COMMIT');
    log('✅ Migration terminée avec succès');
    log('   Legacy tables préservées comme _legacy_clients / _legacy_contacts_client / _legacy_adresses_client / _legacy_opportunites_crm / _legacy_utilisateurs');
    log('   Prochaine étape : `npm run seed:demo` pour charger les données démo v2.');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('❌ ROLLBACK -', e.message);
    console.error(e.stack);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(e => { console.error(e); process.exit(1); });
