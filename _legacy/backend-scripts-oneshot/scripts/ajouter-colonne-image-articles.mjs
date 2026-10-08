/**
 * Script pour ajouter la colonne image_url à la table articles_catalogue
 */

import { pool } from '../src/utils/db.js';

async function addImageColumn() {
  try {
    console.log('Vérification de la colonne image_url...');
    
    // Vérifier si la colonne existe
    const checkResult = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'articles_catalogue' 
      AND column_name = 'image_url'
    `);
    
    if (checkResult.rows.length > 0) {
      console.log('✅ La colonne image_url existe déjà');
      await pool.end();
      return;
    }
    
    // Ajouter la colonne
    console.log('Ajout de la colonne image_url...');
    await pool.query(`
      ALTER TABLE articles_catalogue 
      ADD COLUMN IF NOT EXISTS image_url VARCHAR(500)
    `);
    
    console.log('✅ Colonne image_url ajoutée avec succès');
    
    // Ajouter un index pour améliorer les performances
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_articles_catalogue_image_url 
      ON articles_catalogue(image_url) 
      WHERE image_url IS NOT NULL
    `);
    
    console.log('✅ Index créé avec succès');
    
    await pool.end();
  } catch (error) {
    console.error('❌ Erreur:', error);
    await pool.end();
    process.exit(1);
  }
}

addImageColumn();
