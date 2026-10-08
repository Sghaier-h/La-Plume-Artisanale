/**
 * Middleware d'auth pour le Portail Client (JWT avec claim portail:true)
 */
import jwt from 'jsonwebtoken';

export const portailAuth = (req, res, next) => {
  const auth = req.headers.authorization?.replace('Bearer ', '');
  if (!auth) {
    return res.status(401).json({ success: false, error: { message: 'Non authentifié' } });
  }
  try {
    const decoded = jwt.verify(auth, process.env.JWT_SECRET || 'dev-secret-key');
    if (!decoded.portail) {
      return res.status(403).json({ success: false, error: { message: 'Accès portail requis' } });
    }
    req.portail = { id_client: decoded.id_client, email: decoded.email };
    return next();
  } catch {
    return res.status(401).json({ success: false, error: { message: 'Token invalide' } });
  }
};

export default portailAuth;
