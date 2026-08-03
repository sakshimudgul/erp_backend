const express = require('express');
const router = express.Router();
const feeController = require('../../controllers/principal/feeController');

// Fee structure management
router.get('/structure', feeController.getFeeStructure);
router.put('/structure', feeController.updateFeeStructure);

// Fee collection
router.get('/collections', feeController.getFeeCollections);
router.get('/collections/:id', feeController.getFeeCollectionById);

// Fee reports
router.get('/reports/summary', feeController.getFeeSummary);
router.get('/reports/collection', feeController.getCollectionReport);
router.get('/reports/pending', feeController.getPendingFees);

module.exports = router;