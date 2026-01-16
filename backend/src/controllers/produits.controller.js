import { pool } from '../utils/db.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration multer pour upload photos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/produits');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'produit-' + uniqueSuffix + path.extname(file.originalname));
  }
});

export const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Seules les images sont autorisées (jpeg, jpg, png, gif, webp)'));
    }
  }
});

// Middleware upload photo
export const uploadPhoto = upload.single('photo');

// GET /api/produits - Liste tous les produits
export const getProduits = async (req, res) => {
  try {
    const { search, famille, actif, page = 1, limit = 20 } = req.query;
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' || 
                       (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'staging');
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: {
          produits: [
            {
              id_produit: 1,
              code_produit: 'PROD-001',
              designation: 'Fouta Ibiza',
              photo_principale: '/uploads/produits/fouta-ibiza.jpg',
              famille_produit: 'FOUTA',
              actif: true
            }
          ],
          total: 1
        }
      });
    }

    let query = `
      SELECT 
        p.*,
        COUNT(DISTINCT v.id_variante) as nb_variantes,
        COUNT(DISTINCT ph.id_photo) as nb_photos
      FROM produits p
      LEFT JOIN variantes_produit v ON p.id_produit = v.id_produit
      LEFT JOIN photos_produit ph ON p.id_produit = ph.id_produit
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (search) {
      query += ` AND (p.code_produit ILIKE $${paramIndex} OR p.designation ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (famille) {
      query += ` AND p.famille_produit = $${paramIndex}`;
      params.push(famille);
      paramIndex++;
    }

    if (actif !== undefined) {
      query += ` AND p.actif = $${paramIndex}`;
      params.push(actif === 'true');
      paramIndex++;
    }

    query += ` GROUP BY p.id_produit ORDER BY p.date_creation DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, (page - 1) * limit);

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: {
        produits: result.rows,
        total: result.rows.length
      }
    });
  } catch (error) {
    console.error('Erreur getProduits:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// GET /api/produits/:id - Détail d'un produit avec attributs et variantes
export const getProduit = async (req, res) => {
  try {
    const { id } = req.params;
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' || 
                       (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'staging');
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: {
          produit: {
            id_produit: parseInt(id),
            code_produit: 'PROD-001',
            designation: 'Fouta Ibiza',
            photo_principale: '/uploads/produits/fouta-ibiza.jpg',
            famille_produit: 'FOUTA',
            attributs: [],
            variantes: [],
            photos: []
          }
        }
      });
    }

    // Produit
    const produitResult = await pool.query('SELECT * FROM produits WHERE id_produit = $1', [id]);
    if (produitResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Produit non trouvé' }
      });
    }

    const produit = produitResult.rows[0];

    // Attributs associés
    const attributsResult = await pool.query(`
      SELECT 
        pa.*,
        a.code_attribut,
        a.libelle as libelle_attribut,
        a.type_attribut,
        a.valeurs_possibles,
        a.ordre_affichage
      FROM produit_attributs pa
      LEFT JOIN attributs_produit a ON pa.id_attribut = a.id_attribut
      WHERE pa.id_produit = $1
      ORDER BY a.ordre_affichage
    `, [id]);

    // Variantes
    const variantesResult = await pool.query(`
      SELECT * FROM variantes_produit
      WHERE id_produit = $1
      ORDER BY date_creation DESC
    `, [id]);

    // Photos
    const photosResult = await pool.query(`
      SELECT * FROM photos_produit
      WHERE id_produit = $1 OR (id_variante IS NOT NULL AND id_variante IN (SELECT id_variante FROM variantes_produit WHERE id_produit = $1))
      ORDER BY photo_principale DESC, ordre_affichage
    `, [id]);

    res.json({
      success: true,
      data: {
        produit: {
          ...produit,
          attributs: attributsResult.rows,
          variantes: variantesResult.rows,
          photos: photosResult.rows
        }
      }
    });
  } catch (error) {
    console.error('Erreur getProduit:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// POST /api/produits - Créer un produit
export const createProduit = async (req, res) => {
  try {
    const {
      code_produit, designation, description, famille_produit,
      photo_principale, attributs_ids, actif = true
    } = req.body;

    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' || 
                       (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'staging');
    const created_by = req.user?.id || 1;

    if (useMockAuth) {
      return res.status(201).json({
        success: true,
        data: {
          id_produit: Math.floor(Math.random() * 1000),
          code_produit,
          designation,
          message: 'Produit créé (mode mock)'
        }
      });
    }

    const client = await pool.connect();
    await client.query('BEGIN');

    try {
      // Créer le produit
      const produitResult = await client.query(`
        INSERT INTO produits (
          code_produit, designation, description, famille_produit,
          photo_principale, actif, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `, [code_produit, designation, description, famille_produit, photo_principale, actif, created_by]);

      const produit = produitResult.rows[0];

      // Associer les attributs
      if (attributs_ids && Array.isArray(attributs_ids)) {
        for (const attrId of attributs_ids) {
          await client.query(`
            INSERT INTO produit_attributs (id_produit, id_attribut)
            VALUES ($1, $2)
            ON CONFLICT (id_produit, id_attribut) DO NOTHING
          `, [produit.id_produit, attrId]);
        }
      }

      await client.query('COMMIT');

      res.status(201).json({
        success: true,
        data: produit
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erreur createProduit:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Erreur serveur' }
    });
  }
};

// POST /api/produits/:id/upload-photo - Upload photo produit
export const uploadPhotoProduit = async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: { message: 'Aucun fichier uploadé' }
      });
    }

    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' || 
                       (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'staging');
    const uploaded_by = req.user?.id || 1;

    if (useMockAuth) {
      return res.json({
        success: true,
        data: {
          chemin_fichier: `/uploads/produits/${req.file.filename}`,
          message: 'Photo uploadée (mode mock)'
        }
      });
    }

    const filePath = `/uploads/produits/${req.file.filename}`;
    const fileSize = req.file.size;

    // Enregistrer la photo en base
    const photoResult = await pool.query(`
      INSERT INTO photos_produit (
        id_produit, chemin_fichier, nom_fichier, type_fichier,
        taille_fichier, uploaded_by, photo_principale
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [
      id,
      filePath,
      req.file.originalname,
      req.file.mimetype,
      fileSize,
      uploaded_by,
      req.body.photo_principale === 'true'
    ]);

    // Si photo principale, mettre à jour le produit
    if (req.body.photo_principale === 'true') {
      await pool.query(`
        UPDATE produits SET photo_principale = $1 WHERE id_produit = $2
      `, [filePath, id]);
    }

    res.json({
      success: true,
      data: photoResult.rows[0]
    });
  } catch (error) {
    console.error('Erreur uploadPhotoProduit:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Erreur serveur' }
    });
  }
};

// GET /api/produits/attributs - Liste tous les attributs disponibles
export const getAttributs = async (req, res) => {
  try {
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' || 
                       (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'staging');
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: [
          {
            id_attribut: 1,
            code_attribut: 'ATT_DIMENSION',
            libelle: 'Dimension',
            type_attribut: 'DIMENSION',
            valeurs_possibles: [
              {code: '1020', libelle: '100x200 cm'},
              {code: '1525', libelle: '150x250 cm'}
            ]
          },
          {
            id_attribut: 2,
            code_attribut: 'ATT_COULEUR',
            libelle: 'Couleur',
            type_attribut: 'COULEUR',
            valeurs_possibles: [
              {code: 'C01', libelle: 'Blanc', couleur_hex: '#FFFFFF'},
              {code: 'C20', libelle: 'Rouge', couleur_hex: '#FF0000'}
            ]
          }
        ]
      });
    }

    const result = await pool.query(`
      SELECT * FROM attributs_produit
      WHERE actif = TRUE
      ORDER BY ordre_affichage, libelle
    `);

    // Parser JSONB valeurs_possibles
    const attributs = result.rows.map(attr => ({
      ...attr,
      valeurs_possibles: typeof attr.valeurs_possibles === 'string' 
        ? JSON.parse(attr.valeurs_possibles) 
        : attr.valeurs_possibles
    }));

    res.json({
      success: true,
      data: attributs
    });
  } catch (error) {
    console.error('Erreur getAttributs:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// POST /api/produits/attributs - Créer un attribut
export const createAttribut = async (req, res) => {
  try {
    const {
      code_attribut, libelle, type_attribut, valeurs_possibles,
      obligatoire, ordre_affichage, afficher_catalogue, actif = true
    } = req.body;

    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' || 
                       (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'staging');
    
    if (useMockAuth) {
      return res.status(201).json({
        success: true,
        data: {
          id_attribut: Math.floor(Math.random() * 1000),
          code_attribut,
          libelle,
          message: 'Attribut créé (mode mock)'
        }
      });
    }

    const result = await pool.query(`
      INSERT INTO attributs_produit (
        code_attribut, libelle, type_attribut, valeurs_possibles,
        obligatoire, ordre_affichage, afficher_catalogue, actif
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      code_attribut, libelle, type_attribut, JSON.stringify(valeurs_possibles || []),
      obligatoire || false, ordre_affichage || 0, afficher_catalogue !== false, actif
    ]);

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur createAttribut:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Erreur serveur' }
    });
  }
};

// POST /api/produits/:id/variantes/generer - Générer variantes depuis attributs sélectionnés
export const genererVariantes = async (req, res) => {
  try {
    const { id } = req.params;
    const { attributs_selectionnes } = req.body; // {id_attribut: [valeurs], ...}
    
    // Exemple: {1: ['1020', '1525'], 2: ['C01', 'C20']} -> 2x2 = 4 variantes

    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' || 
                       (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'staging');
    
    if (useMockAuth) {
      const variantes = [];
      // Simuler génération de variantes
      return res.json({
        success: true,
        data: {
          variantes,
          total: variantes.length,
          message: 'Variantes générées (mode mock)'
        }
      });
    }

    const client = await pool.connect();
    await client.query('BEGIN');

    try {
      // Récupérer le produit
      const produitResult = await client.query('SELECT * FROM produits WHERE id_produit = $1', [id]);
      if (produitResult.rows.length === 0) {
        throw new Error('Produit non trouvé');
      }
      const produit = produitResult.rows[0];

      // Générer toutes les combinaisons d'attributs
      const combinaisons = genererCombinaisons(attributs_selectionnes);
      
      const variantesCrees = [];

      for (const combinaison of combinaisons) {
        // Créer code variante basé sur les valeurs
        const codeVariante = produit.code_produit + '-' + Object.values(combinaison).join('-');
        
        // Vérifier si variante existe déjà
        const existResult = await client.query(
          'SELECT id_variante FROM variantes_produit WHERE code_variante = $1',
          [codeVariante]
        );

        if (existResult.rows.length === 0) {
          // Créer la variante
          const varianteResult = await client.query(`
            INSERT INTO variantes_produit (
              id_produit, code_variante, attributs_values, actif
            ) VALUES ($1, $2, $3, $4)
            RETURNING *
          `, [id, codeVariante, JSON.stringify(combinaison), true]);

          variantesCrees.push(varianteResult.rows[0]);
        }
      }

      await client.query('COMMIT');

      res.json({
        success: true,
        data: {
          variantes: variantesCrees,
          total: variantesCrees.length
        }
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erreur genererVariantes:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Erreur serveur' }
    });
  }
};

// POST /api/produits/:id/variantes/:varianteId/generer-article - Générer article depuis variante
export const genererArticleDepuisVariante = async (req, res) => {
  try {
    const { id, varianteId } = req.params;
    
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' || 
                       (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'staging');
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: {
          id_article: Math.floor(Math.random() * 1000),
          message: 'Article généré depuis variante (mode mock)'
        }
      });
    }

    const client = await pool.connect();
    await client.query('BEGIN');

    try {
      // Récupérer variante et produit
      const varianteResult = await client.query(`
        SELECT v.*, p.code_produit, p.designation
        FROM variantes_produit v
        LEFT JOIN produits p ON v.id_produit = p.id_produit
        WHERE v.id_variante = $1 AND v.id_produit = $2
      `, [varianteId, id]);

      if (varianteResult.rows.length === 0) {
        throw new Error('Variante non trouvée');
      }

      const variante = varianteResult.rows[0];
      const attributsValues = typeof variante.attributs_values === 'string'
        ? JSON.parse(variante.attributs_values)
        : variante.attributs_values;

      // Récupérer les attributs pour mapper vers articles_catalogue
      const attributsKeys = Object.keys(attributsValues);
      
      // Récupérer les IDs des attributs sélectionnés
      const attributsResult = await client.query(`
        SELECT 
          a.id_attribut,
          a.code_attribut,
          a.type_attribut,
          a.valeurs_possibles
        FROM attributs_produit a
        WHERE a.id_attribut = ANY($1::int[])
      `, [attributsKeys]);

      // Mapper attributs vers champs articles_catalogue
      let id_modele = null;
      let id_dimension = null;
      let id_finition = null;
      let id_tissage = null;
      let code_nb_couleurs = 'U';
      const selecteursCodes = {};

      for (const attr of attributsResult.rows) {
        const valeurs = typeof attr.valeurs_possibles === 'string' 
          ? JSON.parse(attr.valeurs_possibles) 
          : attr.valeurs_possibles;
        
        const valeurCode = attributsValues[attr.id_attribut.toString()];
        const valeur = valeurs.find((v) => v.code === valeurCode);

        switch (attr.type_attribut) {
          case 'MODELE':
            // Trouver id_modele depuis parametres_modeles
            const modeleRes = await client.query(
              'SELECT id FROM parametres_modeles WHERE code = $1 OR code_modele = $1',
              [valeurCode]
            );
            if (modeleRes.rows.length > 0) id_modele = modeleRes.rows[0].id;
            break;
          case 'DIMENSION':
            // Trouver id_dimension depuis parametres_dimensions
            const dimRes = await client.query(
              'SELECT id FROM parametres_dimensions WHERE code = $1',
              [valeurCode]
            );
            if (dimRes.rows.length > 0) id_dimension = dimRes.rows[0].id;
            break;
          case 'FINITION':
            // Trouver id_finition depuis parametres_finitions
            const finRes = await client.query(
              'SELECT id FROM parametres_finitions WHERE code = $1',
              [valeurCode]
            );
            if (finRes.rows.length > 0) id_finition = finRes.rows[0].id;
            break;
          case 'TISSAGE':
            // Trouver id_tissage depuis parametres_tissages
            const tissRes = await client.query(
              'SELECT id FROM parametres_tissages WHERE code = $1',
              [valeurCode]
            );
            if (tissRes.rows.length > 0) id_tissage = tissRes.rows[0].id;
            break;
          case 'COULEUR':
            // Compter couleurs pour déterminer code_nb_couleurs
            const couleursCount = Object.entries(attributsValues).filter(([attrIdStr, val]) => {
              const attrId = parseInt(attrIdStr);
              const attrFound = attributsResult.rows.find(a => a.id_attribut === attrId);
              return attrFound?.type_attribut === 'COULEUR';
            }).length;
            
            if (couleursCount === 1) code_nb_couleurs = 'U';
            else if (couleursCount === 2) code_nb_couleurs = 'B';
            else if (couleursCount === 3) code_nb_couleurs = 'T';
            else if (couleursCount === 4) code_nb_couleurs = 'Q';
            else if (couleursCount === 5) code_nb_couleurs = 'C';
            else if (couleursCount >= 6) code_nb_couleurs = 'S';
            break;
        }
      }

      // Générer références commerciale et fabrication
      const refCommerciale = variante.code_variante; // Utiliser code_variante comme ref commerciale
      const refFabrication = variante.code_variante; // Peut être personnalisé

      // Créer l'article dans articles_catalogue
      const articleResult = await client.query(`
        INSERT INTO articles_catalogue (
          ref_commerciale, ref_fabrication, designation,
          id_modele, id_dimension, id_finition, id_tissage,
          code_nb_couleurs,
          largeur_tissage, longueur_tissage, duite_cm, nombre_duite_total,
          consommation_s01, consommation_s02, consommation_s03,
          consommation_s04, consommation_s05, consommation_s06,
          prix_revient, temps_production, actif
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
        RETURNING *
      `, [
        refCommerciale, refFabrication, produit.designation,
        id_modele, id_dimension, id_finition, id_tissage,
        code_nb_couleurs,
        variante.largeur_tissage || null,
        variante.longueur_tissage || null,
        variante.duite_cm || null,
        variante.nombre_duite_total || null,
        variante.consommation_s01 || null,
        variante.consommation_s02 || null,
        variante.consommation_s03 || null,
        variante.consommation_s04 || null,
        variante.consommation_s05 || null,
        variante.consommation_s06 || null,
        variante.prix_revient || null,
        variante.temps_production || null,
        true
      ]);

      const article = articleResult.rows[0];

      // Mettre à jour variante avec id_article
      await client.query(`
        UPDATE variantes_produit
        SET id_article = $1, article_genere = TRUE
        WHERE id_variante = $2
      `, [article.id_article, varianteId]);

      await client.query('COMMIT');

      res.json({
        success: true,
        data: {
          article: article,
          message: 'Article généré avec succès',
          variante_id: varianteId
        }
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erreur genererArticleDepuisVariante:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Erreur serveur' }
    });
  }
};

// POST /api/produits/:id/variantes/generer-tous-articles - Générer tous les articles depuis toutes les variantes
export const genererTousArticles = async (req, res) => {
  try {
    const { id } = req.params;
    
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' || 
                       (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'staging');
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: {
          articles_generes: 5,
          message: 'Tous les articles générés (mode mock)'
        }
      });
    }

    // Récupérer toutes les variantes non générées
    const variantesResult = await pool.query(`
      SELECT * FROM variantes_produit
      WHERE id_produit = $1 AND (article_genere = FALSE OR article_genere IS NULL)
    `, [id]);

    const articlesGeneres = [];
    const client = await pool.connect();
    await client.query('BEGIN');
    
    try {
      // Récupérer produit
      const produitResult = await client.query('SELECT * FROM produits WHERE id_produit = $1', [id]);
      if (produitResult.rows.length === 0) {
        throw new Error('Produit non trouvé');
      }
      const produit = produitResult.rows[0];

      for (const variante of variantesResult.rows) {
        try {
          const attributsValues = typeof variante.attributs_values === 'string'
            ? JSON.parse(variante.attributs_values)
            : variante.attributs_values;

          // Récupérer les attributs
          const attributsKeys = Object.keys(attributsValues).map(k => parseInt(k));
          const attributsResult = await client.query(`
            SELECT id_attribut, code_attribut, type_attribut, valeurs_possibles
            FROM attributs_produit
            WHERE id_attribut = ANY($1::int[])
          `, [attributsKeys]);

          // Mapper attributs
          let id_modele = null;
          let id_dimension = null;
          let id_finition = null;
          let id_tissage = null;
          let code_nb_couleurs = 'U';

          for (const attr of attributsResult.rows) {
            const valeurCode = attributsValues[attr.id_attribut.toString()];
            
            switch (attr.type_attribut) {
              case 'MODELE':
                const modeleRes = await client.query('SELECT id FROM parametres_modeles WHERE code = $1', [valeurCode]);
                if (modeleRes.rows.length > 0) id_modele = modeleRes.rows[0].id;
                break;
              case 'DIMENSION':
                const dimRes = await client.query('SELECT id FROM parametres_dimensions WHERE code = $1', [valeurCode]);
                if (dimRes.rows.length > 0) id_dimension = dimRes.rows[0].id;
                break;
              case 'FINITION':
                const finRes = await client.query('SELECT id FROM parametres_finitions WHERE code = $1', [valeurCode]);
                if (finRes.rows.length > 0) id_finition = finRes.rows[0].id;
                break;
              case 'TISSAGE':
                const tissRes = await client.query('SELECT id FROM parametres_tissages WHERE code = $1', [valeurCode]);
                if (tissRes.rows.length > 0) id_tissage = tissRes.rows[0].id;
                break;
            }
          }

          // Créer article
          const articleResult = await client.query(`
            INSERT INTO articles_catalogue (
              ref_commerciale, ref_fabrication, designation,
              id_modele, id_dimension, id_finition, id_tissage,
              code_nb_couleurs,
              largeur_tissage, longueur_tissage, duite_cm, nombre_duite_total,
              consommation_s01, consommation_s02, consommation_s03,
              consommation_s04, consommation_s05, consommation_s06,
              prix_revient, temps_production, actif
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
            RETURNING *
          `, [
            variante.code_variante, variante.code_variante, produit.designation,
            id_modele, id_dimension, id_finition, id_tissage,
            code_nb_couleurs,
            variante.largeur_tissage || null,
            variante.longueur_tissage || null,
            variante.duite_cm || null,
            variante.nombre_duite_total || null,
            variante.consommation_s01 || null,
            variante.consommation_s02 || null,
            variante.consommation_s03 || null,
            variante.consommation_s04 || null,
            variante.consommation_s05 || null,
            variante.consommation_s06 || null,
            variante.prix_revient || null,
            variante.temps_production || null,
            true
          ]);

          const article = articleResult.rows[0];

          // Mettre à jour variante
          await client.query(`
            UPDATE variantes_produit
            SET id_article = $1, article_genere = TRUE
            WHERE id_variante = $2
          `, [article.id_article, variante.id_variante]);

          articlesGeneres.push({
            variante_id: variante.id_variante,
            article_id: article.id_article
          });
        } catch (error) {
          console.error(`Erreur génération article pour variante ${variante.id_variante}:`, error);
        }
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

    res.json({
      success: true,
      data: {
        articles_generes: articlesGeneres.length,
        variantes: articlesGeneres
      }
    });
  } catch (error) {
    console.error('Erreur genererTousArticles:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Erreur serveur' }
    });
  }
};

// Fonction helper: Générer toutes les combinaisons d'attributs
function genererCombinaisons(attributs) {
  const keys = Object.keys(attributs);
  const values = keys.map(key => attributs[key]);
  
  // Générer toutes les combinaisons cartésiennes
  const combinaisons = [];
  
  function generateRecursive(current, index) {
    if (index === keys.length) {
      // Créer objet combinaison {id_attribut: valeur, ...}
      const combinaison = {};
      keys.forEach((key, i) => {
        combinaison[key] = current[i];
      });
      combinaisons.push(combinaison);
      return;
    }
    
    for (const value of values[index]) {
      generateRecursive([...current, value], index + 1);
    }
  }
  
  generateRecursive([], 0);
  return combinaisons;
}

// PUT /api/produits/:id - Mettre à jour un produit
export const updateProduit = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      code_produit, designation, description, famille_produit,
      photo_principale, actif
    } = req.body;

    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' || 
                       (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'staging');
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: { id_produit: parseInt(id), code_produit, designation, message: 'Produit mis à jour (mode mock)' }
      });
    }

    const result = await pool.query(`
      UPDATE produits
      SET code_produit = $1, designation = $2, description = $3, famille_produit = $4,
          photo_principale = $5, actif = $6, date_modification = CURRENT_TIMESTAMP
      WHERE id_produit = $7
      RETURNING *
    `, [code_produit, designation, description, famille_produit, photo_principale, actif, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Produit non trouvé' }
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur updateProduit:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Erreur serveur' }
    });
  }
};

// DELETE /api/produits/:id - Supprimer un produit (soft delete)
export const deleteProduit = async (req, res) => {
  try {
    const { id } = req.params;
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' || 
                       (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'staging');
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: { message: `Produit ${id} désactivé (mode mock)` }
      });
    }

    const result = await pool.query(`
      UPDATE produits
      SET actif = FALSE, date_modification = CURRENT_TIMESTAMP
      WHERE id_produit = $1
      RETURNING *
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Produit non trouvé' }
      });
    }

    res.json({
      success: true,
      data: { message: 'Produit désactivé avec succès' }
    });
  } catch (error) {
    console.error('Erreur deleteProduit:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};
