import { pool } from '../utils/db.js';

// GET /api/qualite-avance/controles - Liste contrôles qualité
export const getControles = async (req, res) => {
  try {
    const { id_of, id_article, type_controle, resultat, date_debut, date_fin } = req.query;
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: {
          controles: [
            {
              id_controle: 1,
              numero_controle: 'CTL-2024-000001',
              id_of: 1,
              type_controle: 'PRODUCTION',
              resultat_global: 'CONFORME',
              taux_conformite: 95.5,
              date_controle: '2024-01-15'
            }
          ],
          total: 1
        }
      });
    }

    let query = `
      SELECT c.*, of.numero_of, a.designation as article_designation,
             u.nom_utilisateur as controleur_nom
      FROM controles_qualite c
      LEFT JOIN ordres_fabrication of ON c.id_of = of.id_of
      LEFT JOIN articles_catalogue a ON c.id_article = a.id_article
      LEFT JOIN utilisateurs u ON c.id_controleur = u.id_utilisateur
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (id_of) {
      query += ` AND c.id_of = $${paramIndex}`;
      params.push(id_of);
      paramIndex++;
    }
    if (id_article) {
      query += ` AND c.id_article = $${paramIndex}`;
      params.push(id_article);
      paramIndex++;
    }
    if (type_controle) {
      query += ` AND c.type_controle = $${paramIndex}`;
      params.push(type_controle);
      paramIndex++;
    }
    if (resultat) {
      query += ` AND c.resultat_global = $${paramIndex}`;
      params.push(resultat);
      paramIndex++;
    }
    if (date_debut) {
      query += ` AND c.date_controle >= $${paramIndex}`;
      params.push(date_debut);
      paramIndex++;
    }
    if (date_fin) {
      query += ` AND c.date_controle <= $${paramIndex}`;
      params.push(date_fin);
      paramIndex++;
    }

    query += ` ORDER BY c.date_controle DESC LIMIT 100`;

    const result = await pool.query(query, params);
    res.json({ success: true, data: { controles: result.rows, total: result.rows.length } });
  } catch (error) {
    console.error('Erreur getControles:', error);
    res.status(500).json({ success: false, error: { message: 'Erreur serveur' } });
  }
};

// POST /api/qualite-avance/controles - Créer contrôle
export const createControle = async (req, res) => {
  try {
    const {
      id_of, id_article, type_controle, id_controleur, lignes_controle
    } = req.body;

    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.status(201).json({
        success: true,
        data: {
          id_controle: Math.floor(Math.random() * 1000),
          numero_controle: 'CTL-2024-000001',
          message: 'Contrôle créé (mode mock)'
        }
      });
    }

    const client = await pool.connect();
    await client.query('BEGIN');

    try {
      // Générer numéro
      const numeroResult = await client.query('SELECT generer_numero_controle() as numero');
      const numero = numeroResult.rows[0].numero;

      // Calculer statistiques
      const nbTotal = lignes_controle?.length || 0;
      const nbConformes = lignes_controle?.filter((l) => l.conforme).length || 0;
      const nbNonConformes = nbTotal - nbConformes;
      const tauxConformite = nbTotal > 0 ? (nbConformes / nbTotal) * 100 : 0;
      const resultatGlobal = tauxConformite >= 95 ? 'CONFORME' : tauxConformite >= 80 ? 'CONFORME_AVEC_RESERVE' : 'NON_CONFORME';

      // Créer contrôle
      const controleResult = await client.query(`
        INSERT INTO controles_qualite (
          numero_controle, id_of, id_article, type_controle, id_controleur,
          resultat_global, nb_criteres_total, nb_criteres_conformes,
          nb_criteres_non_conformes, taux_conformite, date_controle
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_DATE)
        RETURNING *
      `, [numero, id_of, id_article, type_controle, id_controleur,
          resultatGlobal, nbTotal, nbConformes, nbNonConformes, tauxConformite]);

      const idControle = controleResult.rows[0].id_controle;

      // Créer lignes contrôle
      if (lignes_controle && lignes_controle.length > 0) {
        for (const ligne of lignes_controle) {
          await client.query(`
            INSERT INTO lignes_controle_qualite (
              id_controle, id_critere, valeur_mesuree, conforme, note, commentaire
            ) VALUES ($1, $2, $3, $4, $5, $6)
          `, [idControle, ligne.id_critere, ligne.valeur_mesuree,
              ligne.conforme, ligne.note, ligne.commentaire]);
        }
      }

      await client.query('COMMIT');
      res.status(201).json({ success: true, data: controleResult.rows[0] });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erreur createControle:', error);
    res.status(500).json({ success: false, error: { message: error.message || 'Erreur serveur' } });
  }
};

// GET /api/qualite-avance/non-conformites - Liste non-conformités
export const getNonConformites = async (req, res) => {
  try {
    const { statut, gravite, id_of } = req.query;
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: [
          {
            id_nc: 1,
            numero_nc: 'NC-2024-000001',
            description: 'Défaut dimensionnel',
            gravite: 'MOYENNE',
            statut: 'OUVERTE'
          }
        ]
      });
    }

    let query = `
      SELECT nc.*, of.numero_of
      FROM non_conformites nc
      LEFT JOIN ordres_fabrication of ON nc.id_of = of.id_of
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (statut) {
      query += ` AND nc.statut = $${paramIndex}`;
      params.push(statut);
      paramIndex++;
    }
    if (gravite) {
      query += ` AND nc.gravite = $${paramIndex}`;
      params.push(gravite);
      paramIndex++;
    }
    if (id_of) {
      query += ` AND nc.id_of = $${paramIndex}`;
      params.push(id_of);
      paramIndex++;
    }

    query += ` ORDER BY nc.date_ouverture DESC LIMIT 100`;

    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Erreur getNonConformites:', error);
    res.status(500).json({ success: false, error: { message: 'Erreur serveur' } });
  }
};

// GET /api/qualite-avance/statistiques - Statistiques qualité
export const getStatistiques = async (req, res) => {
  try {
    const { date_debut, date_fin, id_article, id_machine } = req.query;
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: {
          taux_conformite: 95.5,
          nb_controles: 150,
          nb_conformes: 143,
          nb_non_conformes: 7,
          nb_nc_total: 5,
          nb_nc_mineures: 3,
          nb_nc_moyennes: 2,
          nb_nc_majeures: 0
        }
      });
    }

    const dateDebut = date_debut || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const dateFin = date_fin || new Date().toISOString().split('T')[0];

    let query = `
      SELECT 
        COUNT(*) as nb_controles_total,
        COUNT(*) FILTER (WHERE resultat_global = 'CONFORME') as nb_conformes,
        COUNT(*) FILTER (WHERE resultat_global = 'NON_CONFORME') as nb_non_conformes,
        AVG(taux_conformite) as taux_conformite_moyen
      FROM controles_qualite
      WHERE date_controle BETWEEN $1 AND $2
    `;
    const params = [dateDebut, dateFin];
    let paramIndex = 3;

    if (id_article) {
      query += ` AND id_article = $${paramIndex}`;
      params.push(id_article);
      paramIndex++;
    }

    const statsResult = await pool.query(query, params);

    // Statistiques NC
    let queryNC = `
      SELECT 
        COUNT(*) as nb_nc_total,
        COUNT(*) FILTER (WHERE gravite = 'MINEURE') as nb_nc_mineures,
        COUNT(*) FILTER (WHERE gravite = 'MOYENNE') as nb_nc_moyennes,
        COUNT(*) FILTER (WHERE gravite = 'MAJEURE') as nb_nc_majeures,
        COUNT(*) FILTER (WHERE gravite = 'CRITIQUE') as nb_nc_critiques
      FROM non_conformites
      WHERE date_ouverture BETWEEN $1 AND $2
    `;
    const paramsNC = [dateDebut, dateFin];
    let paramIndexNC = 3;

    if (id_article) {
      queryNC += ` AND id_of IN (SELECT id_of FROM ordres_fabrication WHERE id_article = $${paramIndexNC})`;
      paramsNC.push(id_article);
      paramIndexNC++;
    }

    const ncResult = await pool.query(queryNC, paramsNC);

    res.json({
      success: true,
      data: {
        ...statsResult.rows[0],
        ...ncResult.rows[0],
        taux_conformite: parseFloat(statsResult.rows[0].taux_conformite_moyen || 0)
      }
    });
  } catch (error) {
    console.error('Erreur getStatistiques:', error);
    res.status(500).json({ success: false, error: { message: 'Erreur serveur' } });
  }
};

// GET /api/qualite-avance/diagrammes - Données pour diagrammes
export const getDiagrammes = async (req, res) => {
  try {
    const { type_diagramme, date_debut, date_fin } = req.query;
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: {
          pareto: [
            { cause: 'Défaut dimensionnel', frequence: 45, pourcentage: 35 },
            { cause: 'Couleur incorrecte', frequence: 30, pourcentage: 23 },
            { cause: 'Défaut tissage', frequence: 25, pourcentage: 19 }
          ],
          cause_effet: {
            matiere: ['Qualité MP', 'Stockage'],
            machine: ['Réglage', 'Usure'],
            methode: ['Procédure', 'Formation']
          }
        }
      });
    }

    // Diagramme Pareto (causes de non-conformités)
    if (type_diagramme === 'PARETO' || !type_diagramme) {
      const paretoResult = await pool.query(`
        SELECT 
          type_cause as cause,
          COUNT(*) as frequence
        FROM non_conformites
        WHERE date_ouverture >= $1 AND date_ouverture <= $2
        AND type_cause IS NOT NULL
        GROUP BY type_cause
        ORDER BY frequence DESC
        LIMIT 10
      `, [date_debut || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          date_fin || new Date().toISOString().split('T')[0]]);

      const total = paretoResult.rows.reduce((sum, row) => sum + parseInt(row.frequence), 0);
      const pareto = paretoResult.rows.map((row, index) => ({
        cause: row.cause,
        frequence: parseInt(row.frequence),
        pourcentage: total > 0 ? Math.round((parseInt(row.frequence) / total) * 100) : 0,
        cumul: paretoResult.rows.slice(0, index + 1).reduce((sum, r) => sum + parseInt(r.frequence), 0)
      }));

      res.json({ success: true, data: { pareto } });
      return;
    }

    res.json({ success: true, data: {} });
  } catch (error) {
    console.error('Erreur getDiagrammes:', error);
    res.status(500).json({ success: false, error: { message: 'Erreur serveur' } });
  }
};
