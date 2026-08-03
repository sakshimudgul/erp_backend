const express = require('express');
const router = express.Router();
const admissionController = require('../../controllers/principal/admissionController');
const { validate } = require('../../middleware/validation');
const { validateRequired, validateEmail } = require('../../utils/validators');

// Admission management
router.get('/', admissionController.getAdmissions);
router.get('/pending', admissionController.getPendingAdmissions);
router.get('/:id', admissionController.getAdmissionById);
router.post('/', admissionController.createAdmission);
router.put('/:id', admissionController.updateAdmission);
router.delete('/:id', admissionController.deleteAdmission);

// Admission processing
router.post('/:id/process', admissionController.processAdmission);
router.post('/:id/approve', admissionController.approveAdmission);
router.post('/:id/reject', admissionController.rejectAdmission);

// Admission reports
router.get('/reports/summary', admissionController.getAdmissionSummary);

module.exports = router;