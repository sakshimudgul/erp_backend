const { verifyToken } = require('../config/jwt');
const { User } = require('../models');
const { ApiResponse } = require('../utils/apiResponse');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json(new ApiResponse(false, 'Authentication required', null, 401));
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json(new ApiResponse(false, 'Invalid or expired token', null, 401));
    }

    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password', 'refreshToken', 'passwordResetToken', 'passwordResetExpires'] }
    });

    if (!user) {
      return res.status(401).json(new ApiResponse(false, 'User not found', null, 401));
    }

    if (!user.isActive) {
      return res.status(403).json(new ApiResponse(false, 'Account is disabled', null, 403));
    }

    req.user = user;
    req.userId = user.id;
    req.userRole = user.role;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json(new ApiResponse(false, 'Authentication error', null, 500));
  }
};

module.exports = auth;