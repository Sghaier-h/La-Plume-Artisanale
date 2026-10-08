/**
 * Contrôleur Payroll Tunisia — moteur de calcul de paie (barèmes 2024/2025)
 *
 * Table `payroll_tunisia` : stub (id/name/description/active/audit)
 * Endpoints principalement compute-only ; les structures sont listées depuis
 * la table stub pour compatibilité UI.
 */

import { pool } from '../../../src/utils/db.js';
import { getUserId } from '../../../src/utils/audit.helper.js';
import { sendError, sendSuccess, handleError } from '../../../src/utils/error.helper.js';

// ─── Constantes barème Tunisie ────────────────────────────────────
const CNSS_EMPLOYE = 0.0918;
const CNSS_EMPLOYEUR = 0.1657;
const CSS_TAUX = 0.01;

const IRPP_BRACKETS = [
  { min: 0,     max: 5000,   taux: 0.00, tranche: '0 – 5 000 TND' },
  { min: 5000,  max: 20000,  taux: 0.26, tranche: '5 000 – 20 000 TND' },
  { min: 20000, max: 30000,  taux: 0.28, tranche: '20 000 – 30 000 TND' },
  { min: 30000, max: 50000,  taux: 0.32, tranche: '30 000 – 50 000 TND' },
  { min: 50000, max: null,   taux: 0.35, tranche: '> 50 000 TND' },
];

const SALARY_RULES = [
  { code: 'CNSS_EMP', libelle: 'CNSS Employé',   pourcentage: 9.18,  plafond: null },
  { code: 'CNSS_ER',  libelle: 'CNSS Employeur', pourcentage: 16.57, plafond: null },
  { code: 'CSS',      libelle: 'Contribution Sociale de Solidarité', pourcentage: 1.00, plafond: null },
  { code: 'IRPP',     libelle: 'IRPP progressif', pourcentage: null, plafond: null, brackets: IRPP_BRACKETS },
];

// Abattements famille (barème simplifié)
const ABATT_CHEF_FAMILLE = 300; // TND/an
const ABATT_ENFANTS = [100, 90, 75, 60]; // décroissant, jusqu'à 4 enfants

// ─── GET /api/payroll-tunisia/salary-rules ────────────────────────
export const getSalaryRules = async (req, res) => {
  try {
    return sendSuccess(res, SALARY_RULES, 'Règles de paie Tunisie');
  } catch (error) {
    return handleError(res, error, 'getSalaryRules');
  }
};

// ─── GET /api/payroll-tunisia/cnss-rates ──────────────────────────
export const getCnssRates = async (req, res) => {
  try {
    return sendSuccess(res, { employe: CNSS_EMPLOYE, employeur: CNSS_EMPLOYEUR, css: CSS_TAUX }, 'Taux CNSS');
  } catch (error) {
    return handleError(res, error, 'getCnssRates');
  }
};

// ─── GET /api/payroll-tunisia/irpp-bracket ────────────────────────
export const getIrppBrackets = async (req, res) => {
  try {
    return sendSuccess(res, IRPP_BRACKETS, 'Barème IRPP Tunisie');
  } catch (error) {
    return handleError(res, error, 'getIrppBrackets');
  }
};

// ─── GET /api/payroll-tunisia/structures ──────────────────────────
export const getStructures = async (req, res) => {
  try {
    const r = await pool.query(`SELECT * FROM payroll_tunisia ORDER BY id DESC`);
    return sendSuccess(res, r.rows, 'Structures de paie');
  } catch (error) {
    return handleError(res, error, 'getStructures');
  }
};

// ─── POST /api/payroll-tunisia/structures ─────────────────────────
export const createStructure = async (req, res) => {
  try {
    const userId = getUserId(req) || null;
    const { name, description } = req.body || {};
    if (!name) return sendError(res, 'name requis', 400);
    const r = await pool.query(
      `INSERT INTO payroll_tunisia (name, description, active, created_at, created_by)
       VALUES ($1, $2, true, NOW(), $3) RETURNING *`,
      [name, description || null, userId]
    );
    return sendSuccess(res, r.rows[0], 'Structure créée', 201);
  } catch (error) {
    return handleError(res, error, 'createStructure');
  }
};

// ─── Helpers de calcul ────────────────────────────────────────────
const computeAbattementFamille = (situation_familiale, chef_famille, nb_enfants) => {
  let abatt = 0;
  const isChef = chef_famille === true || chef_famille === 'true' || situation_familiale === 'marie';
  if (isChef) abatt += ABATT_CHEF_FAMILLE;
  const n = Math.max(0, parseInt(nb_enfants || 0, 10));
  for (let i = 0; i < n && i < ABATT_ENFANTS.length; i++) abatt += ABATT_ENFANTS[i];
  return abatt;
};

const computeIrppAnnuel = (imposable_annuel) => {
  let irpp = 0;
  const details = [];
  for (const b of IRPP_BRACKETS) {
    if (imposable_annuel <= b.min) break;
    const top = b.max === null ? imposable_annuel : Math.min(imposable_annuel, b.max);
    const base = Math.max(0, top - b.min);
    const part = base * b.taux;
    irpp += part;
    details.push({ tranche: b.tranche, base: Math.round(base * 100) / 100, taux: b.taux, montant: Math.round(part * 100) / 100 });
    if (b.max === null || imposable_annuel <= b.max) break;
  }
  return { irpp: Math.round(irpp * 100) / 100, details };
};

// ─── POST /api/payroll-tunisia/compute ────────────────────────────
export const computePayroll = async (req, res) => {
  try {
    const { salaire_brut, situation_familiale, chef_famille, nb_enfants } = req.body || {};
    const brut = Number(salaire_brut);
    if (!brut || brut <= 0) return sendError(res, 'salaire_brut requis (> 0)', 400);

    const cnss_salarie = Math.round(brut * CNSS_EMPLOYE * 100) / 100;
    const salaire_imposable = Math.round((brut - cnss_salarie) * 100) / 100;

    // Barème IRPP annuel → on annualise
    const imposable_annuel = salaire_imposable * 12;
    const abattement_famille = computeAbattementFamille(situation_familiale, chef_famille, nb_enfants);
    const imposable_apres_abatt = Math.max(0, imposable_annuel - abattement_famille);

    const { irpp: irpp_annuel, details: details_tranches } = computeIrppAnnuel(imposable_apres_abatt);
    const irpp = Math.round((irpp_annuel / 12) * 100) / 100;

    const css = Math.round(salaire_imposable * CSS_TAUX * 100) / 100;
    const salaire_net = Math.round((brut - cnss_salarie - irpp - css) * 100) / 100;

    return sendSuccess(
      res,
      {
        salaire_brut: brut,
        cnss_salarie,
        salaire_imposable,
        irpp,
        css,
        salaire_net,
        details_calcul: {
          cnss_taux: CNSS_EMPLOYE,
          css_taux: CSS_TAUX,
          imposable_annuel: Math.round(imposable_annuel * 100) / 100,
          abattement_famille,
          imposable_apres_abattement: Math.round(imposable_apres_abatt * 100) / 100,
          irpp_annuel,
          tranches: details_tranches,
        },
      },
      'Paie calculée'
    );
  } catch (error) {
    return handleError(res, error, 'computePayroll');
  }
};

// ─── POST /api/payroll-tunisia/compute-from-pointage ──────────────
export const computeFromPointage = async (req, res) => {
  try {
    const { id_operateur, mois, situation_familiale, chef_famille, nb_enfants } = req.body || {};
    if (!id_operateur || !mois) return sendError(res, 'id_operateur et mois requis', 400);
    if (!/^\d{4}-\d{2}$/.test(mois)) return sendError(res, 'Format mois attendu YYYY-MM', 400);

    const emp = await pool.query(
      `SELECT id_operateur, nom, prenom, matricule, taux_horaire
         FROM equipe_fabrication WHERE id_operateur = $1 LIMIT 1`,
      [id_operateur]
    );
    if (!emp.rows[0]) return sendError(res, 'Opérateur introuvable', 404);
    const operateur = emp.rows[0];
    const taux_horaire = Number(operateur.taux_horaire || 0);

    const hrs = await pool.query(
      `SELECT COALESCE(SUM(heures_travaillees), 0)::numeric AS total_heures,
              COALESCE(SUM(CASE WHEN present = true THEN 1 ELSE 0 END), 0)::int AS jours_presents
         FROM pointage
        WHERE user_id = $1 AND to_char(date, 'YYYY-MM') = $2`,
      [id_operateur, mois]
    );
    const total_heures = Number(hrs.rows[0].total_heures || 0);
    const jours_presents = Number(hrs.rows[0].jours_presents || 0);

    const salaire_brut = Math.round(total_heures * taux_horaire * 100) / 100;
    if (!salaire_brut) {
      return sendSuccess(res, {
        operateur,
        mois,
        total_heures,
        jours_presents,
        taux_horaire,
        salaire_brut: 0,
        message: 'Aucune heure travaillée pour la période',
      });
    }

    // Réutilise computePayroll logic
    const cnss_salarie = Math.round(salaire_brut * CNSS_EMPLOYE * 100) / 100;
    const salaire_imposable = Math.round((salaire_brut - cnss_salarie) * 100) / 100;
    const imposable_annuel = salaire_imposable * 12;
    const abattement_famille = computeAbattementFamille(situation_familiale, chef_famille, nb_enfants);
    const imposable_apres_abatt = Math.max(0, imposable_annuel - abattement_famille);
    const { irpp: irpp_annuel, details: details_tranches } = computeIrppAnnuel(imposable_apres_abatt);
    const irpp = Math.round((irpp_annuel / 12) * 100) / 100;
    const css = Math.round(salaire_imposable * CSS_TAUX * 100) / 100;
    const salaire_net = Math.round((salaire_brut - cnss_salarie - irpp - css) * 100) / 100;

    return sendSuccess(res, {
      operateur,
      mois,
      total_heures,
      jours_presents,
      taux_horaire,
      salaire_brut,
      cnss_salarie,
      salaire_imposable,
      irpp,
      css,
      salaire_net,
      details_calcul: {
        imposable_annuel: Math.round(imposable_annuel * 100) / 100,
        abattement_famille,
        imposable_apres_abattement: Math.round(imposable_apres_abatt * 100) / 100,
        irpp_annuel,
        tranches: details_tranches,
      },
    }, 'Paie calculée depuis pointage');
  } catch (error) {
    return handleError(res, error, 'computeFromPointage');
  }
};
