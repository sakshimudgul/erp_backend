const { body, param } = require('express-validator');

const hostelValidation = {
  createHostel: [
    body('name')
      .notEmpty()
      .withMessage('Hostel name is required')
      .isString()
      .withMessage('Hostel name must be a string')
      .isLength({ max: 100 })
      .withMessage('Hostel name must not exceed 100 characters'),
    body('code')
      .notEmpty()
      .withMessage('Hostel code is required')
      .isString()
      .withMessage('Hostel code must be a string')
      .isLength({ max: 20 })
      .withMessage('Hostel code must not exceed 20 characters'),
    body('type')
      .notEmpty()
      .withMessage('Hostel type is required')
      .isIn(['boys', 'girls', 'mixed'])
      .withMessage('Invalid hostel type'),
    body('address')
      .optional()
      .isString()
      .withMessage('Address must be a string'),
    body('contactNumber')
      .optional()
      .matches(/^[0-9]{10}$/)
      .withMessage('Contact number must be 10 digits'),
    body('wardenId')
      .optional()
      .isUUID()
      .withMessage('Invalid warden ID'),
    body('totalRooms')
      .notEmpty()
      .withMessage('Total rooms is required')
      .isInt({ min: 1 })
      .withMessage('Total rooms must be at least 1'),
    body('availableRooms')
      .notEmpty()
      .withMessage('Available rooms is required')
      .isInt({ min: 0 })
      .withMessage('Available rooms must be 0 or more'),
    body('fees')
      .optional()
      .isDecimal()
      .withMessage('Fees must be a decimal number')
  ],

  updateHostel: [
    param('id')
      .isUUID()
      .withMessage('Invalid hostel ID'),
    body('name')
      .optional()
      .isString()
      .withMessage('Hostel name must be a string')
      .isLength({ max: 100 })
      .withMessage('Hostel name must not exceed 100 characters'),
    body('type')
      .optional()
      .isIn(['boys', 'girls', 'mixed'])
      .withMessage('Invalid hostel type'),
    body('address')
      .optional()
      .isString()
      .withMessage('Address must be a string'),
    body('contactNumber')
      .optional()
      .matches(/^[0-9]{10}$/)
      .withMessage('Contact number must be 10 digits'),
    body('wardenId')
      .optional()
      .isUUID()
      .withMessage('Invalid warden ID'),
    body('totalRooms')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Total rooms must be at least 1'),
    body('availableRooms')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Available rooms must be 0 or more'),
    body('fees')
      .optional()
      .isDecimal()
      .withMessage('Fees must be a decimal number'),
    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be a boolean')
  ],

  createRoom: [
    body('hostelId')
      .isUUID()
      .withMessage('Invalid hostel ID'),
    body('roomNumber')
      .notEmpty()
      .withMessage('Room number is required')
      .isString()
      .withMessage('Room number must be a string')
      .isLength({ max: 20 })
      .withMessage('Room number must not exceed 20 characters'),
    body('floor')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Floor must be a positive integer'),
    body('capacity')
      .notEmpty()
      .withMessage('Capacity is required')
      .isInt({ min: 1 })
      .withMessage('Capacity must be at least 1'),
    body('type')
      .optional()
      .isIn(['single', 'double', 'triple', 'dormitory'])
      .withMessage('Invalid room type'),
    body('amenities')
      .optional()
      .isArray()
      .withMessage('Amenities must be an array')
  ],

  updateRoom: [
    param('id')
      .isUUID()
      .withMessage('Invalid room ID'),
    body('roomNumber')
      .optional()
      .isString()
      .withMessage('Room number must be a string')
      .isLength({ max: 20 })
      .withMessage('Room number must not exceed 20 characters'),
    body('floor')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Floor must be a positive integer'),
    body('capacity')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Capacity must be at least 1'),
    body('type')
      .optional()
      .isIn(['single', 'double', 'triple', 'dormitory'])
      .withMessage('Invalid room type'),
    body('occupied')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Occupied count must be 0 or more'),
    body('isAvailable')
      .optional()
      .isBoolean()
      .withMessage('isAvailable must be a boolean')
  ],

  applyHostel: [
    body('hostelId')
      .isUUID()
      .withMessage('Invalid hostel ID'),
    body('roomId')
      .optional()
      .isUUID()
      .withMessage('Invalid room ID'),
    body('preferredRoomType')
      .optional()
      .isIn(['single', 'double', 'triple', 'dormitory'])
      .withMessage('Invalid room type'),
    body('specialRequirements')
      .optional()
      .isString()
      .withMessage('Special requirements must be a string')
  ],

  updateApplication: [
    body('hostelId')
      .optional()
      .isUUID()
      .withMessage('Invalid hostel ID'),
    body('roomId')
      .optional()
      .isUUID()
      .withMessage('Invalid room ID'),
    body('preferredRoomType')
      .optional()
      .isIn(['single', 'double', 'triple', 'dormitory'])
      .withMessage('Invalid room type'),
    body('specialRequirements')
      .optional()
      .isString()
      .withMessage('Special requirements must be a string'),
    body('status')
      .optional()
      .isIn(['pending', 'approved', 'rejected', 'allocated'])
      .withMessage('Invalid status')
  ],

  getHostelById: [
    param('id')
      .isUUID()
      .withMessage('Invalid hostel ID')
  ],

  deleteHostel: [
    param('id')
      .isUUID()
      .withMessage('Invalid hostel ID')
  ],

  getRoomById: [
    param('id')
      .isUUID()
      .withMessage('Invalid room ID')
  ],

  deleteRoom: [
    param('id')
      .isUUID()
      .withMessage('Invalid room ID')
  ]
};

module.exports = hostelValidation;