// routes.js — export (T3c)
// GET /api/v2/export/:entite/xlsx
//   Entités supportées : factures, commandes, clients, employes
//   Utilise exceljs ; dégrade avec stub JSON si la table source n'existe pas.
//
// Query : ?date_debut=&date_fin=&limit=
import { Router } from 'express';
import ExcelJS from 'exceljs';
import { getPool } from '../_shared/db.js';
import { fail, asyncHandler } from '../_shared/api-envelope.js';

const router = Router();

// Déf des mappings entité → requête SQL
const EXPORTS = {
  factures: {
    sql: (p, w) => `SELECT id_facture, numero_facture, date_facture,
                           id_client, montant_ht, montant_ttc, statut
                      FROM factures
                      ${w.length ? 'WHERE ' + w.join(' AND ') : ''}
                      ORDER BY date_facture DESC NULLS LAST
                      LIMIT ${p.push(1000) /* placeholder consomme un param */}`,
    useLimitAtEnd: true,
    columns: ['ID', 'Numéro', 'Date', 'Client', 'HT', 'TTC', 'Statut'],
    table: 'factures',
  },
  commandes: {
    sql: (p, w) => `SELECT id_commande, numero_commande, date_commande,
                           id_client, montant_total, statut
                      FROM commandes
                      ${w.length ? 'WHERE ' + w.join(' AND ') : ''}
                      ORDER BY date_commande DESC NULLS LAST
                      LIMIT ${p.push(1000)}`,
    useLimitAtEnd: true,
    columns: ['ID', 'Numéro', 'Date', 'Client', 'Montant', 'Statut'],
    table: 'commandes',
  },
  clients: {
    sql: (_p, _w) => `SELECT id_client, code_client, raison_sociale, email,
                             telephone, ville, actif
                        FROM clients
                       ORDER BY raison_sociale`,
    useLimitAtEnd: false,
    columns: ['ID', 'Code', 'Raison sociale', 'Email', 'Téléphone', 'Ville', 'Actif'],
    table: 'clients',
  },
  employes: {
    sql: (_p, _w) => `SELECT id_employe, matricule, nom, prenom, fonction,
                             departement, actif
                        FROM employes
                       ORDER BY nom, prenom`,
    useLimitAtEnd: false,
    columns: ['ID', 'Matricule', 'Nom', 'Prénom', 'Fonction', 'Département', 'Actif'],
    table: 'employes',
  },
};

async function tableExists(name) {
  const r = await getPool().query(`SELECT to_regclass($1) AS t`, [`public.${name}`]);
  return !!r.rows[0].t;
}

router.get('/:entite/xlsx', asyncHandler(async (req, res) => {
  const def = EXPORTS[req.params.entite];
  if (!def) {
    return res.status(400).json(fail('BAD_ENTITY', `Entité non supportée: ${req.params.entite}`));
  }

  // Dégradation : si table absente → JSON stub
  if (!(await tableExists(def.table))) {
    return res.status(200).json({
      success: true,
      data: [],
      meta: {
        stub: true,
        message: `En attente d'implémentation DB (table ${def.table})`,
        entite: req.params.entite,
      },
      error: null,
    });
  }

  const p = []; const w = [];
  if (req.query.date_debut) { p.push(req.query.date_debut); w.push(`date_facture >= $${p.length}` /* seul usage date */); }
  if (req.query.date_fin)   { p.push(req.query.date_fin);   w.push(`date_facture <= $${p.length}`); }
  // simplification : seuls `factures` et `commandes` utilisent date_debut/date_fin ; les autres ignorent
  const sql = def.sql(p, w);
  let rows = [];
  try {
    // Pour `useLimitAtEnd`, p.push dans sql() a ajouté la limite ; on ne la fournit pas en param
    const paramArray = def.useLimitAtEnd ? p.slice(0, -1) : p;
    const r = await getPool().query(sql.replace(/LIMIT \d+/, def.useLimitAtEnd ? `LIMIT ${p[p.length - 1]}` : ''), paramArray);
    rows = r.rows;
  } catch (e) {
    return res.status(200).json({
      success: true,
      data: [],
      meta: { stub: true, message: e.message, entite: req.params.entite },
      error: null,
    });
  }

  // Génération XLSX
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'La Plume Artisanale ERP';
  workbook.created = new Date();
  const ws = workbook.addWorksheet(req.params.entite);
  ws.addRow(def.columns);
  for (const r of rows) ws.addRow(Object.values(r));
  ws.getRow(1).font = { bold: true };

  const buf = await workbook.xlsx.writeBuffer();
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition',
    `attachment; filename="export_${req.params.entite}_${new Date().toISOString().slice(0, 10)}.xlsx"`);
  res.send(Buffer.from(buf));
}));

export default router;
