import { pool } from '../utils/db.js';

// GET /api/bons-livraison - Liste tous les bons de livraison
export const getBonsLivraison = async (req, res) => {
  try {
    const { search, statut, client_id, date_debut, date_fin } = req.query;
    
    let query = `
      SELECT 
        bl.id_bl,
        bl.numero_bl,
        bl.id_commande,
        bl.id_client,
        c.raison_sociale as client_nom,
        cmd.numero_commande,
        bl.date_livraison,
        bl.statut,
        bl.transporteur,
        bl.numero_suivi,
        bl.montant_ttc,
        bl.created_at
      FROM bons_livraison bl
      LEFT JOIN clients c ON bl.id_client = c.id_client
      LEFT JOIN commandes cmd ON bl.id_commande = cmd.id_commande
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      query += ` AND (bl.numero_bl ILIKE $${paramCount} OR c.raison_sociale ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    if (statut) {
      paramCount++;
      query += ` AND bl.statut = $${paramCount}`;
      params.push(statut);
    }

    if (client_id) {
      paramCount++;
      query += ` AND bl.id_client = $${paramCount}`;
      params.push(client_id);
    }

    if (date_debut) {
      paramCount++;
      query += ` AND bl.date_livraison >= $${paramCount}`;
      params.push(date_debut);
    }

    if (date_fin) {
      paramCount++;
      query += ` AND bl.date_livraison <= $${paramCount}`;
      params.push(date_fin);
    }

    query += ` ORDER BY bl.date_livraison DESC`;

    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('[BL] Erreur getBonsLivraison:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// GET /api/bons-livraison/:id - Détails d'un bon de livraison avec lignes
export const getBonLivraisonById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const bl = await pool.query(
      `SELECT 
        bl.*,
        c.raison_sociale as client_nom,
        c.code_client as client_code,
        cmd.numero_commande
      FROM bons_livraison bl
      LEFT JOIN clients c ON bl.id_client = c.id_client
      LEFT JOIN commandes cmd ON bl.id_commande = cmd.id_commande
      WHERE bl.id_bl = $1`,
      [id]
    );

    if (bl.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Bon de livraison non trouvé' }
      });
    }

    // Récupérer les lignes
    const lignes = await pool.query(
      `SELECT 
        l.*,
        a.reference as article_reference
      FROM lignes_bl l
      LEFT JOIN articles_catalogue a ON l.id_article = a.id_article
      WHERE l.id_bl = $1
      ORDER BY l.ordre, l.id_ligne`,
      [id]
    );

    res.json({
      success: true,
      data: {
        ...bl.rows[0],
        lignes: lignes.rows
      }
    });
  } catch (error) {
    console.error('[BL] Erreur getBonLivraisonById:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// POST /api/bons-livraison - Créer un bon de livraison
export const createBonLivraison = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { id_commande, id_client, date_livraison, lignes, ...blData } = req.body;

    // Validation
    if (!id_commande || !id_client || !date_livraison || !lignes || lignes.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        error: { message: 'Commande, client, date et lignes de livraison requis' }
      });
    }

    // Vérifier que la commande existe
    const commandeCheck = await client.query(
      'SELECT id_commande, id_client, statut FROM commandes WHERE id_commande = $1',
      [id_commande]
    );

    if (commandeCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        error: { message: 'Commande non trouvée' }
      });
    }

    // Générer le numéro de BL
    const numeroResult = await client.query('SELECT generer_numero_bl() as numero');
    const numero = numeroResult.rows[0].numero;

    // Calculer les totaux
    let montantHt = 0;
    let montantTva = 0;
    const tauxTva = 20; // Par défaut

    for (const ligne of lignes) {
      const prix = parseFloat(ligne.prix_unitaire_ht || 0);
      const qte = parseFloat(ligne.quantite_livree || 0);
      const tauxTvaLigne = parseFloat(ligne.taux_tva || tauxTva);
      
      const montantLigneHt = prix * qte;
      const montantLigneTva = montantLigneHt * tauxTvaLigne / 100;
      
      montantHt += montantLigneHt;
      montantTva += montantLigneTva;
    }

    const montantTtc = montantHt + montantTva;

    // Créer le bon de livraison
    const blResult = await client.query(
      `INSERT INTO bons_livraison (
        numero_bl, id_commande, id_client, date_livraison, statut,
        montant_ht, montant_tva, montant_ttc,
        transporteur, numero_suivi, adresse_livraison, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [
        numero, id_commande, id_client, date_livraison, blData.statut || 'BROUILLON',
        montantHt, montantTva, montantTtc,
        blData.transporteur || null, blData.numero_suivi || null,
        blData.adresse_livraison || null, blData.notes || null
      ]
    );

    const idBl = blResult.rows[0].id_bl;

    // Créer les lignes
    for (let i = 0; i < lignes.length; i++) {
      const ligne = lignes[i];
      const prix = parseFloat(ligne.prix_unitaire_ht || 0);
      const qte = parseFloat(ligne.quantite_livree || 0);
      const tauxTvaLigne = parseFloat(ligne.taux_tva || tauxTva);
      
      const montantLigneHt = prix * qte;
      const montantLigneTva = montantLigneHt * tauxTvaLigne / 100;
      const montantLigneTtc = montantLigneHt + montantLigneTva;

      await client.query(
        `INSERT INTO lignes_bl (
          id_bl, id_ligne_commande, id_article, designation, quantite_livree,
          prix_unitaire_ht, taux_tva, montant_ht, montant_tva, montant_ttc,
          numero_lot, date_peremption, ordre
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [
          idBl, ligne.id_ligne_commande || null, ligne.id_article || null,
          ligne.designation || '', qte, prix, tauxTvaLigne,
          montantLigneHt, montantLigneTva, montantLigneTtc,
          ligne.numero_lot || null, ligne.date_peremption || null, i + 1
        ]
      );
    }

    // Mettre à jour les quantités livrées dans la commande
    for (const ligne of lignes) {
      if (ligne.id_ligne_commande) {
        await client.query(
          `UPDATE articles_commande 
          SET quantite_livree = COALESCE(quantite_livree, 0) + $1
          WHERE id_article_commande = $2`,
          [ligne.quantite_livree, ligne.id_ligne_commande]
        );
      }
    }

    // Mettre à jour le statut de la commande si toutes les lignes sont livrées
    const commandeLignes = await client.query(
      `SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE quantite_livree >= quantite_commandee) as livrees
      FROM articles_commande 
      WHERE id_commande = $1`,
      [id_commande]
    );

    if (commandeLignes.rows[0].total === commandeLignes.rows[0].livrees) {
      await client.query(
        'UPDATE commandes SET statut = $1 WHERE id_commande = $2',
        ['livree', id_commande]
      );
    }

    await client.query('COMMIT');

    // Récupérer le BL complet
    const blComplet = await pool.query(
      `SELECT 
        bl.*,
        c.raison_sociale as client_nom,
        cmd.numero_commande
      FROM bons_livraison bl
      LEFT JOIN clients c ON bl.id_client = c.id_client
      LEFT JOIN commandes cmd ON bl.id_commande = cmd.id_commande
      WHERE bl.id_bl = $1`,
      [idBl]
    );

    const lignesResult = await pool.query(
      'SELECT * FROM lignes_bl WHERE id_bl = $1 ORDER BY ordre',
      [idBl]
    );

    res.status(201).json({
      success: true,
      data: {
        ...blComplet.rows[0],
        lignes: lignesResult.rows
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[BL] Erreur createBonLivraison:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Erreur serveur' }
    });
  } finally {
    client.release();
  }
};

// POST /api/bons-livraison/from-commande/:id - Générer un BL depuis une commande
export const createBLFromCommande = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { id } = req.params; // id de la commande
    const { date_livraison, transporteur, numero_suivi, ...blData } = req.body;

    // Récupérer la commande
    const commande = await client.query(
      `SELECT * FROM commandes WHERE id_commande = $1`,
      [id]
    );

    if (commande.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        error: { message: 'Commande non trouvée' }
      });
    }

    const cmd = commande.rows[0];

    // Récupérer les lignes de commande non livrées
    const lignesCommande = await client.query(
      `SELECT 
        ac.*,
        a.reference as article_reference,
        a.designation as article_designation
      FROM articles_commande ac
      LEFT JOIN articles_catalogue a ON ac.id_article = a.id_article
      WHERE ac.id_commande = $1
        AND ac.quantite_livree < ac.quantite_commandee
      ORDER BY ac.numero_ligne`,
      [id]
    );

    if (lignesCommande.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        error: { message: 'Toutes les lignes de la commande sont déjà livrées' }
      });
    }

    // Générer le numéro de BL
    const numeroResult = await client.query('SELECT generer_numero_bl() as numero');
    const numero = numeroResult.rows[0].numero;

    // Préparer les lignes du BL (livrer le reste)
    const lignesBl = lignesCommande.rows.map(ligne => ({
      id_ligne_commande: ligne.id_article_commande,
      id_article: ligne.id_article,
      designation: ligne.article_designation || '',
      quantite_livree: ligne.quantite_commandee - ligne.quantite_livree,
      prix_unitaire_ht: ligne.prix_unitaire,
      taux_tva: 20,
      numero_lot: null,
      date_peremption: null
    }));

    // Calculer les totaux
    let montantHt = 0;
    let montantTva = 0;

    for (const ligne of lignesBl) {
      const montantLigneHt = ligne.prix_unitaire_ht * ligne.quantite_livree;
      const montantLigneTva = montantLigneHt * ligne.taux_tva / 100;
      montantHt += montantLigneHt;
      montantTva += montantLigneTva;
    }

    const montantTtc = montantHt + montantTva;

    // Créer le bon de livraison
    const blResult = await client.query(
      `INSERT INTO bons_livraison (
        numero_bl, id_commande, id_client, date_livraison, statut,
        montant_ht, montant_tva, montant_ttc,
        transporteur, numero_suivi, adresse_livraison, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [
        numero, id, cmd.id_client, date_livraison || new Date().toISOString().split('T')[0],
        blData.statut || 'BROUILLON', montantHt, montantTva, montantTtc,
        transporteur || null, numero_suivi || null,
        cmd.adresse_livraison || null, blData.notes || null
      ]
    );

    const idBl = blResult.rows[0].id_bl;

    // Créer les lignes
    for (let i = 0; i < lignesBl.length; i++) {
      const ligne = lignesBl[i];
      const montantLigneHt = ligne.prix_unitaire_ht * ligne.quantite_livree;
      const montantLigneTva = montantLigneHt * ligne.taux_tva / 100;
      const montantLigneTtc = montantLigneHt + montantLigneTva;

      await client.query(
        `INSERT INTO lignes_bl (
          id_bl, id_ligne_commande, id_article, designation, quantite_livree,
          prix_unitaire_ht, taux_tva, montant_ht, montant_tva, montant_ttc,
          numero_lot, date_peremption, ordre
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [
          idBl, ligne.id_ligne_commande, ligne.id_article, ligne.designation,
          ligne.quantite_livree, ligne.prix_unitaire_ht, ligne.taux_tva,
          montantLigneHt, montantLigneTva, montantLigneTtc,
          ligne.numero_lot, ligne.date_peremption, i + 1
        ]
      );

      // Mettre à jour la quantité livrée dans la commande
      await client.query(
        `UPDATE articles_commande 
        SET quantite_livree = COALESCE(quantite_livree, 0) + $1
        WHERE id_article_commande = $2`,
        [ligne.quantite_livree, ligne.id_ligne_commande]
      );
    }

    // Mettre à jour le statut de la commande
    const commandeLignes = await client.query(
      `SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE quantite_livree >= quantite_commandee) as livrees
      FROM articles_commande 
      WHERE id_commande = $1`,
      [id]
    );

    if (commandeLignes.rows[0].total === commandeLignes.rows[0].livrees) {
      await client.query(
        'UPDATE commandes SET statut = $1 WHERE id_commande = $2',
        ['livree', id]
      );
    }

    await client.query('COMMIT');

    // Récupérer le BL complet
    const blComplet = await pool.query(
      `SELECT 
        bl.*,
        c.raison_sociale as client_nom,
        cmd.numero_commande
      FROM bons_livraison bl
      LEFT JOIN clients c ON bl.id_client = c.id_client
      LEFT JOIN commandes cmd ON bl.id_commande = cmd.id_commande
      WHERE bl.id_bl = $1`,
      [idBl]
    );

    const lignesResult = await pool.query(
      'SELECT * FROM lignes_bl WHERE id_bl = $1 ORDER BY ordre',
      [idBl]
    );

    res.status(201).json({
      success: true,
      data: {
        ...blComplet.rows[0],
        lignes: lignesResult.rows
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[BL] Erreur createBLFromCommande:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Erreur serveur' }
    });
  } finally {
    client.release();
  }
};

// PUT /api/bons-livraison/:id - Modifier un bon de livraison
export const updateBonLivraison = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const { lignes, ...blData } = req.body;

    // Vérifier que le BL existe
    const blCheck = await client.query(
      'SELECT id_bl, statut FROM bons_livraison WHERE id_bl = $1',
      [id]
    );

    if (blCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        error: { message: 'Bon de livraison non trouvé' }
      });
    }

    // Ne pas modifier un BL livré
    if (blCheck.rows[0].statut === 'LIVREE') {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        error: { message: 'Impossible de modifier un bon de livraison déjà livré' }
      });
    }

    // Mettre à jour le BL
    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    Object.keys(blData).forEach(key => {
      if (key !== 'id_bl' && key !== 'numero_bl') {
        updateFields.push(`${key} = $${paramCount}`);
        updateValues.push(blData[key]);
        paramCount++;
      }
    });

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    updateValues.push(id);

    if (updateFields.length > 1) {
      await client.query(
        `UPDATE bons_livraison SET ${updateFields.join(', ')} WHERE id_bl = $${paramCount}`,
        updateValues
      );
    }

    await client.query('COMMIT');

    // Récupérer le BL mis à jour
    const blComplet = await pool.query(
      `SELECT 
        bl.*,
        c.raison_sociale as client_nom,
        cmd.numero_commande
      FROM bons_livraison bl
      LEFT JOIN clients c ON bl.id_client = c.id_client
      LEFT JOIN commandes cmd ON bl.id_commande = cmd.id_commande
      WHERE bl.id_bl = $1`,
      [id]
    );

    const lignesResult = await pool.query(
      'SELECT * FROM lignes_bl WHERE id_bl = $1 ORDER BY ordre',
      [id]
    );

    res.json({
      success: true,
      data: {
        ...blComplet.rows[0],
        lignes: lignesResult.rows
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[BL] Erreur updateBonLivraison:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Erreur serveur' }
    });
  } finally {
    client.release();
  }
};

// DELETE /api/bons-livraison/:id - Supprimer un bon de livraison
export const deleteBonLivraison = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier que le BL existe
    const bl = await pool.query(
      'SELECT id_bl, statut FROM bons_livraison WHERE id_bl = $1',
      [id]
    );

    if (bl.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Bon de livraison non trouvé' }
      });
    }

    // Ne pas supprimer un BL livré
    if (bl.rows[0].statut === 'LIVREE') {
      return res.status(400).json({
        success: false,
        error: { message: 'Impossible de supprimer un bon de livraison déjà livré' }
      });
    }

    // Supprimer le BL (les lignes seront supprimées automatiquement via CASCADE)
    await pool.query('DELETE FROM bons_livraison WHERE id_bl = $1', [id]);

    res.json({
      success: true,
      message: 'Bon de livraison supprimé avec succès'
    });
  } catch (error) {
    console.error('[BL] Erreur deleteBonLivraison:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Erreur serveur' }
    });
  }
};
