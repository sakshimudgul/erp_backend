const express = require('express');
const router = express.Router();
const materialController = require('../../controllers/faculty/materialController');
const { uploadAssignment } = require('../../middleware/upload');

// Material management
router.get('/subjects/:subjectId', materialController.getMaterials);
router.post('/subjects/:subjectId', uploadAssignment, materialController.uploadMaterial);
router.get('/:id', materialController.getMaterialById);
router.put('/:id', materialController.updateMaterial);
router.delete('/:id', materialController.deleteMaterial);

// Material categories
router.get('/categories', materialController.getCategories);
router.post('/categories', materialController.createCategory);

// Material statistics
router.get('/subjects/:subjectId/statistics', materialController.getMaterialStatistics);

module.exports = router;