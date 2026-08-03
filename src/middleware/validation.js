const { validationResult } = require('express-validator');
const { ApiResponse } = require('../utils/apiResponse');

const validate = (validations) => {
  return async (req, res, next) => {
    // Run all validations
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const errorMessages = errors.array().map(error => ({
      field: error.param,
      message: error.msg
    }));

    res.status(400).json(new ApiResponse(false, 'Validation error', errorMessages, 400));
  };
};

module.exports = { validate };