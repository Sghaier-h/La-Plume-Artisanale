import { pool } from '../utils/db.js';

// GET /api/devis - Liste tous les devis
export const getDevis = async (req, res) => {
  try {
    const { search, statut, client_id, date_debut, date_fin } = req.query;
    
    let query = `
      SELECT 
        d.id_devis,
        d.numero_devis,
        d.id_client,
        c.raison_sociale as client_nom,
        d.date_devis,
        d.date_validite,
        d.statut,
        d.montant_ht,
        d.montant_tva,
        d.montant_ttc,
        d.id_commande,
        d.created_at
      FROM devis d
      LEFT JOIN clients c ON d.id_client = c.id_client
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      query += ` AND (d.numero_devis ILIKE $${paramCount} OR c.raison_sociale ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    if (statut) {
      paramCount++;
      query += ` AND d.statut = $${paramCount}`;
      params.push(statut);
    }

    if (client_id) {
      paramCount++;
      query += ` AND d.id_client = $${paramCount}`;
      params.push(client_id);
    }

    if (date_debut) {
      paramCount++;
      query += ` AND d.date_devis >= $${paramCount}`;
      params.push(date_debut);
    }

    if (date_fin) {
      paramCount++;
      query += ` AND d.date_devis <= $${paramCount}`;
      params.push(date_fin);
    }

    query += ` ORDER BY d.date_devis DESC`;

    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('[Devis] Erreur getDevis:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// GET /api/devis/:id - Détails d'un devis avec lignes
export const getDevisById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const devis = await pool.query(
      `SELECT 
        d.*,
        c.raison_sociale as client_nom,
        c.code_client as client_code,
        cmd.numero_commande
      FROM devis d
      LEFT JOIN clients c ON d.id_client = c.id_client
      LEFT JOIN commandes cmd ON d.id_commande = cmd.id_commande
      WHERE d.id_devis = $1`,
      [id]
    );

    if (devis.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Devis non trouvé' }
      });
    }

    // Récupérer les lignes
    const lignes = await pool.query(
      `SELECT 
        ld.*,
        a.reference as article_reference
      FROM lignes_devis ld
      LEFT JOIN articles_catalogue a ON ld.id_article = a.id_article
      WHERE ld.id_devis = $1
      ORDER BY ld.ordre, ld.id_ligne`,
      [id]
    );

    res.json({
      success: true,
      data: {
        ...devis.rows[0],
        lignes: lignes.rows
      }
    });
  } catch (error) {
    console.error('[Devis] Erreur getDevis:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// POST /api/devis - Créer un devis
export const createDevis = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { id_client, date_devis, date_validite, lignes, ...devisData } = req.body;

    // Validation
    if (!id_client || !date_devis || !lignes || lignes.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        error: { message: 'Client, date et lignes de devis requis' }
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

    // Générer le numéro de devis
    const numeroResult = await client.query('SELECT generer_numero_devis() as numero');
    const numero = numeroResult.rows[0].numero;

    // Calculer les totaux
    let montantHt = 0;
    let montantTva = 0;
    const tauxTva = devisData.taux_tva || 20;
    const remiseGlobale = devisData.remise_globale || 0;

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

    // Créer le devis
    const devisResult = await client.query(
      `INSERT INTO devis (
        numero_devis, id_client, date_devis, date_validite, statut,
        montant_ht, taux_tva, montant_tva, montant_ttc, remise_globale, montant_remise,
        reference_client, conditions_paiement, conditions_livraison, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *`,
      [
        numero, id_client, date_devis, date_validite || null, devisData.statut || 'BROUILLON',
        montantHt, tauxTva, montantTva, montantTtc, remiseGlobale, montantRemise,
        devisData.reference_client || null, devisData.conditions_paiement || null,
        devisData.conditions_livraison || null, devisData.notes || null
      ]
    );

    const idDevis = devisResult.rows[0].id_devis;

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
        `INSERT INTO lignes_devis (
          id_devis, id_article, designation, quantite,
          prix_unitaire_ht, taux_tva, remise,
          montant_ht, montant_tva, montant_ttc, ordre
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          idDevis, ligne.id_article || null, ligne.designation || '',
          qte, prix, tauxTvaLigne, remise,
          montantLigneHt, montantLigneTva, montantLigneTtc, i + 1
        ]
      );
    }

    await client.query('COMMIT');

    // Récupérer le devis complet
    const devisComplet = await pool.query(
      `SELECT 
        d.*,
        c.raison_sociale as client_nom
      FROM devis d
      LEFT JOIN clients c ON d.id_client = c.id_client
      WHERE d.id_devis = $1`,
      [idDevis]
    );

    const lignesResult = await pool.query(
      'SELECT * FROM lignes_devis WHERE id_devis = $1 ORDER BY ordre',
      [idDevis]
    );

    res.status(201).json({
      success: true,
      data: {
        ...devisComplet.rows[0],
        lignes: lignesResult.rows
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[Devis] Erreur createDevis:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Erreur serveur' }
    });
  } finally {
    client.release();
  }
};

// PUT /api/devis/:id - Modifier un devis
export const updateDevis = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const { lignes, ...devisData } = req.body;

    // Vérifier que le devis existe
    const devisCheck = await client.query(
      'SELECT id_devis, statut FROM devis WHERE id_devis = $1',
      [id]
    );

    if (devisCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        error: { message: 'Devis non trouvé' }
      });
    }

    // Ne pas modifier un devis transformé en commande
    if (devisCheck.rows[0].statut === 'TRANSFORME') {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        error: { message: 'Impossible de modifier un devis transformé en commande' }
      });
    }

    // Si des lignes sont fournies, recalculer les totaux
    if (lignes && lignes.length > 0) {
      let montantHt = 0;
      let montantTva = 0;
      const tauxTva = devisData.taux_tva || 20;
      const remiseGlobale = devisData.remise_globale || 0;

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

      const montantRemise = montantHt * remiseGlobale / 100;
      montantHt -= montantRemise;
      const montantTtc = montantHt + montantTva;

      devisData.montant_ht = montantHt;
      devisData.montant_tva = montantTva;
      devisData.montant_ttc = montantTtc;
      devisData.montant_remise = montantRemise;

      // Supprimer les anciennes lignes
      await client.query('DELETE FROM lignes_devis WHERE id_devis = $1', [id]);

      // Créer les nouvelles lignes
      for (let i = 0; i < lignes.length; i++) {
        const ligne = lignes[i];
        const prix = parseFloat(ligne.prix_unitaire_ht || 0);
        const qte = parseFloat(ligne.quantite || 0);
        const remise = parseFloat(ligne.remise || 0);
        const tauxTvaLigne = parseFloat(ligne.taux_tva || devisData.taux_tva || 20);
        
        const montantLigneHt = prix * qte * (1 - remise / 100);
        const montantLigneTva = montantLigneHt * tauxTvaLigne / 100;
        const montantLigneTtc = montantLigneHt + montantLigneTva;

        await client.query(
          `INSERT INTO lignes_devis (
            id_devis, id_article, designation, quantite,
            prix_unitaire_ht, taux_tva, remise,
            montant_ht, montant_tva, montant_ttc, ordre
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [
            id, ligne.id_article || null, ligne.designation || '',
            qte, prix, tauxTvaLigne, remise,
            montantLigneHt, montantLigneTva, montantLigneTtc, i + 1
          ]
        );
      }
    }

    // Mettre à jour le devis
    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    Object.keys(devisData).forEach(key => {
      if (key !== 'id_devis' && key !== 'numero_devis') {
        updateFields.push(`${key} = $${paramCount}`);
        updateValues.push(devisData[key]);
        paramCount++;
      }
    });

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    updateValues.push(id);

    if (updateFields.length > 1) {
      await client.query(
        `UPDATE devis SET ${updateFields.join(', ')} WHERE id_devis = $${paramCount}`,
        updateValues
      );
    }

    await client.query('COMMIT');

    // Récupérer le devis mis à jour
    const devisComplet = await pool.query(
      `SELECT 
        d.*,
        c.raison_sociale as client_nom
      FROM devis d
      LEFT JOIN clients c ON d.id_client = c.id_client
      WHERE d.id_devis = $1`,
      [id]
    );

    const lignesResult = await pool.query(
      'SELECT * FROM lignes_devis WHERE id_devis = $1 ORDER BY ordre',
      [id]
    );

    res.json({
      success: true,
      data: {
        ...devisComplet.rows[0],
        lignes: lignesResult.rows
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[Devis] Erreur updateDevis:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Erreur serveur' }
    });
  } finally {
    client.release();
  }
};

// POST /api/devis/:id/transformer - Transformer un devis en commande
export const transformerEnCommande = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const { date_commande, date_livraison_prevue, ...commandeData } = req.body;

    // Récupérer le devis
    const devisResult = await client.query(
      'SELECT * FROM devis WHERE id_devis = $1',
      [id]
    );

    if (devisResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        error: { message: 'Devis non trouvé' }
      });
    }

    const devis = devisResult.rows[0];

    if (devis.statut === 'TRANSFORME') {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        error: { message: 'Ce devis a déjà été transformé en commande' }
      });
    }

    // Générer le numéro de commande
    const count = await client.query(
      'SELECT COUNT(*) as count FROM commandes WHERE date_commande >= CURRENT_DATE'
    );
    const numeroCommande = `CMD-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${String(parseInt(count.rows[0].count) + 1).padStart(4, '0')}`;

    // Récupérer les lignes du devis
    const lignesDevis = await client.query(
      'SELECT * FROM lignes_devis WHERE id_devis = $1 ORDER BY ordre',
      [id]
    );

    // Créer la commande
    const commandeResult = await client.query(
      `INSERT INTO commandes (
        numero_commande, id_client, date_commande, date_livraison_prevue,
        statut, priorite, montant_total, devise, conditions_paiement,
        adresse_livraison, observations
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        numeroCommande, devis.id_client, date_commande || new Date().toISOString().split('T')[0],
        date_livraison_prevue || null, 'en_attente', commandeData.priorite || 'normale',
        devis.montant_ttc, 'TND', devis.conditions_paiement || null,
        commandeData.adresse_livraison || null, devis.notes || null
      ]
    );

    const idCommande = commandeResult.rows[0].id_commande;

    // Créer les lignes de commande
    for (let i = 0; i < lignesDevis.rows.length; i++) {
      const ligneDevis = lignesDevis.rows[i];
      await client.query(
        `INSERT INTO articles_commande (
          id_commande, numero_ligne, id_article, quantite_commandee,
          prix_unitaire, remise, montant_ligne, statut
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          idCommande, i + 1, ligneDevis.id_article || null,
          ligneDevis.quantite, ligneDevis.prix_unitaire_ht,
          ligneDevis.remise, ligneDevis.montant_ttc, 'en_attente'
        ]
      );
    }

    // Mettre à jour le devis
    await client.query(
      `UPDATE devis 
      SET statut = 'TRANSFORME', id_commande = $1, date_transformation = CURRENT_TIMESTAMP
      WHERE id_devis = $2`,
      [idCommande, id]
    );

    await client.query('COMMIT');

    res.json({
      success: true,
      data: {
        devis: {
          ...devis,
          statut: 'TRANSFORME',
          id_commande: idCommande
        },
        commande: commandeResult.rows[0]
      },
      message: 'Devis transformé en commande avec succès'
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[Devis] Erreur transformerEnCommande:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Erreur serveur' }
    });
  } finally {
    client.release();
  }
};

// DELETE /api/devis/:id - Supprimer un devis
export const deleteDevis = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier que le devis existe
    const devis = await pool.query(
      'SELECT id_devis, statut FROM devis WHERE id_devis = $1',
      [id]
    );

    if (devis.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Devis non trouvé' }
      });
    }

    // Ne pas supprimer un devis transformé
    if (devis.rows[0].statut === 'TRANSFORME') {
      return res.status(400).json({
        success: false,
        error: { message: 'Impossible de supprimer un devis transformé en commande' }
      });
    }

    // Supprimer le devis (les lignes seront supprimées automatiquement via CASCADE)
    await pool.query('DELETE FROM devis WHERE id_devis = $1', [id]);

    res.json({
      success: true,
      message: 'Devis supprimé avec succès'
    });
  } catch (error) {
    console.error('[Devis] Erreur deleteDevis:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Erreur serveur' }
    });
  }
};
