const express = require('express');
const router = express.Router();
const studentController = require('../../controllers/principal/studentController');
const { validate } = require('../../middleware/validation');
const { validateStudentCreate } = require('../../utils/validators');

// Student management (Principal level)
router.get('/', studentController.getAllStudents);
router.post('/', validate(validateStudentCreate()), studentController.createStudent);
router.get('/:id', studentController.getStudentById);
router.put('/:id', studentController.updateStudent);
router.delete('/:id', studentController.deleteStudent);

// Student status management
router.post('/:id/activate', studentController.activateStudent);
router.post('/:id/suspend', studentController.suspendStudent);
router.post('/:id/graduate', studentController.graduateStudent);

// Student reports
router.get('/reports/statistics', studentController.getStudentStatistics);

module.exports = router;