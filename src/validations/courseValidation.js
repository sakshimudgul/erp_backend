const { body, param } = require('express-validator');

const courseValidation = {
  createCourse: [
    body('code')
      .notEmpty()
      .withMessage('Course code is required')
      .isString()
      .withMessage('Course code must be a string')
      .isLength({ max: 20 })
      .withMessage('Course code must not exceed 20 characters'),
    body('name')
      .notEmpty()
      .withMessage('Course name is required')
      .isString()
      .withMessage('Course name must be a string')
      .isLength({ max: 100 })
      .withMessage('Course name must not exceed 100 characters'),
    body('departmentId')
      .isUUID()
      .withMessage('Invalid department ID'),
    body('duration')
      .notEmpty()
      .withMessage('Duration is required')
      .isInt({ min: 1, max: 6 })
      .withMessage('Duration must be between 1 and 6 years'),
    body('totalSemesters')
      .optional()
      .isInt({ min: 1, max: 12 })
      .withMessage('Total semesters must be between 1 and 12'),
    body('fees')
      .optional()
      .isDecimal()
      .withMessage('Fees must be a decimal number'),
    body('description')
      .optional()
      .isString()
      .withMessage('Description must be a string')
  ],

  updateCourse: [
    param('id')
      .isUUID()
      .withMessage('Invalid course ID'),
    body('code')
      .optional()
      .isString()
      .withMessage('Course code must be a string')
      .isLength({ max: 20 })
      .withMessage('Course code must not exceed 20 characters'),
    body('name')
      .optional()
      .isString()
      .withMessage('Course name must be a string')
      .isLength({ max: 100 })
      .withMessage('Course name must not exceed 100 characters'),
    body('departmentId')
      .optional()
      .isUUID()
      .withMessage('Invalid department ID'),
    body('duration')
      .optional()
      .isInt({ min: 1, max: 6 })
      .withMessage('Duration must be between 1 and 6 years'),
    body('totalSemesters')
      .optional()
      .isInt({ min: 1, max: 12 })
      .withMessage('Total semesters must be between 1 and 12'),
    body('fees')
      .optional()
      .isDecimal()
      .withMessage('Fees must be a decimal number'),
    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be a boolean')
  ],

  getCourseById: [
    param('id')
      .isUUID()
      .withMessage('Invalid course ID')
  ],

  deleteCourse: [
    param('id')
      .isUUID()
      .withMessage('Invalid course ID')
  ],

  addSubject: [
    param('courseId')
      .isUUID()
      .withMessage('Invalid course ID'),
    param('subjectId')
      .isUUID()
      .withMessage('Invalid subject ID')
  ],

  updateCurriculum: [
    param('courseId')
      .isUUID()
      .withMessage('Invalid course ID'),
    body('subjects')
      .isArray()
      .withMessage('Subjects must be an array')
      .custom((subjects) => {
        return subjects.every(s => s.subjectId && s.semester);
      })
      .withMessage('Each subject must have subjectId and semester')
  ]
};

module.exports = courseValidation;