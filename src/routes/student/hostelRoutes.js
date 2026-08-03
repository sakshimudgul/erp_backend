const express = require('express');
const router = express.Router();
const hostelController = require('../../controllers/student/hostelController');

// Hostel information
router.get('/info', hostelController.getHostelInfo);
router.get('/rooms', hostelController.getAvailableRooms);

// Hostel application
router.post('/apply', hostelController.applyForHostel);
router.get('/application', hostelController.getApplicationStatus);
router.put('/application', hostelController.updateApplication);

// Hostel allocation
router.get('/allocation', hostelController.getAllocationDetails);

module.exports = router;