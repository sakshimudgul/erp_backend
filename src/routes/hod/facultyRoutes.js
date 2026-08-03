const express = require('express');
const router = express.Router();
const facultyController = require('../../controllers/hod/facultyController');
const { validate } = require('../../middleware/validation');
const { validateFacultyCreate } = require('../../utils/validators');
const { uploadProfileImage } = require('../../middleware/upload');

// Faculty management
router.get('/', facultyController.getFaculty);
router.post('/', validate(validateFacultyCreate()), facultyController.createFaculty);
router.get('/:id', facultyController.getFacultyById);
router.put('/:id', facultyController.updateFaculty);
router.delete('/:id', facultyController.deleteFaculty);

// Faculty assignments
router.post('/:id/subjects', facultyController.assignSubject);
router.delete('/:id/subjects/:subjectId', facultyController.removeSubject);

// Faculty workload
router.get('/:id/workload', facultyController.getFacultyWorkload);
router.put('/:id/workload', facultyController.updateWorkload);

// Faculty leave management
router.get('/:id/leaves', facultyController.getFacultyLeaves);
router.post('/:id/leaves', facultyController.applyLeave);
router.put('/leaves/:leaveId', facultyController.updateLeaveStatus);

module.exports = router;