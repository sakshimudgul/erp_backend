const { body, param } = require('express-validator');

const attendanceValidation = {
  markAttendance: [
    param('subjectId')
      .isUUID()
      .withMessage('Invalid subject ID'),
    body('studentId')
      .isUUID()
      .withMessage('Invalid student ID'),
    body('date')
      .notEmpty()
      .withMessage('Date is required')
      .isISO8601()
      .withMessage('Invalid date format'),
    body('status')
      .notEmpty()
      .withMessage('Status is required')
      .isIn(['present', 'absent', 'late', 'excused', 'holiday'])
      .withMessage('Invalid status'),
    body('checkInTime')
      .optional()
      .isString()
      .withMessage('Check in time must be a string'),
    body('checkOutTime')
      .optional()
      .isString()
      .withMessage('Check out time must be a string'),
    body('remarks')
      .optional()
      .isString()
      .withMessage('Remarks must be a string')
  ],

  updateAttendance: [
    param('id')
      .isUUID()
      .withMessage('Invalid attendance ID'),
    body('status')
      .optional()
      .isIn(['present', 'absent', 'late', 'excused', 'holiday'])
      .withMessage('Invalid status'),
    body('checkInTime')
      .optional()
      .isString()
      .withMessage('Check in time must be a string'),
    body('checkOutTime')
      .optional()
      .isString()
      .withMessage('Check out time must be a string'),
    body('remarks')
      .optional()
      .isString()
      .withMessage('Remarks must be a string')
  ],

  bulkMarkAttendance: [
    param('subjectId')
      .isUUID()
      .withMessage('Invalid subject ID'),
    body('date')
      .notEmpty()
      .withMessage('Date is required')
      .isISO8601()
      .withMessage('Invalid date format'),
    body('attendanceList')
      .isArray()
      .withMessage('Attendance list must be an array')
      .custom((list) => {
        return list.every(item => item.studentId && item.status);
      })
      .withMessage('Each attendance item must have studentId and status')
  ],

  getAttendanceReport: [
    param('subjectId')
      .isUUID()
      .withMessage('Invalid subject ID'),
    body('startDate')
      .optional()
      .isISO8601()
      .withMessage('Invalid start date'),
    body('endDate')
      .optional()
      .isISO8601()
      .withMessage('Invalid end date')
  ]
};

module.exports = attendanceValidation;