const express = require('express');
const router = express.Router();
const departmentController = require('../../controllers/hod/departmentController');
const { validate } = require('../../middleware/validation');
const { validateRequired } = require('../../utils/validators');

// Department management
router.get('/', departmentController.getDepartments);
router.get('/:id', departmentController.getDepartmentById);
router.put('/:id', departmentController.updateDepartment);
router.post('/:id/budget', departmentController.updateBudget);

// Department faculty
router.get('/:departmentId/faculty', departmentController.getDepartmentFaculty);
router.post('/:departmentId/faculty', departmentController.assignFacultyToDepartment);

// Department students
router.get('/:departmentId/students', departmentController.getDepartmentStudents);

// Department courses
router.get('/:departmentId/courses', departmentController.getDepartmentCourses);

module.exports = router;