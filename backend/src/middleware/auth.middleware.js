import jwt from 'jsonwebtoken';
import { pool } from '../utils/db.js';

export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: { message: 'Token manquant' }
      });
    }

    // Mode développement/staging avec mock auth
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && 
                       (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'staging');
    
    if (useMockAuth) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-key');
        
        // En mode mock, accepter le token si valide
        req.user = {
          id: decoded.userId || '1',
          email: decoded.email || 'admin@system.local',
          role: decoded.role || 'ADMIN'
        };
        
        return next();
      } catch (jwtError) {
        return res.status(401).json({
          success: false,
          error: { message: 'Token invalide' }
        });
      }
    }

    // Mode production - vérifier dans la base de données
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    try {
      // Vérifier l'utilisateur dans les tables existantes
      const result = await pool.query(
        `SELECT 
          u.id_utilisateur,
          u.email,
          u.actif,
          r.code_role as role
        FROM utilisateurs u
        LEFT JOIN utilisateurs_roles ur ON u.id_utilisateur = ur.id_utilisateur
        LEFT JOIN roles r ON ur.id_role = r.id_role
        WHERE u.id_utilisateur = $1
        LIMIT 1`,
        [decoded.userId]
      );

      if (result.rows.length === 0 || !result.rows[0].actif) {
        return res.status(401).json({
          success: false,
          error: { message: 'Utilisateur invalide ou inactif' }
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

      req.user = {
        id: user.id_utilisateur.toString(),
        email: user.email,
        role: roleMap[user.role] || 'USER'
      };
      
      return next();
    } catch (dbError) {
      // Si erreur DB en développement, utiliser le mode mock
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️  Erreur DB, utilisation du mode mock pour l\'authentification');
        req.user = {
          id: decoded.userId || '1',
          email: decoded.email || 'admin@system.local',
          role: decoded.role || 'ADMIN'
        };
        return next();
      }
      
      throw dbError;
    }
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: { message: 'Token invalide' }
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Non authentifié' }
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: { message: 'Accès refusé' }
      });
    }

    next();
  };
};

// Alias pour compatibilité
export const authenticateToken = authenticate;
export const requireRole = authorize;
