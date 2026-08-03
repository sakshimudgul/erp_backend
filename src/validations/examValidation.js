const { body, param } = require('express-validator');

const examValidation = {
  createExam: [
    param('subjectId')
      .isUUID()
      .withMessage('Invalid subject ID'),
    body('name')
      .notEmpty()
      .withMessage('Exam name is required')
      .isString()
      .withMessage('Exam name must be a string')
      .isLength({ max: 100 })
      .withMessage('Exam name must not exceed 100 characters'),
    body('type')
      .notEmpty()
      .withMessage('Exam type is required')
      .isIn(['mid_term', 'final', 'quiz', 'practical', 'viva', 'comprehensive'])
      .withMessage('Invalid exam type'),
    body('maxMarks')
      .notEmpty()
      .withMessage('Maximum marks is required')
      .isInt({ min: 1 })
      .withMessage('Maximum marks must be at least 1'),
    body('passingMarks')
      .notEmpty()
      .withMessage('Passing marks is required')
      .isInt({ min: 0 })
      .withMessage('Passing marks must be a positive integer'),
    body('date')
      .notEmpty()
      .withMessage('Exam date is required')
      .isISO8601()
      .withMessage('Invalid date format')
      .custom((value) => {
        return new Date(value) > new Date();
      })
      .withMessage('Exam date must be in the future'),
    body('duration')
      .notEmpty()
      .withMessage('Duration is required')
      .isInt({ min: 15, max: 300 })
      .withMessage('Duration must be between 15 and 300 minutes'),
    body('venue')
      .optional()
      .isString()
      .withMessage('Venue must be a string')
      .isLength({ max: 100 })
      .withMessage('Venue must not exceed 100 characters')
  ],

  updateExam: [
    param('id')
      .isUUID()
      .withMessage('Invalid exam ID'),
    body('name')
      .optional()
      .isString()
      .withMessage('Exam name must be a string')
      .isLength({ max: 100 })
      .withMessage('Exam name must not exceed 100 characters'),
    body('type')
      .optional()
      .isIn(['mid_term', 'final', 'quiz', 'practical', 'viva', 'comprehensive'])
      .withMessage('Invalid exam type'),
    body('maxMarks')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Maximum marks must be at least 1'),
    body('passingMarks')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Passing marks must be a positive integer'),
    body('date')
      .optional()
      .isISO8601()
      .withMessage('Invalid date format'),
    body('duration')
      .optional()
      .isInt({ min: 15, max: 300 })
      .withMessage('Duration must be between 15 and 300 minutes'),
    body('venue')
      .optional()
      .isString()
      .withMessage('Venue must be a string')
      .isLength({ max: 100 })
      .withMessage('Venue must not exceed 100 characters'),
    body('isPublished')
      .optional()
      .isBoolean()
      .withMessage('isPublished must be a boolean')
  ],

  scheduleExam: [
    param('id')
      .isUUID()
      .withMessage('Invalid exam ID'),
    body('date')
      .notEmpty()
      .withMessage('Exam date is required')
      .isISO8601()
      .withMessage('Invalid date format')
      .custom((value) => {
        return new Date(value) > new Date();
      })
      .withMessage('Exam date must be in the future'),
    body('duration')
      .notEmpty()
      .withMessage('Duration is required')
      .isInt({ min: 15, max: 300 })
      .withMessage('Duration must be between 15 and 300 minutes'),
    body('venue')
      .optional()
      .isString()
      .withMessage('Venue must be a string')
      .isLength({ max: 100 })
      .withMessage('Venue must not exceed 100 characters')
  ],

  uploadResults: [
    param('id')
      .isUUID()
      .withMessage('Invalid exam ID'),
    body('results')
      .isArray()
      .withMessage('Results must be an array')
      .custom((results) => {
        return results.every(r => r.studentId && r.marksObtained !== undefined);
      })
      .withMessage('Each result must have studentId and marksObtained')
  ],

  getExamById: [
    param('id')
      .isUUID()
      .withMessage('Invalid exam ID')
  ],

  deleteExam: [
    param('id')
      .isUUID()
      .withMessage('Invalid exam ID')
  ]
};

module.exports = examValidation;