import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../utils/db.js';

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Récupérer l'utilisateur
    const result = await pool.query(
      'SELECT u.*, e.fonction FROM utilisateurs u LEFT JOIN equipe_fabrication e ON u.id_operateur = e.id_operateur WHERE u.email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    const user = result.rows[0];

    // Vérifier le mot de passe
    const validPassword = await bcrypt.compare(password, user.mot_de_passe_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    // Générer le token JWT
    const token = jwt.sign(
      {
        id: user.id_utilisateur,
        email: user.email,
        fonction: user.fonction,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id_utilisateur,
        email: user.email,
        fonction: user.fonction,
      },
    });
  } catch (error) {
    console.error('Erreur login:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const logout = async (req, res) => {
  // Mettre à jour dernière connexion
  try {
    await pool.query(
      'UPDATE utilisateurs SET derniere_connexion = CURRENT_TIMESTAMP WHERE id_utilisateur = $1',
      [req.user.id]
    );
    res.json({ message: 'Déconnexion réussie' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id_utilisateur, u.email, u.nom_utilisateur, e.fonction, e.nom, e.prenom
       FROM utilisateurs u
       LEFT JOIN equipe_fabrication e ON u.id_operateur = e.id_operateur
       WHERE u.id_utilisateur = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur getCurrentUser:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

