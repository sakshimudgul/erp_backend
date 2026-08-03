const { body, param } = require('express-validator');

const facultyValidation = {
  createFaculty: [
    body('userId')
      .isUUID()
      .withMessage('Invalid user ID'),
    body('departmentId')
      .isUUID()
      .withMessage('Invalid department ID'),
    body('employeeId')
      .notEmpty()
      .withMessage('Employee ID is required')
      .isString()
      .withMessage('Employee ID must be a string')
      .isLength({ max: 50 })
      .withMessage('Employee ID must not exceed 50 characters'),
    body('designation')
      .notEmpty()
      .withMessage('Designation is required')
      .isIn(['professor', 'associate_professor', 'assistant_professor', 'lecturer', 'instructor', 'teaching_assistant'])
      .withMessage('Invalid designation'),
    body('qualification')
      .optional()
      .isString()
      .withMessage('Qualification must be a string'),
    body('specialization')
      .optional()
      .isString()
      .withMessage('Specialization must be a string'),
    body('experience')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Experience must be a positive integer'),
    body('joiningDate')
      .optional()
      .isISO8601()
      .withMessage('Invalid joining date')
  ],

  updateFaculty: [
    param('id')
      .isUUID()
      .withMessage('Invalid faculty ID'),
    body('departmentId')
      .optional()
      .isUUID()
      .withMessage('Invalid department ID'),
    body('designation')
      .optional()
      .isIn(['professor', 'associate_professor', 'assistant_professor', 'lecturer', 'instructor', 'teaching_assistant'])
      .withMessage('Invalid designation'),
    body('qualification')
      .optional()
      .isString()
      .withMessage('Qualification must be a string'),
    body('specialization')
      .optional()
      .isString()
      .withMessage('Specialization must be a string'),
    body('experience')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Experience must be a positive integer'),
    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be a boolean'),
    body('isHod')
      .optional()
      .isBoolean()
      .withMessage('isHod must be a boolean')
  ],

  getFacultyById: [
    param('id')
      .isUUID()
      .withMessage('Invalid faculty ID')
  ],

  deleteFaculty: [
    param('id')
      .isUUID()
      .withMessage('Invalid faculty ID')
  ],

  assignSubject: [
    param('id')
      .isUUID()
      .withMessage('Invalid faculty ID'),
    body('subjectId')
      .isUUID()
      .withMessage('Invalid subject ID')
  ],

  updateWorkload: [
    param('id')
      .isUUID()
      .withMessage('Invalid faculty ID'),
    body('maxHoursPerWeek')
      .optional()
      .isInt({ min: 1, max: 40 })
      .withMessage('Max hours per week must be between 1 and 40')
  ],

  applyLeave: [
    param('id')
      .isUUID()
      .withMessage('Invalid faculty ID'),
    body('startDate')
      .notEmpty()
      .withMessage('Start date is required')
      .isISO8601()
      .withMessage('Invalid start date'),
    body('endDate')
      .notEmpty()
      .withMessage('End date is required')
      .isISO8601()
      .withMessage('Invalid end date'),
    body('reason')
      .notEmpty()
      .withMessage('Reason is required')
      .isString()
      .withMessage('Reason must be a string')
  ]
};

module.exports = facultyValidation;