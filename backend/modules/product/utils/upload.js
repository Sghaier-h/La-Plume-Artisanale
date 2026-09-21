/**
 * Configuration Multer pour upload d'images produits
 */

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Créer le dossier uploads s'il n'existe pas
const uploadDir = path.join(__dirname, '../../../../uploads/products');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuration du stockage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `product-${uniqueSuffix}${ext}`);
  }
});

// Filtre des types de fichiers
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|svg/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Seules les images sont autorisées (jpeg, jpg, png, gif, webp, svg)'));
  }
};

// Configuration multer
export const upload = multer({
  storage: storage,
  limits: { 
    fileSize: 10 * 1024 * 1024 // 10MB max
  },
  fileFilter: fileFilter
});

// Middleware pour upload d'une seule image
export const uploadSingle = upload.single('image');

// Middleware pour upload de plusieurs images
export const uploadMultiple = upload.array('images', 10);

// Fonction pour obtenir l'URL de l'image
export const getImageUrl = (filename) => {
  if (!filename) return null;
  // Si c'est déjà une URL complète, la retourner
  if (filename.startsWith('http://') || filename.startsWith('https://')) {
    return filename;
  }
  // Sinon, construire l'URL relative
  return `/uploads/products/${path.basename(filename)}`;
};

// Fonction pour supprimer un fichier
export const deleteImageFile = (filename) => {
  if (!filename) return;
  const filePath = path.join(uploadDir, path.basename(filename));
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};
