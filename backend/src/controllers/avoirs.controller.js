import { pool } from '../utils/db.js';

// GET /api/avoirs - Liste tous les avoirs
export const getAvoirs = async (req, res) => {
  try {
    const { search, statut, client_id, date_debut, date_fin } = req.query;
    
    let query = `
      SELECT 
        a.id_avoir,
        a.numero_avoir,
        a.id_facture,
        a.id_client,
        c.raison_sociale as client_nom,
        f.numero_facture,
        a.date_avoir,
        a.statut,
        a.motif,
        a.type_avoir,
        a.montant_ttc,
        a.montant_applique,
        a.montant_restant,
        a.created_at
      FROM avoirs a
      LEFT JOIN clients c ON a.id_client = c.id_client
      LEFT JOIN factures f ON a.id_facture = f.id_facture
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      query += ` AND (a.numero_avoir ILIKE $${paramCount} OR c.raison_sociale ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    if (statut) {
      paramCount++;
      query += ` AND a.statut = $${paramCount}`;
      params.push(statut);
    }

    if (client_id) {
      paramCount++;
      query += ` AND a.id_client = $${paramCount}`;
      params.push(client_id);
    }

    if (date_debut) {
      paramCount++;
      query += ` AND a.date_avoir >= $${paramCount}`;
      params.push(date_debut);
    }

    if (date_fin) {
      paramCount++;
      query += ` AND a.date_avoir <= $${paramCount}`;
      params.push(date_fin);
    }

    query += ` ORDER BY a.date_avoir DESC`;

    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('[Avoirs] Erreur getAvoirs:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// GET /api/avoirs/:id - Détails d'un avoir avec lignes
export const getAvoirById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const avoir = await pool.query(
      `SELECT 
        a.*,
        c.raison_sociale as client_nom,
        c.code_client as client_code,
        f.numero_facture
      FROM avoirs a
      LEFT JOIN clients c ON a.id_client = c.id_client
      LEFT JOIN factures f ON a.id_facture = f.id_facture
      WHERE a.id_avoir = $1`,
      [id]
    );

    if (avoir.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Avoir non trouvé' }
      });
    }

    // Récupérer les lignes
    const lignes = await pool.query(
      `SELECT 
        la.*,
        a_ref.reference as article_reference
      FROM lignes_avoir la
      LEFT JOIN articles_catalogue a_ref ON la.id_article = a_ref.id_article
      WHERE la.id_avoir = $1
      ORDER BY la.ordre, la.id_ligne`,
      [id]
    );

    res.json({
      success: true,
      data: {
        ...avoir.rows[0],
        lignes: lignes.rows
      }
    });
  } catch (error) {
    console.error('[Avoirs] Erreur getAvoirById:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// POST /api/avoirs - Créer un avoir
export const createAvoir = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { id_facture, id_client, date_avoir, motif, type_avoir, lignes, ...avoirData } = req.body;

    // Validation
    if (!id_client || !date_avoir || !motif || !type_avoir || !lignes || lignes.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        error: { message: 'Client, date, motif, type et lignes d\'avoir requis' }
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

    // Générer le numéro d'avoir
    const numeroResult = await client.query('SELECT generer_numero_avoir() as numero');
    const numero = numeroResult.rows[0].numero;

    // Calculer les totaux
    let montantHt = 0;
    let montantTva = 0;
    const tauxTva = 20; // Par défaut

    for (const ligne of lignes) {
      const prix = parseFloat(ligne.prix_unitaire_ht || 0);
      const qte = parseFloat(ligne.quantite || 0);
      const tauxTvaLigne = parseFloat(ligne.taux_tva || tauxTva);
      
      const montantLigneHt = prix * qte;
      const montantLigneTva = montantLigneHt * tauxTvaLigne / 100;
      
      montantHt += montantLigneHt;
      montantTva += montantLigneTva;
    }

    const montantTtc = montantHt + montantTva;
    const montantApplique = 0;
    const montantRestant = montantTtc;

    // Récupérer le numéro de facture si fourni
    let referenceFacture = avoirData.reference_facture || null;
    if (id_facture && !referenceFacture) {
      const factureResult = await client.query(
        'SELECT numero_facture FROM factures WHERE id_facture = $1',
        [id_facture]
      );
      if (factureResult.rows.length > 0) {
        referenceFacture = factureResult.rows[0].numero_facture;
      }
    }

    // Créer l'avoir
    const avoirResult = await client.query(
      `INSERT INTO avoirs (
        numero_avoir, id_facture, id_client, date_avoir, statut,
        motif, type_avoir, montant_ht, montant_tva, montant_ttc,
        montant_applique, montant_restant, reference_facture, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *`,
      [
        numero, id_facture || null, id_client, date_avoir, avoirData.statut || 'BROUILLON',
        motif, type_avoir, montantHt, montantTva, montantTtc,
        montantApplique, montantRestant, referenceFacture, avoirData.notes || null
      ]
    );

    const idAvoir = avoirResult.rows[0].id_avoir;

    // Créer les lignes
    for (let i = 0; i < lignes.length; i++) {
      const ligne = lignes[i];
      const prix = parseFloat(ligne.prix_unitaire_ht || 0);
      const qte = parseFloat(ligne.quantite || 0);
      const tauxTvaLigne = parseFloat(ligne.taux_tva || tauxTva);
      
      const montantLigneHt = prix * qte;
      const montantLigneTva = montantLigneHt * tauxTvaLigne / 100;
      const montantLigneTtc = montantLigneHt + montantLigneTva;

      await client.query(
        `INSERT INTO lignes_avoir (
          id_avoir, id_ligne_facture, id_article, designation, quantite,
          prix_unitaire_ht, taux_tva, montant_ht, montant_tva, montant_ttc, ordre
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          idAvoir, ligne.id_ligne_facture || null, ligne.id_article || null,
          ligne.designation || '', qte, prix, tauxTvaLigne,
          montantLigneHt, montantLigneTva, montantLigneTtc, i + 1
        ]
      );
    }

    await client.query('COMMIT');

    // Récupérer l'avoir complet
    const avoirComplet = await pool.query(
      `SELECT 
        a.*,
        c.raison_sociale as client_nom,
        f.numero_facture
      FROM avoirs a
      LEFT JOIN clients c ON a.id_client = c.id_client
      LEFT JOIN factures f ON a.id_facture = f.id_facture
      WHERE a.id_avoir = $1`,
      [idAvoir]
    );

    const lignesResult = await pool.query(
      'SELECT * FROM lignes_avoir WHERE id_avoir = $1 ORDER BY ordre',
      [idAvoir]
    );

    res.status(201).json({
      success: true,
      data: {
        ...avoirComplet.rows[0],
        lignes: lignesResult.rows
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[Avoirs] Erreur createAvoir:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Erreur serveur' }
    });
  } finally {
    client.release();
  }
};

// POST /api/avoirs/from-facture/:id - Générer un avoir depuis une facture
export const createAvoirFromFacture = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { id } = req.params; // id de la facture
    const { motif, type_avoir, date_avoir, lignes, ...avoirData } = req.body;

    // Récupérer la facture
    const facture = await client.query(
      `SELECT * FROM factures WHERE id_facture = $1`,
      [id]
    );

    if (facture.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        error: { message: 'Facture non trouvée' }
      });
    }

    const fac = facture.rows[0];

    // Récupérer les lignes de facture
    const lignesFacture = await client.query(
      `SELECT 
        lf.*,
        a.reference as article_reference,
        a.designation as article_designation
      FROM lignes_facture lf
      LEFT JOIN articles_catalogue a ON lf.id_article = a.id_article
      WHERE lf.id_facture = $1
      ORDER BY lf.ordre`,
      [id]
    );

    if (lignesFacture.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        error: { message: 'La facture n\'a pas de lignes' }
      });
    }

    // Utiliser les lignes fournies ou toutes les lignes de la facture
    const lignesAvoir = lignes && lignes.length > 0 
      ? lignes.map(l => {
          const ligneFacture = lignesFacture.rows.find(lf => lf.id_ligne === l.id_ligne_facture);
          return {
            id_ligne_facture: l.id_ligne_facture || ligneFacture?.id_ligne,
            id_article: l.id_article || ligneFacture?.id_article,
            designation: l.designation || ligneFacture?.designation || '',
            quantite: l.quantite || ligneFacture?.quantite || 0,
            prix_unitaire_ht: l.prix_unitaire_ht || ligneFacture?.prix_unitaire_ht || 0,
            taux_tva: l.taux_tva || ligneFacture?.taux_tva || 20
          };
        })
      : lignesFacture.rows.map(ligne => ({
          id_ligne_facture: ligne.id_ligne,
          id_article: ligne.id_article,
          designation: ligne.designation || '',
          quantite: ligne.quantite,
          prix_unitaire_ht: ligne.prix_unitaire_ht,
          taux_tva: ligne.taux_tva || 20
        }));

    // Créer l'avoir avec les lignes
    const createData = {
      id_facture: id,
      id_client: fac.id_client,
      date_avoir: date_avoir || new Date().toISOString().split('T')[0],
      motif: motif || 'Retour marchandise',
      type_avoir: type_avoir || 'RETOUR',
      lignes: lignesAvoir,
      reference_facture: fac.numero_facture,
      ...avoirData
    };

    await client.query('COMMIT');

    // Appeler createAvoir avec les données préparées
    req.body = createData;
    return createAvoir(req, res);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[Avoirs] Erreur createAvoirFromFacture:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Erreur serveur' }
    });
  } finally {
    client.release();
  }
};

// PUT /api/avoirs/:id - Modifier un avoir
export const updateAvoir = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const { lignes, ...avoirData } = req.body;

    // Vérifier que l'avoir existe
    const avoirCheck = await client.query(
      'SELECT id_avoir, statut FROM avoirs WHERE id_avoir = $1',
      [id]
    );

    if (avoirCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        error: { message: 'Avoir non trouvé' }
      });
    }

    // Ne pas modifier un avoir appliqué
    if (avoirCheck.rows[0].statut === 'APPLIQUE') {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        error: { message: 'Impossible de modifier un avoir déjà appliqué' }
      });
    }

    // Mettre à jour l'avoir
    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    Object.keys(avoirData).forEach(key => {
      if (key !== 'id_avoir' && key !== 'numero_avoir') {
        updateFields.push(`${key} = $${paramCount}`);
        updateValues.push(avoirData[key]);
        paramCount++;
      }
    });

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    updateValues.push(id);

    if (updateFields.length > 1) {
      await client.query(
        `UPDATE avoirs SET ${updateFields.join(', ')} WHERE id_avoir = $${paramCount}`,
        updateValues
      );
    }

    await client.query('COMMIT');

    // Récupérer l'avoir mis à jour
    const avoirComplet = await pool.query(
      `SELECT 
        a.*,
        c.raison_sociale as client_nom,
        f.numero_facture
      FROM avoirs a
      LEFT JOIN clients c ON a.id_client = c.id_client
      LEFT JOIN factures f ON a.id_facture = f.id_facture
      WHERE a.id_avoir = $1`,
      [id]
    );

    const lignesResult = await pool.query(
      'SELECT * FROM lignes_avoir WHERE id_avoir = $1 ORDER BY ordre',
      [id]
    );

    res.json({
      success: true,
      data: {
        ...avoirComplet.rows[0],
        lignes: lignesResult.rows
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[Avoirs] Erreur updateAvoir:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Erreur serveur' }
    });
  } finally {
    client.release();
  }
};

// DELETE /api/avoirs/:id - Supprimer un avoir
export const deleteAvoir = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier que l'avoir existe
    const avoir = await pool.query(
      'SELECT id_avoir, statut FROM avoirs WHERE id_avoir = $1',
      [id]
    );

    if (avoir.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Avoir non trouvé' }
      });
    }

    // Ne pas supprimer un avoir appliqué
    if (avoir.rows[0].statut === 'APPLIQUE') {
      return res.status(400).json({
        success: false,
        error: { message: 'Impossible de supprimer un avoir déjà appliqué' }
      });
    }

    // Supprimer l'avoir (les lignes seront supprimées automatiquement via CASCADE)
    await pool.query('DELETE FROM avoirs WHERE id_avoir = $1', [id]);

    res.json({
      success: true,
      message: 'Avoir supprimé avec succès'
    });
  } catch (error) {
    console.error('[Avoirs] Erreur deleteAvoir:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Erreur serveur' }
    });
  }
};
