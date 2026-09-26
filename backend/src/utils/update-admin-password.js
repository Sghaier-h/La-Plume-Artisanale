import bcrypt from 'bcrypt';
import { pool } from './db.js';

async function updateAdminPassword() {
  console.log('🔧 Mise à jour du mot de passe admin pour Hamdi Sghaier...\n');

  try {
    // Vérifier la connexion
    const testResult = await pool.query('SELECT NOW()');
    console.log('✅ Connexion à la base de données OK');
    console.log(`   Heure serveur: ${testResult.rows[0].now}\n`);

    const email = 'responsable@laplume-artisanale.tn';
    const password = 'Allbyfouta#007';

    // Vérifier si l'utilisateur existe
    const userCheck = await pool.query(
      'SELECT id_utilisateur, email, prenom, nom, actif FROM users WHERE email = $1',
      [email]
    );

    if (userCheck.rows.length === 0) {
      console.error(`❌ L'utilisateur ${email} n'existe pas !`);
      console.error('   Exécutez d\'abord le script 05_utilisateurs_data.sql pour créer les utilisateurs.');
      process.exit(1);
    }

    const user = userCheck.rows[0];
    console.log(`✅ Utilisateur trouvé:`);
    console.log(`   ID: ${user.id_utilisateur}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Nom: ${user.prenom} ${user.nom}`);
    console.log(`   Actif: ${user.actif}`);

    // Vérifier le rôle
    const roleCheck = await pool.query(`
      SELECT r.code_role, r.nom_role
      FROM users_roles ur
      JOIN roles r ON ur.id_role = r.id_role
      WHERE ur.id_utilisateur = $1
      LIMIT 1
    `, [user.id_utilisateur]);

    if (roleCheck.rows.length > 0) {
      console.log(`   Rôle: ${roleCheck.rows[0].code_role} (${roleCheck.rows[0].nom_role})`);
    } else {
      console.log('   ⚠️  Aucun rôle assigné - Attribution du rôle ADMIN...');
      
      // Trouver le rôle ADMIN
      const adminRole = await pool.query(
        "SELECT id_role FROM roles WHERE code_role = 'ADMIN' LIMIT 1"
      );

      if (adminRole.rows.length > 0) {
        await pool.query(
          'INSERT INTO users_roles (id_utilisateur, id_role) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [user.id_utilisateur, adminRole.rows[0].id_role]
        );
        console.log('   ✅ Rôle ADMIN assigné');
      } else {
        console.error('   ❌ Le rôle ADMIN n\'existe pas dans la base de données !');
      }
    }

    // Mettre à jour le mot de passe avec bcrypt
    console.log('\n🔄 Mise à jour du mot de passe avec bcrypt...');
    const hashedPassword = await bcrypt.hash(password, 10);
    
    await pool.query(
      'UPDATE users SET mot_de_passe_hash = $1, actif = true WHERE id_utilisateur = $2',
      [hashedPassword, user.id_utilisateur]
    );
    
    console.log('✅ Mot de passe mis à jour avec succès');
    console.log('\n📋 Identifiants:');
    console.log(`   Email: ${email}`);
    console.log(`   Mot de passe: ${password}`);
    console.log('\n✅ Mise à jour terminée !');
    
  } catch (error) {
    console.error('\n❌ Erreur lors de la mise à jour du mot de passe:');
    console.error('   Message:', error.message);
    console.error('   Code:', error.code);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Solution: Le serveur PostgreSQL n\'est pas accessible.');
      console.error('   - Vérifiez que PostgreSQL est démarré');
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

updateAdminPassword();
