import { pool } from '../utils/db.js';

// GET /api/clients - Liste tous les clients
export const getClients = async (req, res) => {
  try {
    const { search, actif } = req.query;
    
    let query = `
      SELECT 
        id_client,
        code_client,
        raison_sociale,
        adresse,
        code_postal,
        ville,
        pays,
        telephone,
        email,
        contact_principal,
        conditions_paiement,
        plafond_credit,
        devise,
        taux_remise,
        actif,
        date_creation
      FROM clients
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      query += ` AND (code_client ILIKE $${paramCount} OR raison_sociale ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    if (actif !== undefined) {
      paramCount++;
      query += ` AND actif = $${paramCount}`;
      params.push(actif === 'true');
    }

    query += ` ORDER BY date_creation DESC`;

    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Erreur getClients:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// GET /api/clients/:id - Détails d'un client
export const getClient = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM clients WHERE id_client = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Client non trouvé' }
      });
    }

    // Récupérer les commandes du client
    const commandes = await pool.query(
      `SELECT 
        id_commande,
        numero_commande,
        date_commande,
        date_livraison_prevue,
        statut,
        montant_total
      FROM commandes
      WHERE id_client = $1
      ORDER BY date_commande DESC
      LIMIT 10`,
      [id]
    );

    res.json({
      success: true,
      data: {
        ...result.rows[0],
        commandes: commandes.rows
      }
    });
  } catch (error) {
    console.error('Erreur getClient:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// POST /api/clients - Créer un client
export const createClient = async (req, res) => {
  try {
    const {
      code_client,
      raison_sociale,
      adresse,
      code_postal,
      ville,
      pays = 'Tunisie',
      telephone,
      email,
      contact_principal,
      conditions_paiement,
      plafond_credit,
      devise = 'TND',
      taux_remise = 0,
      actif = true
    } = req.body;

    // Validation
    if (!code_client || !raison_sociale) {
      return res.status(400).json({
        success: false,
        error: { message: 'Code client et raison sociale requis' }
      });
    }

    // Vérifier si le code existe déjà
    const existing = await pool.query(
      'SELECT id_client FROM clients WHERE code_client = $1',
      [code_client]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Ce code client existe déjà' }
      });
    }

    const result = await pool.query(
      `INSERT INTO clients 
        (code_client, raison_sociale, adresse, code_postal, ville, pays, 
         telephone, email, contact_principal, conditions_paiement, 
         plafond_credit, devise, taux_remise, actif)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *`,
      [code_client, raison_sociale, adresse || null, code_postal || null,
       ville || null, pays, telephone || null, email || null,
       contact_principal || null, conditions_paiement || null,
       plafond_credit || null, devise, taux_remise, actif]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur createClient:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// PUT /api/clients/:id - Modifier un client
export const updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Vérifier si le client existe
    const existing = await pool.query(
      'SELECT id_client FROM clients WHERE id_client = $1',
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Client non trouvé' }
      });
    }

    // Vérifier si le nouveau code existe déjà (si changé)
    if (updateData.code_client && updateData.code_client !== existing.rows[0].code_client) {
      const codeExists = await pool.query(
        'SELECT id_client FROM clients WHERE code_client = $1 AND id_client != $2',
        [updateData.code_client, id]
      );

      if (codeExists.rows.length > 0) {
        return res.status(400).json({
          success: false,
          error: { message: 'Ce code client existe déjà' }
        });
      }
    }

    // Construire la requête dynamique
    const fields = [];
    const values = [];
    let paramCount = 0;

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        paramCount++;
        fields.push(`${key} = $${paramCount}`);
        values.push(updateData[key]);
      }
    });

    if (fields.length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Aucune donnée à mettre à jour' }
      });
    }

    values.push(id);
    paramCount++;
    
    const result = await pool.query(
      `UPDATE clients 
      SET ${fields.join(', ')}
      WHERE id_client = $${paramCount}
      RETURNING *`,
      values
    );

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur updateClient:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// DELETE /api/clients/:id - Supprimer un client (soft delete)
export const deleteClient = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE clients 
      SET actif = false
      WHERE id_client = $1
      RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Client non trouvé' }
      });
    }

    res.json({
      success: true,
      data: { message: 'Client désactivé avec succès' }
    });
  } catch (error) {
    console.error('Erreur deleteClient:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};
