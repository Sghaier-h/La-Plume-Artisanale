/**
 * Google Drive Service — Upload photos catalogue
 *
 * Configuration requise dans .env :
 *   GOOGLE_DRIVE_ENABLED=true|false
 *   GOOGLE_SERVICE_ACCOUNT_JSON=/path/to/service-account-key.json
 *   GOOGLE_DRIVE_FOLDER_ID=<id_dossier_parent_partagé_avec_service_account>
 *
 * Pour partager un dossier Drive avec le service account :
 *   1. Créer un service account dans Google Cloud Console
 *   2. Télécharger le JSON de clé
 *   3. Partager le dossier Drive avec l'email du service account (xxx@xxx.iam.gserviceaccount.com)
 *   4. Copier l'ID du dossier depuis l'URL Drive
 *
 * NOTE : Si GOOGLE_DRIVE_ENABLED=false, le service retourne une erreur claire
 * et le fallback "URL externe" est utilisé.
 */

import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger.js';

let driveClient = null;
let initError = null;

/**
 * Initialise (lazy) le client Google Drive si activé
 */
async function getDriveClient() {
  if (driveClient) return driveClient;
  if (initError) throw initError;

  if (process.env.GOOGLE_DRIVE_ENABLED !== 'true') {
    initError = new Error('Google Drive désactivé (GOOGLE_DRIVE_ENABLED != true)');
    throw initError;
  }

  const keyPath = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!keyPath || !fs.existsSync(keyPath)) {
    initError = new Error(`Fichier service account introuvable : ${keyPath || 'non défini'}`);
    throw initError;
  }

  try {
    const { google } = await import('googleapis');
    const auth = new google.auth.GoogleAuth({
      keyFile: keyPath,
      scopes: ['https://www.googleapis.com/auth/drive']
    });
    const authClient = await auth.getClient();
    driveClient = google.drive({ version: 'v3', auth: authClient });
    logger.info('Google Drive client initialized');
    return driveClient;
  } catch (error) {
    initError = error;
    throw error;
  }
}

/**
 * Upload une photo vers Google Drive
 *
 * @param {Object} params
 * @param {string} params.filePath - Chemin local du fichier
 * @param {string} params.originalName - Nom d'origine du fichier
 * @param {string} params.mimeType - Type MIME
 * @param {string} [params.prefix] - Préfixe pour le nom sur Drive (ex: "ARTICLE-123")
 * @returns {Promise<{ fileId, webViewLink, webContentLink, publicUrl }>}
 */
export async function uploadPhotoToDrive({ filePath, originalName, mimeType, prefix = 'article' }) {
  const drive = await getDriveClient();
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

  if (!folderId) {
    throw new Error('GOOGLE_DRIVE_FOLDER_ID non défini');
  }

  // Nom unique : prefix_timestamp_original
  const ext = path.extname(originalName || '');
  const base = path.basename(originalName || 'photo', ext);
  const fileName = `${prefix}_${Date.now()}_${base}${ext}`.replace(/[^\w\-.]/g, '_');

  const fileMetadata = {
    name: fileName,
    parents: [folderId]
  };

  const media = {
    mimeType: mimeType || 'image/jpeg',
    body: fs.createReadStream(filePath)
  };

  const response = await drive.files.create({
    requestBody: fileMetadata,
    media,
    fields: 'id, name, webViewLink, webContentLink'
  });

  const fileId = response.data.id;

  // Rendre le fichier publiquement accessible (lecture)
  await drive.permissions.create({
    fileId,
    requestBody: {
      role: 'reader',
      type: 'anyone'
    }
  });

  // URL directe pour affichage en <img src=...>
  const publicUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;

  logger.info('Photo uploadée sur Drive', { fileId, fileName });

  return {
    fileId,
    fileName: response.data.name,
    webViewLink: response.data.webViewLink,
    webContentLink: response.data.webContentLink,
    publicUrl
  };
}

/**
 * Supprime une photo Drive par son ID
 */
export async function deletePhotoFromDrive(fileId) {
  const drive = await getDriveClient();
  await drive.files.delete({ fileId });
  logger.info('Photo supprimée de Drive', { fileId });
}

/**
 * Extrait l'ID Drive depuis une URL (plusieurs formats supportés)
 * - https://drive.google.com/file/d/<ID>/view
 * - https://drive.google.com/uc?export=view&id=<ID>
 * - https://drive.google.com/open?id=<ID>
 */
export function extractDriveFileId(url) {
  if (!url) return null;
  const patterns = [
    /\/file\/d\/([^/?]+)/,
    /[?&]id=([^&]+)/,
    /\/d\/([^/]+)/
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

/**
 * Vérifie si le service Drive est disponible
 */
export function isDriveEnabled() {
  return process.env.GOOGLE_DRIVE_ENABLED === 'true'
    && !!process.env.GOOGLE_SERVICE_ACCOUNT_JSON
    && !!process.env.GOOGLE_DRIVE_FOLDER_ID;
}
