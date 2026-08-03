const { User } = require('../models');
const { ApiResponse } = require('../utils/apiResponse');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');
const { parseQueryParams } = require('../utils/helpers');
const logger = require('../utils/logger');
const fs = require('fs');

const userController = {
  // Get user profile
  getProfile: async (req, res) => {
    try {
      const user = await User.findByPk(req.userId, {
        attributes: { exclude: ['password', 'refreshToken', 'passwordResetToken', 'passwordResetExpires'] }
      });

      if (!user) {
        return res.status(404).json(new ApiResponse(false, 'User not found', null, 404));
      }

      res.status(200).json(new ApiResponse(true, 'Profile retrieved', { user }, 200));
    } catch (error) {
      logger.error('Get profile error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get profile', null, 500));
    }
  },

  // Update user profile
  updateProfile: async (req, res) => {
    try {
      const userId = req.userId;
      const updates = req.body;
      const allowedUpdates = ['firstName', 'lastName', 'phone'];

      const filteredUpdates = {};
      Object.keys(updates).forEach(key => {
        if (allowedUpdates.includes(key)) {
          filteredUpdates[key] = updates[key];
        }
      });

      if (Object.keys(filteredUpdates).length === 0) {
        return res.status(400).json(new ApiResponse(false, 'No valid fields to update', null, 400));
      }

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json(new ApiResponse(false, 'User not found', null, 404));
      }

      await user.update(filteredUpdates);

      const updatedUser = await User.findByPk(userId, {
        attributes: { exclude: ['password', 'refreshToken', 'passwordResetToken', 'passwordResetExpires'] }
      });

      res.status(200).json(new ApiResponse(true, 'Profile updated', { user: updatedUser }, 200));
    } catch (error) {
      logger.error('Update profile error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to update profile', null, 500));
    }
  },

  // Upload profile image
  uploadProfileImage: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json(new ApiResponse(false, 'No image file uploaded', null, 400));
      }

      const userId = req.userId;
      const user = await User.findByPk(userId);

      if (!user) {
        return res.status(404).json(new ApiResponse(false, 'User not found', null, 404));
      }

      // Delete old image from Cloudinary if exists
      if (user.profileImage) {
        try {
          const publicId = user.profileImage.split('/').pop().split('.')[0];
          await deleteFromCloudinary(`college/profiles/${publicId}`);
        } catch (error) {
          logger.error('Error deleting old profile image:', error);
        }
      }

      // Upload new image to Cloudinary
      const result = await uploadToCloudinary(req.file.path, {
        folder: 'college/profiles',
        transformation: [
          { width: 400, height: 400, crop: 'limit' },
          { quality: 'auto' }
        ]
      });

      // Delete local file
      fs.unlinkSync(req.file.path);

      await user.update({ profileImage: result.secure_url });

      res.status(200).json(new ApiResponse(true, 'Profile image uploaded', {
        profileImage: result.secure_url
      }, 200));
    } catch (error) {
      logger.error('Upload profile image error:', error);
      // Delete local file if exists
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json(new ApiResponse(false, 'Failed to upload profile image', null, 500));
    }
  },

  // Get all users (Admin only)
  getAllUsers: async (req, res) => {
    try {
      const { page, limit, offset, sort, filters } = parseQueryParams(req.query);

      const where = {};
      if (filters.role) where.role = filters.role;
      if (filters.isActive !== undefined) where.isActive = filters.isActive === 'true';
      if (filters.search) {
        where[Op.or] = [
          { firstName: { [Op.like]: `%${filters.search}%` } },
          { lastName: { [Op.like]: `%${filters.search}%` } },
          { email: { [Op.like]: `%${filters.search}%` } }
        ];
      }

      const { count, rows } = await User.findAndCountAll({
        where,
        attributes: { exclude: ['password', 'refreshToken', 'passwordResetToken', 'passwordResetExpires'] },
        limit,
        offset,
        order: sort ? [[sort, 'ASC']] : [['createdAt', 'DESC']]
      });

      res.status(200).json(new ApiResponse(true, 'Users retrieved', {
        users: rows,
        pagination: {
          total: count,
          page,
          limit,
          pages: Math.ceil(count / limit)
        }
      }, 200));
    } catch (error) {
      logger.error('Get all users error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get users', null, 500));
    }
  },

  // Get user by ID (Admin only)
  getUserById: async (req, res) => {
    try {
      const { id } = req.params;

      const user = await User.findByPk(id, {
        attributes: { exclude: ['password', 'refreshToken', 'passwordResetToken', 'passwordResetExpires'] }
      });

      if (!user) {
        return res.status(404).json(new ApiResponse(false, 'User not found', null, 404));
      }

      res.status(200).json(new ApiResponse(true, 'User retrieved', { user }, 200));
    } catch (error) {
      logger.error('Get user by ID error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get user', null, 500));
    }
  },

  // Update user (Admin only)
  updateUser: async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const allowedUpdates = ['firstName', 'lastName', 'phone', 'role', 'isActive', 'isVerified'];

      const filteredUpdates = {};
      Object.keys(updates).forEach(key => {
        if (allowedUpdates.includes(key)) {
          filteredUpdates[key] = updates[key];
        }
      });

      if (Object.keys(filteredUpdates).length === 0) {
        return res.status(400).json(new ApiResponse(false, 'No valid fields to update', null, 400));
      }

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json(new ApiResponse(false, 'User not found', null, 404));
      }

      await user.update(filteredUpdates);

      const updatedUser = await User.findByPk(id, {
        attributes: { exclude: ['password', 'refreshToken', 'passwordResetToken', 'passwordResetExpires'] }
      });

      res.status(200).json(new ApiResponse(true, 'User updated', { user: updatedUser }, 200));
    } catch (error) {
      logger.error('Update user error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to update user', null, 500));
    }
  },

  // Delete user (Admin only)
  deleteUser: async (req, res) => {
    try {
      const { id } = req.params;

      if (id === req.userId) {
        return res.status(400).json(new ApiResponse(false, 'Cannot delete your own account', null, 400));
      }

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json(new ApiResponse(false, 'User not found', null, 404));
      }

      await user.destroy();

      res.status(200).json(new ApiResponse(true, 'User deleted successfully', null, 200));
    } catch (error) {
      logger.error('Delete user error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to delete user', null, 500));
    }
  },

  // Activate user (Admin only)
  activateUser: async (req, res) => {
    try {
      const { id } = req.params;

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json(new ApiResponse(false, 'User not found', null, 404));
      }

      await user.update({ isActive: true });

      res.status(200).json(new ApiResponse(true, 'User activated successfully', null, 200));
    } catch (error) {
      logger.error('Activate user error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to activate user', null, 500));
    }
  },

  // Deactivate user (Admin only)
  deactivateUser: async (req, res) => {
    try {
      const { id } = req.params;

      if (id === req.userId) {
        return res.status(400).json(new ApiResponse(false, 'Cannot deactivate your own account', null, 400));
      }

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json(new ApiResponse(false, 'User not found', null, 404));
      }

      await user.update({ isActive: false });

      res.status(200).json(new ApiResponse(true, 'User deactivated successfully', null, 200));
    } catch (error) {
      logger.error('Deactivate user error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to deactivate user', null, 500));
    }
  }
};

module.exports = userController;