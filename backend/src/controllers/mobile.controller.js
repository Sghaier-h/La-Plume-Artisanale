import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../utils/db.js';

// Login optimisé pour mobile
export const mobileLogin = async (req, res) => {
  try {
    const { email, password, deviceId, deviceInfo } = req.body;

    // Récupérer l'utilisateur
    const result = await pool.query(
      `SELECT u.*, e.fonction, e.departement 
       FROM utilisateurs u 
       LEFT JOIN equipe_fabrication e ON u.id_operateur = e.id_operateur 
       WHERE u.email = $1 AND u.actif = true`,
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

    // Générer tokens (access + refresh pour mobile)
    const accessToken = jwt.sign(
      {
        id: user.id_utilisateur,
        email: user.email,
        fonction: user.fonction,
        type: 'mobile'
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const refreshToken = jwt.sign(
      { id: user.id_utilisateur, type: 'refresh' },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Enregistrer le device (optionnel)
    if (deviceId) {
      await pool.query(
        `INSERT INTO devices_mobile (id_utilisateur, device_id, device_info, date_connexion)
         VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
         ON CONFLICT (id_utilisateur, device_id) 
         DO UPDATE SET date_connexion = CURRENT_TIMESTAMP`,
        [user.id_utilisateur, deviceId, JSON.stringify(deviceInfo)]
      );
    }

    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user.id_utilisateur,
        email: user.email,
        fonction: user.fonction,
        departement: user.departement
      }
    });
  } catch (error) {
    console.error('Erreur mobileLogin:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Refresh token
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    
    if (decoded.type !== 'refresh') {
      return res.status(403).json({ error: 'Token invalide' });
    }

    // Récupérer l'utilisateur
    const result = await pool.query(
      'SELECT id_utilisateur, email FROM utilisateurs WHERE id_utilisateur = $1',
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    const user = result.rows[0];

    // Nouveau access token
    const accessToken = jwt.sign(
      { id: user.id_utilisateur, email: user.email, type: 'mobile' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ accessToken });
  } catch (error) {
    res.status(403).json({ error: 'Token invalide' });
  }
};

// Dashboard mobile par rôle
export const getMobileDashboard = async (req, res) => {
  try {
    const { role } = req.params;
    const userId = req.user.id;

    // Récupérer les données selon le rôle
    let data = {};

    switch (role) {
      case 'tisseur':
        data = await getTisseurDashboard(userId);
        break;
      case 'coupeur':
        data = await getCoupeurDashboard(userId);
        break;
      case 'mecanicien':
        data = await getMecanicienDashboard(userId);
        break;
      case 'magasinier-mp':
        data = await getMagasinierMPDashboard(userId);
        break;
      case 'magasinier-pf':
        data = await getMagasinierPFDashboard(userId);
        break;
      case 'controleur':
        data = await getControleurDashboard(userId);
        break;
      default:
        return res.status(400).json({ error: 'Rôle invalide' });
    }

    res.json(data);
  } catch (error) {
    console.error('Erreur getMobileDashboard:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Fonctions helpers pour chaque rôle
const getTisseurDashboard = async (userId) => {
  const result = await pool.query(
    `SELECT o.*, a.designation, m.numero_machine
     FROM ordres_fabrication o
     JOIN articles_catalogue a ON o.id_article = a.id_article
     LEFT JOIN planning_machines p ON o.id_of = p.id_of
     LEFT JOIN machines m ON p.id_machine = m.id_machine
     WHERE o.statut IN ('en_cours', 'planifie')
     ORDER BY o.priorite DESC, o.date_debut_prevue
     LIMIT 20`
  );
  
  return {
    ofs: result.rows,
    alertes: [],
    notifications: []
  };
};

const getCoupeurDashboard = async (userId) => {
  // Dashboard coupeur
  return { lots: [], alertes: [] };
};

const getMecanicienDashboard = async (userId) => {
  // Dashboard mécanicien
  return { interventions: [], alertes: [] };
};

const getMagasinierMPDashboard = async (userId) => {
  // Dashboard magasinier MP
  return { preparations: [], transferts: [] };
};

const getMagasinierPFDashboard = async (userId) => {
  // Dashboard magasinier PF
  return { colis: [], palettes: [] };
};

const getControleurDashboard = async (userId) => {
  // Dashboard contrôleur
  return { controles: [], nc: [] };
};

// Synchronisation données (mode hors ligne)
export const syncData = async (req, res) => {
  try {
    const { data, lastSync } = req.body;
    
    // Traiter les données synchronisées
    // Enregistrer les actions en mode hors ligne
    
    res.json({ 
      success: true, 
      synced: data.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur synchronisation' });
  }
};

// Upload photo
export const uploadPhoto = async (req, res) => {
  try {
    // Gérer l'upload de photo
    // Sauvegarder dans /uploads/photos/
    
    res.json({ 
      success: true, 
      url: '/uploads/photos/photo.jpg'
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur upload' });
  }
};

