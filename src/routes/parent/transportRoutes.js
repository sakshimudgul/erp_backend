const express = require('express');
const router = express.Router();
const transportController = require('../../controllers/parent/transportController');

// Child transport
router.get('/children/:childId', transportController.getChildTransportInfo);
router.get('/children/:childId/route', transportController.getChildRouteDetails);

module.exports = router;