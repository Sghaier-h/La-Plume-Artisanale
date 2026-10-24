/**
 * MrpBOM Controller - Contrôleur pour les BOMs (Bill of Materials)
 */

import { pool } from '../../../src/utils/db.js';
import { logger } from '../../../src/utils/logger.js';

/**
 * Récupérer tous les BOMs
 */
export const getMrpBOMs = async (req, res) => {
  try {
    const { product_id, active } = req.query;
    
    let query = `
      SELECT 
        n.id_nomenclature as id,
        n.id_article as product_id,
        a1.designation as product_name,
        n.version as product_qty,
        n.active as active,
        n.created_at as create_date,
        n.updated_at as write_date,
        COUNT(DISTINCT nl.id) as line_count
      FROM nomenclatures n
      LEFT JOIN articles_catalogue a1 ON n.id_article = a1.id_article
      LEFT JOIN lignes_nomenclature nl ON n.id_nomenclature = nl.id_nomenclature
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 0;
    
    if (product_id) {
      paramCount++;
      query += ` AND n.id_article = $${paramCount}`;
      params.push(product_id);
    }
    
    if (active !== undefined) {
      paramCount++;
      query += ` AND n.actif = $${paramCount}`;
      params.push(active === 'true');
    }
    
    query += ` GROUP BY n.id_nomenclature, a1.designation, n.id_article, n.version, n.active, n.created_at, n.updated_at
               ORDER BY COALESCE(n.updated_at, n.created_at) DESC NULLS LAST, n.id_nomenclature DESC`;
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    logger.error('Erreur récupération BOMs', { error: error.message });
    res.status(500).json({ error: error.message });
  }
};

/**
 * Récupérer un BOM par ID avec ses lignes
 */
export const getMrpBOM = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Récupérer le BOM principal
    const bomResult = await pool.query(
      `SELECT 
        n.id_nomenclature as id,
        n.id_article as product_id,
        a1.designation as product_name,
        a1.id_article as product_tmpl_id,
        n.version as product_qty,
        n.active as active,
        n.created_at as create_date,
        n.updated_at as write_date
      FROM nomenclatures n
      LEFT JOIN articles_catalogue a1 ON n.id_article = a1.id_article
      WHERE n.id_nomenclature = $1`,
      [id]
    );
    
    if (bomResult.rows.length === 0) {
      return res.status(404).json({ error: 'BOM non trouvé' });
    }
    
    const bom = bomResult.rows[0];
    
    // Récupérer les lignes BOM
    const linesResult = await pool.query(
      `SELECT 
        nl.id as id,
        nl.id_article_composant as product_id,
        a2.nom as product_name,
        nl.quantite as product_qty,
        nl.ordre as sequence
      FROM lignes_nomenclature nl
      LEFT JOIN articles_catalogue a2 ON nl.id_article_composant = a2.id_article
      WHERE nl.id_nomenclature = $1
      ORDER BY nl.ordre ASC, nl.id ASC`,
      [id]
    );
    
    bom.bom_line_ids = linesResult.rows;
    
    res.json(bom);
  } catch (error) {
    logger.error('Erreur récupération BOM', { error: error.message });
    res.status(500).json({ error: error.message });
  }
};

/**
 * Créer un nouveau BOM
 */
export const createMrpBOM = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { product_id, product_qty, active, bom_line_ids } = req.body;
    
    // Créer le BOM principal
    const bomResult = await client.query(
      `INSERT INTO nomenclatures (id_article, version, active, created_at, updated_at)
       VALUES ($1, $2, $3, NOW(), NOW())
       RETURNING id_nomenclature`,
      [product_id, product_qty || 1, active !== false]
    );
    
    const bomId = bomResult.rows[0].id_nomenclature;
    
    // Créer les lignes BOM si fournies
    if (bom_line_ids && Array.isArray(bom_line_ids)) {
      for (const line of bom_line_ids) {
        await client.query(
          `INSERT INTO lignes_nomenclature (id_nomenclature, id_article_composant, quantite, sequence)
           VALUES ($1, $2, $3, $4)`,
          [bomId, line.product_id, line.product_qty || 1, line.sequence || 0]
        );
      }
    }
    
    await client.query('COMMIT');
    
    // Récupérer le BOM complet
    const bom = await getMrpBOM({ params: { id: bomId } }, { json: (data) => data });
    
    res.status(201).json(bom);
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Erreur création BOM', { error: error.message });
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
};

/**
 * Mettre à jour un BOM
 */
export const updateMrpBOM = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    const { product_id, product_qty, active, bom_line_ids } = req.body;
    
    // Mettre à jour le BOM principal
    await client.query(
      `UPDATE nomenclatures 
       SET id_article = COALESCE($1, id_article),
           version = COALESCE($2, version),
           active = COALESCE($3, active),
           updated_at = NOW()
       WHERE id_nomenclature = $4`,
      [product_id, product_qty, active, id]
    );
    
    // Mettre à jour les lignes BOM si fournies
    if (bom_line_ids !== undefined) {
      // Supprimer les lignes existantes
      await client.query(
        'DELETE FROM lignes_nomenclature WHERE id_nomenclature = $1',
        [id]
      );
      
      // Recréer les lignes
      if (Array.isArray(bom_line_ids)) {
        for (const line of bom_line_ids) {
          await client.query(
            `INSERT INTO lignes_nomenclature (id_nomenclature, id_article_composant, quantite, sequence)
             VALUES ($1, $2, $3, $4)`,
            [id, line.product_id, line.product_qty || 1, line.sequence || 0]
          );
        }
      }
    }
    
    await client.query('COMMIT');
    
    // Récupérer le BOM complet
    const bom = await getMrpBOM({ params: { id } }, { json: (data) => data });
    
    res.json(bom);
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Erreur mise à jour BOM', { error: error.message });
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
};

/**
 * Supprimer un BOM
 */
export const deleteMrpBOM = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    
    // Supprimer les lignes BOM
    await client.query(
      'DELETE FROM lignes_nomenclature WHERE id_nomenclature = $1',
      [id]
    );
    
    // Supprimer le BOM
    await client.query(
      'DELETE FROM nomenclatures WHERE id_nomenclature = $1',
      [id]
    );
    
    await client.query('COMMIT');
    
    res.json({ success: true });
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Erreur suppression BOM', { error: error.message });
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
};

/**
 * Obtenir la structure hiérarchique d'un BOM
 */
export const getBOMHierarchy = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Fonction récursive pour construire la hiérarchie
    const buildHierarchy = async (bomId, level = 0) => {
      if (level > 10) return null; // Limiter la récursion
      
      const bomResult = await pool.query(
        `SELECT 
          n.id_nomenclature as id,
          n.id_article as product_id,
          a.designation as product_name,
          n.version as product_qty,
          nl.id as line_id,
          nl.id_article_composant as component_id,
          ac.nom as component_name,
          nl.quantite as component_qty,
          nl.ordre as sequence
        FROM nomenclatures n
        LEFT JOIN articles_catalogue a ON n.id_article = a.id_article
        LEFT JOIN lignes_nomenclature nl ON n.id_nomenclature = nl.id_nomenclature
        LEFT JOIN articles ac ON nl.id_article_composant = ac.id_article
        WHERE n.id_nomenclature = $1
        ORDER BY nl.ordre ASC`,
        [bomId]
      );
      
      if (bomResult.rows.length === 0) return null;
      
      const bom = {
        id: bomResult.rows[0].id,
        product_id: bomResult.rows[0].product_id,
        product_name: bomResult.rows[0].product_name,
        product_qty: parseFloat(bomResult.rows[0].product_qty || 1),
        level: level,
        components: []
      };
      
      // Grouper par ligne et construire les composants
      const componentsMap = new Map();
      
      for (const row of bomResult.rows) {
        if (row.component_id) {
          const key = `${row.component_id}_${row.line_id}`;
          
          if (!componentsMap.has(key)) {
            componentsMap.set(key, {
              id: row.line_id,
              product_id: row.component_id,
              product_name: row.component_name,
              product_qty: parseFloat(row.component_qty || 1),
              sequence: row.sequence || 0,
              sub_bom: null
            });
            
            // Vérifier si le composant a un BOM
            const subBOMResult = await pool.query(
              'SELECT id_nomenclature FROM nomenclatures WHERE id_article = $1 LIMIT 1',
              [row.component_id]
            );
            
            if (subBOMResult.rows.length > 0) {
              componentsMap.get(key).sub_bom = await buildHierarchy(
                subBOMResult.rows[0].id_nomenclature,
                level + 1
              );
            }
          }
        }
      }
      
      bom.components = Array.from(componentsMap.values()).sort((a, b) => a.sequence - b.sequence);
      
      return bom;
    };
    
    const hierarchy = await buildHierarchy(parseInt(id));
    
    if (!hierarchy) {
      return res.status(404).json({ error: 'BOM non trouvé' });
    }
    
    res.json(hierarchy);
  } catch (error) {
    logger.error('Erreur récupération hiérarchie BOM', { error: error.message });
    res.status(500).json({ error: error.message });
  }
};

/**
 * Calculer le coût total d'un BOM
 */
export const calculateBOMCost = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Récupérer le BOM avec toutes ses lignes (y compris les sous-BOMs)
    const bomResult = await pool.query(
      `SELECT 
        n.id_nomenclature,
        n.id_article,
        n.version,
        a.prix_vente as product_cost
      FROM nomenclatures n
      LEFT JOIN articles a ON n.id_article_produit = a.id_article
      WHERE n.id_nomenclature = $1`,
      [id]
    );
    
    if (bomResult.rows.length === 0) {
      return res.status(404).json({ error: 'BOM non trouvé' });
    }
    
    const bom = bomResult.rows[0];
    
    // Fonction récursive pour calculer le coût
    const calculateComponentCost = async (componentId, qty) => {
      // Obtenir le coût du composant
      const componentResult = await pool.query(
        'SELECT prix_vente FROM articles_catalogue WHERE id_article = $1',
        [componentId]
      );
      
      let cost = parseFloat(componentResult.rows[0]?.prix_vente || 0);
      
      // Vérifier si le composant a un BOM
      const subBOMResult = await pool.query(
        'SELECT id_nomenclature FROM nomenclatures WHERE id_article_produit = $1 LIMIT 1',
        [componentId]
      );
      
      if (subBOMResult.rows.length > 0) {
        // Calculer le coût via le sous-BOM
        const linesResult = await pool.query(
          `SELECT id_article_composant, quantite 
           FROM lignes_nomenclature 
           WHERE id_nomenclature = $1`,
          [subBOMResult.rows[0].id_nomenclature]
        );
        
        let subCost = 0;
        for (const line of linesResult.rows) {
          const componentCost = await calculateComponentCost(
            line.id_article_composant,
            line.quantite
          );
          subCost += componentCost * parseFloat(line.quantite);
        }
        cost = subCost;
      }
      
      return cost * qty;
    };
    
    // Récupérer les lignes du BOM
    const linesResult = await pool.query(
      `SELECT id_article_composant, quantite 
       FROM lignes_nomenclature 
       WHERE id_nomenclature = $1`,
      [id]
    );
    
    let totalCost = 0;
    const costBreakdown = [];
    
    for (const line of linesResult.rows) {
      const componentCost = await calculateComponentCost(
        line.id_article_composant,
        parseFloat(line.quantite || 1)
      );
      totalCost += componentCost;
      
      const componentResult = await pool.query(
        'SELECT nom FROM articles_catalogue WHERE id_article = $1',
        [line.id_article_composant]
      );
      
      costBreakdown.push({
        component_id: line.id_article_composant,
        component_name: componentResult.rows[0]?.nom || 'Inconnu',
        quantity: parseFloat(line.quantite || 1),
        cost: componentCost
      });
    }
    
    res.json({
      bom_id: id,
      product_id: bom.id_article,
      product_qty: parseFloat(bom.version || 1),
      total_cost: totalCost,
      unit_cost: totalCost / parseFloat(bom.version || 1),
      cost_breakdown: costBreakdown
    });
  } catch (error) {
    logger.error('Erreur calcul coût BOM', { error: error.message });
    res.status(500).json({ error: error.message });
  }
};
