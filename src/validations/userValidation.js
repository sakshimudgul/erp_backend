const { body, param } = require('express-validator');

const userValidation = {
  updateProfile: [
    body('firstName')
      .optional()
      .isString()
      .withMessage('First name must be a string'),
    body('lastName')
      .optional()
      .isString()
      .withMessage('Last name must be a string'),
    body('phone')
      .optional()
      .matches(/^[0-9]{10}$/)
      .withMessage('Phone number must be 10 digits'),
    body('profileImage')
      .optional()
      .isURL()
      .withMessage('Profile image must be a valid URL')
  ],

  updateUser: [
    param('id')
      .isUUID()
      .withMessage('Invalid user ID'),
    body('firstName')
      .optional()
      .isString()
      .withMessage('First name must be a string'),
    body('lastName')
      .optional()
      .isString()
      .withMessage('Last name must be a string'),
    body('phone')
      .optional()
      .matches(/^[0-9]{10}$/)
      .withMessage('Phone number must be 10 digits'),
    body('role')
      .optional()
      .isIn(['super_admin', 'principal', 'hod', 'faculty', 'student', 'parent', 'receptionist'])
      .withMessage('Invalid role specified'),
    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be a boolean'),
    body('isVerified')
      .optional()
      .isBoolean()
      .withMessage('isVerified must be a boolean')
  ],

  getUsers: [
    body('role')
      .optional()
      .isIn(['super_admin', 'principal', 'hod', 'faculty', 'student', 'parent', 'receptionist'])
      .withMessage('Invalid role specified'),
    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be a boolean'),
    body('search')
      .optional()
      .isString()
      .withMessage('Search must be a string')
  ],

  getUserById: [
    param('id')
      .isUUID()
      .withMessage('Invalid user ID')
  ],

  deleteUser: [
    param('id')
      .isUUID()
      .withMessage('Invalid user ID')
  ],

  uploadProfileImage: [
    body('image')
      .custom((value, { req }) => {
        if (!req.file) {
          throw new Error('Profile image is required');
        }
        return true;
      })
  ]
};

module.exports = userValidation;