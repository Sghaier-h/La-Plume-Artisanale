/**
 * Logger structuré avec Winston
 * Remplace tous les console.log/error/warn du projet
 *
 * Usage:
 *   import { logger } from '../utils/logger.js';
 *   logger.info('Serveur démarré', { port: 5000 });
 *   logger.error('Erreur base de données', { code: err.code, message: err.message });
 *   logger.warn('Rate limit atteint', { ip: req.ip });
 */

import winston from 'winston';

const { combine, timestamp, printf, colorize, json } = winston.format;

// Format lisible pour la console en développement
const devFormat = printf(({ level, message, timestamp, ...meta }) => {
  const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
  return `${timestamp} [${level}] ${message}${metaStr}`;
});

// Déterminer le niveau de log selon l'environnement
const logLevel = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'warn' : 'info');

export const logger = winston.createLogger({
  level: logLevel,
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    json()
  ),
  defaultMeta: { service: 'fouta-erp' },
  transports: [
    // Console — format lisible en dev, JSON en prod
    new winston.transports.Console({
      format: process.env.NODE_ENV === 'production'
        ? combine(timestamp(), json())
        : combine(colorize(), timestamp({ format: 'HH:mm:ss' }), devFormat)
    }),
    // Fichier erreurs
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // Fichier combiné
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880,
      maxFiles: 5
    })
  ]
});

// Capturer les exceptions non gérées
logger.exceptions.handle(
  new winston.transports.File({ filename: 'logs/exceptions.log' })
);

export default logger;
