import { pool } from '../utils/db.js';

// GET /api/ecommerce/boutiques - Liste boutiques
export const getBoutiques = async (req, res) => {
  try {
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: {
          boutiques: [
            {
              id_boutique: 1,
              code_boutique: 'BOUT-001',
              nom_boutique: 'Boutique La Plume',
              ia_activee: true
            }
          ]
        }
      });
    }

    const result = await pool.query('SELECT * FROM boutiques WHERE actif = TRUE ORDER BY nom_boutique');
    res.json({ success: true, data: { boutiques: result.rows } });
  } catch (error) {
    console.error('Erreur getBoutiques:', error);
    res.status(500).json({ success: false, error: { message: 'Erreur serveur' } });
  }
};

// GET /api/ecommerce/produits - Liste produits boutique
export const getProduitsBoutique = async (req, res) => {
  try {
    const { id_boutique, actif, en_vedette } = req.query;
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: {
          produits: [
            {
              id_produit_boutique: 1,
              reference_sku: 'SKU-001',
              nom_produit: 'Fouta Premium',
              prix_vente_ttc: 150,
              stock_disponible: 50
            }
          ]
        }
      });
    }

    let query = `
      SELECT p.*, a.designation as article_designation
      FROM produits_boutique p
      LEFT JOIN articles_catalogue a ON p.id_article = a.id_article
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (id_boutique) {
      query += ` AND p.id_boutique = $${paramIndex}`;
      params.push(id_boutique);
      paramIndex++;
    }
    if (actif !== undefined) {
      query += ` AND p.actif = $${paramIndex}`;
      params.push(actif === 'true');
      paramIndex++;
    }
    if (en_vedette !== undefined) {
      query += ` AND p.en_vedette = $${paramIndex}`;
      params.push(en_vedette === 'true');
      paramIndex++;
    }

    query += ` ORDER BY p.nom_produit LIMIT 100`;

    const result = await pool.query(query, params);
    res.json({ success: true, data: { produits: result.rows } });
  } catch (error) {
    console.error('Erreur getProduitsBoutique:', error);
    res.status(500).json({ success: false, error: { message: 'Erreur serveur' } });
  }
};

// GET /api/ecommerce/commandes - Liste commandes e-commerce
export const getCommandesEcommerce = async (req, res) => {
  try {
    const { id_boutique, statut, date_debut, date_fin } = req.query;
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: {
          commandes: [
            {
              id_commande: 1,
              numero_commande: 'CMD-2024-000001',
              email_client: 'client@example.com',
              total_ttc: 300,
              statut: 'CONFIRMEE'
            }
          ]
        }
      });
    }

    let query = `
      SELECT c.*, b.nom_boutique
      FROM commandes_ecommerce c
      LEFT JOIN boutiques b ON c.id_boutique = b.id_boutique
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (id_boutique) {
      query += ` AND c.id_boutique = $${paramIndex}`;
      params.push(id_boutique);
      paramIndex++;
    }
    if (statut) {
      query += ` AND c.statut = $${paramIndex}`;
      params.push(statut);
      paramIndex++;
    }
    if (date_debut) {
      query += ` AND c.date_commande >= $${paramIndex}`;
      params.push(date_debut);
      paramIndex++;
    }
    if (date_fin) {
      query += ` AND c.date_commande <= $${paramIndex}`;
      params.push(date_fin);
      paramIndex++;
    }

    query += ` ORDER BY c.date_commande DESC LIMIT 100`;

    const result = await pool.query(query, params);
    res.json({ success: true, data: { commandes: result.rows } });
  } catch (error) {
    console.error('Erreur getCommandesEcommerce:', error);
    res.status(500).json({ success: false, error: { message: 'Erreur serveur' } });
  }
};

// GET /api/ecommerce/recommandations/:id_produit - Recommandations IA
export const getRecommandationsIA = async (req, res) => {
  try {
    const { id_produit } = req.params;
    const { id_boutique } = req.query;
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: {
          recommandations: [
            {
              id_produit_recommande: 2,
              score_ia: 85.5,
              algorithme_ia: 'collaborative_filtering'
            }
          ]
        }
      });
    }

    const result = await pool.query(`
      SELECT r.*, p.nom_produit, p.prix_vente_ttc, p.images
      FROM recommandations_ia r
      JOIN produits_boutique p ON r.id_produit_recommande = p.id_produit_boutique
      WHERE r.id_produit_source = $1 AND r.actif = TRUE
      ORDER BY r.score_ia DESC
      LIMIT 10
    `, [id_produit]);

    res.json({ success: true, data: { recommandations: result.rows } });
  } catch (error) {
    console.error('Erreur getRecommandationsIA:', error);
    res.status(500).json({ success: false, error: { message: 'Erreur serveur' } });
  }
};

// POST /api/ecommerce/generer-recommandations - Générer recommandations IA
export const genererRecommandationsIA = async (req, res) => {
  try {
    const { id_boutique, id_produit } = req.body;
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: {
          message: 'Recommandations générées (mode mock)',
          nb_recommandations: 5
        }
      });
    }

    // TODO: Implémenter algorithme IA de recommandation
    // - Analyse des ventes similaires
    // - Analyse des tags produits
    // - Machine learning

    await pool.query('SELECT generer_recommandations_ia($1, $2)', [id_produit, id_boutique]);

    res.json({
      success: true,
      data: {
        message: 'Recommandations générées avec succès'
      }
    });
  } catch (error) {
    console.error('Erreur genererRecommandationsIA:', error);
    res.status(500).json({ success: false, error: { message: 'Erreur serveur' } });
  }
};
