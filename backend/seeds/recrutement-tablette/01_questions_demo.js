// =============================================================================
// 01_questions_demo.js — Seed démo Phase H : 15 questions recrutement tablette
// 3 postes cibles (TISSEUR, COUPEUR, COMMERCIAL) · types mixtes
// Idempotent : DELETE WHERE question_text LIKE '[DEMO]%' puis INSERT.
// =============================================================================
import { getPool } from '../../modules-v2/_shared/db.js';

const pool = getPool();

const QUESTIONS = [
  // ─── TISSEUR (5 questions) ───
  { poste: 'TISSEUR', type: 'texte', ordre: 1, poids: 1,
    text: '[DEMO] Décrivez vos expériences précédentes en tissage de foutas ou textile artisanal.' },
  { poste: 'TISSEUR', type: 'multi', ordre: 2, poids: 2,
    text: '[DEMO] Quel type de métier à tisser avez-vous déjà utilisé ?',
    choix: ['Métier manuel', 'Métier mécanique Picanol', 'Métier Jacquard', 'Aucun'] },
  { poste: 'TISSEUR', type: 'note', ordre: 3, poids: 3,
    text: '[DEMO] Notez votre maîtrise du réglage de tension de chaîne (0 à 10).' },
  { poste: 'TISSEUR', type: 'test_logique', ordre: 4, poids: 5,
    text: '[DEMO] Si un fil de chaîne casse pendant le tissage, quelle est la priorité ?',
    choix: ['Arrêter la machine', 'Continuer le lot', 'Changer la trame', 'Appeler le chef'],
    reponse: 'Arrêter la machine' },
  { poste: 'TISSEUR', type: 'texte', ordre: 5, poids: 1,
    text: '[DEMO] Combien d’années d’expérience possédez-vous dans ce métier ?' },

  // ─── COUPEUR (5 questions) ───
  { poste: 'COUPEUR', type: 'texte', ordre: 1, poids: 1,
    text: '[DEMO] Décrivez vos expériences en coupe de tissus (foutas, draps, autres).' },
  { poste: 'COUPEUR', type: 'multi', ordre: 2, poids: 2,
    text: '[DEMO] Quels outils de coupe maîtrisez-vous ?',
    choix: ['Ciseaux manuels', 'Cutter rotatif', 'Scie à ruban', 'Table laser'] },
  { poste: 'COUPEUR', type: 'note', ordre: 3, poids: 3,
    text: '[DEMO] Notez votre précision à ± 2 mm sur une coupe d’1 m (0 à 10).' },
  { poste: 'COUPEUR', type: 'test_logique', ordre: 4, poids: 5,
    text: '[DEMO] 10 foutas de 2 m à couper d’un rouleau de 24 m. Combien reste-t-il ?',
    choix: ['2 m', '4 m', '6 m', '0 m'], reponse: '4 m' },
  { poste: 'COUPEUR', type: 'texte', ordre: 5, poids: 1,
    text: '[DEMO] Quelle est votre vitesse moyenne (pièces/heure) ?' },

  // ─── COMMERCIAL (5 questions) ───
  { poste: 'COMMERCIAL', type: 'texte', ordre: 1, poids: 1,
    text: '[DEMO] Décrivez vos expériences commerciales B2B dans le textile.' },
  { poste: 'COMMERCIAL', type: 'multi', ordre: 2, poids: 2,
    text: '[DEMO] Quels marchés export avez-vous déjà prospectés ?',
    choix: ['France', 'Italie', 'Allemagne', 'Pays du Golfe', 'États-Unis'] },
  { poste: 'COMMERCIAL', type: 'note', ordre: 3, poids: 3,
    text: '[DEMO] Niveau d’anglais professionnel (0 débutant à 10 bilingue).' },
  { poste: 'COMMERCIAL', type: 'test_logique', ordre: 4, poids: 5,
    text: '[DEMO] Un client demande une remise de 15% ; marge brute 25% ; que faites-vous ?',
    choix: ['Accepter', 'Refuser', 'Négocier à 7%', 'Demander validation direction'],
    reponse: 'Demander validation direction' },
  { poste: 'COMMERCIAL', type: 'texte', ordre: 5, poids: 1,
    text: '[DEMO] Quel est votre portefeuille clients actuel (volume annuel) ?' },
];

async function main() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`DELETE FROM questions_recrutement WHERE question_text LIKE '[DEMO]%'`);

    let nb = 0;
    for (const q of QUESTIONS) {
      await client.query(
        `INSERT INTO questions_recrutement
           (poste_cible, question_type, question_text, choix_json, bonne_reponse, poids, ordre, actif)
         VALUES ($1,$2,$3,$4::jsonb,$5,$6,$7,TRUE)`,
        [
          q.poste, q.type, q.text,
          q.choix ? JSON.stringify(q.choix) : null,
          q.reponse || null,
          q.poids, q.ordre,
        ]
      );
      nb++;
    }
    await client.query('COMMIT');
    console.log(`[seed-recrutement-tablette] OK — ${nb} questions démo (3 postes)`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[seed-recrutement-tablette] ERREUR :', err.message);
    throw err;
  } finally {
    client.release();
  }
}

export default main;
