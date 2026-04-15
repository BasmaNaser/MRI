const express=require('express');
const AdminRouter=express.Router();
const {validateChangePassword,updateProfileValidation}=require('../Middleware/Validation')
const {protectAdmin}=require('../Middleware/protectAdmin')
const {changePassword,updateAdminProfile,getDoctors,createDoctor,getDashboard,getPatients
    ,getProfile,getReports,logout,deleteDoctor,updateDoctor,updateDoctorStatus,
    viewPatient}=require('../Controllers/Admin.controller');
    //sign up only for test
/**
 * @swagger
 * /api/admin/doctors:
 *   get:
 *     summary: Get all doctors
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of doctors
 */
AdminRouter.get('/doctors',protectAdmin(),getDoctors);
/**
 * @swagger
 * /api/admin/doctors:
 *   post:
 *     summary: Create new doctor
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Doctor created successfully
 */
AdminRouter.post('/doctors',protectAdmin(),createDoctor);
/**
 * @swagger
 * /api/admin/doctors/{id}:
 *   put:
 *     summary: Update doctor
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Doctor updated
 */
AdminRouter.put('/doctors/:id',protectAdmin(),updateDoctor);
/**
 * @swagger
 * /api/admin/doctors/{id}/status:
 *   patch:
 *     summary: Update doctor status
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Status updated
 */
AdminRouter.patch('/doctors/:id/status',protectAdmin(),updateDoctorStatus);
/**
 * @swagger
 * /api/admin/doctors/{id}:
 *   delete:
 *     summary: Delete doctor
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Doctor deleted
 */
AdminRouter.delete('/doctors/:id',protectAdmin(),deleteDoctor);
/**
 * @swagger
 * /api/admin/patients:
 *   get:
 *     summary: Get all patients
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of patients
 */
AdminRouter.get('/patients',protectAdmin(),getPatients);
/**
 * @swagger
 * /api/admin/patient/{id}:
 *   get:
 *     summary: View single patient
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Patient details
 */
AdminRouter.get('/patient/:id',protectAdmin(),viewPatient);
/**
 * @swagger
 * /api/admin/reports:
 *   get:
 *     summary: Get reports
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of reports
 */
AdminRouter.get('/reports',protectAdmin(),getReports)
/**
 * @swagger
 * /api/admin/logout:
 *   post:
 *     summary: Logout admin
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
AdminRouter.post('/logout',protectAdmin(),logout);
/**
 * @swagger
 * /api/admin/profile:
 *   get:
 *     summary: Get admin profile
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin profile data
 */
AdminRouter.get('/profile',protectAdmin(),getProfile);
/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Get dashboard analytics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data
 */
AdminRouter.get('/dashboard',protectAdmin(),getDashboard);
/**
 * @swagger
 * /api/admin/profile:
 *   patch:
 *     summary: Update admin profile
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile updated
 */
AdminRouter.patch('/profile',protectAdmin(),updateAdminProfile)
/**
 * @swagger
 * /api/admin/password:
 *   patch:
 *     summary: Change admin password
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Password updated
 */
AdminRouter.patch('/password',protectAdmin(),validateChangePassword,changePassword);

module.exports=AdminRouter;
