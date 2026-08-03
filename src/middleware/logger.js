const morgan = require('morgan');
const logger = require('../utils/logger');

// Create a stream for morgan
const stream = {
  write: (message) => {
    logger.info(message.trim());
  }
};

// Morgan middleware
const morganMiddleware = morgan('combined', { stream });

// Custom logger middleware
const logRequest = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
  });
  next();
};

module.exports = {
  morganMiddleware,
  logRequest
};