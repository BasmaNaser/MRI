const express=require('express');
const AdminRouter=express.Router();
const {validateChangePassword,updateProfileValidation}=require('../Middleware/Validation')
const {protectAdmin}=require('../Middleware/protectAdmin')
const {changePassword,updateAdminProfile,getDoctors,createDoctor,getDashboard,getPatients
    ,getProfile,getReports,logout,deleteDoctor,updateDoctor,updateDoctorStatus,
    viewPatient}=require('../Controllers/Admin.controller');
    //sign up only for test
const{signupAdmin}=require('../Controllers/auth.controller')   ;
AdminRouter.post('/admin/signup',signupAdmin);
/**
 * @swagger
 * /admin/doctors:
 *   get:
 *     summary: Get all doctors
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of doctors
 */
AdminRouter.get('/admin/doctors',protectAdmin('Admin'),getDoctors);
/**
 * @swagger
 * /admin/doctors:
 *   post:
 *     summary: Create new doctor
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Doctor created successfully
 */
AdminRouter.post('/admin/doctors',protectAdmin('Admin'),createDoctor);
/**
 * @swagger
 * /admin/doctors/{id}:
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
AdminRouter.put('/admin/doctors/:id',protectAdmin('Admin'),updateDoctor);
/**
 * @swagger
 * /admin/doctors/{id}/status:
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
AdminRouter.patch('/admin/doctors/:id/status',protectAdmin('Admin'),updateDoctorStatus);
/**
 * @swagger
 * /admin/doctors/{id}:
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
AdminRouter.delete('/admin/doctors/:id',protectAdmin('Admin'),deleteDoctor);
/**
 * @swagger
 * /admin/patients:
 *   get:
 *     summary: Get all patients
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of patients
 */
AdminRouter.get('/admin/patients',protectAdmin('Admin'),getPatients);
/**
 * @swagger
 * /admin/patient/{id}:
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
AdminRouter.get('/admin/patient/:id',protectAdmin('Admin'),viewPatient);
/**
 * @swagger
 * /admin/reports:
 *   get:
 *     summary: Get reports
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of reports
 */
AdminRouter.get('/admin/reports',protectAdmin('Admin'),getReports)
/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout admin
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
AdminRouter.post('/auth/logout',protectAdmin('Admin'),logout);
/**
 * @swagger
 * /admin/profile:
 *   get:
 *     summary: Get admin profile
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin profile data
 */
AdminRouter.get('/admin/profile',protectAdmin('Admin'),getProfile);
/**
 * @swagger
 * /admin/dashboard:
 *   get:
 *     summary: Get dashboard analytics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data
 */
AdminRouter.get('/admin/dashboard',protectAdmin('Admin'),getDashboard);
/**
 * @swagger
 * /admin/profile:
 *   patch:
 *     summary: Update admin profile
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile updated
 */
AdminRouter.patch('/admin/profile',protectAdmin('Admin'),updateAdminProfile)
/**
 * @swagger
 * /admin/password:
 *   patch:
 *     summary: Change admin password
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Password updated
 */
AdminRouter.patch('/admin/password',protectAdmin('Admin'),validateChangePassword,changePassword);

module.exports=AdminRouter;
