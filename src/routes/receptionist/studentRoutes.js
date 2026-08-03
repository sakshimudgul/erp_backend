const express = require('express');
const router = express.Router();
const studentController = require('../../controllers/receptionist/studentController');
const { validate } = require('../../middleware/validation');
const { validateStudentCreate } = require('../../utils/validators');

// Student management (Receptionist level)
router.get('/', studentController.getStudents);
router.post('/', validate(validateStudentCreate()), studentController.createStudent);
router.get('/:id', studentController.getStudentById);
router.put('/:id', studentController.updateStudent);

// Student documents
router.post('/:id/documents', studentController.uploadStudentDocuments);
router.get('/:id/documents', studentController.getStudentDocuments);

// Student ID card
router.get('/:id/id-card', studentController.generateIdCard);

module.exports = router;