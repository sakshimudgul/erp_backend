const { body, param } = require('express-validator');

const feeValidation = {
  createFee: [
    body('studentId')
      .isUUID()
      .withMessage('Invalid student ID'),
    body('feeType')
      .notEmpty()
      .withMessage('Fee type is required')
      .isIn(['tuition', 'hostel', 'library', 'transport', 'sports', 'laboratory', 'other'])
      .withMessage('Invalid fee type'),
    body('amount')
      .notEmpty()
      .withMessage('Amount is required')
      .isDecimal()
      .withMessage('Amount must be a decimal number')
      .custom((value) => parseFloat(value) > 0)
      .withMessage('Amount must be greater than 0'),
    body('dueDate')
      .notEmpty()
      .withMessage('Due date is required')
      .isISO8601()
      .withMessage('Invalid date format')
      .custom((value) => {
        return new Date(value) > new Date();
      })
      .withMessage('Due date must be in the future'),
    body('semester')
      .notEmpty()
      .withMessage('Semester is required')
      .isInt({ min: 1, max: 8 })
      .withMessage('Semester must be between 1 and 8'),
    body('academicYear')
      .notEmpty()
      .withMessage('Academic year is required')
      .matches(/^\d{4}-\d{4}$/)
      .withMessage('Academic year must be in format YYYY-YYYY'),
    body('description')
      .optional()
      .isString()
      .withMessage('Description must be a string')
  ],

  updateFee: [
    param('id')
      .isUUID()
      .withMessage('Invalid fee ID'),
    body('feeType')
      .optional()
      .isIn(['tuition', 'hostel', 'library', 'transport', 'sports', 'laboratory', 'other'])
      .withMessage('Invalid fee type'),
    body('amount')
      .optional()
      .isDecimal()
      .withMessage('Amount must be a decimal number')
      .custom((value) => parseFloat(value) > 0)
      .withMessage('Amount must be greater than 0'),
    body('dueDate')
      .optional()
      .isISO8601()
      .withMessage('Invalid date format'),
    body('status')
      .optional()
      .isIn(['pending', 'paid', 'overdue', 'partial', 'waived'])
      .withMessage('Invalid status'),
    body('description')
      .optional()
      .isString()
      .withMessage('Description must be a string')
  ],

  payFee: [
    param('id')
      .isUUID()
      .withMessage('Invalid fee ID'),
    body('amount')
      .optional()
      .isDecimal()
      .withMessage('Amount must be a decimal number')
      .custom((value) => parseFloat(value) > 0)
      .withMessage('Amount must be greater than 0'),
    body('paymentMethod')
      .notEmpty()
      .withMessage('Payment method is required')
      .isIn(['cash', 'card', 'upi', 'bank_transfer', 'online', 'other'])
      .withMessage('Invalid payment method'),
    body('paymentDetails')
      .optional()
      .isObject()
      .withMessage('Payment details must be an object')
  ],

  getFeeById: [
    param('id')
      .isUUID()
      .withMessage('Invalid fee ID')
  ],

  deleteFee: [
    param('id')
      .isUUID()
      .withMessage('Invalid fee ID')
  ],

  updateFeeStructure: [
    body('feeStructure')
      .isObject()
      .withMessage('Fee structure must be an object')
      .custom((structure) => {
        const validTypes = ['tuition', 'hostel', 'library', 'transport', 'sports', 'laboratory', 'other'];
        const keys = Object.keys(structure);
        return keys.every(key => validTypes.includes(key) && typeof structure[key] === 'number' && structure[key] >= 0);
      })
      .withMessage('Invalid fee structure format')
  ],

  getCollectionReport: [
    body('startDate')
      .optional()
      .isISO8601()
      .withMessage('Invalid start date'),
    body('endDate')
      .optional()
      .isISO8601()
      .withMessage('Invalid end date')
      .custom((value, { req }) => {
        if (req.body.startDate && new Date(value) < new Date(req.body.startDate)) {
          throw new Error('End date must be after start date');
        }
        return true;
      })
  ]
};

module.exports = feeValidation;