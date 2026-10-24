/**
 * backend/src/config/database.js
 *
 * Wrapper de compatibilité. Certains modules v2 (fabrication, qualite,
 * sous-traitance) importent `getPool` depuis ce chemin historique.
 * On redirige simplement vers le pool partagé de modules-v2/_shared/db.js.
 */
export { getPool } from '../../modules-v2/_shared/db.js';
