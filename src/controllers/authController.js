const { User } = require('../models');
const { generateToken, generateRefreshToken, verifyToken } = require('../config/jwt');
const { ApiResponse } = require('../utils/apiResponse');
const { sendEmail } = require('../config/email');
const { generateRandomString } = require('../utils/helpers');
const logger = require('../utils/logger');
const bcrypt = require('bcryptjs');

const authController = {
  // Register new user
  register: async (req, res) => {
    try {
      const { email, password, role, firstName, lastName, phone } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json(new ApiResponse(false, 'Email already registered', null, 400));
      }

      // Create user
      const user = await User.create({
        email,
        password,
        role,
        firstName,
        lastName,
        phone
      });

      // Generate tokens
      const token = generateToken({ id: user.id, email: user.email, role: user.role });
      const refreshToken = generateRefreshToken({ id: user.id, email: user.email, role: user.role });

      // Save refresh token
      await user.update({ refreshToken });

      // Send welcome email
      try {
        await sendEmail(
          user.email,
          'Welcome to College Management System',
          `<h1>Welcome ${user.firstName}!</h1>
          <p>Your account has been created successfully.</p>
          <p>Email: ${user.email}</p>
          <p>Role: ${user.role}</p>`
        );
      } catch (emailError) {
        logger.error('Welcome email failed:', emailError);
      }

      res.status(201).json(new ApiResponse(true, 'Registration successful', {
        user,
        token,
        refreshToken
      }, 201));
    } catch (error) {
      logger.error('Registration error:', error);
      res.status(500).json(new ApiResponse(false, 'Registration failed', null, 500));
    }
  },

  // Login user
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json(new ApiResponse(false, 'Invalid credentials', null, 401));
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(403).json(new ApiResponse(false, 'Account is disabled', null, 403));
      }

      // Verify password
      const isValidPassword = await user.comparePassword(password);
      if (!isValidPassword) {
        return res.status(401).json(new ApiResponse(false, 'Invalid credentials', null, 401));
      }

      // Generate tokens
      const token = generateToken({ id: user.id, email: user.email, role: user.role });
      const refreshToken = generateRefreshToken({ id: user.id, email: user.email, role: user.role });

      // Update user
      await user.update({
        refreshToken,
        lastLogin: new Date()
      });

      res.status(200).json(new ApiResponse(true, 'Login successful', {
        user,
        token,
        refreshToken
      }, 200));
    } catch (error) {
      logger.error('Login error:', error);
      res.status(500).json(new ApiResponse(false, 'Login failed', null, 500));
    }
  },

  // Refresh token
  refreshToken: async (req, res) => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(400).json(new ApiResponse(false, 'Refresh token required', null, 400));
      }

      const decoded = verifyToken(refreshToken);
      if (!decoded) {
        return res.status(401).json(new ApiResponse(false, 'Invalid refresh token', null, 401));
      }

      const user = await User.findOne({
        where: { id: decoded.id, refreshToken }
      });

      if (!user) {
        return res.status(401).json(new ApiResponse(false, 'Invalid refresh token', null, 401));
      }

      // Generate new tokens
      const newToken = generateToken({ id: user.id, email: user.email, role: user.role });
      const newRefreshToken = generateRefreshToken({ id: user.id, email: user.email, role: user.role });

      await user.update({ refreshToken: newRefreshToken });

      res.status(200).json(new ApiResponse(true, 'Token refreshed', {
        token: newToken,
        refreshToken: newRefreshToken
      }, 200));
    } catch (error) {
      logger.error('Refresh token error:', error);
      res.status(500).json(new ApiResponse(false, 'Token refresh failed', null, 500));
    }
  },

  // Logout
  logout: async (req, res) => {
    try {
      const userId = req.userId;
      await User.update({ refreshToken: null }, { where: { id: userId } });
      
      res.status(200).json(new ApiResponse(true, 'Logout successful', null, 200));
    } catch (error) {
      logger.error('Logout error:', error);
      res.status(500).json(new ApiResponse(false, 'Logout failed', null, 500));
    }
  },

  // Forgot password
  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;
      
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(404).json(new ApiResponse(false, 'User not found', null, 404));
      }

      // Generate reset token
      const resetToken = generateRandomString(40);
      const resetExpires = new Date(Date.now() + 3600000); // 1 hour

      await user.update({
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpires
      });

      // Send reset email
      const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
      await sendEmail(
        user.email,
        'Password Reset Request',
        `<h1>Password Reset</h1>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>This link will expire in 1 hour.</p>`
      );

      res.status(200).json(new ApiResponse(true, 'Password reset email sent', null, 200));
    } catch (error) {
      logger.error('Forgot password error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to process request', null, 500));
    }
  },

  // Reset password
  resetPassword: async (req, res) => {
    try {
      const { token, newPassword } = req.body;

      const user = await User.findOne({
        where: {
          passwordResetToken: token,
          passwordResetExpires: { [Op.gt]: new Date() }
        }
      });

      if (!user) {
        return res.status(400).json(new ApiResponse(false, 'Invalid or expired reset token', null, 400));
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await user.update({
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null
      });

      res.status(200).json(new ApiResponse(true, 'Password reset successful', null, 200));
    } catch (error) {
      logger.error('Reset password error:', error);
      res.status(500).json(new ApiResponse(false, 'Password reset failed', null, 500));
    }
  },

  // Verify email
  verifyEmail: async (req, res) => {
    try {
      const { token } = req.body;

      // Implement email verification logic
      // This would typically involve checking a verification token

      res.status(200).json(new ApiResponse(true, 'Email verified successfully', null, 200));
    } catch (error) {
      logger.error('Email verification error:', error);
      res.status(500).json(new ApiResponse(false, 'Email verification failed', null, 500));
    }
  },

  // Change password
  changePassword: async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.userId;

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json(new ApiResponse(false, 'User not found', null, 404));
      }

      // Verify current password
      const isValidPassword = await user.comparePassword(currentPassword);
      if (!isValidPassword) {
        return res.status(401).json(new ApiResponse(false, 'Current password is incorrect', null, 401));
      }

      // Update password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await user.update({ password: hashedPassword });

      res.status(200).json(new ApiResponse(true, 'Password changed successfully', null, 200));
    } catch (error) {
      logger.error('Change password error:', error);
      res.status(500).json(new ApiResponse(false, 'Password change failed', null, 500));
    }
  }
};

module.exports = authController;