const express = require('express');
const router = express.Router();
const assignmentController = require('../../controllers/faculty/assignmentController');
const { validate } = require('../../middleware/validation');
const { validateAssignmentCreate } = require('../../utils/validators');
const { uploadAssignment } = require('../../middleware/upload');

// Assignment management
router.get('/subjects/:subjectId', assignmentController.getSubjectAssignments);
router.post('/subjects/:subjectId', uploadAssignment, validate(validateAssignmentCreate()), assignmentController.createAssignment);
router.get('/:id', assignmentController.getAssignmentById);
router.put('/:id', assignmentController.updateAssignment);
router.delete('/:id', assignmentController.deleteAssignment);

// Assignment submissions
router.get('/:id/submissions', assignmentController.getSubmissions);
router.get('/:id/submissions/:studentId', assignmentController.getStudentSubmission);
router.put('/:id/submissions/:studentId', assignmentController.gradeSubmission);

// Assignment statistics
router.get('/:id/statistics', assignmentController.getAssignmentStatistics);

module.exports = router;