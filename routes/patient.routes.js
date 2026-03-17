const express=require('express');
const patientRouter=express.Router();
const uploadFile=require('../Middleware/multerConfig')
const {getProfileController,getAllDoctorsController,logoutController,followDoctorController,getRecentReportsController,
    getDashboardSummaryController,getLatestNotesController,getAllTumorsTypeController,getAllReportsController,uploadScanController
    ,getScanResultController,downloadReportController,deleteReportController,getLatestRecommendationController,
    downloadLatestRecommendationController,uploadPatientImageController,changePasswordController,updateProfileController}=require('../Controllers/patient.controller');
const {validateChangePassword,updateProfileValidation}=require('../Middleware/Validation')
const protect=require('../Middleware/protect')
patientRouter.get('/profile',protect('Patient'),getProfileController);
patientRouter.get('/doctors',protect('Patient'),getAllDoctorsController);
patientRouter.post('/assigndoctor',protect('Patient'),followDoctorController);
patientRouter.post('/auth/logout',protect('Patient'),logoutController);
patientRouter.get('/dashboard/recent-reports',protect('Patient'),getRecentReportsController);
patientRouter.get('/dashboard/summary',protect('Patient'),getDashboardSummaryController);
patientRouter.get('dashboard/latest-notes',protect('Patient'),getLatestNotesController);
patientRouter.get('/tumors',protect('Patient'),getAllTumorsTypeController)
patientRouter.get('/reports',protect('Patient'),getAllReportsController)
patientRouter.get('/scans/upload', protect('Patient'), uploadFile('scans').single('scanImage'),uploadScanController)
patientRouter.get('/scans/result/:id',protect('Patient'),getScanResultController)
patientRouter.get('/reports/:id/download',protect('Patient'),downloadReportController)
patientRouter.delete('/reports/:id',protect('Patient'),deleteReportController)
patientRouter.get('/recommendations/latest',protect('Patient'),getLatestRecommendationController)
patientRouter.get('/recommendations/download', protect, downloadLatestRecommendationController);
patientRouter.put('/profile/uploadImage',protect('Patient'),uploadFile('patient').single('profileImage'),uploadPatientImageController);
patientRouter.put('/profile/change-password',protect('Patient'),validateChangePassword,changePasswordController)
patientRouter.put('/profile/update',protect('Patient'),updateProfileValidation,updateProfileController)


module.exports=patientRouter;