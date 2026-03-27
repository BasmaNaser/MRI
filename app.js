const express=require('express');
const app=express();
const userRouter=require('./routes/user.routes');
const logger=require('./Middleware/logger')
const cookieParser = require('cookie-parser');
const swaggerUI = require('swagger-ui-express');
const swaggerSpec = require('./swagger/swagger');
const errorHandler=require('./Middleware/globalErrorHandling');
const cors = require("cors");
const patientRouter = require('./routes/patient.routes');

app.use(cors({
  origin: ["http://localhost:5173","http://localhost:5000"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use('/uploads', express.static('uploads'));
app.use(logger);
app.use(express.json());
app.use(cookieParser());
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));
app.use('/users',userRouter);
app.use('/api/patient',patientRouter)
app.use(errorHandler);

module.exports=app;