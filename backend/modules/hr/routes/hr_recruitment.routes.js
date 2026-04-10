/**
 * HR Recruitment Routes
 */

import express from 'express';
import hrRecruitmentController from '../controllers/hr_recruitment.controller.js';
import { pool } from '../../../src/utils/db.js';

const router = express.Router();

hrRecruitmentController(router, pool);

export default router;
