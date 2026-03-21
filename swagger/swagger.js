const swaggerJSDoc = require('swagger-jsdoc');
const path=require('path');
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MRI Brain API',
      version: '1.0.0',
      description: 'Authentication APIs for Brain MRI System'
    },
    servers: [
      {
    url: 'https://fc836cad-c071-4840-89ca-c81ed0b1b964-00-3fke9jt1g4iq9.picard.replit.dev/',
        description: 'Replit server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: [path.join(__dirname, '../routes/*.js')]
};

module.exports = swaggerJSDoc(options);