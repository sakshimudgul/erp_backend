const express = require('express');
const router = express.Router();
const attendanceController = require('../../controllers/faculty/attendanceController');
const { validate } = require('../../middleware/validation');
const { validateAttendance } = require('../../utils/validators');

// Attendance management
router.get('/subjects/:subjectId', attendanceController.getSubjectAttendance);
router.post('/subjects/:subjectId/mark', attendanceController.markAttendance);
router.put('/:id', attendanceController.updateAttendance);
router.get('/subjects/:subjectId/report', attendanceController.getAttendanceReport);

// Bulk attendance
router.post('/subjects/:subjectId/bulk-mark', attendanceController.bulkMarkAttendance);

// Attendance statistics
router.get('/subjects/:subjectId/statistics', attendanceController.getAttendanceStatistics);

module.exports = router;