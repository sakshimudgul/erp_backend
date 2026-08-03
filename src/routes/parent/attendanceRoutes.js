const express = require('express');
const router = express.Router();
const attendanceController = require('../../controllers/parent/attendanceController');

// Child attendance
router.get('/children/:childId', attendanceController.getChildAttendance);
router.get('/children/:childId/summary', attendanceController.getChildAttendanceSummary);
router.get('/children/:childId/report', attendanceController.getChildAttendanceReport);

module.exports = router;