const express = require('express');
const router = express.Router();
const resultController = require('../../controllers/student/resultController');

// Results view
router.get('/', resultController.getMyResults);
router.get('/semesters', resultController.getSemesterResults);
router.get('/subjects/:subjectId', resultController.getSubjectResults);
router.get('/semester/:semester', resultController.getSemesterResult);

// Result reports
router.get('/reports/transcript', resultController.getTranscript);
router.get('/reports/gpa', resultController.getGPAReport);

module.exports = router;