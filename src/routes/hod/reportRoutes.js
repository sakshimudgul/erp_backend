const express = require('express');
const router = express.Router();
const reportController = require('../../controllers/hod/reportController');

// Report generation
router.get('/attendance', reportController.generateAttendanceReport);
router.get('/performance', reportController.generatePerformanceReport);
router.get('/faculty-workload', reportController.generateFacultyWorkloadReport);
router.get('/student-progress', reportController.generateStudentProgressReport);
router.get('/department-stats', reportController.getDepartmentStats);

// Export reports
router.get('/export/:reportType', reportController.exportReport);

module.exports = router;