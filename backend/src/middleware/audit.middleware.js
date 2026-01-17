import { pool } from '../utils/db.js';

/**
 * Middleware d'audit pour tracer automatiquement toutes les modifications
 */
export const auditMiddleware = async (req, res, next) => {
  // Sauvegarder la méthode originale send pour intercepter les réponses
  const originalSend = res.json;
  const originalSendStatus = res.sendStatus;
  
  // Variables pour stocker les informations d'audit
  let auditData = {
    method: req.method,
    endpoint: req.originalUrl || req.url,
    ip_address: req.ip || req.connection.remoteAddress,
    user_agent: req.get('user-agent'),
    user_id: req.user?.id ? parseInt(req.user.id) : null,
    user_email: req.user?.email || null,
    user_role: req.user?.role || null
  };

  // Intercepter la méthode json pour capturer les réponses
  res.json = function(body) {
    // Si c'est une opération qui modifie des données, enregistrer l'audit
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      try {
        // Détecter la table et l'ID à partir de l'URL et du body
        const tableInfo = extractTableInfo(req.originalUrl, req.body);
        
        if (tableInfo && body?.success !== false) {
          // Loguer l'audit de manière asynchrone (ne pas bloquer la réponse)
          logAudit({
            ...auditData,
            action: getActionFromMethod(req.method),
            table_name: tableInfo.table,
            record_id: tableInfo.id || body.data?.id || body.data?.id_devis || body.data?.id_facture || body.data?.id_bl || body.data?.id_avoir || body.data?.id_retour || body.data?.id_utilisateur || body.data?.id_commande || body.data?.id_of || body.data?.id_client || body.data?.id_fournisseur || body.data?.id_article || null,
            record_identifier: tableInfo.identifier || null,
            old_values: req.body._oldValues || null, // Si les anciennes valeurs sont passées
            new_values: req.method === 'DELETE' ? null : (req.body._auditValues || req.body || null)
          }).catch(err => {
            console.error('Erreur lors de l\'enregistrement de l\'audit:', err);
          });
        }
      } catch (error) {
        console.error('Erreur dans auditMiddleware:', error);
      }
    }
    
    // Appeler la méthode originale
    return originalSend.call(this, body);
  };

  res.sendStatus = function(statusCode) {
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) && statusCode < 400) {
      try {
        const tableInfo = extractTableInfo(req.originalUrl, req.body);
        if (tableInfo) {
          logAudit({
            ...auditData,
            action: getActionFromMethod(req.method),
            table_name: tableInfo.table,
            record_id: tableInfo.id || null,
            record_identifier: tableInfo.identifier || null,
            new_values: req.method === 'DELETE' ? null : req.body || null
          }).catch(err => {
            console.error('Erreur lors de l\'enregistrement de l\'audit:', err);
          });
        }
      } catch (error) {
        console.error('Erreur dans auditMiddleware:', error);
      }
    }
    return originalSendStatus.call(this, statusCode);
  };

  next();
};

/**
 * Extraire les informations de table à partir de l'URL
 */
function extractTableInfo(url, body) {
  const urlLower = url.toLowerCase();
  
  // Mapping des URLs vers les noms de tables
  const urlToTable = {
    '/api/devis': 'devis',
    '/api/factures': 'factures',
    '/api/bons-livraison': 'bons_livraison',
    '/api/avoirs': 'avoirs',
    '/api/bons-retour': 'bons_retour',
    '/api/clients': 'clients',
    '/api/fournisseurs': 'fournisseurs',
    '/api/commandes': 'commandes',
    '/api/of': 'of',
    '/api/articles': 'articles_catalogue',
    '/api/articles-catalogue': 'articles_catalogue',
    '/api/utilisateurs': 'utilisateurs',
    '/api/matieres-premieres': 'matieres_premieres',
    '/api/machines': 'machines',
    '/api/modeles': 'modeles',
    '/api/stock': 'stock',
    '/api/parametrage': 'parametres_systeme'
  };

  // Chercher la correspondance
  for (const [path, table] of Object.entries(urlToTable)) {
    if (urlLower.includes(path)) {
      // Extraire l'ID depuis l'URL (format /api/table/:id)
      const idMatch = url.match(/\/(\d+)(?:\/|$)/);
      const id = idMatch ? parseInt(idMatch[1]) : null;
      
      // Extraire l'identifiant lisible depuis le body
      let identifier = null;
      if (body) {
        identifier = body.numero_devis || body.numero_facture || body.numero_bl || 
                    body.numero_avoir || body.numero_retour || body.numero_commande ||
                    body.numero_of || body.email || body.reference || 
                    body.nom || body.nom_fournisseur || body.nom_client || null;
      }

      return { table, id, identifier };
    }
  }

  return null;
}

/**
 * Convertir la méthode HTTP en action d'audit
 */
function getActionFromMethod(method) {
  const methodMap = {
    'POST': 'CREATE',
    'PUT': 'UPDATE',
    'PATCH': 'UPDATE',
    'DELETE': 'DELETE',
    'GET': 'READ'
  };
  return methodMap[method] || 'UNKNOWN';
}

/**
 * Enregistrer un log d'audit dans la base de données
 */
async function logAudit(auditData) {
  try {
    await pool.query(`
      INSERT INTO audit_log (
        action, user_id, user_email, user_role,
        table_name, record_id, record_identifier,
        old_values, new_values,
        ip_address, user_agent, endpoint, method
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    `, [
      auditData.action,
      auditData.user_id,
      auditData.user_email,
      auditData.user_role,
      auditData.table_name,
      auditData.record_id,
      auditData.record_identifier,
      auditData.old_values ? JSON.stringify(auditData.old_values) : null,
      auditData.new_values ? JSON.stringify(auditData.new_values) : null,
      auditData.ip_address,
      auditData.user_agent,
      auditData.endpoint,
      auditData.method
    ]);
  } catch (error) {
    // Ne pas faire échouer la requête si l'audit échoue
    console.error('Erreur lors de l\'enregistrement de l\'audit:', error);
  }
}

/**
 * Helper pour créer un log d'audit manuel depuis un contrôleur
 */
export const createAuditLog = async (options) => {
  await logAudit(options);
};

/**
 * Helper pour enregistrer les anciennes valeurs avant modification
 */
export const captureOldValues = async (tableName, recordId, fieldsToCapture = null) => {
  try {
    // Construire la requête SELECT dynamiquement
    const query = `SELECT * FROM ${tableName} WHERE id_${tableName.split('_')[tableName.split('_').length - 1]} = $1 OR id = $1 LIMIT 1`;
    
    const result = await pool.query(query, [recordId]);
    
    if (result.rows.length === 0) {
      return null;
    }

    const oldValues = result.rows[0];
    
    // Filtrer les champs si spécifié
    if (fieldsToCapture && Array.isArray(fieldsToCapture)) {
      const filtered = {};
      fieldsToCapture.forEach(field => {
        if (oldValues[field] !== undefined) {
          filtered[field] = oldValues[field];
        }
      });
      return filtered;
    }

    return oldValues;
  } catch (error) {
    console.error(`Erreur lors de la capture des anciennes valeurs pour ${tableName}:`, error);
    return null;
  }
};
