import { pool } from '../utils/db.js';

// Fonction pour générer référence commerciale
const genererRefCommerciale = (modele, dimensions, nbCouleurs, selecteurs) => {
  const codeModele = modele.code_modele || modele;
  const dim = dimensions.code || dimensions;
  
  if (nbCouleurs === 'U' || nbCouleurs === 1) {
    return `${codeModele}${dim}-${selecteurs[0]?.code_couleur || selecteurs[0]}`;
  } else if (nbCouleurs === 'B' || nbCouleurs === 2) {
    return `${codeModele}${dim}-B${selecteurs[0]?.code_couleur || selecteurs[0]}-${selecteurs[1]?.code_couleur || selecteurs[1]}`;
  } else {
    const codes = selecteurs.map(s => s?.code_couleur || s).join('-');
    return `${codeModele}${dim}-${nbCouleurs}-${codes}`;
  }
};

// Fonction pour générer référence fabrication
const genererRefFabrication = (modele, dimensions, nbCouleurs, selecteurs) => {
  const codeModele = modele.code_modele || modele;
  const dim = dimensions.code || dimensions;
  
  if (nbCouleurs === 'U' || nbCouleurs === 1) {
    return `${codeModele}${dim}-${selecteurs[0]?.code_couleur || selecteurs[0]}`;
  } else if (nbCouleurs === 'B' || nbCouleurs === 2) {
    return `${codeModele}${dim}-B-${selecteurs[0]?.code_couleur || selecteurs[0]}-${selecteurs[1]?.code_couleur || selecteurs[1]}`;
  } else {
    const codes = selecteurs.map(s => s?.code_couleur || s).join('-');
    return `${codeModele}${dim}-${nbCouleurs}-${codes}`;
  }
};

// GET /api/articles-catalogue - Liste catalogue avec filtres
export const getCatalogue = async (req, res) => {
  try {
    const { search, modele, dimension, finition, tissage, nbCouleurs, actif } = req.query;
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: {
          articles: [
            {
              id_article: 1,
              code_article: 'IB1020-BC20-C01',
              ref_commerciale: 'IB1020-BC20-C01',
              ref_fabrication: 'IB1020-B-C20-C01',
              modele: 'IBIZA',
              code_modele: 'IB',
              dimensions: '1020',
              libelle_dimensions: '100x200 cm',
              finition: 'FR',
              libelle_finition: 'Frange',
              tissage: 'PL',
              libelle_tissage: 'Tissage Plat',
              nb_couleurs: 2,
              selecteurs: [
                { position: 1, code_couleur: 'C20', nom_couleur: 'ROUGE', quantite_kg: 0.24 },
                { position: 2, code_couleur: 'C01', nom_couleur: 'BLANC', quantite_kg: 0.11 }
              ],
              prix_revient: 7.50,
              temps_production: 17.3,
              actif: true
            }
          ],
          total: 1
        }
      });
    }

    // Requête complexe pour récupérer le catalogue avec toutes les relations
    let query = `
      SELECT 
        a.id_article,
        a.code_article,
        a.ref_commerciale,
        a.ref_fabrication,
        a.id_modele,
        m.code_modele,
        m.libelle as modele_libelle,
        a.id_dimension,
        d.code as dimension_code,
        d.libelle as dimension_libelle,
        a.id_finition,
        f.code as finition_code,
        f.libelle as finition_libelle,
        a.id_tissage,
        t.code as tissage_code,
        t.libelle as tissage_libelle,
        a.nb_couleurs,
        a.prix_revient,
        a.temps_production,
        a.actif,
        a.date_creation
      FROM articles_catalogue a
      LEFT JOIN parametres_modeles m ON a.id_modele = m.id
      LEFT JOIN parametres_dimensions d ON a.id_dimension = d.id
      LEFT JOIN parametres_finitions f ON a.id_finition = f.id
      LEFT JOIN parametres_tissages t ON a.id_tissage = t.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;

    if (search) {
      query += ` AND (a.code_article ILIKE $${paramIndex} OR a.ref_commerciale ILIKE $${paramIndex} OR m.libelle ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (modele) {
      query += ` AND m.code_modele = $${paramIndex}`;
      params.push(modele);
      paramIndex++;
    }

    if (dimension) {
      query += ` AND d.code = $${paramIndex}`;
      params.push(dimension);
      paramIndex++;
    }

    if (finition) {
      query += ` AND f.code = $${paramIndex}`;
      params.push(finition);
      paramIndex++;
    }

    if (tissage) {
      query += ` AND t.code = $${paramIndex}`;
      params.push(tissage);
      paramIndex++;
    }

    if (nbCouleurs) {
      query += ` AND a.nb_couleurs = $${paramIndex}`;
      params.push(nbCouleurs);
      paramIndex++;
    }

    if (actif !== undefined) {
      query += ` AND a.actif = $${paramIndex}`;
      params.push(actif === 'true');
      paramIndex++;
    }

    query += ` ORDER BY m.libelle, d.code, a.nb_couleurs LIMIT 200`;

    const result = await pool.query(query, params);

    // Récupérer les sélecteurs pour chaque article
    const articlesWithSelecteurs = await Promise.all(
      result.rows.map(async (article) => {
        try {
          const selecteursResult = await pool.query(`
            SELECT 
              ns.position,
              ns.id_mp,
              mp.code_mp,
              c.code_commercial as code_couleur,
              c.nom as nom_couleur,
              ns.quantite_kg
            FROM nomenclature_selecteurs ns
            LEFT JOIN matieres_premieres mp ON ns.id_mp = mp.id_mp
            LEFT JOIN parametres_couleurs c ON mp.couleur = c.code_commercial
            WHERE ns.id_article = $1
            ORDER BY ns.position
          `, [article.id_article]);

          return {
            ...article,
            selecteurs: selecteursResult.rows
          };
        } catch (err) {
          return {
            ...article,
            selecteurs: []
          };
        }
      })
    );

    res.json({
      success: true,
      data: {
        articles: articlesWithSelecteurs,
        total: articlesWithSelecteurs.length
      }
    });
  } catch (error) {
    console.error('Erreur getCatalogue:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// GET /api/articles-catalogue/:id - Détails d'un article avec BOM
export const getArticleCatalogue = async (req, res) => {
  try {
    const { id } = req.params;
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: {
          id_article: parseInt(id),
          code_article: 'IB1020-BC20-C01',
          selecteurs: [
            { position: 1, code_couleur: 'C20', nom_couleur: 'ROUGE', quantite_kg: 0.24 }
          ]
        }
      });
    }

    const articleResult = await pool.query(`
      SELECT 
        a.*,
        m.code_modele, m.libelle as modele_libelle,
        d.code as dimension_code, d.libelle as dimension_libelle,
        f.code as finition_code, f.libelle as finition_libelle,
        t.code as tissage_code, t.libelle as tissage_libelle
      FROM articles_catalogue a
      LEFT JOIN parametres_modeles m ON a.id_modele = m.id
      LEFT JOIN parametres_dimensions d ON a.id_dimension = d.id
      LEFT JOIN parametres_finitions f ON a.id_finition = f.id
      LEFT JOIN parametres_tissages t ON a.id_tissage = t.id
      WHERE a.id_article = $1
    `, [id]);

    if (articleResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Article non trouvé' }
      });
    }

    const article = articleResult.rows[0];

    // Récupérer les sélecteurs
    const selecteursResult = await pool.query(`
      SELECT 
        ns.*,
        mp.code_mp, mp.designation as mp_designation,
        c.code_commercial as code_couleur, c.nom as nom_couleur
      FROM nomenclature_selecteurs ns
      LEFT JOIN matieres_premieres mp ON ns.id_mp = mp.id_mp
      LEFT JOIN parametres_couleurs c ON mp.couleur = c.code_commercial
      WHERE ns.id_article = $1
      ORDER BY ns.position
    `, [id]);

    res.json({
      success: true,
      data: {
        ...article,
        selecteurs: selecteursResult.rows
      }
    });
  } catch (error) {
    console.error('Erreur getArticleCatalogue:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// POST /api/articles-catalogue - Créer un article catalogue avec BOM
export const createArticleCatalogue = async (req, res) => {
  try {
    const {
      id_modele, id_dimension, id_finition, id_tissage, nb_couleurs,
      selecteurs, prix_revient, temps_production, actif = true
    } = req.body;

    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: {
          id_article: Math.floor(Math.random() * 1000),
          message: 'Article créé (mode mock)'
        }
      });
    }

    const client = await pool.connect();
    await client.query('BEGIN');

    try {
      // Récupérer les paramètres pour générer les références
      const [modele, dimension] = await Promise.all([
        client.query('SELECT code_modele FROM parametres_modeles WHERE id = $1', [id_modele]),
        client.query('SELECT code FROM parametres_dimensions WHERE id = $1', [id_dimension])
      ]);

      if (modele.rows.length === 0 || dimension.rows.length === 0) {
        throw new Error('Modèle ou dimension invalide');
      }

      // Générer les références
      const refCommerciale = genererRefCommerciale(
        modele.rows[0].code_modele,
        dimension.rows[0].code,
        nb_couleurs,
        selecteurs
      );
      const refFabrication = genererRefFabrication(
        modele.rows[0].code_modele,
        dimension.rows[0].code,
        nb_couleurs,
        selecteurs
      );

      // Créer l'article
      const articleResult = await client.query(`
        INSERT INTO articles_catalogue (
          code_article, ref_commerciale, ref_fabrication,
          id_modele, id_dimension, id_finition, id_tissage,
          nb_couleurs, prix_revient, temps_production, actif
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `, [
        refCommerciale, refCommerciale, refFabrication,
        id_modele, id_dimension, id_finition, id_tissage,
        nb_couleurs, prix_revient, temps_production, actif
      ]);

      const article = articleResult.rows[0];

      // Créer les sélecteurs
      if (selecteurs && selecteurs.length > 0) {
        for (let i = 0; i < selecteurs.length; i++) {
          const sel = selecteurs[i];
          await client.query(`
            INSERT INTO nomenclature_selecteurs (
              id_article, position, id_mp, quantite_kg
            ) VALUES ($1, $2, $3, $4)
          `, [article.id_article, i + 1, sel.id_mp, sel.quantite_kg]);
        }
      }

      await client.query('COMMIT');

      res.json({
        success: true,
        data: article
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erreur createArticleCatalogue:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Erreur serveur' }
    });
  }
};

// PUT /api/articles-catalogue/:id - Mettre à jour un article
export const updateArticleCatalogue = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      id_modele, id_dimension, id_finition, id_tissage, nb_couleurs,
      selecteurs, prix_revient, temps_production, actif
    } = req.body;

    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: { message: 'Article mis à jour (mode mock)' }
      });
    }

    const client = await pool.connect();
    await client.query('BEGIN');

    try {
      // Mettre à jour l'article
      const updates = [];
      const values = [];
      let paramIndex = 1;

      if (id_modele !== undefined) {
        updates.push(`id_modele = $${paramIndex++}`);
        values.push(id_modele);
      }
      if (id_dimension !== undefined) {
        updates.push(`id_dimension = $${paramIndex++}`);
        values.push(id_dimension);
      }
      if (id_finition !== undefined) {
        updates.push(`id_finition = $${paramIndex++}`);
        values.push(id_finition);
      }
      if (id_tissage !== undefined) {
        updates.push(`id_tissage = $${paramIndex++}`);
        values.push(id_tissage);
      }
      if (nb_couleurs !== undefined) {
        updates.push(`nb_couleurs = $${paramIndex++}`);
        values.push(nb_couleurs);
      }
      if (prix_revient !== undefined) {
        updates.push(`prix_revient = $${paramIndex++}`);
        values.push(prix_revient);
      }
      if (temps_production !== undefined) {
        updates.push(`temps_production = $${paramIndex++}`);
        values.push(temps_production);
      }
      if (actif !== undefined) {
        updates.push(`actif = $${paramIndex++}`);
        values.push(actif);
      }

      if (updates.length > 0) {
        values.push(id);
        await client.query(`
          UPDATE articles_catalogue 
          SET ${updates.join(', ')}, date_modification = CURRENT_TIMESTAMP
          WHERE id_article = $${paramIndex}
        `, values);
      }

      // Mettre à jour les sélecteurs si fournis
      if (selecteurs) {
        // Supprimer les anciens
        await client.query('DELETE FROM nomenclature_selecteurs WHERE id_article = $1', [id]);
        
        // Créer les nouveaux
        for (let i = 0; i < selecteurs.length; i++) {
          const sel = selecteurs[i];
          await client.query(`
            INSERT INTO nomenclature_selecteurs (
              id_article, position, id_mp, quantite_kg
            ) VALUES ($1, $2, $3, $4)
          `, [id, i + 1, sel.id_mp, sel.quantite_kg]);
        }
      }

      await client.query('COMMIT');

      res.json({
        success: true,
        data: { message: 'Article mis à jour avec succès' }
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erreur updateArticleCatalogue:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Erreur serveur' }
    });
  }
};
