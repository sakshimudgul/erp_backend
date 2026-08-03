const express = require('express');
const router = express.Router();
const departmentController = require('../../controllers/principal/departmentController');
const { validate } = require('../../middleware/validation');
const { validateRequired } = require('../../utils/validators');

// Department management (Principal level)
router.get('/', departmentController.getAllDepartments);
router.post('/', departmentController.createDepartment);
router.get('/:id', departmentController.getDepartmentById);
router.put('/:id', departmentController.updateDepartment);
router.delete('/:id', departmentController.deleteDepartment);

// Department head management
router.post('/:id/head', departmentController.assignHead);
router.delete('/:id/head', departmentController.removeHead);

// Department budget
router.get('/:id/budget', departmentController.getDepartmentBudget);
router.put('/:id/budget', departmentController.updateDepartmentBudget);

module.exports = router;