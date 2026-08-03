const express = require('express');
const router = express.Router();
const teachingController = require('../../controllers/faculty/teachingController');

// Teaching management
router.get('/subjects', teachingController.getMySubjects);
router.get('/subjects/:id/timetable', teachingController.getSubjectTimetable);
router.get('/subjects/:id/students', teachingController.getSubjectStudents);

// Teaching materials
router.get('/subjects/:id/materials', teachingController.getTeachingMaterials);
router.post('/subjects/:id/materials', teachingController.uploadMaterial);
router.delete('/subjects/:id/materials/:materialId', teachingController.deleteMaterial);

// Class management
router.get('/classes/today', teachingController.getTodayClasses);
router.get('/classes/week', teachingController.getWeekClasses);

module.exports = router;