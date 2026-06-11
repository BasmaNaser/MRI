const express = require('express');
const router = express.Router();
const doctorController = require('../Controllers/doctorController');
const protect = require('../Middleware/protect');
const { updateProfileValidation } = require('../Middleware/Validation');
const uploadFile = require('../Middleware/multerConfig');

const doctorOnly = protect('Doctor');

/**
 * @swagger
 * tags:
 *   name: Doctors
 *   description: Doctor management and operations
 */

// Base route: /api/doctor

// --- Protected Routes (Require Token) ---
// Note: We no longer need :doctorId in the query params since the ID comes from the Token.

// 1. Dashboard
/**
 * @swagger
 * /api/doctor/dashboard:
 *   get:
 *     summary: Get doctor's dashboard data
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
 */
router.get('/dashboard', doctorOnly, doctorController.getDashboardData);

// 2. Patients List
/**
 * @swagger
 * /api/doctor/patients:
 *   get:
 *     summary: Get all patients for the authenticated doctor
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of patients
 *   post:
 *     summary: Add a patient
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
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
router.get('/patients', doctorOnly, doctorController.getAllPatients);
router.post('/patients', doctorOnly, doctorController.addPatient);

// 3. View Details Patient
/**
 * @swagger
 * /api/doctor/patients/{patientId}:
 *   get:
 *     summary: Get details of a specific patient
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
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
router.get('/patients/:patientId', doctorOnly, doctorController.getPatientDetails);

// 4. Patient Reports
/**
 * @swagger
 * /api/doctor/patients/{patientId}/reports:
 *   get:
 *     summary: Get all reports for a specific patient
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
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
router.get('/patients/:patientId/reports', doctorOnly, doctorController.getPatientReports);

// 5. Send Recommendation
/**
 * @swagger
 * /api/doctor/patients/{patientId}/recommendation:
 *   post:
 *     summary: Create a recommendation for a patient
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
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
 *             required: [recommendation, scan]
 *             properties:
 *               text:
 *                 type: string
 *     responses:
 *       201:
 *         description: Recommendation created successfully
 */
router.post('/patients/:patientId/recommendation', doctorOnly, doctorController.createRecommendation);

// 6. Doctor Profile
/**
 * @swagger
 * /api/doctor/profile:
 *   get:
 *     summary: Get doctor's profile
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Doctor profile data
 */
router.get('/profile', doctorOnly, doctorController.getDoctorProfile);

/**
 * @swagger
 * /api/doctor/profile:
 *   put:
 *     summary: Update doctor's profile
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               specialization:
 *                 type: string
 *               experienceYears:
 *                 type: number
 *               workplace:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               gender:
 *                 type: string
 *                 enum: [Male, Female, Other]
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
router.put('/profile', doctorOnly, updateProfileValidation, doctorController.updateDoctorProfile);

/**
 * @swagger
 * /api/doctor/profile/uploadImage:
 *   put:
 *     summary: Upload doctor profile image
 *     tags: [Doctors]
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
 *       400:
 *         description: Image file is required
 */
router.put('/profile/uploadImage', doctorOnly, (req, res, next) => {
  uploadFile('doctor').single('profileImage')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
}, doctorController.uploadDoctorImage);

// 7. Notes
/**
 * @swagger
 * /api/doctor/notes:
 *   post:
 *     summary: Add a new note
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
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
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of notes
 */
router.post('/notes', doctorOnly, doctorController.addNote);
router.get('/notes', doctorOnly, doctorController.getNotes);

/**
 * @swagger
 * /api/doctor/notes/{noteId}:
 *   put:
 *     summary: Update a note
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
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
 *     security:
 *       - bearerAuth: []
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
router.put('/notes/:noteId', doctorOnly, doctorController.updateNote);
router.delete('/notes/:noteId', doctorOnly, doctorController.deleteNote);

// 8. Account Settings
/**
 * @swagger
 * /api/doctor/profile/change-password:
 *   put:
 *     summary: Change doctor password
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
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
router.put('/profile/change-password', doctorOnly, doctorController.changePassword);

/**
 * @swagger
 * /api/doctor/profile/delete-account:
 *   delete:
 *     summary: Delete doctor account
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account deleted
 */
router.delete('/profile/delete-account', doctorOnly, doctorController.deleteAccount);

// 9. Doctor Reports (All reports for the doctor)
/**
 * @swagger
 * /api/doctor/reports:
 *   get:
 *     summary: Get all reports linked to this doctor
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of reports
 */
router.get('/reports', doctorOnly, doctorController.getAllReports);

// 10. AI Recommendations (Inbox for review)
/**
 * @swagger
 * /api/doctor/recommendations:
 *   get:
 *     summary: Get pending AI recommendations
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of pending AI recommendations
 */
router.get('/recommendations', doctorOnly, doctorController.getPendingRecommendations);

/**
 * @swagger
 * /api/doctor/recommendations/{reportId}:
 *   put:
 *     summary: Update an AI recommendation status
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
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
router.put('/recommendations/:reportId', doctorOnly, doctorController.updateRecommendationStatus);

module.exports = router;
