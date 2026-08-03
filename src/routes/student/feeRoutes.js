const express = require('express');
const router = express.Router();
const feeController = require('../../controllers/student/feeController');

// Fee management
router.get('/', feeController.getMyFees);
router.get('/:id', feeController.getFeeDetails);
router.post('/:id/pay', feeController.payFee);

// Fee history
router.get('/history', feeController.getPaymentHistory);
router.get('/receipts', feeController.getReceipts);

// Fee status
router.get('/status', feeController.getFeeStatus);

module.exports = router;