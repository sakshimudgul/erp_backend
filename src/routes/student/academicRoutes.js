const express = require('express');
const router = express.Router();
const academicController = require('../../controllers/student/academicController');

// Academic information
router.get('/courses', academicController.getMyCourses);
router.get('/subjects', academicController.getMySubjects);
router.get('/subjects/:id', academicController.getSubjectDetails);

// Academic progress
router.get('/progress', academicController.getAcademicProgress);
router.get('/semester', academicController.getSemesterDetails);

// Enrollments
router.get('/enrollments', academicController.getEnrollments);
router.post('/enrollments', academicController.enrollInSubject);
router.delete('/enrollments/:id', academicController.dropSubject);

module.exports = router;