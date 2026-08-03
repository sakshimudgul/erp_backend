const { body, param } = require('express-validator');

const departmentValidation = {
  createDepartment: [
    body('code')
      .notEmpty()
      .withMessage('Department code is required')
      .isString()
      .withMessage('Department code must be a string')
      .isLength({ max: 20 })
      .withMessage('Department code must not exceed 20 characters'),
    body('name')
      .notEmpty()
      .withMessage('Department name is required')
      .isString()
      .withMessage('Department name must be a string')
      .isLength({ max: 100 })
      .withMessage('Department name must not exceed 100 characters'),
    body('description')
      .optional()
      .isString()
      .withMessage('Description must be a string'),
    body('establishedYear')
      .optional()
      .isInt({ min: 1900, max: new Date().getFullYear() })
      .withMessage('Invalid established year'),
    body('budget')
      .optional()
      .isDecimal()
      .withMessage('Budget must be a decimal number')
  ],

  updateDepartment: [
    param('id')
      .isUUID()
      .withMessage('Invalid department ID'),
    body('code')
      .optional()
      .isString()
      .withMessage('Department code must be a string')
      .isLength({ max: 20 })
      .withMessage('Department code must not exceed 20 characters'),
    body('name')
      .optional()
      .isString()
      .withMessage('Department name must be a string')
      .isLength({ max: 100 })
      .withMessage('Department name must not exceed 100 characters'),
    body('description')
      .optional()
      .isString()
      .withMessage('Description must be a string'),
    body('establishedYear')
      .optional()
      .isInt({ min: 1900, max: new Date().getFullYear() })
      .withMessage('Invalid established year'),
    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be a boolean')
  ],

  assignHead: [
    param('id')
      .isUUID()
      .withMessage('Invalid department ID'),
    body('facultyId')
      .isUUID()
      .withMessage('Invalid faculty ID')
  ],

  updateBudget: [
    param('id')
      .isUUID()
      .withMessage('Invalid department ID'),
    body('budget')
      .notEmpty()
      .withMessage('Budget is required')
      .isDecimal()
      .withMessage('Budget must be a decimal number')
  ],

  getDepartmentById: [
    param('id')
      .isUUID()
      .withMessage('Invalid department ID')
  ],

  deleteDepartment: [
    param('id')
      .isUUID()
      .withMessage('Invalid department ID')
  ]
};

module.exports = departmentValidation;