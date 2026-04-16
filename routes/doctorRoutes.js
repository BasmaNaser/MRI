const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const { protect } = require('../middleware/authMiddleware');

// Base route: /api/doctor

// --- Public Routes ---
router.post('/register', doctorController.registerDoctor);
router.post('/login', doctorController.loginDoctor);



// 1. Dashboard
router.get('/dashboard', protect, doctorController.getDashboardData);

// 2. Patients List
router.get('/patients', protect, doctorController.getAllPatients);
router.post('/patients', protect, doctorController.addPatient);

// 3. View Details Patient
router.get('/patients/:patientId', protect, doctorController.getPatientDetails);

// 4. Patient Reports
router.get('/patients/:patientId/reports', protect, doctorController.getPatientReports);

// 5. Send Recommendation
router.post('/patients/:patientId/recommendation', protect, doctorController.createRecommendation);

// 6. Doctor Profile
router.get('/profile', protect, doctorController.getDoctorProfile);

// 7. Notes
router.post('/notes', protect, doctorController.addNote);
router.get('/notes', protect, doctorController.getNotes);
router.put('/notes/:noteId', protect, doctorController.updateNote);
router.delete('/notes/:noteId', protect, doctorController.deleteNote);

// 8. Account Settings
router.put('/profile/change-password', protect, doctorController.changePassword);
router.delete('/profile/delete-account', protect, doctorController.deleteAccount);

// 9. Doctor Reports (All reports for the doctor)
router.get('/reports', protect, doctorController.getAllReports);

// 10. AI Recommendations (Inbox for review)
router.get('/recommendations', protect, doctorController.getPendingRecommendations);
router.put('/recommendations/:reportId', protect, doctorController.updateRecommendationStatus);

module.exports = router;
