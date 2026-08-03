const { ApiResponse } = require('../utils/apiResponse');

const roleCheck = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json(new ApiResponse(false, 'Authentication required', null, 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json(new ApiResponse(false, 'Access denied. Insufficient permissions.', null, 403));
    }

    next();
  };
};

const isSuperAdmin = roleCheck('super_admin');
const isPrincipal = roleCheck('super_admin', 'principal');
const isHOD = roleCheck('super_admin', 'principal', 'hod');
const isFaculty = roleCheck('super_admin', 'principal', 'hod', 'faculty');
const isStudent = roleCheck('super_admin', 'principal', 'hod', 'faculty', 'student');
const isParent = roleCheck('super_admin', 'principal', 'hod', 'faculty', 'student', 'parent');
const isReceptionist = roleCheck('super_admin', 'principal', 'hod', 'receptionist');

const isOwnProfile = (req, res, next) => {
  const userId = req.params.id || req.params.userId;
  if (req.user.role === 'super_admin' || req.user.id === userId) {
    return next();
  }
  return res.status(403).json(new ApiResponse(false, 'Access denied. You can only access your own profile.', null, 403));
};

module.exports = {
  roleCheck,
  isSuperAdmin,
  isPrincipal,
  isHOD,
  isFaculty,
  isStudent,
  isParent,
  isReceptionist,
  isOwnProfile
};