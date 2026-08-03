const express = require('express');
const router = express.Router();
const feeController = require('../../controllers/parent/feeController');

// Child fees
router.get('/children/:childId', feeController.getChildFees);
router.get('/children/:childId/:feeId', feeController.getChildFeeDetails);
router.post('/children/:childId/:feeId/pay', feeController.payChildFee);

// Fee history
router.get('/children/:childId/history', feeController.getChildPaymentHistory);

module.exports = router;