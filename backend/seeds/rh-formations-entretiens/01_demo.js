// =============================================================================
// 01_demo.js — Seed démo Phase G2 : 5 formations + 15 participants + 10 entretiens
//
// Idempotent : DELETE WHERE titre/besoins_formation LIKE '[DEMO]%' puis INSERT.
// Les employés référencés doivent exister ; sinon un ensemble minimal est créé.
// =============================================================================
import { getPool } from '../../modules-v2/_shared/db.js';

const pool = getPool();

// Matricules démo (compat seed rh-etendu/01_comptes_employes.sql)
const EMP_MATRICULES = [
  'EMP-001','EMP-002','EMP-003','EMP-004','EMP-005',
  'EMP-006','EMP-007','EMP-008','EMP-009','EMP-010',
  'EMP-011','EMP-012',
];

async function ensureEmployesMinimum(client) {
  // Si moins de 6 employés, on insère un noyau minimal pour que les seeds passent
  const { rows } = await client.query(`SELECT COUNT(*)::int AS n FROM employes`);
  if (rows[0]?.n >= 6) return;
  await client.query(
    `INSERT INTO employes (matricule, nom, prenom, date_embauche, statut)
     VALUES
       ('EMP-001','Salem',    'Mohamed', '2022-01-10','actif'),
       ('EMP-002','Amdouni',  'Najwa',   '2021-03-05','actif'),
       ('EMP-003','Ben Ali',  'Amira',   '2023-06-15','actif'),
       ('EMP-004','Khemiri',  'Karim',   '2022-09-20','actif'),
       ('EMP-005','Trabelsi', 'Ines',    '2024-02-01','actif'),
       ('EMP-006','Hamdi',    'Sonia',   '2023-11-12','actif'),
       ('EMP-007','Jebali',   'Ahmed',   '2022-05-18','actif'),
       ('EMP-008','Laabidi',  'Fatma',   '2021-10-01','actif'),
       ('EMP-009','Mejri',    'Youssef', '2023-04-22','actif'),
       ('EMP-010','Nasri',    'Hela',    '2024-07-15','actif'),
       ('EMP-011','Oueslati', 'Riadh',   '2020-08-03','actif'),
       ('EMP-012','Zahaf',    'Mariem',  '2022-12-10','actif')
     ON CONFLICT (matricule) DO NOTHING`
  );
}

async function seedFormations(client) {
  // Nettoyage ciblé (idempotence) — PK CASCADE sur participants
  await client.query(`DELETE FROM formations WHERE titre LIKE '[DEMO]%'`);

  const today = new Date();
  const d = (daysOffset) => {
    const dt = new Date(today.getTime() + daysOffset * 86400_000);
    return dt.toISOString().slice(0, 10);
  };

  const formations = [
    {
      titre: '[DEMO] Sécurité machines tissage — habilitation CETTEX',
      description: 'Habilitation obligatoire JORT N°49 (16h · certifiante · ISST Tunis)',
      type: 'habilitation', duree_heures: 16, cout_tnd: 1200,
      formateur: 'Mme Khaled (ISST)',  organisme: 'CETTEX Monastir',
      date_debut: d(-30), date_fin: d(-28), statut: 'terminee',
    },
    {
      titre: '[DEMO] Nouveau métier à tisser Picanol OMNIplus',
      description: 'Formation interne équipe tissage — nouveau matériel',
      type: 'interne', duree_heures: 40, cout_tnd: 0,
      formateur: 'Hedi Sghaier (chef atelier)', organisme: 'Interne',
      date_debut: d(5), date_fin: d(12), statut: 'planifiee',
    },
    {
      titre: '[DEMO] Contrôle qualité tissage — méthode 4 points',
      description: 'Standard inspection foutas · certifiante AFT',
      type: 'externe', duree_heures: 16, cout_tnd: 850,
      formateur: 'AFT Formation', organisme: 'AFT Formation Tunis',
      date_debut: d(20), date_fin: d(22), statut: 'planifiee',
    },
    {
      titre: '[DEMO] Management d’équipe — chefs d’atelier',
      description: 'Soft skills management + gestion de conflit (24h)',
      type: 'externe', duree_heures: 24, cout_tnd: 1800,
      formateur: 'IACE Tunis', organisme: 'IACE Tunis',
      date_debut: d(-5), date_fin: d(2), statut: 'en_cours',
    },
    {
      titre: '[DEMO] Anglais commercial B2B — 60h e-learning',
      description: 'Marchés export (France/Italie/Allemagne) · British Council',
      type: 'e-learning', duree_heures: 60, cout_tnd: 2400,
      formateur: 'British Council', organisme: 'British Council',
      date_debut: d(60), date_fin: d(120), statut: 'planifiee',
    },
  ];

  const ids = [];
  for (const f of formations) {
    const { rows } = await client.query(
      `INSERT INTO formations
         (titre, description, type, duree_heures, cout_tnd,
          formateur, organisme, date_debut, date_fin, statut)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING id_formation`,
      [f.titre, f.description, f.type, f.duree_heures, f.cout_tnd,
       f.formateur, f.organisme, f.date_debut, f.date_fin, f.statut]
    );
    ids.push(rows[0].id_formation);
  }

  // 15 participants : répartition sur les 5 formations (3 participants par formation)
  const empRows = await client.query(
    `SELECT id_employe, matricule FROM employes WHERE matricule = ANY($1::varchar[]) ORDER BY matricule ASC`,
    [EMP_MATRICULES]
  );
  const employes = empRows.rows;
  if (employes.length < 3) {
    console.warn('[seed-formations] moins de 3 employés en base, participants non seedés');
    return { formations: ids.length, participants: 0 };
  }

  // Mapping (3 participants par formation en rotation)
  const participantInserts = [];
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 3; j++) {
      const emp = employes[(i * 3 + j) % employes.length];
      // statut : present pour les terminées, inscrit pour les autres
      const statutF = formations[i].statut;
      const statutP = statutF === 'terminee' ? 'present'
                    : statutF === 'en_cours' ? 'inscrit'
                    : 'inscrit';
      const note = statutF === 'terminee' ? (7 + Math.random() * 2.5).toFixed(1) : null;
      participantInserts.push([ids[i], emp.id_employe, statutP, note]);
    }
  }

  let nbParticipants = 0;
  for (const [idForm, idEmp, s, note] of participantInserts) {
    await client.query(
      `INSERT INTO formations_participants
         (id_formation, id_employe, statut, note_satisfaction, commentaire)
       VALUES ($1,$2,$3,$4,'[DEMO] Participant Phase G2')
       ON CONFLICT (id_formation, id_employe) DO NOTHING`,
      [idForm, idEmp, s, note]
    );
    nbParticipants++;
  }
  return { formations: ids.length, participants: nbParticipants };
}

async function seedEntretiens(client) {
  // Nettoyage ciblé : besoins_formation est le champ texte identifiant
  await client.query(`DELETE FROM entretiens_annuels WHERE besoins_formation LIKE '[DEMO]%'`);

  const empRows = await client.query(
    `SELECT id_employe, matricule FROM employes WHERE matricule = ANY($1::varchar[]) ORDER BY matricule ASC`,
    [EMP_MATRICULES]
  );
  const employes = empRows.rows;
  if (employes.length < 2) {
    console.warn('[seed-entretiens] moins de 2 employés, entretiens non seedés');
    return 0;
  }

  const today = new Date();
  const d = (offset) => {
    const dt = new Date(today.getTime() + offset * 86400_000);
    return dt.toISOString().slice(0, 10);
  };

  // Évaluateur = premier employé (chef d'atelier par convention)
  const evaluateurId = employes[0].id_employe;

  const entretiens = [
    // 3 planifiés à venir
    { emp_idx: 2, date: d(5),   type: 'annuel',     statut: 'planifie', score: null,
      besoins: '[DEMO] Formation management + anglais commercial' },
    { emp_idx: 3, date: d(10),  type: 'annuel',     statut: 'planifie', score: null,
      besoins: '[DEMO] Habilitation sécurité à renouveler' },
    { emp_idx: 4, date: d(15),  type: 'probatoire', statut: 'planifie', score: null,
      besoins: '[DEMO] Fin de période d’essai 3 mois' },

    // 2 planifiés EN RETARD (date passée + statut planifie)
    { emp_idx: 5, date: d(-10), type: 'annuel',     statut: 'planifie', score: null,
      besoins: '[DEMO] RETARD · à reprogrammer d’urgence' },
    { emp_idx: 6, date: d(-20), type: 'recadrage',  statut: 'planifie', score: null,
      besoins: '[DEMO] RETARD · recadrage absences répétées' },

    // 3 réalisés
    { emp_idx: 7, date: d(-25), type: 'annuel',     statut: 'realise',  score: 8.5,
      besoins: '[DEMO] Formation tissage avancé validée' },
    { emp_idx: 8, date: d(-40), type: 'annuel',     statut: 'realise',  score: 7.2,
      besoins: '[DEMO] Progression satisfaisante' },
    { emp_idx: 9, date: d(-55), type: 'probatoire', statut: 'realise',  score: 9.0,
      besoins: '[DEMO] Titularisation recommandée' },

    // 2 validés
    { emp_idx: 10, date: d(-80), type: 'annuel',    statut: 'valide',   score: 8.0,
      besoins: '[DEMO] Augmentation 5% actée' },
    { emp_idx: 11, date: d(-95), type: 'depart',    statut: 'valide',   score: 6.5,
      besoins: '[DEMO] Entretien de départ · bons rapports' },
  ];

  let nb = 0;
  for (const e of entretiens) {
    const emp = employes[e.emp_idx % employes.length];
    if (!emp) continue;
    await client.query(
      `INSERT INTO entretiens_annuels
         (id_employe, id_evaluateur, date_entretien, type, statut, score_global,
          objectifs_atteints, objectifs_prochains, besoins_formation)
       VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8::jsonb,$9)`,
      [
        emp.id_employe, evaluateurId, e.date, e.type, e.statut, e.score,
        JSON.stringify(e.statut === 'realise' || e.statut === 'valide'
          ? [{ libelle: 'Objectif qualité', atteint: true }, { libelle: 'Objectif rendement', atteint: e.score >= 7.5 }]
          : []),
        JSON.stringify(e.statut === 'realise' || e.statut === 'valide'
          ? [{ libelle: 'Monter en compétence sur nouveau métier', deadline: d(180) }]
          : []),
        e.besoins,
      ]
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
    const f = await seedFormations(client);
    const e = await seedEntretiens(client);
    await client.query('COMMIT');
    console.log(`[seed-formations-entretiens] OK — ${f.formations} formations, ${f.participants} participants, ${e} entretiens`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[seed-formations-entretiens] ERREUR :', err.message);
    throw err;
  } finally {
    client.release();
  }
}

// Permet l'import ES depuis seed-formations-entretiens.js
export default main;
