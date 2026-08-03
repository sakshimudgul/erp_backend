const express = require('express');
const router = express.Router();
const reportController = require('../../controllers/principal/reportController');

// Principal level reports
router.get('/institutional', reportController.generateInstitutionalReport);
router.get('/academic', reportController.generateAcademicReport);
router.get('/financial', reportController.generateFinancialReport);
router.get('/student', reportController.generateStudentReport);
router.get('/faculty', reportController.generateFacultyReport);
router.get('/infrastructure', reportController.generateInfrastructureReport);

// Export reports
router.get('/export/:reportType', reportController.exportReport);

module.exports = router;