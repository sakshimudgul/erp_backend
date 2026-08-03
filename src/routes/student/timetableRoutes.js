const express = require('express');
const router = express.Router();
const timetableController = require('../../controllers/student/timetableController');

// Timetable view
router.get('/current', timetableController.getCurrentTimetable);
router.get('/day/:day', timetableController.getDayTimetable);
router.get('/week', timetableController.getWeekTimetable);
router.get('/semester', timetableController.getSemesterTimetable);

// Timetable export
router.get('/export', timetableController.exportTimetable);

module.exports = router;