// backend/src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validate } = require('../middleware/validation');
const { validateUserCreate, validateEmail } = require('../utils/validators');
// const { authLimiter } = require('../middleware/rateLimiter'); // Comment this out

// Public routes - Remove authLimiter
router.post('/register', validate(validateUserCreate()), authController.register);
router.post('/login', authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/forgot-password', validate([validateEmail()]), authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/verify-email', authController.verifyEmail);

// Protected routes (require authentication)
router.post('/logout', authController.logout);
router.post('/change-password', authController.changePassword);

module.exports = router;