import bcrypt from 'bcrypt';
import { pool } from './db.js';

async function createAdmin() {
  console.log('🔧 Création de l\'utilisateur admin...\n');

  try {
    // Vérifier la connexion
    const testResult = await pool.query('SELECT NOW()');
    console.log('✅ Connexion à la base de données OK');
    console.log(`   Heure serveur: ${testResult.rows[0].now}\n`);

    // Vérifier si la table utilisateurs existe
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'utilisateurs'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.error('❌ La table "utilisateurs" n\'existe pas !');
      console.error('   Exécutez d\'abord les scripts SQL de création de base de données.');
      process.exit(1);
    }

    // Vérifier si l'utilisateur admin existe déjà
    const userCheck = await pool.query(
      'SELECT id_utilisateur, email, actif FROM utilisateurs WHERE email = $1',
      ['admin@system.local']
    );

    if (userCheck.rows.length > 0) {
      console.log('⚠️  L\'utilisateur admin@system.local existe déjà');
      const user = userCheck.rows[0];
      console.log(`   ID: ${user.id_utilisateur}`);
      console.log(`   Actif: ${user.actif}`);

      // Vérifier le rôle
      const roleCheck = await pool.query(`
        SELECT r.code_role 
        FROM utilisateurs_roles ur
        JOIN roles r ON ur.id_role = r.id_role
        WHERE ur.id_utilisateur = $1
        LIMIT 1
      `, [user.id_utilisateur]);

      if (roleCheck.rows.length > 0) {
        console.log(`   Rôle: ${roleCheck.rows[0].code_role}`);
      } else {
        console.log('   ⚠️  Aucun rôle assigné - Attribution du rôle ADMIN...');
        
        // Trouver le rôle ADMIN
        const adminRole = await pool.query(
          "SELECT id_role FROM roles WHERE code_role = 'ADMIN' LIMIT 1"
        );

        if (adminRole.rows.length > 0) {
          await pool.query(
            'INSERT INTO utilisateurs_roles (id_utilisateur, id_role) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [user.id_utilisateur, adminRole.rows[0].id_role]
          );
          console.log('   ✅ Rôle ADMIN assigné');
        }
      }

      // Mettre à jour le mot de passe avec bcrypt
      console.log('\n🔄 Mise à jour du mot de passe avec bcrypt...');
      const hashedPassword = await bcrypt.hash('Admin123!', 10);
      
      await pool.query(
        'UPDATE utilisateurs SET mot_de_passe_hash = $1, actif = true WHERE id_utilisateur = $2',
        [hashedPassword, user.id_utilisateur]
      );
      
      console.log('✅ Mot de passe mis à jour');
      console.log('\n📋 Identifiants:');
      console.log('   Email: admin@system.local');
      console.log('   Mot de passe: Admin123!');
      
      process.exit(0);
    }

    // Créer l'utilisateur admin
    console.log('📝 Création du nouvel utilisateur admin...');

    // Vérifier si un opérateur admin existe
    const operatorCheck = await pool.query(`
      SELECT id_operateur FROM equipe_fabrication 
      WHERE matricule = 'ADM001' OR fonction = 'Administrateur'
      LIMIT 1
    `);

    let idOperateur = null;
    if (operatorCheck.rows.length > 0) {
      idOperateur = operatorCheck.rows[0].id_operateur;
      console.log(`   Opérateur trouvé: ${idOperateur}`);
    } else {
      console.log('   ⚠️  Aucun opérateur admin trouvé - création d\'un opérateur...');
      
      // Créer un opérateur admin
      const newOperator = await pool.query(`
        INSERT INTO equipe_fabrication (
          matricule, nom, prenom, fonction, date_embauche, actif
        ) VALUES (
          'ADM001', 'Admin', 'Système', 'Administrateur', CURRENT_DATE, true
        ) RETURNING id_operateur
      `);
      idOperateur = newOperator.rows[0].id_operateur;
      console.log(`   ✅ Opérateur créé: ${idOperateur}`);
    }

    // Hasher le mot de passe avec bcrypt
    const hashedPassword = await bcrypt.hash('Admin123!', 10);

    // Créer l'utilisateur
    const result = await pool.query(`
      INSERT INTO utilisateurs (
        nom_utilisateur, email, mot_de_passe_hash, salt, 
        id_operateur, actif, force_changement_mdp
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7
      ) RETURNING id_utilisateur, email
    `, [
      'admin',
      'admin@system.local',
      hashedPassword,
      '', // Salt non utilisé avec bcrypt
      idOperateur,
      true,
      false
    ]);

    const userId = result.rows[0].id_utilisateur;
    console.log(`✅ Utilisateur créé: ${result.rows[0].email} (ID: ${userId})`);

    // Assigner le rôle ADMIN
    const adminRole = await pool.query(
      "SELECT id_role FROM roles WHERE code_role = 'ADMIN' LIMIT 1"
    );

    if (adminRole.rows.length > 0) {
      await pool.query(
        'INSERT INTO utilisateurs_roles (id_utilisateur, id_role) VALUES ($1, $2)',
        [userId, adminRole.rows[0].id_role]
      );
      console.log('✅ Rôle ADMIN assigné');
    } else {
      console.error('❌ Le rôle ADMIN n\'existe pas dans la base de données !');
      console.error('   Exécutez d\'abord les scripts SQL de création de base de données.');
    }

    console.log('\n✅ Utilisateur admin créé avec succès !');
    console.log('\n📋 Identifiants:');
    console.log('   Email: admin@system.local');
    console.log('   Mot de passe: Admin123!');

  } catch (error) {
    console.error('\n❌ Erreur lors de la création de l\'utilisateur admin:');
    console.error('   Message:', error.message);
    console.error('   Code:', error.code);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Solution: Le serveur PostgreSQL n\'est pas accessible.');
      console.error('   - Vérifiez que le tunnel SSH est actif (port 5433)');
      console.error('   - Vérifiez la configuration dans .env');
    } else if (error.code === '28P01') {
      console.error('\n💡 Solution: Erreur d\'authentification.');
      console.error('   - Vérifiez le nom d\'utilisateur et le mot de passe dans .env');
    } else if (error.code === '3D000') {
      console.error('\n💡 Solution: La base de données n\'existe pas.');
      console.error('   - Vérifiez le nom de la base de données dans .env');
    }
    
    process.exit(1);
  } finally {
    await pool.end();
  }
}

createAdmin();
