import express from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { authenticate, requirePermission } from '../../_shared/authMiddleware.js';
import * as C from './controller.js';

const uploadDir = path.resolve(process.cwd(), 'uploads/logos');
fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (_, __, cb) => cb(null, uploadDir),
    filename:    (_, file, cb) => cb(null, `logo-${Date.now()}${path.extname(file.originalname || '.png')}`),
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_, file, cb) => cb(null, /image\/(png|jpe?g|webp|svg\+xml)/.test(file.mimetype)),
});

const router = express.Router();
router.use(authenticate);

router.get   ('/',                    requirePermission('parametres_societe:consulter'), C.get);
router.put   ('/',                    requirePermission('parametres_societe:modifier'),  C.update);
router.post  ('/logo',   upload.single('logo'), requirePermission('parametres_societe:modifier'), C.uploadLogo);

router.post  ('/adresses',            requirePermission('parametres_societe:modifier'), C.upsertAdresse);
router.put   ('/adresses/:id(\\d+)',  requirePermission('parametres_societe:modifier'), C.upsertAdresse);
router.delete('/adresses/:id(\\d+)',  requirePermission('parametres_societe:modifier'), C.deleteAdresse);

router.post  ('/bancaires',           requirePermission('parametres_societe:modifier'), C.upsertBancaire);
router.put   ('/bancaires/:id(\\d+)', requirePermission('parametres_societe:modifier'), C.upsertBancaire);
router.delete('/bancaires/:id(\\d+)', requirePermission('parametres_societe:modifier'), C.deleteBancaire);

export default router;
