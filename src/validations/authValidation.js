const { body } = require('express-validator');

const authValidation = {
  register: [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
      .matches(/\d/)
      .withMessage('Password must contain at least one number'),
    body('firstName')
      .notEmpty()
      .withMessage('First name is required')
      .isString()
      .withMessage('First name must be a string'),
    body('lastName')
      .notEmpty()
      .withMessage('Last name is required')
      .isString()
      .withMessage('Last name must be a string'),
    body('role')
      .isIn(['super_admin', 'principal', 'hod', 'faculty', 'student', 'parent', 'receptionist'])
      .withMessage('Invalid role specified'),
    body('phone')
      .optional()
      .matches(/^[0-9]{10}$/)
      .withMessage('Phone number must be 10 digits')
  ],

  login: [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ],

  forgotPassword: [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail()
  ],

  resetPassword: [
    body('token')
      .notEmpty()
      .withMessage('Reset token is required'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
      .matches(/\d/)
      .withMessage('Password must contain at least one number')
  ],

  changePassword: [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters long')
      .matches(/\d/)
      .withMessage('New password must contain at least one number')
  ],

  refreshToken: [
    body('refreshToken')
      .notEmpty()
      .withMessage('Refresh token is required')
  ],

  verifyEmail: [
    body('token')
      .notEmpty()
      .withMessage('Verification token is required')
  ]
};

module.exports = authValidation;