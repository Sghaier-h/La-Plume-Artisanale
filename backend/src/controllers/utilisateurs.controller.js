import bcrypt from 'bcrypt';
import { pool } from '../utils/db.js';

// Rôles disponibles dans le système
const ROLES_DISPONIBLES = [
  { code: 'ADMIN', libelle: 'Administrateur', description: 'Accès complet au système' },
  { code: 'CHEF_PROD', libelle: 'Chef de Production', description: 'Gestion de la production' },
  { code: 'TISSEUR', libelle: 'Tisseur', description: 'Suivi production tisseur' },
  { code: 'MAG_MP', libelle: 'Magasinier MP', description: 'Gestion matières premières' },
  { code: 'MAG_PF', libelle: 'Magasinier PF', description: 'Gestion produits finis' },
  { code: 'CONTROLEUR', libelle: 'Contrôleur Qualité', description: 'Contrôles qualité' },
  { code: 'COMMERCIAL', libelle: 'Commercial', description: 'Gestion commerciale' },
  { code: 'COUPEUR', libelle: 'Coupeur', description: 'Poste coupe' },
  { code: 'MECANICIEN', libelle: 'Mécanicien', description: 'Maintenance machines' },
  { code: 'CHEF_ATELIER', libelle: 'Chef d\'Atelier', description: 'Gestion atelier' },
  { code: 'USER', libelle: 'Utilisateur', description: 'Accès limité' }
];

// Dashboards disponibles
const DASHBOARDS_DISPONIBLES = [
  { code: 'dashboard', libelle: 'Dashboard Administrateur' },
  { code: 'magasinier-mp', libelle: 'Dashboard Magasinier MP' },
  { code: 'tisseur', libelle: 'Dashboard Tisseur' },
  { code: 'mecanicien', libelle: 'Dashboard Mécanicien' },
  { code: 'coupe', libelle: 'Dashboard Coupe' },
  { code: 'controle-central', libelle: 'Dashboard Contrôle Central' },
  { code: 'chef-atelier', libelle: 'Dashboard Chef d\'Atelier' },
  { code: 'magasin-pf', libelle: 'Dashboard Magasin PF' },
  { code: 'magasinier-soustraitants', libelle: 'Dashboard Magasinier Soustraitants' },
  { code: 'chef-production', libelle: 'Dashboard Chef Production' }
];

// GET /api/utilisateurs - Liste des utilisateurs
export const getUtilisateurs = async (req, res) => {
  try {
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: {
          utilisateurs: [
            {
              id_utilisateur: 1,
              email: 'admin@system.local',
              nom_utilisateur: 'Admin Système',
              nom: 'Admin',
              prenom: 'Système',
              actif: true,
              role: 'ADMIN',
              dashboards: ['dashboard'],
              derniere_connexion: new Date().toISOString()
            }
          ],
          roles: ROLES_DISPONIBLES,
          dashboards: DASHBOARDS_DISPONIBLES
        }
      });
    }

    // Récupérer les utilisateurs avec leurs rôles
    const result = await pool.query(`
      SELECT 
        u.id_utilisateur,
        u.email,
        u.nom_utilisateur,
        u.actif,
        u.derniere_connexion,
        u.date_creation,
        e.nom,
        e.prenom,
        e.fonction,
        r.code_role as role,
        r.libelle as role_libelle
      FROM utilisateurs u
      LEFT JOIN equipe_fabrication e ON u.id_operateur = e.id_operateur
      LEFT JOIN utilisateurs_roles ur ON u.id_utilisateur = ur.id_utilisateur
      LEFT JOIN roles r ON ur.id_role = r.id_role
      ORDER BY u.date_creation DESC
    `);

    // Récupérer les dashboards attribués
    const dashboardsResult = await pool.query(`
      SELECT id_utilisateur, code_dashboard
      FROM utilisateurs_dashboards
    `);

    const dashboardsMap: any = {};
    dashboardsResult.rows.forEach((row: any) => {
      if (!dashboardsMap[row.id_utilisateur]) {
        dashboardsMap[row.id_utilisateur] = [];
      }
      dashboardsMap[row.id_utilisateur].push(row.code_dashboard);
    });

    const utilisateurs = result.rows.map((row: any) => ({
      ...row,
      dashboards: dashboardsMap[row.id_utilisateur] || []
    }));

    res.json({
      success: true,
      data: {
        utilisateurs,
        roles: ROLES_DISPONIBLES,
        dashboards: DASHBOARDS_DISPONIBLES
      }
    });
  } catch (error) {
    console.error('Erreur getUtilisateurs:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// GET /api/utilisateurs/:id - Détails d'un utilisateur
export const getUtilisateurById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT 
        u.*,
        e.nom,
        e.prenom,
        e.fonction,
        r.code_role as role
      FROM utilisateurs u
      LEFT JOIN equipe_fabrication e ON u.id_operateur = e.id_operateur
      LEFT JOIN utilisateurs_roles ur ON u.id_utilisateur = ur.id_utilisateur
      LEFT JOIN roles r ON ur.id_role = r.id_role
      WHERE u.id_utilisateur = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Utilisateur non trouvé' }
      });
    }

    // Récupérer les dashboards
    const dashboardsResult = await pool.query(`
      SELECT code_dashboard
      FROM utilisateurs_dashboards
      WHERE id_utilisateur = $1
    `, [id]);

    const utilisateur = {
      ...result.rows[0],
      dashboards: dashboardsResult.rows.map((r: any) => r.code_dashboard)
    };

    res.json({
      success: true,
      data: utilisateur
    });
  } catch (error) {
    console.error('Erreur getUtilisateurById:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// POST /api/utilisateurs - Créer un utilisateur
export const createUtilisateur = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { email, password, nom_utilisateur, nom, prenom, fonction, role, dashboards, id_operateur, actif } = req.body;

    // Validation
    if (!email || !password) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        error: { message: 'Email et mot de passe requis' }
      });
    }

    // Vérifier si l'email existe déjà
    const existingUser = await client.query(
      'SELECT id_utilisateur FROM utilisateurs WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        error: { message: 'Cet email est déjà utilisé' }
      });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur
    const userResult = await client.query(`
      INSERT INTO utilisateurs (email, mot_de_passe_hash, nom_utilisateur, id_operateur, actif, date_creation)
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
      RETURNING id_utilisateur
    `, [email, hashedPassword, nom_utilisateur || email, id_operateur || null, actif !== false]);

    const userId = userResult.rows[0].id_utilisateur;

    // Assigner le rôle
    if (role) {
      const roleResult = await client.query(
        'SELECT id_role FROM roles WHERE code_role = $1',
        [role]
      );

      if (roleResult.rows.length > 0) {
        await client.query(`
          INSERT INTO utilisateurs_roles (id_utilisateur, id_role)
          VALUES ($1, $2)
          ON CONFLICT DO NOTHING
        `, [userId, roleResult.rows[0].id_role]);
      }
    }

    // Attribuer les dashboards
    if (dashboards && Array.isArray(dashboards)) {
      for (const dashboard of dashboards) {
        await client.query(`
          INSERT INTO utilisateurs_dashboards (id_utilisateur, code_dashboard)
          VALUES ($1, $2)
          ON CONFLICT DO NOTHING
        `, [userId, dashboard]);
      }
    }

    await client.query('COMMIT');

    res.json({
      success: true,
      data: { 
        message: 'Utilisateur créé avec succès',
        id_utilisateur: userId
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erreur createUtilisateur:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  } finally {
    client.release();
  }
};

// PUT /api/utilisateurs/:id - Mettre à jour un utilisateur
export const updateUtilisateur = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const { email, password, nom_utilisateur, nom, prenom, fonction, role, dashboards, actif } = req.body;

    // Vérifier si l'utilisateur existe
    const existingUser = await client.query(
      'SELECT id_utilisateur FROM utilisateurs WHERE id_utilisateur = $1',
      [id]
    );

    if (existingUser.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        error: { message: 'Utilisateur non trouvé' }
      });
    }

    // Mettre à jour les informations de base
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (email) {
      // Vérifier si l'email est déjà utilisé par un autre utilisateur
      const emailCheck = await client.query(
        'SELECT id_utilisateur FROM utilisateurs WHERE email = $1 AND id_utilisateur != $2',
        [email, id]
      );

      if (emailCheck.rows.length > 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          error: { message: 'Cet email est déjà utilisé' }
        });
      }

      updates.push(`email = $${paramIndex}`);
      values.push(email);
      paramIndex++;
    }

    if (nom_utilisateur !== undefined) {
      updates.push(`nom_utilisateur = $${paramIndex}`);
      values.push(nom_utilisateur);
      paramIndex++;
    }

    if (actif !== undefined) {
      updates.push(`actif = $${paramIndex}`);
      values.push(actif);
      paramIndex++;
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.push(`mot_de_passe_hash = $${paramIndex}`);
      values.push(hashedPassword);
      paramIndex++;
    }

    if (updates.length > 0) {
      values.push(id);
      await client.query(`
        UPDATE utilisateurs 
        SET ${updates.join(', ')}, date_modification = CURRENT_TIMESTAMP
        WHERE id_utilisateur = $${paramIndex}
      `, values);
    }

    // Mettre à jour le rôle
    if (role) {
      const roleResult = await client.query(
        'SELECT id_role FROM roles WHERE code_role = $1',
        [role]
      );

      if (roleResult.rows.length > 0) {
        // Supprimer les anciens rôles
        await client.query(
          'DELETE FROM utilisateurs_roles WHERE id_utilisateur = $1',
          [id]
        );

        // Ajouter le nouveau rôle
        await client.query(`
          INSERT INTO utilisateurs_roles (id_utilisateur, id_role)
          VALUES ($1, $2)
        `, [id, roleResult.rows[0].id_role]);
      }
    }

    // Mettre à jour les dashboards
    if (dashboards !== undefined) {
      // Supprimer les anciens dashboards
      await client.query(
        'DELETE FROM utilisateurs_dashboards WHERE id_utilisateur = $1',
        [id]
      );

      // Ajouter les nouveaux dashboards
      if (Array.isArray(dashboards) && dashboards.length > 0) {
        for (const dashboard of dashboards) {
          await client.query(`
            INSERT INTO utilisateurs_dashboards (id_utilisateur, code_dashboard)
            VALUES ($1, $2)
          `, [id, dashboard]);
        }
      }
    }

    await client.query('COMMIT');

    res.json({
      success: true,
      data: { message: 'Utilisateur mis à jour avec succès' }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erreur updateUtilisateur:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  } finally {
    client.release();
  }
};

// DELETE /api/utilisateurs/:id - Supprimer un utilisateur
export const deleteUtilisateur = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { id } = req.params;

    // Supprimer les relations
    await client.query('DELETE FROM utilisateurs_roles WHERE id_utilisateur = $1', [id]);
    await client.query('DELETE FROM utilisateurs_dashboards WHERE id_utilisateur = $1', [id]);

    // Supprimer l'utilisateur
    await client.query('DELETE FROM utilisateurs WHERE id_utilisateur = $1', [id]);

    await client.query('COMMIT');

    res.json({
      success: true,
      data: { message: 'Utilisateur supprimé avec succès' }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erreur deleteUtilisateur:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  } finally {
    client.release();
  }
};

// GET /api/utilisateurs/roles - Liste des rôles disponibles
export const getRoles = async (req, res) => {
  try {
    res.json({
      success: true,
      data: ROLES_DISPONIBLES
    });
  } catch (error) {
    console.error('Erreur getRoles:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// GET /api/utilisateurs/dashboards - Liste des dashboards disponibles
export const getDashboards = async (req, res) => {
  try {
    res.json({
      success: true,
      data: DASHBOARDS_DISPONIBLES
    });
  } catch (error) {
    console.error('Erreur getDashboards:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};
