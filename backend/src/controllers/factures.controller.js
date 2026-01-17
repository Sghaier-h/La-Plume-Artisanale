import { pool } from '../utils/db.js';

// GET /api/factures - Liste toutes les factures
export const getFactures = async (req, res) => {
  try {
    const { search, statut, client_id, date_debut, date_fin } = req.query;
    
    let query = `
      SELECT 
        f.id_facture,
        f.numero_facture,
        f.id_commande,
        f.id_bl,
        f.id_client,
        c.raison_sociale as client_nom,
        cmd.numero_commande,
        bl.numero_bl,
        f.date_facture,
        f.date_echeance,
        f.statut,
        f.montant_ht,
        f.montant_tva,
        f.montant_ttc,
        f.montant_regle,
        f.montant_restant,
        f.created_at
      FROM factures f
      LEFT JOIN clients c ON f.id_client = c.id_client
      LEFT JOIN commandes cmd ON f.id_commande = cmd.id_commande
      LEFT JOIN bons_livraison bl ON f.id_bl = bl.id_bl
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      query += ` AND (f.numero_facture ILIKE $${paramCount} OR c.raison_sociale ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    if (statut) {
      paramCount++;
      query += ` AND f.statut = $${paramCount}`;
      params.push(statut);
    }

    if (client_id) {
      paramCount++;
      query += ` AND f.id_client = $${paramCount}`;
      params.push(client_id);
    }

    if (date_debut) {
      paramCount++;
      query += ` AND f.date_facture >= $${paramCount}`;
      params.push(date_debut);
    }

    if (date_fin) {
      paramCount++;
      query += ` AND f.date_facture <= $${paramCount}`;
      params.push(date_fin);
    }

    query += ` ORDER BY f.date_facture DESC`;

    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('[Factures] Erreur getFactures:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// GET /api/factures/:id - Détails d'une facture avec lignes
export const getFactureById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const facture = await pool.query(
      `SELECT 
        f.*,
        c.raison_sociale as client_nom,
        c.code_client as client_code,
        cmd.numero_commande,
        bl.numero_bl
      FROM factures f
      LEFT JOIN clients c ON f.id_client = c.id_client
      LEFT JOIN commandes cmd ON f.id_commande = cmd.id_commande
      LEFT JOIN bons_livraison bl ON f.id_bl = bl.id_bl
      WHERE f.id_facture = $1`,
      [id]
    );

    if (facture.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Facture non trouvée' }
      });
    }

    // Récupérer les lignes
    const lignes = await pool.query(
      `SELECT 
        lf.*,
        a.reference as article_reference
      FROM lignes_facture lf
      LEFT JOIN articles_catalogue a ON lf.id_article = a.id_article
      WHERE lf.id_facture = $1
      ORDER BY lf.ordre, lf.id_ligne`,
      [id]
    );

    res.json({
      success: true,
      data: {
        ...facture.rows[0],
        lignes: lignes.rows
      }
    });
  } catch (error) {
    console.error('[Factures] Erreur getFactureById:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// POST /api/factures - Créer une facture
export const createFacture = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { id_commande, id_bl, id_client, date_facture, lignes, ...factureData } = req.body;

    // Validation
    if (!id_client || !date_facture || !lignes || lignes.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        error: { message: 'Client, date et lignes de facture requis' }
      });
    }

    // Vérifier que le client existe
    const clientCheck = await client.query(
      'SELECT id_client FROM clients WHERE id_client = $1 AND actif = true',
      [id_client]
    );

    if (clientCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        error: { message: 'Client non trouvé ou inactif' }
      });
    }

    // Générer le numéro de facture
    const numeroResult = await client.query('SELECT generer_numero_facture() as numero');
    const numero = numeroResult.rows[0].numero;

    // Calculer les totaux
    let montantHt = 0;
    let montantTva = 0;
    const tauxTva = factureData.taux_tva || 20;
    const remiseGlobale = factureData.remise_globale || 0;

    for (const ligne of lignes) {
      const prix = parseFloat(ligne.prix_unitaire_ht || 0);
      const qte = parseFloat(ligne.quantite || 0);
      const remise = parseFloat(ligne.remise || 0);
      const tauxTvaLigne = parseFloat(ligne.taux_tva || tauxTva);
      
      const montantLigneHt = prix * qte * (1 - remise / 100);
      const montantLigneTva = montantLigneHt * tauxTvaLigne / 100;
      
      montantHt += montantLigneHt;
      montantTva += montantLigneTva;
    }

    // Appliquer remise globale
    const montantRemise = montantHt * remiseGlobale / 100;
    montantHt -= montantRemise;
    const montantTtc = montantHt + montantTva;
    const montantRegle = 0;
    const montantRestant = montantTtc;

    // Calculer la date d'échéance (30 jours par défaut)
    const dateEcheance = factureData.date_echeance || new Date(
      new Date(date_facture).getTime() + 30 * 24 * 60 * 60 * 1000
    ).toISOString().split('T')[0];

    // Créer la facture
    const factureResult = await client.query(
      `INSERT INTO factures (
        numero_facture, id_commande, id_bl, id_client, date_facture, date_echeance, statut,
        montant_ht, taux_tva, montant_tva, montant_ttc, montant_regle, montant_restant,
        remise_globale, montant_remise, reference_client, conditions_paiement, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING *`,
      [
        numero, id_commande || null, id_bl || null, id_client, date_facture, dateEcheance,
        factureData.statut || 'BROUILLON', montantHt, tauxTva, montantTva, montantTtc,
        montantRegle, montantRestant, remiseGlobale, montantRemise,
        factureData.reference_client || null, factureData.conditions_paiement || null,
        factureData.notes || null
      ]
    );

    const idFacture = factureResult.rows[0].id_facture;

    // Créer les lignes
    for (let i = 0; i < lignes.length; i++) {
      const ligne = lignes[i];
      const prix = parseFloat(ligne.prix_unitaire_ht || 0);
      const qte = parseFloat(ligne.quantite || 0);
      const remise = parseFloat(ligne.remise || 0);
      const tauxTvaLigne = parseFloat(ligne.taux_tva || tauxTva);
      
      const montantLigneHt = prix * qte * (1 - remise / 100);
      const montantLigneTva = montantLigneHt * tauxTvaLigne / 100;
      const montantLigneTtc = montantLigneHt + montantLigneTva;

      await client.query(
        `INSERT INTO lignes_facture (
          id_facture, id_ligne_commande, id_ligne_bl, id_article, designation, quantite,
          prix_unitaire_ht, taux_tva, remise,
          montant_ht, montant_tva, montant_ttc, ordre
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [
          idFacture, ligne.id_ligne_commande || null, ligne.id_ligne_bl || null,
          ligne.id_article || null, ligne.designation || '', qte, prix, tauxTvaLigne, remise,
          montantLigneHt, montantLigneTva, montantLigneTtc, i + 1
        ]
      );
    }

    await client.query('COMMIT');

    // Récupérer la facture complète
    const factureComplet = await pool.query(
      `SELECT 
        f.*,
        c.raison_sociale as client_nom,
        cmd.numero_commande,
        bl.numero_bl
      FROM factures f
      LEFT JOIN clients c ON f.id_client = c.id_client
      LEFT JOIN commandes cmd ON f.id_commande = cmd.id_commande
      LEFT JOIN bons_livraison bl ON f.id_bl = bl.id_bl
      WHERE f.id_facture = $1`,
      [idFacture]
    );

    const lignesResult = await pool.query(
      'SELECT * FROM lignes_facture WHERE id_facture = $1 ORDER BY ordre',
      [idFacture]
    );

    res.status(201).json({
      success: true,
      data: {
        ...factureComplet.rows[0],
        lignes: lignesResult.rows
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[Factures] Erreur createFacture:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Erreur serveur' }
    });
  } finally {
    client.release();
  }
};

// POST /api/factures/from-commande/:id - Générer une facture depuis une commande
export const createFactureFromCommande = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { id } = req.params; // id de la commande
    const { date_facture, date_echeance, ...factureData } = req.body;

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

    // Récupérer les lignes de commande
    const lignesCommande = await client.query(
      `SELECT 
        ac.*,
        a.reference as article_reference,
        a.designation as article_designation
      FROM articles_commande ac
      LEFT JOIN articles_catalogue a ON ac.id_article = a.id_article
      WHERE ac.id_commande = $1
      ORDER BY ac.numero_ligne`,
      [id]
    );

    if (lignesCommande.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        error: { message: 'La commande n\'a pas de lignes' }
      });
    }

    // Préparer les lignes de facture
    const lignesFacture = lignesCommande.rows.map(ligne => ({
      id_ligne_commande: ligne.id_article_commande,
      id_article: ligne.id_article,
      designation: ligne.article_designation || '',
      quantite: ligne.quantite_commandee,
      prix_unitaire_ht: ligne.prix_unitaire,
      taux_tva: 20,
      remise: ligne.remise || 0
    }));

    // Créer la facture avec les lignes
    const createData = {
      id_commande: id,
      id_client: cmd.id_client,
      date_facture: date_facture || new Date().toISOString().split('T')[0],
      date_echeance: date_echeance || null,
      lignes: lignesFacture,
      conditions_paiement: cmd.conditions_paiement || null,
      ...factureData
    };

    await client.query('COMMIT');

    // Appeler createFacture avec les données préparées
    req.body = createData;
    return createFacture(req, res);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[Factures] Erreur createFactureFromCommande:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Erreur serveur' }
    });
  } finally {
    client.release();
  }
};

// POST /api/factures/from-bl/:id - Générer une facture depuis un bon de livraison
export const createFactureFromBL = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { id } = req.params; // id du BL
    const { date_facture, date_echeance, ...factureData } = req.body;

    // Récupérer le BL
    const bl = await client.query(
      `SELECT * FROM bons_livraison WHERE id_bl = $1`,
      [id]
    );

    if (bl.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        error: { message: 'Bon de livraison non trouvé' }
      });
    }

    const blData = bl.rows[0];

    // Récupérer les lignes du BL
    const lignesBl = await client.query(
      `SELECT 
        lb.*,
        a.reference as article_reference,
        a.designation as article_designation
      FROM lignes_bl lb
      LEFT JOIN articles_catalogue a ON lb.id_article = a.id_article
      WHERE lb.id_bl = $1
      ORDER BY lb.ordre`,
      [id]
    );

    if (lignesBl.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        error: { message: 'Le bon de livraison n\'a pas de lignes' }
      });
    }

    // Préparer les lignes de facture
    const lignesFacture = lignesBl.rows.map(ligne => ({
      id_ligne_bl: ligne.id_ligne,
      id_article: ligne.id_article,
      designation: ligne.designation || '',
      quantite: ligne.quantite_livree,
      prix_unitaire_ht: ligne.prix_unitaire_ht,
      taux_tva: ligne.taux_tva || 20,
      remise: 0
    }));

    // Créer la facture avec les lignes
    const createData = {
      id_bl: id,
      id_commande: blData.id_commande || null,
      id_client: blData.id_client,
      date_facture: date_facture || new Date().toISOString().split('T')[0],
      date_echeance: date_echeance || null,
      lignes: lignesFacture,
      ...factureData
    };

    await client.query('COMMIT');

    // Appeler createFacture avec les données préparées
    req.body = createData;
    return createFacture(req, res);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[Factures] Erreur createFactureFromBL:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Erreur serveur' }
    });
  } finally {
    client.release();
  }
};

// PUT /api/factures/:id - Modifier une facture
export const updateFacture = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const { lignes, ...factureData } = req.body;

    // Vérifier que la facture existe
    const factureCheck = await client.query(
      'SELECT id_facture, statut FROM factures WHERE id_facture = $1',
      [id]
    );

    if (factureCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        error: { message: 'Facture non trouvée' }
      });
    }

    // Ne pas modifier une facture réglée
    if (factureCheck.rows[0].statut === 'REGLEE') {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        error: { message: 'Impossible de modifier une facture déjà réglée' }
      });
    }

    // Mettre à jour la facture
    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    Object.keys(factureData).forEach(key => {
      if (key !== 'id_facture' && key !== 'numero_facture') {
        updateFields.push(`${key} = $${paramCount}`);
        updateValues.push(factureData[key]);
        paramCount++;
      }
    });

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    updateValues.push(id);

    if (updateFields.length > 1) {
      await client.query(
        `UPDATE factures SET ${updateFields.join(', ')} WHERE id_facture = $${paramCount}`,
        updateValues
      );
    }

    await client.query('COMMIT');

    // Récupérer la facture mise à jour
    const factureComplet = await pool.query(
      `SELECT 
        f.*,
        c.raison_sociale as client_nom,
        cmd.numero_commande,
        bl.numero_bl
      FROM factures f
      LEFT JOIN clients c ON f.id_client = c.id_client
      LEFT JOIN commandes cmd ON f.id_commande = cmd.id_commande
      LEFT JOIN bons_livraison bl ON f.id_bl = bl.id_bl
      WHERE f.id_facture = $1`,
      [id]
    );

    const lignesResult = await pool.query(
      'SELECT * FROM lignes_facture WHERE id_facture = $1 ORDER BY ordre',
      [id]
    );

    res.json({
      success: true,
      data: {
        ...factureComplet.rows[0],
        lignes: lignesResult.rows
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[Factures] Erreur updateFacture:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Erreur serveur' }
    });
  } finally {
    client.release();
  }
};

// DELETE /api/factures/:id - Supprimer une facture
export const deleteFacture = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier que la facture existe
    const facture = await pool.query(
      'SELECT id_facture, statut FROM factures WHERE id_facture = $1',
      [id]
    );

    if (facture.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Facture non trouvée' }
      });
    }

    // Ne pas supprimer une facture réglée
    if (facture.rows[0].statut === 'REGLEE') {
      return res.status(400).json({
        success: false,
        error: { message: 'Impossible de supprimer une facture déjà réglée' }
      });
    }

    // Supprimer la facture (les lignes seront supprimées automatiquement via CASCADE)
    await pool.query('DELETE FROM factures WHERE id_facture = $1', [id]);

    res.json({
      success: true,
      message: 'Facture supprimée avec succès'
    });
  } catch (error) {
    console.error('[Factures] Erreur deleteFacture:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Erreur serveur' }
    });
  }
};
