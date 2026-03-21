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
    url: '/',
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