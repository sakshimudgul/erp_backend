class ApiResponse {
  constructor(success, message, data = null, statusCode = 200) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.statusCode = statusCode;
    this.timestamp = new Date().toISOString();
  }

  toJSON() {
    return {
      success: this.success,
      message: this.message,
      data: this.data,
      timestamp: this.timestamp
    };
  }

  static success(message = 'Success', data = null, statusCode = 200) {
    return new ApiResponse(true, message, data, statusCode);
  }

  static error(message = 'Error', data = null, statusCode = 400) {
    return new ApiResponse(false, message, data, statusCode);
  }

  static created(message = 'Resource created successfully', data = null) {
    return new ApiResponse(true, message, data, 201);
  }

  static notFound(message = 'Resource not found', data = null) {
    return new ApiResponse(false, message, data, 404);
  }

  static unauthorized(message = 'Unauthorized access', data = null) {
    return new ApiResponse(false, message, data, 401);
  }

  static forbidden(message = 'Access forbidden', data = null) {
    return new ApiResponse(false, message, data, 403);
  }

  static validationError(message = 'Validation error', data = null) {
    return new ApiResponse(false, message, data, 400);
  }

  static serverError(message = 'Internal server error', data = null) {
    return new ApiResponse(false, message, data, 500);
  }
}

module.exports = { ApiResponse };