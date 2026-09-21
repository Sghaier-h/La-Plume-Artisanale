/**
 * Contrôleur Accounting Tunisia — barèmes fiscaux et plan comptable
 *
 * Simple stub avec taux TVA & positions fiscales hardcodés (2024/2025).
 * Les rapports fiscaux sont des placeholders — l'agrégation depuis `factures`
 * reste à implémenter selon la spec finale.
 */

import { pool } from '../../../src/utils/db.js';
import { getUserId } from '../../../src/utils/audit.helper.js';
import { sendError, sendSuccess, handleError } from '../../../src/utils/error.helper.js';

// ─── Données fiscales Tunisie ─────────────────────────────────────
const TVA_TAXES = [
  { id: 1, code: 'TVA_19', libelle: 'TVA 19%', taux: 19, type: 'tva' },
  { id: 2, code: 'TVA_13', libelle: 'TVA 13%', taux: 13, type: 'tva' },
  { id: 3, code: 'TVA_7',  libelle: 'TVA 7%',  taux: 7,  type: 'tva' },
  { id: 4, code: 'TVA_0',  libelle: 'Exonéré (0%)', taux: 0, type: 'tva' },
  { id: 5, code: 'DC',     libelle: 'Droits de consommation', taux: 0, type: 'dc' },
  { id: 6, code: 'RS_1_5', libelle: 'Retenue à la source 1.5%', taux: 1.5, type: 'rs' },
  { id: 7, code: 'RS_5',   libelle: 'Retenue à la source 5%',   taux: 5,   type: 'rs' },
  { id: 8, code: 'FODEC',  libelle: 'FODEC 1%', taux: 1, type: 'fodec' },
  { id: 9, code: 'TH',     libelle: 'Taxe hôtelière 2%', taux: 2, type: 'th' },
];

const FISCAL_POSITIONS = [
  { code: 'REEL',            libelle: 'Régime réel',           regime_fiscal: 'reel' },
  { code: 'FORFAIT',         libelle: 'Régime forfaitaire',    regime_fiscal: 'forfait' },
  { code: 'EXPORT_TOTAL',    libelle: 'Totalement exportateur', regime_fiscal: 'export' },
  { code: 'EXPORT_PARTIEL',  libelle: 'Partiellement exportateur', regime_fiscal: 'export_partiel' },
  { code: 'ZONE_FRANCHE',    libelle: 'Zone franche',          regime_fiscal: 'franche' },
  { code: 'EXONERE',         libelle: 'Exonéré',               regime_fiscal: 'exonere' },
];

// ─── GET /api/accounting-tunisia/taxes ────────────────────────────
export const getTaxes = async (req, res) => {
  try {
    return sendSuccess(res, TVA_TAXES, 'Taxes Tunisie');
  } catch (error) {
    return handleError(res, error, 'getTaxes');
  }
};

// ─── GET /api/accounting-tunisia/taxes/:id ────────────────────────
export const getTaxById = async (req, res) => {
  try {
    const key = req.params.id;
    const found = TVA_TAXES.find(
      (t) => String(t.id) === String(key) || t.code.toLowerCase() === String(key).toLowerCase()
    );
    if (!found) return sendError(res, 'Taxe introuvable', 404);
    return sendSuccess(res, found, 'Taxe récupérée');
  } catch (error) {
    return handleError(res, error, 'getTaxById');
  }
};

// ─── GET /api/accounting-tunisia/fiscal-positions ─────────────────
export const getFiscalPositions = async (req, res) => {
  try {
    return sendSuccess(res, FISCAL_POSITIONS, 'Positions fiscales');
  } catch (error) {
    return handleError(res, error, 'getFiscalPositions');
  }
};

// ─── GET /api/accounting-tunisia/tax-reports ──────────────────────
export const getTaxReports = async (req, res) => {
  try {
    return sendSuccess(
      res,
      { reports: [], note: 'À implémenter — requires monthly aggregation from factures' },
      'Rapports fiscaux (placeholder)'
    );
  } catch (error) {
    return handleError(res, error, 'getTaxReports');
  }
};

// ─── POST /api/accounting-tunisia/tax-reports/generate ────────────
export const generateTaxReport = async (req, res) => {
  try {
    const { mois } = req.body || {};
    if (!mois || !/^\d{4}-\d{2}$/.test(mois))
      return sendError(res, 'mois (YYYY-MM) requis', 400);

    let nb_factures = 0;
    let ca_total = 0;
    try {
      const r = await pool.query(
        `SELECT COUNT(*)::int AS n,
                COALESCE(SUM(COALESCE(montant_ttc, montant_total, 0)), 0)::numeric AS ca
           FROM factures
          WHERE to_char(COALESCE(date_facture, created_at::date), 'YYYY-MM') = $1`,
        [mois]
      );
      nb_factures = r.rows[0]?.n || 0;
      ca_total = Number(r.rows[0]?.ca || 0);
    } catch {
      // best-effort si colonnes absentes
    }

    return sendSuccess(
      res,
      {
        mois,
        nb_factures,
        ca_total,
        status: 'placeholder',
        note: "Génération à finaliser — agrégation TVA collectée/déductible non calculée",
      },
      'Rapport fiscal généré (placeholder)'
    );
  } catch (error) {
    return handleError(res, error, 'generateTaxReport');
  }
};

// ─── PUT /api/accounting-tunisia/tax-reports/:id/validate ─────────
export const validateTaxReport = async (req, res) => {
  try {
    return sendSuccess(
      res,
      { id: req.params.id, validated: true, note: 'Validation placeholder' },
      'Rapport validé (placeholder)'
    );
  } catch (error) {
    return handleError(res, error, 'validateTaxReport');
  }
};

// ─── GET /api/accounting-tunisia/chart-of-accounts ────────────────
export const getChartOfAccounts = async (req, res) => {
  try {
    try {
      const r = await pool.query(`SELECT * FROM account_accounts ORDER BY code ASC LIMIT 500`);
      return sendSuccess(res, r.rows, 'Plan comptable');
    } catch {
      return sendSuccess(res, [], 'Plan comptable vide (table absente)');
    }
  } catch (error) {
    return handleError(res, error, 'getChartOfAccounts');
  }
};

// ─── POST /api/accounting-tunisia/chart-of-accounts/init ──────────
export const initChartOfAccounts = async (req, res) => {
  try {
    return sendSuccess(
      res,
      { status: 'placeholder', note: 'Initialisation du plan comptable Tunisie à implémenter' },
      'Init plan comptable (placeholder)'
    );
  } catch (error) {
    return handleError(res, error, 'initChartOfAccounts');
  }
};
