const express=require('express');
const patientRouter=express.Router();
const uploadFile=require('../Middleware/multerConfig')
const {getProfileController,getAllDoctorsController,logoutController,followDoctorController,getRecentReportsController,
    getDashboardSummaryController,getLatestNotesController,getAllTumorsTypeController,getAllReportsController,uploadScanController
    ,getScanResultController,downloadReportController,deleteReportController,getLatestRecommendationController,
    downloadLatestRecommendationController,uploadPatientImageController,changePasswordController,updateProfileController}=require('../Controllers/patient.controller');
const {validateChangePassword,updateProfileValidation}=require('../Middleware/Validation')
const protect=require('../Middleware/protect')
/**
 * @swagger
 * tags:
 *   name: Patient
 *   description: Patient related APIs
 */

/**
 * @swagger
 * /api/patient/profile:
 *   get:
 *     summary: Get patient profile
 *     tags: [Patient]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Patient profile retrieved successfully
 *       401:
 *         description: Unauthorized
 */
patientRouter.get('/profile', protect('Patient'), getProfileController);

/**
 * @swagger
 * /api/patient/doctors:
 *   get:
 *     summary: Get all doctors
 *     tags: [Patient]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of doctors
 */
patientRouter.get('/doctors', protect('Patient'), getAllDoctorsController);

/**
 * @swagger
 * /api/patient/assigndoctor:
 *   post:
 *     summary: Assign/follow a doctor
 *     tags: [Patient]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               doctorId:
 *                 type: string
 *                 description: Doctor ID to follow
 *     responses:
 *       200:
 *         description: Doctor assigned successfully
 */
patientRouter.post('/assigndoctor', protect('Patient'), followDoctorController);

/**
 * @swagger
 * /api/patient/auth/logout:
 *   post:
 *     summary: Logout patient
 *     tags: [Patient]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
patientRouter.post('/auth/logout', protect('Patient'), logoutController);

/**
 * @swagger
 * /api/patient/dashboard/recent-reports:
 *   get:
 *     summary: Get recent reports for dashboard
 *     tags: [Patient]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recent reports retrieved
 */
patientRouter.get('/dashboard/recent-reports', protect('Patient'), getRecentReportsController);

/**
 * @swagger
 * /api/patient/dashboard/summary:
 *   get:
 *     summary: Get dashboard summary
 *     tags: [Patient]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard summary retrieved
 */
patientRouter.get('/dashboard/summary', protect('Patient'), getDashboardSummaryController);

/**
 * @swagger
 * /api/patient/dashboard/latest-notes:
 *   get:
 *     summary: Get latest notes
 *     tags: [Patient]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Latest notes retrieved
 */
patientRouter.get('/dashboard/latest-notes', protect('Patient'), getLatestNotesController);

/**
 * @swagger
 * /api/patient/tumors:
 *   get:
 *     summary: Get all tumor types
 *     tags: [Patient]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of tumor types
 */
patientRouter.get('/tumors', protect('Patient'), getAllTumorsTypeController);

/**
 * @swagger
 * /api/patient/reports:
 *   get:
 *     summary: Get all reports
 *     tags: [Patient]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in notes
 *       - in: query
 *         name: tumorName
 *         schema:
 *           type: string
 *         description: Filter by tumor type ID
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Reports retrieved successfully
 */
patientRouter.get('/reports', protect('Patient'), getAllReportsController);

/**
 * @swagger
 * /api/patient/scans/upload:
 *   post:
 *     summary: Upload a scan image
 *     tags: [Patient]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               scanImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Scan uploaded successfully
 */
patientRouter.post('/scans/upload', protect('Patient'), uploadFile('scans').single('scanImage'), uploadScanController);

/**
 * @swagger
 * /api/patient/scans/result/{id}:
 *   get:
 *     summary: Get scan result by scan ID
 *     tags: [Patient]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Scan ID
 *     responses:
 *       200:
 *         description: Scan result retrieved
 */
patientRouter.get('/scans/result/:id', protect('Patient'), getScanResultController);

/**
 * @swagger
 * /api/patient/reports/{id}/download:
 *   get:
 *     summary: Download a report
 *     tags: [Patient]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Report ID
 *     responses:
 *       200:
 *         description: Report downloaded
 */
patientRouter.get('/reports/:id/download', protect('Patient'), downloadReportController);

/**
 * @swagger
 * /api/patient/reports/{id}:
 *   delete:
 *     summary: Delete a report
 *     tags: [Patient]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Report ID
 *     responses:
 *       200:
 *         description: Report deleted successfully
 */
patientRouter.delete('/reports/:id', protect('Patient'), deleteReportController);

/**
 * @swagger
 * /api/patient/recommendations/latest:
 *   get:
 *     summary: Get latest recommendation
 *     tags: [Patient]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Latest recommendation retrieved
 */
patientRouter.get('/recommendations/latest', protect('Patient'), getLatestRecommendationController);

/**
 * @swagger
 * /api/patient/recommendations/download:
 *   get:
 *     summary: Download latest recommendation
 *     tags: [Patient]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recommendation downloaded
 */
patientRouter.get('/recommendations/download', protect('Patient'), downloadLatestRecommendationController);

/**
 * @swagger
 * /api/patient/profile/uploadImage:
 *   put:
 *     summary: Upload patient profile image
 *     tags: [Patient]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profileImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile image uploaded successfully
 */
patientRouter.put('/profile/uploadImage', protect('Patient'), uploadFile('patient').single('profileImage'), uploadPatientImageController);

/**
 * @swagger
 * /api/patient/profile/change-password:
 *   put:
 *     summary: Change patient password
 *     tags: [Patient]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *               confirmNewPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed successfully
 */
patientRouter.put('/profile/change-password', protect('Patient'), validateChangePassword, changePasswordController);

/**
 * @swagger
 * /api/patient/profile:
 *   put:
 *     summary: Update patient profile
 *     tags: [Patient]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
patientRouter.put('/profile', protect('Patient'), updateProfileValidation, updateProfileController);

module.exports=patientRouter;