const express = require('express');
const router = express.Router();
const admissionController = require('../../controllers/receptionist/admissionController');
const { validate } = require('../../middleware/validation');
const { validateRequired, validateEmail } = require('../../utils/validators');

// Admission management
router.get('/', admissionController.getAdmissions);
router.post('/', admissionController.createAdmission);
router.get('/:id', admissionController.getAdmissionById);
router.put('/:id', admissionController.updateAdmission);
router.delete('/:id', admissionController.deleteAdmission);

// Admission documents
router.post('/:id/documents', admissionController.uploadDocuments);
router.delete('/:id/documents/:documentId', admissionController.deleteDocument);

// Admission status
router.put('/:id/status', admissionController.updateAdmissionStatus);

module.exports = router;