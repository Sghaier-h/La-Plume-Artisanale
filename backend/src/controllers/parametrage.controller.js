import { pool } from '../utils/db.js';

// GET /api/parametrage/societe - Informations de la société
export const getSociete = async (req, res) => {
  try {
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: {
          nom_entreprise: 'La Plume Artisanale',
          raison_sociale: 'La Plume Artisanale SARL',
          adresse: 'Adresse à définir',
          code_postal: '',
          ville: 'Tunis',
          pays: 'Tunisie',
          telephone: '',
          email: 'contact@laplume-artisanale.tn',
          site_web: '',
          siret: '',
          tva: '',
          logo: null,
          devise: 'TND',
          date_creation: new Date().toISOString()
        }
      });
    }

    const result = await pool.query(`
      SELECT cle, valeur 
      FROM parametres_systeme 
      WHERE cle IN (
        'nom_entreprise', 'raison_sociale', 'adresse', 'code_postal', 
        'ville', 'pays', 'telephone', 'email', 'site_web', 
        'siret', 'tva', 'logo', 'devise'
      )
    `);

    const params = {};
    result.rows.forEach(row => {
      params[row.cle] = row.valeur;
    });

    res.json({
      success: true,
      data: {
        nom_entreprise: params.nom_entreprise || 'La Plume Artisanale',
        raison_sociale: params.raison_sociale || '',
        adresse: params.adresse || '',
        code_postal: params.code_postal || '',
        ville: params.ville || 'Tunis',
        pays: params.pays || 'Tunisie',
        telephone: params.telephone || '',
        email: params.email || '',
        site_web: params.site_web || '',
        siret: params.siret || '',
        tva: params.tva || '',
        logo: params.logo || null,
        devise: params.devise || 'TND',
        date_creation: params.date_creation || new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Erreur getSociete:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// PUT /api/parametrage/societe - Mettre à jour les informations de la société
export const updateSociete = async (req, res) => {
  try {
    const {
      nom_entreprise, raison_sociale, adresse, code_postal,
      ville, pays, telephone, email, site_web,
      siret, tva, logo, devise
    } = req.body;

    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: { message: 'Paramètres mis à jour (mode mock)' }
      });
    }

    const updates = [];
    const values = [];
    let paramIndex = 1;

    const fields = {
      nom_entreprise, raison_sociale, adresse, code_postal,
      ville, pays, telephone, email, site_web,
      siret, tva, logo, devise
    };

    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) {
        updates.push(`INSERT INTO parametres_systeme (cle, valeur, type_donnee, date_modification)
          VALUES ($${paramIndex}, $${paramIndex + 1}, 'string', CURRENT_TIMESTAMP)
          ON CONFLICT (cle) DO UPDATE 
          SET valeur = EXCLUDED.valeur, date_modification = CURRENT_TIMESTAMP`);
        values.push(key, value);
        paramIndex += 2;
      }
    }

    if (updates.length > 0) {
      await pool.query(updates.join('; '), values);
    }

    res.json({
      success: true,
      data: { message: 'Informations société mises à jour' }
    });
  } catch (error) {
    console.error('Erreur updateSociete:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// GET /api/parametrage/systeme - Paramètres système
export const getParametresSysteme = async (req, res) => {
  try {
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: {
          version_systeme: '1.0.0',
          alerte_metrage_ensouple: 500,
          delai_livraison_standard: 7,
          taux_rendement_cible: 90,
          delai_alerte_stock: 3,
          delai_alerte_retard_st: 12
        }
      });
    }

    const result = await pool.query(`
      SELECT cle, valeur, description, type_donnee
      FROM parametres_systeme
      ORDER BY cle
    `);

    const params = {};
    result.rows.forEach(row => {
      params[row.cle] = {
        valeur: row.valeur,
        description: row.description,
        type: row.type_donnee
      };
    });

    res.json({
      success: true,
      data: params
    });
  } catch (error) {
    console.error('Erreur getParametresSysteme:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// PUT /api/parametrage/systeme/:cle - Mettre à jour un paramètre système
export const updateParametreSysteme = async (req, res) => {
  try {
    const { cle } = req.params;
    const { valeur, description, type_donnee } = req.body;

    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: { message: 'Paramètre mis à jour (mode mock)' }
      });
    }

    await pool.query(`
      INSERT INTO parametres_systeme (cle, valeur, description, type_donnee, date_modification)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
      ON CONFLICT (cle) DO UPDATE 
      SET valeur = EXCLUDED.valeur, 
          description = COALESCE(EXCLUDED.description, parametres_systeme.description),
          type_donnee = COALESCE(EXCLUDED.type_donnee, parametres_systeme.type_donnee),
          date_modification = CURRENT_TIMESTAMP
    `, [cle, valeur, description || null, type_donnee || 'string']);

    res.json({
      success: true,
      data: { message: 'Paramètre mis à jour' }
    });
  } catch (error) {
    console.error('Erreur updateParametreSysteme:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// GET /api/parametrage/module/:module - Paramètres d'un module spécifique
export const getParametresModule = async (req, res) => {
  try {
    const { module } = req.params;
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      // Retourner des valeurs par défaut selon le module
      const defaults: { [key: string]: any } = {
        vente: {
          devis: { tva_par_defaut: 20, validite_devis_jours: 30, generer_numero_auto: true, prefixe_numero: 'DEV' },
          factures: { delai_paiement_jours: 30, taux_penalite_retard: 0.75, generer_numero_auto: true, prefixe_numero: 'FAC' },
          bons_livraison: { generer_numero_auto: true, prefixe_numero: 'BL' }
        },
        production: {
          of: { taux_rendement_cible: 90, delai_alerte_retard_heures: 24, generer_numero_auto: true, prefixe_numero: 'OF' },
          machines: { alerte_maintenance_jours: 7, delai_maintenance_preventive_jours: 90 },
          suivi: { calcul_rendement_auto: true, calcul_temps_auto: true }
        },
        stock: {
          articles: { stock_minimum_par_defaut: 10, stock_alerte_par_defaut: 5, activer_alertes_stock: true },
          inventaire: { frequence_inventaire_jours: 30, type_inventaire_par_defaut: 'PARTIEL' },
          alertes: { delai_alerte_stock_jours: 3, notification_email: true }
        },
        qualite: {
          controles: { taux_acceptation_cible: 95, activer_controles_auto: true, frequence_controles: 'CHAQUE_LOT' },
          non_conformites: { delai_traitement_jours: 7, notification_urgence: true }
        },
        planification: {
          gantt: { unite_planification: 'JOUR', afficher_weekend: false, couleur_retard: '#FF0000' },
          ressources: { capacite_max_machine: 8, activer_surcharge: false }
        }
      };
      
      return res.json({
        success: true,
        data: defaults[module] || {}
      });
    }

    const result = await pool.query(`
      SELECT cle, valeur, description, type_donnee
      FROM parametres_systeme
      WHERE cle LIKE $1
      ORDER BY cle
    `, [`${module}_%`]);

    const params: any = {};
    result.rows.forEach(row => {
      const parts = row.cle.split('_');
      if (parts.length >= 3) {
        const categorie = parts[1];
        const paramKey = parts.slice(2).join('_');
        if (!params[categorie]) params[categorie] = {};
        params[categorie][paramKey] = row.type_donnee === 'number' ? parseFloat(row.valeur) : 
                                      row.type_donnee === 'boolean' ? row.valeur === 'true' : row.valeur;
      }
    });

    res.json({
      success: true,
      data: params
    });
  } catch (error) {
    console.error('Erreur getParametresModule:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// PUT /api/parametrage/module/:module - Mettre à jour les paramètres d'un module
export const updateParametresModule = async (req, res) => {
  try {
    const { module } = req.params;
    const parametres = req.body;

    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: { message: `Paramètres ${module} mis à jour (mode mock)` }
      });
    }

    // Convertir les paramètres en format plat pour la base de données
    const updates = [];
    const values: any[] = [];
    let paramIndex = 1;

    for (const [categorie, params] of Object.entries(parametres)) {
      if (params && typeof params === 'object') {
        for (const [cle, valeur] of Object.entries(params)) {
          const cleComplet = `${module}_${categorie}_${cle}`;
          const typeDonnee = typeof valeur === 'number' ? 'number' : typeof valeur === 'boolean' ? 'boolean' : 'string';
          const valeurStr = typeof valeur === 'boolean' ? String(valeur) : String(valeur);
          
          updates.push(`INSERT INTO parametres_systeme (cle, valeur, type_donnee, date_modification)
            VALUES ($${paramIndex}, $${paramIndex + 1}, $${paramIndex + 2}, CURRENT_TIMESTAMP)
            ON CONFLICT (cle) DO UPDATE 
            SET valeur = EXCLUDED.valeur, 
                type_donnee = EXCLUDED.type_donnee,
                date_modification = CURRENT_TIMESTAMP`);
          values.push(cleComplet, valeurStr, typeDonnee);
          paramIndex += 3;
        }
      }
    }

    if (updates.length > 0) {
      await pool.query(updates.join('; '), values);
    }

    res.json({
      success: true,
      data: { message: `Paramètres ${module} mis à jour` }
    });
  } catch (error) {
    console.error('Erreur updateParametresModule:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};
