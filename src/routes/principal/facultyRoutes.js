const express = require('express');
const router = express.Router();
const facultyController = require('../../controllers/principal/facultyController');
const { validate } = require('../../middleware/validation');
const { validateFacultyCreate } = require('../../utils/validators');

// Faculty management (Principal level)
router.get('/', facultyController.getAllFaculty);
router.post('/', validate(validateFacultyCreate()), facultyController.createFaculty);
router.get('/:id', facultyController.getFacultyById);
router.put('/:id', facultyController.updateFaculty);
router.delete('/:id', facultyController.deleteFaculty);

// Faculty status management
router.post('/:id/activate', facultyController.activateFaculty);
router.post('/:id/deactivate', facultyController.deactivateFaculty);

// Faculty reports
router.get('/reports/statistics', facultyController.getFacultyStatistics);

module.exports = router;