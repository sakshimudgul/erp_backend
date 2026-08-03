const express = require('express');
const router = express.Router();
const approvalController = require('../../controllers/hod/approvalController');

// Approval management
router.get('/pending', approvalController.getPendingApprovals);
router.get('/:id', approvalController.getApprovalDetails);
router.put('/:id', approvalController.processApproval);
router.post('/:id/reject', approvalController.rejectApproval);
router.get('/history', approvalController.getApprovalHistory);

module.exports = router;