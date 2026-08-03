const { body, param } = require('express-validator');

const studentValidation = {
  createStudent: [
    body('userId')
      .isUUID()
      .withMessage('Invalid user ID'),
    body('enrollmentNumber')
      .notEmpty()
      .withMessage('Enrollment number is required')
      .isString()
      .withMessage('Enrollment number must be a string')
      .isLength({ max: 50 })
      .withMessage('Enrollment number must not exceed 50 characters'),
    body('courseId')
      .isUUID()
      .withMessage('Invalid course ID'),
    body('batch')
      .notEmpty()
      .withMessage('Batch is required')
      .isString()
      .withMessage('Batch must be a string')
      .isLength({ max: 10 })
      .withMessage('Batch must not exceed 10 characters'),
    body('semester')
      .notEmpty()
      .withMessage('Semester is required')
      .isInt({ min: 1, max: 8 })
      .withMessage('Semester must be between 1 and 8'),
    body('admissionDate')
      .optional()
      .isISO8601()
      .withMessage('Invalid admission date'),
    body('admissionType')
      .optional()
      .isIn(['regular', 'lateral', 'transfer'])
      .withMessage('Invalid admission type'),
    body('fatherName')
      .optional()
      .isString()
      .withMessage('Father name must be a string')
      .isLength({ max: 100 })
      .withMessage('Father name must not exceed 100 characters'),
    body('motherName')
      .optional()
      .isString()
      .withMessage('Mother name must be a string')
      .isLength({ max: 100 })
      .withMessage('Mother name must not exceed 100 characters'),
    body('address')
      .optional()
      .isString()
      .withMessage('Address must be a string'),
    body('emergencyContact')
      .optional()
      .matches(/^[0-9]{10}$/)
      .withMessage('Emergency contact must be 10 digits'),
    body('bloodGroup')
      .optional()
      .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
      .withMessage('Invalid blood group'),
    body('guardianPhone')
      .optional()
      .matches(/^[0-9]{10}$/)
      .withMessage('Guardian phone must be 10 digits')
  ],

  updateStudent: [
    param('id')
      .isUUID()
      .withMessage('Invalid student ID'),
    body('courseId')
      .optional()
      .isUUID()
      .withMessage('Invalid course ID'),
    body('batch')
      .optional()
      .isString()
      .withMessage('Batch must be a string')
      .isLength({ max: 10 })
      .withMessage('Batch must not exceed 10 characters'),
    body('semester')
      .optional()
      .isInt({ min: 1, max: 8 })
      .withMessage('Semester must be between 1 and 8'),
    body('status')
      .optional()
      .isIn(['active', 'inactive', 'suspended', 'graduated', 'dropped_out'])
      .withMessage('Invalid status'),
    body('fatherName')
      .optional()
      .isString()
      .withMessage('Father name must be a string')
      .isLength({ max: 100 })
      .withMessage('Father name must not exceed 100 characters'),
    body('motherName')
      .optional()
      .isString()
      .withMessage('Mother name must be a string')
      .isLength({ max: 100 })
      .withMessage('Mother name must not exceed 100 characters'),
    body('emergencyContact')
      .optional()
      .matches(/^[0-9]{10}$/)
      .withMessage('Emergency contact must be 10 digits')
  ],

  getStudentById: [
    param('id')
      .isUUID()
      .withMessage('Invalid student ID')
  ],

  deleteStudent: [
    param('id')
      .isUUID()
      .withMessage('Invalid student ID')
  ],

  enrollSubject: [
    body('subjectId')
      .isUUID()
      .withMessage('Invalid subject ID')
  ],

  updateStatus: [
    param('id')
      .isUUID()
      .withMessage('Invalid student ID'),
    body('status')
      .notEmpty()
      .withMessage('Status is required')
      .isIn(['active', 'inactive', 'suspended', 'graduated', 'dropped_out'])
      .withMessage('Invalid status')
  ]
};

module.exports = studentValidation;