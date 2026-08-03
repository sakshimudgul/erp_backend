const express = require('express');
const router = express.Router();
const visitorController = require('../../controllers/receptionist/visitorController');
const { validate } = require('../../middleware/validation');
const { validateRequired } = require('../../utils/validators');

// Visitor management
router.get('/', visitorController.getVisitors);
router.post('/', visitorController.createVisitor);
router.get('/:id', visitorController.getVisitorById);
router.put('/:id', visitorController.updateVisitor);
router.delete('/:id', visitorController.deleteVisitor);

// Visitor check-in/out
router.post('/:id/check-in', visitorController.checkIn);
router.post('/:id/check-out', visitorController.checkOut);

// Visitor reports
router.get('/reports/daily', visitorController.getDailyVisitors);
router.get('/reports/weekly', visitorController.getWeeklyVisitors);

module.exports = router;