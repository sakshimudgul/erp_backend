const express = require('express');
const router = express.Router();
const examController = require('../../controllers/faculty/examController');
const { validate } = require('../../middleware/validation');
const { validateRequired } = require('../../utils/validators');

// Exam management
router.get('/subjects/:subjectId', examController.getSubjectExams);
router.post('/subjects/:subjectId', examController.createExam);
router.get('/:id', examController.getExamById);
router.put('/:id', examController.updateExam);
router.delete('/:id', examController.deleteExam);

// Exam scheduling
router.post('/:id/schedule', examController.scheduleExam);
router.put('/:id/reschedule', examController.rescheduleExam);

// Exam results
router.get('/:id/results', examController.getExamResults);
router.post('/:id/results', examController.uploadResults);

module.exports = router;