const express = require('express');
const router = express.Router();
const attendanceController = require('../../controllers/student/attendanceController');

// Attendance view
router.get('/', attendanceController.getMyAttendance);
router.get('/subjects/:subjectId', attendanceController.getSubjectAttendance);
router.get('/summary', attendanceController.getAttendanceSummary);

// Attendance reports
router.get('/reports/monthly', attendanceController.getMonthlyAttendance);
router.get('/reports/semester', attendanceController.getSemesterAttendance);

module.exports = router;