// =============================================================================
// 01_regles_demo.js — Seed démo Phase H : 4 règles + 3 avertissements démo
// Idempotent : DELETE WHERE nom/message LIKE '[DEMO]%' puis INSERT.
// =============================================================================
import { getPool } from '../../modules-v2/_shared/db.js';

const pool = getPool();

const EMP_MATRICULES = [
  'EMP-001','EMP-002','EMP-003','EMP-004','EMP-005',
  'EMP-006','EMP-007','EMP-008','EMP-009','EMP-010',
];

async function ensureEmployesMinimum(client) {
  const { rows } = await client.query(`SELECT COUNT(*)::int AS n FROM employes`);
  if (rows[0]?.n >= 3) return;
  await client.query(
    `INSERT INTO employes (matricule, nom, prenom, date_embauche, statut)
     VALUES
       ('EMP-001','Salem',    'Mohamed', '2022-01-10','actif'),
       ('EMP-002','Amdouni',  'Najwa',   '2021-03-05','actif'),
       ('EMP-003','Ben Ali',  'Amira',   '2023-06-15','actif')
     ON CONFLICT (matricule) DO NOTHING`
  );
}

async function seedRegles(client) {
  await client.query(`DELETE FROM avertissements_regles WHERE nom LIKE '[DEMO]%'`);

  const regles = [
    {
      code: 'retard_repete',
      nom: '[DEMO] Retards répétés — > 5 retards / 30 jours',
      seuil_valeur: 5, periode_jours: 30, niveau: 'attention',
      message: 'Vous avez accumulé {nb} retards sur les {periode} derniers jours. '
             + 'Nous vous invitons à régulariser votre ponctualité.',
    },
    {
      code: 'absence_non_just',
      nom: '[DEMO] Absences non justifiées — ≥ 2 jours / 30 jours',
      seuil_valeur: 2, periode_jours: 30, niveau: 'grave',
      message: '{nb} absence(s) non justifiée(s) détectée(s) sur les {periode} derniers jours. '
             + 'Veuillez fournir vos justificatifs sans délai.',
    },
    {
      code: 'baisse_productivite',
      nom: '[DEMO] Baisse de productivité — < 70% objectif 3 mois',
      seuil_valeur: 70, periode_jours: 90, niveau: 'info',
      message: 'Votre productivité est de {nb}% sur les {periode} derniers jours (objectif ≥ {seuil}%).',
    },
    {
      code: 'refus_consigne',
      nom: '[DEMO] Refus de consigne — ≥ 1 incident / 30 jours',
      seuil_valeur: 1, periode_jours: 30, niveau: 'sanction',
      message: 'Un refus de consigne a été signalé. Entretien RH obligatoire.',
    },
  ];

  for (const r of regles) {
    await client.query(
      `INSERT INTO avertissements_regles
         (code, nom, actif, seuil_valeur, periode_jours, niveau_declenche, message_template)
       VALUES ($1,$2,TRUE,$3,$4,$5,$6)
       ON CONFLICT (code, id_societe) DO UPDATE SET
         nom = EXCLUDED.nom,
         seuil_valeur = EXCLUDED.seuil_valeur,
         periode_jours = EXCLUDED.periode_jours,
         niveau_declenche = EXCLUDED.niveau_declenche,
         message_template = EXCLUDED.message_template,
         updated_at = NOW()`,
      [r.code, r.nom, r.seuil_valeur, r.periode_jours, r.niveau, r.message]
    );
  }

  return regles.length;
}

async function seedAvertissementsDemo(client) {
  await client.query(`DELETE FROM avertissements_rh WHERE message LIKE '[DEMO]%'`);

  const empRows = await client.query(
    `SELECT id_employe, matricule FROM employes
      WHERE matricule = ANY($1::varchar[])
      ORDER BY matricule ASC LIMIT 3`,
    [EMP_MATRICULES]
  );
  const emps = empRows.rows;
  if (emps.length === 0) return 0;

  const today = new Date();
  const d = (offset) => new Date(today.getTime() + offset * 86400_000);

  const samples = [
    {
      emp: 0, type: 'retard_repete', niveau: 'attention',
      statut: 'nouveau',
      message: '[DEMO] Vous avez accumulé 7 retards sur les 30 derniers jours. '
             + 'Merci de régulariser votre ponctualité.',
    },
    {
      emp: 1, type: 'absence_non_just', niveau: 'grave',
      statut: 'lu',
      message: '[DEMO] 3 absences non justifiées détectées sur les 30 derniers jours. '
             + 'Un entretien avec la RH est programmé.',
    },
    {
      emp: 2, type: 'refus_consigne', niveau: 'sanction',
      statut: 'contestee',
      message: '[DEMO] Refus de consigne signalé par le chef d’atelier le 2026-10-15.',
    },
  ];

  let nb = 0;
  for (const s of samples) {
    const emp = emps[s.emp % emps.length];
    await client.query(
      `INSERT INTO avertissements_rh
         (id_employe, type, niveau, message, periode_debut, periode_fin,
          auto_genere, genere_par, statut, date_envoi, date_lu)
       VALUES ($1,$2,$3,$4,$5,$6,TRUE,'scanner',$7,NOW(),
               CASE WHEN $7 IN ('lu','contestee','traitee','classee') THEN NOW() ELSE NULL END)`,
      [emp.id_employe, s.type, s.niveau, s.message,
       d(-30).toISOString().slice(0,10), d(0).toISOString().slice(0,10), s.statut]
    );
    nb++;
  }
  return nb;
}

async function main() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await ensureEmployesMinimum(client);
    const r = await seedRegles(client);
    const a = await seedAvertissementsDemo(client);
    await client.query('COMMIT');
    console.log(`[seed-avertissements] OK — ${r} règles, ${a} avertissements démo`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[seed-avertissements] ERREUR :', err.message);
    throw err;
  } finally {
    client.release();
  }
}

export default main;
