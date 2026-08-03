const express = require('express');
const router = express.Router();
const subjectController = require('../../controllers/hod/subjectController');
const { validate } = require('../../middleware/validation');
const { validateRequired } = require('../../utils/validators');

// Subject management
router.get('/', subjectController.getSubjects);
router.post('/', subjectController.createSubject);
router.get('/:id', subjectController.getSubjectById);
router.put('/:id', subjectController.updateSubject);
router.delete('/:id', subjectController.deleteSubject);

// Subject assignments
router.get('/:subjectId/faculty', subjectController.getAssignedFaculty);
router.post('/:subjectId/faculty/:facultyId', subjectController.assignFaculty);
router.delete('/:subjectId/faculty/:facultyId', subjectController.removeFacultyAssignment);

// Subject schedule
router.get('/:subjectId/timetable', subjectController.getSubjectTimetable);
router.post('/:subjectId/timetable', subjectController.addTimetableSlot);
router.delete('/:subjectId/timetable/:slotId', subjectController.removeTimetableSlot);

module.exports = router;