const express = require('express');
const router = express.Router();
const childController = require('../../controllers/parent/childController');

// Child management
router.get('/', childController.getMyChildren);
router.get('/:id', childController.getChildDetails);

// Child academic info
router.get('/:id/academic', childController.getChildAcademicInfo);
router.get('/:id/subjects', childController.getChildSubjects);

// Child profile
router.get('/:id/profile', childController.getChildProfile);

module.exports = router;