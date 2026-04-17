const express = require('express');
const router = express.Router();
const doctorController = require('../Controllers/doctorController');
const { protect } = require('../Middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Doctors
 *   description: Doctor management and operations
 */

// Base route: /api/doctor

// --- Public Routes ---

/**
 * @swagger
 * /api/doctor/register:
 *   post:
 *     summary: Register a new doctor
 *     tags: [Doctors]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, specialty]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               specialty:
 *                 type: string
 *               subspecialty:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: Doctor created successfully
 */
router.post('/register', doctorController.registerDoctor);

/**
 * @swagger
 * /api/doctor/login:
 *   post:
 *     summary: Login for doctors
 *     tags: [Doctors]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post('/login', doctorController.loginDoctor);

// --- Protected Routes (Require Token) ---
// Note: We no longer need :doctorId in the query params since the ID comes from the Token.

// 1. Dashboard
/**
 * @swagger
 * /api/doctor/dashboard:
 *   get:
 *     summary: Get doctor's dashboard data
 *     tags: [Doctors]
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
 */
router.get('/dashboard', protect, doctorController.getDashboardData);

// 2. Patients List
/**
 * @swagger
 * /api/doctor/patients:
 *   get:
 *     summary: Get all patients for the authenticated doctor
 *     tags: [Doctors]
 *     responses:
 *       200:
 *         description: List of patients
 *   post:
 *     summary: Add a patient
 *     tags: [Doctors]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, age, gender]
 *             properties:
 *               name:
 *                 type: string
 *               age:
 *                 type: number
 *               gender:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: Patient added successfully
 */
router.get('/patients', protect, doctorController.getAllPatients);
router.post('/patients', protect, doctorController.addPatient);

// 3. View Details Patient
/**
 * @swagger
 * /api/doctor/patients/{patientId}:
 *   get:
 *     summary: Get details of a specific patient
 *     tags: [Doctors]
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *         description: The patient ID
 *     responses:
 *       200:
 *         description: Patient details
 */
router.get('/patients/:patientId', protect, doctorController.getPatientDetails);

// 4. Patient Reports
/**
 * @swagger
 * /api/doctor/patients/{patientId}/reports:
 *   get:
 *     summary: Get all reports for a specific patient
 *     tags: [Doctors]
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Patient reports
 */
router.get('/patients/:patientId/reports', protect, doctorController.getPatientReports);

// 5. Send Recommendation
/**
 * @swagger
 * /api/doctor/patients/{patientId}/recommendation:
 *   post:
 *     summary: Create a recommendation for a patient
 *     tags: [Doctors]
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [text]
 *             properties:
 *               text:
 *                 type: string
 *     responses:
 *       201:
 *         description: Recommendation created successfully
 */
router.post('/patients/:patientId/recommendation', protect, doctorController.createRecommendation);

// 6. Doctor Profile
/**
 * @swagger
 * /api/doctor/profile:
 *   get:
 *     summary: Get doctor's profile
 *     tags: [Doctors]
 *     responses:
 *       200:
 *         description: Doctor profile data
 */
router.get('/profile', protect, doctorController.getDoctorProfile);

// 7. Notes
/**
 * @swagger
 * /api/doctor/notes:
 *   post:
 *     summary: Add a new note
 *     tags: [Doctors]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, content]
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Note added successfully
 *   get:
 *     summary: Get all notes
 *     tags: [Doctors]
 *     responses:
 *       200:
 *         description: List of notes
 */
router.post('/notes', protect, doctorController.addNote);
router.get('/notes', protect, doctorController.getNotes);

/**
 * @swagger
 * /api/doctor/notes/{noteId}:
 *   put:
 *     summary: Update a note
 *     tags: [Doctors]
 *     parameters:
 *       - in: path
 *         name: noteId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Note updated
 *   delete:
 *     summary: Delete a note
 *     tags: [Doctors]
 *     parameters:
 *       - in: path
 *         name: noteId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Note deleted
 */
router.put('/notes/:noteId', protect, doctorController.updateNote);
router.delete('/notes/:noteId', protect, doctorController.deleteNote);

// 8. Account Settings
/**
 * @swagger
 * /api/doctor/profile/change-password:
 *   put:
 *     summary: Change doctor password
 *     tags: [Doctors]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password updated
 */
router.put('/profile/change-password', protect, doctorController.changePassword);

/**
 * @swagger
 * /api/doctor/profile/delete-account:
 *   delete:
 *     summary: Delete doctor account
 *     tags: [Doctors]
 *     responses:
 *       200:
 *         description: Account deleted
 */
router.delete('/profile/delete-account', protect, doctorController.deleteAccount);

// 9. Doctor Reports (All reports for the doctor)
/**
 * @swagger
 * /api/doctor/reports:
 *   get:
 *     summary: Get all reports linked to this doctor
 *     tags: [Doctors]
 *     responses:
 *       200:
 *         description: List of reports
 */
router.get('/reports', protect, doctorController.getAllReports);

// 10. AI Recommendations (Inbox for review)
/**
 * @swagger
 * /api/doctor/recommendations:
 *   get:
 *     summary: Get pending AI recommendations
 *     tags: [Doctors]
 *     responses:
 *       200:
 *         description: List of pending AI recommendations
 */
router.get('/recommendations', protect, doctorController.getPendingRecommendations);

/**
 * @swagger
 * /api/doctor/recommendations/{reportId}:
 *   put:
 *     summary: Update an AI recommendation status
 *     tags: [Doctors]
 *     parameters:
 *       - in: path
 *         name: reportId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [approved, rejected]
 *     responses:
 *       200:
 *         description: Recommendation status updated
 */
router.put('/recommendations/:reportId', protect, doctorController.updateRecommendationStatus);

module.exports = router;
