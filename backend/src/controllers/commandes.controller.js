import { pool } from '../utils/db.js';

// GET /api/commandes - Liste toutes les commandes
export const getCommandes = async (req, res) => {
  try {
    const { search, statut, client_id, date_debut, date_fin } = req.query;
    
    let query = `
      SELECT 
        c.id_commande,
        c.numero_commande,
        c.id_client,
        cl.raison_sociale as client_nom,
        c.date_commande,
        c.date_livraison_prevue,
        c.statut,
        c.priorite,
        c.montant_total,
        c.devise,
        c.date_creation
      FROM commandes c
      LEFT JOIN clients cl ON c.id_client = cl.id_client
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      query += ` AND (c.numero_commande ILIKE $${paramCount} OR cl.raison_sociale ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    if (statut) {
      paramCount++;
      query += ` AND c.statut = $${paramCount}`;
      params.push(statut);
    }

    if (client_id) {
      paramCount++;
      query += ` AND c.id_client = $${paramCount}`;
      params.push(client_id);
    }

    if (date_debut) {
      paramCount++;
      query += ` AND c.date_commande >= $${paramCount}`;
      params.push(date_debut);
    }

    if (date_fin) {
      paramCount++;
      query += ` AND c.date_commande <= $${paramCount}`;
      params.push(date_fin);
    }

    query += ` ORDER BY c.date_commande DESC`;

    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Erreur getCommandes:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// GET /api/commandes/:id - Détails d'une commande avec lignes
export const getCommande = async (req, res) => {
  try {
    const { id } = req.params;
    
    const commande = await pool.query(
      `SELECT 
        c.*,
        cl.raison_sociale as client_nom,
        cl.code_client as client_code
      FROM commandes c
      LEFT JOIN clients cl ON c.id_client = cl.id_client
      WHERE c.id_commande = $1`,
      [id]
    );

    if (commande.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Commande non trouvée' }
      });
    }

    // Récupérer les lignes de commande
    const lignes = await pool.query(
      `SELECT 
        ac.*,
        a.code_article,
        a.designation as article_designation
      FROM articles_commande ac
      LEFT JOIN articles_catalogue a ON ac.id_article = a.id_article
      WHERE ac.id_commande = $1
      ORDER BY ac.numero_ligne`,
      [id]
    );

    res.json({
      success: true,
      data: {
        ...commande.rows[0],
        lignes: lignes.rows
      }
    });
  } catch (error) {
    console.error('Erreur getCommande:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// POST /api/commandes - Créer une commande
export const createCommande = async (req, res) => {
  try {
    const { client_id, date_commande, date_livraison_prevue, lignes, ...commandeData } = req.body;

    // Validation
    if (!client_id || !date_commande || !lignes || lignes.length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Client, date et lignes de commande requis' }
      });
    }

    // Vérifier que le client existe
    const client = await pool.query(
      'SELECT id_client FROM clients WHERE id_client = $1 AND actif = true',
      [client_id]
    );

    if (client.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Client non trouvé ou inactif' }
      });
    }

    // Générer le numéro de commande
    const count = await pool.query('SELECT COUNT(*) as count FROM commandes WHERE date_commande >= CURRENT_DATE');
    const numero = `CMD-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${String(parseInt(count.rows[0].count) + 1).padStart(4, '0')}`;

    // Calculer le montant total
    let montantTotal = 0;
    for (const ligne of lignes) {
      const prix = ligne.prix_unitaire || 0;
      const qte = ligne.quantite_commandee || 0;
      const remise = ligne.remise || 0;
      const montantLigne = prix * qte * (1 - remise / 100);
      montantTotal += montantLigne;
    }

    // Créer la commande
    const commande = await pool.query(
      `INSERT INTO commandes 
        (numero_commande, id_client, date_commande, date_livraison_prevue, 
         statut, priorite, montant_total, devise, conditions_paiement, 
         adresse_livraison, observations)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        numero, client_id, date_commande, date_livraison_prevue || null,
        commandeData.statut || 'en_attente', commandeData.priorite || 'normale',
        montantTotal, commandeData.devise || 'TND', commandeData.conditions_paiement || null,
        commandeData.adresse_livraison || null, commandeData.observations || null
      ]
    );

    const idCommande = commande.rows[0].id_commande;

    // Créer les lignes de commande
    for (let i = 0; i < lignes.length; i++) {
      const ligne = lignes[i];
      const montantLigne = (ligne.prix_unitaire || 0) * (ligne.quantite_commandee || 0) * (1 - (ligne.remise || 0) / 100);

      await pool.query(
        `INSERT INTO articles_commande 
          (id_commande, numero_ligne, id_article, quantite_commandee, 
           prix_unitaire, remise, montant_ligne, date_livraison_prevue, observations)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          idCommande, i + 1, ligne.id_article, ligne.quantite_commandee,
          ligne.prix_unitaire, ligne.remise || 0, montantLigne,
          ligne.date_livraison_prevue || null, ligne.observations || null
        ]
      );
    }

    // Récupérer la commande complète
    const result = await pool.query(
      `SELECT 
        c.*,
        cl.raison_sociale as client_nom
      FROM commandes c
      LEFT JOIN clients cl ON c.id_client = cl.id_client
      WHERE c.id_commande = $1`,
      [idCommande]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur createCommande:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// PUT /api/commandes/:id - Modifier une commande
export const updateCommande = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Vérifier si la commande existe
    const existing = await pool.query(
      'SELECT id_commande, statut FROM commandes WHERE id_commande = $1',
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Commande non trouvée' }
      });
    }

    // Ne pas modifier une commande validée
    if (existing.rows[0].statut === 'validee' && updateData.statut !== 'validee') {
      return res.status(400).json({
        success: false,
        error: { message: 'Impossible de modifier une commande validée' }
      });
    }

    // Construire la requête dynamique
    const fields = [];
    const values = [];
    let paramCount = 0;

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined && key !== 'lignes') {
        paramCount++;
        fields.push(`${key} = $${paramCount}`);
        values.push(updateData[key]);
      }
    });

    if (fields.length > 0) {
      values.push(id);
      paramCount++;
      
      await pool.query(
        `UPDATE commandes 
        SET ${fields.join(', ')}, date_modification = CURRENT_TIMESTAMP
        WHERE id_commande = $${paramCount}`,
        values
      );
    }

    // Mettre à jour les lignes si fournies
    if (updateData.lignes) {
      // Supprimer les anciennes lignes
      await pool.query('DELETE FROM articles_commande WHERE id_commande = $1', [id]);

      // Ajouter les nouvelles lignes
      for (let i = 0; i < updateData.lignes.length; i++) {
        const ligne = updateData.lignes[i];
        const montantLigne = (ligne.prix_unitaire || 0) * (ligne.quantite_commandee || 0) * (1 - (ligne.remise || 0) / 100);

        await pool.query(
          `INSERT INTO articles_commande 
            (id_commande, numero_ligne, id_article, quantite_commandee, 
             prix_unitaire, remise, montant_ligne, date_livraison_prevue, observations)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            id, i + 1, ligne.id_article, ligne.quantite_commandee,
            ligne.prix_unitaire, ligne.remise || 0, montantLigne,
            ligne.date_livraison_prevue || null, ligne.observations || null
          ]
        );
      }

      // Recalculer le montant total
      const totalResult = await pool.query(
        'SELECT SUM(montant_ligne) as total FROM articles_commande WHERE id_commande = $1',
        [id]
      );
      const montantTotal = totalResult.rows[0].total || 0;

      await pool.query(
        'UPDATE commandes SET montant_total = $1 WHERE id_commande = $2',
        [montantTotal, id]
      );
    }

    // Récupérer la commande mise à jour
    const result = await pool.query(
      `SELECT 
        c.*,
        cl.raison_sociale as client_nom
      FROM commandes c
      LEFT JOIN clients cl ON c.id_client = cl.id_client
      WHERE c.id_commande = $1`,
      [id]
    );

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur updateCommande:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// POST /api/commandes/:id/valider - Valider une commande
export const validerCommande = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      `UPDATE commandes 
      SET statut = 'validee', 
          date_validation = CURRENT_TIMESTAMP,
          validee_par = $1
      WHERE id_commande = $2
      RETURNING *`,
      [userId, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Commande non trouvée' }
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur validerCommande:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};
