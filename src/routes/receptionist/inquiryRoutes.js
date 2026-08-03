const express = require('express');
const router = express.Router();
const inquiryController = require('../../controllers/receptionist/inquiryController');
const { validate } = require('../../middleware/validation');
const { validateEmail, validateRequired } = require('../../utils/validators');

// Inquiry management
router.get('/', inquiryController.getInquiries);
router.post('/', inquiryController.createInquiry);
router.get('/:id', inquiryController.getInquiryById);
router.put('/:id', inquiryController.updateInquiry);
router.delete('/:id', inquiryController.deleteInquiry);

// Inquiry response
router.post('/:id/respond', inquiryController.respondToInquiry);

// Inquiry reports
router.get('/reports/summary', inquiryController.getInquirySummary);

module.exports = router;