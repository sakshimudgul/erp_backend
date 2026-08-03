const express = require('express');
const router = express.Router();
const analyticsController = require('../../controllers/hod/analyticsController');

// Analytics endpoints
router.get('/dashboard', analyticsController.getDashboardData);
router.get('/attendance-trends', analyticsController.getAttendanceTrends);
router.get('/performance-metrics', analyticsController.getPerformanceMetrics);
router.get('/student-retention', analyticsController.getStudentRetention);
router.get('/faculty-efficiency', analyticsController.getFacultyEfficiency);

module.exports = router;