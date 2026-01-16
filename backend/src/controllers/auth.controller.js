import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../utils/db.js';

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: { message: 'Email et mot de passe requis' }
      });
    }

    // Mode développement/staging sans base de données (fallback)
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' || 
                       (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'staging');
    
    if (useMockAuth) {
      // Utilisateurs mock pour le développement/staging
      const mockUsers = [
        {
          email: 'admin@system.local',
          password: 'Admin123!',
          user: {
            id: '1',
            email: 'admin@system.local',
            nom: 'Admin',
            prenom: 'Système',
            role: 'ADMIN'
          }
        },
        {
          email: 'chef.production@entreprise.local',
          password: 'User123!',
          user: {
            id: '2',
            email: 'chef.production@entreprise.local',
            nom: 'Chef',
            prenom: 'Production',
            role: 'CHEF_PRODUCTION'
          }
        },
        {
          email: 'tisseur@entreprise.local',
          password: 'User123!',
          user: {
            id: '3',
            email: 'tisseur@entreprise.local',
            nom: 'Tisseur',
            prenom: 'Test',
            role: 'TISSEUR'
          }
        },
        {
          email: 'magasinier.mp@entreprise.local',
          password: 'User123!',
          user: {
            id: '4',
            email: 'magasinier.mp@entreprise.local',
            nom: 'Magasinier',
            prenom: 'MP',
            role: 'MAGASINIER'
          }
        },
        {
          email: 'coupeur@entreprise.local',
          password: 'User123!',
          user: {
            id: '5',
            email: 'coupeur@entreprise.local',
            nom: 'Coupeur',
            prenom: 'Test',
            role: 'COUPEUR'
          }
        },
        {
          email: 'controleur.qualite@entreprise.local',
          password: 'User123!',
          user: {
            id: '6',
            email: 'controleur.qualite@entreprise.local',
            nom: 'Contrôleur',
            prenom: 'Qualité',
            role: 'CONTROLEUR_QUALITE'
          }
        },
        {
          email: 'commercial@entreprise.local',
          password: 'User123!',
          user: {
            id: '7',
            email: 'commercial@entreprise.local',
            nom: 'Commercial',
            prenom: 'Test',
            role: 'COMMERCIAL'
          }
        }
      ];

      const mockUser = mockUsers.find(u => u.email === email && u.password === password);
      
      if (mockUser) {
        const token = jwt.sign(
          { 
            userId: mockUser.user.id, 
            email: mockUser.user.email, 
            role: mockUser.user.role 
          },
          process.env.JWT_SECRET || 'dev-secret-key',
          { expiresIn: process.env.JWT_EXPIRE || '24h' }
        );

        return res.json({
          success: true,
          data: {
            token,
            user: mockUser.user
          }
        });
      }

      return res.status(401).json({
        success: false,
        error: { message: 'Identifiants invalides. Utilisez admin@system.local / Admin123! en mode mock' }
      });
    }

    // Mode production - connexion à la base de données
    try {
      // Trouver l'utilisateur dans les tables existantes
      const result = await pool.query(
        `SELECT 
          u.id_utilisateur,
          u.email,
          u.nom_utilisateur,
          u.mot_de_passe_hash,
          u.actif,
          u.derniere_connexion,
          e.nom,
          e.prenom,
          e.fonction,
          r.code_role as role
        FROM utilisateurs u
        LEFT JOIN equipe_fabrication e ON u.id_operateur = e.id_operateur
        LEFT JOIN utilisateurs_roles ur ON u.id_utilisateur = ur.id_utilisateur
        LEFT JOIN roles r ON ur.id_role = r.id_role
        WHERE u.email = $1
        LIMIT 1`,
        [email]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({
          success: false,
          error: { message: 'Identifiants invalides' }
        });
      }

      const user = result.rows[0];

      if (!user.actif) {
        return res.status(401).json({
          success: false,
          error: { message: 'Compte inactif' }
        });
      }

      // Vérifier le mot de passe
      // Support à la fois bcrypt et crypt() de PostgreSQL
      let isValid = false;
      
      if (user.mot_de_passe_hash) {
        // Essayer bcrypt d'abord
        try {
          isValid = await bcrypt.compare(password, user.mot_de_passe_hash);
        } catch (bcryptError) {
          // Si bcrypt échoue, essayer avec crypt() de PostgreSQL
          if (!isValid) {
            const cryptResult = await pool.query(
              'SELECT ($1 = crypt($2, $3)) as valid',
              [password, user.mot_de_passe_hash, user.mot_de_passe_hash]
            );
            isValid = cryptResult.rows[0]?.valid || false;
          }
        }
      }

      if (!isValid) {
        return res.status(401).json({
          success: false,
          error: { message: 'Identifiants invalides' }
        });
      }

      // Mapper le rôle (code_role vers enum Prisma)
      const roleMap = {
        'ADMIN': 'ADMIN',
        'CHEF_PROD': 'CHEF_PRODUCTION',
        'TISSEUR': 'TISSEUR',
        'MAG_MP': 'MAGASINIER',
        'CONTROLEUR': 'QUALITE',
        'COMMERCIAL': 'COMMERCIAL'
      };
      const mappedRole = roleMap[user.role] || 'USER';

      // Générer le token JWT
      const token = jwt.sign(
        { 
          userId: user.id_utilisateur.toString(), 
          email: user.email, 
          role: mappedRole 
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '24h' }
      );

      // Mettre à jour dernière connexion
      try {
        await pool.query(
          'UPDATE utilisateurs SET derniere_connexion = CURRENT_TIMESTAMP WHERE id_utilisateur = $1',
          [user.id_utilisateur]
        );
      } catch (updateError) {
        // Ignorer les erreurs de mise à jour
        console.warn('Impossible de mettre à jour la dernière connexion:', updateError.message);
      }

      // Retourner les données
      return res.json({
        success: true,
        data: {
          token,
          user: {
            id: user.id_utilisateur.toString(),
            email: user.email,
            nom: user.nom || user.nom_utilisateur,
            prenom: user.prenom || '',
            role: mappedRole
          }
        }
      });
    } catch (dbError) {
      console.error('Erreur base de données:', dbError);
      
      // En mode développement, utiliser le mode mock si la connexion échoue
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️  Connexion base de données échouée, utilisation du mode mock');
        
        if (email === 'admin@system.local' && password === 'Admin123!') {
          const token = jwt.sign(
            { 
              userId: '1', 
              email: 'admin@system.local', 
              role: 'ADMIN' 
            },
            process.env.JWT_SECRET || 'dev-secret-key',
            { expiresIn: process.env.JWT_EXPIRE || '24h' }
          );

          return res.json({
            success: true,
            data: {
              token,
              user: {
                id: '1',
                email: 'admin@system.local',
                nom: 'Admin',
                prenom: 'Système',
                role: 'ADMIN'
              }
            }
          });
        }
      }

      // Sinon, retourner l'erreur
      return res.status(500).json({
        success: false,
        error: { 
          message: 'Erreur serveur',
          details: process.env.NODE_ENV === 'development' ? dbError.message : undefined
        }
      });
    }
  } catch (error) {
    console.error('Erreur login:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

export const logout = async (req, res) => {
  // JWT est stateless, pas besoin de supprimer côté serveur
  // Le client supprime simplement le token
  res.json({
    success: true,
    data: { message: 'Déconnexion réussie' }
  });
};

export const me = async (req, res) => {
  try {
    // Mode développement sans base de données
    if (process.env.NODE_ENV === 'development' && process.env.USE_MOCK_AUTH === 'true') {
      return res.json({
        success: true,
        data: {
          user: {
            id: req.user?.id || '1',
            email: req.user?.email || 'admin@system.local',
            nom: 'Admin',
            prenom: 'Système',
            role: req.user?.role || 'ADMIN',
            derniere_connexion: new Date().toISOString()
          }
        }
      });
    }

    try {
      const result = await pool.query(
        `SELECT 
          u.id_utilisateur,
          u.email,
          u.nom_utilisateur,
          u.derniere_connexion,
          u.actif,
          e.nom,
          e.prenom,
          e.fonction,
          r.code_role as role
        FROM utilisateurs u
        LEFT JOIN equipe_fabrication e ON u.id_operateur = e.id_operateur
        LEFT JOIN utilisateurs_roles ur ON u.id_utilisateur = ur.id_utilisateur
        LEFT JOIN roles r ON ur.id_role = r.id_role
        WHERE u.id_utilisateur = $1
        LIMIT 1`,
        [req.user.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: { message: 'Utilisateur non trouvé' }
        });
      }

      const user = result.rows[0];

      // Mapper le rôle
      const roleMap = {
        'ADMIN': 'ADMIN',
        'CHEF_PROD': 'CHEF_PRODUCTION',
        'TISSEUR': 'TISSEUR',
        'MAG_MP': 'MAGASINIER',
        'CONTROLEUR': 'QUALITE',
        'COMMERCIAL': 'COMMERCIAL'
      };
      const mappedRole = roleMap[user.role] || 'USER';

      return res.json({
        success: true,
        data: {
          user: {
            id: user.id_utilisateur.toString(),
            email: user.email,
            nom: user.nom || user.nom_utilisateur,
            prenom: user.prenom || '',
            role: mappedRole,
            derniere_connexion: user.derniere_connexion
          }
        }
      });
    } catch (dbError) {
      console.error('Erreur base de données:', dbError);
      
      // En mode développement, utiliser le mode mock si la connexion échoue
      if (process.env.NODE_ENV === 'development') {
        return res.json({
          success: true,
          data: {
            user: {
              id: req.user?.id || '1',
              email: req.user?.email || 'admin@system.local',
              nom: 'Admin',
              prenom: 'Système',
              role: req.user?.role || 'ADMIN',
              derniere_connexion: new Date().toISOString()
            }
          }
        });
      }

      return res.status(500).json({
        success: false,
        error: { message: 'Erreur serveur' }
      });
    }
  } catch (error) {
    console.error('Erreur me:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};
