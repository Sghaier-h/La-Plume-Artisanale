/**
 * Contrôleur Auth — Module modulaire
 * Login, logout, me (session courante)
 */

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../../../src/utils/db.js';
import { logger } from '../../../src/utils/logger.js';
import { mockUsers } from '../../../src/config/dev-users.js';
import { sendError, sendSuccess, handleError, HTTP_STATUS } from '../../../src/utils/error.helper.js';

// ── POST /api/auth/login ────────────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, HTTP_STATUS.BAD_REQUEST, 'Email et mot de passe requis');
    }

    // Mode mock : strictement NODE_ENV=development + USE_MOCK_AUTH=true
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' &&
                        process.env.NODE_ENV === 'development';

    if (useMockAuth) {
      const mockUser = mockUsers.find(u => u.email === email && u.password === password);

      if (mockUser) {
        const token = jwt.sign(
          { userId: mockUser.user.id, email: mockUser.user.email, role: mockUser.user.role },
          process.env.JWT_SECRET || 'dev-secret-key',
          { expiresIn: process.env.JWT_EXPIRE || '24h' }
        );

        logger.info('Login mock réussi', { email: mockUser.user.email, role: mockUser.user.role });
        return sendSuccess(res, { token, user: mockUser.user });
      }

      return sendError(res, HTTP_STATUS.UNAUTHORIZED, 'Identifiants invalides (mode développement)');
    }

    // Mode production — connexion BDD
    try {
      const result = await pool.query(
        `SELECT u.id_utilisateur, u.email, u.nom_utilisateur, u.mot_de_passe_hash, u.actif,
                u.derniere_connexion, e.nom, e.prenom, e.fonction,
                r.code_role as role
         FROM utilisateurs u
         LEFT JOIN equipe_fabrication e ON u.id_operateur = e.id_operateur
         LEFT JOIN utilisateurs_roles ur ON u.id_utilisateur = ur.id_utilisateur
         LEFT JOIN roles r ON ur.id_role = r.id_role
         WHERE u.email = $1 LIMIT 1`,
        [email]
      );

      if (result.rows.length === 0) {
        return sendError(res, HTTP_STATUS.UNAUTHORIZED, 'Identifiants invalides');
      }

      const user = result.rows[0];

      if (!user.actif) {
        return sendError(res, HTTP_STATUS.UNAUTHORIZED, 'Compte inactif');
      }

      // Vérifier mot de passe (bcrypt puis fallback crypt() PostgreSQL)
      let isValid = false;
      if (user.mot_de_passe_hash) {
        try {
          isValid = await bcrypt.compare(password, user.mot_de_passe_hash);
        } catch {
          const cryptResult = await pool.query(
            'SELECT ($1 = crypt($2, $3)) as valid',
            [password, user.mot_de_passe_hash, user.mot_de_passe_hash]
          );
          isValid = cryptResult.rows[0]?.valid || false;
        }
      }

      if (!isValid) {
        return sendError(res, HTTP_STATUS.UNAUTHORIZED, 'Identifiants invalides');
      }

      const roleMap = {
        'ADMIN': 'ADMIN', 'CHEF_PROD': 'CHEF_PRODUCTION',
        'TISSEUR': 'TISSEUR', 'MAG_MP': 'MAGASINIER',
        'CONTROLEUR': 'QUALITE', 'COMMERCIAL': 'COMMERCIAL'
      };
      const mappedRole = roleMap[user.role] || 'USER';

      const token = jwt.sign(
        { userId: user.id_utilisateur.toString(), email: user.email, role: mappedRole },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '24h' }
      );

      // Mise à jour dernière connexion (non bloquant)
      pool.query(
        'UPDATE utilisateurs SET derniere_connexion = CURRENT_TIMESTAMP WHERE id_utilisateur = $1',
        [user.id_utilisateur]
      ).catch(err => logger.warn('Impossible de mettre à jour la dernière connexion', { error: err.message }));

      logger.info('Login réussi', { email: user.email, role: mappedRole });

      return sendSuccess(res, {
        token,
        user: {
          id: user.id_utilisateur.toString(),
          email: user.email,
          nom: user.nom || user.nom_utilisateur,
          prenom: user.prenom || '',
          role: mappedRole
        }
      });
    } catch (dbError) {
      logger.error('Erreur BDD lors du login', { error: dbError.message });

      // Fallback mock en développement si la BDD est inaccessible
      if (process.env.NODE_ENV === 'development') {
        const mockUser = mockUsers.find(u => u.email === email && u.password === password);
        if (mockUser) {
          const token = jwt.sign(
            { userId: mockUser.user.id, email: mockUser.user.email, role: mockUser.user.role },
            process.env.JWT_SECRET || 'dev-secret-key',
            { expiresIn: process.env.JWT_EXPIRE || '24h' }
          );
          logger.warn('Login via fallback mock (BDD inaccessible)', { email });
          return sendSuccess(res, { token, user: mockUser.user });
        }
      }

      return sendError(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Erreur serveur');
    }
  } catch (error) {
    return handleError(res, error, 'login');
  }
};

// ── POST /api/auth/logout ───────────────────────────────────────────────
export const logout = async (req, res) => {
  return sendSuccess(res, { message: 'Déconnexion réussie' });
};

// ── GET /api/auth/me ────────────────────────────────────────────────────
export const me = async (req, res) => {
  try {
    // Mode mock
    if (process.env.NODE_ENV === 'development' && process.env.USE_MOCK_AUTH === 'true') {
      const mockUser = mockUsers.find(u => u.user.id === req.user?.id);
      return sendSuccess(res, {
        user: mockUser?.user || {
          id: req.user?.id || '1',
          email: req.user?.email || 'admin@system.local',
          nom: 'Admin', prenom: 'Système',
          role: req.user?.role || 'ADMIN',
          derniere_connexion: new Date().toISOString()
        }
      });
    }

    try {
      const result = await pool.query(
        `SELECT u.id_utilisateur, u.email, u.nom_utilisateur, u.derniere_connexion, u.actif,
                e.nom, e.prenom, e.fonction, r.code_role as role
         FROM utilisateurs u
         LEFT JOIN equipe_fabrication e ON u.id_operateur = e.id_operateur
         LEFT JOIN utilisateurs_roles ur ON u.id_utilisateur = ur.id_utilisateur
         LEFT JOIN roles r ON ur.id_role = r.id_role
         WHERE u.id_utilisateur = $1 LIMIT 1`,
        [req.user.id]
      );

      if (result.rows.length === 0) {
        return sendError(res, HTTP_STATUS.NOT_FOUND, 'Utilisateur non trouvé');
      }

      const user = result.rows[0];
      const roleMap = {
        'ADMIN': 'ADMIN', 'CHEF_PROD': 'CHEF_PRODUCTION',
        'TISSEUR': 'TISSEUR', 'MAG_MP': 'MAGASINIER',
        'CONTROLEUR': 'QUALITE', 'COMMERCIAL': 'COMMERCIAL'
      };

      return sendSuccess(res, {
        user: {
          id: user.id_utilisateur.toString(),
          email: user.email,
          nom: user.nom || user.nom_utilisateur,
          prenom: user.prenom || '',
          role: roleMap[user.role] || 'USER',
          derniere_connexion: user.derniere_connexion
        }
      });
    } catch (dbError) {
      logger.error('Erreur BDD dans /me', { error: dbError.message });

      if (process.env.NODE_ENV === 'development') {
        return sendSuccess(res, {
          user: {
            id: req.user?.id || '1', email: req.user?.email || 'admin@system.local',
            nom: 'Admin', prenom: 'Système', role: req.user?.role || 'ADMIN',
            derniere_connexion: new Date().toISOString()
          }
        });
      }

      return sendError(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Erreur serveur');
    }
  } catch (error) {
    return handleError(res, error, 'me');
  }
};
