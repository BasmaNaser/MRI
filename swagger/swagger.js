const swaggerJSDoc = require('swagger-jsdoc');

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
        url: 'http://localhost:5000',
        description: 'Local server'
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
  apis: ['./Routes/*.js'],  
};

module.exports = swaggerJSDoc(options);