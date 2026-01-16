import { pool } from '../utils/db.js';

// GET /api/dashboard/kpis - KPIs principaux
export const getKPIs = async (req, res) => {
  try {
    // OF en cours
    const ofEnCours = await pool.query(
      `SELECT COUNT(*) as count 
      FROM ordres_fabrication 
      WHERE statut IN ('planifie', 'attribue', 'en_cours')`
    );

    // Taux d'avancement moyen
    const tauxAvancement = await pool.query(
      `SELECT 
        AVG(CASE 
          WHEN quantite_a_produire > 0 
          THEN (quantite_produite / quantite_a_produire) * 100 
          ELSE 0 
        END) as taux
      FROM ordres_fabrication 
      WHERE statut IN ('en_cours', 'attribue')`
    );

    // Délai moyen de production
    const delaiMoyen = await pool.query(
      `SELECT 
        AVG(EXTRACT(EPOCH FROM (date_fin_reelle - date_debut_reelle)) / 86400) as delai_jours
      FROM ordres_fabrication 
      WHERE statut = 'termine' 
        AND date_debut_reelle IS NOT NULL 
        AND date_fin_reelle IS NOT NULL
        AND date_creation_of >= CURRENT_DATE - INTERVAL '30 days'`
    );

    // Taux de rebut
    const tauxRebut = await pool.query(
      `SELECT 
        SUM(quantite_rebut) as total_rebut,
        SUM(quantite_produite) as total_produit,
        CASE 
          WHEN SUM(quantite_produite) > 0 
          THEN (SUM(quantite_rebut) / SUM(quantite_produite)) * 100 
          ELSE 0 
        END as taux
      FROM suivi_fabrication 
      WHERE date_debut >= CURRENT_DATE - INTERVAL '30 days'`
    );

    // Commandes en attente
    const commandesAttente = await pool.query(
      `SELECT COUNT(*) as count 
      FROM commandes 
      WHERE statut = 'en_attente'`
    );

    // Machines en panne
    const machinesPanne = await pool.query(
      `SELECT COUNT(*) as count 
      FROM machines 
      WHERE statut = 'en_panne' AND actif = true`
    );

    // Stock MP critique
    const stockCritique = await pool.query(
      `SELECT COUNT(*) as count 
      FROM stock_mp sm
      JOIN matieres_premieres mp ON sm.id_mp = mp.id_mp
      WHERE sm.quantite_disponible < mp.stock_minimum`
    );

    // Sous-traitants en retard
    const stRetard = await pool.query(
      `SELECT COUNT(*) as count 
      FROM mouvements_sous_traitance 
      WHERE statut = 'en_cours' 
        AND date_retour_prevue < CURRENT_DATE`
    );

    res.json({
      success: true,
      data: {
        of_en_cours: parseInt(ofEnCours.rows[0].count) || 0,
        taux_avancement: parseFloat(tauxAvancement.rows[0].taux) || 0,
        delai_moyen_jours: parseFloat(delaiMoyen.rows[0].delai_jours) || 0,
        taux_rebut: parseFloat(tauxRebut.rows[0].taux) || 0,
        commandes_attente: parseInt(commandesAttente.rows[0].count) || 0,
        machines_panne: parseInt(machinesPanne.rows[0].count) || 0,
        stock_critique: parseInt(stockCritique.rows[0].count) || 0,
        st_retard: parseInt(stRetard.rows[0].count) || 0
      }
    });
  } catch (error) {
    console.error('Erreur getKPIs:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// GET /api/dashboard/production - Graphiques production
export const getProductionStats = async (req, res) => {
  try {
    const { periode = '30' } = req.query; // jours

    // Production par jour
    const productionJour = await pool.query(
      `SELECT 
        DATE(date_debut) as jour,
        SUM(quantite_produite) as quantite,
        SUM(quantite_bonne) as bonne,
        SUM(quantite_rebut) as rebut
      FROM suivi_fabrication 
      WHERE date_debut >= CURRENT_DATE - INTERVAL '${periode} days'
      GROUP BY DATE(date_debut)
      ORDER BY jour`
    );

    // Production par machine
    const productionMachine = await pool.query(
      `SELECT 
        m.numero_machine,
        COUNT(sf.id_suivi) as nb_of,
        SUM(sf.quantite_produite) as quantite,
        AVG(sf.rendement) as rendement_moyen
      FROM suivi_fabrication sf
      LEFT JOIN machines m ON sf.id_machine = m.id_machine
      WHERE sf.date_debut >= CURRENT_DATE - INTERVAL '${periode} days'
      GROUP BY m.numero_machine
      ORDER BY quantite DESC`
    );

    // Production par article
    const productionArticle = await pool.query(
      `SELECT 
        a.code_article,
        a.designation,
        SUM(of.quantite_produite) as quantite_produite,
        SUM(of.quantite_a_produire) as quantite_prevue
      FROM ordres_fabrication of
      LEFT JOIN articles_catalogue a ON of.id_article = a.id_article
      WHERE of.date_creation_of >= CURRENT_DATE - INTERVAL '${periode} days'
      GROUP BY a.code_article, a.designation
      ORDER BY quantite_produite DESC
      LIMIT 10`
    );

    res.json({
      success: true,
      data: {
        par_jour: productionJour.rows,
        par_machine: productionMachine.rows,
        par_article: productionArticle.rows
      }
    });
  } catch (error) {
    console.error('Erreur getProductionStats:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// GET /api/dashboard/commandes - Graphiques commandes
export const getCommandesStats = async (req, res) => {
  try {
    const { periode = '30' } = req.query;

    // Commandes par statut
    const commandesStatut = await pool.query(
      `SELECT 
        statut,
        COUNT(*) as count,
        SUM(montant_total) as montant_total
      FROM commandes 
      WHERE date_commande >= CURRENT_DATE - INTERVAL '${periode} days'
      GROUP BY statut`
    );

    // Commandes par mois
    const commandesMois = await pool.query(
      `SELECT 
        DATE_TRUNC('month', date_commande) as mois,
        COUNT(*) as count,
        SUM(montant_total) as montant_total
      FROM commandes 
      WHERE date_commande >= CURRENT_DATE - INTERVAL '${periode} days'
      GROUP BY DATE_TRUNC('month', date_commande)
      ORDER BY mois`
    );

    // Top clients
    const topClients = await pool.query(
      `SELECT 
        c.code_client,
        c.raison_sociale,
        COUNT(cmd.id_commande) as nb_commandes,
        SUM(cmd.montant_total) as montant_total
      FROM commandes cmd
      LEFT JOIN clients c ON cmd.id_client = c.id_client
      WHERE cmd.date_commande >= CURRENT_DATE - INTERVAL '${periode} days'
      GROUP BY c.code_client, c.raison_sociale
      ORDER BY montant_total DESC
      LIMIT 10`
    );

    res.json({
      success: true,
      data: {
        par_statut: commandesStatut.rows,
        par_mois: commandesMois.rows,
        top_clients: topClients.rows
      }
    });
  } catch (error) {
    console.error('Erreur getCommandesStats:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// GET /api/dashboard/alertes - Alertes actives
export const getAlertes = async (req, res) => {
  try {
    // Alertes actives
    const alertes = await pool.query(
      `SELECT 
        aa.*,
        ta.libelle as type_alerte,
        ta.couleur,
        ta.icone
      FROM alertes_actives aa
      LEFT JOIN types_alertes ta ON aa.id_type_alerte = ta.id_type_alerte
      WHERE aa.resolue = false
      ORDER BY aa.date_creation DESC
      LIMIT 50`
    );

    // Résumé par type
    const resume = await pool.query(
      `SELECT 
        ta.libelle,
        ta.couleur,
        COUNT(*) as count
      FROM alertes_actives aa
      LEFT JOIN types_alertes ta ON aa.id_type_alerte = ta.id_type_alerte
      WHERE aa.resolue = false
      GROUP BY ta.libelle, ta.couleur`
    );

    res.json({
      success: true,
      data: {
        alertes: alertes.rows,
        resume: resume.rows
      }
    });
  } catch (error) {
    console.error('Erreur getAlertes:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};
