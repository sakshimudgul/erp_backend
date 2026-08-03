const express = require('express');
const router = express.Router();
const hostelController = require('../../controllers/parent/hostelController');

// Child hostel info
router.get('/children/:childId', hostelController.getChildHostelInfo);
router.get('/children/:childId/room', hostelController.getChildRoomDetails);

module.exports = router;