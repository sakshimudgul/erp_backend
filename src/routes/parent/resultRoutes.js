const express = require('express');
const router = express.Router();
const resultController = require('../../controllers/parent/resultController');

// Child results
router.get('/children/:childId', resultController.getChildResults);
router.get('/children/:childId/semester/:semester', resultController.getChildSemesterResult);
router.get('/children/:childId/report', resultController.getChildResultReport);

module.exports = router;