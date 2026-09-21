/**
 * Configuration Swagger/OpenAPI pour documentation API
 * 
 * Pour utiliser :
 * 1. Installer swagger-ui-express et swagger-jsdoc :
 *    npm install swagger-ui-express swagger-jsdoc
 * 
 * 2. Dans server.js, ajouter :
 *    import swaggerUi from 'swagger-ui-express';
 *    import YAML from 'yamljs';
 *    import { fileURLToPath } from 'url';
 *    import path from 'path';
 *    
 *    const __filename = fileURLToPath(import.meta.url);
 *    const __dirname = path.dirname(__filename);
 *    const swaggerDocument = YAML.load(path.join(__dirname, 'docs', 'swagger.yaml'));
 *    
 *    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
 * 
 * 3. Accéder à la documentation : http://localhost:5000/api-docs
 */

import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'API ERP La Plume Artisanale',
      version: '1.0.0',
      description: 'Documentation complète de l\'API REST',
      contact: {
        name: 'Support API',
        email: 'support@laplume-artisanale.tn'
      }
    },
    servers: [
      {
        url: 'https://fabrication.laplume-artisanale.tn/api',
        description: 'Production'
      },
      {
        url: 'http://localhost:5000/api',
        description: 'Développement local'
      }
    ]
  },
  apis: [
    './src/routes/*.js',
    './src/controllers/*.controller.js'
  ]
};

export const swaggerSpec = swaggerJsdoc(options);
