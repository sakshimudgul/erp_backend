const { body, param } = require('express-validator');

const assignmentValidation = {
  createAssignment: [
    param('subjectId')
      .isUUID()
      .withMessage('Invalid subject ID'),
    body('title')
      .notEmpty()
      .withMessage('Title is required')
      .isString()
      .withMessage('Title must be a string')
      .isLength({ max: 200 })
      .withMessage('Title must not exceed 200 characters'),
    body('description')
      .optional()
      .isString()
      .withMessage('Description must be a string'),
    body('maxMarks')
      .notEmpty()
      .withMessage('Maximum marks is required')
      .isInt({ min: 1 })
      .withMessage('Maximum marks must be at least 1'),
    body('dueDate')
      .notEmpty()
      .withMessage('Due date is required')
      .isISO8601()
      .withMessage('Invalid date format')
      .custom((value) => {
        return new Date(value) > new Date();
      })
      .withMessage('Due date must be in the future'),
    body('attachment')
      .optional()
      .isString()
      .withMessage('Attachment must be a string')
  ],

  updateAssignment: [
    param('id')
      .isUUID()
      .withMessage('Invalid assignment ID'),
    body('title')
      .optional()
      .isString()
      .withMessage('Title must be a string')
      .isLength({ max: 200 })
      .withMessage('Title must not exceed 200 characters'),
    body('description')
      .optional()
      .isString()
      .withMessage('Description must be a string'),
    body('maxMarks')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Maximum marks must be at least 1'),
    body('dueDate')
      .optional()
      .isISO8601()
      .withMessage('Invalid date format')
      .custom((value) => {
        return new Date(value) > new Date();
      })
      .withMessage('Due date must be in the future'),
    body('isPublished')
      .optional()
      .isBoolean()
      .withMessage('isPublished must be a boolean')
  ],

  gradeSubmission: [
    param('id')
      .isUUID()
      .withMessage('Invalid assignment ID'),
    param('studentId')
      .isUUID()
      .withMessage('Invalid student ID'),
    body('marks')
      .notEmpty()
      .withMessage('Marks is required')
      .isInt({ min: 0 })
      .withMessage('Marks must be a positive integer'),
    body('feedback')
      .optional()
      .isString()
      .withMessage('Feedback must be a string')
  ],

  getAssignmentById: [
    param('id')
      .isUUID()
      .withMessage('Invalid assignment ID')
  ],

  deleteAssignment: [
    param('id')
      .isUUID()
      .withMessage('Invalid assignment ID')
  ]
};

module.exports = assignmentValidation;