const express = require('express');
const router = express.Router();
const courseController = require('../../controllers/hod/courseController');
const { validate } = require('../../middleware/validation');
const { validateCourseCreate } = require('../../utils/validators');

// Course management
router.get('/', courseController.getCourses);
router.post('/', validate(validateCourseCreate()), courseController.createCourse);
router.get('/:id', courseController.getCourseById);
router.put('/:id', courseController.updateCourse);
router.delete('/:id', courseController.deleteCourse);

// Course subjects
router.get('/:courseId/subjects', courseController.getCourseSubjects);
router.post('/:courseId/subjects/:subjectId', courseController.addSubjectToCourse);
router.delete('/:courseId/subjects/:subjectId', courseController.removeSubjectFromCourse);

// Course students
router.get('/:courseId/students', courseController.getCourseStudents);

// Course curriculum
router.get('/:courseId/curriculum', courseController.getCurriculum);
router.put('/:courseId/curriculum', courseController.updateCurriculum);

module.exports = router;