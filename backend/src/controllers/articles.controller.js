import { pool } from '../utils/db.js';

// GET /api/articles - Liste tous les articles
export const getArticles = async (req, res) => {
  try {
    const { search, type, actif, reference, couleur, dimension, finition } = req.query;
    
    let query = `
      SELECT 
        a.id_article,
        a.code_article,
        a.designation,
        a.id_type_article,
        ta.libelle as type_article,
        a.specification,
        a.unite_vente,
        a.prix_unitaire_base,
        a.temps_production_standard,
        a.id_reference,
        ar.code_reference,
        ar.libelle as reference_libelle,
        a.id_dimension,
        d.code_dimension,
        d.libelle as dimension_libelle,
        d.largeur,
        d.longueur,
        a.id_couleur,
        c.code_commercial as couleur_code,
        c.nom as couleur_nom,
        c.code_hex as couleur_hex,
        a.id_finition,
        f.code_finition,
        f.libelle as finition_libelle,
        a.id_selecteur,
        s.code_selecteur,
        s.description as selecteur_description,
        a.image_url,
        a.ordre_affichage,
        a.actif,
        a.date_creation,
        a.date_modification
      FROM articles_catalogue a
      LEFT JOIN types_articles ta ON a.id_type_article = ta.id_type_article
      LEFT JOIN articles_references ar ON a.id_reference = ar.id_reference
      LEFT JOIN dimensions_articles d ON a.id_dimension = d.id_dimension
      LEFT JOIN couleurs_articles c ON a.id_couleur = c.id_couleur
      LEFT JOIN finitions_articles f ON a.id_finition = f.id_finition
      LEFT JOIN selecteurs s ON a.id_selecteur = s.id_selecteur
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      query += ` AND (a.code_article ILIKE $${paramCount} OR a.designation ILIKE $${paramCount} OR ar.libelle ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    if (type) {
      paramCount++;
      query += ` AND a.id_type_article = $${paramCount}`;
      params.push(type);
    }

    if (reference) {
      paramCount++;
      query += ` AND a.id_reference = $${paramCount}`;
      params.push(reference);
    }

    if (couleur) {
      paramCount++;
      query += ` AND a.id_couleur = $${paramCount}`;
      params.push(couleur);
    }

    if (dimension) {
      paramCount++;
      query += ` AND a.id_dimension = $${paramCount}`;
      params.push(dimension);
    }

    if (finition) {
      paramCount++;
      query += ` AND a.id_finition = $${paramCount}`;
      params.push(finition);
    }

    if (actif !== undefined) {
      paramCount++;
      query += ` AND a.actif = $${paramCount}`;
      params.push(actif === 'true');
    }

    query += ` ORDER BY ar.libelle, a.ordre_affichage, a.date_creation DESC`;

    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Erreur getArticles:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// GET /api/articles/:id - Détails d'un article
export const getArticle = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `SELECT 
        a.*,
        ta.libelle as type_article,
        ar.code_reference,
        ar.libelle as reference_libelle,
        d.code_dimension,
        d.libelle as dimension_libelle,
        d.largeur,
        d.longueur,
        c.code_commercial as couleur_code,
        c.nom as couleur_nom,
        c.code_hex as couleur_hex,
        f.code_finition,
        f.libelle as finition_libelle,
        s.code_selecteur,
        s.description as selecteur_description
      FROM articles_catalogue a
      LEFT JOIN types_articles ta ON a.id_type_article = ta.id_type_article
      LEFT JOIN articles_references ar ON a.id_reference = ar.id_reference
      LEFT JOIN dimensions_articles d ON a.id_dimension = d.id_dimension
      LEFT JOIN couleurs_articles c ON a.id_couleur = c.id_couleur
      LEFT JOIN finitions_articles f ON a.id_finition = f.id_finition
      LEFT JOIN selecteurs s ON a.id_selecteur = s.id_selecteur
      WHERE a.id_article = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Article non trouvé' }
      });
    }

    // Récupérer les attributs multiples
    const attributsResult = await pool.query(
      `SELECT * FROM articles_attributs WHERE id_article = $1 AND actif = true ORDER BY type_attribut, ordre`,
      [id]
    );

    const article = result.rows[0];
    article.attributs = attributsResult.rows;

    res.json({
      success: true,
      data: article
    });
  } catch (error) {
    console.error('Erreur getArticle:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// POST /api/articles - Créer un article
export const createArticle = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const {
      code_article,
      designation,
      id_type_article,
      specification,
      unite_vente,
      prix_unitaire_base,
      temps_production_standard,
      id_reference,
      id_dimension,
      id_couleur,
      id_finition,
      id_selecteur,
      image_url,
      ordre_affichage,
      attributs,
      actif = true
    } = req.body;

    // Validation
    if (!code_article || !designation) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        error: { message: 'Code article et désignation requis' }
      });
    }

    // Vérifier si le code existe déjà
    const existing = await client.query(
      'SELECT id_article FROM articles_catalogue WHERE code_article = $1',
      [code_article]
    );

    if (existing.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        error: { message: 'Ce code article existe déjà' }
      });
    }

    const result = await client.query(
      `INSERT INTO articles_catalogue 
        (code_article, designation, id_type_article, specification, unite_vente, 
         prix_unitaire_base, temps_production_standard, id_reference, id_dimension,
         id_couleur, id_finition, id_selecteur, image_url, ordre_affichage, actif)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *`,
      [
        code_article, designation, id_type_article || null, specification || null,
        unite_vente || 'mètre', prix_unitaire_base || null, temps_production_standard || null,
        id_reference || null, id_dimension || null, id_couleur || null,
        id_finition || null, id_selecteur || null, image_url || null,
        ordre_affichage || 0, actif
      ]
    );

    const articleId = result.rows[0].id_article;

    // Insérer les attributs multiples si fournis
    if (attributs && Array.isArray(attributs)) {
      for (const attr of attributs) {
        await client.query(
          `INSERT INTO articles_attributs (id_article, type_attribut, id_attribut, valeur_attribut, ordre)
           VALUES ($1, $2, $3, $4, $5)`,
          [articleId, attr.type_attribut, attr.id_attribut, attr.valeur_attribut || null, attr.ordre || 0]
        );
      }
    }

    await client.query('COMMIT');

    // Récupérer l'article complet avec ses relations
    const articleComplet = await pool.query(
      `SELECT 
        a.*,
        ta.libelle as type_article,
        ar.code_reference,
        ar.libelle as reference_libelle,
        d.code_dimension,
        d.libelle as dimension_libelle,
        c.code_commercial as couleur_code,
        c.nom as couleur_nom,
        c.code_hex as couleur_hex,
        f.code_finition,
        f.libelle as finition_libelle,
        s.code_selecteur
      FROM articles_catalogue a
      LEFT JOIN types_articles ta ON a.id_type_article = ta.id_type_article
      LEFT JOIN articles_references ar ON a.id_reference = ar.id_reference
      LEFT JOIN dimensions_articles d ON a.id_dimension = d.id_dimension
      LEFT JOIN couleurs_articles c ON a.id_couleur = c.id_couleur
      LEFT JOIN finitions_articles f ON a.id_finition = f.id_finition
      LEFT JOIN selecteurs s ON a.id_selecteur = s.id_selecteur
      WHERE a.id_article = $1`,
      [articleId]
    );

    res.status(201).json({
      success: true,
      data: articleComplet.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erreur createArticle:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  } finally {
    client.release();
  }
};

// PUT /api/articles/:id - Modifier un article
export const updateArticle = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    const {
      code_article,
      designation,
      id_type_article,
      specification,
      unite_vente,
      prix_unitaire_base,
      temps_production_standard,
      id_reference,
      id_dimension,
      id_couleur,
      id_finition,
      id_selecteur,
      image_url,
      ordre_affichage,
      attributs,
      actif
    } = req.body;

    // Vérifier si l'article existe
    const existing = await client.query(
      'SELECT id_article FROM articles_catalogue WHERE id_article = $1',
      [id]
    );

    if (existing.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        error: { message: 'Article non trouvé' }
      });
    }

    // Vérifier si le nouveau code existe déjà (si changé)
    if (code_article && code_article !== existing.rows[0].code_article) {
      const codeExists = await client.query(
        'SELECT id_article FROM articles_catalogue WHERE code_article = $1 AND id_article != $2',
        [code_article, id]
      );

      if (codeExists.rows.length > 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          error: { message: 'Ce code article existe déjà' }
        });
      }
    }

    const result = await client.query(
      `UPDATE articles_catalogue 
      SET 
        code_article = COALESCE($1, code_article),
        designation = COALESCE($2, designation),
        id_type_article = COALESCE($3, id_type_article),
        specification = COALESCE($4, specification),
        unite_vente = COALESCE($5, unite_vente),
        prix_unitaire_base = COALESCE($6, prix_unitaire_base),
        temps_production_standard = COALESCE($7, temps_production_standard),
        id_reference = COALESCE($8, id_reference),
        id_dimension = COALESCE($9, id_dimension),
        id_couleur = COALESCE($10, id_couleur),
        id_finition = COALESCE($11, id_finition),
        id_selecteur = COALESCE($12, id_selecteur),
        image_url = COALESCE($13, image_url),
        ordre_affichage = COALESCE($14, ordre_affichage),
        actif = COALESCE($15, actif),
        date_modification = CURRENT_TIMESTAMP
      WHERE id_article = $16
      RETURNING *`,
      [
        code_article, designation, id_type_article, specification, unite_vente,
        prix_unitaire_base, temps_production_standard, id_reference, id_dimension,
        id_couleur, id_finition, id_selecteur, image_url, ordre_affichage, actif, id
      ]
    );

    // Gérer les attributs multiples
    if (attributs !== undefined) {
      // Supprimer les anciens attributs
      await client.query('DELETE FROM articles_attributs WHERE id_article = $1', [id]);
      
      // Insérer les nouveaux attributs
      if (Array.isArray(attributs)) {
        for (const attr of attributs) {
          await client.query(
            `INSERT INTO articles_attributs (id_article, type_attribut, id_attribut, valeur_attribut, ordre)
             VALUES ($1, $2, $3, $4, $5)`,
            [id, attr.type_attribut, attr.id_attribut, attr.valeur_attribut || null, attr.ordre || 0]
          );
        }
      }
    }

    await client.query('COMMIT');

    // Récupérer l'article complet
    const articleComplet = await pool.query(
      `SELECT 
        a.*,
        ta.libelle as type_article,
        ar.code_reference,
        ar.libelle as reference_libelle,
        d.code_dimension,
        d.libelle as dimension_libelle,
        c.code_commercial as couleur_code,
        c.nom as couleur_nom,
        c.code_hex as couleur_hex,
        f.code_finition,
        f.libelle as finition_libelle,
        s.code_selecteur
      FROM articles_catalogue a
      LEFT JOIN types_articles ta ON a.id_type_article = ta.id_type_article
      LEFT JOIN articles_references ar ON a.id_reference = ar.id_reference
      LEFT JOIN dimensions_articles d ON a.id_dimension = d.id_dimension
      LEFT JOIN couleurs_articles c ON a.id_couleur = c.id_couleur
      LEFT JOIN finitions_articles f ON a.id_finition = f.id_finition
      LEFT JOIN selecteurs s ON a.id_selecteur = s.id_selecteur
      WHERE a.id_article = $1`,
      [id]
    );

    res.json({
      success: true,
      data: articleComplet.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erreur updateArticle:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  } finally {
    client.release();
  }
};

// DELETE /api/articles/:id - Supprimer un article (soft delete)
export const deleteArticle = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE articles_catalogue 
      SET actif = false, date_modification = CURRENT_TIMESTAMP
      WHERE id_article = $1
      RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Article non trouvé' }
      });
    }

    res.json({
      success: true,
      data: { message: 'Article désactivé avec succès' }
    });
  } catch (error) {
    console.error('Erreur deleteArticle:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// GET /api/articles/types - Liste des types d'articles
export const getTypesArticles = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM types_articles WHERE actif = true ORDER BY libelle'
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Erreur getTypesArticles:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};
