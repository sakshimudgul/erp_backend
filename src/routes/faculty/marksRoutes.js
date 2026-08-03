const express = require('express');
const router = express.Router();
const marksController = require('../../controllers/faculty/marksController');

// Marks management
router.get('/subjects/:subjectId', marksController.getSubjectMarks);
router.post('/subjects/:subjectId/students/:studentId', marksController.updateMarks);
router.post('/subjects/:subjectId/bulk', marksController.bulkUpdateMarks);

// Marks reports
router.get('/subjects/:subjectId/report', marksController.getMarksReport);
router.get('/subjects/:subjectId/statistics', marksController.getMarksStatistics);

module.exports = router;