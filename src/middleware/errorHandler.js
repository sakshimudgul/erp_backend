const logger = require('../utils/logger');
const { ApiResponse } = require('../utils/apiResponse');

const errorHandler = (err, req, res, next) => {
  // Log error
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip
  });

  // Handle Sequelize errors
  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors.map(e => ({
      field: e.path,
      message: e.message
    }));
    return res.status(400).json(new ApiResponse(false, 'Validation error', errors, 400));
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    const errors = err.errors.map(e => ({
      field: e.path,
      message: `${e.path} already exists`
    }));
    return res.status(409).json(new ApiResponse(false, 'Duplicate entry', errors, 409));
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(409).json(new ApiResponse(false, 'Referenced record does not exist', null, 409));
  }

  // Handle Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json(new ApiResponse(false, 'File too large. Maximum size is 10MB.', null, 413));
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(413).json(new ApiResponse(false, 'Too many files uploaded.', null, 413));
  }

  if (err.message && err.message.includes('Invalid file type')) {
    return res.status(415).json(new ApiResponse(false, err.message, null, 415));
  }

  // Default error
  const statusCode = err.status || 500;
  const message = err.message || 'Internal server error';
  
  res.status(statusCode).json(new ApiResponse(false, message, null, statusCode));
};

module.exports = { errorHandler };