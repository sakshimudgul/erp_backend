const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const { isSuperAdmin, isOwnProfile } = require('../middleware/roleCheck');
const { validate } = require('../middleware/validation');
const { validateUserUpdate } = require('../utils/validators');
const { uploadProfileImage } = require('../middleware/upload');

// All routes require authentication
router.use(auth);

// Profile routes
router.get('/profile', userController.getProfile);
router.put('/profile', validate(validateUserUpdate()), userController.updateProfile);
router.post('/profile/image', uploadProfileImage, userController.uploadProfileImage);

// User management routes (admin only)
router.get('/', isSuperAdmin, userController.getAllUsers);
router.get('/:id', isSuperAdmin, userController.getUserById);
router.put('/:id', isSuperAdmin, validate(validateUserUpdate()), userController.updateUser);
router.delete('/:id', isSuperAdmin, userController.deleteUser);
router.post('/:id/activate', isSuperAdmin, userController.activateUser);
router.post('/:id/deactivate', isSuperAdmin, userController.deactivateUser);

module.exports = router;