const express=require('express');
const patientRouter=express.Router();
const {getProfileController}=require('../Controllers/patient.controller');
const protect=require('../Middleware/protect')
patientRouter.get('/profile',protect('Patient'),getProfileController);

module.exports=patientRouter;