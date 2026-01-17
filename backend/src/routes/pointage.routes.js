import express from 'express';
import {
  getAllPointages,
  getStatutPersonnes,
  getResumesMensuels,
  getStatistiques
} from '../controllers/pointage.controller.js';

const router = express.Router();

// Récupérer tous les pointages
router.get('/', getAllPointages);

// Récupérer le statut actuel de chaque personne (présent/absent aujourd'hui)
router.get('/statut', getStatutPersonnes);

// Récupérer les résumés mensuels
router.get('/resumes', getResumesMensuels);

// Récupérer les statistiques globales
router.get('/stats', getStatistiques);

export default router;
