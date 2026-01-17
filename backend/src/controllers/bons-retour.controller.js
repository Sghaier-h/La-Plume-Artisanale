import { pool } from '../utils/db.js';

// GET /api/bons-retour - Liste tous les bons de retour
export const getBonsRetour = async (req, res) => {
  try {
    const { search, statut, client_id, date_debut, date_fin } = req.query;
    
    let query = `
      SELECT 
        br.id_retour,
        br.numero_retour,
        br.id_bl,
        br.id_facture,
        br.id_client,
        c.raison_sociale as client_nom,
        bl.numero_bl,
        f.numero_facture,
        br.date_retour,
        br.statut,
        br.motif,
        br.type_retour,
        br.montant_ttc,
        br.created_at
      FROM bons_retour br
      LEFT JOIN clients c ON br.id_client = c.id_client
      LEFT JOIN bons_livraison bl ON br.id_bl = bl.id_bl
      LEFT JOIN factures f ON br.id_facture = f.id_facture
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      query += ` AND (br.numero_retour ILIKE $${paramCount} OR c.raison_sociale ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    if (statut) {
      paramCount++;
      query += ` AND br.statut = $${paramCount}`;
      params.push(statut);
    }

    if (client_id) {
      paramCount++;
      query += ` AND br.id_client = $${paramCount}`;
      params.push(client_id);
    }

    if (date_debut) {
      paramCount++;
      query += ` AND br.date_retour >= $${paramCount}`;
      params.push(date_debut);
    }

    if (date_fin) {
      paramCount++;
      query += ` AND br.date_retour <= $${paramCount}`;
      params.push(date_fin);
    }

    query += ` ORDER BY br.date_retour DESC`;

    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('[Bons Retour] Erreur getBonsRetour:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// GET /api/bons-retour/:id - Détails d'un bon de retour avec lignes
export const getBonRetourById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const retour = await pool.query(
      `SELECT 
        br.*,
        c.raison_sociale as client_nom,
        c.code_client as client_code,
        bl.numero_bl,
        f.numero_facture
      FROM bons_retour br
      LEFT JOIN clients c ON br.id_client = c.id_client
      LEFT JOIN bons_livraison bl ON br.id_bl = bl.id_bl
      LEFT JOIN factures f ON br.id_facture = f.id_facture
      WHERE br.id_retour = $1`,
      [id]
    );

    if (retour.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Bon de retour non trouvé' }
      });
    }

    // Récupérer les lignes
    const lignes = await pool.query(
      `SELECT 
        lr.*,
        a.reference as article_reference
      FROM lignes_retour lr
      LEFT JOIN articles_catalogue a ON lr.id_article = a.id_article
      WHERE lr.id_retour = $1
      ORDER BY lr.ordre, lr.id_ligne`,
      [id]
    );

    res.json({
      success: true,
      data: {
        ...retour.rows[0],
        lignes: lignes.rows
      }
    });
  } catch (error) {
    console.error('[Bons Retour] Erreur getBonRetourById:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// POST /api/bons-retour - Créer un bon de retour
export const createBonRetour = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { id_bl, id_facture, id_client, date_retour, motif, type_retour, lignes, ...retourData } = req.body;

    // Validation
    if (!id_client || !date_retour || !motif || !type_retour || !lignes || lignes.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        error: { message: 'Client, date, motif, type et lignes de retour requis' }
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

    // Générer le numéro de retour
    const numeroResult = await client.query('SELECT generer_numero_retour() as numero');
    const numero = numeroResult.rows[0].numero;

    // Calculer les totaux
    let montantHt = 0;
    let montantTva = 0;
    const tauxTva = 20; // Par défaut

    for (const ligne of lignes) {
      const prix = parseFloat(ligne.prix_unitaire_ht || 0);
      const qte = parseFloat(ligne.quantite_retournee || 0);
      const tauxTvaLigne = parseFloat(ligne.taux_tva || tauxTva);
      
      const montantLigneHt = prix * qte;
      const montantLigneTva = montantLigneHt * tauxTvaLigne / 100;
      
      montantHt += montantLigneHt;
      montantTva += montantLigneTva;
    }

    const montantTtc = montantHt + montantTva;

    // Créer le bon de retour
    const retourResult = await client.query(
      `INSERT INTO bons_retour (
        numero_retour, id_bl, id_facture, id_client, date_retour, statut,
        motif, type_retour, montant_ht, montant_tva, montant_ttc,
        adresse_retour, transporteur, numero_suivi, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *`,
      [
        numero, id_bl || null, id_facture || null, id_client, date_retour,
        retourData.statut || 'BROUILLON', motif, type_retour,
        montantHt, montantTva, montantTtc,
        retourData.adresse_retour || null, retourData.transporteur || null,
        retourData.numero_suivi || null, retourData.notes || null
      ]
    );

    const idRetour = retourResult.rows[0].id_retour;

    // Créer les lignes
    for (let i = 0; i < lignes.length; i++) {
      const ligne = lignes[i];
      const prix = parseFloat(ligne.prix_unitaire_ht || 0);
      const qte = parseFloat(ligne.quantite_retournee || 0);
      const tauxTvaLigne = parseFloat(ligne.taux_tva || tauxTva);
      
      const montantLigneHt = prix * qte;
      const montantLigneTva = montantLigneHt * tauxTvaLigne / 100;
      const montantLigneTtc = montantLigneHt + montantLigneTva;

      await client.query(
        `INSERT INTO lignes_retour (
          id_retour, id_ligne_bl, id_ligne_facture, id_article, designation, quantite_retournee,
          prix_unitaire_ht, taux_tva, montant_ht, montant_tva, montant_ttc, ordre
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          idRetour, ligne.id_ligne_bl || null, ligne.id_ligne_facture || null,
          ligne.id_article || null, ligne.designation || '', qte, prix, tauxTvaLigne,
          montantLigneHt, montantLigneTva, montantLigneTtc, i + 1
        ]
      );
    }

    await client.query('COMMIT');

    // Récupérer le bon de retour complet
    const retourComplet = await pool.query(
      `SELECT 
        br.*,
        c.raison_sociale as client_nom,
        bl.numero_bl,
        f.numero_facture
      FROM bons_retour br
      LEFT JOIN clients c ON br.id_client = c.id_client
      LEFT JOIN bons_livraison bl ON br.id_bl = bl.id_bl
      LEFT JOIN factures f ON br.id_facture = f.id_facture
      WHERE br.id_retour = $1`,
      [idRetour]
    );

    const lignesResult = await pool.query(
      'SELECT * FROM lignes_retour WHERE id_retour = $1 ORDER BY ordre',
      [idRetour]
    );

    res.status(201).json({
      success: true,
      data: {
        ...retourComplet.rows[0],
        lignes: lignesResult.rows
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[Bons Retour] Erreur createBonRetour:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Erreur serveur' }
    });
  } finally {
    client.release();
  }
};

// POST /api/bons-retour/from-bl/:id - Générer un bon de retour depuis un BL
export const createBonRetourFromBL = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { id } = req.params; // id du BL
    const { motif, type_retour, date_retour, lignes, ...retourData } = req.body;

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

    // Utiliser les lignes fournies ou toutes les lignes du BL
    const lignesRetour = lignes && lignes.length > 0 
      ? lignes.map(l => {
          const ligneBl = lignesBl.rows.find(lb => lb.id_ligne === l.id_ligne_bl);
          return {
            id_ligne_bl: l.id_ligne_bl || ligneBl?.id_ligne,
            id_article: l.id_article || ligneBl?.id_article,
            designation: l.designation || ligneBl?.designation || '',
            quantite_retournee: l.quantite_retournee || ligneBl?.quantite_livree || 0,
            prix_unitaire_ht: l.prix_unitaire_ht || ligneBl?.prix_unitaire_ht || 0,
            taux_tva: l.taux_tva || ligneBl?.taux_tva || 20
          };
        })
      : lignesBl.rows.map(ligne => ({
          id_ligne_bl: ligne.id_ligne,
          id_article: ligne.id_article,
          designation: ligne.designation || '',
          quantite_retournee: ligne.quantite_livree,
          prix_unitaire_ht: ligne.prix_unitaire_ht,
          taux_tva: ligne.taux_tva || 20
        }));

    // Créer le bon de retour avec les lignes
    const createData = {
      id_bl: id,
      id_facture: blData.id_facture || null,
      id_client: blData.id_client,
      date_retour: date_retour || new Date().toISOString().split('T')[0],
      motif: motif || 'Retour marchandise',
      type_retour: type_retour || 'RETOUR',
      lignes: lignesRetour,
      ...retourData
    };

    await client.query('COMMIT');

    // Appeler createBonRetour avec les données préparées
    req.body = createData;
    return createBonRetour(req, res);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[Bons Retour] Erreur createBonRetourFromBL:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Erreur serveur' }
    });
  } finally {
    client.release();
  }
};

// PUT /api/bons-retour/:id - Modifier un bon de retour
export const updateBonRetour = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const { lignes, ...retourData } = req.body;

    // Vérifier que le bon de retour existe
    const retourCheck = await client.query(
      'SELECT id_retour, statut FROM bons_retour WHERE id_retour = $1',
      [id]
    );

    if (retourCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        error: { message: 'Bon de retour non trouvé' }
      });
    }

    // Ne pas modifier un retour traité
    if (retourCheck.rows[0].statut === 'TRAITE') {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        error: { message: 'Impossible de modifier un bon de retour déjà traité' }
      });
    }

    // Mettre à jour le bon de retour
    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    Object.keys(retourData).forEach(key => {
      if (key !== 'id_retour' && key !== 'numero_retour') {
        updateFields.push(`${key} = $${paramCount}`);
        updateValues.push(retourData[key]);
        paramCount++;
      }
    });

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    updateValues.push(id);

    if (updateFields.length > 1) {
      await client.query(
        `UPDATE bons_retour SET ${updateFields.join(', ')} WHERE id_retour = $${paramCount}`,
        updateValues
      );
    }

    await client.query('COMMIT');

    // Récupérer le bon de retour mis à jour
    const retourComplet = await pool.query(
      `SELECT 
        br.*,
        c.raison_sociale as client_nom,
        bl.numero_bl,
        f.numero_facture
      FROM bons_retour br
      LEFT JOIN clients c ON br.id_client = c.id_client
      LEFT JOIN bons_livraison bl ON br.id_bl = bl.id_bl
      LEFT JOIN factures f ON br.id_facture = f.id_facture
      WHERE br.id_retour = $1`,
      [id]
    );

    const lignesResult = await pool.query(
      'SELECT * FROM lignes_retour WHERE id_retour = $1 ORDER BY ordre',
      [id]
    );

    res.json({
      success: true,
      data: {
        ...retourComplet.rows[0],
        lignes: lignesResult.rows
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[Bons Retour] Erreur updateBonRetour:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Erreur serveur' }
    });
  } finally {
    client.release();
  }
};

// DELETE /api/bons-retour/:id - Supprimer un bon de retour
export const deleteBonRetour = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier que le bon de retour existe
    const retour = await pool.query(
      'SELECT id_retour, statut FROM bons_retour WHERE id_retour = $1',
      [id]
    );

    if (retour.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Bon de retour non trouvé' }
      });
    }

    // Ne pas supprimer un retour traité
    if (retour.rows[0].statut === 'TRAITE') {
      return res.status(400).json({
        success: false,
        error: { message: 'Impossible de supprimer un bon de retour déjà traité' }
      });
    }

    // Supprimer le bon de retour (les lignes seront supprimées automatiquement via CASCADE)
    await pool.query('DELETE FROM bons_retour WHERE id_retour = $1', [id]);

    res.json({
      success: true,
      message: 'Bon de retour supprimé avec succès'
    });
  } catch (error) {
    console.error('[Bons Retour] Erreur deleteBonRetour:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Erreur serveur' }
    });
  }
};
