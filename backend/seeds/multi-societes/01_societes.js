/**
 * backend/seeds/multi-societes/01_societes.js
 *
 * Seed des 5 sociétés du groupe (§14quater.1).
 *
 * Idempotent : ON CONFLICT (code_societe) DO UPDATE pour permettre
 * de re-exécuter sans doublon et de rattraper les champs manquants.
 *
 * Exécuté par `scripts/seed-societes.js` (npm run seed:societes).
 */

export const SOCIETES_SEED = [
  {
    code_societe: 'LP',
    raison_sociale: 'La Plume Artisanale',
    nom_commercial: 'La Plume Artisanale',
    forme_juridique: 'SARL',
    type_societe: 'fabrication',
    siret: null,
    tva_intracommunautaire: null,
    adresse: 'Zone industrielle, Ksar Hellal',
    code_postal: '5070',
    ville: 'Ksar Hellal',
    pays: 'Tunisie',
    telephone: null,
    email: 'contact@laplume-artisanale.tn',
    site_web: 'https://laplume-artisanale.tn',
    logo_url: '/uploads/logos/lp.png',
    devise: 'TND',
    langue: 'fr',
    fuseau_horaire: 'Africa/Tunis',
    est_consolidation: false,
    actif: true,
  },
  {
    code_societe: 'CAPSCOR',
    raison_sociale: 'CAPSCOR',
    nom_commercial: 'CAPSCOR',
    forme_juridique: 'SARL',
    type_societe: 'import_export',
    siret: null,
    tva_intracommunautaire: null,
    adresse: null,
    code_postal: null,
    ville: null,
    pays: 'Tunisie',
    telephone: null,
    email: null,
    site_web: null,
    logo_url: '/uploads/logos/capscor.png',
    devise: 'TND',
    langue: 'fr',
    fuseau_horaire: 'Africa/Tunis',
    est_consolidation: false,
    actif: true,
  },
  {
    code_societe: 'AT',
    raison_sociale: 'Artisanat Tunisien',
    nom_commercial: 'Artisanat Tunisien',
    forme_juridique: 'SARL',
    type_societe: 'commerce',
    siret: null,
    tva_intracommunautaire: null,
    adresse: null,
    code_postal: null,
    ville: null,
    pays: 'Tunisie',
    telephone: null,
    email: null,
    site_web: null,
    logo_url: '/uploads/logos/at.png',
    devise: 'TND',
    langue: 'fr',
    fuseau_horaire: 'Africa/Tunis',
    est_consolidation: false,
    actif: true,
  },
  {
    code_societe: 'PMG',
    raison_sociale: 'PMG TEX TUNISIE',
    nom_commercial: 'PMG TEX',
    forme_juridique: 'SARL',
    type_societe: 'tissage',
    siret: null,
    tva_intracommunautaire: null,
    adresse: null,
    code_postal: null,
    ville: null,
    pays: 'Tunisie',
    telephone: null,
    email: null,
    site_web: null,
    logo_url: '/uploads/logos/pmg.png',
    devise: 'TND',
    langue: 'fr',
    fuseau_horaire: 'Africa/Tunis',
    est_consolidation: false,
    actif: true,
  },
  {
    code_societe: 'HS',
    raison_sociale: 'Hamdi Sghaier',
    nom_commercial: 'Hamdi Sghaier',
    forme_juridique: 'Personne physique',
    type_societe: 'perso',
    siret: null,
    tva_intracommunautaire: null,
    adresse: null,
    code_postal: null,
    ville: null,
    pays: 'Tunisie',
    telephone: null,
    email: null,
    site_web: null,
    logo_url: '/uploads/logos/hs.png',
    devise: 'TND',
    langue: 'fr',
    fuseau_horaire: 'Africa/Tunis',
    est_consolidation: false,
    actif: true,
  },
];

/**
 * Applique le seed à la base. Appelé par scripts/seed-societes.js.
 *
 * @param {import('pg').PoolClient | import('pg').Pool} client
 * @returns {Promise<{inserted:number, updated:number, total:number}>}
 */
export async function applySocietesSeed(client) {
  let inserted = 0;
  let updated = 0;

  // On impose un ordre déterministe : LP = id_societe 1 (back-compat).
  // Si l'id 1 est déjà pris par un autre code, on ne force rien (les
  // tables métier avec DEFAULT 1 continuent d'y pointer sans drame).
  for (const s of SOCIETES_SEED) {
    const res = await client.query(
      `INSERT INTO societes (
          code_societe, raison_sociale, nom_commercial, forme_juridique, type_societe,
          siret, tva_intracommunautaire,
          adresse, code_postal, ville, pays,
          telephone, email, site_web, logo_url,
          devise, langue, fuseau_horaire,
          est_consolidation, actif
       ) VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20
       )
       ON CONFLICT (code_societe) DO UPDATE SET
          raison_sociale         = EXCLUDED.raison_sociale,
          nom_commercial         = EXCLUDED.nom_commercial,
          forme_juridique        = COALESCE(EXCLUDED.forme_juridique, societes.forme_juridique),
          type_societe           = COALESCE(EXCLUDED.type_societe, societes.type_societe),
          siret                  = COALESCE(EXCLUDED.siret, societes.siret),
          tva_intracommunautaire = COALESCE(EXCLUDED.tva_intracommunautaire, societes.tva_intracommunautaire),
          adresse                = COALESCE(EXCLUDED.adresse, societes.adresse),
          code_postal            = COALESCE(EXCLUDED.code_postal, societes.code_postal),
          ville                  = COALESCE(EXCLUDED.ville, societes.ville),
          pays                   = COALESCE(EXCLUDED.pays, societes.pays),
          email                  = COALESCE(EXCLUDED.email, societes.email),
          site_web               = COALESCE(EXCLUDED.site_web, societes.site_web),
          logo_url               = COALESCE(EXCLUDED.logo_url, societes.logo_url),
          devise                 = COALESCE(EXCLUDED.devise, societes.devise),
          langue                 = COALESCE(EXCLUDED.langue, societes.langue),
          fuseau_horaire         = COALESCE(EXCLUDED.fuseau_horaire, societes.fuseau_horaire),
          est_consolidation      = EXCLUDED.est_consolidation,
          actif                  = EXCLUDED.actif,
          updated_at             = NOW()
       RETURNING (xmax = 0) AS inserted`,
      [
        s.code_societe, s.raison_sociale, s.nom_commercial, s.forme_juridique, s.type_societe,
        s.siret, s.tva_intracommunautaire,
        s.adresse, s.code_postal, s.ville, s.pays,
        s.telephone, s.email, s.site_web, s.logo_url,
        s.devise, s.langue, s.fuseau_horaire,
        s.est_consolidation, s.actif,
      ]
    );
    if (res.rows[0] && res.rows[0].inserted) inserted++; else updated++;
  }

  return { inserted, updated, total: SOCIETES_SEED.length };
}

export default SOCIETES_SEED;
