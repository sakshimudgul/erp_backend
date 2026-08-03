const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validate } = require('../middleware/validation');
const { validateUserCreate, validateEmail } = require('../utils/validators');
const { authLimiter } = require('../middleware/rateLimiter');

// Public routes
router.post('/register', authLimiter, validate(validateUserCreate()), authController.register);
router.post('/login', authLimiter, authController.login);
router.post('/refresh-token', authLimiter, authController.refreshToken);
router.post('/forgot-password', authLimiter, validate([validateEmail()]), authController.forgotPassword);
router.post('/reset-password', authLimiter, authController.resetPassword);
router.post('/verify-email', authLimiter, authController.verifyEmail);

// Protected routes (require authentication)
router.post('/logout', authController.logout);
router.post('/change-password', authController.changePassword);

module.exports = router;